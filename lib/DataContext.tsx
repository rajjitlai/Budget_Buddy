import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  ReactNode,
} from 'react';
import { Account, Transaction, MonthlyPlan, Loan, AppNotification } from '@/lib/types';
import { getAccounts } from '@/lib/services/accounts';
import { getTransactions } from '@/lib/services/transactions';
import { getCurrentMonthlyPlan } from '@/lib/services/monthlyPlans';
import { getLoans } from '@/lib/services/loans';
import { getNotifications, getUnreadCount } from '@/lib/services/notifications';

interface DataContextType {
  /** All accounts, ordered by name. */
  accounts: Account[];
  /** All transactions, ordered by date DESC. */
  transactions: Transaction[];
  /** Current month's budget plan (null if none). */
  monthlyPlan: MonthlyPlan | null;
  loans: Loan[];
  notifications: AppNotification[];
  unreadCount: number;
  /** True only until the first load completes — background refreshes are silent. */
  loading: boolean;
  /** Bumps after every completed data reload (for side effects like insights/alerts). */
  refreshKey: number;
  /** Coordinated reload of all cached data (one pass, coalesced). */
  triggerRefresh: () => void;
  /** Reload notifications + unread count only. */
  triggerNotifRefresh: () => void;
  notifRefreshKey: number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const EMPTY_ACCOUNTS: Account[] = [];
const EMPTY_TRANSACTIONS: Transaction[] = [];
const EMPTY_LOANS: Loan[] = [];
const EMPTY_NOTIFICATIONS: AppNotification[] = [];

export function DataProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>(EMPTY_ACCOUNTS);
  const [transactions, setTransactions] = useState<Transaction[]>(EMPTY_TRANSACTIONS);
  const [monthlyPlan, setMonthlyPlan] = useState<MonthlyPlan | null>(null);
  const [loans, setLoans] = useState<Loan[]>(EMPTY_LOANS);
  const [notifications, setNotifications] = useState<AppNotification[]>(EMPTY_NOTIFICATIONS);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [notifRefreshKey, setNotifRefreshKey] = useState(0);

  const refreshInFlight = useRef(false);
  const refreshQueued = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const loadNotificationsOnly = useCallback(async () => {
    try {
      const [notifList, count] = await Promise.all([
        getNotifications(),
        getUnreadCount(),
      ]);
      if (!mounted.current) return;
      setNotifications(notifList);
      setUnreadCount(count);
      setNotifRefreshKey((k) => k + 1);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, []);

  const refresh = useCallback(async () => {
    // Coalesce: if a reload is running, queue exactly one more pass.
    if (refreshInFlight.current) {
      refreshQueued.current = true;
      return;
    }
    refreshInFlight.current = true;
    try {
      do {
        refreshQueued.current = false;
        const [accountList, transactionList, plan, loanList, notifList, count] =
          await Promise.all([
            getAccounts(),
            getTransactions(),
            getCurrentMonthlyPlan(),
            getLoans(),
            getNotifications(),
            getUnreadCount(),
          ]);
        if (!mounted.current) return;
        setAccounts(accountList);
        setTransactions(transactionList);
        setMonthlyPlan(plan);
        setLoans(loanList);
        setNotifications(notifList);
        setUnreadCount(count);
        setRefreshKey((k) => k + 1);
      } while (refreshQueued.current && mounted.current);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      refreshInFlight.current = false;
    }
  }, []);

  // Initial load
  useEffect(() => {
    refresh().finally(() => {
      if (mounted.current) setLoading(false);
    });
  }, [refresh]);

  const triggerRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  const triggerNotifRefresh = useCallback(() => {
    loadNotificationsOnly();
  }, [loadNotificationsOnly]);

  const value = useMemo<DataContextType>(
    () => ({
      accounts,
      transactions,
      monthlyPlan,
      loans,
      notifications,
      unreadCount,
      loading,
      refreshKey,
      triggerRefresh,
      triggerNotifRefresh,
      notifRefreshKey,
    }),
    [
      accounts,
      transactions,
      monthlyPlan,
      loans,
      notifications,
      unreadCount,
      loading,
      refreshKey,
      triggerRefresh,
      triggerNotifRefresh,
      notifRefreshKey,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
}
