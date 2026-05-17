// src/ai/insights.engine.ts
// AI Financial Insights engine — generates personalized, emotionally intelligent
// financial coaching messages using GPT.

import OpenAI from 'openai';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { InsightType, InsightPriority } from '@prisma/client';
import { logger } from '../utils/logger';
import { SpendingAnalytics, MonthlyTrend } from '../types';
import { getSpendingAnalytics, getMonthlyTrends } from '../services/transaction.service';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

interface GeneratedInsight {
  type: InsightType;
  priority: InsightPriority;
  title: string;
  body: string;
  metadata?: object;
}

// ── Rule-based quick insights (no AI cost) ────────────────────────

async function generateRuleBasedInsights(userId: string): Promise<GeneratedInsight[]> {
  const insights: GeneratedInsight[] = [];
  const now = new Date();
  const thisMonth = { from: startOfMonth(now), to: endOfMonth(now) };
  const lastMonth = {
    from: startOfMonth(subMonths(now, 1)),
    to: endOfMonth(subMonths(now, 1)),
  };

  const [thisAnalytics, lastAnalytics, subscriptions] = await Promise.all([
    getSpendingAnalytics(userId, thisMonth.from, thisMonth.to),
    getSpendingAnalytics(userId, lastMonth.from, lastMonth.to),
    prisma.subscription.findMany({ where: { userId, isActive: true } }),
  ]);

  // 1. Spending increase alert
  if (lastAnalytics.totalExpenses > 0) {
    const changePercent = Math.round(
      ((thisAnalytics.totalExpenses - lastAnalytics.totalExpenses) /
        lastAnalytics.totalExpenses) *
        100
    );
    if (changePercent > 20) {
      insights.push({
        type: InsightType.SPENDING_ALERT,
        priority: InsightPriority.HIGH,
        title: `Spending up ${changePercent}% this month`,
        body: `You've spent ₹${thisAnalytics.totalExpenses.toLocaleString(
          'en-IN'
        )} this month — ${changePercent}% more than last month. Review your top categories to find where you can cut back.`,
        metadata: { changePercent, thisMonth: thisAnalytics.totalExpenses },
      });
    }
  }

  // 2. Subscription total alert
  const totalSubs = subscriptions.reduce((sum, s) => sum + s.amount, 0);
  if (totalSubs > 1000) {
    insights.push({
      type: InsightType.SUBSCRIPTION_ALERT,
      priority: InsightPriority.MEDIUM,
      title: `₹${totalSubs.toLocaleString('en-IN')} on subscriptions monthly`,
      body: `You have ${subscriptions.length} active subscriptions costing ₹${totalSubs.toLocaleString(
        'en-IN'
      )}/month. Some of these might be unused — worth reviewing!`,
      metadata: { totalSubs, count: subscriptions.length },
    });
  }

  // 3. Low savings rate
  if (thisAnalytics.savingsRate < 10 && thisAnalytics.totalIncome > 0) {
    insights.push({
      type: InsightType.SAVINGS_TIP,
      priority: InsightPriority.HIGH,
      title: "You're saving less than 10%",
      body: `Your current savings rate is ${thisAnalytics.savingsRate}%. Financial experts suggest saving at least 20% of income. Small cuts in food and entertainment can make a big difference.`,
      metadata: { savingsRate: thisAnalytics.savingsRate },
    });
  }

  return insights;
}

// ── GPT-powered deep insights ─────────────────────────────────────

async function generateAIInsights(userId: string): Promise<GeneratedInsight[]> {
  const now = new Date();
  const analytics: SpendingAnalytics = await getSpendingAnalytics(
    userId,
    startOfMonth(now),
    endOfMonth(now)
  );
  const trends: MonthlyTrend[] = await getMonthlyTrends(userId, 3);

  const prompt = `You are an empathetic, emotionally intelligent financial coach for GenZ Indian students.

Here is the user's financial data for this month:
- Total Income: ₹${analytics.totalIncome}
- Total Expenses: ₹${analytics.totalExpenses}
- Net Savings: ₹${analytics.netSavings}
- Savings Rate: ${analytics.savingsRate}%
- Top Categories: ${analytics.categoryBreakdown
    .slice(0, 4)
    .map((c) => `${c.category}: ₹${c.total}`)
    .join(', ')}
- Monthly Trends: ${trends.map((t) => `${t.month}: ₹${t.expenses}`).join(' → ')}

Generate exactly 2 unique, personalized, actionable insights in this JSON format:
[
  {
    "type": "BEHAVIORAL_PATTERN" | "SAVINGS_TIP" | "BUDGET_WARNING",
    "priority": "LOW" | "MEDIUM" | "HIGH",
    "title": "Short punchy title (max 8 words)",
    "body": "Empathetic, conversational, specific advice (2-3 sentences)"
  }
]

Rules:
- Be warm, encouraging, never judgmental
- Use ₹ for amounts (Indian Rupees)
- Be specific with numbers
- GenZ conversational tone — no jargon
- Only return valid JSON array`;

  try {
    const response = await openai.chat.completions.create({
      model: env.OPENAI_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content ?? '[]';
    const parsed = JSON.parse(content) as GeneratedInsight[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    logger.error('AI insight generation failed:', err);
    return [];
  }
}

// ── Main Export ───────────────────────────────────────────────────

export async function generateInsightsForUser(userId: string): Promise<number> {
  logger.info(`Generating insights for user ${userId}`);

  const [ruleInsights, aiInsights] = await Promise.all([
    generateRuleBasedInsights(userId),
    generateAIInsights(userId),
  ]);

  const allInsights = [...ruleInsights, ...aiInsights];

  const existing = await prisma.insight.findMany({
    where: {
      userId,
      createdAt: { gte: startOfMonth(new Date()) },
    },
    select: { type: true },
  });

  const existingTypes = new Set(existing.map((i) => i.type));
  const newInsights = allInsights.filter((i) => !existingTypes.has(i.type));

  if (newInsights.length === 0) {
    logger.info('No new insights to generate');
    return 0;
  }

  await prisma.insight.createMany({
    data: newInsights.map((i) => ({
      userId,
      type: i.type,
      priority: i.priority,
      title: i.title,
      body: i.body,
      metadata: i.metadata ?? {},
      expiresAt: endOfMonth(new Date()),
    })),
  });

  logger.info(`Generated ${newInsights.length} new insights for user ${userId}`);
  return newInsights.length;
}
