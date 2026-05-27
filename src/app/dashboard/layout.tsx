"use client";

import { PieChart, Wallet, Target, CreditCard, Settings, LogOut, Plus, Receipt, FileText, PenLine, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

const NAV_ITEMS = [
  { href: "/dashboard", icon: PieChart, label: "Overview" },
  { href: "/dashboard/transactions", icon: Wallet, label: "Transactions" },
  { href: "/dashboard/goals", icon: Target, label: "Goals" },
  { href: "/dashboard/subscriptions", icon: CreditCard, label: "Subscriptions" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-[240px] flex-col fixed inset-y-0 z-50 bg-[#0a0a0a] border-r border-white/[0.06]">
        <div className="p-5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <span className="text-black font-bold text-sm">P</span>
          </div>
          <span className="text-[15px] font-semibold text-white tracking-[-0.01em]">PocketPilot</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <SidebarNavItem key={item.href} href={item.href} icon={<item.icon className="w-[18px] h-[18px]" />} label={item.label} />
          ))}
        </nav>

        <div className="p-3 border-t border-white/[0.06]">
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start text-zinc-500 hover:text-white hover:bg-white/[0.04] h-9 text-[13px] font-normal">
              <LogOut className="w-[18px] h-[18px] mr-2.5" />
              Sign Out
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:pl-[240px] flex flex-col min-h-screen pb-24 md:pb-0">
        <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-white/[0.06] h-14 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3 md:hidden">
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
              <span className="text-black font-bold text-xs">P</span>
            </div>
            <span className="text-sm font-semibold text-white">PocketPilot</span>
          </div>
          <div className="hidden md:block" />

          <div className="flex items-center gap-3">
            <Link href="/dashboard/settings">
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/[0.06] flex items-center justify-center cursor-pointer hover:bg-zinc-700 transition-colors">
                <span className="text-xs font-medium text-zinc-400">U</span>
              </div>
            </Link>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a] border-t border-white/[0.06] h-16 flex items-center justify-between px-2 pb-safe">
        <MobileNavItem href="/dashboard" icon={<PieChart className="w-5 h-5" />} label="Home" />
        <MobileNavItem href="/dashboard/transactions" icon={<Wallet className="w-5 h-5" />} label="Activity" />

        <Drawer>
          <DrawerTrigger asChild>
            <button className="flex flex-col items-center justify-center w-14 -mt-5">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg shadow-white/10 active:scale-95 transition-transform">
                <Plus className="w-6 h-6 text-black" />
              </div>
            </button>
          </DrawerTrigger>
          <DrawerContent className="bg-[#0a0a0a] border-white/[0.06] text-white">
            <div className="mx-auto w-full max-w-sm">
              <DrawerHeader>
                <DrawerTitle className="text-xl font-semibold">Add Transaction</DrawerTitle>
                <DrawerDescription className="text-zinc-500">Choose how you want to add an expense.</DrawerDescription>
              </DrawerHeader>
              <div className="p-4 pb-0 space-y-3">
                <Link href="/dashboard/scan" className="w-full">
                  <DrawerClose asChild>
                    <button className="w-full flex items-center gap-3 p-3.5 rounded-xl surface-elevated hover:bg-white/[0.04] transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                        <Receipt className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-medium text-sm text-white">Scan Receipt</h4>
                        <p className="text-xs text-zinc-500">Use AI to extract details</p>
                      </div>
                    </button>
                  </DrawerClose>
                </Link>
                <Link href="/dashboard/transactions" className="w-full">
                  <DrawerClose asChild>
                    <button className="w-full flex items-center gap-3 p-3.5 rounded-xl surface-elevated hover:bg-white/[0.04] transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-medium text-sm text-white">Upload CSV</h4>
                        <p className="text-xs text-zinc-500">Import multiple transactions</p>
                      </div>
                    </button>
                  </DrawerClose>
                </Link>
                <Link href="/dashboard/transactions" className="w-full">
                  <DrawerClose asChild>
                    <button className="w-full flex items-center gap-3 p-3.5 rounded-xl surface-elevated hover:bg-white/[0.04] transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                        <PenLine className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-medium text-sm text-white">Manual Entry</h4>
                        <p className="text-xs text-zinc-500">Type it in yourself</p>
                      </div>
                    </button>
                  </DrawerClose>
                </Link>
              </div>
              <DrawerFooter className="pt-4 pb-6">
                <DrawerClose asChild>
                  <Button variant="outline" className="w-full h-11 rounded-xl bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:bg-white/[0.06] hover:text-white">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>

        <MobileNavItem href="/dashboard/goals" icon={<Target className="w-5 h-5" />} label="Goals" />
        <MobileNavItem href="/dashboard/settings" icon={<Settings className="w-5 h-5" />} label="Settings" />
      </nav>
    </div>
  );
}

function SidebarNavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  const isExactDashboard = href === "/dashboard" && pathname === "/dashboard";
  const active = isExactDashboard || isActive;

  return (
    <Link href={href}>
      <span className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors text-[13px] ${
        active
          ? "bg-white/[0.06] text-white font-medium"
          : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
      }`}>
        {icon}
        {label}
      </span>
    </Link>
  );
}

function MobileNavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  const isExactDashboard = href === "/dashboard" && pathname === "/dashboard";
  const active = isExactDashboard || isActive;

  return (
    <Link href={href} className="flex flex-col items-center justify-center w-14 h-full gap-0.5">
      <span className={active ? "text-white" : "text-zinc-500"}>
        {icon}
      </span>
      <span className={`text-[10px] ${active ? "text-white font-medium" : "text-zinc-500"}`}>{label}</span>
    </Link>
  );
}
