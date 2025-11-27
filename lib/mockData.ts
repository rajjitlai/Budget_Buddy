

// Budget Buddy Mock Data

export interface Account {
  id: string;
  name: string;
  type: 'salary' | 'spending' | 'pocket' | 'savings' | 'fd' | 'custom';
  balance: number;
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  sourceAccountId: string;
  destinationAccountId?: string;
  notes: string;
  date: string;
  type: 'expense' | 'income' | 'transfer';
}

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  type: 'recommendation' | 'warning' | 'info' | 'success';
  action?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface MonthlyPlan {
  salary: number;
  essentials: {
    electricity: number;
    internet: number;
    mobile: number;
    food: number;
    utilities: number;
  };
  allocations: {
    spending: number;
    salaryBuffer: number;
    savings: number;
    emergency: number;
  };
}

// Initial mock accounts
export const initialAccounts: Account[] = [
  {
    id: '1',
    name: 'Salary Account',
    type: 'salary',
    balance: 85000,
    icon: 'Wallet',
    color: '#10b981',
  },
  {
    id: '2',
    name: 'Daily Spending',
    type: 'spending',
    balance: 12500,
    icon: 'CreditCard',
    color: '#3b82f6',
  },
  {
    id: '3',
    name: 'Pocket Money',
    type: 'pocket',
    balance: 3500,
    icon: 'Coins',
    color: '#f59e0b',
  },
  {
    id: '4',
    name: 'Emergency Savings',
    type: 'savings',
    balance: 150000,
    icon: 'PiggyBank',
    color: '#8b5cf6',
  },
  {
    id: '5',
    name: 'Fixed Deposit',
    type: 'fd',
    balance: 500000,
    icon: 'Landmark',
    color: '#ec4899',
  },
];

// Mock transactions
export const mockTransactions: Transaction[] = [
  {
    id: 't1',
    amount: 2500,
    category: 'food',
    sourceAccountId: '2',
    notes: 'Weekly groceries',
    date: '2024-01-15',
    type: 'expense',
  },
  {
    id: 't2',
    amount: 1200,
    category: 'electricity',
    sourceAccountId: '1',
    notes: 'Monthly electricity bill',
    date: '
2024-01-10',
    type: 'expense',
  },
  {
    id: 't3',
    amount: 5000,
    category: 'transfer',
    sourceAccountId: '1',
    destinationAccountId: '2',
    notes: 'Weekly spending allowance',
    date: '2024-01-08',
    type: 'transfer',
  },
  {
    id: 't4',
    amount: 85000,
    category: 'salary',
    sourceAccountId: '1',
    notes: 'Monthly salary credit',
    date: '2024-01-01',
    type: 'income',
  },
];

// Mock AI insights
export const mockAIInsights: AIInsight[] = [
  {
    id: 'ai1',
    title: 'Optimize Spending Allocation',
    description: 'Based on your spending patterns, consider moving ?4,000 from Salary to Spending account for better cash flow management.',
    type: 'recommendation',
    action: 'Move ?4,000 from Salary  Spending',
    priority: 'high',
  },
  {
    id: 'ai2',
    title: 'Emergency Fund Alert',
    description: 'Your emergency fund covers 4.5 months of expenses. Consider increasing it to 6 months for better security.',
    type: 'warning',
    action: 'Increase emergency reserve by ?2,500/month',
    priority: 'medium',
  },
  {
    id: 'ai3',
    title: 'Savings Goal Progress',
    description: 'You\'re on track to reach your annual savings goal! Keep up the great work.',
    type: 'success',
    priority: 'low',
  },
  {
    id: 'ai4',
    title: 'Bill Payment Reminder',
    description: 'Your internet bill of ?999 is due in 3 days. Ensure sufficient balance in spending account.',
    type: 'info',
    action: 'Schedule payment',
    priority: 'medium',
  },
];

// Mock monthly plan
export const mockMonthlyPlan: MonthlyPlan = {
  salary: 85000,
  essentials: {
    electricity: 1500,
    internet: 999,
    mobile: 599,
    food: 12000,
    utilities: 2000,
  },
  allocations: {
    spending: 25000,
    salaryBuffer: 10000,
    savings: 30000,
    emergency: 5000,
  },
};

// Category options
export const categories = [
  { id: 'food', label: 'Food & Groceries', icon: 'UtensilsCrossed' },
  { id: 'utilities', label: 'Utilities', icon: 'Wrench' },
  { id: 'el
ectricity', label: 'Electricity', icon: 'Zap' },
  { id: 'internet', label: 'Internet', icon: 'Wifi' },
  { id: 'mobile', label: 'Mobile', icon: 'Smartphone' },
  { id: 'transport', label: 'Transport', icon: 'Car' },
  { id: 'entertainment', label: 'Entertainment', icon: 'Film' },
  { id: 'shopping', label: 'Shopping', icon: 'ShoppingBag' },
  { id: 'health', label: 'Health', icon: 'Heart' },
  { id: 'education', label: 'Education', icon: 'GraduationCap' },
  { id: 'transfer', label: 'Transfer', icon: 'ArrowLeftRight' },
  { id: 'salary', label: 'Salary', icon: 'Banknote' },
  { id: 'other', label: 'Other', icon: 'MoreHorizontal' },
];

// Account type options
export const accountTypes = [
  { id: 'salary', label: 'Salary Account', icon: 'Wallet' },
  { id: 'spending', label: 'Spending Account', icon: 'CreditCard' },
  { id: 'pocket', label: 'Pocket Money', icon: 'Coins' },
  { id: 'savings', label: 'Savings Account', icon: 'PiggyBank' },
  { id: 'fd', label: 'Fixed Deposit', icon: 'Landmark' },
  { id: 'custom', label: 'Custom Account', icon: 'Folder' },
];

// Helper function to format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper function to calculate total balance
export const calculateNetWorth = (accounts: Account[]): number => {
  return accounts.reduce((total, account) => total + account.balance, 0);
};


