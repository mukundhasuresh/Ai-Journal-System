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
    <div className="relative min-h-screen overflow-hidden px-4 py-6 text-slate-50">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25)_0,_transparent_55%),radial-gradient(circle_at_bottom,_rgba(129,140,248,0.2)_0,_transparent_55%)]" />

      <main className="mx-auto flex max-w-6xl flex-col gap-8 lg:min-h-[calc(100vh-3rem)] lg:flex-row">
        {/* Left column: nav + hero + form + entries */}
        <section className="flex-1 space-y-6">
          <header className="flex items-center justify-between rounded-full border border-white/10 bg-slate-900/60 px-4 py-2 shadow-[0_0_0_1px_rgba(15,23,42,0.8)] backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-400 to-sky-400 text-xs font-semibold text-slate-950 shadow-lg shadow-emerald-500/40">
                AJ
              </div>
              <div className="leading-tight">
                <p className="text-xs font-semibold tracking-wide text-slate-100">
                  AI Journal System
                </p>
                <p className="text-[11px] text-slate-400">
                  Emotional analytics for ambience sessions
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-3 py-1 text-[11px] font-medium text-emerald-300 ring-1 ring-emerald-400/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.45)]" />
              Live emotion insights
            </span>
          </header>

          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.85)] backdrop-blur-xl lg:p-7">
            <div className="mb-6 flex flex-col gap-4 border-b border-white/5 pb-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                  Reflect after every ambience session.
                </h1>
                <p className="mt-2 max-w-xl text-sm text-slate-300">
                  Drop into a forest, ocean, or mountain soundscape, journal how you feel,
                  and let the AI surface your emotional patterns over time.
                </p>
              </div>
              <div className="flex gap-3 text-xs">
                <div className="rounded-2xl border border-sky-400/40 bg-sky-500/10 px-4 py-3 text-sky-100 shadow-[0_10px_35px_rgba(56,189,248,0.4)]">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-sky-200/80">
                    Today&apos;s mood
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    {lastAnalysis?.emotion || "—"}
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-400/35 bg-emerald-500/10 px-4 py-3 text-emerald-100">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-200/80">
                    Total entries
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    {insights?.totalEntries ?? 0}
                  </p>
                </div>
              </div>
            </div>

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

            <section className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Recent entries
                </h2>
                {loadingEntries && (
                  <span className="text-[11px] text-slate-400">
                    Syncing…
                  </span>
                )}
              </div>
              <EntryList entries={entries} />
            </section>
          </div>
        </section>

        {/* Right column: insight sidebar with hero visual */}
        <aside className="w-full max-w-md space-y-4 lg:w-80">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/90 p-5 shadow-[0_22px_60px_rgba(15,23,42,0.85)] backdrop-blur-2xl">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="pointer-events-none absolute -left-16 bottom-0 h-36 w-36 rounded-full bg-sky-400/25 blur-3xl" />

            <div className="relative space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Emotional insights
                </h2>
                {loadingInsights && (
                  <span className="text-[11px] text-slate-400">
                    Updating…
                  </span>
                )}
              </div>

              <InsightsPanel insights={insights} lastAnalysis={lastAnalysis} />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-xs text-slate-300 backdrop-blur-xl">
            <p className="font-medium text-slate-100">
              Designed for calm, focused reflection.
            </p>
            <p className="mt-1 text-slate-400">
              Pair this journal with your favourite ambience track, log how you feel in a
              few sentences, and watch your emotional landscape emerge like a heatmap
              over time.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
