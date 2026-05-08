/**
 * Budget Buddy V2 Types and Constants
 */

export interface Account {
  id: string;
  name: string;
  type: string; // Custom type string (e.g. "Personal", "Business")
  balance: number;
  icon: string; // Emoji or Icon name
  color: string;
}

export interface Transaction {
  id: string;
  amount: number;
  category: string; // Custom category (e.g. "🍱 Lunch", "⛽ Fuel")
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


// Suggested items for better UX (not mandatory)
export const SUGGESTED_CATEGORIES = [
  '🍱 Food', '🚗 Transport', '🛍️ Shopping', '🎬 Entertainment', 
  '💡 Bills', '🏥 Health', '🎓 Education', '💰 Salary', '🔄 Transfer'
];

export const SUGGESTED_ACCOUNT_TYPES = [
  '💳 Spending', '🏦 Savings', '💵 Pocket Money', '📈 Investment', '💼 Salary'
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
