/**
 * Calculate the next trigger date based on repeatType and reference date.
 *
 * @param {string} repeatType - 'ONCE', 'DAILY', or 'WEEKLY'
 * @param {Date|string} currentScheduledOrNext - The base date from which to calculate
 * @param {Date} [now=new Date()] - The reference current time
 * @returns {Date|null} - Next trigger Date or null if ONCE
 */
const calculateNextTriggerAt = (repeatType, currentScheduledOrNext, now = new Date()) => {
  if (!currentScheduledOrNext) {
    return null;
  }

  const baseDate = new Date(currentScheduledOrNext);
  if (isNaN(baseDate.getTime())) {
    return null;
  }

  const currentTime = now.getTime();

  switch (repeatType) {
    case 'ONCE':
      return null;

    case 'DAILY': {
      const nextDate = new Date(baseDate);
      const oneDayMs = 24 * 60 * 60 * 1000;
      // Advance by 1 day until it's in the future relative to now
      while (nextDate.getTime() <= currentTime) {
        nextDate.setTime(nextDate.getTime() + oneDayMs);
      }
      return nextDate;
    }

    case 'WEEKLY': {
      const nextDate = new Date(baseDate);
      const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
      // Advance by 1 week until it's in the future relative to now
      while (nextDate.getTime() <= currentTime) {
        nextDate.setTime(nextDate.getTime() + oneWeekMs);
      }
      return nextDate;
    }

    default:
      return null;
  }
};

/**
 * Validate whether a date string or object is a valid date.
 */
const isValidDate = (dateVal) => {
  if (!dateVal) return false;
  const d = new Date(dateVal);
  return !isNaN(d.getTime());
};

module.exports = {
  calculateNextTriggerAt,
  isValidDate,
};
