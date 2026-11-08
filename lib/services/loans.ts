import { getDatabase, LoanRow } from '@/lib/database/sqlite';
import type { SQLiteBindValue } from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import type { Loan } from '@/lib/types';

export async function getLoans(): Promise<Loan[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<LoanRow>('SELECT * FROM loans ORDER BY created_at DESC');
  return rows.map(rowToLoan);
}

export async function createLoan(data: Omit<Loan, 'id' | 'createdAt'>): Promise<Loan> {
  const db = await getDatabase();
  const id = Crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO loans (id, name, type, principal, remaining, interest_rate, due_date, lender_borrower, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, data.name, data.type, data.principal, data.remaining, data.interestRate, data.dueDate ?? null, data.lenderBorrower ?? null, data.notes ?? null, createdAt]
  );
  return { ...data, id, createdAt };
}

export async function updateLoan(id: string, data: Partial<Omit<Loan, 'id' | 'createdAt'>>): Promise<void> {
  const db = await getDatabase();
  const fieldMap: Record<string, string> = {
    name: 'name',
    type: 'type',
    principal: 'principal',
    remaining: 'remaining',
    interestRate: 'interest_rate',
    dueDate: 'due_date',
    lenderBorrower: 'lender_borrower',
    notes: 'notes',
  };

  const setClauses: string[] = [];
  const values: SQLiteBindValue[] = [];

  for (const [key, dbColumn] of Object.entries(fieldMap)) {
    const field = key as keyof typeof data;
    if (field in data) {
      setClauses.push(`${dbColumn} = ?`);
      values.push((data[field] ?? null) as SQLiteBindValue);
    }
  }

  if (setClauses.length === 0) return;

  values.push(id);
  await db.runAsync(
    `UPDATE loans SET ${setClauses.join(', ')} WHERE id = ?`,
    values
  );
}

export async function deleteLoan(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM loans WHERE id=?', [id]);
}

export async function recordRepayment(id: string, amount: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE loans SET remaining = MAX(0, remaining - ?) WHERE id=?', [amount, id]);
}

function rowToLoan(row: LoanRow): Loan {
  return {
    id: row.id,
    name: row.name,
    type: row.type as Loan['type'],
    principal: row.principal,
    remaining: row.remaining,
    interestRate: row.interest_rate,
    dueDate: row.due_date ?? undefined,
    lenderBorrower: row.lender_borrower ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}
