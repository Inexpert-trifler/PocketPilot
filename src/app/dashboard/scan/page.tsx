"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Camera, CheckCircle2, FileText, Maximize, Upload, X, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  createScanSuggestion,
  importTransactions,
  parseCsvImport,
  TransactionCategory,
  type ScanSuggestion,
} from "@/lib/api";

const categories = Object.values(TransactionCategory);

export default function ScanReceiptPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState("Position a file to start smart extraction");
  const [suggestions, setSuggestions] = useState<ScanSuggestion[]>([]);

  const handlePickFile = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (file: File | null) => {
    if (!file) return;

    setFileName(file.name);
    setProcessing(true);
    setMessage("Analyzing your file...");

    const response =
      file.type === "text/csv"
        ? await parseCsvImport(file)
        : await createScanSuggestion(file);

    setSuggestions(response.data);
    setProcessing(false);
    setMessage(
      response.data.length
        ? "Review the draft details before importing"
        : "We could not detect transactions in that file"
    );
  };

  const updateSuggestion = (
    index: number,
    field: keyof ScanSuggestion,
    value: string | number | boolean
  ) => {
    setSuggestions((current) =>
      current.map((suggestion, suggestionIndex) =>
        suggestionIndex === index
          ? { ...suggestion, [field]: value }
          : suggestion
      )
    );
  };

  const handleImport = async () => {
    if (suggestions.length === 0) return;

    setImporting(true);
    await importTransactions(
      suggestions.map((suggestion) => ({
        amount: suggestion.amount,
        date: suggestion.date,
        description: suggestion.description,
        type: suggestion.type,
        category: suggestion.category,
        isRecurring: suggestion.isRecurring,
        merchant: suggestion.merchant,
        source: "scan",
      }))
    );
    setImporting(false);
    setSuggestions([]);
    setFileName("");
    setMessage("Transactions imported successfully. Head back to the dashboard.");
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-y-auto">
      <input
        ref={inputRef}
        type="file"
        accept=".csv,application/pdf,image/*"
        className="hidden"
        onChange={(event) => void handleFileChange(event.target.files?.[0] ?? null)}
      />

      <div className="absolute top-0 w-full p-6 pt-safe flex justify-between items-center z-20">
        <Link href="/dashboard">
          <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-transform">
            <X className="w-6 h-6" />
          </button>
        </Link>
        <div className="bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full text-white/80 text-sm font-medium border border-white/10 flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-400" /> Demo Smart Import
        </div>
      </div>

      <div className="min-h-screen px-6 py-28">
        <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-[1fr_1.1fr] items-start">
          <div className="relative w-full rounded-[3rem] border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.12)] bg-[#0d0d12] min-h-[520px] flex flex-col items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.18),transparent_45%)]" />
            <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-purple-500 rounded-tl-2xl" />
            <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-purple-500 rounded-tr-2xl" />
            <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-purple-500 rounded-bl-2xl" />
            <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-purple-500 rounded-br-2xl" />

            <div className="absolute inset-0 bg-[#121217] opacity-70" />

            <div className="relative z-10 max-w-sm px-8 text-center space-y-5">
              <div className="w-24 h-24 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                {processing ? (
                  <Camera className="w-10 h-10 text-purple-300 animate-pulse" />
                ) : (
                  <FileText className="w-10 h-10 text-white/40" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-white">Smart Statement Scan</h1>
                <p className="text-white/50 mt-2 text-sm leading-relaxed">
                  Upload a CSV, PDF, or receipt image. We will generate editable demo transactions for you to confirm.
                </p>
              </div>
              <div className="text-sm text-white/70 min-h-10">{message}</div>
              {fileName ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                  Selected: {fileName}
                </div>
              ) : null}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button className="bg-white text-black hover:bg-white/90" onClick={handlePickFile}>
                  <Upload className="w-4 h-4 mr-2" /> Choose File
                </Button>
                <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={handlePickFile}>
                  <Maximize className="w-4 h-4 mr-2" /> Replace
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 md:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white">Detected Transactions</h2>
              <p className="text-white/50 text-sm mt-1">
                Edit anything before importing. CSVs can generate multiple rows, while images and PDFs create a smart draft.
              </p>
            </div>

            {suggestions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center">
                <p className="text-white/60 text-sm">
                  No drafts yet. Choose a file from the left to start.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {suggestions.map((suggestion, index) => (
                  <div key={`${suggestion.description}-${index}`} className="rounded-2xl border border-white/10 bg-black/25 p-5 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm text-white/40">Draft #{index + 1}</div>
                        <div className="text-white/80 text-sm mt-1">{suggestion.summary}</div>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        {suggestion.confidence} confidence
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2 text-sm text-white/70">
                        <span>Description</span>
                        <input
                          value={suggestion.description}
                          onChange={(event) =>
                            updateSuggestion(index, "description", event.target.value)
                          }
                          className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-white outline-none"
                        />
                      </label>

                      <label className="space-y-2 text-sm text-white/70">
                        <span>Amount</span>
                        <input
                          type="number"
                          value={suggestion.amount}
                          onChange={(event) =>
                            updateSuggestion(index, "amount", Number(event.target.value))
                          }
                          className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-white outline-none"
                        />
                      </label>

                      <label className="space-y-2 text-sm text-white/70">
                        <span>Date</span>
                        <input
                          type="date"
                          value={suggestion.date.slice(0, 10)}
                          onChange={(event) =>
                            updateSuggestion(index, "date", new Date(event.target.value).toISOString())
                          }
                          className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-white outline-none"
                        />
                      </label>

                      <label className="space-y-2 text-sm text-white/70">
                        <span>Category</span>
                        <select
                          value={suggestion.category}
                          onChange={(event) =>
                            updateSuggestion(index, "category", event.target.value as TransactionCategory)
                          }
                          className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-white outline-none"
                        >
                          {categories.map((category) => (
                            <option key={category} value={category} className="bg-[#0a0a0a]">
                              {category}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="bg-white text-black hover:bg-white/90"
                disabled={suggestions.length === 0 || importing}
                onClick={() => void handleImport()}
              >
                <Upload className="w-4 h-4 mr-2" />
                {importing ? "Importing..." : `Import ${suggestions.length || ""} transaction${suggestions.length === 1 ? "" : "s"}`}
              </Button>
              <Link href="/dashboard/transactions" className="sm:flex-1">
                <Button variant="outline" className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10">
                  View Transaction Ledger
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
