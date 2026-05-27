"use client";

import { useState, useEffect } from "react";
import { getProfile, updateProfile, exportDataAsCSV, resetAllData, UserProfile } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Download, AlertTriangle, User, Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        if (res.success) {
          setProfile(res.data);
          setName(res.data.name || "");
          setCurrency(res.data.currency || "INR");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateProfile({ name, currency });
    if (res.success) {
      setProfile(res.data);
      // Could show a toast here in a real app
    }
  };

  const handleExport = () => {
    const csv = exportDataAsCSV();
    if (!csv) return alert("No data to export");
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pocketpilot_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    resetAllData();
    window.location.href = "/";
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in-fade max-w-4xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Profile & Settings</h1>
        <p className="text-white/50 text-sm md:text-base mt-1">Manage your account and local data.</p>
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
                Update your personal details.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency Code</Label>
                  <Input 
                    id="currency" 
                    value={currency} 
                    onChange={(e) => setCurrency(e.target.value)}
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
                <SettingsIcon className="w-5 h-5 text-white" />
                <CardTitle className="text-lg text-white">Data Management</CardTitle>
              </div>
              <CardDescription className="text-white/50">
                Control your local data. Everything is stored directly on your device.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                <div>
                  <h4 className="font-medium text-white">Export Data</h4>
                  <p className="text-sm text-white/50 mt-1">Download all your transactions as a CSV file.</p>
                </div>
                <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10 whitespace-nowrap" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" /> Export CSV
                </Button>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                <div>
                  <h4 className="font-medium text-red-400">Danger Zone</h4>
                  <p className="text-sm text-red-400/70 mt-1">Permanently delete all data from this device. This cannot be undone.</p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="bg-red-500/20 text-red-400 hover:bg-red-500/30 whitespace-nowrap border border-red-500/20">
                      <AlertTriangle className="w-4 h-4 mr-2" /> Wipe Data
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-[#0a0a0a] border-red-500/20 text-white">
                    <DialogHeader>
                      <DialogTitle className="text-red-400 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" /> Are you absolutely sure?
                      </DialogTitle>
                      <DialogDescription className="text-white/60">
                        This will permanently delete all your transactions, budgets, goals, and profile data from local storage. You cannot undo this action.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2">
                      <DialogClose asChild>
                        <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10">Cancel</Button>
                      </DialogClose>
                      <Button variant="destructive" onClick={handleReset} className="bg-red-600 hover:bg-red-700 text-white">
                        Yes, delete everything
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
