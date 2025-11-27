
import { databases, COLLECTIONS, requireAuth, ID } from '@/lib/appwrite';
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
  const userId = await requireAuth();
  
  const response = await databases.listDocuments(
    process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
    COLLECTIONS.ACCOUNTS,
    [
      Query.equal('userId', userId),
      Query.orderDesc('$createdAt'),
    ]
  );

  return response.documents as unknown as AccountDocument[];
}

/**
 * Get a single account by ID
 */
export async function getAccount(accountId: string): Promise<AccountDocument> {
  await requireAuth();
  
  const account = await databases.getDocument(
    process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
    COLLECTIONS.ACCOUNTS,
    accountId
  );

  return account as unknown as AccountDocument;
}

/**
 * Create a new account
 */
export async function createAccount(
  accountData: Omit<AccountType, 'id'>
): Promise<AccountDocument> {
  const userId = await requireAuth();

  const account = await databases.createDocument(
    process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
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
    process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
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
    process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
    COLLECTIONS.ACCOUNTS,
    accountId
  );
}

