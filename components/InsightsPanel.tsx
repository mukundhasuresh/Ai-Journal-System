type Insights = {
  totalEntries: number;
  topEmotion: string | null;
  mostUsedAmbience: string | null;
  recentKeywords: string[];
};

type InsightsPanelProps = {
  insights: Insights | null;
  lastAnalysis: {
    emotion: string;
    keywords: string[];
    summary: string;
  } | null;
};

export function InsightsPanel({ insights, lastAnalysis }: InsightsPanelProps) {
  if (!insights && !lastAnalysis) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500">
        Your emotional insights will appear here after you start journaling.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      {insights && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-zinc-800">
            Long-term insights
          </h2>
          <dl className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <dt className="text-zinc-500">Total entries</dt>
              <dd className="text-lg font-semibold text-zinc-900">
                {insights.totalEntries}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Top emotion</dt>
              <dd className="text-sm font-medium text-indigo-700">
                {insights.topEmotion ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Most used ambience</dt>
              <dd className="text-sm font-medium capitalize text-zinc-800">
                {insights.mostUsedAmbience ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Recent keywords</dt>
              <dd className="text-xs text-zinc-800">
                {insights.recentKeywords.length > 0
                  ? insights.recentKeywords.join(", ")
                  : "—"}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {lastAnalysis && (
        <div className="space-y-2 border-t border-zinc-100 pt-3">
          <h2 className="text-sm font-semibold text-zinc-800">
            Latest analysis
          </h2>
          <p className="text-xs text-zinc-600">
            <span className="font-medium text-indigo-700">
              Emotion:
            </span>{" "}
            {lastAnalysis.emotion}
          </p>
          <p className="text-xs text-zinc-600">
            <span className="font-medium text-indigo-700">
              Keywords:
            </span>{" "}
            {lastAnalysis.keywords.join(", ")}
          </p>
          <p className="text-xs text-zinc-700">
            {lastAnalysis.summary}
          </p>
        </div>
      )}
    </div>
  );
}

