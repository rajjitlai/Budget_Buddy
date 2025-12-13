
import { Client, Account, Databases, ID } from 'appwrite';
import 'react-native-url-polyfill/auto';

// Appwrite configuration
const endpoint = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '';
const databaseId = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || '';

// Validate required environment variables
if (!projectId) {
  const errorMessage = 
    'Missing EXPO_PUBLIC_APPWRITE_PROJECT_ID environment variable. ' +
    'Please set it in your EAS secrets or .env file. ' +
    'Run: eas secret:create --scope project --name EXPO_PUBLIC_APPWRITE_PROJECT_ID --value your-project-id';
  console.error(errorMessage);
  // Log a warning but don't throw to prevent immediate crash
  // The app will still fail when trying to use Appwrite, but this gives better error visibility
}

// Initialize Appwrite client
export const appwriteClient = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId);

// Initialize services
export const account = new Account(appwriteClient);
export const databases = new Databases(appwriteClient);

// Collection IDs - can be overridden via environment variables
export const COLLECTIONS = {
  ACCOUNTS: process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ACCOUNTS || 'accounts',
  TRANSACTIONS: process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_TRANSACTIONS || 'transactions',
  MONTHLY_PLANS: process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_MONTHLY_PLANS || 'monthlyPlans',
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

