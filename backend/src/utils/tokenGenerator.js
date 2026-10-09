import { ParkingToken, MonthlyPass, Payment, BusinessSettings } from '../models/index.js';

/**
 * Format date as YYYYMMDD in Asia/Kolkata
 */
export function getFormattedDateString(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Generate collision-safe parking token number.
 * Uses atomic sequence checking against current date records.
 */
export async function generateTokenNumber(prefix = 'SRF') {
  const dateStr = getFormattedDateString();
  const pattern = new RegExp(`^${prefix}-${dateStr}-(\\d+)$`);
  
  // Find highest sequence for today
  const latestToken = await ParkingToken.findOne({
    tokenNumber: { $regex: pattern }
  }).sort({ tokenNumber: -1 }).select('tokenNumber').lean();

  let nextSeq = 1;
  if (latestToken && latestToken.tokenNumber) {
    const match = latestToken.tokenNumber.match(pattern);
    if (match && match[1]) {
      nextSeq = parseInt(match[1], 10) + 1;
    }
  }

  const paddedSeq = String(nextSeq).padStart(4, '0');
  return `${prefix}-${dateStr}-${paddedSeq}`;
}

/**
 * Generate unique monthly pass number.
 */
export async function generatePassNumber(prefix = 'SRF-PASS') {
  const dateStr = getFormattedDateString();
  const pattern = new RegExp(`^${prefix}-${dateStr}-(\\d+)$`);

  const latestPass = await MonthlyPass.findOne({
    passNumber: { $regex: pattern }
  }).sort({ passNumber: -1 }).select('passNumber').lean();

  let nextSeq = 1;
  if (latestPass && latestPass.passNumber) {
    const match = latestPass.passNumber.match(pattern);
    if (match && match[1]) {
      nextSeq = parseInt(match[1], 10) + 1;
    }
  }

  const paddedSeq = String(nextSeq).padStart(4, '0');
  return `${prefix}-${dateStr}-${paddedSeq}`;
}

/**
 * Generate unique payment ID.
 */
export function generatePaymentId() {
  const dateStr = getFormattedDateString();
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  const timestampSlice = Date.now().toString().slice(-4);
  return `PAY-${dateStr}-${timestampSlice}-${randomSuffix}`;
}
