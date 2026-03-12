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
    <div className="min-h-screen px-4 py-6 text-slate-900">
      <main className="mx-auto flex max-w-4xl flex-col gap-6 lg:flex-row">
        {/* Left column: heading + form + entries */}
        <section className="flex-1 space-y-5">
          <header className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              AI Journal
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              A calm space to reflect after every ambience session.
            </h1>
            <p className="max-w-xl text-sm text-slate-500">
              Choose an ambience, write a short entry, and let gentle AI insights
              help you notice emotional patterns over time.
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
              <h2 className="text-sm font-semibold text-slate-900">
                Recent entries
              </h2>
              {loadingEntries && (
                <span className="text-xs text-slate-400">
                  Syncing…
                </span>
              )}
            </div>
            <EntryList entries={entries} />
          </section>
        </section>

        {/* Right column: insights */}
        <aside className="w-full max-w-sm space-y-4 lg:w-80">
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                Emotional insights
              </h2>
              {loadingInsights && (
                <span className="text-xs text-slate-400">
                  Updating…
                </span>
              )}
            </div>
            <InsightsPanel insights={insights} lastAnalysis={lastAnalysis} />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-xs text-slate-500 shadow-sm backdrop-blur">
            <p className="font-medium text-slate-900">
              Designed to stay out of your way.
            </p>
            <p className="mt-1">
              Mobile‑first layout, clear typography, and a quiet visual style so
              your words — not the interface — are what you notice.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
