import { AIInsight, Account, Transaction, MonthlyPlan } from '@/lib/mockData';

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

export async function generateAIInsights(params: GenerateInsightsParams): Promise<AIInsight[]> {
  const apiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('Missing OpenRouter API key. Set EXPO_PUBLIC_OPENROUTER_API_KEY in your environment.');
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
    throw new Error(`OpenRouter request failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as OpenRouterResponse;
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    return [];
  }

  try {
    const parsed = JSON.parse(content) as { insights?: Partial<AIInsight>[] };
    return (parsed.insights ?? []).map((insight, index) => ({
      id: insight.id ?? `ai-${index}`,
      title: insight.title ?? 'Insight',
      description: insight.description ?? '',
      action: insight.action,
      type: insight.type ?? 'info',
      priority: (insight.priority as AIInsight['priority']) ?? 'medium',
    }));
  } catch (error) {
    console.error('Failed to parse AI response:', error, content);
    return [];
  }
}

