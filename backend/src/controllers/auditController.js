import { AuditLog } from '../models/index.js';

export async function getAuditLogs(req, res, next) {
  try {
    const {
      page = 1,
      limit = 25,
      action,
      entityType,
      search
    } = req.query;

    const filter = {};
    if (action) filter.action = action;
    if (entityType) filter.entityType = entityType;
    if (search) {
      filter.$or = [
        { actorName: { $regex: search, $options: 'i' } },
        { entityId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(take)
        .populate('actor', 'name operatorId role')
        .lean(),
      AuditLog.countDocuments(filter)
    ]);

    return res.json({
      success: true,
      logs,
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
