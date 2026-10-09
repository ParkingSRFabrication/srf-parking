import { describe, it, expect } from 'vitest';
import { TariffEngine } from '../src/services/tariffEngine.js';

describe('TariffEngine - 24-Hour Railway Parking Business Rules', () => {
  const sampleBikeTariff = {
    category: 'bike',
    billingMethod: '24_hour_daily',
    firstSlabAmount: 20,
    additionalDayAmount: 20,
    freeGraceMinutes: 0
  };

  const baseEntryTime = new Date('2026-10-09T08:00:00.000Z');

  it('Case A: 23 hours 59 minutes = 1 billable day (amount = 20)', () => {
    // 23h 59m = 23 * 3600000 + 59 * 60000 = 86340000 ms
    const exitTime = new Date(baseEntryTime.getTime() + (23 * 3600000) + (59 * 60000));
    const result = TariffEngine.calculateCharge(sampleBikeTariff, baseEntryTime, exitTime);

    expect(result.billableUnits).toBe(1);
    expect(result.amountBilled).toBe(20);
    expect(result.durationMinutes).toBe(23 * 60 + 59);
  });

  it('Case B: Exactly 24 hours = 1 billable day (amount = 20)', () => {
    // Exactly 24h = 86400000 ms
    const exitTime = new Date(baseEntryTime.getTime() + (24 * 3600000));
    const result = TariffEngine.calculateCharge(sampleBikeTariff, baseEntryTime, exitTime);

    expect(result.billableUnits).toBe(1);
    expect(result.amountBilled).toBe(20);
    expect(result.durationMinutes).toBe(24 * 60);
  });

  it('Case C: 24 hours 1 minute = 2 billable days (amount = 40)', () => {
    // 24h 1m = 86400000 + 60000 ms
    const exitTime = new Date(baseEntryTime.getTime() + (24 * 3600000) + (1 * 60000));
    const result = TariffEngine.calculateCharge(sampleBikeTariff, baseEntryTime, exitTime);

    expect(result.billableUnits).toBe(2);
    expect(result.amountBilled).toBe(40);
  });

  it('Case D: Exactly 48 hours = 2 billable days (amount = 40)', () => {
    // Exactly 48h = 2 * 86400000 ms
    const exitTime = new Date(baseEntryTime.getTime() + (48 * 3600000));
    const result = TariffEngine.calculateCharge(sampleBikeTariff, baseEntryTime, exitTime);

    expect(result.billableUnits).toBe(2);
    expect(result.amountBilled).toBe(40);
  });

  it('Case E: 48 hours 1 minute = 3 billable days (amount = 60)', () => {
    // 48h 1m = 48 * 3600000 + 60000 ms
    const exitTime = new Date(baseEntryTime.getTime() + (48 * 3600000) + (1 * 60000));
    const result = TariffEngine.calculateCharge(sampleBikeTariff, baseEntryTime, exitTime);

    expect(result.billableUnits).toBe(3);
    expect(result.amountBilled).toBe(60);
  });

  it('Handles different first slab and additional day rates correctly', () => {
    const tieredTariff = {
      category: 'car',
      billingMethod: '24_hour_daily',
      firstSlabAmount: 50,
      additionalDayAmount: 30
    };
    // 25 hours -> 2 days -> 50 + 30 = 80
    const exitTime = new Date(baseEntryTime.getTime() + (25 * 3600000));
    const result = TariffEngine.calculateCharge(tieredTariff, baseEntryTime, exitTime);

    expect(result.billableUnits).toBe(2);
    expect(result.amountBilled).toBe(80);
  });

  it('Throws error on negative duration (exitTime < entryTime)', () => {
    const exitTime = new Date(baseEntryTime.getTime() - 60000);
    expect(() => {
      TariffEngine.calculateCharge(sampleBikeTariff, baseEntryTime, exitTime);
    }).toThrow('negative duration');
  });

  it('Throws error on invalid timestamp', () => {
    expect(() => {
      TariffEngine.calculateCharge(sampleBikeTariff, 'invalid-date', new Date());
    }).toThrow('Invalid entry timestamp');
  });

  it('Throws error if tariff object is missing', () => {
    expect(() => {
      TariffEngine.calculateCharge(null, baseEntryTime, new Date());
    }).toThrow('Tariff specification or snapshot is required');
  });

  it('Calculates hourly rate correctly for non-vehicle (Locker/Helmet)', () => {
    const hourlyTariff = {
      category: 'locker',
      billingMethod: 'hourly',
      firstSlabAmount: 10,
      hourlyAmount: 10
    };
    // 2 hours 15 mins -> 3 billable hours -> 10 + 2 * 10 = 30
    const exitTime = new Date(baseEntryTime.getTime() + (2 * 3600000) + (15 * 60000));
    const result = TariffEngine.calculateCharge(hourlyTariff, baseEntryTime, exitTime);

    expect(result.billableUnits).toBe(3);
    expect(result.amountBilled).toBe(30);
  });

  it('Calculates fixed charge correctly', () => {
    const fixedTariff = {
      category: 'helmet',
      billingMethod: 'fixed',
      firstSlabAmount: 15
    };
    const exitTime = new Date(baseEntryTime.getTime() + (12 * 3600000));
    const result = TariffEngine.calculateCharge(fixedTariff, baseEntryTime, exitTime);

    expect(result.billableUnits).toBe(1);
    expect(result.amountBilled).toBe(15);
  });
});
