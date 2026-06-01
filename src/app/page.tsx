"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, PieChart, Sparkles, Target, Zap, ChevronRight, CheckCircle2, Star, Quote } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { upgradeToPro } from "@/lib/api";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const TESTIMONIALS_ROW1 = [
  {
    name: "Aarav Mehta",
    role: "Student, IIT Bombay",
    text: "PocketPilot's AI statement scanning is insane. I uploaded my UPI statement and it categorized everything in 3 seconds. Saved me hours!",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80",
    rating: 5
  },
  {
    name: "Sarah Jenkins",
    role: "Economics Junior, NYU",
    text: "The AI Financial Coach literally told me to skip buying bubble tea because I spent 40% more on snacks this week. It actually works!",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
    rating: 5
  },
  {
    name: "Devon Chen",
    role: "CS Senior, Stanford",
    text: "The glassmorphic design is beautiful. It feels like Apple built a budgeting app. Visualizing my subscriptions helped me cancel three unused trials.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
    rating: 5
  }
];

const TESTIMONIALS_ROW2 = [
  {
    name: "Kavya Nair",
    role: "Design Major, NID",
    text: "Most finance apps are boring and clinical. PocketPilot is vibrant and fun to use. The circular savings rings make saving money addictive.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80",
    rating: 5
  },
  {
    name: "Marcus Vance",
    role: "Sophomore, Berkeley",
    text: "Highly recommend upgrading to Pro. The Stripe checkout simulation was super smooth, and the AI coach is like having a private advisor in my pocket.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80",
    rating: 5
  },
  {
    name: "Rhea Sen",
    role: "Med Student, KMC",
    text: "I was always stressed about rent and subscriptions. PocketPilot gives me a clear warning if a charge is coming up. Complete peace of mind.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80",
    rating: 5
  }
];

export default function LandingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="flex flex-col min-h-screen overflow-hidden bg-[#030303] text-white selection:bg-purple-500/30 selection:text-purple-200">
      {/* Dynamic Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-900/20 blur-[150px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[150px] animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 bg-[#030303]/70 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Zap className="text-white w-5 h-5" fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">PocketPilot</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Features</Link>
            <Link href="#testimonials" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Testimonials</Link>
            <Link href="#pricing" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Pricing</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hidden md:block text-sm font-medium text-white/60 hover:text-white transition-colors">Log in</Link>
            <Link href="/dashboard">
              <Button className="rounded-full bg-white text-black hover:bg-white/90 font-medium px-6 shadow-md transition-all active:scale-95">
                Go to App
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-32 pb-16 z-10 relative">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 px-6">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/10 blur-[130px] rounded-full pointer-events-none" />
          
          <div className="container mx-auto max-w-5xl text-center relative z-10">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-8"
            >
              <motion.div variants={fadeInUp} className="flex justify-center">
                <Badge variant="outline" className="rounded-full px-4 py-1.5 bg-white/[0.02] text-purple-300 border-purple-500/30 flex items-center gap-2 shadow-inner">
                  <Sparkles className="w-4 h-4 text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
                  <span className="text-xs font-semibold uppercase tracking-wider">POCKETPILOT V2 IS LIVE</span>
                </Badge>
              </motion.div>
              
              <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.05]">
                Master your money.<br />
                <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent bg-[size:200%] animate-gradient">Zero stress involved.</span>
              </motion.h1>
              
              <motion.p variants={fadeInUp} className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
                PocketPilot is the premium AI-powered finance platform built for students. Track expenses, crush savings goals, and get smart insights from statement uploads.
              </motion.p>
              
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href="/dashboard">
                  <Button size="lg" className="rounded-full h-14 px-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 text-base font-semibold w-full sm:w-auto shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all hover:scale-105 active:scale-95 border border-purple-400/20">
                    Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="#pricing">
                  <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-white border-white/10 hover:bg-white/5 text-base font-medium w-full sm:w-auto backdrop-blur-xl">
                    View SaaS Plans
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
          
          {/* Dashboard Preview Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-24 container mx-auto max-w-6xl relative z-10"
          >
            <div className="rounded-[2.5rem] p-2 bg-white/[0.02] border border-white/[0.08] backdrop-blur-2xl shadow-2xl">
              <div className="rounded-[2rem] overflow-hidden border border-white/5 bg-[#08080a] relative aspect-[16/9] flex items-center justify-center group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />

                {/* Floating graphic mock */}
                <div className="absolute inset-0 opacity-40 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-500/20 blur-[60px] pointer-events-none rounded-full group-hover:scale-125 transition-transform duration-1000" />

                <div className="relative z-20 text-center space-y-4 max-w-md px-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto shadow-lg backdrop-blur-md">
                    <PieChart className="w-8 h-8 text-purple-400 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Interactive Glass Dashboard</h3>
                  <p className="text-sm text-white/50">Explore Recharts dynamics, upcoming bill radars, savings rings, and the smart ChatGPT coach online.</p>
                  <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs text-purple-300 font-semibold hover:text-purple-200 transition-colors pt-2">
                    Enter the Live Application <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Social Proof */}
        <section className="py-12 border-y border-white/[0.04] bg-white/[0.01] backdrop-blur-md">
          <div className="container mx-auto px-6">
            <p className="text-center text-xs font-semibold text-white/40 mb-8 uppercase tracking-widest">Trusted by students worldwide</p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale hover:opacity-75 transition-opacity duration-300 font-bold text-lg text-white">
              <span>Stanford University</span>
              <span>MIT</span>
              <span>Harvard</span>
              <span>UC Berkeley</span>
              <span>UCLA</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-32 px-6 relative">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Everything you need to <span className="bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent">build wealth</span></h2>
              <p className="text-lg text-white/50 max-w-2xl mx-auto">Stop wondering where your money went. PocketPilot gives you complete clarity and actionable insights automatically.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "AI Statement Scan",
                  desc: "Upload PDFs, CSVs or screenshots. Our AI extracts and categorizes every transaction instantly.",
                  icon: <Zap className="w-6 h-6 text-yellow-400" />,
                  color: "from-yellow-400/20 to-orange-500/20"
                },
                {
                  title: "Smart Insights",
                  desc: "\"You spent 26% more on food this month. Skip eating out this weekend to stay on track.\"",
                  icon: <Sparkles className="w-6 h-6 text-purple-400" />,
                  color: "from-purple-400/20 to-pink-500/20"
                },
                {
                  title: "Subscription Radar",
                  desc: "Identify forgotten subscriptions and unused trials before you get charged again.",
                  icon: <Target className="w-6 h-6 text-emerald-400" />,
                  color: "from-emerald-400/20 to-teal-500/20"
                }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl p-8 rounded-[2rem] hover:bg-white/[0.04] transition-all duration-300 relative overflow-hidden group hover:-translate-y-1"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 relative z-10">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-3 relative z-10">{feature.title}</h3>
                  <p className="text-white/60 leading-relaxed relative z-10">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section (NEW) */}
        <section id="pricing" className="py-24 px-6 border-t border-white/[0.04] bg-white/[0.01]">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <Badge variant="outline" className="rounded-full px-4 py-1.5 bg-purple-500/5 text-purple-300 border-purple-500/20 mb-4">SaaS Tier Pricing</Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-white">Upgrade to Pro, Pilot Smarter</h2>
              <p className="text-white/50 text-base md:text-lg mt-3 max-w-xl mx-auto">Get access to premium scanning engine, circular progress rings, and real-time AI coach answers.</p>

              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-3 mt-8">
                <span className={`text-sm font-medium ${billingPeriod === "monthly" ? "text-white" : "text-white/40"}`}>Monthly</span>
                <button
                  onClick={() => setBillingPeriod(prev => prev === "monthly" ? "yearly" : "monthly")}
                  className="w-12 h-6 rounded-full bg-white/10 p-1 flex items-center relative transition-colors duration-300 focus:outline-none"
                >
                  <motion.div
                    layout
                    className="w-4 h-4 rounded-full bg-purple-500 shadow-md"
                    animate={{ x: billingPeriod === "monthly" ? 0 : 24 }}
                  />
                </button>
                <span className={`text-sm font-medium flex items-center gap-1.5 ${billingPeriod === "yearly" ? "text-white" : "text-white/40"}`}>
                  Yearly
                  <Badge className="bg-purple-500 text-white border-none text-[10px] px-1.5 py-0 rounded">Save 20%</Badge>
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 blur-[90px] rounded-full pointer-events-none" />

              {/* Free Plan */}
              <div className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl rounded-[2.2rem] p-8 flex flex-col justify-between hover:bg-white/[0.04] transition-colors relative">
                <div>
                  <h3 className="text-xl font-semibold text-white">Free Basic</h3>
                  <p className="text-sm text-white/50 mt-1">For students organizing their first bills.</p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">₹0</span>
                    <span className="text-sm text-white/40">/ forever</span>
                  </div>

                  <ul className="mt-8 space-y-4">
                    {[
                      "Manual transaction logging",
                      "Standard category buckets",
                      "Basic profile data management",
                      "Local device storage only"
                    ].map((feat, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-white/70">
                        <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full h-12 rounded-xl border-white/10 text-white bg-white/5 hover:bg-white/10">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Pro Plan */}
              <div className="bg-gradient-to-b from-purple-500/10 to-indigo-500/5 border border-purple-500/30 backdrop-blur-xl rounded-[2.2rem] p-8 flex flex-col justify-between relative shadow-[0_0_50px_rgba(168,85,247,0.15)] hover:border-purple-400/50 transition-colors">
                <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full shadow-lg shadow-purple-500/20">
                  Most Popular
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    Pro Pilot <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
                  </h3>
                  <p className="text-sm text-white/50 mt-1">Unlock full AI financial intelligence.</p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">
                      {billingPeriod === "monthly" ? "₹199" : "₹1,599"}
                    </span>
                    <span className="text-sm text-white/40">
                      /{billingPeriod === "monthly" ? "mo" : "yr"}
                    </span>
                  </div>

                  <ul className="mt-8 space-y-4">
                    {[
                      "Unlimited Statement scanning (AI)",
                      "Full access to AI Financial Coach chat",
                      "Interactive Recharts spending analytics",
                      "Circular progress rings & savings celebrator",
                      "Upcoming subscription renew radars",
                      "Pro plan preview unlocked in demo mode"
                    ].map((feat, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-white/90">
                        <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" fill="rgba(168,85,247,0.2)" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <Link href="/dashboard">
                    <Button
                      className="w-full h-12 rounded-xl bg-purple-500 text-white hover:bg-purple-600 shadow-md"
                      onClick={() => {
                        void upgradeToPro();
                      }}
                    >
                      Upgrade to Pro
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials (NEW) */}
        <section id="testimonials" className="py-24 px-6 overflow-hidden relative border-t border-white/[0.04]">
          <div className="container mx-auto max-w-5xl text-center mb-16">
            <Badge variant="outline" className="rounded-full px-4 py-1.5 bg-white/[0.02] text-white/70 border-white/10 mb-4">Wall of Love</Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-white">Approved by 10,000+ Students</h2>
            <p className="text-white/50 text-base md:text-lg mt-3 max-w-xl mx-auto">See how students are taking absolute control of their campus run-rates.</p>
          </div>

          {/* Dual infinite scroll row tickers */}
          <div className="flex flex-col gap-6 w-full overflow-hidden relative">
            {/* Ticker Row 1 - Left direction */}
            <div className="flex gap-6 w-[200%] animate-marquee">
              {[...TESTIMONIALS_ROW1, ...TESTIMONIALS_ROW1, ...TESTIMONIALS_ROW1].map((item, idx) => (
                <div key={idx} className="w-[340px] shrink-0 bg-white/[0.02] border border-white/[0.06] rounded-[1.8rem] p-6 backdrop-blur-xl relative">
                  <div className="flex items-center gap-3 mb-4">
                    <Image src={item.avatar} alt={item.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                    <div>
                      <h4 className="font-semibold text-sm text-white">{item.name}</h4>
                      <p className="text-xs text-white/40">{item.role}</p>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed italic">&ldquo;{item.text}&rdquo;</p>
                  <Quote className="absolute right-6 bottom-4 w-12 h-12 text-white/[0.01] pointer-events-none" />
                </div>
              ))}
            </div>

            {/* Ticker Row 2 - Right direction */}
            <div className="flex gap-6 w-[200%] animate-marquee-reverse">
              {[...TESTIMONIALS_ROW2, ...TESTIMONIALS_ROW2, ...TESTIMONIALS_ROW2].map((item, idx) => (
                <div key={idx} className="w-[340px] shrink-0 bg-white/[0.02] border border-white/[0.06] rounded-[1.8rem] p-6 backdrop-blur-xl relative">
                  <div className="flex items-center gap-3 mb-4">
                    <Image src={item.avatar} alt={item.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                    <div>
                      <h4 className="font-semibold text-sm text-white">{item.name}</h4>
                      <p className="text-xs text-white/40">{item.role}</p>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed italic">&ldquo;{item.text}&rdquo;</p>
                  <Quote className="absolute right-6 bottom-4 w-12 h-12 text-white/[0.01] pointer-events-none" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6">
          <div className="container mx-auto max-w-5xl">
            <div className="relative rounded-[3rem] overflow-hidden border border-white/10 bg-[#08080c] p-12 md:p-20 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 opacity-60 pointer-events-none" />
              <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                <h2 className="text-4xl md:text-5xl font-bold text-white">Ready to take control?</h2>
                <p className="text-xl text-white/60">Join thousands of students who are already using PocketPilot to build better financial habits.</p>
                <Link href="/dashboard">
                  <Button size="lg" className="rounded-full h-14 px-10 bg-white text-black hover:bg-white/90 text-lg font-semibold shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-12 px-6 bg-[#030303]">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Zap className="text-purple-500 w-5 h-5" fill="currentColor" />
            <span className="font-bold text-white">PocketPilot</span>
          </div>
          <p className="text-white/40 text-sm">© 2026 PocketPilot. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-white/40 hover:text-white transition-colors text-sm">Twitter</Link>
            <Link href="#" className="text-white/40 hover:text-white transition-colors text-sm">Instagram</Link>
            <Link href="#" className="text-white/40 hover:text-white transition-colors text-sm">Discord</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
