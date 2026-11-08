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
  destinationAccountId?: string | null;
  notes: string | null;
  date: string;
  type: 'expense' | 'income' | 'transfer';
  warning?: string;
}

export interface Loan {
  id: string;
  name: string;
  type: 'borrowed' | 'lent';
  principal: number;
  remaining: number;
  interestRate: number;
  dueDate?: string;
  lenderBorrower?: string;
  notes?: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'warning' | 'success' | 'info';
  read: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isAI?: boolean;
  modelUsed?: string;
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


// Helper function to format currency dynamically (Intl.NumberFormat cached — it's expensive to construct)
const numberFormatters = new Map<string, Intl.NumberFormat>();

export const formatCurrency = (amount: number, currency: string = 'Rs.'): string => {
  // Format number with Indian number system (lakhs, crores) if Rs.
  const locale = currency === 'Rs.' ? 'en-IN' : 'en-US';
  let formatter = numberFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
    numberFormatters.set(locale, formatter);
  }
  return `${currency} ${formatter.format(amount)}`;
};

// Helper function to calculate total balance
export const calculateNetWorth = (accounts: Account[]): number => {
  return accounts.reduce((total, account) => total + account.balance, 0);
};
