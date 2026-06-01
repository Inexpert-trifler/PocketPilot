import { predictBudget } from './budget.predictor';
import { prisma } from '../config/database';
import { getCache, setCache } from '../cache/redis.cache';

jest.mock('../config/database', () => ({
  prisma: {
    transaction: {
      findMany: jest.fn(),
      aggregate: jest.fn(),
    },
  },
}));

jest.mock('../cache/redis.cache', () => ({
  getCache: jest.fn(),
  setCache: jest.fn(),
}));

jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('Budget Predictor', () => {
  const userId = 'test-user-id';
  const fixedNow = new Date('2026-06-20T12:00:00.000Z');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(fixedNow);
    jest.clearAllMocks();
    (getCache as jest.Mock).mockResolvedValue(null);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return cached prediction if available', async () => {
    const mockCached = { burnRate: 50 };
    (getCache as jest.Mock).mockResolvedValue(mockCached);

    const result = await predictBudget(userId);

    expect(result).toBe(mockCached);
    expect(prisma.transaction.findMany).not.toHaveBeenCalled();
  });

  it('should calculate predictions correctly for a high risk scenario', async () => {
    const now = new Date(fixedNow);
    // Mock current month transactions (High expenses, low income)
    (prisma.transaction.findMany as jest.Mock).mockResolvedValue([
      { amount: 2000, type: 'DEBIT', date: now },
      { amount: 500, type: 'CREDIT', date: now },
    ]);

    // Mock historical income
    (prisma.transaction.aggregate as jest.Mock).mockResolvedValue({
      _avg: { amount: 600 },
      _sum: { amount: 1800 },
    });

    const result = await predictBudget(userId);

    expect(result).toBeDefined();
    expect(result.currentExpenses).toBe(2000);
    expect(result.currentIncome).toBe(500);
    // Because current expenses are way higher than historical avg income (600), risk should be CRITICAL
    expect(['HIGH', 'CRITICAL']).toContain(result.overspendingRisk);
    expect(result.savingsProbability).toBe(0);
    expect(setCache).toHaveBeenCalled();
  });

  it('should calculate predictions correctly for a low risk scenario', async () => {
    const now = new Date(fixedNow);
    // Mock current month transactions (Low expenses, high income)
    (prisma.transaction.findMany as jest.Mock).mockResolvedValue([
      { amount: 500, type: 'DEBIT', date: now },
      { amount: 5000, type: 'CREDIT', date: now },
    ]);

    // Mock historical income
    (prisma.transaction.aggregate as jest.Mock).mockResolvedValue({
      _avg: { amount: 5000 },
      _sum: { amount: 15000 },
    });

    const result = await predictBudget(userId);

    expect(result).toBeDefined();
    expect(result.currentExpenses).toBe(500);
    expect(result.currentIncome).toBe(5000);
    expect(result.overspendingRisk).toBe('LOW');
    expect(result.savingsProbability).toBeGreaterThan(0);
  });
});
