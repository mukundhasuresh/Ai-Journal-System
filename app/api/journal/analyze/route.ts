import { NextRequest, NextResponse } from "next/server";
import { analyzeEmotionWithLLM } from "@/lib/llm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body ?? {};

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Missing required field: text" },
        { status: 400 },
      );
    }

    const result = await analyzeEmotionWithLLM(text);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[POST /api/journal/analyze] Error analyzing text", error);
    return NextResponse.json(
      { error: "Failed to analyze text" },
      { status: 500 },
    );
  }
}

