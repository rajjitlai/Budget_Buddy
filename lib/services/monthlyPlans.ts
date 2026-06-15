
import { getDatabase } from '@/lib/database/sqlite';
import { MonthlyPlan } from '@/lib/types';
import * as Crypto from 'expo-crypto';

/**
 * Get current monthly plan
 */
export async function getCurrentMonthlyPlan(): Promise<MonthlyPlan | null> {
  const now = new Date();
  const month = now.toLocaleString('default', { month: 'long' });
  const year = now.getFullYear();

  return getMonthlyPlan(month, year);
}

/**
 * Get monthly plan for a specific month and year
 */
export async function getMonthlyPlan(month: string, year: number): Promise<MonthlyPlan | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<any>(
    'SELECT * FROM monthly_plans WHERE month = ? AND year = ?',
    [month, year]
  );

  if (!row) return null;

  return {
    salary: row.salary,
    essentials: JSON.parse(row.essentials),
    allocations: JSON.parse(row.allocations),
  };
}

/**
 * Create or update a monthly plan
 */
export async function saveMonthlyPlan(
  month: string,
  year: number,
  planData: MonthlyPlan
): Promise<void> {
  const db = await getDatabase();
  const id = Crypto.randomUUID();

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
export async function getAllMonthlyPlans(): Promise<any[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>('SELECT * FROM monthly_plans');
  return rows.map(row => ({
    ...row,
    essentials: JSON.parse(row.essentials),
    allocations: JSON.parse(row.allocations),
  }));
}

/**
 * Delete a specific monthly plan
 */
export async function deleteMonthlyPlan(month: string, year: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'DELETE FROM monthly_plans WHERE month = ? AND year = ?',
    [month, year]
  );
}

/**
 * Delete the currently applied monthly plan
 */
export async function deleteCurrentMonthlyPlan(): Promise<void> {
  const now = new Date();
  const month = now.toLocaleString('default', { month: 'long' });
  const year = now.getFullYear();

  await deleteMonthlyPlan(month, year);
}
