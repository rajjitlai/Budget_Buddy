export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const faqs: FAQItem[] = [
  {
    id: '1',
    question: 'How do I add my first account?',
    answer: 'Go to the Dashboard tab and tap "Add Account". Enter your account name, select the account type (Salary, Spending, Savings, etc.), and set the initial balance. Your account will be created and displayed on the dashboard.',
  },
  {
    id: '2',
    question: 'How do transactions affect account balances?',
    answer: 'When you create a transaction, account balances are automatically updated. Expenses decrease the source account balance, income increases it, and transfers move money between accounts. The system prevents negative balances for expenses and transfers.',
  },
  {
    id: '3',
    question: 'What are AI Insights?',
    answer: 'AI Insights provide personalized financial recommendations based on your spending patterns, account balances, and budget plans. You can enable AI-powered insights (requires OpenRouter API key) or use rule-based insights that work without any API key.',
  },
  {
    id: '4',
    question: 'How do I set up a monthly budget?',
    answer: 'Go to the Planner tab, enter your monthly salary, and set your essential expenses (electricity, internet, mobile, food, utilities). The app will automatically calculate suggested allocations for spending, buffer, savings, and emergency fund.',
  },
  {
    id: '5',
    question: 'Can I edit or delete transactions?',
    answer: 'Yes! Go to the Transactions tab, switch to the "History" view, and you\'ll see all your transactions. Tap the edit icon to modify a transaction or the delete icon to remove it. Account balances will be automatically adjusted.',
  },
  {
    id: '6',
    question: 'How do I enable Advanced Charts?',
    answer: 'Go to Settings → Features and toggle "Show Advanced Charts" ON. Then visit the Insights screen to see detailed visualizations including savings rate, account distribution, spending by category, and monthly trends.',
  },
  {
    id: '7',
    question: 'Is my financial data secure?',
    answer: 'Yes! Your data is stored locally on your device in a secure SQLite database. We do not store your data on our servers, ensuring total privacy.',
  },
  {
    id: '8',
    question: 'Can I use the app without an internet connection?',
    answer: 'Absolutely! Budget Buddy is a local-first app, meaning all your data is stored on your device. You only need an internet connection for optional features like AI-powered insights or cloud backups.',
  },
];
