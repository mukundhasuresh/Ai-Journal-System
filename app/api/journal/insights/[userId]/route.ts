import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { computeInsights } from "@/lib/insights";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params;

  if (!userId) {
    return NextResponse.json(
      { error: "Missing required parameter: userId" },
      { status: 400 }
    );
  }

  try {
    const insights = await computeInsights(prisma, userId);
    return NextResponse.json(insights);
  } catch (error) {
    console.error(
      "[GET /api/journal/insights/[userId]] Error computing insights",
      error
    );

    return NextResponse.json(
      { error: "Failed to compute insights" },
      { status: 500 }
    );
  }
}