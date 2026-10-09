import { ParkingToken, MonthlyPass, Payment, Tariff, AuditLog } from '../models/index.js';
import { AuditService } from '../services/auditService.js';

export async function exportData(req, res, next) {
  try {
    const { collection } = req.query; // 'tokens' | 'passes' | 'payments' | 'all'

    let exportData = {};

    if (collection === 'tokens' || collection === 'all' || !collection) {
      exportData.tokens = await ParkingToken.find().sort({ entryTime: -1 }).limit(5000).lean();
    }
    if (collection === 'passes' || collection === 'all' || !collection) {
      exportData.passes = await MonthlyPass.find().sort({ createdAt: -1 }).limit(5000).lean();
    }
    if (collection === 'payments' || collection === 'all' || !collection) {
      exportData.payments = await Payment.find().sort({ createdAt: -1 }).limit(5000).lean();
    }
    if (collection === 'tariffs' || collection === 'all' || !collection) {
      exportData.tariffs = await Tariff.find().lean();
    }

    await AuditService.log({
      actor: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'DATA_EXPORTED',
      entityType: 'Database',
      entityId: collection || 'all',
      details: { collectionRequested: collection || 'all' },
      req
    });

    res.setHeader('Content-Disposition', `attachment; filename="srf_parking_export_${Date.now()}.json"`);
    res.setHeader('Content-Type', 'application/json');
    return res.json({
      exportTimestamp: new Date().toISOString(),
      exportedBy: req.user.operatorId,
      ...exportData
    });
  } catch (error) {
    next(error);
  }
}
