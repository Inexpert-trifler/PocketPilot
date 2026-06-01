"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Crown, Download, Settings as SettingsIcon, Trash2, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addBudget,
  deleteBudget,
  exportDataAsCSV,
  getBudgets,
  getProfile,
  resetAllData,
  subscribeToDataChanges,
  TransactionCategory,
  updateProfile,
  upgradeToPro,
  type Budget,
  type UserProfile,
} from "@/lib/api";

const budgetCategories = Object.values(TransactionCategory).filter((category) =>
  [
    TransactionCategory.FOOD,
    TransactionCategory.SHOPPING,
    TransactionCategory.SUBSCRIPTIONS,
    TransactionCategory.TRANSPORT,
    TransactionCategory.EDUCATION,
    TransactionCategory.ENTERTAINMENT,
    TransactionCategory.BILLS,
  ].includes(category)
);

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [loading, setLoading] = useState(true);
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetCategory, setBudgetCategory] = useState<TransactionCategory>(TransactionCategory.FOOD);

  useEffect(() => {
    const loadSettings = async () => {
      const [profileRes, budgetsRes] = await Promise.all([getProfile(), getBudgets()]);
      setProfile(profileRes.data);
      setName(profileRes.data.name || "");
      setCurrency(profileRes.data.currency || "INR");
      setBudgets(budgetsRes.data);
      setLoading(false);
    };

    void loadSettings();
    return subscribeToDataChanges(() => {
      void loadSettings();
    });
  }, []);

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await updateProfile({ name, currency });
    setProfile(response.data);
  };

  const handleExport = () => {
    const csv = exportDataAsCSV();
    if (!csv) return;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `pocketpilot_export_${new Date().toISOString().split("T")[0]}.csv`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  const handleAddBudget = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!budgetAmount) return;
    await addBudget({
      category: budgetCategory,
      amount: Number(budgetAmount),
    });
    setBudgetAmount("");
  };

  const handleReset = () => {
    resetAllData();
    window.location.href = "/dashboard";
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in-fade max-w-5xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Profile & Settings</h1>
        <p className="text-white/50 text-sm md:text-base mt-1">
          Manage your identity, budgets, exports, and demo SaaS plan state.
        </p>
      </div>

      {loading ? (
        <div className="text-white/50 py-4">Loading settings...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <Card className="surface border-white/10 bg-[#0a0a0a]/50">
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-white" />
                <CardTitle className="text-lg text-white">Profile</CardTitle>
              </div>
              <CardDescription className="text-white/50">
                Update the basics used across the product experience.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency Code</Label>
                  <Input
                    id="currency"
                    value={currency}
                    onChange={(event) => setCurrency(event.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <Button type="submit" className="bg-white text-black hover:bg-white/90">
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="surface border-white/10 bg-[#0a0a0a]/50">
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-white" />
                <CardTitle className="text-lg text-white">Plan</CardTitle>
              </div>
              <CardDescription className="text-white/50">
                Demo-ready plan controls until real billing is connected.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="text-sm text-white/50">Current plan</div>
                <div className="text-2xl font-semibold text-white mt-1">
                  {profile?.plan === "PRO" ? "Pro Pilot" : "Starter"}
                </div>
                <div className="text-sm text-white/40 mt-2">
                  {profile?.plan === "PRO"
                    ? "All demo premium surfaces are unlocked."
                    : "Upgrade locally to preview the premium product state."}
                </div>
              </div>
              <Button
                className="bg-white text-black hover:bg-white/90"
                disabled={profile?.plan === "PRO"}
                onClick={() => void upgradeToPro()}
              >
                <Crown className="w-4 h-4 mr-2" /> {profile?.plan === "PRO" ? "Already Pro" : "Unlock Pro Demo"}
              </Button>
            </CardContent>
          </Card>

          <Card className="surface border-white/10 bg-[#0a0a0a]/50">
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-white" />
                <CardTitle className="text-lg text-white">Budgets</CardTitle>
              </div>
              <CardDescription className="text-white/50">
                Tune category limits that power dashboard alerts and AI guidance.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <form onSubmit={handleAddBudget} className="grid gap-4 md:grid-cols-[1fr_180px_160px]">
                <div className="space-y-2">
                  <Label htmlFor="budget-category">Category</Label>
                  <select
                    id="budget-category"
                    value={budgetCategory}
                    onChange={(event) => setBudgetCategory(event.target.value as TransactionCategory)}
                    className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none"
                  >
                    {budgetCategories.map((category) => (
                      <option key={category} value={category} className="bg-[#0a0a0a]">
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget-amount">Monthly Limit</Label>
                  <Input
                    id="budget-amount"
                    type="number"
                    value={budgetAmount}
                    onChange={(event) => setBudgetAmount(event.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="0"
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" className="w-full bg-white text-black hover:bg-white/90">
                    Save Budget
                  </Button>
                </div>
              </form>

              <div className="grid gap-4 md:grid-cols-2">
                {budgets.map((budget) => (
                  <div key={budget.category} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-medium text-white">{budget.category}</h4>
                        <p className="text-sm text-white/50 mt-1">
                          Spent {budget.spent.toLocaleString()} of {budget.amount.toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-white/40 hover:text-red-400"
                        onClick={() => void deleteBudget(budget.category)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-white"
                        style={{
                          width: `${Math.min(100, Math.round((budget.spent / Math.max(1, budget.amount)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="surface border-white/10 bg-[#0a0a0a]/50">
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-white" />
                <CardTitle className="text-lg text-white">Data Management</CardTitle>
              </div>
              <CardDescription className="text-white/50">
                Export your demo workspace or reset it back to the curated starter state.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                <div>
                  <h4 className="font-medium text-white">Export Data</h4>
                  <p className="text-sm text-white/50 mt-1">
                    Download your full transaction ledger as a CSV file.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-white/10 bg-white/5 text-white hover:bg-white/10 whitespace-nowrap"
                  onClick={handleExport}
                >
                  <Download className="w-4 h-4 mr-2" /> Export CSV
                </Button>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                <div>
                  <h4 className="font-medium text-red-400">Danger Zone</h4>
                  <p className="text-sm text-red-400/70 mt-1">
                    Reset the product back to the starter demo dataset.
                  </p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="bg-red-500/20 text-red-400 hover:bg-red-500/30 whitespace-nowrap border border-red-500/20">
                      <AlertTriangle className="w-4 h-4 mr-2" /> Reset Demo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-[#0a0a0a] border-red-500/20 text-white">
                    <DialogHeader>
                      <DialogTitle className="text-red-400 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" /> Reset all local product data?
                      </DialogTitle>
                      <DialogDescription className="text-white/60">
                        This resets transactions, budgets, goals, profile state, and plan state back to the original demo defaults.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2">
                      <DialogClose asChild>
                        <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button variant="destructive" onClick={handleReset} className="bg-red-600 hover:bg-red-700 text-white">
                        Yes, reset everything
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
