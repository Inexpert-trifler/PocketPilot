"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { ArrowRight, ArrowUpRight, Plus, Receipt, ShoppingBag, Sparkles, Upload, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  getAnalytics,
  getBudgets,
  getGoals,
  getInsights,
  getProfile,
  getTransactions,
  subscribeToDataChanges,
  type AnalyticsSummary,
  type Budget,
  type FinancialInsight,
  type SavingsGoal,
  type Transaction,
  type UserProfile,
} from "@/lib/api";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const buildHealthScore = (analytics: AnalyticsSummary, budgets: Budget[]) => {
  let score = 68;

  score += Math.min(20, analytics.savingsRate / 2);
  score += analytics.transactionCount >= 8 ? 8 : 0;

  const stressedBudgets = budgets.filter(
    (budget) => budget.amount > 0 && budget.spent >= budget.amount * 0.9
  ).length;

  score -= stressedBudgets * 9;
  return Math.max(32, Math.min(96, Math.round(score)));
};

const healthLabel = (score: number) => {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Strong";
  if (score >= 55) return "Stable";
  return "Needs care";
};

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [insight, setInsight] = useState<FinancialInsight | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      const [analyticsRes, budgetRes, goalsRes, insightsRes, profileRes, txRes] =
        await Promise.all([
          getAnalytics(),
          getBudgets(),
          getGoals(),
          getInsights(),
          getProfile(),
          getTransactions({ limit: 4 }),
        ]);

      setAnalytics(analyticsRes.data);
      setBudgets(budgetRes.data);
      setGoals(goalsRes.data);
      setInsight(insightsRes.data[0] ?? null);
      setProfile(profileRes.data);
      setRecentTransactions(txRes.data.transactions);
    };

    void loadDashboard();
    return subscribeToDataChanges(() => {
      void loadDashboard();
    });
  }, []);

  const activeGoal = goals.find((goal) => goal.status === "ACTIVE") ?? goals[0] ?? null;
  const score = analytics ? buildHealthScore(analytics, budgets) : 72;
  const scoreLabel = healthLabel(score);
  const balance = analytics ? analytics.totalIncome - analytics.totalExpenses : 0;

  return (
    <div className="space-y-6 md:space-y-8 animate-in-fade">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Hey, {profile?.name || "there"}.
          </h1>
          <p className="text-white/50 text-sm md:text-base mt-1">
            Your finance cockpit is live and tracking in real time.
          </p>
        </div>

        <div className="hidden md:flex items-center gap-3 w-full md:w-auto">
          <Link href="/dashboard/transactions">
            <Button className="rounded-full bg-white text-black hover:bg-white/90">
              <Plus className="w-4 h-4 mr-2" /> Add Expense
            </Button>
          </Link>
          <Link href="/dashboard/scan">
            <Button variant="outline" className="rounded-full glass text-white hover:bg-white/10">
              <Upload className="w-4 h-4 mr-2" /> Smart Scan
            </Button>
          </Link>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-6 relative overflow-hidden border-white/10"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[60px] pointer-events-none" />
        <div className="flex gap-4 items-start relative z-10">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white">
                {insight?.title ?? "AI Insight"}
              </h3>
              {profile?.plan === "PRO" ? (
                <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-200">
                  Pro
                </Badge>
              ) : null}
            </div>
            <p className="text-white/70 text-sm leading-relaxed max-w-3xl">
              {insight?.message ??
                "Start adding transactions and budgets to unlock sharper insights and goal guidance."}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2 glass border-white/5 bg-[#0a0a0a]/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/50">
              Month-to-date position
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end mb-6">
              <div>
                <div className="text-4xl font-bold text-white">
                  {formatCurrency(balance)}
                </div>
                <div className="flex items-center gap-1 mt-2 text-white/70 text-sm font-medium">
                  <ArrowUpRight className="w-4 h-4" />
                  {analytics
                    ? `${formatCurrency(analytics.totalExpenses)} spent across ${analytics.transactionCount} entries`
                    : "No activity yet"}
                </div>
              </div>
              {analytics ? (
                <Badge variant="outline" className="border-white/10 bg-white/5 text-white/70">
                  Savings rate {analytics.savingsRate}%
                </Badge>
              ) : null}
            </div>

            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.weeklyTrend ?? []}>
                  <defs>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffffff" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#121212", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Area type="monotone" dataKey="spend" stroke="#ffffff" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="flex md:flex-col gap-4 md:gap-6 overflow-x-auto pb-4 md:pb-0 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          <Card className="min-w-[280px] md:min-w-0 glass border-white/5 bg-[#0a0a0a]/50 text-center py-6 snap-center shrink-0">
            <CardContent className="pt-4">
              <div className="text-sm font-medium text-white/50 mb-2">Financial Health</div>
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="none" />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#ffffff"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray="351.8"
                    strokeDashoffset={351.8 - (351.8 * score) / 100}
                    className="drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] transition-all duration-1000"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-bold text-white">{score}</span>
                  <span className="text-[10px] text-white/70 font-medium uppercase tracking-wider">
                    {scoreLabel}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-[280px] md:min-w-0 glass border-white/5 bg-[#0a0a0a]/50 snap-center shrink-0">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-white/50">Current Goal</CardTitle>
              <Badge variant="outline" className="bg-white/5 text-white/70 border-white/10 text-xs">
                {activeGoal?.status ?? "No goal"}
              </Badge>
            </CardHeader>
            <CardContent>
              {activeGoal ? (
                <>
                  <div className="text-white font-medium mb-3">
                    {activeGoal.emoji} {activeGoal.name}
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white font-medium">
                      {formatCurrency(activeGoal.currentAmount)}
                    </span>
                    <span className="text-white/50">
                      of {formatCurrency(activeGoal.targetAmount)}
                    </span>
                  </div>
                  <Progress
                    value={(activeGoal.currentAmount / activeGoal.targetAmount) * 100}
                    className="h-2 bg-white/5 [&>div]:bg-white"
                  />
                  <p className="text-xs text-white/40 mt-3 flex items-center">
                    <Sparkles className="w-3 h-3 mr-1 text-white/70" />
                    Target by {new Date(activeGoal.targetDate).toLocaleDateString()}
                  </p>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-white/50">Create a goal to track your next milestone.</p>
                  <Link href="/dashboard/goals">
                    <Button variant="outline" className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10">
                      Open Goals
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass border-white/5 bg-[#0a0a0a]/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-white">Recent Transactions</CardTitle>
            <Link href="/dashboard/transactions">
              <Button variant="ghost" size="sm" className="text-white/50 hover:text-white">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => {
                const positive = transaction.type === "INCOME";

                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between group cursor-pointer p-3 md:p-2 -mx-3 md:-mx-2 rounded-2xl hover:bg-white/5 active:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-4 md:gap-3">
                      <div
                        className={`w-12 h-12 md:w-10 md:h-10 rounded-full flex items-center justify-center ${
                          positive ? "bg-white/10 text-white" : "bg-white/5 text-white/80"
                        }`}
                      >
                        {positive ? <Wallet className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-semibold md:font-medium text-white text-base md:text-sm">
                          {transaction.description}
                        </div>
                        <div className="text-sm md:text-xs text-white/50">
                          {new Date(transaction.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className={`font-bold md:font-semibold text-base md:text-sm ${positive ? "text-white" : "text-white/70"}`}>
                      {positive ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                  <Receipt className="w-6 h-6 text-white/30" />
                </div>
                <p className="text-white/70 font-medium">No transactions yet</p>
                <p className="text-white/40 text-sm mt-1 mb-4">
                  Add your first expense or income to get started.
                </p>
                <Link href="/dashboard/transactions">
                  <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10">
                    <Plus className="w-4 h-4 mr-2" /> Add Transaction
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass border-white/5 bg-[#0a0a0a]/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">Spending by Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {analytics?.categoryBreakdown?.length ? (
              analytics.categoryBreakdown.slice(0, 5).map((category, index) => {
                const colors = ["bg-white", "bg-white/70", "bg-white/50", "bg-white/30", "bg-white/20"];
                return (
                  <div key={category.category} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">{category.category}</span>
                      <span className="text-white font-medium">{category.percentage}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors[index % colors.length]} rounded-full`}
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-white/40 text-sm">
                No spending data available yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
