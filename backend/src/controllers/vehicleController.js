import { Vehicle, ParkingToken, MonthlyPass, Payment } from '../models/index.js';

export async function searchVehicle(req, res, next) {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query required' });
    }

    const clean = q.trim().toUpperCase().replace(/\s+/g, '');
    const vehicles = await Vehicle.find({
      registrationNumber: { $regex: clean, $options: 'i' }
    }).limit(15).lean();

    return res.json({ success: true, vehicles });
  } catch (error) {
    next(error);
  }
}

export async function getVehicleHistory(req, res, next) {
  try {
    const { registrationNumber } = req.params;
    const cleanReg = registrationNumber.trim().toUpperCase().replace(/\s+/g, '');

    const [vehicle, tokens, passes, payments] = await Promise.all([
      Vehicle.findOne({ registrationNumber: cleanReg }).lean(),
      ParkingToken.find({ vehicleNumber: cleanReg })
        .sort({ entryTime: -1 })
        .populate('entryOperator', 'name operatorId')
        .populate('exitOperator', 'name operatorId')
        .lean(),
      MonthlyPass.find({ vehicleNumber: cleanReg })
        .sort({ startDate: -1 })
        .populate('issuedBy', 'name operatorId')
        .lean(),
      Payment.find({
        status: 'COMPLETED',
        $or: [
          { parkingToken: { $in: await ParkingToken.find({ vehicleNumber: cleanReg }).distinct('_id') } },
          { monthlyPass: { $in: await MonthlyPass.find({ vehicleNumber: cleanReg }).distinct('_id') } }
        ]
      }).sort({ createdAt: -1 }).lean()
    ]);

    if (!vehicle && tokens.length === 0 && passes.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No records found for vehicle registration: ${cleanReg}`
      });
    }

    const currentOpenSession = tokens.find(t => t.status === 'INSIDE') || null;
    const now = new Date();
    const currentActivePass = passes.find(p => p.status === 'ACTIVE' && new Date(p.expiryDate) >= now) || null;

    let totalLifetimeRevenue = 0;
    tokens.forEach(t => {
      if (t.status === 'EXITED' && t.amountPaid) {
        totalLifetimeRevenue += t.amountPaid;
      }
    });
    passes.forEach(p => {
      if (p.amount) {
        totalLifetimeRevenue += p.amount;
      }
    });

    return res.json({
      success: true,
      vehicle: vehicle || { registrationNumber: cleanReg, type: tokens[0]?.vehicleType || 'bike' },
      stats: {
        totalVisits: tokens.length,
        totalLifetimeRevenue,
        hasOpenSession: !!currentOpenSession,
        hasActivePass: !!currentActivePass
      },
      currentOpenSession,
      currentActivePass,
      tokens,
      passes,
      payments
    });
  } catch (error) {
    next(error);
  }
}
