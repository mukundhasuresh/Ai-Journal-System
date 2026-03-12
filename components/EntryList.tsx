type Entry = {
  id: string;
  ambience: string;
  text: string;
  emotion: string | null;
  createdAt: string;
};

type EntryListProps = {
  entries: Entry[];
};

export function EntryList({ entries }: EntryListProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500">
        No entries yet. Your recent journals will appear here.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <article
          key={entry.id}
          className="rounded-lg border border-zinc-200 bg-white p-3 text-sm shadow-sm"
        >
          <div className="mb-1 flex items-center justify-between text-xs text-zinc-500">
            <span className="capitalize">{entry.ambience}</span>
            <span>
              {new Date(entry.createdAt).toLocaleString()}
            </span>
          </div>
          {entry.emotion && (
            <p className="mb-1 text-xs font-medium text-indigo-600">
              Emotion: {entry.emotion}
            </p>
          )}
          <p className="text-zinc-700">{entry.text}</p>
        </article>
      ))}
    </div>
  );
}

