/**
 * Category Inference & Dynamic Palette Utility for Budget Buddy
 */

import { Transaction } from '@/lib/types';

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
      if (lower.includes(keyword)) {
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

// Removes emoji, variation selectors, ZWJ, and keycap combiners anywhere in a label.
const EMOJI_RE = /[\p{Extended_Pictographic}\uFE0E\uFE0F\u200D\u20E3]/gu;

/**
 * Strip emoji/symbols from a category label: "🍱 Food" → "Food".
 */
export function stripCategoryEmoji(text: string): string {
  if (!text) return '';
  return text.replace(EMOJI_RE, '').replace(/\s+/g, ' ').trim();
}

/**
 * Merge key for categories: emoji-free + lowercase + single-spaced.
 * "🍱 Food", "Food " and "food" all → "food".
 */
export function normalizeCategoryKey(text: string): string {
  return stripCategoryEmoji(text).toLowerCase();
}

export interface CategoryAggregate {
  /** Merge key (emoji-free, lowercase). */
  category: string;
  /** Display label: emoji-free, casing from the first transaction seen. */
  label: string;
  amount: number;
}

/** A calendar month used for filtering/aggregation. */
export interface MonthKey {
  year: number;
  /** 0-11 (JS Date convention). */
  month: number;
}

const MONTHS_ABBR = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function formatMonthLabel({ year, month }: MonthKey): string {
  return `${MONTHS_ABBR[month]} ${year}`;
}

/** Exact month of a "YYYY-MM-DD" date string (no timezone parsing pitfalls). */
function parseDateMonth(dateStr: string): { year: number; month: number } | null {
  const m = /^(\d{4})-(\d{2})/.exec(dateStr);
  if (!m) {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return null;
    return { year: d.getFullYear(), month: d.getMonth() };
  }
  return { year: Number(m[1]), month: Number(m[2]) - 1 };
}

/**
 * Unique months that have expense transactions, newest first.
 */
export function listExpenseMonths(transactions: Transaction[]): MonthKey[] {
  const seen = new Map<string, MonthKey>();
  for (const t of transactions) {
    if (t.type !== 'expense') continue;
    const parsed = parseDateMonth(t.date);
    if (!parsed) continue;
    const key = `${parsed.year}-${parsed.month}`;
    if (!seen.has(key)) seen.set(key, parsed);
  }
  return [...seen.values()].sort((a, b) => b.year - a.year || b.month - a.month);
}

/**
 * Aggregate expense totals per category, merging emoji variants.
 *
 * Groups by the emoji-stripped lowercase label so "🍱 Food", "Food" and
 * "food" become one entry; the display label keeps the first-seen casing.
 * Pass `month` to limit to a calendar month; omit for all time.
 */
export function aggregateByCategory(
  transactions: Transaction[],
  month?: MonthKey | null
): CategoryAggregate[] {
  const groups = new Map<string, CategoryAggregate>();
  for (const t of transactions) {
    if (t.type !== 'expense') continue;
    if (month) {
      const parsed = parseDateMonth(t.date);
      if (!parsed || parsed.year !== month.year || parsed.month !== month.month) continue;
    }
    const key = normalizeCategoryKey(t.category);
    if (!key) continue;
    const existing = groups.get(key);
    if (existing) {
      existing.amount += t.amount;
    } else {
      groups.set(key, { category: key, label: stripCategoryEmoji(t.category), amount: t.amount });
    }
  }
  return [...groups.values()].sort((a, b) => b.amount - a.amount);
}
