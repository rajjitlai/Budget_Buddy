import { MonthKey } from '@/lib/utils/categorizer';

/** True when the date falls in the same calendar month as `reference` (default: now). */
export function isSameMonth(date: Date | string, reference: Date = new Date()): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getFullYear() === reference.getFullYear() && d.getMonth() === reference.getMonth();
}

/** MonthKey components for a date (default: now). */
export function toMonthKey(date: Date = new Date()): MonthKey {
  return { year: date.getFullYear(), month: date.getMonth() };
}

/** First day of the month `deltaMonths` away from `date` (default: same month). */
export function monthStart(date: Date, deltaMonths = 0): Date {
  return new Date(date.getFullYear(), date.getMonth() + deltaMonths, 1);
}

/** Whole calendar months from `earlier` to `later` (negative when earlier is after later). */
export function monthsBetween(earlier: Date, later: Date): number {
  return (later.getFullYear() - earlier.getFullYear()) * 12 + (later.getMonth() - earlier.getMonth());
}
