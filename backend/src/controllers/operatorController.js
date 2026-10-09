import bcrypt from 'bcryptjs';
import { User, ParkingToken, Payment } from '../models/index.js';
import { AuditService } from '../services/auditService.js';
import { operatorSchema } from '../validators/index.js';

export async function getOperators(req, res, next) {
  try {
    const operators = await User.find()
      .select('-passwordHash -mpinHash')
      .populate('assignedLocation')
      .sort({ createdAt: -1 });

    return res.json({ success: true, operators });
  } catch (error) {
    next(error);
  }
}

export async function createOperator(req, res, next) {
  try {
    const validated = operatorSchema.parse(req.body);

    const existingUser = await User.findOne({
      $or: [
        { username: validated.username },
        { operatorId: validated.operatorId }
      ]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this username or Operator ID already exists'
      });
    }

    if (!validated.password && !validated.mpin) {
      return res.status(400).json({
        success: false,
        message: 'Must provide either a password or a 4-digit MPIN for the account'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = validated.password ? await bcrypt.hash(validated.password, salt) : await bcrypt.hash('Default@123', salt);
    const mpinHash = validated.mpin ? await bcrypt.hash(validated.mpin, salt) : null;

    const user = new User({
      username: validated.username,
      operatorId: validated.operatorId,
      name: validated.name,
      role: validated.role || 'operator',
      passwordHash,
      mpinHash,
      permissions: validated.permissions || ['create_token', 'exit_token', 'view_tokens'],
      assignedLocation: validated.assignedLocation || null,
      isActive: true
    });

    await user.save();

    await AuditService.log({
      actor: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'OPERATOR_CREATED',
      entityType: 'User',
      entityId: user.operatorId,
      details: {
        operatorId: user.operatorId,
        username: user.username,
        role: user.role
      },
      req
    });

    const userObj = user.toObject();
    delete userObj.passwordHash;
    delete userObj.mpinHash;

    return res.status(201).json({
      success: true,
      message: 'Operator account created successfully',
      operator: userObj
    });
  } catch (error) {
    next(error);
  }
}

export async function updateOperator(req, res, next) {
  try {
    const { id } = req.params;
    const { name, role, permissions, assignedLocation, isActive, password, mpin } = req.body;

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Operator not found' });
    }

    // Safety rule: Prevent deactivating or demoting the last active admin!
    if (targetUser.role === 'admin' && (isActive === false || (role && role !== 'admin'))) {
      const activeAdminCount = await User.countDocuments({
        role: 'admin',
        isActive: true,
        _id: { $ne: targetUser._id }
      });

      if (activeAdminCount === 0) {
        return res.status(400).json({
          success: false,
          message: 'Action rejected: Cannot deactivate or demote the only remaining active administrator account.'
        });
      }
    }

    if (name) targetUser.name = name;
    if (role) targetUser.role = role;
    if (permissions) targetUser.permissions = permissions;
    if (assignedLocation !== undefined) targetUser.assignedLocation = assignedLocation || null;
    if (isActive !== undefined) targetUser.isActive = isActive;

    const salt = await bcrypt.genSalt(10);
    if (password && password.length >= 6) {
      targetUser.passwordHash = await bcrypt.hash(password, salt);
    }
    if (mpin && /^\d{4}$/.test(mpin)) {
      targetUser.mpinHash = await bcrypt.hash(mpin, salt);
    }

    await targetUser.save();

    await AuditService.log({
      actor: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'OPERATOR_UPDATED',
      entityType: 'User',
      entityId: targetUser.operatorId,
      details: {
        operatorId: targetUser.operatorId,
        isActive: targetUser.isActive,
        role: targetUser.role
      },
      req
    });

    const userObj = targetUser.toObject();
    delete userObj.passwordHash;
    delete userObj.mpinHash;

    return res.json({
      success: true,
      message: 'Operator account updated successfully',
      operator: userObj
    });
  } catch (error) {
    next(error);
  }
}

export async function getOperatorStats(req, res, next) {
  try {
    const { id } = req.params;
    const [tokensCreated, exitsHandled, paymentsCollected] = await Promise.all([
      ParkingToken.countDocuments({ entryOperator: id }),
      ParkingToken.countDocuments({ exitOperator: id }),
      Payment.aggregate([
        { $match: { operator: id, status: 'COMPLETED' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ])
    ]);

    return res.json({
      success: true,
      stats: {
        tokensCreated,
        exitsHandled,
        totalPaymentsCount: paymentsCollected[0]?.count || 0,
        totalRevenueCollected: paymentsCollected[0]?.total || 0
      }
    });
  } catch (error) {
    next(error);
  }
}
