import { useState } from "react";

type JournalFormProps = {
  userId: string;
  onSubmitted: () => void;
  onAnalyzed: (result: {
    emotion: string;
    keywords: string[];
    summary: string;
  }) => void;
};

export function JournalForm({ userId, onSubmitted, onAnalyzed }: JournalFormProps) {
  const [ambience, setAmbience] = useState("forest");
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ambience, text }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save entry");
      }

      setText("");
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAnalyze() {
    setError(null);
    setIsAnalyzing(true);

    try {
      const res = await fetch("/api/journal/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to analyze entry");
      }

      const result = await res.json();
      onAnalyzed(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
    >
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-zinc-700">
          Ambience
        </label>
        <select
          value={ambience}
          onChange={(e) => setAmbience(e.target.value)}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="forest">Forest</option>
          <option value="ocean">Ocean</option>
          <option value="mountain">Mountain</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-zinc-700">
          Journal entry
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write about how you felt during your ambience session..."
          className="min-h-[120px] w-full resize-vertical rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSubmitting || !text.trim()}
          className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
        >
          {isSubmitting ? "Saving..." : "Save entry"}
        </button>
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isAnalyzing || !text.trim()}
          className="inline-flex items-center justify-center rounded-md border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isAnalyzing ? "Analyzing..." : "Analyze emotions"}
        </button>
      </div>
    </form>
  );
}

