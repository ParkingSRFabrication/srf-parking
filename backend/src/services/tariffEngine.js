/**
 * SR FABRICATION - Parking Tariff Calculation Engine
 * Dedicated, independently testable service implementing authoritative railway parking business rules.
 */

const MS_PER_DAY = 86400000; // 24 * 60 * 60 * 1000
const MS_PER_HOUR = 3600000;  // 60 * 60 * 1000
const MS_PER_MINUTE = 60000;

export class TariffEngine {
  /**
   * Validate and compute duration between entry and exit timestamps.
   * @param {Date|string|number} entryTime
   * @param {Date|string|number} exitTime
   * @returns {{ elapsedMs: number, durationMinutes: number, durationHours: number }}
   */
  static computeDuration(entryTime, exitTime = new Date()) {
    const entryDate = new Date(entryTime);
    const exitDate = new Date(exitTime);

    if (isNaN(entryDate.getTime())) {
      throw new Error('Invalid entry timestamp provided to TariffEngine');
    }
    if (isNaN(exitDate.getTime())) {
      throw new Error('Invalid exit timestamp provided to TariffEngine');
    }

    const elapsedMs = exitDate.getTime() - entryDate.getTime();
    if (elapsedMs < 0) {
      throw new Error('Exit time cannot be earlier than entry time (negative duration)');
    }

    const durationMinutes = Math.floor(elapsedMs / MS_PER_MINUTE);
    const durationHours = parseFloat((elapsedMs / MS_PER_HOUR).toFixed(2));

    return {
      elapsedMs,
      durationMinutes,
      durationHours,
      entryDate,
      exitDate
    };
  }

  /**
   * Calculate billable units based on elapsed milliseconds and billing method.
   * Formula for whole-session daily billing:
   * billableDays = max(1, ceil(elapsedMilliseconds / 86,400,000))
   */
  static computeBillableUnits(elapsedMs, billingMethod = '24_hour_daily', freeGraceMinutes = 0) {
    if (freeGraceMinutes > 0 && elapsedMs <= freeGraceMinutes * MS_PER_MINUTE) {
      return 0; // Within free grace period
    }

    switch (billingMethod) {
      case '24_hour_daily': {
        // Core business rule:
        // <= 24 hrs = 1 day
        // 24 hrs + 1 ms = 2 days
        return Math.max(1, Math.ceil(elapsedMs / MS_PER_DAY));
      }

      case 'hourly': {
        return Math.max(1, Math.ceil(elapsedMs / MS_PER_HOUR));
      }

      case 'fixed': {
        return 1;
      }

      default: {
        return Math.max(1, Math.ceil(elapsedMs / MS_PER_DAY));
      }
    }
  }

  /**
   * Authoritative calculation of parking fee.
   * @param {Object} tariff - Tariff model or tariffSnapshot
   * @param {Date|string|number} entryTime
   * @param {Date|string|number} exitTime
   * @returns {Object} calculation result
   */
  static calculateCharge(tariff, entryTime, exitTime = new Date()) {
    if (!tariff) {
      throw new Error('Tariff specification or snapshot is required for charge calculation');
    }

    const { elapsedMs, durationMinutes, durationHours, entryDate, exitDate } = this.computeDuration(entryTime, exitTime);

    const billingMethod = tariff.billingMethod || '24_hour_daily';
    const firstSlabAmount = Number(tariff.firstSlabAmount) || 0;
    const additionalDayAmount = (tariff.additionalDayAmount !== undefined && tariff.additionalDayAmount !== null)
      ? Number(tariff.additionalDayAmount)
      : firstSlabAmount;
    const hourlyAmount = Number(tariff.hourlyAmount) || 0;
    const freeGraceMinutes = Number(tariff.freeGraceMinutes) || 0;

    const billableUnits = this.computeBillableUnits(elapsedMs, billingMethod, freeGraceMinutes);

    let amountBilled = 0;

    if (billableUnits === 0) {
      amountBilled = 0;
    } else if (billingMethod === '24_hour_daily') {
      if (billableUnits === 1) {
        amountBilled = firstSlabAmount;
      } else {
        amountBilled = firstSlabAmount + ((billableUnits - 1) * additionalDayAmount);
      }
    } else if (billingMethod === 'hourly') {
      if (billableUnits === 1) {
        amountBilled = firstSlabAmount > 0 ? firstSlabAmount : hourlyAmount;
      } else {
        const base = firstSlabAmount > 0 ? firstSlabAmount : hourlyAmount;
        amountBilled = base + ((billableUnits - 1) * hourlyAmount);
      }
    } else if (billingMethod === 'fixed') {
      amountBilled = firstSlabAmount;
    }

    // Ensure round monetary value in INR (two decimal precision if decimals exist, or integer)
    const roundedAmount = Math.round(amountBilled * 100) / 100;

    return {
      entryTime: entryDate,
      exitTime: exitDate,
      elapsedMs,
      durationMinutes,
      durationHours,
      billingMethod,
      billableUnits,
      firstSlabAmount,
      additionalDayAmount,
      amountBilled: roundedAmount,
      isGracePeriod: billableUnits === 0
    };
  }
}
