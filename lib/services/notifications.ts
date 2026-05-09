import { getDatabase } from '@/lib/database/sqlite';
import * as Crypto from 'expo-crypto';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'warning' | 'success' | 'info';
  read: boolean;
  createdAt: string;
}

export async function getNotifications(): Promise<AppNotification[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>('SELECT * FROM notifications ORDER BY created_at DESC');
  return rows.map(rowToNotification);
}

export async function getUnreadCount(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM notifications WHERE read=0');
  return row?.count ?? 0;
}

export async function markAsRead(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE notifications SET read=1 WHERE id=?', [id]);
}

export async function markAllAsRead(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE notifications SET read=1');
}

export async function deleteNotification(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM notifications WHERE id=?', [id]);
}

export async function clearAllNotifications(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM notifications');
}

export async function createNotification(data: Omit<AppNotification, 'id' | 'read' | 'createdAt'>): Promise<void> {
  const db = await getDatabase();
  const id = Crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await db.runAsync(
    'INSERT INTO notifications (id, title, body, type, read, created_at) VALUES (?, ?, ?, ?, 0, ?)',
    [id, data.title, data.body, data.type, createdAt]
  );
}

/**
 * Generate alert notifications based on current financial data.
 * Deduplicates by checking for existing notifications with same title created today.
 */
export async function generateAlerts(params: {
  salary: number;
  monthlyExpenses: number;
  savingsRate: number;
  categoryBreakdown: { category: string; amount: number }[];
  totalExpenses: number;
  hasTransactionsThisMonth: boolean;
}): Promise<void> {
  const db = await getDatabase();
  const todayPrefix = new Date().toISOString().slice(0, 10);

  const existingToday = await db.getAllAsync<{ title: string }>(
    `SELECT title FROM notifications WHERE created_at LIKE ?`,
    [`${todayPrefix}%`]
  );
  const existingTitles = new Set(existingToday.map((r) => r.title));

  const alerts: Omit<AppNotification, 'id' | 'read' | 'createdAt'>[] = [];

  const { salary, monthlyExpenses, savingsRate, categoryBreakdown, totalExpenses, hasTransactionsThisMonth } = params;

  if (!hasTransactionsThisMonth) {
    alerts.push({
      title: 'No Transactions This Month',
      body: 'You haven\'t recorded any transactions yet this month. Keep your budget on track!',
      type: 'info',
    });
  }

  if (salary > 0 && monthlyExpenses > salary * 0.8) {
    alerts.push({
      title: 'High Spending Alert',
      body: `You've spent ${Math.round((monthlyExpenses / salary) * 100)}% of your monthly income. Consider cutting back on discretionary expenses.`,
      type: 'warning',
    });
  }

  if (totalExpenses > 0) {
    const topCategory = categoryBreakdown[0];
    if (topCategory && topCategory.amount > totalExpenses * 0.5) {
      alerts.push({
        title: `High Spend: ${topCategory.category}`,
        body: `"${topCategory.category}" accounts for over 50% of your total expenses. Consider reviewing this category.`,
        type: 'warning',
      });
    }
  }

  if (savingsRate >= 20) {
    alerts.push({
      title: 'Great Savings Rate!',
      body: `You're saving ${savingsRate}% of your income this month. Excellent financial discipline!`,
      type: 'success',
    });
  }

  for (const alert of alerts) {
    if (!existingTitles.has(alert.title)) {
      await createNotification(alert);
    }
  }
}

function rowToNotification(row: any): AppNotification {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    type: row.type,
    read: row.read === 1,
    createdAt: row.created_at,
  };
}
