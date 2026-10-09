import { MonthlyPass, Payment, BusinessSettings, Vehicle } from '../models/index.js';
import { generatePassNumber, generatePaymentId } from '../utils/tokenGenerator.js';
import { AuditService } from '../services/auditService.js';
import { createPassSchema, renewPassSchema } from '../validators/index.js';

/**
 * Calculate calendar month expiry date safely.
 * Returns end of day (23:59:59.999) of the target day.
 */
export function calculateExpiryDate(startDate, months) {
  const start = new Date(startDate);
  const target = new Date(start);
  
  // Advance months
  target.setMonth(target.getMonth() + months);
  // Subtract 1 day for inclusive validity (e.g. Oct 9 -> Nov 8 end-of-day)
  target.setDate(target.getDate() - 1);
  target.setHours(23, 59, 59, 999);

  return target;
}

export async function createPass(req, res, next) {
  try {
    const validated = createPassSchema.parse(req.body);
    const vehicleNumber = validated.vehicleNumber;
    const now = new Date();

    // Check for existing active pass for the same vehicle
    const existingPass = await MonthlyPass.findOne({
      vehicleNumber,
      status: 'ACTIVE',
      expiryDate: { $gte: now }
    });

    if (existingPass) {
      return res.status(409).json({
        success: false,
        message: `An active monthly pass (${existingPass.passNumber}) already exists for vehicle ${vehicleNumber}. Expiry: ${existingPass.expiryDate.toLocaleDateString()}`,
        existingPass
      });
    }

    const settings = await BusinessSettings.findOne() || { passPrefix: 'SRF-PASS' };
    const passNumber = await generatePassNumber(settings.passPrefix || 'SRF-PASS');
    const expiryDate = calculateExpiryDate(validated.startDate, validated.durationMonths);

    const pass = new MonthlyPass({
      passNumber,
      vehicleNumber,
      vehicleType: validated.vehicleType,
      customerName: validated.customerName,
      customerPhone: validated.customerPhone || '',
      durationMonths: validated.durationMonths,
      startDate: new Date(validated.startDate),
      expiryDate,
      amount: validated.amount,
      paymentStatus: 'PAID',
      paymentMethod: validated.paymentMethod,
      paymentReference: validated.paymentReference || '',
      status: 'ACTIVE',
      location: req.user.assignedLocation?._id || null,
      issuedBy: req.user._id,
      notes: validated.notes || ''
    });

    await pass.save();

    // Record separate Payment record
    const paymentId = generatePaymentId();
    const payment = new Payment({
      paymentId,
      type: 'MONTHLY_PASS',
      monthlyPass: pass._id,
      amount: validated.amount,
      currency: 'INR',
      method: validated.paymentMethod,
      status: 'COMPLETED',
      transactionReference: validated.paymentReference || '',
      operator: req.user._id,
      location: req.user.assignedLocation?._id || null,
      idempotencyKey: paymentId
    });

    await payment.save();

    // Update vehicle owner info if provided
    await Vehicle.findOneAndUpdate(
      { registrationNumber: vehicleNumber },
      {
        $set: {
          ownerName: validated.customerName,
          ownerPhone: validated.customerPhone
        },
        $inc: { totalAmountSpent: validated.amount }
      },
      { upsert: true }
    );

    // Audit log
    await AuditService.log({
      actor: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'PASS_CREATED',
      entityType: 'MonthlyPass',
      entityId: pass.passNumber,
      details: {
        passNumber: pass.passNumber,
        vehicleNumber,
        durationMonths: validated.durationMonths,
        amount: validated.amount,
        expiryDate
      },
      req
    });

    return res.status(201).json({
      success: true,
      message: 'Monthly pass created successfully',
      pass,
      payment
    });
  } catch (error) {
    next(error);
  }
}

export async function renewPass(req, res, next) {
  try {
    const { id } = req.params;
    const validated = renewPassSchema.parse(req.body);

    const pass = await MonthlyPass.findById(id);
    if (!pass) {
      return res.status(404).json({ success: false, message: 'Monthly pass not found' });
    }

    if (pass.status === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Cancelled passes cannot be renewed' });
    }

    const now = new Date();
    // If current pass is still active, extend from current expiry date; otherwise extend from today
    const baseDate = pass.expiryDate > now ? pass.expiryDate : now;
    const newExpiryDate = calculateExpiryDate(baseDate, validated.durationMonths);

    // Preserve previous expiry date in history
    pass.renewalHistory.push({
      renewedAt: now,
      renewedBy: req.user._id,
      previousExpiryDate: pass.expiryDate,
      newExpiryDate,
      durationMonths: validated.durationMonths,
      amountPaid: validated.amount,
      paymentMethod: validated.paymentMethod,
      paymentReference: validated.paymentReference || ''
    });

    pass.expiryDate = newExpiryDate;
    pass.status = 'ACTIVE';
    pass.amount += validated.amount;

    await pass.save();

    // Record separate payment
    const paymentId = generatePaymentId();
    const payment = new Payment({
      paymentId,
      type: 'MONTHLY_PASS',
      monthlyPass: pass._id,
      amount: validated.amount,
      currency: 'INR',
      method: validated.paymentMethod,
      status: 'COMPLETED',
      transactionReference: validated.paymentReference || '',
      operator: req.user._id,
      location: req.user.assignedLocation?._id || null,
      idempotencyKey: paymentId
    });

    await payment.save();

    // Update vehicle spent
    await Vehicle.findOneAndUpdate(
      { registrationNumber: pass.vehicleNumber },
      { $inc: { totalAmountSpent: validated.amount } }
    );

    // Audit log
    await AuditService.log({
      actor: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'PASS_RENEWED',
      entityType: 'MonthlyPass',
      entityId: pass.passNumber,
      details: {
        passNumber: pass.passNumber,
        newExpiryDate,
        amountPaid: validated.amount
      },
      req
    });

    return res.json({
      success: true,
      message: 'Monthly pass renewed successfully',
      pass,
      payment
    });
  } catch (error) {
    next(error);
  }
}

export async function cancelPass(req, res, next) {
  try {
    const { id } = req.params;
    const pass = await MonthlyPass.findById(id);

    if (!pass) {
      return res.status(404).json({ success: false, message: 'Pass not found' });
    }

    if (pass.status === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Pass is already cancelled' });
    }

    pass.status = 'CANCELLED';
    await pass.save();

    await AuditService.log({
      actor: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'PASS_CANCELLED',
      entityType: 'MonthlyPass',
      entityId: pass.passNumber,
      details: { passNumber: pass.passNumber },
      req
    });

    return res.json({
      success: true,
      message: 'Pass cancelled successfully',
      pass
    });
  } catch (error) {
    next(error);
  }
}

export async function getPasses(req, res, next) {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      status,
      vehicleType,
      expiringSoon
    } = req.query;

    const filter = {};
    const now = new Date();

    if (search) {
      const clean = search.trim();
      filter.$or = [
        { passNumber: { $regex: clean, $options: 'i' } },
        { vehicleNumber: { $regex: clean, $options: 'i' } },
        { customerName: { $regex: clean, $options: 'i' } },
        { customerPhone: { $regex: clean, $options: 'i' } }
      ];
    }

    if (vehicleType) {
      filter.vehicleType = vehicleType;
    }

    if (status) {
      filter.status = status;
    }

    // Expiring soon filter
    if (expiringSoon === 'true') {
      const settings = await BusinessSettings.findOne() || { passExpiringSoonDays: 5 };
      const warningDays = settings.passExpiringSoonDays || 5;
      const warningDate = new Date(now.getTime() + warningDays * 86400000);

      filter.status = 'ACTIVE';
      filter.expiryDate = { $gte: now, $lte: warningDate };
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const [passes, total] = await Promise.all([
      MonthlyPass.find(filter)
        .sort({ expiryDate: 1 })
        .skip(skip)
        .limit(take)
        .populate('issuedBy', 'name operatorId')
        .populate('renewalHistory.renewedBy', 'name operatorId')
        .lean(),
      MonthlyPass.countDocuments(filter)
    ]);

    // Attach expiringSoon boolean indicator
    const settings = await BusinessSettings.findOne() || { passExpiringSoonDays: 5 };
    const warningThreshold = new Date(now.getTime() + (settings.passExpiringSoonDays || 5) * 86400000);

    const enrichedPasses = passes.map(p => ({
      ...p,
      isExpiringSoon: p.status === 'ACTIVE' && new Date(p.expiryDate) <= warningThreshold && new Date(p.expiryDate) >= now,
      isExpired: new Date(p.expiryDate) < now
    }));

    return res.json({
      success: true,
      passes: enrichedPasses,
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

export async function getPassById(req, res, next) {
  try {
    const pass = await MonthlyPass.findById(req.params.id)
      .populate('issuedBy', 'name operatorId')
      .populate('renewalHistory.renewedBy', 'name operatorId');

    if (!pass) {
      return res.status(404).json({ success: false, message: 'Pass not found' });
    }

    return res.json({ success: true, pass });
  } catch (error) {
    next(error);
  }
}
