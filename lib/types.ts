/**
 * Budget Buddy V2 Types and Constants
 */

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
  warning?: string;
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
    [key: string]: number;
  };
  allocations: {
    [key: string]: number;
  };
}


// Transaction categories
export const categories = [
  { id: 'food', label: 'Food & Dining', icon: 'Utensils' },
  { id: 'transport', label: 'Transportation', icon: 'Car' },
  { id: 'shopping', label: 'Shopping', icon: 'ShoppingBag' },
  { id: 'entertainment', label: 'Entertainment', icon: 'Film' },
  { id: 'bills', label: 'Bills & Utilities', icon: 'Receipt' },
  { id: 'healthcare', label: 'Healthcare', icon: 'Heart' },
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

// Helper function to format currency as Rupees (Rs.)
export const formatCurrency = (amount: number): string => {
  const formatterOptions: Intl.NumberFormatOptions = {
    maximumFractionDigits: 0,
  };

  // Format number with Indian number system (lakhs, crores)
  const numeric = new Intl.NumberFormat('en-IN', formatterOptions).format(amount);
  
  // Always use "Rs." prefix
  return `Rs. ${numeric}`;
};

// Helper function to calculate total balance
export const calculateNetWorth = (accounts: Account[]): number => {
  return accounts.reduce((total, account) => total + account.balance, 0);
};
