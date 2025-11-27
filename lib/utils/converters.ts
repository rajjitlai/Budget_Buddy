
import { AccountDocument } from '@/lib/services/accounts';
import { TransactionDocument } from '@/lib/services/transactions';
import { Account, Transaction } from '@/lib/mockData';

/**
 * Convert Appwrite AccountDocument to app Account type
 */
export function accountDocumentToAccount(doc: AccountDocument): Account {
  return {
    id: doc.$id,
    name: doc.name,
    type: doc.type,
    balance: doc.balance,
    icon: doc.icon,
    color: doc.color,
  };
}

/**
 * Convert app Account type to data for Appwrite (without id)
 */
export function accountToAccountData(account: Account): Omit<Account, 'id'> {
  return {
    name: account.name,
    type: account.type,
    balance: account.balance,
    icon: account.icon,
    color: account.color,
  };
}

/**
 * Convert Appwrite TransactionDocument to app Transaction type
 */
export function transactionDocumentToTransaction(doc: TransactionDocument): Transaction {
  return {
    id: doc.$id,
    amount: doc.amount,
    category: doc.category,
    sourceAccountId: doc.sourceAccountId,
    destinationAccountId: doc.destinationAccountId,
    notes: doc.notes,
    date: doc.date,
    type: doc.type,
  };
}

/**
 * Convert app Transaction type to data for Appwrite (without id)
 */
export function transactionToTransactionData(transaction: Transaction): Omit<Transaction, 'id'> {
  return {
    amount: transaction.amount,
    category: transaction.category,
    sourceAccountId: transaction.sourceAccountId,
    destinationAccountId: transaction.destinationAccountId,
    notes: transaction.notes,
    date: transaction.date,
    type: transaction.type,
  };
}

