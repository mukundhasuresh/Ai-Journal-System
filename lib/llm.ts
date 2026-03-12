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
  "emotion": string;        // primary dominant emotion word, like "calm", "anxious"
  "keywords": string[];     // 3-7 key themes or concepts from the text
  "summary": string;        // 1-2 sentence neutral summary of the entry
}

Respond with JSON only. Do not include any extra text or formatting.`;

export async function analyzeEmotionWithLLM(
  text: string,
): Promise<EmotionAnalysisResult> {
  if (!text?.trim()) {
    throw new Error("Text is required for analysis");
  }

  if (!OPENROUTER_API_KEY && !GROQ_API_KEY) {
    throw new Error("No LLM API key configured");
  }

  const prompt = `Journal entry:\n"""${text}"""\n\nReturn the JSON response now.`;

  if (OPENROUTER_API_KEY) {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4.1-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const content =
      response.data?.choices?.[0]?.message?.content ?? "{}";
    return safeParseResult(content);
  }

  // Fallback to Groq if configured and OpenRouter is not
  const groqResponse = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.1-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    },
    {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );

  const groqContent = groqResponse.data?.choices?.[0]?.message?.content ?? "{}";
  return safeParseResult(groqContent);
}

function safeParseResult(raw: string): EmotionAnalysisResult {
  try {
    const cleaned = raw.trim().replace(/^```json/i, "").replace(/```$/i, "");
    const parsed = JSON.parse(cleaned);

    return {
      emotion: String(parsed.emotion ?? "").trim(),
      keywords: Array.isArray(parsed.keywords)
        ? parsed.keywords.map((k: unknown) => String(k))
        : [],
      summary: String(parsed.summary ?? "").trim(),
    };
  } catch (error) {
    console.error("Failed to parse LLM JSON response", error, raw);
    throw new Error("Failed to parse LLM response");
  }
}

