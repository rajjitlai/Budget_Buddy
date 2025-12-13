
import { Client, Account, Databases, ID } from 'appwrite';
import 'react-native-url-polyfill/auto';

// Appwrite configuration - all optional with defaults
const endpoint = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '';
const databaseId = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || '';

// Helper to check if Appwrite is configured
export function isAppwriteConfigured(): boolean {
  return !!(projectId && databaseId);
}

// Initialize Appwrite client (works even without config, will fail gracefully when used)
export const appwriteClient = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId || 'placeholder'); // Use placeholder to prevent client initialization errors

// Initialize services
export const account = new Account(appwriteClient);
export const databases = new Databases(appwriteClient);

// Collection IDs - can be overridden via environment variables
export const COLLECTIONS = {
  ACCOUNTS: process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ACCOUNTS || 'accounts',
  TRANSACTIONS: process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_TRANSACTIONS || 'transactions',
  MONTHLY_PLANS: process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_MONTHLY_PLANS || 'monthlyPlans',
} as const;

// Helper to get database ID safely (returns placeholder if not configured)
export function getDatabaseId(): string {
  if (!databaseId) {
    // Return placeholder instead of throwing - allows app to run without config
    console.warn('Appwrite database ID not configured, using placeholder. Appwrite features will not work.');
    return 'placeholder-database-id';
  }
  return databaseId;
}

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
  // Check configuration first
  if (!isAppwriteConfigured()) {
    throw new Error('Appwrite is not configured. Please set EXPO_PUBLIC_APPWRITE_PROJECT_ID and EXPO_PUBLIC_APPWRITE_DATABASE_ID');
  }
  
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('User must be authenticated');
  }
  return userId;
};

export { ID };

