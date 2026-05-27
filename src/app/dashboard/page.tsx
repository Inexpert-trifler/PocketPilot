"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowUpRight, Coffee, ShoppingBag, Gamepad2, Plus, ArrowRight, Wallet, Receipt } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useEffect, useState } from "react";
import { getAnalytics, getTransactions, getInsights } from "@/lib/api";

const emptyChartData = [
  { name: 'Mon', spend: 0 },
  { name: 'Tue', spend: 0 },
  { name: 'Wed', spend: 0 },
  { name: 'Thu', spend: 0 },
  { name: 'Fri', spend: 0 },
  { name: 'Sat', spend: 0 },
  { name: 'Sun', spend: 0 },
];

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentTx, setRecentTx] = useState<any[]>([]);
  const [insight, setInsight] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, txRes, insightsRes] = await Promise.all([
          getAnalytics().catch(() => null),
          getTransactions({ limit: "4" }).catch(() => null),
          getInsights().catch(() => null)
        ]);

        if (analyticsRes?.data) setAnalytics(analyticsRes.data);
        if (txRes?.data?.transactions) setRecentTx(txRes.data.transactions);
        if (insightsRes && insightsRes.data && insightsRes.data.length > 0) setInsight(insightsRes.data[0]);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6 md:space-y-8 animate-in-fade">
      {/* Greeting & Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Hey, Alex 👋</h1>
          <p className="text-white/50 text-sm md:text-base mt-1">Here's your financial pilot for today.</p>
        </div>
        <div className="hidden md:flex items-center gap-3 w-full md:w-auto">
          <Button className="flex-1 md:flex-none rounded-full bg-white text-black hover:bg-white/90">
            <Plus className="w-4 h-4 mr-2" /> Add Expense
          </Button>
          <Button variant="outline" className="flex-1 md:flex-none rounded-full glass text-white hover:bg-white/10">
            Upload Statement
          </Button>
        </div>
      </div>

      {/* AI Insight Card */}
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
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">
              {insight ? `Insight: ${insight.type}` : "AI Insight"}
            </h3>
            <p className="text-white/70 text-sm leading-relaxed max-w-3xl">
              {insight ? insight.message : "Add your first few transactions, and our AI will start generating personalized financial insights for you."}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Balance Card */}
        <Card className="col-span-1 md:col-span-2 glass border-white/5 bg-[#0a0a0a]/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/50">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end mb-6">
              <div>
                <div className="text-4xl font-bold text-white">
                  ₹{analytics ? analytics.totalExpenses.toLocaleString() : "0.00"}
                </div>
                <div className="flex items-center gap-1 mt-2 text-white/70 text-sm font-medium">
                  {analytics && analytics.netSavings !== 0 ? (
                    <>
                      <ArrowUpRight className="w-4 h-4" /> 
                      {analytics.netSavings > 0 ? '+' : ''}₹{analytics.netSavings.toLocaleString()} this month
                    </>
                  ) : "No activity yet"}
                </div>
              </div>
            </div>
            
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={emptyChartData}>
                  <defs>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffffff" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#121212', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="spend" stroke="#ffffff" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Health Score & Goals (Swipeable on Mobile) */}
        <div className="flex md:flex-col gap-4 md:gap-6 overflow-x-auto pb-4 md:pb-0 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          <Card className="min-w-[280px] md:min-w-0 glass border-white/5 bg-[#0a0a0a]/50 text-center py-6 snap-center shrink-0">
            <CardContent className="pt-4">
              <div className="text-sm font-medium text-white/50 mb-2">Financial Health</div>
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="none" />
                  <circle cx="64" cy="64" r="56" stroke="#ffffff" strokeWidth="12" fill="none" strokeDasharray="351.8" strokeDashoffset="70" className="drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] transition-all duration-1000" />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-bold text-white">82</span>
                  <span className="text-[10px] text-white/70 font-medium uppercase tracking-wider">Excellent</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-[280px] md:min-w-0 glass border-white/5 bg-[#0a0a0a]/50 snap-center shrink-0">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-white/50">Current Goal</CardTitle>
              <Badge variant="outline" className="bg-white/5 text-white/70 border-white/10 text-xs">Emergency</Badge>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white font-medium">₹32,000</span>
                <span className="text-white/50">of ₹55,000</span>
              </div>
              <Progress value={58} className="h-2 bg-white/5 [&>div]:bg-white" />
              <p className="text-xs text-white/40 mt-3 flex items-center">
                <Sparkles className="w-3 h-3 mr-1 text-white/70" /> On track to reach by Dec 15
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Transactions & Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass border-white/5 bg-[#0a0a0a]/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-white">Recent Transactions</CardTitle>
            <Button variant="ghost" size="sm" className="text-white/50 hover:text-white">View All <ArrowRight className="w-4 h-4 ml-1" /></Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentTx.length > 0 ? recentTx.map((t: any, i) => {
              const name = t.description;
              const amt = `₹${t.amount}`;
              const pos = t.type === 'INCOME';
              const color = pos ? "bg-white/10 text-white" : "bg-white/5 text-white/80";
              const dateStr = new Date(t.date).toLocaleDateString();
              const icon = pos ? <Wallet className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />;

              return (
                <div key={i} className="flex items-center justify-between group cursor-pointer p-3 md:p-2 -mx-3 md:-mx-2 rounded-2xl hover:bg-white/5 active:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4 md:gap-3">
                    <div className={`w-12 h-12 md:w-10 md:h-10 rounded-full flex items-center justify-center ${color}`}>
                      {icon}
                    </div>
                    <div>
                      <div className="font-semibold md:font-medium text-white text-base md:text-sm">{name}</div>
                      <div className="text-sm md:text-xs text-white/50">{dateStr}</div>
                    </div>
                  </div>
                  <div className={`font-bold md:font-semibold text-base md:text-sm ${pos ? 'text-white' : 'text-white/70'}`}>
                    {pos ? '+' : '-'}{amt}
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                  <Receipt className="w-6 h-6 text-white/30" />
                </div>
                <p className="text-white/70 font-medium">No transactions yet</p>
                <p className="text-white/40 text-sm mt-1 mb-4">Add your first expense or income to get started.</p>
                <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10">
                  <Plus className="w-4 h-4 mr-2" /> Add Transaction
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass border-white/5 bg-[#0a0a0a]/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">Spending by Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {analytics?.categoryBreakdown?.length > 0 ? (
              analytics.categoryBreakdown.slice(0, 4).map((c: any, i: number) => {
                const colors = ["bg-white", "bg-white/70", "bg-white/50", "bg-white/30"];
                const color = colors[i % colors.length];
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">{c.category}</span>
                      <span className="text-white font-medium">{c.percentage}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full`} style={{ width: `${c.percentage}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-white/40 text-sm">
                No spending data available.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
