
import { getDatabase, MonthlyPlanRow } from '@/lib/database/sqlite';
import { MonthlyPlan } from '@/lib/types';
import * as Crypto from 'expo-crypto';

/**
 * Canonical, locale-independent month key: "YYYY-MM".
 * (Replaces the old locale month names like "November", which changed with device language.)
 */
export function monthKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Get current monthly plan
 */
export async function getCurrentMonthlyPlan(): Promise<MonthlyPlan | null> {
  return getMonthlyPlan(monthKey());
}

/**
 * Get monthly plan for a specific month key ("YYYY-MM")
 */
export async function getMonthlyPlan(month: string): Promise<MonthlyPlan | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<MonthlyPlanRow>(
    'SELECT * FROM monthly_plans WHERE month = ?',
    [month]
  );

  if (!row) return null;

  return {
    salary: row.salary,
    essentials: JSON.parse(row.essentials),
    allocations: JSON.parse(row.allocations),
  };
}

/**
 * Create or update a monthly plan (keyed by "YYYY-MM")
 */
export async function saveMonthlyPlan(
  month: string,
  planData: MonthlyPlan
): Promise<void> {
  const db = await getDatabase();
  const id = Crypto.randomUUID();
  const year = Number(month.slice(0, 4));

  await db.runAsync(
    `INSERT INTO monthly_plans (id, salary, essentials, allocations, month, year)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(month, year) DO UPDATE SET
     salary = excluded.salary,
     essentials = excluded.essentials,
     allocations = excluded.allocations`,
    [
      id,
      planData.salary,
      JSON.stringify(planData.essentials),
      JSON.stringify(planData.allocations),
      month,
      year,
    ]
  );
}

/**
 * Get all monthly plans (for export)
 */
export interface StoredMonthlyPlan {
  id: string;
  salary: number;
  essentials: Record<string, number>;
  allocations: Record<string, number>;
  month: string;
  year: number;
}

export async function getAllMonthlyPlans(): Promise<StoredMonthlyPlan[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<MonthlyPlanRow>('SELECT * FROM monthly_plans');
  return rows.map(row => ({
    id: row.id,
    salary: row.salary,
    essentials: JSON.parse(row.essentials) as Record<string, number>,
    allocations: JSON.parse(row.allocations) as Record<string, number>,
    month: row.month,
    year: row.year,
  }));
}

/**
 * Delete a specific monthly plan (keyed by "YYYY-MM")
 */
export async function deleteMonthlyPlan(month: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM monthly_plans WHERE month = ?', [month]);
}

/**
 * Delete the currently applied monthly plan
 */
export async function deleteCurrentMonthlyPlan(): Promise<void> {
  await deleteMonthlyPlan(monthKey());
}
