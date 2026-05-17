"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Wallet, PieChart, Sparkles, Target, Zap, ChevronRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

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

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden bg-gradient-premium">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 glass border-b-0 border-white/5">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Zap className="text-white w-5 h-5" fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">PocketPilot</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-white/70 hover:text-white transition-colors">How it Works</Link>
            <Link href="#pricing" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Pricing</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hidden md:block text-sm font-medium text-white/70 hover:text-white transition-colors">Log in</Link>
            <Link href="/dashboard">
              <Button className="rounded-full bg-white text-black hover:bg-white/90 font-medium px-6">
                Get Early Access
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-32 pb-16">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 px-6">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/20 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="container mx-auto max-w-5xl text-center relative z-10">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-8"
            >
              <motion.div variants={fadeInUp} className="flex justify-center">
                <Badge variant="outline" className="rounded-full px-4 py-1.5 glass text-white/80 border-white/10 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>The future of GenZ finance is here</span>
                </Badge>
              </motion.div>
              
              <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                Master your money.<br />
                <span className="text-gradient">Zero stress involved.</span>
              </motion.h1>
              
              <motion.p variants={fadeInUp} className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
                PocketPilot is the AI-powered finance platform built for students. Track expenses, crush savings goals, and get smart insights from your bank statements instantly.
              </motion.p>
              
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href="/dashboard">
                  <Button size="lg" className="rounded-full h-14 px-8 bg-white text-black hover:bg-white/90 text-base font-semibold w-full sm:w-auto shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all hover:scale-105">
                    Start for free <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-white border-white/20 hover:bg-white/10 hover:text-white text-base font-medium w-full sm:w-auto glass">
                    See how it works
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
            <div className="rounded-[2.5rem] p-2 bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl">
              <div className="rounded-[2rem] overflow-hidden border border-white/5 bg-[#0a0a0c] relative aspect-[16/9] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                <div className="text-white/40 font-medium text-lg flex items-center gap-3">
                  <PieChart className="w-6 h-6 animate-pulse" />
                  Dashboard UI Preview
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Social Proof */}
        <section className="py-12 border-y border-white/5 glass">
          <div className="container mx-auto px-6">
            <p className="text-center text-sm font-medium text-white/40 mb-8 uppercase tracking-widest">Loved by students from</p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale">
              <span className="text-xl font-bold">Stanford</span>
              <span className="text-xl font-bold">MIT</span>
              <span className="text-xl font-bold">Harvard</span>
              <span className="text-xl font-bold">Berkeley</span>
              <span className="text-xl font-bold">UCLA</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-32 px-6 relative">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Everything you need to <span className="text-gradient">build wealth</span></h2>
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
                  className="glass p-8 rounded-[2rem] hover-lift relative overflow-hidden group"
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

        {/* CTA Section */}
        <section className="py-24 px-6">
          <div className="container mx-auto max-w-5xl">
            <div className="relative rounded-[3rem] overflow-hidden border border-white/10 bg-[#121217] p-12 md:p-20 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-pink-500/20 opacity-50" />
              <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                <h2 className="text-4xl md:text-5xl font-bold text-white">Ready to take control?</h2>
                <p className="text-xl text-white/70">Join thousands of students who are already using PocketPilot to build better financial habits.</p>
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
      <footer className="border-t border-white/5 py-12 px-6">
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
