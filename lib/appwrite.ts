
import { Client, Account, Databases, ID } from 'appwrite';
import 'react-native-url-polyfill/auto';

// Appwrite configuration
const endpoint = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '';
const databaseId = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || '';

// Initialize Appwrite client
export const appwriteClient = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId);

// Initialize services
export const account = new Account(appwriteClient);
export const databases = new Databases(appwriteClient);

// Collection IDs
export const COLLECTIONS = {
  ACCOUNTS: 'accounts',
  TRANSACTIONS: 'transactions',
  MONTHLY_PLANS: 'monthlyPlans',
} as const;

// Helper to get current user ID
export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const user = await account.get();
    return user.$id;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Helper to ensure user is authenticated
export const requireAuth = async (): Promise<string> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('User must be authenticated');
  }
  return userId;
};

export { ID };

