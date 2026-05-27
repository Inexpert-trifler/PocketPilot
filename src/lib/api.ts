// src/lib/api.ts
// Browser-native LocalStorage-backed Finance Database and Analytics Engine for PocketPilot.
// Runs 100% offline without requiring any database or backend server.
// Seeded with realistic high-fidelity Gen-Z student transaction data on first load.

// ── Types & Enums ────────────────────────────────────────────────
export enum TransactionCategory {
  FOOD = "FOOD",
  SHOPPING = "SHOPPING",
  GAMING = "GAMING",
  SUBSCRIPTIONS = "SUBSCRIPTIONS",
  EDUCATION = "EDUCATION",
  TRAVEL = "TRAVEL",
  ENTERTAINMENT = "ENTERTAINMENT",
  RENT = "RENT",
  BILLS = "BILLS",
  HEALTHCARE = "HEALTHCARE",
  TRANSPORT = "TRANSPORT",
  SALARY = "SALARY",
  FREELANCE = "FREELANCE",
  TRANSFER = "TRANSFER",
  OTHER = "OTHER",
}

export type TransactionType = "INCOME" | "EXPENSE";

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  date: string;
  isRecurring: boolean;
}

export interface Budget {
  category: TransactionCategory;
  amount: number;
  spent: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  emoji: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  status: "ACTIVE" | "COMPLETED" | "PAUSED";
}

export interface FinancialInsight {
  id: string;
  type: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  title: string;
  message: string;
  body: string; // fallback matching backend
  createdAt: string;
}

// ── Local Storage Keys ───────────────────────────────────────────
const KEYS = {
  TRANSACTIONS: "pocketpilot_transactions",
  BUDGETS: "pocketpilot_budgets",
  GOALS: "pocketpilot_goals",
  INSIGHTS: "pocketpilot_insights",
};

// ── Seeding Engine ───────────────────────────────────────────────
const SEED_TRANSACTIONS: Transaction[] = [];

const SEED_BUDGETS: Budget[] = [];

const SEED_GOALS: SavingsGoal[] = [];

// Helper to check environment and fetch items
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(data) as T;
  } catch {
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// Initialize datastores
export const initializeDatabase = () => {
  getStorageItem<Transaction[]>(KEYS.TRANSACTIONS, SEED_TRANSACTIONS);
  getStorageItem<Budget[]>(KEYS.BUDGETS, SEED_BUDGETS);
  getStorageItem<SavingsGoal[]>(KEYS.GOALS, SEED_GOALS);
};

// ── RegExp Rule-Based Categorization ──────────────────────────────
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
    category: TransactionCategory.HEALTHCARE,
    patterns: [
      /pharmacy|medical|hospital|clinic|doctor|dentist|apollo|fortis/i,
      /1mg|netmeds|pharmeasy|medplus|practo/i,
    ],
  },
  {
    category: TransactionCategory.EDUCATION,
    patterns: [
      /udemy|coursera|byju|unacademy|vedantu|physicswallah/i,
      /college|university|school|tuition/i,
    ],
  },
  {
    category: TransactionCategory.BILLS,
    patterns: [
      /electricity|water.*bill|gas.*bill|broadband|wifi|internet/i,
      /jio|airtel|vi|bsnl|recharge|mobile.*bill/i,
    ],
  },
  {
    category: TransactionCategory.RENT,
    patterns: [/rent|landlord|pg.*rent|accommodation/i],
  },
  {
    category: TransactionCategory.SALARY,
    patterns: [/salary|payroll|wages|stipend|pay.*credit/i],
  },
  {
    category: TransactionCategory.FREELANCE,
    patterns: [/upwork|fiverr|freelance|consulting/i],
  },
];

export function autoCategorize(description: string): TransactionCategory {
  const text = description.toLowerCase();
  for (const { category, patterns } of CATEGORY_RULES) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        return category;
      }
    }
  }
  return TransactionCategory.OTHER;
}

// ── API Service Interfaces ───────────────────────────────────────

// 1. Transactions
export const getTransactions = async (params?: Record<string, string>) => {
  initializeDatabase();
  const txs = getStorageItem<Transaction[]>(KEYS.TRANSACTIONS, SEED_TRANSACTIONS);
  
  // Sort descending by date
  let sorted = [...txs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (params?.limit) {
    sorted = sorted.slice(0, parseInt(params.limit));
  }
  
  return {
    success: true,
    data: {
      transactions: sorted,
    },
  };
};

export const addTransaction = async (data: Omit<Transaction, "id" | "date" | "category" | "isRecurring">) => {
  initializeDatabase();
  const txs = getStorageItem<Transaction[]>(KEYS.TRANSACTIONS, SEED_TRANSACTIONS);
  const category = autoCategorize(data.description);
  
  // Determine if it is recurring based on common keywords
  const isRecurring = /premium|subscription|netflix|spotify|youtube|monthly|act/i.test(data.description);
  
  const newTx: Transaction = {
    id: `tx-${Date.now()}`,
    amount: data.amount,
    type: data.type,
    category,
    description: data.description,
    date: new Date().toISOString(),
    isRecurring,
  };
  
  const updated = [newTx, ...txs];
  setStorageItem(KEYS.TRANSACTIONS, updated);
  
  // Also update category spent in budget
  if (data.type === "EXPENSE") {
    const budgets = getStorageItem<Budget[]>(KEYS.BUDGETS, SEED_BUDGETS);
    const updatedBudgets = budgets.map((b) => {
      if (b.category === category) {
        return { ...b, spent: b.spent + data.amount };
      }
      return b;
    });
    setStorageItem(KEYS.BUDGETS, updatedBudgets);
  }
  
  return {
    success: true,
    data: newTx,
  };
};

export const deleteTransaction = async (id: string) => {
  initializeDatabase();
  const txs = getStorageItem<Transaction[]>(KEYS.TRANSACTIONS, SEED_TRANSACTIONS);
  const target = txs.find((t) => t.id === id);
  
  if (!target) return { success: false, error: "Transaction not found" };
  
  const updated = txs.filter((t) => t.id !== id);
  setStorageItem(KEYS.TRANSACTIONS, updated);
  
  // Deduct from budget spent
  if (target.type === "EXPENSE") {
    const budgets = getStorageItem<Budget[]>(KEYS.BUDGETS, SEED_BUDGETS);
    const updatedBudgets = budgets.map((b) => {
      if (b.category === target.category) {
        return { ...b, spent: Math.max(0, b.spent - target.amount) };
      }
      return b;
    });
    setStorageItem(KEYS.BUDGETS, updatedBudgets);
  }
  
  return { success: true };
};

// 2. Analytics Engine
export const getAnalytics = async () => {
  initializeDatabase();
  const txs = getStorageItem<Transaction[]>(KEYS.TRANSACTIONS, SEED_TRANSACTIONS);
  
  const totalIncome = txs
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = txs
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;
  
  // Spend by category
  const categoriesMap: Record<string, number> = {};
  txs.filter((t) => t.type === "EXPENSE").forEach((t) => {
    categoriesMap[t.category] = (categoriesMap[t.category] || 0) + t.amount;
  });
  
  const categoryBreakdown = Object.entries(categoriesMap).map(([cat, amt]) => ({
    category: cat,
    total: amt,
    percentage: totalExpenses > 0 ? Math.round((amt / totalExpenses) * 100) : 0,
  })).sort((a, b) => b.total - a.total);
  
  return {
    success: true,
    data: {
      totalIncome,
      totalExpenses,
      netSavings,
      savingsRate: Math.max(0, savingsRate),
      categoryBreakdown,
    },
  };
};

// 3. Dynamic Insights Engine
export const getInsights = async () => {
  initializeDatabase();
  const txs = getStorageItem<Transaction[]>(KEYS.TRANSACTIONS, SEED_TRANSACTIONS);
  const budgets = getStorageItem<Budget[]>(KEYS.BUDGETS, SEED_BUDGETS);
  
  const insights: FinancialInsight[] = [];
  
  const totalFood = txs
    .filter((t) => t.type === "EXPENSE" && t.category === TransactionCategory.FOOD)
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalIncome = txs
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = txs
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);
    
  // 1. Food insights
  if (totalFood > 1000) {
    insights.push({
      id: "ins-1",
      type: "BEHAVIORAL_PATTERN",
      priority: "MEDIUM",
      title: "High Food Spending",
      message: `You've spent ₹${totalFood.toLocaleString()} on food delivery & coffee this month. Skip buying coffees out this week to save around ₹1,200!`,
      body: `You've spent ₹${totalFood.toLocaleString()} on food delivery & coffee this month. Skip buying coffees out this week to save around ₹1,200!`,
      createdAt: new Date().toISOString(),
    });
  }
  
  // 2. Budget limits alert
  budgets.forEach((b, idx) => {
    if (b.spent > b.amount * 0.85) {
      insights.push({
        id: `ins-b-${idx}`,
        type: "BUDGET_WARNING",
        priority: "HIGH",
        title: `${b.category} Budget Alert`,
        message: `Your ${b.category.toLowerCase()} spending is at ${Math.round((b.spent / b.amount) * 100)}% of your monthly budget. Pause transactions here to prevent overspending.`,
        body: `Your ${b.category.toLowerCase()} spending is at ${Math.round((b.spent / b.amount) * 100)}% of your monthly budget. Pause transactions here to prevent overspending.`,
        createdAt: new Date().toISOString(),
      });
    }
  });

  // 3. General savings advice
  const netSavings = totalIncome - totalExpenses;
  const rate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
  if (rate < 15 && totalIncome > 0) {
    insights.push({
      id: "ins-sav",
      type: "SAVINGS_TIP",
      priority: "HIGH",
      title: "Boost Your Savings Rate",
      message: `Your savings rate is ${Math.round(rate)}%. Building a habit of saving 20% of your earnings sets you up perfectly for future goals. Try cutting down shopping bills!`,
      body: `Your savings rate is ${Math.round(rate)}%. Building a habit of saving 20% of your earnings sets you up perfectly for future goals. Try cutting down shopping bills!`,
      createdAt: new Date().toISOString(),
    });
  } else {
    insights.push({
      id: "ins-sav-success",
      type: "ACHIEVEMENT",
      priority: "LOW",
      title: "Excellent Savings Score!",
      message: `Amazing! You saved ₹${netSavings.toLocaleString()} this month, putting you on track to buy your PS5 Pro ahead of schedule! Keep going!`,
      body: `Amazing! You saved ₹${netSavings.toLocaleString()} this month, putting you on track to buy your PS5 Pro ahead of schedule! Keep going!`,
      createdAt: new Date().toISOString(),
    });
  }
  
  return {
    success: true,
    data: insights,
  };
};

// 4. Subscriptions Radar
export const getSubscriptions = async () => {
  initializeDatabase();
  const txs = getStorageItem<Transaction[]>(KEYS.TRANSACTIONS, SEED_TRANSACTIONS);
  
  // Find recurring charges
  const recs = txs.filter((t) => t.isRecurring || t.category === TransactionCategory.SUBSCRIPTIONS);
  
  return {
    success: true,
    data: recs,
  };
};

// 5. Budgets
export const getBudgets = async () => {
  initializeDatabase();
  const budgets = getStorageItem<Budget[]>(KEYS.BUDGETS, SEED_BUDGETS);
  return {
    success: true,
    data: budgets,
  };
};

// 6. Savings Goals
export const getGoals = async () => {
  initializeDatabase();
  const goals = getStorageItem<SavingsGoal[]>(KEYS.GOALS, SEED_GOALS);
  return {
    success: true,
    data: goals,
  };
};

export const addGoal = async (data: Omit<SavingsGoal, "id" | "currentAmount" | "status">) => {
  initializeDatabase();
  const goals = getStorageItem<SavingsGoal[]>(KEYS.GOALS, SEED_GOALS);
  const newGoal: SavingsGoal = {
    id: `goal-${Date.now()}`,
    name: data.name,
    emoji: data.emoji || "🎯",
    targetAmount: data.targetAmount,
    currentAmount: 0,
    targetDate: data.targetDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    status: "ACTIVE",
  };
  const updated = [...goals, newGoal];
  setStorageItem(KEYS.GOALS, updated);
  return { success: true, data: newGoal };
};

export const updateGoalAmount = async (id: string, amount: number) => {
  initializeDatabase();
  const goals = getStorageItem<SavingsGoal[]>(KEYS.GOALS, SEED_GOALS);
  const updated = goals.map((g) => {
    if (g.id === id) {
      const currentAmount = g.currentAmount + amount;
      return {
        ...g,
        currentAmount,
        status: currentAmount >= g.targetAmount ? ("COMPLETED" as const) : g.status,
      };
    }
    return g;
  });
  setStorageItem(KEYS.GOALS, updated);
  return { success: true };
};

// 7. Delete Goal
export const deleteGoal = async (id: string) => {
  initializeDatabase();
  const goals = getStorageItem<SavingsGoal[]>(KEYS.GOALS, SEED_GOALS);
  const updated = goals.filter((g) => g.id !== id);
  setStorageItem(KEYS.GOALS, updated);
  return { success: true };
};

// 8. Budgets CRUD
export const addBudget = async (data: { category: TransactionCategory; amount: number }) => {
  initializeDatabase();
  const budgets = getStorageItem<Budget[]>(KEYS.BUDGETS, SEED_BUDGETS);
  const existing = budgets.find((b) => b.category === data.category);
  if (existing) {
    const updated = budgets.map((b) =>
      b.category === data.category ? { ...b, amount: data.amount } : b
    );
    setStorageItem(KEYS.BUDGETS, updated);
  } else {
    setStorageItem(KEYS.BUDGETS, [...budgets, { category: data.category, amount: data.amount, spent: 0 }]);
  }
  return { success: true };
};

export const deleteBudget = async (category: TransactionCategory) => {
  initializeDatabase();
  const budgets = getStorageItem<Budget[]>(KEYS.BUDGETS, SEED_BUDGETS);
  setStorageItem(KEYS.BUDGETS, budgets.filter((b) => b.category !== category));
  return { success: true };
};

// ── Profile (localStorage-backed) ────────────────────────────────
export interface UserProfile {
  name: string;
  email: string;
  currency: string;
  monthlyBudget: number;
  onboardingDone: boolean;
}

const PROFILE_KEY = "pocketpilot_profile";
const DEFAULT_PROFILE: UserProfile = {
  name: "",
  email: "",
  currency: "INR",
  monthlyBudget: 0,
  onboardingDone: false,
};

export const getProfile = async () => {
  const profile = getStorageItem<UserProfile>(PROFILE_KEY, DEFAULT_PROFILE);
  return { success: true, data: profile };
};

export const updateProfile = async (data: Partial<UserProfile>) => {
  const current = getStorageItem<UserProfile>(PROFILE_KEY, DEFAULT_PROFILE);
  const updated = { ...current, ...data };
  setStorageItem(PROFILE_KEY, updated);
  return { success: true, data: updated };
};

// ── Data Export & Reset ──────────────────────────────────────────
export const exportDataAsCSV = (): string => {
  const txs = getStorageItem<Transaction[]>(KEYS.TRANSACTIONS, []);
  if (txs.length === 0) return "";
  const headers = "Date,Type,Category,Description,Amount\n";
  const rows = txs.map((t) =>
    `${new Date(t.date).toLocaleDateString()},${t.type},${t.category},"${t.description}",${t.amount}`
  ).join("\n");
  return headers + rows;
};

export const resetAllData = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEYS.TRANSACTIONS);
  localStorage.removeItem(KEYS.BUDGETS);
  localStorage.removeItem(KEYS.GOALS);
  localStorage.removeItem(KEYS.INSIGHTS);
  localStorage.removeItem(PROFILE_KEY);
};

export const login = async (_data: Record<string, unknown>) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", "pilot-session");
  }
  return { success: true, token: "pilot-session" };
};

export const register = async (data: Record<string, unknown>) => {
  return login(data);
};
