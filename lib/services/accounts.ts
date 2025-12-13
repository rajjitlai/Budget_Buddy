
import { databases, COLLECTIONS, requireAuth, ID, getDatabaseId } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { Account as AccountType } from '@/lib/mockData';

export interface AccountDocument extends Omit<AccountType, 'id'> {
  $id: string;
  userId: string;
  $createdAt: string;
  $updatedAt: string;
}

/**
 * Get all accounts for the current user
 */
export async function getAccounts(): Promise<AccountDocument[]> {
  try {
    const userId = await requireAuth();
    
    const response = await databases.listDocuments(
      getDatabaseId(),
      COLLECTIONS.ACCOUNTS,
      [
        Query.equal('userId', userId),
        Query.orderDesc('$createdAt'),
      ]
    );

    return response.documents as unknown as AccountDocument[];
  } catch (error: any) {
    // If Appwrite is not configured, return empty array instead of crashing
    if (error?.message?.includes('not configured') || error?.message?.includes('not authenticated')) {
      console.warn('Appwrite not configured or user not authenticated, returning empty accounts');
      return [];
    }
    throw error;
  }
}

/**
 * Get a single account by ID
 */
export async function getAccount(accountId: string): Promise<AccountDocument> {
  try {
    await requireAuth();
    
    const account = await databases.getDocument(
      getDatabaseId(),
      COLLECTIONS.ACCOUNTS,
      accountId
    );

    return account as unknown as AccountDocument;
  } catch (error: any) {
    if (error?.message?.includes('not configured') || error?.message?.includes('not authenticated')) {
      throw new Error('Appwrite is not configured. Please set your environment variables.');
    }
    throw error;
  }
}

/**
 * Create a new account
 */
export async function createAccount(
  accountData: Omit<AccountType, 'id'>
): Promise<AccountDocument> {
  const userId = await requireAuth();

  const account = await databases.createDocument(
    getDatabaseId(),
    COLLECTIONS.ACCOUNTS,
    ID.unique(),
    {
      ...accountData,
      userId,
    }
  );

  return account as unknown as AccountDocument;
}

/**
 * Update an existing account
 */
export async function updateAccount(
  accountId: string,
  updates: Partial<Omit<AccountType, 'id'>>
): Promise<AccountDocument> {
  await requireAuth();

  const account = await databases.updateDocument(
    getDatabaseId(),
    COLLECTIONS.ACCOUNTS,
    accountId,
    updates
  );

  return account as unknown as AccountDocument;
}

/**
 * Update account balance
 */
export async function updateAccountBalance(
  accountId: string,
  newBalance: number
): Promise<AccountDocument> {
  return updateAccount(accountId, { balance: newBalance });
}

/**
 * Delete an account
 */
export async function deleteAccount(accountId: string): Promise<void> {
  await requireAuth();

  await databases.deleteDocument(
    getDatabaseId(),
    COLLECTIONS.ACCOUNTS,
    accountId
  );
}

