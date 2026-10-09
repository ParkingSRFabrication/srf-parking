import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDuration,
  normalizeVehicleNumber,
  CATEGORY_LABELS
} from '../utils/formatters.js';

describe('Frontend Formatters & Normalizers', () => {
  it('Formats currency in INR with ₹ symbol', () => {
    expect(formatCurrency(20)).toBe('₹20');
    expect(formatCurrency(1500)).toBe('₹1,500');
    expect(formatCurrency(0)).toBe('₹0');
  });

  it('Formats duration into human-readable strings', () => {
    expect(formatDuration(45)).toBe('45 mins');
    expect(formatDuration(60)).toBe('1 hr');
    expect(formatDuration(90)).toBe('1 hr 30m');
    expect(formatDuration(1440)).toBe('1d'); // exactly 24 hours
    expect(formatDuration(1500)).toBe('1d 1h');
  });

  it('Normalizes vehicle numbers to uppercase without whitespace', () => {
    expect(normalizeVehicleNumber('mh 12 ab 1234')).toBe('MH12AB1234');
    expect(normalizeVehicleNumber('dl01-ca-9999')).toBe('DL01-CA-9999');
    expect(normalizeVehicleNumber('  ka 03 mg 4567  ')).toBe('KA03MG4567');
  });

  it('Maintains category labels for all vehicle and non-vehicle types', () => {
    expect(CATEGORY_LABELS.bike).toBe('Two Wheeler');
    expect(CATEGORY_LABELS.car).toBe('Four Wheeler');
    expect(CATEGORY_LABELS.helmet).toBe('Helmet Deposit');
    expect(CATEGORY_LABELS.locker).toBe('Luggage / Locker');
  });
});
