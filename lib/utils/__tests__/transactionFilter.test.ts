import { filterTransactions } from '../transactionFilter';
import { Transaction, Account } from '../../types';

const accounts: Account[] = [
  { id: 'a1', name: 'Cash Wallet', type: 'Spending', balance: 100, icon: '💵', color: '#ff0000' },
  { id: 'a2', name: 'Bank Account', type: 'Savings', balance: 500, icon: '🏦', color: '#00ff00' },
];

const transactions: Transaction[] = [
  {
    id: 't1',
    amount: 450,
    category: 'Food',
    sourceAccountId: 'a1',
    notes: 'Lunch at cafe',
    date: '2026-11-01T00:00:00.000Z',
    type: 'expense',
  },
  {
    id: 't2',
    amount: 200,
    category: 'Fuel',
    sourceAccountId: 'a1',
    notes: null,
    date: '2026-11-02T00:00:00.000Z',
    type: 'expense',
  },
  {
    id: 't3',
    amount: 3000,
    category: 'Salary',
    sourceAccountId: 'a2',
    notes: 'Monthly paycheck',
    date: '2026-11-01T00:00:00.000Z',
    type: 'income',
  },
];

describe('filterTransactions', () => {
  it('returns all transactions with empty filters', () => {
    const result = filterTransactions(transactions, accounts, {
      type: 'all',
      account: 'all',
      query: '',
    });
    expect(result).toHaveLength(3);
  });

  it('filters by type', () => {
    const result = filterTransactions(transactions, accounts, {
      type: 'income',
      account: 'all',
      query: '',
    });
    expect(result.map((t) => t.id)).toEqual(['t3']);
  });

  it('filters by account', () => {
    const result = filterTransactions(transactions, accounts, {
      type: 'all',
      account: 'a1',
      query: '',
    });
    expect(result.map((t) => t.id)).toEqual(['t1', 't2']);
  });

  it('searches category case-insensitively', () => {
    const result = filterTransactions(transactions, accounts, {
      type: 'all',
      account: 'all',
      query: 'FUEL',
    });
    expect(result.map((t) => t.id)).toEqual(['t2']);
  });

  it('searches notes', () => {
    const result = filterTransactions(transactions, accounts, {
      type: 'all',
      account: 'all',
      query: 'paycheck',
    });
    expect(result.map((t) => t.id)).toEqual(['t3']);
  });

  it('searches amount digits', () => {
    const result = filterTransactions(transactions, accounts, {
      type: 'all',
      account: 'all',
      query: '3000',
    });
    expect(result.map((t) => t.id)).toEqual(['t3']);
  });

  it('searches account names', () => {
    const result = filterTransactions(transactions, accounts, {
      type: 'all',
      account: 'all',
      query: 'bank',
    });
    expect(result.map((t) => t.id)).toEqual(['t3']);
  });

  it('handles null notes without crashing', () => {
    const result = filterTransactions(transactions, accounts, {
      type: 'all',
      account: 'all',
      query: 'fuel',
    });
    expect(result.map((t) => t.id)).toEqual(['t2']);
  });

  it('combines filters', () => {
    const result = filterTransactions(transactions, accounts, {
      type: 'expense',
      account: 'a1',
      query: 'lunch',
    });
    expect(result.map((t) => t.id)).toEqual(['t1']);
  });
});
