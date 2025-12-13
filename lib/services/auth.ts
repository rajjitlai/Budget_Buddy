
import { account, ID } from '@/lib/appwrite';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

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
    
    // Store session in secure storage (if available)
    try {
      const isAvailable = await SecureStore.isAvailableAsync();
      if (isAvailable) {
        await SecureStore.setItemAsync(SESSION_KEY, session.$id);
      } else {
        console.warn('SecureStore not available, session not persisted');
      }
    } catch (storeError) {
      console.warn('Failed to store session:', storeError);
      // Continue anyway - Appwrite SDK handles session via cookies/localStorage
    }
    
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
    try {
      const isAvailable = await SecureStore.isAvailableAsync();
      if (isAvailable) {
        await SecureStore.deleteItemAsync(SESSION_KEY);
      }
    } catch (storeError) {
      console.warn('Failed to delete session from SecureStore:', storeError);
      // Continue anyway
    }
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
  } catch (error: any) {
    // Silently handle missing scopes error (user not authenticated)
    if (error?.message?.includes('missing scopes') || error?.message?.includes('User')) {
      return null;
    }
    // Only log non-scope errors
    if (error?.code !== 401) {
      console.error('Get current user error:', error);
    }
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
    // Check if SecureStore is available
    let sessionId: string | null = null;
    try {
      const isAvailable = await SecureStore.isAvailableAsync();
      if (isAvailable) {
        sessionId = await SecureStore.getItemAsync(SESSION_KEY);
      }
    } catch (storeError) {
      console.warn('SecureStore not available for session restore:', storeError);
      // Continue - Appwrite SDK may handle session via other means
    }

    if (sessionId) {
      // Appwrite SDK handles session automatically via cookies/localStorage
      // For React Native, we need to ensure the session is set
      try {
        const user = await account.get();
        return user;
      } catch (error: any) {
        // If session is invalid, clear it
        if (error?.code === 401 || error?.message?.includes('missing scopes')) {
          try {
            const isAvailable = await SecureStore.isAvailableAsync();
            if (isAvailable) {
              await SecureStore.deleteItemAsync(SESSION_KEY);
            }
          } catch {
            // Ignore cleanup errors
          }
        }
        return null;
      }
    }
    return null;
  } catch (error: any) {
    // Silently handle missing scopes error (user not authenticated)
    if (error?.message?.includes('missing scopes') || error?.message?.includes('User')) {
      return null;
    }
    // Only log non-scope errors
    if (error?.code !== 401) {
      console.error('Restore session error:', error);
    }
    return null;
  }
}

