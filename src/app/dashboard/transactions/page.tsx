"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Plus, Search, ShoppingBag, Trash2, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addTransaction,
  deleteTransaction,
  getTransactions,
  subscribeToDataChanges,
  TransactionCategory,
  type Transaction,
  type TransactionType,
} from "@/lib/api";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const categories = Object.values(TransactionCategory);

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | TransactionType>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | TransactionCategory>("ALL");

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<"AUTO" | TransactionCategory>("AUTO");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const loadTransactions = async () => {
      const response = await getTransactions();
      setTransactions(response.data.transactions);
      setLoading(false);
    };

    void loadTransactions();
    return subscribeToDataChanges(() => {
      void loadTransactions();
    });
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch =
        transaction.description.toLowerCase().includes(search.toLowerCase()) ||
        transaction.category.toLowerCase().includes(search.toLowerCase()) ||
        transaction.merchant?.toLowerCase().includes(search.toLowerCase());

      const matchesType =
        typeFilter === "ALL" || transaction.type === typeFilter;

      const matchesCategory =
        categoryFilter === "ALL" || transaction.category === categoryFilter;

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [categoryFilter, search, transactions, typeFilter]);

  const totals = useMemo(() => {
    return filteredTransactions.reduce(
      (summary, transaction) => {
        if (transaction.type === "INCOME") {
          summary.income += transaction.amount;
        } else {
          summary.expenses += transaction.amount;
        }
        return summary;
      },
      { income: 0, expenses: 0 }
    );
  }, [filteredTransactions]);

  const handleAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!amount || !description) return;

    await addTransaction({
      amount: Number(amount),
      description,
      type,
      date: new Date(date).toISOString(),
      category: category === "AUTO" ? undefined : category,
      source: "manual",
    });

    setDialogOpen(false);
    setAmount("");
    setDescription("");
    setType("EXPENSE");
    setDate(new Date().toISOString().slice(0, 10));
    setCategory("AUTO");
  };

  const handleDelete = async (id: string) => {
    await deleteTransaction(id);
  };

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;

    const headers = ["Date", "Description", "Category", "Type", "Amount"];
    const csvContent = [
      headers.join(","),
      ...filteredTransactions.map((transaction) => {
        const dateValue = new Date(transaction.date).toLocaleDateString();
        const descriptionValue = `"${transaction.description.replace(/"/g, '""')}"`;
        return `${dateValue},${descriptionValue},${transaction.category},${transaction.type},${transaction.amount}`;
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in-fade">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Transactions</h1>
          <p className="text-white/50 text-sm md:text-base mt-1">
            Search, review, and add to your full financial history.
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="w-full md:w-auto bg-white/5 border-white/10 text-white hover:bg-white/10"
            disabled={filteredTransactions.length === 0}
          >
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto bg-white text-black hover:bg-white/90">
                <Plus className="w-4 h-4 mr-2" /> Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[460px] bg-[#0a0a0a] border-white/10 text-white">
              <DialogHeader>
                <DialogTitle>New Transaction</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <div className="flex gap-2">
                    {(["EXPENSE", "INCOME"] as const).map((value) => (
                      <Button
                        key={value}
                        type="button"
                        variant={type === value ? "default" : "outline"}
                        className={`flex-1 ${type === value ? "bg-white text-black" : "border-white/10 text-white"}`}
                        onClick={() => setType(value)}
                      >
                        {value === "EXPENSE" ? "Expense" : "Income"}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (INR)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(event) => setDate(event.target.value)}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Amazon, Salary, Coffee, Uber"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    className="bg-white/5 border-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={category}
                    onChange={(event) =>
                      setCategory(event.target.value as "AUTO" | TransactionCategory)
                    }
                    className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none"
                  >
                    <option value="AUTO" className="bg-[#0a0a0a]">
                      Auto-detect
                    </option>
                    {categories.map((value) => (
                      <option key={value} value={value} className="bg-[#0a0a0a]">
                        {value}
                      </option>
                    ))}
                  </select>
                </div>

                <Button type="submit" className="w-full bg-white text-black hover:bg-white/90 mt-2">
                  Save Transaction
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="surface border-white/10 bg-[#0a0a0a]/50">
          <CardContent className="p-5">
            <p className="text-white/50 text-sm">Income</p>
            <p className="text-2xl font-semibold text-white mt-2">
              {formatCurrency(totals.income)}
            </p>
          </CardContent>
        </Card>
        <Card className="surface border-white/10 bg-[#0a0a0a]/50">
          <CardContent className="p-5">
            <p className="text-white/50 text-sm">Expenses</p>
            <p className="text-2xl font-semibold text-white mt-2">
              {formatCurrency(totals.expenses)}
            </p>
          </CardContent>
        </Card>
        <Card className="surface border-white/10 bg-[#0a0a0a]/50">
          <CardContent className="p-5">
            <p className="text-white/50 text-sm">Net</p>
            <p className="text-2xl font-semibold text-white mt-2">
              {formatCurrency(totals.income - totals.expenses)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="surface-elevated border-white/10 bg-[#0a0a0a]/50">
        <div className="p-4 border-b border-white/10 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              placeholder="Search by merchant, category, or description"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9 bg-white/5 border-white/10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(["ALL", "INCOME", "EXPENSE"] as const).map((value) => (
              <Button
                key={value}
                variant="outline"
                size="sm"
                className={`${typeFilter === value ? "bg-white text-black" : "bg-white/5 border-white/10 text-white/70"}`}
                onClick={() => setTypeFilter(value)}
              >
                {value}
              </Button>
            ))}
          </div>
        </div>

        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className={`${categoryFilter === "ALL" ? "bg-white text-black" : "bg-white/5 border-white/10 text-white/70"}`}
              onClick={() => setCategoryFilter("ALL")}
            >
              All categories
            </Button>
            {categories.slice(0, 8).map((value) => (
              <Button
                key={value}
                variant="outline"
                size="sm"
                className={`${categoryFilter === value ? "bg-white text-black" : "bg-white/5 border-white/10 text-white/70"}`}
                onClick={() => setCategoryFilter(value)}
              >
                {value}
              </Button>
            ))}
          </div>
        </div>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-white/50">Loading transactions...</div>
          ) : filteredTransactions.length > 0 ? (
            <div className="divide-y divide-white/10">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === "INCOME" ? "bg-white/10" : "bg-white/5"}`}>
                      {transaction.type === "INCOME" ? (
                        <Wallet className="w-4 h-4 text-white" />
                      ) : (
                        <ShoppingBag className="w-4 h-4 text-white/70" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-white">{transaction.description}</div>
                      <div className="flex items-center gap-2 text-xs text-white/50 mt-1 flex-wrap">
                        <span>{new Date(transaction.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <Badge variant="outline" className="bg-white/5 border-white/10 text-[10px]">
                          {transaction.category}
                        </Badge>
                        {transaction.isRecurring ? (
                          <Badge variant="outline" className="bg-white/5 border-white/10 text-[10px]">
                            Recurring
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className={`font-semibold ${transaction.type === "INCOME" ? "text-white" : "text-white/70"}`}>
                      {transaction.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => void handleDelete(transaction.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-white/30" />
              </div>
              <p className="text-white/70 font-medium">No transactions found</p>
              <p className="text-white/40 text-sm mt-1">
                Try adjusting your filters or add a new transaction.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
