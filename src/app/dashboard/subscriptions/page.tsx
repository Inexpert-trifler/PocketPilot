"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Calendar, CreditCard, PauseCircle, RefreshCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSubscriptions, subscribeToDataChanges, toggleRecurringTransaction, type Transaction } from "@/lib/api";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const getNextBillingDate = (date: string) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + 1);
  return next;
};

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubscriptions = async () => {
      const response = await getSubscriptions();
      setSubscriptions(response.data);
      setLoading(false);
    };

    void loadSubscriptions();
    return subscribeToDataChanges(() => {
      void loadSubscriptions();
    });
  }, []);

  const totalMonthly = useMemo(
    () => subscriptions.reduce((sum, subscription) => sum + subscription.amount, 0),
    [subscriptions]
  );

  const nextCharge = useMemo(() => {
    return subscriptions
      .map((subscription) => getNextBillingDate(subscription.date))
      .sort((left, right) => left.getTime() - right.getTime())[0];
  }, [subscriptions]);

  return (
    <div className="space-y-6 md:space-y-8 animate-in-fade">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Subscriptions</h1>
        <p className="text-white/50 text-sm md:text-base mt-1">
          Track recurring charges and clean up your run-rate.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="surface-elevated border-white/10 bg-[#0a0a0a]/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/50">Monthly Run-Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white">
              {formatCurrency(totalMonthly)}
            </div>
            <p className="text-sm text-white/40 mt-2">
              Across {subscriptions.length} recurring charges
            </p>
          </CardContent>
        </Card>

        <Card className="surface border-white/10 bg-[#0a0a0a]/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/50">Next Renewal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {nextCharge ? nextCharge.toLocaleDateString() : "No renewals"}
            </div>
            <p className="text-sm text-white/40 mt-2">
              Earliest upcoming recurring charge in demo mode.
            </p>
          </CardContent>
        </Card>

        <Card className="surface border-white/10 bg-[#0a0a0a]/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/50">Smart Tip</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-white">Pause unused tools first</div>
            <p className="text-sm text-white/40 mt-2">
              Subscriptions are usually the easiest recurring savings win.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="surface border-white/10 bg-[#0a0a0a]/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Active Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-white/50 py-4">Loading...</div>
          ) : subscriptions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {subscriptions.map((subscription) => {
                const renewalDate = getNextBillingDate(subscription.date);

                return (
                  <div
                    key={subscription.id}
                    className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-start justify-between gap-4"
                  >
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                        <CreditCard className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{subscription.description}</div>
                        <div className="flex items-center gap-1 text-xs text-white/40 mt-1">
                          <Calendar className="w-3 h-3" />
                          Renews {renewalDate.toLocaleDateString()}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="outline" className="bg-white text-black border-none text-[10px] px-1.5 py-0">
                            Monthly
                          </Badge>
                          <Badge variant="outline" className="bg-white/5 border-white/10 text-[10px] text-white/70">
                            {subscription.category}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-2">
                      <div className="font-semibold text-white">
                        {formatCurrency(subscription.amount)}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white/50 hover:text-white hover:bg-white/5"
                        onClick={() => void toggleRecurringTransaction(subscription.id)}
                      >
                        {subscription.isRecurring ? (
                          <>
                            <PauseCircle className="w-4 h-4 mr-2" /> Pause
                          </>
                        ) : (
                          <>
                            <RefreshCcw className="w-4 h-4 mr-2" /> Restore
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6 text-white/30" />
              </div>
              <p className="text-white/70 font-medium">No active subscriptions</p>
              <p className="text-white/40 text-sm mt-1">
                We could not detect any recurring payments in your history yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
