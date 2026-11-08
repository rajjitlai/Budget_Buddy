import { Transaction, Account } from '@/lib/types';

export type TransactionTypeFilter = 'all' | 'expense' | 'income' | 'transfer';

export interface TransactionFilter {
  /** 'all' or a specific transaction type */
  type: TransactionTypeFilter;
  /** 'all' or an account id */
  account: string;
  /** Free-text search (trimmed + lowercased before matching) */
  query: string;
}

/**
 * Pure filter/search predicate used by the transactions screen.
 * Matches on type, account (source or destination), and a free-text query
 * against category, notes, amount, and linked account names.
 */
export function filterTransactions(
  transactions: Transaction[],
  accounts: Account[],
  filter: TransactionFilter,
): Transaction[] {
  const query = filter.query.trim().toLowerCase();
  const accountsById = new Map<string, Account>(accounts.map((acc) => [acc.id, acc]));
  return transactions.filter((transaction) => {
    // Type filter
    if (filter.type !== 'all' && transaction.type !== filter.type) {
      return false;
    }

    // Account filter
    if (filter.account !== 'all') {
      if (
        transaction.sourceAccountId !== filter.account &&
        transaction.destinationAccountId !== filter.account
      ) {
        return false;
      }
    }

    // Search query
    if (query) {
      const categoryMatch = transaction.category?.toLowerCase().includes(query) || false;
      const notesMatch = transaction.notes?.toLowerCase().includes(query) || false;
      const amountMatch = transaction.amount.toString().includes(query);

      // Check account names
      const sourceAccount = accountsById.get(transaction.sourceAccountId);
      const destAccount = transaction.destinationAccountId
        ? accountsById.get(transaction.destinationAccountId)
        : undefined;
      const sourceAccountMatch = sourceAccount?.name.toLowerCase().includes(query) || false;
      const destAccountMatch = destAccount?.name.toLowerCase().includes(query) || false;

      if (
        !categoryMatch &&
        !notesMatch &&
        !amountMatch &&
        !sourceAccountMatch &&
        !destAccountMatch
      ) {
        return false;
      }
    }

    return true;
  });
}
