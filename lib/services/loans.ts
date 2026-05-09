import { getDatabase } from '@/lib/database/sqlite';
import * as Crypto from 'expo-crypto';

export interface Loan {
  id: string;
  name: string;
  type: 'borrowed' | 'lent';
  principal: number;
  remaining: number;
  interestRate: number;
  dueDate?: string;
  lenderBorrower?: string;
  notes?: string;
  createdAt: string;
}

export async function getLoans(): Promise<Loan[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>('SELECT * FROM loans ORDER BY created_at DESC');
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
  await db.runAsync(
    `UPDATE loans SET name=?, type=?, principal=?, remaining=?, interest_rate=?, due_date=?, lender_borrower=?, notes=? WHERE id=?`,
    [data.name ?? '', data.type ?? 'borrowed', data.principal ?? 0, data.remaining ?? 0, data.interestRate ?? 0, data.dueDate ?? null, data.lenderBorrower ?? null, data.notes ?? null, id]
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

function rowToLoan(row: any): Loan {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    principal: row.principal,
    remaining: row.remaining,
    interestRate: row.interest_rate,
    dueDate: row.due_date ?? undefined,
    lenderBorrower: row.lender_borrower ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}
