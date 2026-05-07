
import { getDatabase, runInTransaction } from '@/lib/database/sqlite';
import { Transaction } from '@/lib/mockData';
import { getAccount, updateAccountBalance } from './accounts';
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
  const params: any[] = [];
  const conditions: string[] = [];

  if (options?.accountId) {
    conditions.push('source_account_id = ? OR destination_account_id = ?');
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
    query += ' OFFSET ?';
    params.push(options.offset);
  }

  const results = await db.getAllAsync<any>(query, params);
  
  return results.map(row => ({
    id: row.id,
    amount: row.amount,
    category: row.category,
    sourceAccountId: row.source_account_id,
    destinationAccountId: row.destination_account_id,
    notes: row.notes,
    date: row.date,
    type: row.type,
  }));
}

/**
 * Get a single transaction by ID
 */
export async function getTransaction(transactionId: string): Promise<Transaction> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<any>('SELECT * FROM transactions WHERE id = ?', [transactionId]);
  
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
    type: row.type,
  };
}

/**
 * Calculate balance changes for a transaction
 */
function calculateBalanceChanges(
  type: Transaction['type'],
  amount: number,
  sourceAccountId: string,
  destinationAccountId?: string
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
 * Create a new transaction and update account balances
 */
export async function createTransaction(
  transactionData: Omit<Transaction, 'id'>
): Promise<Transaction> {
  const id = Crypto.randomUUID();

  return await runInTransaction(async (db) => {
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

    for (const change of balanceChanges) {
      const account = await getAccount(change.accountId);
      const newBalance = account.balance + change.balanceChange;
      
      if (newBalance < 0 && (transactionData.type === 'expense' || transactionData.type === 'transfer')) {
        throw new Error(`Insufficient balance in ${account.name}`);
      }

      await updateAccountBalance(change.accountId, newBalance);
    }

    return {
      id,
      ...transactionData,
    };
  });
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

    for (const change of oldChanges) {
      const account = await getAccount(change.accountId);
      await updateAccountBalance(change.accountId, account.balance - change.balanceChange);
    }

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

    for (const change of newChanges) {
      const account = await getAccount(change.accountId);
      const newBalance = account.balance + change.balanceChange;
      
      if (newBalance < 0 && (finalType === 'expense' || finalType === 'transfer')) {
        throw new Error(`Insufficient balance in ${account.name}`);
      }

      await updateAccountBalance(change.accountId, newBalance);
    }
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

    for (const change of balanceChanges) {
      const account = await getAccount(change.accountId);
      await updateAccountBalance(change.accountId, account.balance - change.balanceChange);
    }

    await db.runAsync('DELETE FROM transactions WHERE id = ?', [transactionId]);
  });
}
