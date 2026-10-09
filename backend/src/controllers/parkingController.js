import { ParkingToken, Tariff, Vehicle, MonthlyPass, Payment, BusinessSettings } from '../models/index.js';
import { TariffEngine } from '../services/tariffEngine.js';
import { generateTokenNumber, generatePaymentId } from '../utils/tokenGenerator.js';
import { AuditService } from '../services/auditService.js';
import { entryTokenSchema, exitTokenSchema, cancelTokenSchema } from '../validators/index.js';

export async function createEntry(req, res, next) {
  try {
    const validated = entryTokenSchema.parse(req.body);
    const vehicleNumber = validated.vehicleNumber;

    // 1. Check if vehicle already has an open session
    const existingSession = await ParkingToken.findOne({
      vehicleNumber,
      status: 'INSIDE'
    });

    if (existingSession) {
      return res.status(409).json({
        success: false,
        message: `Vehicle ${vehicleNumber} already has an active open session inside parking.`,
        existingToken: {
          tokenNumber: existingSession.tokenNumber,
          entryTime: existingSession.entryTime,
          vehicleType: existingSession.vehicleType
        }
      });
    }

    // 2. Fetch active tariff for category
    const activeTariff = await Tariff.findOne({
      category: validated.vehicleType,
      isActive: true
    }).sort({ effectiveFrom: -1 });

    if (!activeTariff) {
      return res.status(400).json({
        success: false,
        message: `No active tariff found for vehicle category: ${validated.vehicleType}. Please configure a tariff first.`
      });
    }

    // 3. Check for any active monthly pass for this vehicle
    const now = new Date();
    const activePass = await MonthlyPass.findOne({
      vehicleNumber,
      status: 'ACTIVE',
      expiryDate: { $gte: now }
    });

    // 4. Fetch business settings for token prefix
    const settings = await BusinessSettings.findOne() || {
      tokenPrefix: 'SRF',
      locationName: 'Railway Station Parking Plaza',
      stationCode: 'SRF-MAIN'
    };

    const tokenNumber = await generateTokenNumber(settings.tokenPrefix || 'SRF');

    // 5. Create token record with immutable tariff snapshot
    const token = new ParkingToken({
      tokenNumber,
      vehicleNumber,
      vehicleType: validated.vehicleType,
      customerPhone: validated.customerPhone || '',
      notes: validated.notes || '',
      location: req.user.assignedLocation?._id || null,
      locationCode: settings.stationCode || 'SRF-MAIN',
      entryOperator: req.user._id,
      status: 'INSIDE',
      entryTime: now,
      coveredByPass: activePass ? activePass._id : null,
      tariffSnapshot: {
        category: activeTariff.category,
        billingMethod: activeTariff.billingMethod,
        firstSlabAmount: activeTariff.firstSlabAmount,
        additionalDayAmount: activeTariff.additionalDayAmount,
        hourlyAmount: activeTariff.hourlyAmount,
        freeGraceMinutes: activeTariff.freeGraceMinutes,
        tariffId: activeTariff._id
      }
    });

    await token.save();

    // 6. Update vehicle stats
    await Vehicle.findOneAndUpdate(
      { registrationNumber: vehicleNumber },
      {
        $setOnInsert: { type: validated.vehicleType },
        $inc: { totalVisits: 1 },
        $set: { lastVisitedAt: now }
      },
      { upsert: true, new: true }
    );

    // 7. Audit log
    await AuditService.log({
      actor: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'TOKEN_CREATED',
      entityType: 'ParkingToken',
      entityId: token.tokenNumber,
      details: {
        vehicleNumber,
        vehicleType: validated.vehicleType,
        tokenNumber,
        isPassHolder: !!activePass
      },
      req
    });

    return res.status(201).json({
      success: true,
      message: 'Vehicle entry token created successfully',
      token: {
        _id: token._id,
        tokenNumber: token.tokenNumber,
        vehicleNumber: token.vehicleNumber,
        vehicleType: token.vehicleType,
        customerPhone: token.customerPhone,
        entryTime: token.entryTime,
        status: token.status,
        coveredByPass: activePass ? {
          passNumber: activePass.passNumber,
          customerName: activePass.customerName,
          expiryDate: activePass.expiryDate
        } : null,
        entryOperator: {
          name: req.user.name,
          operatorId: req.user.operatorId
        },
        settings: {
          businessName: settings.businessName || 'SR FABRICATION',
          locationName: settings.locationName,
          receiptHeader: settings.receiptHeader,
          receiptFooter: settings.receiptFooter
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function lookupToken(req, res, next) {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Search query (token number or vehicle registration) is required' });
    }

    const cleanQuery = query.trim().toUpperCase().replace(/\s+/g, '');

    const token = await ParkingToken.findOne({
      $or: [
        { tokenNumber: cleanQuery },
        { vehicleNumber: cleanQuery, status: 'INSIDE' }
      ]
    })
    .populate('entryOperator', 'name operatorId')
    .populate('exitOperator', 'name operatorId')
    .populate('coveredByPass');

    if (!token) {
      return res.status(404).json({
        success: false,
        message: `No active or matching token found for "${query}"`
      });
    }

    // Check if vehicle has an active monthly pass
    const now = new Date();
    let activePass = token.coveredByPass;
    if (!activePass) {
      activePass = await MonthlyPass.findOne({
        vehicleNumber: token.vehicleNumber,
        status: 'ACTIVE',
        expiryDate: { $gte: now }
      });
    }

    // Calculate live billing preview if still INSIDE
    let liveCharge = null;
    if (token.status === 'INSIDE') {
      const calculation = TariffEngine.calculateCharge(
        token.tariffSnapshot,
        token.entryTime,
        now
      );

      const isPassHolder = !!activePass;
      liveCharge = {
        ...calculation,
        amountToPay: isPassHolder ? 0 : calculation.amountBilled,
        isCoveredByPass: isPassHolder,
        passDetails: isPassHolder ? {
          passNumber: activePass.passNumber,
          customerName: activePass.customerName,
          expiryDate: activePass.expiryDate
        } : null
      };
    }

    return res.json({
      success: true,
      token,
      liveCharge
    });
  } catch (error) {
    next(error);
  }
}

export async function processExit(req, res, next) {
  try {
    const { id } = req.params;
    const validated = exitTokenSchema.parse(req.body);

    const token = await ParkingToken.findById(id).populate('entryOperator', 'name operatorId');
    if (!token) {
      return res.status(404).json({ success: false, message: 'Token not found' });
    }

    if (token.status === 'EXITED') {
      return res.status(400).json({
        success: false,
        message: `This token has already exited on ${new Date(token.exitTime).toLocaleString()}`
      });
    }

    if (token.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: `This token was cancelled and cannot be exited`
      });
    }

    const exitTime = new Date();
    const calculation = TariffEngine.calculateCharge(
      token.tariffSnapshot,
      token.entryTime,
      exitTime
    );

    // Check if covered by active pass
    const activePass = await MonthlyPass.findOne({
      vehicleNumber: token.vehicleNumber,
      status: 'ACTIVE',
      expiryDate: { $gte: exitTime }
    });

    const isPassHolder = !!activePass;
    let finalAmount = isPassHolder ? 0 : calculation.amountBilled;
    let paymentStatus = 'PAID';
    let paymentMethod = isPassHolder ? 'PASS' : validated.paymentMethod;

    let paymentRecord = null;

    if (finalAmount > 0) {
      const paymentId = generatePaymentId();
      paymentRecord = new Payment({
        paymentId,
        type: 'PARKING_TOKEN',
        parkingToken: token._id,
        amount: finalAmount,
        currency: 'INR',
        method: paymentMethod,
        status: 'COMPLETED',
        transactionReference: validated.paymentReference || '',
        operator: req.user._id,
        location: token.location,
        idempotencyKey: validated.idempotencyKey || paymentId
      });

      await paymentRecord.save();
    } else if (isPassHolder) {
      paymentStatus = 'EXEMPT_PASS';
      paymentMethod = 'PASS';
    }

    // Atomic update of ParkingToken
    token.status = 'EXITED';
    token.exitTime = exitTime;
    token.exitOperator = req.user._id;
    token.durationMinutes = calculation.durationMinutes;
    token.billableUnits = calculation.billableUnits;
    token.amountBilled = calculation.amountBilled;
    token.amountPaid = finalAmount;
    token.paymentStatus = paymentStatus;
    token.paymentMethod = paymentMethod;
    token.paymentReference = validated.paymentReference || '';
    if (activePass) {
      token.coveredByPass = activePass._id;
    }

    await token.save();

    // Update vehicle lifetime spent
    if (finalAmount > 0) {
      await Vehicle.findOneAndUpdate(
        { registrationNumber: token.vehicleNumber },
        { $inc: { totalAmountSpent: finalAmount } }
      );
    }

    const settings = await BusinessSettings.findOne() || {
      businessName: 'SR FABRICATION',
      locationName: 'Railway Station Parking Plaza'
    };

    // Audit log
    await AuditService.log({
      actor: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'EXIT_PROCESSED',
      entityType: 'ParkingToken',
      entityId: token.tokenNumber,
      details: {
        tokenNumber: token.tokenNumber,
        vehicleNumber: token.vehicleNumber,
        amountPaid: finalAmount,
        paymentMethod,
        durationMinutes: calculation.durationMinutes,
        billableUnits: calculation.billableUnits
      },
      req
    });

    return res.json({
      success: true,
      message: 'Vehicle exit processed successfully',
      token,
      payment: paymentRecord,
      receipt: {
        businessName: settings.businessName || 'SR FABRICATION',
        locationName: settings.locationName,
        receiptHeader: settings.receiptHeader,
        receiptFooter: settings.receiptFooter,
        tokenNumber: token.tokenNumber,
        vehicleNumber: token.vehicleNumber,
        vehicleType: token.vehicleType,
        entryTime: token.entryTime,
        exitTime: token.exitTime,
        durationMinutes: token.durationMinutes,
        billableUnits: token.billableUnits,
        amountBilled: token.amountBilled,
        amountPaid: token.amountPaid,
        paymentMethod: token.paymentMethod,
        paymentReference: token.paymentReference,
        operator: req.user.name,
        operatorId: req.user.operatorId
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function cancelToken(req, res, next) {
  try {
    const { id } = req.params;
    const validated = cancelTokenSchema.parse(req.body);

    const token = await ParkingToken.findById(id);
    if (!token) {
      return res.status(404).json({ success: false, message: 'Token not found' });
    }

    if (token.status === 'EXITED') {
      return res.status(400).json({ success: false, message: 'Cannot cancel an already exited token' });
    }

    if (token.status === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Token is already cancelled' });
    }

    token.status = 'CANCELLED';
    token.cancellationReason = validated.reason;
    token.cancelledBy = req.user._id;
    token.cancelledAt = new Date();
    token.paymentStatus = 'CANCELLED';

    await token.save();

    await AuditService.log({
      actor: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'TOKEN_CANCELLED',
      entityType: 'ParkingToken',
      entityId: token.tokenNumber,
      details: { reason: validated.reason },
      req
    });

    return res.json({
      success: true,
      message: 'Token cancelled successfully',
      token
    });
  } catch (error) {
    next(error);
  }
}

export async function getTokens(req, res, next) {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      status,
      vehicleType,
      paymentMethod,
      startDate,
      endDate
    } = req.query;

    const filter = {};

    if (search) {
      const cleanSearch = search.trim().toUpperCase();
      filter.$or = [
        { tokenNumber: { $regex: cleanSearch, $options: 'i' } },
        { vehicleNumber: { $regex: cleanSearch, $options: 'i' } }
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (vehicleType) {
      filter.vehicleType = vehicleType;
    }

    if (paymentMethod) {
      filter.paymentMethod = paymentMethod;
    }

    if (startDate || endDate) {
      filter.entryTime = {};
      if (startDate) {
        filter.entryTime.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.entryTime.$lte = end;
      }
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const [tokens, total] = await Promise.all([
      ParkingToken.find(filter)
        .sort({ entryTime: -1 })
        .skip(skip)
        .limit(take)
        .populate('entryOperator', 'name operatorId')
        .populate('exitOperator', 'name operatorId')
        .lean(),
      ParkingToken.countDocuments(filter)
    ]);

    return res.json({
      success: true,
      tokens,
      pagination: {
        page: parseInt(page, 10),
        limit: take,
        total,
        pages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getTokenById(req, res, next) {
  try {
    const token = await ParkingToken.findById(req.params.id)
      .populate('entryOperator', 'name operatorId')
      .populate('exitOperator', 'name operatorId')
      .populate('coveredByPass');

    if (!token) {
      return res.status(404).json({ success: false, message: 'Token not found' });
    }

    return res.json({ success: true, token });
  } catch (error) {
    next(error);
  }
}
