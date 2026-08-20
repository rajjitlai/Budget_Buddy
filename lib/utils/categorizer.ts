/**
 * Category Inference & Dynamic Palette Utility for Budget Buddy
 */

export interface CategoryInferenceRule {
  keywords: string[];
  category: string;
  defaultType: 'expense' | 'income' | 'transfer';
}

const INFERENCE_RULES: CategoryInferenceRule[] = [
  // Food & Dining
  {
    keywords: [
      'food', 'dining', 'restaurant', 'dinner', 'lunch', 'breakfast', 'brunch', 'cafe', 'coffee',
      'starbucks', 'mcdonalds', 'kfc', 'burger', 'pizza', 'dominos', 'zomato', 'swiggy',
      'snack', 'bakery', 'tea', 'chai', 'subway', 'dunkin'
    ],
    category: '🍔 Food & Dining',
    defaultType: 'expense',
  },
  // Groceries & Essentials
  {
    keywords: [
      'grocery', 'groceries', 'supermarket', 'walmart', 'target', 'costco', 'blinkit', 'zepto',
      'instamart', 'bigbasket', 'vegetables', 'fruits', 'milk', 'bread', 'market', 'store'
    ],
    category: '🛒 Groceries',
    defaultType: 'expense',
  },
  // Transport & Travel
  {
    keywords: [
      'uber', 'ola', 'lyft', 'taxi', 'cab', 'metro', 'bus', 'train', 'flight', 'airline',
      'petrol', 'gas', 'fuel', 'diesel', 'parking', 'toll', 'fare', 'commute', 'subway ticket'
    ],
    category: '🚗 Transport & Fuel',
    defaultType: 'expense',
  },
  // Housing & Rent
  {
    keywords: ['rent', 'mortgage', 'housing', 'apartment', 'flat', 'maintenance', 'landlord', 'society'],
    category: '🏠 Housing & Rent',
    defaultType: 'expense',
  },
  // Utilities & Bills
  {
    keywords: [
      'electricity', 'electric', 'water', 'power', 'utility', 'utilities', 'gas bill', 'wifi',
      'internet', 'broadband', 'mobile', 'recharge', 'airtel', 'jio', 'phone bill'
    ],
    category: '💡 Utilities & Bills',
    defaultType: 'expense',
  },
  // Entertainment & Subscriptions
  {
    keywords: [
      'netflix', 'spotify', 'prime', 'amazon prime', 'hotstar', 'disney', 'hulu', 'apple music',
      'youtube', 'movie', 'cinema', 'theatre', 'concert', 'gaming', 'steam', 'playstation', 'xbox'
    ],
    category: '🎬 Entertainment',
    defaultType: 'expense',
  },
  // Shopping & Lifestyle
  {
    keywords: [
      'shopping', 'amazon', 'flipkart', 'ebay', 'myntra', 'zara', 'h&m', 'clothes', 'shoes',
      'electronics', 'gadget', 'apparel', 'mall', 'purchase'
    ],
    category: '🛍️ Shopping',
    defaultType: 'expense',
  },
  // Health & Wellness
  {
    keywords: [
      'health', 'doctor', 'hospital', 'clinic', 'pharmacy', 'medicine', 'dental', 'chemist',
      'gym', 'fitness', 'workout', 'supplements', 'yoga'
    ],
    category: '🏥 Health & Wellness',
    defaultType: 'expense',
  },
  // Income & Earnings
  {
    keywords: [
      'salary', 'paycheck', 'payroll', 'wages', 'bonus', 'dividend', 'interest', 'freelance',
      'consulting', 'stipend', 'cashback', 'refund', 'reimbursement'
    ],
    category: '💼 Salary & Income',
    defaultType: 'income',
  },
  // Education & Books
  {
    keywords: ['course', 'tuition', 'school', 'college', 'udemy', 'coursera', 'books', 'stationery'],
    category: '📚 Education',
    defaultType: 'expense',
  },
  // Personal Care
  {
    keywords: ['salon', 'barber', 'haircut', 'spa', 'massage', 'cosmetics', 'beauty'],
    category: '💅 Personal Care',
    defaultType: 'expense',
  },
  // Investments
  {
    keywords: ['stocks', 'crypto', 'bitcoin', 'mutual fund', 'sip', 'etf', 'gold', 'shares', 'zerodha', 'groww'],
    category: '📈 Investments',
    defaultType: 'expense',
  },
];

/**
 * Infer category and transaction type from text notes or title
 */
export function inferCategoryFromText(text: string): { category: string; type: 'expense' | 'income' | 'transfer' } | null {
  if (!text || !text.trim()) return null;
  const lower = text.toLowerCase().trim();

  for (const rule of INFERENCE_RULES) {
    for (const keyword of rule.keywords) {
      // Check for exact word or substring match
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(lower) || lower.includes(keyword)) {
        return {
          category: rule.category,
          type: rule.defaultType,
        };
      }
    }
  }

  return null;
}

const VIBRANT_PALETTE = [
  '#6366F1', // Indigo
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EF4444', // Red
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#A855F7', // Violet
  '#E11D48', // Rose
  '#0EA5E9', // Sky
];

/**
 * Deterministically get a vibrant, consistent hex color for any category name
 */
export function getCategoryColor(categoryName: string): string {
  if (!categoryName) return '#94A3B8';
  
  // Clean emoji/prefix if any
  const clean = categoryName.trim().toLowerCase();
  
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % VIBRANT_PALETTE.length;
  return VIBRANT_PALETTE[index];
}
