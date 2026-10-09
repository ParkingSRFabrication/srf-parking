/**
 * SR FABRICATION - Formatters & Helpers
 */

/**
 * Format currency in Indian Rupees (INR - ₹)
 */
export function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  }).format(amount);
}

/**
 * Format date in Indian English (DD/MM/YYYY, hh:mm A)
 */
export function formatDateTime(date) {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  }).format(d);
}

/**
 * Format date only (DD/MM/YYYY)
 */
export function formatDate(date) {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Kolkata'
  }).format(d);
}

/**
 * Human-readable duration string from minutes
 */
export function formatDuration(minutes) {
  if (!minutes && minutes !== 0) return '-';
  const m = Math.floor(minutes);
  if (m < 60) return `${m} min${m !== 1 ? 's' : ''}`;

  const hours = Math.floor(m / 60);
  const remainingMins = m % 60;

  if (hours < 24) {
    const minPart = remainingMins > 0 ? ` ${remainingMins}m` : '';
    return `${hours} hr${hours !== 1 ? 's' : ''}${minPart}`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  const hourPart = remainingHours > 0 ? ` ${remainingHours}h` : '';
  const minPart = remainingMins > 0 ? ` ${remainingMins}m` : '';
  return `${days}d${hourPart}${minPart}`.trim();
}

/**
 * Clean and normalize vehicle registration number
 */
export function normalizeVehicleNumber(reg) {
  if (!reg) return '';
  return reg.toUpperCase().replace(/\s+/g, '');
}

/**
 * Category friendly names and icons
 */
export const CATEGORY_LABELS = {
  bike: 'Two Wheeler',
  car: 'Four Wheeler',
  auto: 'Auto Rickshaw',
  cycle: 'Bicycle',
  bus: 'Bus / Van',
  truck: 'Heavy Truck',
  tempo: 'Tempo Carrier',
  other: 'Other Vehicle',
  helmet: 'Helmet Deposit',
  locker: 'Luggage / Locker'
};
