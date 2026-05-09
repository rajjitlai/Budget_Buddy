import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface DataContextType {
  refreshKey: number;
  triggerRefresh: () => void;
  notifRefreshKey: number;
  triggerNotifRefresh: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [notifRefreshKey, setNotifRefreshKey] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  const triggerNotifRefresh = useCallback(() => {
    setNotifRefreshKey(k => k + 1);
  }, []);

  return (
    <DataContext.Provider value={{ refreshKey, triggerRefresh, notifRefreshKey, triggerNotifRefresh }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
}
