"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, User, BrainCircuit, Loader2 } from "lucide-react";
import { getTransactions, getBudgets, getAnalytics, getGoals } from "@/lib/api";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  chartData?: any[];
  chartType?: "area" | "bar";
};

const SUGGESTIONS = [
  "Can I afford AirPods this month?",
  "How much did I spend on food?",
  "Where am I overspending?",
  "Give me tips to save ₹5,000"
];

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      content: "Hi Alex! 👋 I'm your PocketPilot AI. I can analyze your spending, check your budgets, and help you reach your goals faster. What's on your mind today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Pre-load data context for the AI
  const [context, setContext] = useState<any>({});

  useEffect(() => {
    const loadContext = async () => {
      try {
        const [txs, budgets, analytics, goals] = await Promise.all([
          getTransactions(),
          getBudgets(),
          getAnalytics(),
          getGoals()
        ]);
        setContext({
          transactions: txs?.data?.transactions || [],
          budgets: budgets?.data || [],
          analytics: analytics?.data || null,
          goals: goals?.data || []
        });
      } catch (e) {
        console.error("Failed to load context", e);
      }
    };
    loadContext();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      generateResponse(text);
    }, 1200);
  };

  const generateResponse = (query: string) => {
    const q = query.toLowerCase();
    let response: Message = {
      id: (Date.now() + 1).toString(),
      role: "ai",
      content: "I'm still learning! Ask me about your food spending, budgets, or if you can afford a specific purchase."
    };

    const { transactions, budgets, analytics, goals } = context;

    // Logic 1: Can I afford X?
    if (q.includes("afford") || q.includes("airpods") || q.includes("buy")) {
      const netSavings = analytics?.netSavings || 0;
      if (netSavings > 25000) {
        response.content = `You currently have **₹${netSavings.toLocaleString()}** in net savings this month! 🎧 Yes, you can comfortably afford AirPods (approx ₹19,900). It will reduce your savings rate, but you'll still be in the green!`;
      } else {
        response.content = `AirPods typically cost around ₹19,900. Your net savings right now are **₹${netSavings.toLocaleString()}**. \n\nI recommend waiting until next month or setting up a dedicated Savings Goal so you don't dip into your emergency funds!`;
      }
    } 
    // Logic 2: Food spending
    else if (q.includes("food") || q.includes("swiggy") || q.includes("zomato") || q.includes("eat")) {
      const foodTxs = transactions.filter((t: any) => t.category === "FOOD" && t.type === "EXPENSE");
      const totalFood = foodTxs.reduce((sum: number, t: any) => sum + t.amount, 0);
      
      // Group by date for chart
      const last7Days = Array.from({length: 7}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toLocaleDateString('en-US', { weekday: 'short' });
      });
      
      const chartData = last7Days.map(dayName => ({ name: dayName, spend: 0 }));
      foodTxs.forEach((t: any) => {
        const tDay = new Date(t.date).toLocaleDateString('en-US', { weekday: 'short' });
        const dayEntry = chartData.find(d => d.name === tDay);
        if (dayEntry) dayEntry.spend += t.amount;
      });

      response.content = `You've spent **₹${totalFood.toLocaleString()}** on food recently. 🍔 Here's your food spending trend over the last 7 days. Looks like weekends are your highest spend days!`;
      response.chartData = chartData;
      response.chartType = "area";
    }
    // Logic 3: Overspending / Budgets
    else if (q.includes("overspend") || q.includes("budget") || q.includes("where did my money go")) {
      const overspent = budgets.filter((b: any) => b.spent > b.amount * 0.8);
      
      if (overspent.length > 0) {
        const names = overspent.map((b: any) => b.category).join(" and ");
        response.content = `I found some areas where you are running hot! 🔥 You are nearing or exceeding your limits in **${names}**. Check out the breakdown below:`;
        response.chartData = overspent.map((b: any) => ({ name: b.category, spent: b.spent, limit: b.amount }));
        response.chartType = "bar";
      } else {
        response.content = `Great news! 🌟 You are within budget across all your tracked categories. Keep up the disciplined spending!`;
      }
    }
    // Logic 4: Save money tips
    else if (q.includes("save") || q.includes("tips")) {
      const shopping = transactions.filter((t: any) => t.category === "SHOPPING").reduce((sum: number, t: any) => sum + t.amount, 0);
      const food = transactions.filter((t: any) => t.category === "FOOD").reduce((sum: number, t: any) => sum + t.amount, 0);
      
      response.content = `To save ₹5,000 this month, let's look at your biggest variables:\n\n1. **Shopping (₹${shopping})**: Delay any non-essential Amazon purchases.\n2. **Food (₹${food})**: Try cooking 3 more meals at home this week.\n\nIf you cut these two by just 20%, you'll easily hit your ₹5,000 savings target! 🎯`;
    }

    setIsTyping(false);
    setMessages(prev => [...prev, response]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] animate-in-fade">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <BrainCircuit className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">AI Coach</h1>
          <p className="text-white/50 text-sm">Your personal financial advisor.</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto hide-scrollbar glass rounded-[2rem] border-white/5 p-4 md:p-6 mb-4 relative flex flex-col gap-6">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === "ai" 
                  ? "bg-gradient-to-tr from-indigo-500 to-purple-500" 
                  : "bg-white/10"
              }`}>
                {msg.role === "ai" ? <Sparkles className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white/70" />}
              </div>

              {/* Bubble Content */}
              <div className={`rounded-2xl px-5 py-3.5 ${
                msg.role === "user" 
                  ? "bg-white text-black rounded-tr-sm" 
                  : "bg-white/5 border border-white/10 text-white/90 rounded-tl-sm"
              }`}>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content.split('**').map((text, i) => i % 2 === 1 ? <strong key={i} className={msg.role === "user" ? "text-black font-bold" : "text-white font-bold"}>{text}</strong> : text)}
                </div>

                {/* Inline Charts */}
                {msg.chartData && msg.chartType === "area" && (
                  <div className="mt-4 h-40 w-full min-w-[250px] md:min-w-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={msg.chartData}>
                        <defs>
                          <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#121212', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="spend" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {msg.chartData && msg.chartType === "bar" && (
                  <div className="mt-4 h-40 w-full min-w-[250px] md:min-w-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={msg.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#121212', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          cursor={{fill: 'rgba(255,255,255,0.05)'}}
                        />
                        <Bar dataKey="spent" radius={[4, 4, 0, 0]}>
                          {msg.chartData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.spent > entry.limit ? '#ef4444' : '#a855f7'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
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
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="shrink-0 space-y-3">
        {/* Quick Suggestions */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSend(s)}
              disabled={isTyping}
              className="whitespace-nowrap px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-medium hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Text Input */}
        <div className="relative flex items-center">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
            placeholder="Ask about your finances..."
            className="w-full h-14 pl-5 pr-14 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-purple-500/50"
            disabled={isTyping}
          />
          <Button 
            size="icon"
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 w-10 h-10 rounded-xl bg-purple-500 hover:bg-purple-600 text-white transition-colors disabled:opacity-50"
          >
            {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
