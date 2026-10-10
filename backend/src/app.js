import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import { ENV } from './config/env.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import parkingRoutes from './routes/parkingRoutes.js';
import passRoutes from './routes/passRoutes.js';
import tariffRoutes from './routes/tariffRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import operatorRoutes from './routes/operatorRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import backupRoutes from './routes/backupRoutes.js';

const app = express();

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS Configuration
const allowedOrigins = [
  ENV.FRONTEND_ORIGIN,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    // In development, allow all origins (localhost, 127.0.0.1, LAN IPs)
    if (ENV.NODE_ENV !== 'production' || !origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Check local LAN IP patterns (10.x, 192.168.x, 172.16-31.x)
    if (/^https?:\/\/(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Request parsers & compression
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(ENV.COOKIE_SECRET));

// HTTP access logging
if (ENV.NODE_ENV !== 'test') {
  app.use(morgan(ENV.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Rate limiting
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'SR FABRICATION Railway Station Vehicle Parking Management System',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    timezone: ENV.BUSINESS_TIMEZONE
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/passes', passRoutes);
app.use('/api/tariffs', tariffRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/operators', operatorRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/backup', backupRoutes);

// Catch-all 404 handler for undefined API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
