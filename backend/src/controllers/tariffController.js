import { Tariff } from '../models/index.js';
import { TariffEngine } from '../services/tariffEngine.js';
import { AuditService } from '../services/auditService.js';
import { tariffSchema } from '../validators/index.js';

export async function getTariffs(req, res, next) {
  try {
    const { category, isActive } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const tariffs = await Tariff.find(filter)
      .sort({ category: 1, effectiveFrom: -1 })
      .populate('createdBy', 'name operatorId')
      .populate('updatedBy', 'name operatorId');

    return res.json({ success: true, tariffs });
  } catch (error) {
    next(error);
  }
}

export async function createTariff(req, res, next) {
  try {
    const validated = tariffSchema.parse(req.body);

    const tariff = new Tariff({
      ...validated,
      createdBy: req.user._id,
      updatedBy: req.user._id
    });

    await tariff.save();

    await AuditService.log({
      actor: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'TARIFF_CREATED',
      entityType: 'Tariff',
      entityId: tariff._id.toString(),
      details: validated,
      req
    });

    return res.status(201).json({
      success: true,
      message: 'Tariff rule created successfully',
      tariff
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTariff(req, res, next) {
  try {
    const { id } = req.params;
    const validated = tariffSchema.partial().parse(req.body);

    const tariff = await Tariff.findById(id);
    if (!tariff) {
      return res.status(404).json({ success: false, message: 'Tariff not found' });
    }

    const previousState = tariff.toObject();

    Object.assign(tariff, validated);
    tariff.updatedBy = req.user._id;
    await tariff.save();

    await AuditService.log({
      actor: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'TARIFF_UPDATED',
      entityType: 'Tariff',
      entityId: tariff._id.toString(),
      details: {
        previous: previousState,
        updated: validated
      },
      req
    });

    return res.json({
      success: true,
      message: 'Tariff updated successfully',
      tariff
    });
  } catch (error) {
    next(error);
  }
}

export async function previewTariffCalculation(req, res, next) {
  try {
    const { tariff, entryTime, exitTime } = req.body;

    if (!tariff || !entryTime || !exitTime) {
      return res.status(400).json({
        success: false,
        message: 'Tariff specification, entryTime, and exitTime are required for preview calculation'
      });
    }

    const calculation = TariffEngine.calculateCharge(tariff, entryTime, exitTime);

    return res.json({
      success: true,
      calculation
    });
  } catch (error) {
    next(error);
  }
}
