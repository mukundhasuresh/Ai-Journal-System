import type { prisma as prismaInstance } from "./db";

type PrismaClient = typeof prismaInstance;

export type Insights = {
  totalEntries: number;
  topEmotion: string | null;
  mostUsedAmbience: string | null;
  recentKeywords: string[];
};

export async function computeInsights(
  prisma: PrismaClient,
  userId: string,
): Promise<Insights> {
  const entries = await prisma.journalEntry.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const totalEntries = entries.length;

  if (totalEntries === 0) {
    return {
      totalEntries: 0,
      topEmotion: null,
      mostUsedAmbience: null,
      recentKeywords: [],
    };
  }

  const emotionCounts: Record<string, number> = {};
  const ambienceCounts: Record<string, number> = {};
  const keywordList: string[] = [];

  for (const entry of entries) {
    if (entry.emotion) {
      const emotionKey = entry.emotion.toLowerCase();
      emotionCounts[emotionKey] = (emotionCounts[emotionKey] ?? 0) + 1;
    }

    if (entry.ambience) {
      const ambienceKey = entry.ambience.toLowerCase();
      ambienceCounts[ambienceKey] = (ambienceCounts[ambienceKey] ?? 0) + 1;
    }

    if (entry.keywords) {
      try {
        const parsed = JSON.parse(entry.keywords) as unknown;
        if (Array.isArray(parsed)) {
          for (const kw of parsed) {
            const val = String(kw).trim();
            if (val) keywordList.push(val);
          }
        }
      } catch {
        for (const kw of entry.keywords.split(",")) {
          const val = kw.trim();
          if (val) keywordList.push(val);
        }
      }
    }
  }

  const topEmotion =
    Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const mostUsedAmbience =
    Object.entries(ambienceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const recentKeywords = Array.from(new Set(keywordList)).slice(0, 10);

  return {
    totalEntries,
    topEmotion,
    mostUsedAmbience,
    recentKeywords,
  };
}

