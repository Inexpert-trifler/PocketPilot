"use client";

import { useState, useEffect } from "react";
import { getTransactions, addTransaction, deleteTransaction, Transaction, TransactionCategory } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Trash2, Wallet, ShoppingBag, Download } from "lucide-react";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");

  // Add Transaction Form State
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchTransactions = async () => {
    try {
      const res = await getTransactions();
      if (res.success) {
        setTransactions(res.data.transactions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;
    await addTransaction({
      amount: parseFloat(amount),
      description,
      type
    });
    setDialogOpen(false);
    setAmount("");
    setDescription("");
    setType("EXPENSE");
    fetchTransactions();
  };

  const handleDelete = async (id: string) => {
    await deleteTransaction(id);
    fetchTransactions();
  };

  const filtered = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "ALL" || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleExportCSV = () => {
    if (filtered.length === 0) return;
    
    const headers = ["Date", "Description", "Category", "Type", "Amount"];
    const csvContent = [
      headers.join(","),
      ...filtered.map(t => {
        const date = new Date(t.date).toLocaleDateString();
        const desc = `"${t.description.replace(/"/g, '""')}"`;
        return `${date},${desc},${t.category},${t.type},${t.amount}`;
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
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
          <p className="text-white/50 text-sm md:text-base mt-1">Manage your financial history.</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <Button 
            variant="outline" 
            onClick={handleExportCSV}
            className="w-full md:w-auto bg-white/5 border-white/10 text-white hover:bg-white/10"
            disabled={filtered.length === 0}
          >
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto bg-white text-black hover:bg-white/90">
                <Plus className="w-4 h-4 mr-2" /> Add Transaction
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-[#0a0a0a] border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>New Transaction</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant={type === "EXPENSE" ? "default" : "outline"}
                    className={`flex-1 ${type === "EXPENSE" ? "bg-white text-black" : "border-white/10 text-white"}`}
                    onClick={() => setType("EXPENSE")}
                  >
                    Expense
                  </Button>
                  <Button 
                    type="button" 
                    variant={type === "INCOME" ? "default" : "outline"}
                    className={`flex-1 ${type === "INCOME" ? "bg-white text-black" : "border-white/10 text-white"}`}
                    onClick={() => setType("INCOME")}
                  >
                    Income
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input 
                  id="description" 
                  placeholder="e.g. Amazon, Salary, Coffee" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <Button type="submit" className="w-full bg-white text-black hover:bg-white/90 mt-2">
                Save Transaction
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Card className="surface-elevated border-white/10 bg-[#0a0a0a]/50">
        <div className="p-4 border-b border-white/10 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input 
              placeholder="Search transactions..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white/5 border-white/10"
            />
          </div>
          <div className="flex gap-2">
            {(["ALL", "INCOME", "EXPENSE"] as const).map(t => (
              <Button 
                key={t}
                variant="outline" 
                size="sm"
                className={`${typeFilter === t ? "bg-white text-black" : "bg-white/5 border-white/10 text-white/70"}`}
                onClick={() => setTypeFilter(t)}
              >
                {t}
              </Button>
            ))}
          </div>
        </div>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-white/50">Loading transactions...</div>
          ) : filtered.length > 0 ? (
            <div className="divide-y divide-white/10">
              {filtered.map(t => (
                <div key={t.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'INCOME' ? 'bg-white/10' : 'bg-white/5'}`}>
                      {t.type === 'INCOME' ? <Wallet className="w-4 h-4 text-white" /> : <ShoppingBag className="w-4 h-4 text-white/70" />}
                    </div>
                    <div>
                      <div className="font-medium text-white">{t.description}</div>
                      <div className="flex items-center gap-2 text-xs text-white/50 mt-1">
                        <span>{new Date(t.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <Badge variant="outline" className="bg-white/5 border-white/10 text-[10px]">{t.category}</Badge>
                        {t.isRecurring && <Badge variant="outline" className="bg-white/5 border-white/10 text-[10px]">Recurring</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`font-semibold ${t.type === 'INCOME' ? 'text-white' : 'text-white/70'}`}>
                      {t.type === 'INCOME' ? '+' : '-'}₹{t.amount}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDelete(t.id)}
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
              <p className="text-white/40 text-sm mt-1">Try adjusting your filters or add a new transaction.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
