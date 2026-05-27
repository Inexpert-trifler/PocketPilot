"use client";

import { useState, useEffect } from "react";
import { getSubscriptions, Transaction } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, AlertCircle, Calendar } from "lucide-react";

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubs = async () => {
      try {
        const res = await getSubscriptions();
        if (res.success) {
          setSubscriptions(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSubs();
  }, []);

  const totalMonthly = subscriptions.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="space-y-6 md:space-y-8 animate-in-fade">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Subscriptions</h1>
        <p className="text-white/50 text-sm md:text-base mt-1">Manage your recurring payments and run-rate.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="surface-elevated border-white/10 bg-[#0a0a0a]/50 col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/50">Monthly Run-Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white">
              ₹{totalMonthly.toLocaleString()}
            </div>
            <p className="text-sm text-white/40 mt-2">
              Across {subscriptions.length} active subscriptions
            </p>
          </CardContent>
        </Card>

        <Card className="surface border-white/10 bg-[#0a0a0a]/50 col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-white/50 py-4">Loading...</div>
            ) : subscriptions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {subscriptions.map(s => (
                  <div key={s.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                        <CreditCard className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{s.description}</div>
                        <div className="flex items-center gap-1 text-xs text-white/40 mt-1">
                          <Calendar className="w-3 h-3" /> Monthly
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-white">₹{s.amount}</div>
                      <Badge variant="outline" className="mt-1 bg-white text-black border-none text-[10px] px-1.5 py-0">Active</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="w-6 h-6 text-white/30" />
                </div>
                <p className="text-white/70 font-medium">No active subscriptions</p>
                <p className="text-white/40 text-sm mt-1">We couldn't detect any recurring payments in your history.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
