import { isSameMonth, toMonthKey, monthStart, monthsBetween } from '../dates';

describe('dates', () => {
  describe('isSameMonth', () => {
    it('returns true for dates in the same month', () => {
      expect(isSameMonth(new Date(2026, 0, 15), new Date(2026, 0, 28))).toBe(true);
    });

    it('returns false for dates in different months', () => {
      expect(isSameMonth(new Date(2026, 0, 15), new Date(2026, 1, 1))).toBe(false);
    });

    it('returns false for same month in different years', () => {
      expect(isSameMonth(new Date(2025, 5, 15), new Date(2026, 5, 15))).toBe(false);
    });
  });

  describe('toMonthKey', () => {
    it('builds a MonthKey object from a date', () => {
      expect(toMonthKey(new Date(2026, 0, 15))).toEqual({ year: 2026, month: 0 });
      expect(toMonthKey(new Date(2026, 11, 1))).toEqual({ year: 2026, month: 11 });
    });
  });

  describe('monthStart', () => {
    it('returns the in-progress month by default', () => {
      const d = new Date(2023, 5, 10);
      expect(isSameMonth(monthStart(d), d)).toBe(true);
    });

    it('walks back across year boundaries', () => {
      const start = monthStart(new Date(2026, 0, 15), -2);
      expect(start.getFullYear()).toBe(2025);
      expect(start.getMonth()).toBe(10);
    });
  });

  describe('monthsBetween', () => {
    it('returns 0 for the same month', () => {
      expect(monthsBetween(new Date(2026, 0, 1), new Date(2026, 0, 31))).toBe(0);
    });

    it('counts whole months between two dates', () => {
      expect(monthsBetween(new Date(2026, 0, 1), new Date(2026, 1, 15))).toBe(1);
      expect(monthsBetween(new Date(2025, 10, 15), new Date(2026, 1, 1))).toBe(3);
    });
  });
});
