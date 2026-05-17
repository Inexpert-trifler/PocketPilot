"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowUpRight, Coffee, ShoppingBag, Gamepad2, Plus, ArrowRight, Wallet } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useEffect, useState } from "react";
import { getAnalytics, getTransactions, getInsights } from "@/lib/api";

const mockChartData = [
  { name: 'Mon', spend: 400 },
  { name: 'Tue', spend: 300 },
  { name: 'Wed', spend: 550 },
  { name: 'Thu', spend: 200 },
  { name: 'Fri', spend: 700 },
  { name: 'Sat', spend: 1200 },
  { name: 'Sun', spend: 450 },
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
        if (insightsRes?.data?.length > 0) setInsight(insightsRes.data[0]);
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
        className="glass rounded-3xl p-6 relative overflow-hidden border-purple-500/20"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[60px] pointer-events-none" />
        <div className="flex gap-4 items-start relative z-10">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 border border-purple-500/30">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">
              {insight ? `Insight: ${insight.type}` : "AI Insight"}
            </h3>
            <p className="text-white/70 text-sm leading-relaxed max-w-3xl">
              {insight ? insight.message : "You've spent ₹2,450 on food delivery this week, which is 40% higher than last week. Cooking at home this weekend could save you ₹1,200 towards your PS5 goal."}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Balance Card */}
        <Card className="col-span-1 md:col-span-2 glass border-white/5 bg-[#0a0a0c]/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/50">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end mb-6">
              <div>
                <div className="text-4xl font-bold text-white">
                  ₹{analytics ? analytics.totalExpenses.toLocaleString() : "42,500.00"}
                </div>
                <div className="flex items-center gap-1 mt-2 text-emerald-400 text-sm font-medium">
                  <ArrowUpRight className="w-4 h-4" /> +₹4,200 this month
                </div>
              </div>
            </div>
            
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData}>
                  <defs>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#121217', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="spend" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Health Score & Goals (Swipeable on Mobile) */}
        <div className="flex md:flex-col gap-4 md:gap-6 overflow-x-auto pb-4 md:pb-0 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          <Card className="min-w-[280px] md:min-w-0 glass border-white/5 bg-[#0a0a0c]/50 text-center py-6 snap-center shrink-0">
            <CardContent className="pt-4">
              <div className="text-sm font-medium text-white/50 mb-2">Financial Health</div>
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="none" />
                  <circle cx="64" cy="64" r="56" stroke="#10b981" strokeWidth="12" fill="none" strokeDasharray="351.8" strokeDashoffset="70" className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all duration-1000" />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-bold text-white">82</span>
                  <span className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider">Excellent</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-[280px] md:min-w-0 glass border-white/5 bg-[#0a0a0c]/50 snap-center shrink-0">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-white/50">Current Goal</CardTitle>
              <Badge variant="outline" className="bg-white/5 text-white/70 border-white/10 text-xs">PS5 Pro</Badge>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white font-medium">₹32,000</span>
                <span className="text-white/50">of ₹55,000</span>
              </div>
              <Progress value={58} className="h-2 bg-white/5" />
              <p className="text-xs text-white/40 mt-3 flex items-center">
                <Sparkles className="w-3 h-3 mr-1 text-purple-400" /> On track to reach by Dec 15
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Transactions & Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass border-white/5 bg-[#0a0a0c]/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-white">Recent Transactions</CardTitle>
            <Button variant="ghost" size="sm" className="text-white/50 hover:text-white">View All <ArrowRight className="w-4 h-4 ml-1" /></Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {(recentTx.length > 0 ? recentTx : [
              { name: "Zomato", cat: "Food", date: "Today, 1:45 PM", amt: "-₹450", icon: <Coffee className="w-4 h-4" />, color: "bg-orange-500/20 text-orange-400" },
              { name: "Steam", cat: "Gaming", date: "Yesterday", amt: "-₹1,200", icon: <Gamepad2 className="w-4 h-4" />, color: "bg-purple-500/20 text-purple-400" },
              { name: "Freelance", cat: "Income", date: "Oct 24", amt: "+₹12,500", icon: <Wallet className="w-4 h-4" />, color: "bg-emerald-500/20 text-emerald-400", pos: true },
              { name: "Amazon", cat: "Shopping", date: "Oct 22", amt: "-₹3,400", icon: <ShoppingBag className="w-4 h-4" />, color: "bg-blue-500/20 text-blue-400" },
            ]).map((t: any, i) => {
              const isReal = !!t.id;
              const name = isReal ? t.description : t.name;
              const amt = isReal ? `₹${t.amount}` : t.amt;
              const pos = isReal ? t.type === 'INCOME' : t.pos;
              const color = isReal ? (pos ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white") : t.color;
              const dateStr = isReal ? new Date(t.date).toLocaleDateString() : t.date;
              const icon = isReal ? (pos ? <Wallet className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />) : t.icon;

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
                  <div className={`font-bold md:font-semibold text-base md:text-sm ${pos ? 'text-emerald-400' : 'text-white'}`}>
                    {pos && isReal ? '+' : (!pos && isReal ? '-' : '')}{amt}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="glass border-white/5 bg-[#0a0a0c]/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">Spending by Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {[
              { name: "Food & Dining", val: 45, color: "bg-orange-400" },
              { name: "Subscriptions", val: 25, color: "bg-purple-400" },
              { name: "Shopping", val: 20, color: "bg-blue-400" },
              { name: "Transport", val: 10, color: "bg-pink-400" },
            ].map((c, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">{c.name}</span>
                  <span className="text-white font-medium">{c.val}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${c.color} rounded-full`} style={{ width: `${c.val}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
