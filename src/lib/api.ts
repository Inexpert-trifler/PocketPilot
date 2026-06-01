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
export type BillingCycle = "MONTHLY" | "YEARLY";
export type DemoPlan = "FREE" | "PRO";

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  date: string;
  isRecurring: boolean;
  merchant?: string;
  source?: "manual" | "upload" | "scan" | "seed";
  billingCycle?: BillingCycle | null;
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
  body: string;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  currency: string;
  monthlyBudget: number;
  onboardingDone: boolean;
  plan: DemoPlan;
  planActivatedAt?: string;
}

export interface AnalyticsSummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  dailyAverage: number;
  transactionCount: number;
  weeklyTrend: Array<{ name: string; spend: number }>;
  monthlyTrend: Array<{ name: string; income: number; expenses: number }>;
  categoryBreakdown: Array<{
    category: TransactionCategory | string;
    total: number;
    percentage: number;
    count: number;
  }>;
}

export interface ScanSuggestion {
  amount: number;
  date: string;
  description: string;
  type: TransactionType;
  category: TransactionCategory;
  isRecurring: boolean;
  merchant?: string;
  confidence: "HIGH" | "MEDIUM";
  summary: string;
}

const KEYS = {
  TRANSACTIONS: "pocketpilot_transactions",
  BUDGETS: "pocketpilot_budgets",
  GOALS: "pocketpilot_goals",
  PROFILE: "pocketpilot_profile",
  SESSION: "pocketpilot_session",
  SEEDED: "pocketpilot_demo_seeded_v2",
} as const;

const DATA_EVENT = "pocketpilot:data-change";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const daysAgoIso = (daysAgo: number, hour = 12) => {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

const DEFAULT_PROFILE: UserProfile = {
  name: "Alex",
  email: "alex@pocketpilot.app",
  currency: "INR",
  monthlyBudget: 42000,
  onboardingDone: true,
  plan: "FREE",
};

const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-seed-1",
    amount: 52000,
    type: "INCOME",
    category: TransactionCategory.SALARY,
    description: "Monthly stipend",
    date: daysAgoIso(24, 10),
    isRecurring: true,
    merchant: "Campus Ventures",
    source: "seed",
    billingCycle: "MONTHLY",
  },
  {
    id: "tx-seed-2",
    amount: 1299,
    type: "EXPENSE",
    category: TransactionCategory.SUBSCRIPTIONS,
    description: "Spotify Premium",
    date: daysAgoIso(22, 9),
    isRecurring: true,
    merchant: "Spotify",
    source: "seed",
    billingCycle: "MONTHLY",
  },
  {
    id: "tx-seed-3",
    amount: 7450,
    type: "EXPENSE",
    category: TransactionCategory.RENT,
    description: "PG rent",
    date: daysAgoIso(21, 8),
    isRecurring: true,
    merchant: "North Block Residency",
    source: "seed",
    billingCycle: "MONTHLY",
  },
  {
    id: "tx-seed-4",
    amount: 840,
    type: "EXPENSE",
    category: TransactionCategory.FOOD,
    description: "Zomato dinner order",
    date: daysAgoIso(5, 21),
    isRecurring: false,
    merchant: "Zomato",
    source: "seed",
  },
  {
    id: "tx-seed-5",
    amount: 560,
    type: "EXPENSE",
    category: TransactionCategory.TRANSPORT,
    description: "Uber rides",
    date: daysAgoIso(4, 18),
    isRecurring: false,
    merchant: "Uber",
    source: "seed",
  },
  {
    id: "tx-seed-6",
    amount: 3200,
    type: "EXPENSE",
    category: TransactionCategory.SHOPPING,
    description: "Amazon essentials",
    date: daysAgoIso(4, 14),
    isRecurring: false,
    merchant: "Amazon",
    source: "seed",
  },
  {
    id: "tx-seed-7",
    amount: 450,
    type: "EXPENSE",
    category: TransactionCategory.FOOD,
    description: "Campus cafe coffee",
    date: daysAgoIso(3, 11),
    isRecurring: false,
    merchant: "Campus Cafe",
    source: "seed",
  },
  {
    id: "tx-seed-8",
    amount: 799,
    type: "EXPENSE",
    category: TransactionCategory.SUBSCRIPTIONS,
    description: "Notion Plus",
    date: daysAgoIso(2, 9),
    isRecurring: true,
    merchant: "Notion",
    source: "seed",
    billingCycle: "MONTHLY",
  },
  {
    id: "tx-seed-9",
    amount: 1650,
    type: "EXPENSE",
    category: TransactionCategory.EDUCATION,
    description: "Design course notes",
    date: daysAgoIso(2, 15),
    isRecurring: false,
    merchant: "CourseMart",
    source: "seed",
  },
  {
    id: "tx-seed-10",
    amount: 2200,
    type: "INCOME",
    category: TransactionCategory.FREELANCE,
    description: "Freelance UI project",
    date: daysAgoIso(1, 20),
    isRecurring: false,
    merchant: "Freelance Client",
    source: "seed",
  },
  {
    id: "tx-seed-11",
    amount: 1199,
    type: "EXPENSE",
    category: TransactionCategory.GAMING,
    description: "Steam wallet top-up",
    date: daysAgoIso(1, 22),
    isRecurring: false,
    merchant: "Steam",
    source: "seed",
  },
  {
    id: "tx-seed-12",
    amount: 620,
    type: "EXPENSE",
    category: TransactionCategory.BILLS,
    description: "Airtel recharge",
    date: daysAgoIso(0, 9),
    isRecurring: false,
    merchant: "Airtel",
    source: "seed",
  },
];

const DEFAULT_BUDGET_TARGETS: Array<Pick<Budget, "category" | "amount">> = [
  { category: TransactionCategory.FOOD, amount: 7000 },
  { category: TransactionCategory.SHOPPING, amount: 6000 },
  { category: TransactionCategory.SUBSCRIPTIONS, amount: 2500 },
  { category: TransactionCategory.TRANSPORT, amount: 3000 },
  { category: TransactionCategory.EDUCATION, amount: 4000 },
];

const DEFAULT_GOALS: SavingsGoal[] = [
  {
    id: "goal-seed-1",
    name: "Emergency Fund",
    emoji: "🛟",
    targetAmount: 55000,
    currentAmount: 32000,
    targetDate: daysAgoIso(-120),
    status: "ACTIVE",
  },
  {
    id: "goal-seed-2",
    name: "Goa Trip",
    emoji: "🏝️",
    targetAmount: 18000,
    currentAmount: 8000,
    targetDate: daysAgoIso(-75),
    status: "ACTIVE",
  },
];

const CATEGORY_RULES: Array<{
  category: TransactionCategory;
  patterns: RegExp[];
}> = [
  {
    category: TransactionCategory.FOOD,
    patterns: [
      /swiggy|zomato|dunzo|eatsure|faasos|freshmenu|box8/i,
      /mcdonald|dominos|pizza.*hut|kfc|subway|burger.*king/i,
      /starbucks|cafe.*coffee|chaayos|third.*wave|coffee/i,
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
    ],
  },
  {
    category: TransactionCategory.SHOPPING,
    patterns: [
      /amazon|flipkart|myntra|meesho|nykaa|ajio|tatacliq/i,
      /mall|store|shop|retail|boutique/i,
    ],
  },
  {
    category: TransactionCategory.TRANSPORT,
    patterns: [
      /uber|ola|rapido|meru|taxi|cab|auto/i,
      /irctc|railway|train|metro|bus/i,
      /fuel|petrol|diesel/i,
    ],
  },
  {
    category: TransactionCategory.HEALTHCARE,
    patterns: [/pharmacy|medical|hospital|clinic|doctor|dentist/i],
  },
  {
    category: TransactionCategory.EDUCATION,
    patterns: [/udemy|coursera|byju|unacademy|course|college|tuition/i],
  },
  {
    category: TransactionCategory.BILLS,
    patterns: [/electricity|water.*bill|gas.*bill|broadband|wifi|internet/i, /jio|airtel|vi|bsnl|recharge|mobile.*bill/i],
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
    patterns: [/upwork|fiverr|freelance|consulting|client/i],
  },
];

const storageAvailable = () => typeof window !== "undefined";

const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (!storageAvailable()) return defaultValue;

  const data = window.localStorage.getItem(key);
  if (!data) {
    window.localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }

  try {
    return JSON.parse(data) as T;
  } catch {
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, value: T) => {
  if (!storageAvailable()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const emitDataChange = () => {
  if (!storageAvailable()) return;
  window.dispatchEvent(new CustomEvent(DATA_EVENT));
};

export const subscribeToDataChanges = (callback: () => void) => {
  if (!storageAvailable()) return () => undefined;
  window.addEventListener(DATA_EVENT, callback);
  return () => window.removeEventListener(DATA_EVENT, callback);
};

const round = (value: number) => Math.round(value * 100) / 100;

const getWeekdayLabel = (date: Date) => dayNames[date.getDay()];

const prettifyLabel = (value: string) =>
  value
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const createBudgetsFromTargets = (
  targets: Array<Pick<Budget, "category" | "amount">>,
  transactions: Transaction[]
): Budget[] =>
  targets.map((target) => {
    const spent = transactions
      .filter(
        (transaction) =>
          transaction.type === "EXPENSE" &&
          transaction.category === target.category
      )
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return {
      category: target.category,
      amount: target.amount,
      spent: round(spent),
    };
  });

const syncBudgetsWithTransactions = (
  budgets: Budget[],
  transactions: Transaction[]
): Budget[] =>
  budgets.map((budget) => ({
    ...budget,
    spent: round(
      transactions
        .filter(
          (transaction) =>
            transaction.type === "EXPENSE" &&
            transaction.category === budget.category
        )
        .reduce((sum, transaction) => sum + transaction.amount, 0)
    ),
  }));

const getTransactionsStore = () =>
  getStorageItem<Transaction[]>(KEYS.TRANSACTIONS, DEFAULT_TRANSACTIONS);

const setTransactionsStore = (transactions: Transaction[]) => {
  setStorageItem(KEYS.TRANSACTIONS, transactions);
};

const getBudgetsStore = () => {
  const stored = getStorageItem<Budget[]>(
    KEYS.BUDGETS,
    createBudgetsFromTargets(DEFAULT_BUDGET_TARGETS, DEFAULT_TRANSACTIONS)
  );
  return syncBudgetsWithTransactions(stored, getTransactionsStore());
};

const setBudgetsStore = (budgets: Budget[]) => {
  setStorageItem(KEYS.BUDGETS, budgets);
};

const getGoalsStore = () => getStorageItem<SavingsGoal[]>(KEYS.GOALS, DEFAULT_GOALS);
const setGoalsStore = (goals: SavingsGoal[]) => setStorageItem(KEYS.GOALS, goals);

const getProfileStore = () =>
  getStorageItem<UserProfile>(KEYS.PROFILE, DEFAULT_PROFILE);

const setProfileStore = (profile: UserProfile) => {
  setStorageItem(KEYS.PROFILE, profile);
};

export const initializeDatabase = () => {
  if (!storageAvailable()) return;

  const rawTransactions = getStorageItem<Transaction[]>(KEYS.TRANSACTIONS, []);
  const rawBudgets = getStorageItem<Budget[]>(KEYS.BUDGETS, []);
  const rawGoals = getStorageItem<SavingsGoal[]>(KEYS.GOALS, []);
  const rawProfile = getStorageItem<UserProfile>(KEYS.PROFILE, DEFAULT_PROFILE);

  const shouldHydrateDemoState =
    rawTransactions.length === 0 &&
    rawBudgets.length === 0 &&
    rawGoals.length === 0;

  const transactions = shouldHydrateDemoState ? DEFAULT_TRANSACTIONS : rawTransactions;
  const budgetsSource = shouldHydrateDemoState
    ? createBudgetsFromTargets(DEFAULT_BUDGET_TARGETS, transactions)
    : rawBudgets;
  const goals = shouldHydrateDemoState || rawGoals.length === 0 ? DEFAULT_GOALS : rawGoals;
  const profile =
    shouldHydrateDemoState || !rawProfile.name
      ? { ...DEFAULT_PROFILE, ...rawProfile, name: rawProfile.name || DEFAULT_PROFILE.name }
      : rawProfile;

  setTransactionsStore(transactions);
  setBudgetsStore(syncBudgetsWithTransactions(budgetsSource, transactions));
  setGoalsStore(goals);
  setProfileStore(profile);
  window.localStorage.setItem(KEYS.SEEDED, "true");
};

export function autoCategorize(description: string): TransactionCategory {
  const text = description.toLowerCase();
  for (const { category, patterns } of CATEGORY_RULES) {
    if (patterns.some((pattern) => pattern.test(text))) {
      return category;
    }
  }
  return TransactionCategory.OTHER;
}

const deriveMerchant = (description: string) =>
  prettifyLabel(description.split(" ").slice(0, 3).join(" "));

const sortTransactions = (transactions: Transaction[]) =>
  [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

const getCurrentMonthTransactions = (transactions: Transaction[]) => {
  const now = new Date();
  return transactions.filter((transaction) => {
    const date = new Date(transaction.date);
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  });
};

const getWeeklyTrend = (transactions: Transaction[]) => {
  const trend = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const label = getWeekdayLabel(date);

    const spend = transactions
      .filter((transaction) => {
        if (transaction.type !== "EXPENSE") return false;
        const transactionDate = new Date(transaction.date);
        return (
          transactionDate.getFullYear() === date.getFullYear() &&
          transactionDate.getMonth() === date.getMonth() &&
          transactionDate.getDate() === date.getDate()
        );
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return { name: label, spend: round(spend) };
  });

  return trend;
};

const getMonthlyTrend = (transactions: Transaction[]) =>
  Array.from({ length: 4 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (3 - index));
    const label = date.toLocaleDateString("en-US", { month: "short" });
    const income = transactions
      .filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        return (
          transaction.type === "INCOME" &&
          transactionDate.getMonth() === date.getMonth() &&
          transactionDate.getFullYear() === date.getFullYear()
        );
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const expenses = transactions
      .filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        return (
          transaction.type === "EXPENSE" &&
          transactionDate.getMonth() === date.getMonth() &&
          transactionDate.getFullYear() === date.getFullYear()
        );
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return {
      name: label,
      income: round(income),
      expenses: round(expenses),
    };
  });

const buildAnalytics = (transactions: Transaction[]): AnalyticsSummary => {
  const currentMonthTransactions = getCurrentMonthTransactions(transactions);

  const totalIncome = currentMonthTransactions
    .filter((transaction) => transaction.type === "INCOME")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalExpenses = currentMonthTransactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const categoryMap = new Map<
    TransactionCategory,
    { total: number; count: number }
  >();

  currentMonthTransactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .forEach((transaction) => {
      const entry = categoryMap.get(transaction.category) ?? {
        total: 0,
        count: 0,
      };
      entry.total += transaction.amount;
      entry.count += 1;
      categoryMap.set(transaction.category, entry);
    });

  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      total: round(data.total),
      percentage:
        totalExpenses > 0 ? Math.round((data.total / totalExpenses) * 100) : 0,
      count: data.count,
    }))
    .sort((a, b) => b.total - a.total);

  const netSavings = totalIncome - totalExpenses;
  const daysSoFar = Math.max(1, new Date().getDate());

  return {
    totalIncome: round(totalIncome),
    totalExpenses: round(totalExpenses),
    netSavings: round(netSavings),
    savingsRate:
      totalIncome > 0 ? Math.max(0, Math.round((netSavings / totalIncome) * 100)) : 0,
    dailyAverage: round(totalExpenses / daysSoFar),
    transactionCount: currentMonthTransactions.length,
    weeklyTrend: getWeeklyTrend(transactions),
    monthlyTrend: getMonthlyTrend(transactions),
    categoryBreakdown,
  };
};

const buildInsightBody = (message: string) => message;

export const getTransactions = async (
  params?: Partial<{
    limit: string | number;
    search: string;
    type: TransactionType;
    category: TransactionCategory;
    recurringOnly: boolean;
  }>
) => {
  initializeDatabase();

  let transactions = sortTransactions(getTransactionsStore());

  if (params?.search) {
    const query = params.search.toLowerCase();
    transactions = transactions.filter(
      (transaction) =>
        transaction.description.toLowerCase().includes(query) ||
        transaction.category.toLowerCase().includes(query) ||
        transaction.merchant?.toLowerCase().includes(query)
    );
  }

  if (params?.type) {
    transactions = transactions.filter(
      (transaction) => transaction.type === params.type
    );
  }

  if (params?.category) {
    transactions = transactions.filter(
      (transaction) => transaction.category === params.category
    );
  }

  if (params?.recurringOnly) {
    transactions = transactions.filter((transaction) => transaction.isRecurring);
  }

  if (params?.limit) {
    transactions = transactions.slice(0, Number(params.limit));
  }

  return {
    success: true,
    data: {
      transactions,
    },
  };
};

export const addTransaction = async (
  data: Omit<Transaction, "id" | "category" | "isRecurring"> & {
    category?: TransactionCategory;
    isRecurring?: boolean;
  }
) => {
  initializeDatabase();

  const transactions = getTransactionsStore();
  const category = data.category ?? autoCategorize(data.description);
  const isRecurring =
    data.isRecurring ??
    /premium|subscription|netflix|spotify|youtube|monthly|renewal|plan/i.test(
      data.description
    );

  const newTransaction: Transaction = {
    id: `tx-${Date.now()}`,
    amount: round(data.amount),
    type: data.type,
    category,
    description: data.description.trim(),
    date: data.date ?? new Date().toISOString(),
    isRecurring,
    merchant: data.merchant ?? deriveMerchant(data.description),
    source: data.source ?? "manual",
    billingCycle: data.billingCycle ?? (isRecurring ? "MONTHLY" : null),
  };

  const updatedTransactions = sortTransactions([newTransaction, ...transactions]);
  setTransactionsStore(updatedTransactions);
  setBudgetsStore(syncBudgetsWithTransactions(getBudgetsStore(), updatedTransactions));
  emitDataChange();

  return {
    success: true,
    data: newTransaction,
  };
};

export const importTransactions = async (
  transactionsToImport: Array<
    Omit<Transaction, "id" | "category" | "isRecurring"> & {
      category?: TransactionCategory;
      isRecurring?: boolean;
    }
  >
) => {
  const imported: Transaction[] = [];

  for (const transaction of transactionsToImport) {
    const result = await addTransaction({
      ...transaction,
      source: transaction.source ?? "upload",
    });
    imported.push(result.data);
  }

  return {
    success: true,
    data: imported,
  };
};

export const deleteTransaction = async (id: string) => {
  initializeDatabase();

  const transactions = getTransactionsStore();
  const updatedTransactions = transactions.filter(
    (transaction) => transaction.id !== id
  );

  if (updatedTransactions.length === transactions.length) {
    return { success: false, error: "Transaction not found" };
  }

  setTransactionsStore(updatedTransactions);
  setBudgetsStore(syncBudgetsWithTransactions(getBudgetsStore(), updatedTransactions));
  emitDataChange();

  return { success: true };
};

export const toggleRecurringTransaction = async (id: string) => {
  initializeDatabase();

  const transactions = getTransactionsStore();
  const updatedTransactions: Transaction[] = transactions.map((transaction) =>
    transaction.id === id
      ? {
          ...transaction,
          isRecurring: !transaction.isRecurring,
          billingCycle: !transaction.isRecurring
            ? ("MONTHLY" as const)
            : null,
        }
      : transaction
  );

  setTransactionsStore(updatedTransactions);
  emitDataChange();

  return { success: true };
};

export const getAnalytics = async () => {
  initializeDatabase();
  return {
    success: true,
    data: buildAnalytics(getTransactionsStore()),
  };
};

export const getInsights = async () => {
  initializeDatabase();

  const transactions = getTransactionsStore();
  const budgets = getBudgetsStore();
  const goals = getGoalsStore();
  const analytics = buildAnalytics(transactions);

  const insights: FinancialInsight[] = [];
  const totalFood = analytics.categoryBreakdown.find(
    (item) => item.category === TransactionCategory.FOOD
  )?.total;

  if ((totalFood ?? 0) > 1200) {
    const message = `Food spending is at ${currencyFormatter.format(
      totalFood ?? 0
    )} this month. One lower-spend weekend would meaningfully improve your savings rate.`;
    insights.push({
      id: "ins-food",
      type: "BEHAVIORAL_PATTERN",
      priority: "MEDIUM",
      title: "Food spend is running hot",
      message,
      body: buildInsightBody(message),
      createdAt: new Date().toISOString(),
    });
  }

  const riskBudget = budgets
    .filter((budget) => budget.amount > 0)
    .sort(
      (left, right) =>
        right.spent / right.amount - left.spent / left.amount
    )[0];

  if (riskBudget && riskBudget.spent >= riskBudget.amount * 0.85) {
    const percentage = Math.round((riskBudget.spent / riskBudget.amount) * 100);
    const message = `${riskBudget.category} budget is already at ${percentage}% of target. Slow this category down to avoid an end-of-month squeeze.`;
    insights.push({
      id: "ins-budget",
      type: "BUDGET_WARNING",
      priority: "HIGH",
      title: `${prettifyLabel(riskBudget.category)} budget needs attention`,
      message,
      body: buildInsightBody(message),
      createdAt: new Date().toISOString(),
    });
  }

  const nearestGoal = goals
    .filter((goal) => goal.status === "ACTIVE")
    .sort(
      (left, right) =>
        left.targetAmount - left.currentAmount - (right.targetAmount - right.currentAmount)
    )[0];

  if (nearestGoal) {
    const remaining = Math.max(
      0,
      nearestGoal.targetAmount - nearestGoal.currentAmount
    );
    const message = `${nearestGoal.emoji} ${nearestGoal.name} is ${currencyFormatter.format(
      remaining
    )} away. Keeping current savings on track can get you there faster.`;
    insights.push({
      id: "ins-goal",
      type: "GOAL_PROGRESS",
      priority: "LOW",
      title: "Your nearest goal is within reach",
      message,
      body: buildInsightBody(message),
      createdAt: new Date().toISOString(),
    });
  }

  if (insights.length === 0) {
    const message =
      "Your money flow looks balanced right now. Keep logging transactions to unlock sharper coaching and better budget alerts.";
    insights.push({
      id: "ins-steady",
      type: "MOMENTUM",
      priority: "LOW",
      title: "Solid financial rhythm",
      message,
      body: buildInsightBody(message),
      createdAt: new Date().toISOString(),
    });
  }

  return {
    success: true,
    data: insights,
  };
};

export const getSubscriptions = async () => {
  initializeDatabase();
  const subscriptions = sortTransactions(
    getTransactionsStore().filter(
      (transaction) =>
        transaction.type === "EXPENSE" &&
        (transaction.isRecurring ||
          transaction.category === TransactionCategory.SUBSCRIPTIONS)
    )
  );

  return {
    success: true,
    data: subscriptions,
  };
};

export const getBudgets = async () => {
  initializeDatabase();
  return {
    success: true,
    data: getBudgetsStore(),
  };
};

export const addBudget = async (data: {
  category: TransactionCategory;
  amount: number;
}) => {
  initializeDatabase();

  const budgets = getBudgetsStore();
  const existing = budgets.find((budget) => budget.category === data.category);

  const nextBudgets = existing
    ? budgets.map((budget) =>
        budget.category === data.category
          ? { ...budget, amount: round(data.amount) }
          : budget
      )
    : [
        ...budgets,
        {
          category: data.category,
          amount: round(data.amount),
          spent: 0,
        },
      ];

  setBudgetsStore(syncBudgetsWithTransactions(nextBudgets, getTransactionsStore()));
  emitDataChange();

  return { success: true };
};

export const deleteBudget = async (category: TransactionCategory) => {
  initializeDatabase();
  setBudgetsStore(
    getBudgetsStore().filter((budget) => budget.category !== category)
  );
  emitDataChange();
  return { success: true };
};

export const getGoals = async () => {
  initializeDatabase();
  return {
    success: true,
    data: getGoalsStore(),
  };
};

export const addGoal = async (
  data: Omit<SavingsGoal, "id" | "currentAmount" | "status">
) => {
  initializeDatabase();

  const goals = getGoalsStore();
  const newGoal: SavingsGoal = {
    id: `goal-${Date.now()}`,
    name: data.name.trim(),
    emoji: data.emoji || "🎯",
    targetAmount: round(data.targetAmount),
    currentAmount: 0,
    targetDate:
      data.targetDate ??
      new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    status: "ACTIVE",
  };

  setGoalsStore([newGoal, ...goals]);
  emitDataChange();

  return { success: true, data: newGoal };
};

export const updateGoalAmount = async (id: string, amount: number) => {
  initializeDatabase();

  const updatedGoals: SavingsGoal[] = getGoalsStore().map((goal) => {
    if (goal.id !== id) return goal;

    const nextAmount = round(goal.currentAmount + amount);
    return {
      ...goal,
      currentAmount: nextAmount,
      status: nextAmount >= goal.targetAmount ? ("COMPLETED" as const) : "ACTIVE",
    };
  });

  setGoalsStore(updatedGoals);
  emitDataChange();

  return { success: true };
};

export const deleteGoal = async (id: string) => {
  initializeDatabase();
  setGoalsStore(getGoalsStore().filter((goal) => goal.id !== id));
  emitDataChange();
  return { success: true };
};

export const getProfile = async () => {
  initializeDatabase();
  return {
    success: true,
    data: getProfileStore(),
  };
};

export const updateProfile = async (data: Partial<UserProfile>) => {
  initializeDatabase();
  const updatedProfile = { ...getProfileStore(), ...data };
  setProfileStore(updatedProfile);
  emitDataChange();
  return { success: true, data: updatedProfile };
};

export const upgradeToPro = async () => {
  const profile = getProfileStore();
  const updatedProfile: UserProfile = {
    ...profile,
    plan: "PRO",
    planActivatedAt: new Date().toISOString(),
  };

  setProfileStore(updatedProfile);
  emitDataChange();

  return { success: true, data: updatedProfile };
};

export const exportDataAsCSV = (): string => {
  const transactions = sortTransactions(getTransactionsStore());
  if (transactions.length === 0) return "";

  const headers = "Date,Type,Category,Description,Merchant,Amount,Recurring\n";
  const rows = transactions
    .map(
      (transaction) =>
        `${new Date(transaction.date).toLocaleDateString()},${transaction.type},${transaction.category},"${transaction.description.replace(/"/g, '""')}","${(transaction.merchant ?? "").replace(/"/g, '""')}",${transaction.amount},${transaction.isRecurring ? "Yes" : "No"}`
    )
    .join("\n");

  return headers + rows;
};

export const resetAllData = () => {
  if (!storageAvailable()) return;

  window.localStorage.removeItem(KEYS.TRANSACTIONS);
  window.localStorage.removeItem(KEYS.BUDGETS);
  window.localStorage.removeItem(KEYS.GOALS);
  window.localStorage.removeItem(KEYS.PROFILE);
  window.localStorage.removeItem(KEYS.SESSION);
  window.localStorage.removeItem(KEYS.SEEDED);

  initializeDatabase();
  emitDataChange();
};

export const login = async (data: Partial<UserProfile>) => {
  if (storageAvailable()) {
    window.localStorage.setItem(KEYS.SESSION, "pilot-session");
  }

  const profile = {
    ...getProfileStore(),
    ...data,
    onboardingDone: true,
  };

  setProfileStore(profile);

  return {
    success: true,
    token: "pilot-session",
    data: profile,
  };
};

export const register = async (data: Partial<UserProfile>) => login(data);

export const signOut = async () => {
  if (storageAvailable()) {
    window.localStorage.removeItem(KEYS.SESSION);
  }
  return { success: true };
};

export const getSession = () =>
  storageAvailable() ? window.localStorage.getItem(KEYS.SESSION) : null;

export const parseCsvImport = async (
  file: File
): Promise<{ success: true; data: ScanSuggestion[] }> => {
  const raw = await file.text();
  const rows = raw
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean);

  if (rows.length <= 1) {
    return {
      success: true,
      data: [],
    };
  }

  const header = rows[0].split(",").map((column) => column.trim().toLowerCase());
  const amountIndex = header.findIndex((column) => column.includes("amount"));
  const descriptionIndex = header.findIndex(
    (column) => column.includes("description") || column.includes("merchant")
  );
  const dateIndex = header.findIndex((column) => column.includes("date"));
  const typeIndex = header.findIndex((column) => column.includes("type"));
  const categoryIndex = header.findIndex((column) => column.includes("category"));

  const suggestions: ScanSuggestion[] = rows.slice(1).flatMap((row, index) => {
    const values = row.split(",").map((value) => value.replace(/^"|"$/g, "").trim());
    const amount = Number(values[amountIndex] ?? 0);
    const description =
      values[descriptionIndex] ?? `Imported transaction ${index + 1}`;
    const typeValue = (values[typeIndex] ?? "EXPENSE").toUpperCase();
    const categoryValue = (values[categoryIndex] ?? "").toUpperCase();

    if (!Number.isFinite(amount) || amount <= 0) return [];

    const fallbackCategory = autoCategorize(description);
    const category = Object.values(TransactionCategory).includes(
      categoryValue as TransactionCategory
    )
      ? (categoryValue as TransactionCategory)
      : fallbackCategory;

    return [
      {
        amount,
        date: values[dateIndex]
          ? new Date(values[dateIndex]).toISOString()
          : new Date().toISOString(),
        description,
        type: typeValue === "INCOME" ? ("INCOME" as const) : ("EXPENSE" as const),
        category,
        isRecurring: category === TransactionCategory.SUBSCRIPTIONS,
        merchant: deriveMerchant(description),
        confidence: "HIGH" as const,
        summary: `Imported from ${file.name}`,
      },
    ];
  });

  return {
    success: true,
    data: suggestions,
  };
};

export const createScanSuggestion = async (
  file: File
): Promise<{ success: true; data: ScanSuggestion[] }> => {
  const description = prettifyLabel(file.name) || "Scanned receipt";
  const inferredAmount =
    Number(file.name.match(/(\d+(?:\.\d{1,2})?)/)?.[1] ?? 0) || 349;
  const category = autoCategorize(description);

  return {
    success: true,
    data: [
      {
        amount: inferredAmount,
        date: new Date().toISOString(),
        description,
        type: "EXPENSE",
        category,
        isRecurring: category === TransactionCategory.SUBSCRIPTIONS,
        merchant: deriveMerchant(description),
        confidence: "MEDIUM",
        summary:
          "Demo scan mode generated a smart draft. Review the details and import when it looks right.",
      },
    ],
  };
};
