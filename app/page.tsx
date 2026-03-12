"use client";

import { useEffect, useState } from "react";
import { JournalForm } from "@/components/JournalForm";
import { EntryList } from "@/components/EntryList";
import { InsightsPanel } from "@/components/InsightsPanel";

type Entry = {
  id: string;
  ambience: string;
  text: string;
  emotion: string | null;
  createdAt: string;
};

type Insights = {
  totalEntries: number;
  topEmotion: string | null;
  mostUsedAmbience: string | null;
  recentKeywords: string[];
};

export default function Home() {
  const [userId] = useState("demo-user-1");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<{
    emotion: string;
    keywords: string[];
    summary: string;
  } | null>(null);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);

  async function fetchEntries() {
    setLoadingEntries(true);
    try {
      const res = await fetch(`/api/journal/${userId}`);
      if (!res.ok) return;
      const data = await res.json();
      setEntries(data);
    } finally {
      setLoadingEntries(false);
    }
  }

  async function fetchInsights() {
    setLoadingInsights(true);
    try {
      const res = await fetch(`/api/journal/insights/${userId}`);
      if (!res.ok) return;
      const data = await res.json();
      setInsights(data);
    } finally {
      setLoadingInsights(false);
    }
  }

  useEffect(() => {
    fetchEntries();
    fetchInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-slate-50 to-emerald-50 px-4 py-8 font-sans text-zinc-900">
      <main className="mx-auto flex max-w-5xl flex-col gap-6 lg:flex-row">
        <section className="flex-1 space-y-4">
          <header className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              AI Journal System
            </h1>
            <p className="text-sm text-zinc-600">
              Capture how you feel after each ambience session and let the AI
              reflect your emotional journey over time.
            </p>
          </header>

          <JournalForm
            userId={userId}
            onSubmitted={() => {
              fetchEntries();
              fetchInsights();
            }}
            onAnalyzed={(result) => {
              setLastAnalysis(result);
            }}
          />

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-800">
                Recent entries
              </h2>
              {loadingEntries && (
                <span className="text-xs text-zinc-500">
                  Loading…
                </span>
              )}
            </div>
            <EntryList entries={entries} />
          </section>
        </section>

        <aside className="w-full max-w-md space-y-3 lg:w-80">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-800">
              Emotional insights
            </h2>
            {loadingInsights && (
              <span className="text-xs text-zinc-500">
                Updating…
              </span>
            )}
          </div>
          <InsightsPanel insights={insights} lastAnalysis={lastAnalysis} />
        </aside>
      </main>
    </div>
  );
}
