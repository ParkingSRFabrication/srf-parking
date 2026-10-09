import { AuditLog } from '../models/index.js';
import { logger } from '../config/logger.js';

export class AuditService {
  /**
   * Log an operational or administrative action safely.
   */
  static async log({
    actor = null,
    actorName = 'SYSTEM',
    actorRole = 'system',
    action,
    entityType,
    entityId = '',
    details = {},
    req = null
  }) {
    try {
      // Sanitize details to remove any passwords or sensitive token fields
      const sanitizedDetails = { ...details };
      delete sanitizedDetails.password;
      delete sanitizedDetails.passwordHash;
      delete sanitizedDetails.mpin;
      delete sanitizedDetails.mpinHash;
      delete sanitizedDetails.token;
      delete sanitizedDetails.accessToken;
      delete sanitizedDetails.refreshToken;

      let ipAddress = '';
      let userAgent = '';
      if (req) {
        ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
        userAgent = req.headers['user-agent'] || '';
      }

      await AuditLog.create({
        actor: actor ? (actor._id || actor) : null,
        actorName: actor?.name || actorName,
        actorRole: actor?.role || actorRole,
        action,
        entityType,
        entityId: String(entityId),
        details: sanitizedDetails,
        ipAddress,
        userAgent
      });
    } catch (err) {
      logger.error('AuditLog writing failed:', { error: err.message, action });
    }
  }
}
