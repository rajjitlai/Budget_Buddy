
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Models } from 'appwrite';
import { getCurrentUser, restoreSession, isAuthenticated } from '@/lib/services/auth';

interface AppwriteContextType {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AppwriteContext = createContext<AppwriteContextType | undefined>(undefined);

export function AppwriteProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error: any) {
      // Silently handle missing scopes error (user not authenticated)
      if (error?.message?.includes('missing scopes') || error?.message?.includes('User')) {
        setUser(null);
        return;
      }
      // Only log non-scope errors
      if (error?.code !== 401) {
        console.error('Error refreshing user:', error);
      }
      setUser(null);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Try to restore session
        await restoreSession();
        // Get current user
        await refreshUser();
      } catch (error: any) {
        // Silently handle missing scopes error (user not authenticated)
        if (!error?.message?.includes('missing scopes') && !error?.message?.includes('User')) {
          console.error('Auth initialization error:', error);
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const value: AppwriteContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    refreshUser,
  };

  return (
    <AppwriteContext.Provider value={value}>
      {children}
    </AppwriteContext.Provider>
  );
}

export function useAppwrite() {
  const context = useContext(AppwriteContext);
  if (context === undefined) {
    throw new Error('useAppwrite must be used within an AppwriteProvider');
  }
  return context;
}

