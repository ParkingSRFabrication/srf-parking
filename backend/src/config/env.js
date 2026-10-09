import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/srf_parking',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'srf_parking_jwt_access_secret_development_key_2026_xyz',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'srf_parking_jwt_refresh_secret_development_key_2026_xyz',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '1d',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'srf_cookie_secret_development_key_2026_xyz',
  BUSINESS_TIMEZONE: process.env.BUSINESS_TIMEZONE || 'Asia/Kolkata',
  DEFAULT_LOCATION_CODE: process.env.DEFAULT_LOCATION_CODE || 'SRF-MAIN',
};

// Validate critical secrets in production
if (ENV.NODE_ENV === 'production') {
  if (!process.env.JWT_ACCESS_SECRET || process.env.JWT_ACCESS_SECRET.length < 32) {
    throw new Error('FATAL: JWT_ACCESS_SECRET must be at least 32 characters in production.');
  }
  if (!process.env.MONGODB_URI) {
    throw new Error('FATAL: MONGODB_URI is required in production.');
  }
}
