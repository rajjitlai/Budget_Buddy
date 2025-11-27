
import { databases, COLLECTIONS, requireAuth, ID } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { Transaction } from '@/lib/mockData';

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
 * Create a new transaction
 */
export async function createTransaction(
  transactionData: Omit<Transaction, 'id'>
): Promise<TransactionDocument> {
  const userId = await requireAuth();

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

  return transaction as unknown as TransactionDocument;
}

/**
 * Update an existing transaction
 */
export async function updateTransaction(
  transactionId: string,
  updates: Partial<Omit<Transaction, 'id'>>
): Promise<TransactionDocument> {
  await requireAuth();

  const updateData: any = { ...updates };
  if (updates.date) {
    updateData.date = new Date(updates.date).toISOString();
  }

  const transaction = await databases.updateDocument(
    process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
    COLLECTIONS.TRANSACTIONS,
    transactionId,
    updateData
  );

  return transaction as unknown as TransactionDocument;
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(
  transactionId: string
): Promise<void> {
  await requireAuth();

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

