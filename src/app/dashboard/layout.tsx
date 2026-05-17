import { Wallet, PieChart, Target, Sparkles, UserCircle, LogOut, Settings, CreditCard, Plus, Receipt, FileText, PenLine } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 bg-[#0a0a0c] border-r border-white/5">
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
            <Sparkles className="text-white w-4 h-4" />
          </div>
          <span className="text-lg font-bold text-white">PocketPilot</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <NavItem href="/dashboard" icon={<PieChart className="w-5 h-5" />} label="Overview" active />
          <NavItem href="/dashboard/transactions" icon={<Wallet className="w-5 h-5" />} label="Transactions" />
          <NavItem href="/dashboard/goals" icon={<Target className="w-5 h-5" />} label="Savings Goals" />
          <NavItem href="/dashboard/subscriptions" icon={<CreditCard className="w-5 h-5" />} label="Subscriptions" />
        </nav>

        <div className="p-4 border-t border-white/5">
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start text-white/50 hover:text-white hover:bg-white/5">
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:pl-64 flex flex-col min-h-screen pb-28 md:pb-0 relative">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 h-16 flex items-center justify-between px-6 pt-safe">
          <div className="flex items-center gap-4 md:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles className="text-white w-4 h-4" />
            </div>
          </div>
          <div className="hidden md:block" />
          
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="hidden sm:flex rounded-full glass border-white/10 text-white/70">
              <Sparkles className="w-4 h-4 mr-2 text-purple-400" /> Ask AI Assistant
            </Button>
            <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shadow-sm">
              <UserCircle className="w-6 h-6 text-white/70" />
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Floating Mobile Sticky Navigation */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 z-50 glass border border-white/10 rounded-3xl h-16 flex items-center justify-between px-6 shadow-2xl">
        <MobileNavItem href="/dashboard" icon={<PieChart className="w-6 h-6" />} label="Home" active />
        <MobileNavItem href="/dashboard/transactions" icon={<Wallet className="w-6 h-6" />} label="Transact" />
        
        <Drawer>
          <DrawerTrigger asChild>
            <div className="relative -top-6">
              <button className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.5)] border-[3px] border-[#121217] active:scale-95 transition-transform">
                <Plus className="w-7 h-7 text-white" />
              </button>
            </div>
          </DrawerTrigger>
          <DrawerContent className="bg-[#121217] border-white/10 text-white">
            <div className="mx-auto w-full max-w-sm">
              <DrawerHeader>
                <DrawerTitle className="text-2xl font-bold">Add Transaction</DrawerTitle>
                <DrawerDescription className="text-white/50">Choose how you want to add an expense.</DrawerDescription>
              </DrawerHeader>
              <div className="p-4 pb-0 space-y-4">
                <Link href="/dashboard/scan" className="w-full">
                  <DrawerClose asChild>
                    <button className="w-full flex items-center gap-4 p-4 rounded-2xl glass hover-lift border-purple-500/30">
                      <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                        <Receipt className="w-6 h-6 text-purple-400" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-lg text-white">Scan Receipt</h4>
                        <p className="text-sm text-white/50">Use AI to extract details instantly</p>
                      </div>
                    </button>
                  </DrawerClose>
                </Link>
                <button className="w-full flex items-center gap-4 p-4 rounded-2xl glass hover-lift border-blue-500/30">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-lg text-white">Upload PDF/CSV</h4>
                    <p className="text-sm text-white/50">Import multiple transactions</p>
                  </div>
                </button>
                <button className="w-full flex items-center gap-4 p-4 rounded-2xl glass hover-lift border-emerald-500/30">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <PenLine className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-lg text-white">Manual Entry</h4>
                    <p className="text-sm text-white/50">Type it in yourself</p>
                  </div>
                </button>
              </div>
              <DrawerFooter className="pt-6 pb-8">
                <DrawerClose asChild>
                  <Button variant="outline" className="w-full h-14 rounded-xl glass border-white/10 text-white hover:bg-white/10">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>

        <MobileNavItem href="/dashboard/goals" icon={<Target className="w-6 h-6" />} label="Goals" />
        <MobileNavItem href="/dashboard/settings" icon={<Settings className="w-6 h-6" />} label="Settings" />
      </nav>
    </div>
  );
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link href={href}>
      <span className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${active ? 'bg-white/10 text-white font-medium' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
        {icon}
        {label}
      </span>
    </Link>
  );
}

function MobileNavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center w-16 h-full gap-1">
      <span className={`${active ? 'text-purple-400' : 'text-white/40'}`}>
        {icon}
      </span>
      <span className={`text-[10px] font-medium ${active ? 'text-purple-400' : 'text-white/40'}`}>{label}</span>
    </Link>
  );
}
