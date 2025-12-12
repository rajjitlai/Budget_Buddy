import { AIInsight, Account, Transaction, MonthlyPlan, formatCurrency } from '@/lib/mockData';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = 'google/gemma-3-4b-it:free';
const REFERER = process.env.EXPO_PUBLIC_APP_URL || 'https://budget-buddy.app';
const APP_TITLE = 'Budget Buddy';

export interface GenerateInsightsParams {
  accounts: Account[];
  transactions: Transaction[];
  monthlyPlan?: MonthlyPlan | null;
}

interface OpenRouterResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

const buildPrompt = ({ accounts, transactions, monthlyPlan }: GenerateInsightsParams) => {
  const summary = {
    accounts,
    transactions,
    monthlyPlan,
  };

  return `You are an AI financial planning assistant for the Budget Buddy mobile app.
Analyze the following JSON payload and return up to three actionable insights that help the user manage their money.
Each insight must include: title, description, optional action, and priority (high|medium|low).
Respond ONLY with JSON matching this shape:
{
  "insights": [
    { "title": "", "description": "", "action": "", "priority": "high" }
  ]
}

Context:
${JSON.stringify(summary, null, 2)}`;
};

/**
 * Generate insights using rule-based analysis (fallback when API is not available)
 */
function generateRuleBasedInsights(params: GenerateInsightsParams): AIInsight[] {
  const { accounts, transactions, monthlyPlan } = params;
  const insights: AIInsight[] = [];

  // Calculate totals
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const expenses = transactions.filter((t) => t.type === 'expense');
  const income = transactions.filter((t) => t.type === 'income');
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);

  // Get recent transactions (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentTransactions = transactions.filter(
    (t) => new Date(t.date) >= thirtyDaysAgo
  );
  const recentExpenses = recentTransactions.filter((t) => t.type === 'expense');
  const monthlySpending = recentExpenses.reduce((sum, t) => sum + t.amount, 0);

  // Find spending account
  const spendingAccount = accounts.find((acc) => acc.type === 'spending');
  const salaryAccount = accounts.find((acc) => acc.type === 'salary');
  const savingsAccount = accounts.find((acc) => acc.type === 'savings');

  // Insight 1: Low spending account balance
  if (spendingAccount && spendingAccount.balance < 5000) {
    const recommendedAmount = monthlySpending * 0.3; // 30% of monthly spending
    insights.push({
      id: 'insight-1',
      title: 'Low Spending Account Balance',
      description: `Your spending account has ${formatCurrency(spendingAccount.balance)}. Consider transferring ${formatCurrency(recommendedAmount)} from your salary account to maintain smooth cash flow.`,
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
        monthlyPlan.allocations.spending
      : monthlySpending;
    const monthsCovered = emergencyFund / monthlyEssentials;

    if (monthsCovered < 3) {
      insights.push({
        id: 'insight-2',
        title: 'Emergency Fund Alert',
        description: `Your emergency fund covers ${monthsCovered.toFixed(1)} months of expenses. Financial experts recommend 6 months for better security.`,
        type: 'warning',
        action: `Increase emergency fund by ${formatCurrency(monthlyEssentials * 0.2)}/month`,
        priority: 'high',
      });
    } else if (monthsCovered >= 6) {
      insights.push({
        id: 'insight-2',
        title: 'Excellent Emergency Fund',
        description: `Your emergency fund covers ${monthsCovered.toFixed(1)} months of expenses. Great job maintaining financial security!`,
        type: 'success',
        priority: 'low',
      });
    }
  }

  // Insight 3: Spending vs Income analysis
  if (monthlyPlan && monthlyPlan.salary > 0) {
    const savingsRate = ((monthlyPlan.salary - monthlySpending) / monthlyPlan.salary) * 100;
    
    if (savingsRate < 20) {
      insights.push({
        id: 'insight-3',
        title: 'Low Savings Rate',
        description: `Your current savings rate is ${savingsRate.toFixed(1)}%. Consider reducing discretionary spending to reach the recommended 20% savings rate.`,
        type: 'recommendation',
        action: 'Review spending categories',
        priority: 'medium',
      });
    } else if (savingsRate >= 30) {
      insights.push({
        id: 'insight-3',
        title: 'Great Savings Rate!',
        description: `You're saving ${savingsRate.toFixed(1)}% of your income. Keep up the excellent work!`,
        type: 'success',
        priority: 'low',
      });
    }
  }

  // Insight 4: Account balance distribution
  if (salaryAccount && spendingAccount) {
    const salaryBalance = salaryAccount.balance;
    const spendingBalance = spendingAccount.balance;
    const ratio = spendingBalance / salaryBalance;

    if (ratio < 0.1 && salaryBalance > 20000) {
      const recommendedTransfer = Math.min(salaryBalance * 0.15, 10000);
      insights.push({
        id: 'insight-4',
        title: 'Optimize Cash Flow',
        description: `Your spending account has low balance compared to salary account. Consider moving ${formatCurrency(recommendedTransfer)} for better liquidity.`,
        type: 'recommendation',
        action: `Move ${formatCurrency(recommendedTransfer)} to Spending`,
        priority: 'medium',
      });
    }
  }

  // Insight 5: High spending category
  if (recentExpenses.length > 0) {
    const categorySpending: Record<string, number> = {};
    recentExpenses.forEach((expense) => {
      categorySpending[expense.category] = (categorySpending[expense.category] || 0) + expense.amount;
    });

    const topCategory = Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0];
    if (topCategory && topCategory[1] > monthlySpending * 0.4) {
      insights.push({
        id: 'insight-5',
        title: 'High Spending Category',
        description: `You're spending ${formatCurrency(topCategory[1])} on ${topCategory[0]} this month, which is ${((topCategory[1] / monthlySpending) * 100).toFixed(0)}% of your total expenses. Consider reviewing this category.`,
        type: 'info',
        action: 'Review spending patterns',
        priority: 'medium',
      });
    }
  }

  // Return top 3-4 insights sorted by priority
  return insights
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    })
    .slice(0, 4);
}

/**
 * Generate AI insights using OpenRouter API or fallback to rule-based
 */
export async function generateAIInsights(params: GenerateInsightsParams): Promise<AIInsight[]> {
  const apiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;

  // If no API key, use rule-based insights
  if (!apiKey) {
    console.log('No OpenRouter API key found. Using rule-based insights.');
    return generateRuleBasedInsights(params);
  }

  const body = {
    model: OPENROUTER_MODEL,
    response_format: { type: 'json_object' },
    temperature: 0.35,
    messages: [
      {
        role: 'system',
        content:
          'You generate concise, data-driven budgeting insights. Provide clear financial tips tailored to the provided data.',
      },
      {
        role: 'user',
        content: buildPrompt(params),
      },
    ],
  };

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': REFERER,
        'X-Title': APP_TITLE,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`OpenRouter API failed: ${response.status}. Falling back to rule-based insights.`);
      return generateRuleBasedInsights(params);
    }

    const data = (await response.json()) as OpenRouterResponse;
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.warn('OpenRouter API returned empty content. Falling back to rule-based insights.');
      return generateRuleBasedInsights(params);
    }

    try {
      const parsed = JSON.parse(content) as { insights?: Partial<AIInsight>[] };
      const apiInsights = (parsed.insights ?? []).map((insight, index) => ({
        id: insight.id ?? `ai-${index}`,
        title: insight.title ?? 'Insight',
        description: insight.description ?? '',
        action: insight.action,
        type: (insight.type as AIInsight['type']) ?? 'info',
        priority: (insight.priority as AIInsight['priority']) ?? 'medium',
      }));

      // If API returned valid insights, use them; otherwise fallback
      if (apiInsights.length > 0) {
        return apiInsights;
      } else {
        return generateRuleBasedInsights(params);
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error, content);
      return generateRuleBasedInsights(params);
    }
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    // Fallback to rule-based insights on any error
    return generateRuleBasedInsights(params);
  }
}

