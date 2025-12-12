
import { databases, COLLECTIONS, requireAuth, ID } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { Transaction } from '@/lib/mockData';
import { getAccount, updateAccountBalance } from './accounts';

export interface TransactionDocument extends Omit<Transaction, 'id'> {
  $id: string;
  userId: string;
  $createdAt: string;
  $updatedAt: string;
}

/**
 * Get all transactions for the current user
 */
export async function getTransactions(
  options?: {
    accountId?: string;
    type?: Transaction['type'];
    limit?: number;
    offset?: number;
  }
): Promise<TransactionDocument[]> {
  const userId = await requireAuth();

  const queries = [
    Query.equal('userId', userId),
    Query.orderDesc('date'),
  ];

  if (options?.accountId) {
    queries.push(Query.equal('sourceAccountId', options.accountId));
  }

  if (options?.type) {
    queries.push(Query.equal('type', options.type));
  }

  if (options?.limit) {
    queries.push(Query.limit(options.limit));
  }

  if (options?.offset) {
    queries.push(Query.offset(options.offset));
  }

  const response = await databases.listDocuments(
    process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
    COLLECTIONS.TRANSACTIONS,
    queries
  );

  return response.documents as unknown as TransactionDocument[];
}

/**
 * Get a single transaction by ID
 */
export async function getTransaction(
  transactionId: string
): Promise<TransactionDocument> {
  await requireAuth();

  const transaction = await databases.getDocument(
    process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
    COLLECTIONS.TRANSACTIONS,
    transactionId
  );

  return transaction as unknown as TransactionDocument;
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
      // Expense decreases source account balance
      changes.push({ accountId: sourceAccountId, balanceChange: -amount });
      break;
    case 'income':
      // Income increases source account balance
      changes.push({ accountId: sourceAccountId, balanceChange: amount });
      break;
    case 'transfer':
      // Transfer decreases source and increases destination
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
): Promise<TransactionDocument> {
  const userId = await requireAuth();

  // Create the transaction
  const transaction = await databases.createDocument(
    process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
    COLLECTIONS.TRANSACTIONS,
    ID.unique(),
    {
      ...transactionData,
      userId,
      date: new Date(transactionData.date).toISOString(),
    }
  );

  // Update account balances based on transaction type
  try {
    const balanceChanges = calculateBalanceChanges(
      transactionData.type,
      transactionData.amount,
      transactionData.sourceAccountId,
      transactionData.destinationAccountId
    );

    // Apply balance changes to each affected account
    for (const change of balanceChanges) {
      const account = await getAccount(change.accountId);
      const newBalance = account.balance + change.balanceChange;
      
      // Ensure balance doesn't go negative (for expenses and transfers)
      if (newBalance < 0 && (transactionData.type === 'expense' || transactionData.type === 'transfer')) {
        throw new Error(`Insufficient balance in ${account.name}. Available: ${account.balance}`);
      }

      await updateAccountBalance(change.accountId, newBalance);
    }
  } catch (error) {
    // If balance update fails, delete the transaction to maintain consistency
    try {
      await databases.deleteDocument(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        COLLECTIONS.TRANSACTIONS,
        transaction.$id
      );
    } catch (deleteError) {
      console.error('Failed to rollback transaction:', deleteError);
    }
    throw error;
  }

  return transaction as unknown as TransactionDocument;
}

/**
 * Update an existing transaction and adjust account balances
 */
export async function updateTransaction(
  transactionId: string,
  updates: Partial<Omit<Transaction, 'id'>>
): Promise<TransactionDocument> {
  await requireAuth();

  // Get the existing transaction to reverse its balance changes
  const existingTransaction = await getTransaction(transactionId);

  // Reverse the old transaction's balance changes
  const oldBalanceChanges = calculateBalanceChanges(
    existingTransaction.type,
    existingTransaction.amount,
    existingTransaction.sourceAccountId,
    existingTransaction.destinationAccountId
  );

  // Reverse each balance change
  for (const change of oldBalanceChanges) {
    const account = await getAccount(change.accountId);
    const reversedBalance = account.balance - change.balanceChange;
    await updateAccountBalance(change.accountId, reversedBalance);
  }

  // Prepare update data
  const updateData: any = { ...updates };
  if (updates.date) {
    updateData.date = new Date(updates.date).toISOString();
  }

  // Update the transaction
  const transaction = await databases.updateDocument(
    process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
    COLLECTIONS.TRANSACTIONS,
    transactionId,
    updateData
  );

  // Apply new balance changes based on updated transaction data
  const finalType = updates.type ?? existingTransaction.type;
  const finalAmount = updates.amount ?? existingTransaction.amount;
  const finalSourceAccountId = updates.sourceAccountId ?? existingTransaction.sourceAccountId;
  const finalDestinationAccountId = updates.destinationAccountId ?? existingTransaction.destinationAccountId;

  const newBalanceChanges = calculateBalanceChanges(
    finalType,
    finalAmount,
    finalSourceAccountId,
    finalDestinationAccountId
  );

  // Apply new balance changes
  for (const change of newBalanceChanges) {
    const account = await getAccount(change.accountId);
    const newBalance = account.balance + change.balanceChange;
    
    // Ensure balance doesn't go negative
    if (newBalance < 0 && (finalType === 'expense' || finalType === 'transfer')) {
      // Rollback: re-apply old balance changes
      for (const oldChange of oldBalanceChanges) {
        const oldAccount = await getAccount(oldChange.accountId);
        await updateAccountBalance(oldChange.accountId, oldAccount.balance + oldChange.balanceChange);
      }
      throw new Error(`Insufficient balance in account. Available: ${account.balance}`);
    }

    await updateAccountBalance(change.accountId, newBalance);
  }

  return transaction as unknown as TransactionDocument;
}

/**
 * Delete a transaction and reverse its balance changes
 */
export async function deleteTransaction(
  transactionId: string
): Promise<void> {
  await requireAuth();

  // Get the transaction to reverse its balance changes
  const transaction = await getTransaction(transactionId);

  // Calculate and reverse balance changes
  const balanceChanges = calculateBalanceChanges(
    transaction.type,
    transaction.amount,
    transaction.sourceAccountId,
    transaction.destinationAccountId
  );

  // Reverse each balance change (opposite of what was applied)
  for (const change of balanceChanges) {
    const account = await getAccount(change.accountId);
    const reversedBalance = account.balance - change.balanceChange;
    await updateAccountBalance(change.accountId, reversedBalance);
  }

  // Delete the transaction
  await databases.deleteDocument(
    process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
    COLLECTIONS.TRANSACTIONS,
    transactionId
  );
}

/**
 * Get transactions for a date range
 */
export async function getTransactionsByDateRange(
  startDate: string,
  endDate: string
): Promise<TransactionDocument[]> {
  const userId = await requireAuth();

  const response = await databases.listDocuments(
    process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
    COLLECTIONS.TRANSACTIONS,
    [
      Query.equal('userId', userId),
      Query.greaterThanEqual('date', startDate),
      Query.lessThanEqual('date', endDate),
      Query.orderDesc('date'),
    ]
  );

  return response.documents as unknown as TransactionDocument[];
}

