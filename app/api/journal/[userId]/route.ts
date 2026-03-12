import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = {
  params: {
    userId: string;
  };
};

export async function GET(_req: NextRequest, { params }: Params) {
  const { userId } = params;

  if (!userId) {
    return NextResponse.json(
      { error: "Missing required parameter: userId" },
      { status: 400 },
    );
  }

  try {
    const entries = await prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error(
      "[GET /api/journal/[userId]] Error fetching journal entries",
      error,
    );
    return NextResponse.json(
      { error: "Failed to fetch journal entries" },
      { status: 500 },
    );
  }
}

