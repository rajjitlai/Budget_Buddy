
import * as SQLite from 'expo-sqlite';

const DB_NAME = 'budget_buddy.db';

// Bump when adding a migration step in runMigrations().
const DB_SCHEMA_VERSION = 2;

/** Typed views over raw SQLite rows (field types as stored on disk). */
export interface AccountRow {
  id: string;
  name: string;
  type: string;
  balance: number;
  icon: string;
  color: string;
}

export interface TransactionRow {
  id: string;
  amount: number;
  category: string;
  source_account_id: string;
  destination_account_id: string | null;
  notes: string | null;
  date: string;
  type: string;
}

export interface LoanRow {
  id: string;
  name: string;
  type: string;
  principal: number;
  remaining: number;
  interest_rate: number;
  due_date: string | null;
  lender_borrower: string | null;
  notes: string | null;
  created_at: string;
}

export interface NotificationRow {
  id: string;
  title: string;
  body: string;
  type: string;
  read: number;
  created_at: string;
}

export interface MonthlyPlanRow {
  id: string;
  salary: number;
  essentials: string;
  allocations: string;
  month: string;
  year: number;
}

export interface ChatMessageRow {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Initialize the database (idempotent, race-safe).
 * Concurrent callers share a single open/create sequence.
 */
export function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);

      // Enable foreign keys
      await db.execAsync('PRAGMA foreign_keys = ON;');

      // Create tables (baseline schema — always idempotent)
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS accounts (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          balance REAL NOT NULL DEFAULT 0,
          icon TEXT NOT NULL,
          color TEXT NOT NULL,
          last_updated TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS transactions (
          id TEXT PRIMARY KEY NOT NULL,
          amount REAL NOT NULL,
          category TEXT NOT NULL,
          source_account_id TEXT NOT NULL,
          destination_account_id TEXT,
          notes TEXT,
          date TEXT NOT NULL,
          type TEXT NOT NULL,
          FOREIGN KEY (source_account_id) REFERENCES accounts (id) ON DELETE CASCADE,
          FOREIGN KEY (destination_account_id) REFERENCES accounts (id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS monthly_plans (
          id TEXT PRIMARY KEY NOT NULL,
          salary REAL NOT NULL DEFAULT 0,
          essentials TEXT NOT NULL, -- JSON string
          allocations TEXT NOT NULL, -- JSON string
          month TEXT NOT NULL,
          year INTEGER NOT NULL,
          UNIQUE(month, year)
        );

        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS loans (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          principal REAL NOT NULL,
          remaining REAL NOT NULL,
          interest_rate REAL NOT NULL DEFAULT 0,
          due_date TEXT,
          lender_borrower TEXT,
          notes TEXT,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS notifications (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          body TEXT NOT NULL,
          type TEXT NOT NULL,
          read INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS chat_messages (
          id TEXT PRIMARY KEY NOT NULL,
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
      `);

      await runMigrations(db);

      if (__DEV__) {
        console.log('Database initialized successfully');
      }
      return db;
    })().catch((err) => {
      // Allow retry on next call after a failed open
      dbPromise = null;
      throw err;
    });
  }
  return dbPromise;
}

/**
 * Forward-only migrations guarded by PRAGMA user_version.
 * Existing installs start at 0 and pick up every step they haven't run yet.
 */
async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let current = row?.user_version ?? 0;

  if (current < 1) {
    // v1: indexes — every read currently full-scans + sorts
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
      CREATE INDEX IF NOT EXISTS idx_transactions_source ON transactions(source_account_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_dest ON transactions(destination_account_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_type_date ON transactions(type, date);
      CREATE INDEX IF NOT EXISTS idx_monthly_plans_ym ON monthly_plans(year, month);
      CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
      CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);
      CREATE INDEX IF NOT EXISTS idx_chat_created ON chat_messages(created_at);
    `);
    await db.execAsync(`PRAGMA user_version = 1`);
    current = 1;
  }

  if (current < 2) {
    // v2: monthly_plans.month stored locale-dependent names ("November").
    // Convert to locale-independent "YYYY-MM" keys.
    const ENGLISH_MONTHS = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    const rows = await db.getAllAsync<{ id: string; month: string; year: number }>(
      'SELECT id, month, year FROM monthly_plans'
    );
    for (const row of rows) {
      if (/^\d{4}-\d{2}$/.test(row.month)) continue;
      // Prefer an exact English name match, then try regenerating the name
      // with this device's locale (rows were written on this device).
      let monthNum = ENGLISH_MONTHS.indexOf(row.month) + 1;
      if (monthNum === 0) {
        for (let i = 0; i < 12; i++) {
          if (new Date(2000, i, 1).toLocaleString('default', { month: 'long' }) === row.month) {
            monthNum = i + 1;
            break;
          }
        }
      }
      if (monthNum > 0) {
        const key = `${row.year}-${String(monthNum).padStart(2, '0')}`;
        await db.runAsync('UPDATE monthly_plans SET month = ? WHERE id = ?', [key, row.id]);
      }
    }
    await db.execAsync(`PRAGMA user_version = ${DB_SCHEMA_VERSION}`);
    current = DB_SCHEMA_VERSION;
  }

  // Future migrations: if (current < 3) { ...; await db.execAsync('PRAGMA user_version = 3'); }
}

/**
 * Get the database instance
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  return initDatabase();
}

/**
 * Helper to run a transaction
 */
export async function runInTransaction<T>(
  action: (db: SQLite.SQLiteDatabase) => Promise<T>
): Promise<T> {
  const database = await getDatabase();
  let result: T;
  await database.withTransactionAsync(async () => {
    result = await action(database);
  });
  return result!;
}
