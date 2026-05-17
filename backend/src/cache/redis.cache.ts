// src/cache/redis.cache.ts
// Typed Redis cache utilities — get, set, delete, invalidate patterns.

import { getRedisClient } from '../config/redis';
import { logger } from '../utils/logger';

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const client = getRedisClient();
    const value = await client.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch (err) {
    logger.warn('Cache GET failed:', { key, err });
    return null; // Cache failure should never break the app
  }
}

export async function setCache<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
  try {
    const client = getRedisClient();
    await client.setex(key, ttlSeconds, JSON.stringify(value));
  } catch (err) {
    logger.warn('Cache SET failed:', { key, err });
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    const client = getRedisClient();
    await client.del(key);
  } catch (err) {
    logger.warn('Cache DELETE failed:', { key, err });
  }
}

export async function deleteCachePattern(pattern: string): Promise<void> {
  try {
    const client = getRedisClient();
    let cursor = '0';
    do {
      const [nextCursor, keys] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;
      if (keys.length) {
        await client.del(...keys);
      }
    } while (cursor !== '0');
  } catch (err) {
    logger.warn('Cache PATTERN DELETE failed:', { pattern, err });
  }
}

/** Cache-aside decorator factory */
export function withCache<T>(
  keyFn: (...args: unknown[]) => string,
  ttl: number,
  fn: (...args: unknown[]) => Promise<T>
) {
  return async (...args: unknown[]): Promise<T> => {
    const key = keyFn(...args);
    const cached = await getCache<T>(key);
    if (cached !== null) return cached;
    const result = await fn(...args);
    await setCache(key, result, ttl);
    return result;
  };
}
