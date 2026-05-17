// src/parsers/merchant.normalizer.ts
// Merchant name normalization — maps messy raw strings to clean brand names.
// e.g. "SWIGGY LIMITED", "SwiGGy Instamart", "SWIGGYBANGALORE" → "Swiggy"

import { logger } from '../utils/logger';

// ── Merchant alias map ────────────────────────────────────────────
// Format: [regex pattern, canonical name]
const MERCHANT_RULES: Array<[RegExp, string]> = [
  [/swiggy/i, 'Swiggy'],
  [/zomato/i, 'Zomato'],
  [/amazon/i, 'Amazon'],
  [/flipkart/i, 'Flipkart'],
  [/netflix/i, 'Netflix'],
  [/spotify/i, 'Spotify'],
  [/youtube.*premium|yt.*premium/i, 'YouTube Premium'],
  [/prime.*video|amazon.*prime/i, 'Amazon Prime'],
  [/hotstar|disney.*hotstar/i, 'Disney+ Hotstar'],
  [/jio.*cinema|jiocinema/i, 'JioCinema'],
  [/apple/i, 'Apple'],
  [/uber/i, 'Uber'],
  [/ola\b/i, 'Ola'],
  [/rapido/i, 'Rapido'],
  [/blinkit|grofers/i, 'Blinkit'],
  [/zepto/i, 'Zepto'],
  [/dunzo/i, 'Dunzo'],
  [/myntra/i, 'Myntra'],
  [/meesho/i, 'Meesho'],
  [/nykaa/i, 'Nykaa'],
  [/paytm/i, 'Paytm'],
  [/phonepe/i, 'PhonePe'],
  [/gpay|google.*pay/i, 'Google Pay'],
  [/razorpay/i, 'Razorpay'],
  [/steam/i, 'Steam'],
  [/pubg|battlegrounds/i, 'PUBG'],
  [/starbucks/i, 'Starbucks'],
  [/mcdonald|mcdonalds/i, "McDonald's"],
  [/dominos|domino's/i, "Domino's"],
  [/pizza.*hut/i, 'Pizza Hut'],
  [/kfc/i, 'KFC'],
  [/bmtc|ksrtc|irctc|railway/i, 'Indian Railways'],
  [/indigo|spicejet|airindia|air.*india|vistara/i, 'Flight Ticket'],
  [/udemy/i, 'Udemy'],
  [/coursera/i, 'Coursera'],
  [/byju|byjus/i, "Byju's"],
  [/notion/i, 'Notion'],
  [/github/i, 'GitHub'],
  [/vercel/i, 'Vercel'],
  [/openai/i, 'OpenAI'],
];

/**
 * Normalizes a raw merchant string into a clean, recognizable brand name.
 * Falls back to a title-cased cleaned version of the raw string.
 */
export function normalizeМerchantName(raw: string): string {
  const cleaned = raw.trim();

  for (const [pattern, canonical] of MERCHANT_RULES) {
    if (pattern.test(cleaned)) return canonical;
  }

  // Fallback: clean up and title-case the raw string
  return cleaned
    .replace(/\b(limited|ltd|pvt|private|india|instamart|bangalore|mumbai|delhi)\b/gi, '')
    .replace(/[^a-zA-Z0-9\s\-&.]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3) // Max 3 words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/** Learn a new merchant mapping (persisted to DB in future iteration) */
export function learnMerchant(raw: string, canonical: string): void {
  logger.info(`Merchant learned: "${raw}" → "${canonical}"`);
  // In production: persist to a merchant_mappings table and reload
}
