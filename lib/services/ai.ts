import { AIInsight, Account, Transaction, MonthlyPlan, formatCurrency } from '@/lib/types';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { getDatabase } from '@/lib/database/sqlite';
import { getSessionApiKey } from '@/lib/utils/sessionKey';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
export const DEFAULT_MODEL = 'openrouter/free';
export const FALLBACK_MODELS = [
  'openrouter/free',
  'google/gemma-4-26b-a4b-it:free',
  'nvidia/nemotron-3.5-lightning:free',
  'z-ai/glm-5.2:free',
];
const REFERER = 'https://budget-buddy.app';
const APP_TITLE = 'Budget Buddy';

/** Hard cap for the whole model-fallback loop (all attempts combined). */
const AI_INSIGHTS_TIMEOUT_MS = 45_000;
const INSIGHTS_CACHE_KEY = 'ai_insights_cache';

export interface GenerateInsightsParams {
  accounts: Account[];
  transactions: Transaction[];
  monthlyPlan?: MonthlyPlan | null;
}

interface AIResponse {
  choices?: {
    message?: {
      content?: string;
    };
  }[];
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Returns today's cached AI insights, or null when missing/expired. */
async function readInsightsCache(): Promise<AIInsight[] | null> {
  try {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ value: string }>(
      'SELECT value FROM settings WHERE key = ?',
      [INSIGHTS_CACHE_KEY]
    );
    if (!row) return null;
    const parsed = JSON.parse(row.value);
    if (
      parsed?.date === todayKey() &&
      Array.isArray(parsed.insights) &&
      parsed.insights.length > 0
    ) {
      return parsed.insights as AIInsight[];
    }
    return null;
  } catch {
    return null;
  }
}

/** Persist today's AI insights (at most one paid AI call per day). */
async function writeInsightsCache(insights: AIInsight[]): Promise<void> {
  try {
    const db = await getDatabase();
    await db.runAsync(
      'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      [INSIGHTS_CACHE_KEY, JSON.stringify({ date: todayKey(), insights })]
    );
  } catch (err) {
    console.warn('Failed to cache AI insights:', err);
  }
}

const buildPrompt = ({ accounts, transactions, monthlyPlan }: GenerateInsightsParams): string => {
  const summary = {
    accounts: accounts.map((a) => ({ name: a.name, type: a.type, balance: a.balance })),
    recentTransactions: transactions.slice(0, 30).map((t) => ({
      amount: t.amount,
      category: t.category,
      type: t.type,
      date: t.date,
    })),
    monthlyPlan: monthlyPlan
      ? {
          salary: monthlyPlan.salary,
          essentials: monthlyPlan.essentials,
          allocations: monthlyPlan.allocations,
        }
      : null,
  };

  return `You are a financial advisor for the Budget Buddy app.
Analyze the following financial summary and return 3 to 4 actionable, specific insights.
Return ONLY valid JSON matching this exact structure, with no extra text or markdown:
{
  "insights": [
    {
      "id": "ai-1",
      "title": "Title of insight",
      "description": "Detailed observation and recommendation",
      "action": "Optional concise action item",
      "priority": "high",
      "type": "recommendation"
    }
  ]
}

Priority must be: "high" | "medium" | "low"
Type must be: "recommendation" | "warning" | "info" | "success"

Financial Summary:
${JSON.stringify(summary, null, 2)}`;
};

/**
 * Generate insights using rule-based analysis (fallback when API is not available)
 */
export function generateRuleBasedInsights(params: GenerateInsightsParams): AIInsight[] {
  const { accounts, transactions, monthlyPlan } = params;
  const insights: AIInsight[] = [];

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentExpenses = transactions.filter(
    (t) => t.type === 'expense' && new Date(t.date) >= thirtyDaysAgo
  );
  const monthlySpending = recentExpenses.reduce((sum, t) => sum + t.amount, 0);

  const spendingAccount = accounts.find((acc) => acc.type.toLowerCase().includes('spending'));
  const savingsAccount = accounts.find((acc) => acc.type.toLowerCase().includes('savings'));

  // Insight 1: Low spending account balance
  if (spendingAccount && spendingAccount.balance < 5000) {
    const recommendedAmount = Math.max(monthlySpending * 0.3, 5000);
    insights.push({
      id: 'insight-1',
      title: 'Low Spending Account Balance',
      description: `Your spending account has ${formatCurrency(spendingAccount.balance)}. Consider transferring ${formatCurrency(recommendedAmount)} to maintain smooth cash flow.`,
      type: 'warning',
      action: `Transfer ${formatCurrency(recommendedAmount)} to Spending`,
      priority: 'high',
    });
  }

  // Insight 2: Emergency fund check
  if (savingsAccount) {
    const emergencyFund = savingsAccount.balance;
    const monthlyEssentials = monthlyPlan
      ? Object.values(monthlyPlan.essentials).reduce((sum, val) => sum + val, 0) +
        (monthlyPlan.allocations.spending || 0)
      : Math.max(monthlySpending, 10000);
    const monthsCovered = monthlyEssentials > 0 ? emergencyFund / monthlyEssentials : 0;

    if (monthsCovered < 3) {
      insights.push({
        id: 'insight-2',
        title: 'Emergency Fund Alert',
        description: `Your emergency fund covers ${monthsCovered.toFixed(1)} months of expenses. Financial experts recommend 6 months of living expenses for security.`,
        type: 'warning',
        action: `Increase emergency fund by ${formatCurrency(monthlyEssentials * 0.2)}/month`,
        priority: 'high',
      });
    } else if (monthsCovered >= 6) {
      insights.push({
        id: 'insight-2',
        title: 'Strong Emergency Fund',
        description: `Your emergency fund covers ${monthsCovered.toFixed(1)} months of living expenses. Excellent financial buffer!`,
        type: 'success',
        priority: 'low',
      });
    }
  }

  // Insight 3: Savings rate analysis
  if (monthlyPlan && monthlyPlan.salary > 0) {
    const savingsRate = Math.round(((monthlyPlan.salary - monthlySpending) / monthlyPlan.salary) * 100);
    if (savingsRate < 20) {
      insights.push({
        id: 'insight-3',
        title: 'Savings Rate Below 20%',
        description: `Your current savings rate is ${savingsRate}%. Target at least 20% to build wealth over time.`,
        type: 'recommendation',
        action: 'Review discretionary spending',
        priority: 'medium',
      });
    } else if (savingsRate >= 30) {
      insights.push({
        id: 'insight-3',
        title: 'Great Savings Rate!',
        description: `You're saving ${savingsRate}% of your income. Keep up the disciplined budgeting!`,
        type: 'success',
        priority: 'low',
      });
    }
  }

  // Insight 4: Category concentration
  if (recentExpenses.length > 0) {
    const categorySpending: Record<string, number> = {};
    recentExpenses.forEach((expense) => {
      categorySpending[expense.category] = (categorySpending[expense.category] || 0) + expense.amount;
    });

    const sortedCategories = Object.entries(categorySpending).sort((a, b) => b[1] - a[1]);
    const topCategory = sortedCategories[0];
    if (topCategory && monthlySpending > 0 && topCategory[1] > monthlySpending * 0.4) {
      const pct = Math.round((topCategory[1] / monthlySpending) * 100);
      insights.push({
        id: 'insight-4',
        title: `High Spend in ${topCategory[0]}`,
        description: `"${topCategory[0]}" accounts for ${pct}% (${formatCurrency(topCategory[1])}) of your spending this month.`,
        type: 'info',
        action: 'Review category transactions',
        priority: 'medium',
      });
    }
  }

  // Insight 5: Net worth overview
  if (insights.length < 3 && totalBalance > 0) {
    insights.push({
      id: 'insight-5',
      title: 'Net Worth Status',
      description: `Your total net worth across ${accounts.length} account(s) is ${formatCurrency(totalBalance)}. Consistent tracking helps build financial security.`,
      type: 'info',
      priority: 'low',
    });
  }

  return insights
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    })
    .slice(0, 4);
}

function parseInsightsJSON(content: string): AIInsight[] | null {
  try {
    let clean = content.trim();
    // Match JSON code blocks
    const match = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
      clean = match[1].trim();
    } else {
      // Find outermost JSON object
      const firstOpen = clean.indexOf('{');
      const lastClose = clean.lastIndexOf('}');
      if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
        clean = clean.substring(firstOpen, lastClose + 1);
      }
    }

    const parsed = JSON.parse(clean) as unknown;
    const insightsField = (parsed as { insights?: unknown })?.insights;
    const recommendationsField = (parsed as { recommendations?: unknown })?.recommendations;
    const rawList: Record<string, unknown>[] = Array.isArray(parsed)
      ? (parsed as Record<string, unknown>[])
      : (Array.isArray(insightsField) ? (insightsField as Record<string, unknown>[]) : undefined)
        ?? (Array.isArray(recommendationsField) ? (recommendationsField as Record<string, unknown>[]) : undefined)
        ?? [];
    if (rawList.length === 0) return null;

    return rawList.map((item, index) => ({
      id: String(item.id || `ai-${index}-${Date.now()}`),
      title: String(item.title || 'Financial Insight'),
      description: String(item.description || ''),
      action: item.action ? String(item.action) : undefined,
      type: (['recommendation', 'warning', 'info', 'success'].includes(String(item.type)) ? String(item.type) : 'info') as AIInsight['type'],
      priority: (['high', 'medium', 'low'].includes(String(item.priority)) ? String(item.priority) : 'medium') as AIInsight['priority'],
    }));
  } catch (err) {
    console.warn('Failed to parse AI insights JSON:', err);
    return null;
  }
}

/**
 * Generate AI insights using OpenRouter/OpenAI with resilient model fallback.
 * Results are cached per calendar day (settings table) so the paid API is
 * called at most once per day. Pass `options.signal` to cancel in-flight.
 */
export async function generateAIInsights(
  params: GenerateInsightsParams,
  options?: { signal?: AbortSignal }
): Promise<AIInsight[]> {
  let apiKey = '';
  let model = DEFAULT_MODEL;
  let provider = 'openrouter';

  try {
    if (Platform.OS === 'web') {
      // The API key is never persisted to localStorage — it lives in the
      // in-memory session store (see lib/utils/sessionKey.ts).
      const stored = typeof window !== 'undefined' ? window.localStorage.getItem('budget_buddy_user_profile') : null;
      if (stored) {
        const user = JSON.parse(stored);
        model = user.aiConfig?.model?.trim() || model;
        provider = user.aiConfig?.provider || provider;
      }
      const sessionKey = getSessionApiKey();
      if (sessionKey.trim()) {
        apiKey = sessionKey.trim().replace(/^["']|["']$/g, '');
      }
    } else {
      const stored = await SecureStore.getItemAsync('budget_buddy_user_profile');
      if (stored) {
        const user = JSON.parse(stored);
        if (user.aiConfig?.apiKey?.trim()) {
          apiKey = user.aiConfig.apiKey.trim().replace(/^["']|["']$/g, '');
          model = user.aiConfig.model?.trim() || model;
          provider = user.aiConfig?.provider || provider;
        }
      }
    }
  } catch (err) {
    console.warn('Error loading user AI config:', err);
  }

  // If no API key provided, generate smart rule-based insights
  if (!apiKey) {
    return generateRuleBasedInsights(params);
  }

  // Same-day cache hit → skip the paid call entirely
  const cached = await readInsightsCache();
  if (cached) {
    return cached;
  }

  const apiUrl = provider === 'openai' ? OPENAI_API_URL : OPENROUTER_API_URL;
  const prompt = buildPrompt(params);

  // Models to attempt in order
  const modelsToTry = provider === 'openrouter'
    ? Array.from(new Set([model, ...FALLBACK_MODELS]))
    : [model];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_INSIGHTS_TIMEOUT_MS);
  const externalSignal = options?.signal;
  const onExternalAbort = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener('abort', onExternalAbort);
  }

  try {
    for (const currentModel of modelsToTry) {
      if (controller.signal.aborted) break;
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': REFERER,
            'X-Title': APP_TITLE,
          },
          body: JSON.stringify({
            model: currentModel,
            messages: [{ role: 'user', content: prompt }],
          }),
          signal: controller.signal,
        });

        if (response.ok) {
          const data = (await response.json()) as AIResponse;
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const insights = parseInsightsJSON(content);
            if (insights && insights.length > 0) {
              await writeInsightsCache(insights);
              return insights;
            }
          }
        } else {
          console.warn(`Model ${currentModel} returned HTTP ${response.status}`);
          if (response.status === 401) {
            break; // Don't retry other models if key is invalid
          }
        }
      } catch (err) {
        console.warn(`Error calling model ${currentModel}:`, err);
      }
    }
  } finally {
    clearTimeout(timer);
    externalSignal?.removeEventListener('abort', onExternalAbort);
  }

  // Fallback to rule-based analysis if all API models fail
  return generateRuleBasedInsights(params);
}
