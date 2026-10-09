import { ZodError } from 'zod';
import { logger } from '../config/logger.js';
import { ENV } from '../config/env.js';

export function errorHandler(err, req, res, next) {
  logger.error('Unhandled Application Error:', {
    message: err.message,
    path: req.originalUrl,
    method: req.method,
    stack: ENV.NODE_ENV === 'production' ? undefined : err.stack
  });

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const errorDetails = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed for request data.',
      errors: errorDetails
    });
  }

  // Handle MongoDB duplicate key error (code 11000)
  if (err.code === 11000) {
    const duplicateFields = Object.keys(err.keyValue || {});
    return res.status(409).json({
      success: false,
      message: `A record with this ${duplicateFields.join(', ')} already exists.`,
      duplicateFields
    });
  }

  // Handle Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid identifier format: ${err.value}`
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid security token.'
    });
  }

  const statusCode = err.statusCode || 500;
  const clientMessage = (statusCode === 500 && ENV.NODE_ENV === 'production')
    ? 'An unexpected internal server error occurred. Please try again later.'
    : err.message || 'Internal server error';

  return res.status(statusCode).json({
    success: false,
    message: clientMessage,
    ...(ENV.NODE_ENV !== 'production' && { stack: err.stack })
  });
}
