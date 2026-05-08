import { AIInsight, Account, Transaction, MonthlyPlan, formatCurrency } from '@/lib/types';

import * as SecureStore from 'expo-secure-store';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'google/gemma-3n-e2b-it:free';
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
  let apiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
  let model = DEFAULT_MODEL;
  let provider = 'openrouter';

  try {
    const storedUser = await SecureStore.getItemAsync('budget_buddy_user_profile');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.aiConfig?.apiKey) {
        apiKey = user.aiConfig.apiKey;
        model = user.aiConfig.model || model;
        provider = user.aiConfig.provider || provider;
      }
    }
  } catch (err) {
    console.warn('Error loading user AI config, using defaults:', err);
  }

  const apiUrl = provider === 'openai' ? OPENAI_API_URL : OPENROUTER_API_URL;

  // Debug: Check if API key is loaded
  console.log(`${provider} API check:`, {
    exists: !!apiKey,
    length: apiKey?.length || 0,
    model: model,
  });

  // If no API key, use rule-based insights
  if (!apiKey) {
    console.log(`No ${provider} API key found. Using rule-based insights.`);
    return generateRuleBasedInsights(params);
  }

  // Validate API key format for OpenRouter
  if (provider === 'openrouter' && !apiKey.startsWith('sk-or-v1-')) {
    console.warn('OpenRouter API key format appears invalid. Should start with "sk-or-v1-"');
    console.warn('Falling back to rule-based insights.');
    return generateRuleBasedInsights(params);
  }

  // Build prompt first to check size
  const prompt = buildPrompt(params);
  
  // Limit prompt size to avoid token limits (rough estimate: 1 token ≈ 4 characters)
  const maxPromptLength = 8000; // Conservative limit for free tier
  const truncatedPrompt = prompt.length > maxPromptLength 
    ? prompt.substring(0, maxPromptLength) + '\n\n[Data truncated due to size limits]'
    : prompt;

  // Simplified body - this model doesn't support system messages
  // Combine instructions into the user message instead
  const userPrompt = `You are a financial advisor. Analyze the financial data and return insights as JSON.

Format: {"insights": [{"title": "", "description": "", "action": "", "priority": "high|medium|low", "type": "recommendation|warning|info|success"}]}

Return ONLY valid JSON, no markdown code blocks.

${truncatedPrompt}`;

  const body: any = {
    model: model,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  };

  // Don't add temperature or response_format for free models - they often cause 400 errors
  console.log(`Sending request to ${provider}:`, {
    model: model,
    promptLength: truncatedPrompt.length,
  });

  try {
    const response = await fetch(apiUrl, {
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
      let errorDetails = '';
      let errorData: any = null;
      try {
        const errorText = await response.text();
        try {
          errorData = JSON.parse(errorText);
          errorDetails = errorData.error?.message || errorData.message || JSON.stringify(errorData);
        } catch {
          errorDetails = errorText;
        }
      } catch {
        errorDetails = 'Unknown error';
      }
      
      console.warn(
        `OpenRouter API failed: ${response.status} ${response.statusText}. ` +
        `Error: ${errorDetails}. Falling back to rule-based insights.`
      );
      
      // Log more details for 400 errors to help debug
      if (response.status === 400) {
        console.warn('400 Bad Request - Debug Info:');
        console.warn(`- API Key present: ${apiKey ? 'Yes' : 'No'}`);
        console.warn(`- Model: ${model}`);
        console.warn(`- Provider: ${provider}`);
        console.warn(`- Request body size: ${JSON.stringify(body).length} chars`);
        if (errorData) {
          console.warn(`- Provider error: ${JSON.stringify(errorData)}`);
        }
        console.error('Common causes:');
        console.error('1. Invalid API key format');
        console.error('2. API key not activated or expired');
        console.error('3. Model name incorrect or unavailable');
        console.error('4. Request body too large');
        console.error('');
        console.error('TROUBLESHOOTING STEPS:');
        console.error('1. Verify API key in Settings');
        console.error('2. Verify model name is correct and available');
        console.error(`   Current model: ${model}`);
      }
      
      return generateRuleBasedInsights(params);
    }

    const data = (await response.json()) as OpenRouterResponse;
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.warn('OpenRouter API returned empty content. Falling back to rule-based insights.');
      return generateRuleBasedInsights(params);
    }

    try {
      // Try to extract JSON from markdown code blocks if present
      let jsonContent = content.trim();
      const jsonMatch = jsonContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1];
      }
      
      const parsed = JSON.parse(jsonContent) as { insights?: Partial<AIInsight>[] };
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
        console.log(`Successfully generated ${apiInsights.length} AI insights`);
        return apiInsights;
      } else {
        console.warn('OpenRouter API returned empty insights array. Falling back to rule-based insights.');
        return generateRuleBasedInsights(params);
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      console.error('Response content:', content.substring(0, 500)); // Log first 500 chars
      return generateRuleBasedInsights(params);
    }
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    // Fallback to rule-based insights on any error
    return generateRuleBasedInsights(params);
  }
}

