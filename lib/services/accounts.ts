
import { getDatabase } from '@/lib/database/sqlite';
import { Account } from '@/lib/mockData';
import * as Crypto from 'expo-crypto';

/**
 * Get all accounts
 */
export async function getAccounts(): Promise<Account[]> {
  const db = await getDatabase();
  const results = await db.getAllAsync<any>('SELECT * FROM accounts ORDER BY name ASC');
  
  return results.map(row => ({
    id: row.id,
    name: row.name,
    type: row.type,
    balance: row.balance,
    icon: row.icon,
    color: row.color,
  }));
}

/**
 * Get a single account by ID
 */
export async function getAccount(accountId: string): Promise<Account> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<any>('SELECT * FROM accounts WHERE id = ?', [accountId]);
  
  if (!result) {
    throw new Error('Account not found');
  }

  return {
    id: result.id,
    name: result.name,
    type: result.type,
    balance: result.balance,
    icon: result.icon,
    color: result.color,
  };
}

/**
 * Create a new account
 */
export async function createAccount(accountData: Omit<Account, 'id'>): Promise<Account> {
  const db = await getDatabase();
  const id = Crypto.randomUUID();
  const lastUpdated = new Date().toISOString();

  await db.runAsync(
    'INSERT INTO accounts (id, name, type, balance, icon, color, last_updated) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, accountData.name, accountData.type, accountData.balance, accountData.icon, accountData.color, lastUpdated]
  );

  return {
    id,
    ...accountData,
  };
}

/**
 * Update an account
 */
export async function updateAccount(
  accountId: string,
  updates: Partial<Omit<Account, 'id'>>
): Promise<void> {
  const db = await getDatabase();
  const lastUpdated = new Date().toISOString();

  // Build dynamic update query
  const fields = Object.keys(updates);
  if (fields.length === 0) return;

  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const values = [...Object.values(updates), lastUpdated, accountId];

  await db.runAsync(
    `UPDATE accounts SET ${setClause}, last_updated = ? WHERE id = ?`,
    values
  );
}

/**
 * Update account balance directly
 */
export async function updateAccountBalance(
  accountId: string,
  newBalance: number
): Promise<void> {
  const db = await getDatabase();
  const lastUpdated = new Date().toISOString();

  await db.runAsync(
    'UPDATE accounts SET balance = ?, last_updated = ? WHERE id = ?',
    [newBalance, lastUpdated, accountId]
  );
}

/**
 * Delete an account
 */
export async function deleteAccount(accountId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM accounts WHERE id = ?', [accountId]);
}
