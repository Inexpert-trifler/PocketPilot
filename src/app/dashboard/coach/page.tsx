"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { BrainCircuit, Send, Sparkles, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getAnalytics,
  getBudgets,
  getGoals,
  getProfile,
  getTransactions,
  subscribeToDataChanges,
  TransactionCategory,
  type AnalyticsSummary,
  type Budget,
  type SavingsGoal,
  type Transaction,
  type UserProfile,
} from "@/lib/api";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  chartData?: Array<{ name: string; spend?: number; limit?: number; spent?: number }>;
  chartType?: "area" | "bar";
};

type Context = {
  analytics: AnalyticsSummary | null;
  budgets: Budget[];
  goals: SavingsGoal[];
  profile: UserProfile | null;
  transactions: Transaction[];
};

const SUGGESTIONS = [
  "Can I afford AirPods this month?",
  "How much did I spend on food?",
  "Where am I overspending?",
  "Give me tips to save 5000",
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

function buildCoachReply(query: string, context: Context): Message {
  const lower = query.toLowerCase();
  const analytics = context.analytics;
  const transactions = context.transactions;
  const budgets = context.budgets;
  const goals = context.goals;

  const defaultReply: Message = {
    id: `${Date.now()}-ai`,
    role: "ai",
    content:
      "Ask about spending, budgets, subscriptions, or savings goals and I will answer using your current demo data.",
  };

  if (!analytics) return defaultReply;

  if (lower.includes("afford") || lower.includes("buy") || lower.includes("airpods")) {
    const goalGap = goals
      .filter((goal) => goal.status === "ACTIVE")
      .reduce((sum, goal) => sum + Math.max(0, goal.targetAmount - goal.currentAmount), 0);

    if (analytics.netSavings > 20000 && goalGap < 50000) {
      return {
        id: `${Date.now()}-ai`,
        role: "ai",
        content: `You have ${formatCurrency(
          analytics.netSavings
        )} left after this month's tracked spending. A purchase like AirPods looks affordable, but I would still keep your active goals in view before spending impulsively.`,
      };
    }

    return {
      id: `${Date.now()}-ai`,
      role: "ai",
      content: `You are currently sitting at ${formatCurrency(
        analytics.netSavings
      )} in month-to-date savings. I would wait a bit before a big discretionary purchase unless you are comfortable slowing your goals.`,
    };
  }

  if (
    lower.includes("food") ||
    lower.includes("swiggy") ||
    lower.includes("zomato") ||
    lower.includes("eat")
  ) {
    const foodTransactions = transactions.filter(
      (transaction) =>
        transaction.category === TransactionCategory.FOOD &&
        transaction.type === "EXPENSE"
    );

    const totalFood = foodTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    const trend = analytics.weeklyTrend;

    return {
      id: `${Date.now()}-ai`,
      role: "ai",
      content: `You spent ${formatCurrency(
        totalFood
      )} on food this month. Your daily trend is below, and it looks like the biggest spikes came from convenience orders rather than steady essentials.`,
      chartData: trend,
      chartType: "area",
    };
  }

  if (
    lower.includes("overspend") ||
    lower.includes("budget") ||
    lower.includes("where did my money go")
  ) {
    const stressed = budgets.filter(
      (budget) => budget.amount > 0 && budget.spent >= budget.amount * 0.8
    );

    if (stressed.length === 0) {
      return {
        id: `${Date.now()}-ai`,
        role: "ai",
        content:
          "You are currently inside your tracked budget limits. The next best move is keeping shopping and food steady so the month closes strong.",
      };
    }

    return {
      id: `${Date.now()}-ai`,
      role: "ai",
      content: `Your hottest categories right now are ${stressed
        .map((budget) => budget.category)
        .join(", ")}. I would prioritize cooling those first before adjusting smaller categories.`,
      chartData: stressed.map((budget) => ({
        name: budget.category,
        spent: budget.spent,
        limit: budget.amount,
      })),
      chartType: "bar",
    };
  }

  if (lower.includes("save") || lower.includes("tips")) {
    const shopping = transactions
      .filter(
        (transaction) =>
          transaction.category === TransactionCategory.SHOPPING &&
          transaction.type === "EXPENSE"
      )
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const food = transactions
      .filter(
        (transaction) =>
          transaction.category === TransactionCategory.FOOD &&
          transaction.type === "EXPENSE"
      )
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return {
      id: `${Date.now()}-ai`,
      role: "ai",
      content: `To free up another 5000 this month, start with the categories you can influence quickly: shopping is at ${formatCurrency(
        shopping
      )} and food is at ${formatCurrency(
        food
      )}. Cutting just a portion of each is more realistic than trying to save everything from one place.`,
    };
  }

  return defaultReply;
}

export default function CoachPage() {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [context, setContext] = useState<Context>({
    analytics: null,
    budgets: [],
    goals: [],
    profile: null,
    transactions: [],
  });
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      content:
        "Hi there. I am your PocketPilot coach. Ask about budgets, food spending, affordability, or savings strategy and I will answer from your live demo data.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const loadContext = async () => {
      const [transactionsRes, budgetsRes, analyticsRes, goalsRes, profileRes] =
        await Promise.all([
          getTransactions(),
          getBudgets(),
          getAnalytics(),
          getGoals(),
          getProfile(),
        ]);

      setContext({
        analytics: analyticsRes.data,
        budgets: budgetsRes.data,
        goals: goalsRes.data,
        profile: profileRes.data,
        transactions: transactionsRes.data.transactions,
      });
    };

    void loadContext();
    return subscribeToDataChanges(() => {
      void loadContext();
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isTyping, messages]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: "user",
      content: text,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsTyping(true);

    window.setTimeout(() => {
      setMessages((current) => [...current, buildCoachReply(text, context)]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] animate-in-fade">
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <BrainCircuit className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">AI Coach</h1>
          <p className="text-white/50 text-sm">
            Personalized guidance for {context.profile?.name || "your"} current money flow.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar glass rounded-[2rem] border-white/5 p-4 md:p-6 mb-4 relative flex flex-col gap-6">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex gap-3 max-w-[85%] ${message.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  message.role === "ai"
                    ? "bg-gradient-to-tr from-indigo-500 to-purple-500"
                    : "bg-white/10"
                }`}
              >
                {message.role === "ai" ? (
                  <Sparkles className="w-4 h-4 text-white" />
                ) : (
                  <User className="w-4 h-4 text-white/70" />
                )}
              </div>

              <div
                className={`rounded-2xl px-5 py-3.5 ${
                  message.role === "user"
                    ? "bg-white text-black rounded-tr-sm"
                    : "bg-white/5 border border-white/10 text-white/90 rounded-tl-sm"
                }`}
              >
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </div>

                {message.chartData && message.chartType === "area" ? (
                  <div className="mt-4 h-40 w-full min-w-[250px] md:min-w-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={message.chartData}>
                        <defs>
                          <linearGradient id="colorSpendCoach" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#121212", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px" }}
                          itemStyle={{ color: "#fff" }}
                        />
                        <Area type="monotone" dataKey="spend" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorSpendCoach)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : null}

                {message.chartData && message.chartType === "bar" ? (
                  <div className="mt-4 h-40 w-full min-w-[250px] md:min-w-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={message.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#121212", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px" }}
                          cursor={{ fill: "rgba(255,255,255,0.05)" }}
                        />
                        <Bar dataKey="spent" radius={[4, 4, 0, 0]}>
                          {message.chartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={(entry.spent ?? 0) > (entry.limit ?? 0) ? "#ef4444" : "#a855f7"}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : null}
              </div>
            </motion.div>
          ))}

          {isTyping ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 max-w-[85%] mr-auto"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="rounded-2xl px-5 py-4 bg-white/5 border border-white/10 rounded-tl-sm flex items-center gap-1.5">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-white/50 rounded-full" />
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-white/50 rounded-full" />
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-white/50 rounded-full" />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 space-y-3">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {SUGGESTIONS.map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              className="border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white rounded-full"
              onClick={() => handleSend(suggestion)}
            >
              {suggestion}
            </Button>
          ))}
        </div>

        <div className="glass rounded-[1.5rem] border-white/5 p-3 flex items-center gap-3">
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSend(input);
              }
            }}
            placeholder="Ask about budgets, subscriptions, or savings..."
            className="border-0 bg-transparent text-white placeholder:text-white/35 focus-visible:ring-0"
          />
          <Button className="rounded-full bg-white text-black hover:bg-white/90" onClick={() => handleSend(input)}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
