// src/ai/categorizer.ts
// AI-powered transaction categorization engine.
// Rule engine first (fast, free), AI fallback (accurate, costs tokens).

import OpenAI from 'openai';
import { TransactionCategory } from '@prisma/client';
import { CategorizationResult } from '../types';
import { env } from '../config/env';
import { getCache, setCache } from '../cache/redis.cache';
import { logger } from '../utils/logger';

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

// ── Rule Engine ───────────────────────────────────────────────────
// Ordered by specificity — first match wins.

const CATEGORY_RULES: Array<{
  category: TransactionCategory;
  patterns: RegExp[];
}> = [
  {
    category: TransactionCategory.FOOD,
    patterns: [
      /swiggy|zomato|dunzo|eatsure|faasos|freshmenu|box8/i,
      /mcdonald|dominos|pizza.*hut|kfc|subway|burger.*king/i,
      /starbucks|cafe.*coffee|chaayos|third.*wave/i,
      /food|restaurant|dining|eatery|cafe|dhaba|canteen/i,
    ],
  },
  {
    category: TransactionCategory.SUBSCRIPTIONS,
    patterns: [
      /netflix|spotify|prime.*video|hotstar|jiocinema|zee5|sonyliv/i,
      /youtube.*premium|apple.*music|gaana|wynk/i,
      /notion|github|vercel|openai|chatgpt|claude/i,
      /subscription|monthly.*plan|annual.*plan/i,
    ],
  },
  {
    category: TransactionCategory.GAMING,
    patterns: [
      /steam|pubg|bgmi|free.*fire|valorant|minecraft|xbox|playstation/i,
      /gaming|game.*pass|battle.*pass|in.*app.*purchase/i,
      /blizzard|epic.*games|ea.*sports|riot.*games/i,
    ],
  },
  {
    category: TransactionCategory.SHOPPING,
    patterns: [
      /amazon|flipkart|myntra|meesho|nykaa|ajio|tatacliq/i,
      /zepto|blinkit|bigbasket|jiomart|dmart/i,
      /mall|store|shop|retail|boutique/i,
    ],
  },
  {
    category: TransactionCategory.TRANSPORT,
    patterns: [
      /uber|ola|rapido|meru|taxi|cab|auto/i,
      /irctc|railway|train|metro|bus|bmtc|ksrtc/i,
      /fuel|petrol|diesel|hp|bpcl|ioc|bharat.*petroleum/i,
    ],
  },
  {
    category: TransactionCategory.TRAVEL,
    patterns: [
      /indigo|spicejet|airindia|vistara|goair|akasa/i,
      /makemytrip|goibibo|yatra|cleartrip|booking\.com|airbnb/i,
      /hotel|resort|flight|airline|travel/i,
    ],
  },
  {
    category: TransactionCategory.HEALTHCARE,
    patterns: [
      /pharmacy|medical|hospital|clinic|doctor|dentist|apollo|fortis/i,
      /1mg|netmeds|pharmeasy|medplus|practo/i,
      /medicine|health|insurance.*health/i,
    ],
  },
  {
    category: TransactionCategory.EDUCATION,
    patterns: [
      /udemy|coursera|byju|unacademy|vedantu|physicswallah|pw.*app/i,
      /college|university|school|tuition|coaching|exam.*fee/i,
      /book|stationery|notes|course/i,
    ],
  },
  {
    category: TransactionCategory.BILLS,
    patterns: [
      /electricity|water.*bill|gas.*bill|broadband|wifi|internet/i,
      /jio|airtel|vi|bsnl|recharge|mobile.*bill/i,
      /utility|bill.*payment|biller/i,
    ],
  },
  {
    category: TransactionCategory.RENT,
    patterns: [/rent|landlord|pg.*rent|hostel.*fee|accommodation/i],
  },
  {
    category: TransactionCategory.SALARY,
    patterns: [/salary|payroll|wages|stipend|pay.*credit/i],
  },
  {
    category: TransactionCategory.FREELANCE,
    patterns: [/upwork|fiverr|freelance|consulting|project.*payment|invoice/i],
  },
  {
    category: TransactionCategory.ENTERTAINMENT,
    patterns: [/bookmyshow|pvr|inox|cinema|theatre|event|concert|live.*show/i],
  },
];

function ruleBasedCategorize(merchantName: string, description: string): CategorizationResult | null {
  const text = `${merchantName} ${description}`.toLowerCase();

  for (const { category, patterns } of CATEGORY_RULES) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        return { category, confidence: 0.95, method: 'rule' };
      }
    }
  }

  return null;
}

// ── AI Categorization ─────────────────────────────────────────────

async function aiCategorize(merchantName: string, description: string): Promise<CategorizationResult> {
  const cacheKey = `cat:${merchantName.toLowerCase().slice(0, 30)}`;
  const cached = await getCache<CategorizationResult>(cacheKey);
  if (cached) return { ...cached, method: 'cache' };

  const categories = Object.values(TransactionCategory).join(', ');
  const prompt = `You are a financial transaction categorizer.
Given this merchant/description, return ONLY a JSON object with:
- category: one of [${categories}]
- confidence: number between 0-1

Merchant: "${merchantName}"
Description: "${description}"

JSON only, no explanation.`;

  try {
    const response = await openai.chat.completions.create({
      model: env.OPENAI_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
      temperature: 0,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(content) as { category: string; confidence: number };

    const result: CategorizationResult = {
      category: (parsed.category as TransactionCategory) ?? TransactionCategory.OTHER,
      confidence: parsed.confidence ?? 0.7,
      method: 'ai',
    };

    await setCache(cacheKey, result, 86400); // Cache for 24 hours
    return result;
  } catch (err) {
    logger.warn('AI categorization failed, defaulting to OTHER:', err);
    return { category: TransactionCategory.OTHER, confidence: 0.5, method: 'ai' };
  }
}

// ── Public API ────────────────────────────────────────────────────

export async function categorizeTransaction(
  merchantName: string,
  description: string
): Promise<CategorizationResult> {
  // 1. Try rule engine first (free, fast)
  const ruleResult = ruleBasedCategorize(merchantName, description);
  if (ruleResult) return ruleResult;

  // 2. Fall back to AI (costs tokens)
  return aiCategorize(merchantName, description);
}
