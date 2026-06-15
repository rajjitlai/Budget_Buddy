
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { initDatabase } from '@/lib/database/sqlite';

async function getStoredUser(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try { return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null; } catch { return null; }
  }
  try { return await SecureStore.getItemAsync(key); } catch { return null; }
}

async function setStoredUser(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try { if (typeof window !== 'undefined') window.localStorage.setItem(key, value); } catch { }
    return;
  }
  try { await SecureStore.setItemAsync(key, value); } catch { }
}

async function deleteStoredUser(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try { if (typeof window !== 'undefined') window.localStorage.removeItem(key); } catch { }
    return;
  }
  try { await SecureStore.deleteItemAsync(key); } catch { }
}

interface AIConfig {
  apiKey: string;
  provider: 'openrouter' | 'openai';
  model: string;
  customInstructions?: string;
}

interface UserProfile {
  name: string;
  onboarded: boolean;
  aiConfig?: AIConfig;
  currency?: string;
}

interface UserContextType {
  user: UserProfile | null;
  loading: boolean;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'budget_buddy_user_profile';

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize database
        await initDatabase();

        // Load user profile
        const storedUser = await getStoredUser(USER_STORAGE_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          // Default guest user
          const defaultUser: UserProfile = {
            name: 'Guest',
            onboarded: false,
            aiConfig: {
              apiKey: '',
              provider: 'openrouter',
              model: 'google/gemma-3n-e2b-it:free',
            },
            currency: 'Rs.',
          };
          setUser(defaultUser);
        }
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const updateUser = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    await setStoredUser(USER_STORAGE_KEY, JSON.stringify(updatedUser));
  };

  const logout = async () => {
    // In local-only mode, logout might just mean resetting the session or clearing the profile
    const defaultUser: UserProfile = {
      name: 'Guest',
      onboarded: false,
    };
    setUser(defaultUser);
    await deleteStoredUser(USER_STORAGE_KEY);
  };

  const value: UserContextType = {
    user,
    loading,
    updateUser,
    logout,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
