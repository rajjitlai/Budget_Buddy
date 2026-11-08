
import * as SQLite from 'expo-sqlite';
import { getDatabase, runInTransaction, TransactionRow } from '@/lib/database/sqlite';
import type { SQLiteBindValue } from 'expo-sqlite';
import { Transaction, formatCurrency } from '@/lib/types';
import { getCurrentMonthlyPlan } from './monthlyPlans';
import * as Crypto from 'expo-crypto';

/**
 * Get all transactions
 */
export async function getTransactions(
  options?: {
    accountId?: string;
    type?: Transaction['type'];
    limit?: number;
    offset?: number;
  }
): Promise<Transaction[]> {
  const db = await getDatabase();
  let query = 'SELECT * FROM transactions';
  const params: SQLiteBindValue[] = [];
  const conditions: string[] = [];

  if (options?.accountId) {
    conditions.push('(source_account_id = ? OR destination_account_id = ?)');
    params.push(options.accountId, options.accountId);
  }

  if (options?.type) {
    conditions.push('type = ?');
    params.push(options.type);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY date DESC';

  if (options?.limit) {
    query += ' LIMIT ?';
    params.push(options.limit);
  }

  if (options?.offset) {
    // SQLite requires LIMIT before OFFSET; LIMIT -1 means "no limit".
    query += options?.limit ? ' OFFSET ?' : ' LIMIT -1 OFFSET ?';
    params.push(options.offset);
  }

  const results = await db.getAllAsync<TransactionRow>(query, params);

  return results.map(row => ({
    id: row.id,
    amount: row.amount,
    category: row.category,
    sourceAccountId: row.source_account_id,
    destinationAccountId: row.destination_account_id,
    notes: row.notes,
    date: row.date,
    type: row.type as Transaction['type'],
  }));
}

/**
 * Get a single transaction by ID
 */
export async function getTransaction(transactionId: string): Promise<Transaction> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<TransactionRow>('SELECT * FROM transactions WHERE id = ?', [transactionId]);
  
  if (!row) {
    throw new Error('Transaction not found');
  }

  return {
    id: row.id,
    amount: row.amount,
    category: row.category,
    sourceAccountId: row.source_account_id,
    destinationAccountId: row.destination_account_id,
    notes: row.notes,
    date: row.date,
    type: row.type as Transaction['type'],
  };
}

/**
 * Calculate balance changes for a transaction
 */
function calculateBalanceChanges(
  type: Transaction['type'],
  amount: number,
  sourceAccountId: string,
  destinationAccountId?: string | null
): { accountId: string; balanceChange: number }[] {
  const changes: { accountId: string; balanceChange: number }[] = [];

  switch (type) {
    case 'expense':
      changes.push({ accountId: sourceAccountId, balanceChange: -amount });
      break;
    case 'income':
      changes.push({ accountId: sourceAccountId, balanceChange: amount });
      break;
    case 'transfer':
      if (destinationAccountId) {
        changes.push({ accountId: sourceAccountId, balanceChange: -amount });
        changes.push({ accountId: destinationAccountId, balanceChange: amount });
      }
      break;
  }

  return changes;
}

/**
 * Apply balance deltas atomically inside an open transaction.
 * Negative deltas are guarded against overdrafts when `rejectNegative` is set.
 */
async function applyBalanceChanges(
  db: SQLite.SQLiteDatabase,
  changes: { accountId: string; balanceChange: number }[],
  rejectNegative: boolean
): Promise<void> {
  const lastUpdated = new Date().toISOString();

  for (const change of changes) {
    if (rejectNegative && change.balanceChange < 0) {
      const res = await db.runAsync(
        'UPDATE accounts SET balance = balance + ?, last_updated = ? WHERE id = ? AND balance + ? >= 0',
        [change.balanceChange, lastUpdated, change.accountId, change.balanceChange]
      );
      if (res.changes === 0) {
        const account = await db.getFirstAsync<{ name: string }>(
          'SELECT name FROM accounts WHERE id = ?',
          [change.accountId]
        );
        if (!account) throw new Error('Account not found');
        throw new Error(`Insufficient balance in ${account.name}`);
      }
    } else {
      const res = await db.runAsync(
        'UPDATE accounts SET balance = balance + ?, last_updated = ? WHERE id = ?',
        [change.balanceChange, lastUpdated, change.accountId]
      );
      if (res.changes === 0) {
        throw new Error('Account not found');
      }
    }
  }
}

/** First day of the month containing `date`, as YYYY-MM-DD. */
function monthStart(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
}

/**
 * Create a new transaction and update account balances
 */
export async function createTransaction(
  transactionData: Omit<Transaction, 'id'>
): Promise<Transaction & { warning?: string }> {
  const id = Crypto.randomUUID();
  const rejectNegative =
    transactionData.type === 'expense' || transactionData.type === 'transfer';

  const result = await runInTransaction(async (db) => {
    // 1. Insert transaction
    await db.runAsync(
      'INSERT INTO transactions (id, amount, category, source_account_id, destination_account_id, notes, date, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        transactionData.amount,
        transactionData.category,
        transactionData.sourceAccountId,
        transactionData.destinationAccountId || null,
        transactionData.notes,
        transactionData.date,
        transactionData.type,
      ]
    );

    // 2. Calculate and apply balance changes
    const balanceChanges = calculateBalanceChanges(
      transactionData.type,
      transactionData.amount,
      transactionData.sourceAccountId,
      transactionData.destinationAccountId
    );

    await applyBalanceChanges(db, balanceChanges, rejectNegative);

    return {
      id,
      ...transactionData,
    };
  });

  // 3. Budget alert check — read-only queries, kept outside the write transaction
  if (transactionData.type === 'expense') {
    try {
      const plan = await getCurrentMonthlyPlan();
      if (plan) {
        const db = await getDatabase();
        const now = new Date();
        const row = await db.getFirstAsync<{ total: number | null }>(
          "SELECT SUM(amount) AS total FROM transactions WHERE type = 'expense' AND date >= ? AND date < ?",
          [monthStart(now), monthStart(new Date(now.getFullYear(), now.getMonth() + 1, 1))]
        );
        const currentMonthSpent = row?.total ?? 0;

        const totalBudget = plan.allocations.spending + Object.values(plan.essentials).reduce((a, b) => a + b, 0);

        if (currentMonthSpent > totalBudget) {
          result.warning = `Budget exceeded by ${formatCurrency(currentMonthSpent - totalBudget)}`;
        } else if (currentMonthSpent > totalBudget * 0.9) {
          result.warning = `90% of monthly budget reached (${formatCurrency(totalBudget - currentMonthSpent)} remaining)`;
        }
      }
    } catch (err) {
      console.error('Error checking budget alert:', err);
    }
  }

  return result;
}

/**
 * Update an existing transaction
 */
export async function updateTransaction(
  transactionId: string,
  updates: Partial<Omit<Transaction, 'id'>>
): Promise<void> {
  return await runInTransaction(async (db) => {
    const existing = await getTransaction(transactionId);
    
    // 1. Reverse old balance changes
    const oldChanges = calculateBalanceChanges(
      existing.type,
      existing.amount,
      existing.sourceAccountId,
      existing.destinationAccountId
    );

    await applyBalanceChanges(
      db,
      oldChanges.map((c) => ({ ...c, balanceChange: -c.balanceChange })),
      false
    );

    // 2. Update transaction record
    const finalType = updates.type ?? existing.type;
    const finalAmount = updates.amount ?? existing.amount;
    const finalSourceAccountId = updates.sourceAccountId ?? existing.sourceAccountId;
    const finalDestinationAccountId = updates.destinationAccountId ?? existing.destinationAccountId;
    const finalNotes = updates.notes ?? existing.notes;
    const finalDate = updates.date ?? existing.date;
    const finalCategory = updates.category ?? existing.category;

    await db.runAsync(
      'UPDATE transactions SET amount = ?, category = ?, source_account_id = ?, destination_account_id = ?, notes = ?, date = ?, type = ? WHERE id = ?',
      [
        finalAmount,
        finalCategory,
        finalSourceAccountId,
        finalDestinationAccountId || null,
        finalNotes,
        finalDate,
        finalType,
        transactionId
      ]
    );

    // 3. Apply new balance changes
    const newChanges = calculateBalanceChanges(
      finalType,
      finalAmount,
      finalSourceAccountId,
      finalDestinationAccountId
    );

    await applyBalanceChanges(
      db,
      newChanges,
      finalType === 'expense' || finalType === 'transfer'
    );
  });
}

/**
 * Delete a transaction and reverse its balance changes
 */
export async function deleteTransaction(transactionId: string): Promise<void> {
  return await runInTransaction(async (db) => {
    const transaction = await getTransaction(transactionId);

    const balanceChanges = calculateBalanceChanges(
      transaction.type,
      transaction.amount,
      transaction.sourceAccountId,
      transaction.destinationAccountId
    );

    await applyBalanceChanges(
      db,
      balanceChanges.map((c) => ({ ...c, balanceChange: -c.balanceChange })),
      false
    );

    await db.runAsync('DELETE FROM transactions WHERE id = ?', [transactionId]);
  });
}
