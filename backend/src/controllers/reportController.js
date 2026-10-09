import { ParkingToken, MonthlyPass, Payment, Tariff } from '../models/index.js';
import { BusinessSettings } from '../models/BusinessSettings.js';

/**
 * Helper to compute start and end of day in business timezone
 */
function getDayBoundaries(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export async function getDashboardSummary(req, res, next) {
  try {
    const now = new Date();
    const { start: todayStart, end: todayEnd } = getDayBoundaries(now);

    const settings = await BusinessSettings.findOne() || { passExpiringSoonDays: 5 };
    const warningDays = settings.passExpiringSoonDays || 5;
    const warningDate = new Date(now.getTime() + warningDays * 86400000);

    // Run parallel aggregation and counts
    const [
      vehiclesInside,
      entriesToday,
      exitsToday,
      activePasses,
      expiringPasses,
      cancelledToday,
      todayPaymentsAgg,
      vehicleTypeBreakdown,
      paymentMethodBreakdown,
      recentActivity
    ] = await Promise.all([
      // 1. Current vehicles inside
      ParkingToken.countDocuments({ status: 'INSIDE' }),

      // 2. Entries today
      ParkingToken.countDocuments({ entryTime: { $gte: todayStart, $lte: todayEnd } }),

      // 3. Exits today
      ParkingToken.countDocuments({ exitTime: { $gte: todayStart, $lte: todayEnd }, status: 'EXITED' }),

      // 4. Active passes
      MonthlyPass.countDocuments({ status: 'ACTIVE', expiryDate: { $gte: now } }),

      // 5. Expiring passes
      MonthlyPass.countDocuments({ status: 'ACTIVE', expiryDate: { $gte: now, $lte: warningDate } }),

      // 6. Cancelled tokens today
      ParkingToken.countDocuments({ cancelledAt: { $gte: todayStart, $lte: todayEnd } }),

      // 7. Payments completed today by type
      Payment.aggregate([
        {
          $match: {
            createdAt: { $gte: todayStart, $lte: todayEnd },
            status: { $in: ['COMPLETED', 'REFUNDED'] }
          }
        },
        {
          $group: {
            _id: { type: '$type', status: '$status' },
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),

      // 8. Vehicle types inside
      ParkingToken.aggregate([
        { $match: { status: 'INSIDE' } },
        { $group: { _id: '$vehicleType', count: { $sum: 1 } } }
      ]),

      // 9. Payment method distribution today
      Payment.aggregate([
        {
          $match: {
            createdAt: { $gte: todayStart, $lte: todayEnd },
            status: 'COMPLETED'
          }
        },
        { $group: { _id: '$method', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),

      // 10. Recent tokens activity
      ParkingToken.find()
        .sort({ updatedAt: -1 })
        .limit(8)
        .populate('entryOperator', 'name')
        .populate('exitOperator', 'name')
        .lean()
    ]);

    // Parse today payments aggregation
    let parkingRevenueToday = 0;
    let passRevenueToday = 0;
    let refundsToday = 0;

    todayPaymentsAgg.forEach(item => {
      if (item._id.status === 'COMPLETED') {
        if (item._id.type === 'PARKING_TOKEN') {
          parkingRevenueToday += item.totalAmount;
        } else if (item._id.type === 'MONTHLY_PASS') {
          passRevenueToday += item.totalAmount;
        }
      } else if (item._id.status === 'REFUNDED') {
        refundsToday += item.totalAmount;
      }
    });

    const grossRevenueToday = parkingRevenueToday + passRevenueToday;
    const netRevenueToday = grossRevenueToday - refundsToday;

    return res.json({
      success: true,
      summary: {
        vehiclesInside,
        entriesToday,
        exitsToday,
        parkingRevenueToday,
        passRevenueToday,
        grossRevenueToday,
        refundsToday,
        netRevenueToday,
        activePasses,
        expiringPasses,
        cancelledToday
      },
      charts: {
        vehicleTypeBreakdown: vehicleTypeBreakdown.map(v => ({ name: v._id, count: v.count })),
        paymentMethodBreakdown: paymentMethodBreakdown.map(p => ({
          method: p._id,
          amount: p.totalAmount,
          count: p.count
        }))
      },
      recentActivity
    });
  } catch (error) {
    next(error);
  }
}

export async function getDetailedReport(req, res, next) {
  try {
    const {
      startDate,
      endDate,
      vehicleType,
      paymentMethod,
      operator
    } = req.query;

    const start = startDate ? new Date(startDate) : new Date(new Date().setHours(0, 0, 0, 0));
    const end = endDate ? new Date(endDate) : new Date(new Date().setHours(23, 59, 59, 999));
    end.setHours(23, 59, 59, 999);

    // Payment Match Query
    const paymentMatch = {
      createdAt: { $gte: start, $lte: end }
    };
    if (paymentMethod) paymentMatch.method = paymentMethod;
    if (operator) paymentMatch.operator = operator;

    // Token Match Query
    const tokenMatch = {
      entryTime: { $gte: start, $lte: end }
    };
    if (vehicleType) tokenMatch.vehicleType = vehicleType;

    const [payments, tokens, totalEntries, totalExits, totalCancelled] = await Promise.all([
      Payment.find(paymentMatch)
        .populate('operator', 'name operatorId')
        .populate('parkingToken', 'tokenNumber vehicleNumber vehicleType')
        .populate('monthlyPass', 'passNumber customerName vehicleNumber')
        .sort({ createdAt: -1 })
        .lean(),

      ParkingToken.find(tokenMatch)
        .populate('entryOperator', 'name')
        .populate('exitOperator', 'name')
        .sort({ entryTime: -1 })
        .lean(),

      ParkingToken.countDocuments(tokenMatch),
      ParkingToken.countDocuments({ ...tokenMatch, status: 'EXITED' }),
      ParkingToken.countDocuments({ ...tokenMatch, status: 'CANCELLED' })
    ]);

    // Financial summaries
    let grossCollected = 0;
    let parkingCollected = 0;
    let passCollected = 0;
    let refunds = 0;

    const paymentMethodsSummary = {};

    payments.forEach(p => {
      if (p.status === 'COMPLETED') {
        grossCollected += p.amount;
        if (p.type === 'PARKING_TOKEN') parkingCollected += p.amount;
        if (p.type === 'MONTHLY_PASS') passCollected += p.amount;

        paymentMethodsSummary[p.method] = (paymentMethodsSummary[p.method] || 0) + p.amount;
      } else if (p.status === 'REFUNDED') {
        refunds += p.amount;
      }
    });

    const netCollected = grossCollected - refunds;

    return res.json({
      success: true,
      period: { start, end },
      metrics: {
        totalEntries,
        totalExits,
        totalCancelled,
        parkingCollected,
        passCollected,
        grossCollected,
        refunds,
        netCollected,
        paymentsCount: payments.length
      },
      paymentMethodsSummary,
      payments,
      tokensSummary: {
        total: tokens.length
      }
    });
  } catch (error) {
    next(error);
  }
}
