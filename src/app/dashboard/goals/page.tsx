"use client";

import { useState, useEffect } from "react";
import { getGoals, addGoal, updateGoalAmount, deleteGoal, SavingsGoal } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Target, Plus, Trash2, TrendingUp } from "lucide-react";

export default function GoalsPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Goal Form State
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Contribute Form State
  const [contributeAmount, setContributeAmount] = useState("");
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);

  const fetchGoals = async () => {
    try {
      const res = await getGoals();
      if (res.success) {
        setGoals(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount) return;
    await addGoal({
      name,
      emoji: emoji || "🎯",
      targetAmount: parseFloat(targetAmount),
      targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    });
    setDialogOpen(false);
    setName("");
    setEmoji("");
    setTargetAmount("");
    fetchGoals();
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributeAmount || !activeGoalId) return;
    await updateGoalAmount(activeGoalId, parseFloat(contributeAmount));
    setContributeAmount("");
    setActiveGoalId(null);
    fetchGoals();
  };

  const handleDelete = async (id: string) => {
    await deleteGoal(id);
    fetchGoals();
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in-fade">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Savings Goals</h1>
          <p className="text-white/50 text-sm md:text-base mt-1">Track and manage your financial milestones.</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto bg-white text-black hover:bg-white/90">
              <Plus className="w-4 h-4 mr-2" /> New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-[#0a0a0a] border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Create a Savings Goal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddGoal} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Goal Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Emergency Fund, PS5 Pro" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetAmount">Target Amount (₹)</Label>
                  <Input 
                    id="targetAmount" 
                    type="number" 
                    placeholder="0" 
                    value={targetAmount} 
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emoji">Emoji (Optional)</Label>
                  <Input 
                    id="emoji" 
                    placeholder="🎯" 
                    value={emoji} 
                    onChange={(e) => setEmoji(e.target.value)}
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-white text-black hover:bg-white/90 mt-2">
                Create Goal
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-white/50">Loading goals...</div>
        ) : goals.length > 0 ? (
          goals.map(g => {
            const progress = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
            return (
              <Card key={g.id} className="surface border-white/10 bg-[#0a0a0a]/50 flex flex-col">
                <CardHeader className="pb-2 flex flex-row items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{g.emoji}</div>
                    <div>
                      <CardTitle className="text-base text-white">{g.name}</CardTitle>
                      <div className="text-xs text-white/40 mt-1">
                        Target: {new Date(g.targetDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white/30 hover:text-red-400 -mr-2 -mt-2"
                    onClick={() => handleDelete(g.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end pt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white font-medium">₹{g.currentAmount.toLocaleString()}</span>
                    <span className="text-white/50">of ₹{g.targetAmount.toLocaleString()}</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-white/5 [&>div]:bg-white mb-6" />
                  
                  {g.status !== "COMPLETED" ? (
                    <Dialog 
                      open={activeGoalId === g.id} 
                      onOpenChange={(open) => {
                        if (open) setActiveGoalId(g.id);
                        else {
                          setActiveGoalId(null);
                          setContributeAmount("");
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10">
                          <TrendingUp className="w-4 h-4 mr-2" /> Contribute
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] bg-[#0a0a0a] border-white/10 text-white">
                        <DialogHeader>
                          <DialogTitle>Add Funds to {g.name}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleContribute} className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <Label>Amount to add (₹)</Label>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              value={contributeAmount} 
                              onChange={(e) => setContributeAmount(e.target.value)}
                              className="bg-white/5 border-white/10"
                            />
                          </div>
                          <Button type="submit" className="w-full bg-white text-black hover:bg-white/90">
                            Add Funds
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Button disabled variant="outline" className="w-full border-white/10 bg-white/5 text-white/50">
                      Completed
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="col-span-full border-white/10 bg-[#0a0a0a]/50 border-dashed">
            <CardContent className="text-center py-16">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-white/30" />
              </div>
              <p className="text-white/70 font-medium">No goals set up yet</p>
              <p className="text-white/40 text-sm mt-1 max-w-sm mx-auto">Create a savings goal to start tracking your progress towards your next big purchase.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
