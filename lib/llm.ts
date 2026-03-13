import axios from "axios";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

export type EmotionAnalysisResult = {
  emotion: string;
  keywords: string[];
  summary: string;
};

const SYSTEM_PROMPT = `You are an assistant that analyzes short personal journal entries.
You must respond with strict JSON matching this TypeScript type:

{
  "emotion": string,
  "keywords": string[],
  "summary": string
}

emotion: one primary emotion word like "calm", "anxious", "happy"
keywords: 3-7 themes or concepts
summary: 1-2 sentence neutral summary

Respond with JSON only. Do not include markdown or explanation.`;

const analysisCache = new Map<string, EmotionAnalysisResult>();

export async function analyzeEmotionWithLLM(
  text: string
): Promise<EmotionAnalysisResult> {
  if (!text?.trim()) {
    throw new Error("Text is required for analysis");
  }

  const cacheKey = text.trim();

  const cached = analysisCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  if (!OPENROUTER_API_KEY && !GROQ_API_KEY) {
    throw new Error("No LLM API key configured");
  }

  const prompt = `Journal entry:\n"""${text}"""\n\nReturn the JSON response now.`;

  let result: EmotionAnalysisResult;

  if (OPENROUTER_API_KEY) {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt }
        ],
        temperature: 0.2
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const content = response.data?.choices?.[0]?.message?.content ?? "{}";

    result = safeParseResult(content);
  } else {
    const groqResponse = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt }
        ],
        temperature: 0.2
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const groqContent =
      groqResponse.data?.choices?.[0]?.message?.content ?? "{}";

    result = safeParseResult(groqContent);
  }

  analysisCache.set(cacheKey, result);

  return result;
}

function safeParseResult(raw: string): EmotionAnalysisResult {
  try {
    const cleaned = raw
      .trim()
      .replace(/^```json/i, "")
      .replace(/```$/i, "");

    const parsed = JSON.parse(cleaned);

    return {
      emotion: String(parsed.emotion ?? "").trim(),
      keywords: Array.isArray(parsed.keywords)
        ? parsed.keywords.map((k: unknown) => String(k))
        : [],
      summary: String(parsed.summary ?? "").trim()
    };
  } catch (error) {
    console.error("Failed to parse LLM JSON response", error, raw);
    throw new Error("Failed to parse LLM response");
  }
}