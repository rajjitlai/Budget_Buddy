/**
 * Service-layer SQL smoke test. expo-sqlite is replaced by a recording fake
 * (jest-expo does not ship a real in-memory DB), so we verify the SQL text
 * each service emits, the bound parameters, and the row -> domain mapping.
 */
/* eslint-disable import/first */
interface MockDb {
  calls: { method: string; source: string; params?: unknown[] }[];
  mockFirst: Map<string, unknown | null>;
  mockAll: Map<string, unknown[]>;
  runAsync: jest.Mock<Promise<unknown>, [string, unknown[]?]>;
  getFirstAsync: jest.Mock<Promise<unknown>, [string, unknown[]?]>;
  getAllAsync: jest.Mock<Promise<unknown>, [string, unknown[]?]>;
  execAsync: jest.Mock<Promise<unknown>, [string]>;
  withTransactionAsync: jest.Mock<Promise<unknown>, [() => Promise<void>]>;
}

function createMockDb(): MockDb {
  const mockDb: MockDb = {
    calls: [] as { method: string; source: string; params?: unknown[] }[],
    mockFirst: new Map(),
    mockAll: new Map(),
    runAsync: jest.fn(async (source: string, params?: unknown[]) => {
      mockDb.calls.push({ method: 'runAsync', source, params });
      return {};
    }),
    getFirstAsync: jest.fn(async (source: string, params?: unknown[]) => {
      mockDb.calls.push({ method: 'getFirstAsync', source, params });
      return mockDb.mockFirst.get(source) ?? null;
    }),
    getAllAsync: jest.fn(async (source: string, params?: unknown[]) => {
      mockDb.calls.push({ method: 'getAllAsync', source, params });
      return mockDb.mockAll.get(source) ?? [];
    }),
    execAsync: jest.fn(async (source: string) => {
      mockDb.calls.push({ method: 'execAsync', source });
    }),
    withTransactionAsync: jest.fn(async (fn: () => Promise<void>) => {
      await fn();
    }),
  };
  return mockDb;
}

let mockDb: MockDb;

jest.mock('../sqlite', () => ({
  __esModule: true,
  getDatabase: jest.fn(async () => mockDb),
  runInTransaction: jest.fn(async (fn: () => Promise<void>) => {
    await mockDb.withTransactionAsync(fn);
  }),
  DB_SCHEMA_VERSION: 2,
}));

import { getTransactions, getTransaction } from '../../services/transactions';
import * as accountsService from '../../services/accounts';
import { getLoans } from '../../services/loans';

beforeEach(() => {
  mockDb = createMockDb();
  mockDb.calls.length = 0;
});

describe('service SQL', () => {
  it('getTransactions reads from transactions ordered by date DESC', async () => {
    mockDb.mockAll.set('SELECT * FROM transactions ORDER BY date DESC', [
      {
        id: 't1',
        amount: 450,
        category: 'Food',
        source_account_id: 'a1',
        destination_account_id: null,
        notes: 'lunch',
        date: '2026-11-01',
        type: 'expense',
      },
    ]);
    const result = await getTransactions();
    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      'SELECT * FROM transactions ORDER BY date DESC',
      [],
    );
    expect(result[0].sourceAccountId).toBe('a1');
    expect(result[0].destinationAccountId).toBeNull();
    expect(result[0].type).toBe('expense');
  });

  it('getTransactions appends type filter params', async () => {
    mockDb.mockAll.set('SELECT * FROM transactions WHERE type = ? ORDER BY date DESC', []);
    await getTransactions({ type: 'income' });
    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      'SELECT * FROM transactions WHERE type = ? ORDER BY date DESC',
      ['income'],
    );
  });

  it('getTransactions adds LIMIT -1 before OFFSET when no limit given', async () => {
    mockDb.mockAll.set('SELECT * FROM transactions ORDER BY date DESC LIMIT -1 OFFSET ?', []);
    await getTransactions({ offset: 3 });
    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      'SELECT * FROM transactions ORDER BY date DESC LIMIT -1 OFFSET ?',
      [3],
    );
  });

  it('getTransaction throws for a missing row', async () => {
    await expect(getTransaction('missing')).rejects.toThrow('Transaction not found');
  });

  it('getAccounts orders by name asc', async () => {
    mockDb.mockAll.set('SELECT * FROM accounts ORDER BY name ASC', [
      { id: 'a1', name: 'Bank', type: 'Savings', balance: 10, icon: '🏦', color: '#fff' },
    ]);
    const accounts = await accountsService.getAccounts();
    expect(accounts[0].name).toBe('Bank');
  });

  it('updateAccount only writes provided fields', async () => {
    await accountsService.updateAccount('a1', { name: 'New Name' });
    const updateCall = (mockDb.runAsync.mock.calls as [string, unknown[]][]).find((args) =>
      String(args[0]).includes('UPDATE accounts SET'),
    );
    expect(updateCall).toBeDefined();
    expect(updateCall![0]).toContain('name = ?');
    expect(updateCall![0]).toContain('last_updated = ?');
    expect(updateCall![0]).not.toContain('balance = ?');
    expect(updateCall![1]).toEqual(['New Name', expect.any(String), 'a1']);
  });

  it('getLoans maps loan rows to the domain shape', async () => {
    mockDb.mockAll.set('SELECT * FROM loans ORDER BY created_at DESC', [
      {
        id: 'l1',
        name: 'Loan 1',
        type: 'borrowed',
        principal: 1000,
        remaining: 500,
        interest_rate: 5,
        due_date: null,
        lender_borrower: 'Bank',
        notes: null,
        created_at: '2026-01-01',
      },
    ]);
    const loans = await getLoans();
    expect(loans[0].interestRate).toBe(5);
    expect(loans[0].dueDate).toBeUndefined();
  });
});
