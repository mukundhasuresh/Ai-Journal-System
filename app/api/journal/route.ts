import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, ambience, text } = body ?? {};

    if (!userId || !ambience || !text) {
      return NextResponse.json(
        { error: "Missing required fields: userId, ambience, text" },
        { status: 400 },
      );
    }

    const entry = await prisma.journalEntry.create({
      data: {
        userId,
        ambience,
        text,
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("[POST /api/journal] Error creating journal entry", error);
    return NextResponse.json(
      { error: "Failed to create journal entry" },
      { status: 500 },
    );
  }
}

