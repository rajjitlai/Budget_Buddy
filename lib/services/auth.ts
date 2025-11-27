
import { account, ID } from '@/lib/appwrite';
import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'appwrite_session';

/**
 * Sign up a new user
 */
export async function signUp(email: string, password: string, name?: string) {
  try {
    const user = await account.create(ID.unique(), email, password, name);
    
    // Automatically create session after signup
    await signIn(email, password);
    
    return user;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
}

/**
 * Sign in an existing user
 */
export async function signIn(email: string, password: string) {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    
    // Store session in secure storage
    await SecureStore.setItemAsync(SESSION_KEY, session.$id);
    
    return session;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  try {
    await account.deleteSession('current');
    await SecureStore.deleteItemAsync(SESSION_KEY);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  try {
    return await account.get();
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const user = await account.get();
    return !!user;
  } catch (error) {
    return false;
  }
}

/**
 * Restore session from secure storage
 */
export async function restoreSession() {
  try {
    const sessionId = await SecureStore.getItemAsync(SESSION_KEY);
    if (sessionId) {
      // Appwrite SDK handles session automatically via cookies/localStorage
      // For React Native, we need to ensure the session is set
      const user = await account.get();
      return user;
    }
    return null;
  } catch (error) {
    console.error('Restore session error:', error);
    return null;
  }
}

