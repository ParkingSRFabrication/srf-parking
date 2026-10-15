import { User, Vehicle, ParkingToken, MonthlyPass, Payment, BusinessSettings } from '../models/index.js';
import { customerVehicleSchema } from '../validators/index.js';
import { AuditService } from '../services/auditService.js';

/**
 * Get Customer Dashboard summary
 */
export async function getCustomerDashboard(req, res, next) {
  try {
    const user = await User.findById(req.user._id).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const vehicleNumbers = (user.vehicles || []).map(v => v.registrationNumber.toUpperCase());
    const userPhone = user.phone || '';

    // Match criteria for customer's records
    const vehicleOrPhoneQuery = [];
    if (vehicleNumbers.length > 0) {
      vehicleOrPhoneQuery.push({ vehicleNumber: { $in: vehicleNumbers } });
    }
    if (userPhone) {
      vehicleOrPhoneQuery.push({ customerPhone: userPhone });
    }

    const query = vehicleOrPhoneQuery.length > 0 ? { $or: vehicleOrPhoneQuery } : { _id: null };

    const now = new Date();

    const [activeTokens, activePasses, recentTokens, allCompletedTokens, allPaidPasses] = await Promise.all([
      // Currently parked vehicles
      query._id === null ? [] : ParkingToken.find({ ...query, status: 'INSIDE' }).sort({ entryTime: -1 }).lean(),
      // Active passes
      query._id === null ? [] : MonthlyPass.find({ ...query, status: 'ACTIVE', expiryDate: { $gte: now } }).sort({ expiryDate: 1 }).lean(),
      // Recent parking sessions (latest 10)
      query._id === null ? [] : ParkingToken.find(query).sort({ entryTime: -1 }).limit(10).lean(),
      // All completed tokens for spending calculation
      query._id === null ? [] : ParkingToken.find({ ...query, status: 'EXITED' }).select('amountPaid durationMinutes').lean(),
      // All passes for spending calculation
      query._id === null ? [] : MonthlyPass.find(query).select('amount').lean()
    ]);

    const totalParkingSpent = allCompletedTokens.reduce((sum, t) => sum + (t.amountPaid || 0), 0);
    const totalPassSpent = allPaidPasses.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalLifetimeSpent = totalParkingSpent + totalPassSpent;

    return res.json({
      success: true,
      profile: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        operatorId: user.operatorId,
        role: user.role
      },
      vehicles: user.vehicles || [],
      activeTokens,
      activePasses,
      recentHistory: recentTokens,
      stats: {
        totalVehicles: (user.vehicles || []).length,
        vehiclesParkedNow: activeTokens.length,
        activePassesCount: activePasses.length,
        totalVisits: allCompletedTokens.length,
        totalSpent: totalLifetimeSpent
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get customer's registered vehicles
 */
export async function getCustomerVehicles(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select('vehicles name phone');
    return res.json({
      success: true,
      vehicles: user?.vehicles || []
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Register a new vehicle for customer
 */
export async function addCustomerVehicle(req, res, next) {
  try {
    const validated = customerVehicleSchema.parse(req.body);
    const user = await User.findById(req.user._id);

    const cleanReg = validated.registrationNumber.toUpperCase();
    const alreadyExists = (user.vehicles || []).some(v => v.registrationNumber === cleanReg);

    if (alreadyExists) {
      return res.status(409).json({
        success: false,
        message: `Vehicle ${cleanReg} is already registered under your account.`
      });
    }

    const newVehicleObj = {
      registrationNumber: cleanReg,
      vehicleType: validated.vehicleType,
      nickname: validated.nickname || '',
      addedAt: new Date()
    };

    user.vehicles = user.vehicles || [];
    user.vehicles.push(newVehicleObj);
    await user.save();

    // Upsert into master Vehicle directory
    await Vehicle.findOneAndUpdate(
      { registrationNumber: cleanReg },
      {
        registrationNumber: cleanReg,
        type: validated.vehicleType,
        ownerName: user.name,
        ownerPhone: user.phone || ''
      },
      { upsert: true, new: true }
    );

    await AuditService.log({
      actor: user._id,
      actorName: user.name,
      actorRole: user.role,
      action: 'CUSTOMER_VEHICLE_ADDED',
      entityType: 'Vehicle',
      entityId: cleanReg,
      req
    });

    return res.status(201).json({
      success: true,
      message: `Vehicle ${cleanReg} registered successfully`,
      vehicle: newVehicleObj,
      vehicles: user.vehicles
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Remove a registered vehicle from customer account
 */
export async function removeCustomerVehicle(req, res, next) {
  try {
    const { registrationNumber } = req.params;
    const cleanReg = registrationNumber.trim().toUpperCase();

    const user = await User.findById(req.user._id);
    user.vehicles = (user.vehicles || []).filter(v => v.registrationNumber !== cleanReg);
    await user.save();

    await AuditService.log({
      actor: user._id,
      actorName: user.name,
      actorRole: user.role,
      action: 'CUSTOMER_VEHICLE_REMOVED',
      entityType: 'Vehicle',
      entityId: cleanReg,
      req
    });

    return res.json({
      success: true,
      message: `Vehicle ${cleanReg} removed from your account.`,
      vehicles: user.vehicles
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get parking sessions history for customer's vehicles
 */
export async function getCustomerHistory(req, res, next) {
  try {
    const user = await User.findById(req.user._id).lean();
    const vehicleNumbers = (user.vehicles || []).map(v => v.registrationNumber.toUpperCase());
    const userPhone = user.phone || '';

    const queryFilters = [];
    if (vehicleNumbers.length > 0) {
      queryFilters.push({ vehicleNumber: { $in: vehicleNumbers } });
    }
    if (userPhone) {
      queryFilters.push({ customerPhone: userPhone });
    }

    if (queryFilters.length === 0) {
      return res.json({
        success: true,
        tokens: [],
        total: 0
      });
    }

    const tokens = await ParkingToken.find({ $or: queryFilters })
      .sort({ entryTime: -1 })
      .populate('entryOperator', 'name operatorId')
      .populate('exitOperator', 'name operatorId')
      .lean();

    return res.json({
      success: true,
      tokens,
      total: tokens.length
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get monthly passes for customer's vehicles
 */
export async function getCustomerPasses(req, res, next) {
  try {
    const user = await User.findById(req.user._id).lean();
    const vehicleNumbers = (user.vehicles || []).map(v => v.registrationNumber.toUpperCase());
    const userPhone = user.phone || '';

    const queryFilters = [];
    if (vehicleNumbers.length > 0) {
      queryFilters.push({ vehicleNumber: { $in: vehicleNumbers } });
    }
    if (userPhone) {
      queryFilters.push({ customerPhone: userPhone });
    }

    if (queryFilters.length === 0) {
      return res.json({
        success: true,
        passes: [],
        total: 0
      });
    }

    const passes = await MonthlyPass.find({ $or: queryFilters })
      .sort({ startDate: -1 })
      .populate('issuedBy', 'name operatorId')
      .lean();

    return res.json({
      success: true,
      passes,
      total: passes.length
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get verified receipt for a specific parking session
 * Enforces ownership: only returns if token belongs to customer's vehicle or phone
 */
export async function getCustomerReceipt(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id).lean();

    const token = await ParkingToken.findById(id)
      .populate('entryOperator', 'name operatorId')
      .populate('exitOperator', 'name operatorId')
      .lean();

    if (!token) {
      return res.status(404).json({ success: false, message: 'Parking record not found' });
    }

    // Role check: Admin can view any receipt, otherwise must belong to customer
    if (user.role !== 'admin') {
      const userVehicles = (user.vehicles || []).map(v => v.registrationNumber.toUpperCase());
      const isOwnerVehicle = userVehicles.includes(token.vehicleNumber.toUpperCase());
      const isOwnerPhone = user.phone && token.customerPhone && user.phone === token.customerPhone;

      if (!isOwnerVehicle && !isOwnerPhone) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You do not have permission to view receipts for this vehicle.'
        });
      }
    }

    const settings = await BusinessSettings.findOne().lean() || {};

    return res.json({
      success: true,
      receipt: {
        token,
        settings: {
          businessName: settings.businessName || 'SR FABRICATION',
          tagline: settings.tagline || 'Railway Station Parking Plaza',
          stationCode: settings.stationCode || 'SRF-MAIN',
          locationName: settings.locationName || 'Central Railway Station',
          receiptHeader: settings.receiptHeader || 'SR FABRICATION RAILWAY PARKING',
          receiptFooter: settings.receiptFooter || 'Thank you for parking with us.',
          contactPhone: settings.contactPhone || '',
          contactAddress: settings.contactAddress || ''
        }
      }
    });
  } catch (error) {
    next(error);
  }
}
