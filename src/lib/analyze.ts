/**
 * Server-side resolution analysis (§3, §13, §29).
 *
 * Calls OpenAI with strict structured output when a key is configured,
 * validates the result against the Zod schema, and falls back to the
 * cached synthetic-demo fixture on ANY failure (no key, timeout, invalid
 * output). The caller is always told which source was used, so the UI
 * never pretends a cached fixture is live AI.
 *
 * This module is SERVER-ONLY. The OpenAI key is never sent to the browser.
 */
import "server-only";
import { z } from "zod";
import {
  ResolutionAnalysisSchema,
  parseAnalysis,
  type ResolutionAnalysis,
} from "./schema";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompt";
import { getCachedAnalysis } from "./cases";
import { heuristicAnalyze } from "./heuristicAnalyze";

export type AnalysisSource = "live" | "cached" | "offline";

export interface AnalyzeResult {
  source: AnalysisSource;
  analysis: ResolutionAnalysis;
  /** Present when we fell back: a short, non-technical reason for the UI. */
  fallbackReason?: string;
}

const REQUEST_TIMEOUT_MS = 20_000;

function hasKey(): boolean {
  return typeof process.env.OPENAI_API_KEY === "string" && process.env.OPENAI_API_KEY.length > 0;
}

/**
 * Analyse a grievance/response pair for a known demo case.
 *
 * @param caseId  used only to load the cached fallback fixture.
 */
export async function analyzeResolution(
  caseId: string,
  grievance: string,
  response: string
): Promise<AnalyzeResult> {
  // Fixture-first safety net — always available for a valid case id.
  const cachedFallback = () => getCachedAnalysis(caseId);

  if (!hasKey()) {
    return {
      source: "cached",
      analysis: cachedFallback(),
      fallbackReason:
        "Live analysis is not configured for this environment. Showing the previously generated analysis for this synthetic demo case.",
    };
  }

  try {
    const analysis = await callOpenAI(grievance, response);
    return { source: "live", analysis };
  } catch (err) {
    // Never leak stack traces; degrade gracefully to the cached fixture.
    return {
      source: "cached",
      analysis: cachedFallback(),
      fallbackReason:
        "Live analysis is temporarily unavailable. Showing the previously generated analysis for this synthetic demo case.",
    };
  }
}

/**
 * Analyse an AD-HOC (user-filed) grievance/response pair with no cached
 * fixture. Uses OpenAI when a key is configured; otherwise falls back to
 * the deterministic offline analyzer, clearly labelled as such.
 */
export async function analyzeAdHoc(
  grievance: string,
  response: string
): Promise<AnalyzeResult> {
  if (hasKey()) {
    try {
      const analysis = await callOpenAI(grievance, response);
      return { source: "live", analysis };
    } catch {
      return {
        source: "offline",
        analysis: heuristicAnalyze(grievance, response),
        fallbackReason:
          "Live AI analysis was unavailable, so this uses a basic offline comparison. Add an OpenAI key for full AI analysis.",
      };
    }
  }
  return {
    source: "offline",
    analysis: heuristicAnalyze(grievance, response),
    fallbackReason:
      "No OpenAI key is configured, so this uses a basic offline keyword comparison. It is not AI analysis. Add an OpenAI key for full AI analysis.",
  };
}

async function callOpenAI(
  grievance: string,
  response: string
): Promise<ResolutionAnalysis> {
  // Lazy import keeps the SDK out of the bundle when unused.
  const OpenAI = (await import("openai")).default;
  const { zodResponseFormat } = await import("openai/helpers/zod");

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: REQUEST_TIMEOUT_MS,
    maxRetries: 1,
  });

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const completion = await client.beta.chat.completions.parse({
    model,
    temperature: 0.1,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(grievance, response) },
    ],
    response_format: zodResponseFormat(
      // openai's helper wants a plain object schema; our extra cross-ref
      // checks run afterwards via parseAnalysis.
      ResolutionAnalysisSchema as unknown as z.ZodType,
      "resolution_analysis"
    ),
  });

  const parsedMessage = completion.choices[0]?.message;
  if (parsedMessage?.refusal) {
    throw new Error(`Model refused: ${parsedMessage.refusal}`);
  }

  const data = parsedMessage?.parsed;
  // Re-validate with our own parser to enforce cross-reference invariants
  // that the JSON-schema layer cannot express.
  const validated = parseAnalysis(data);
  if (!validated.ok) {
    throw new Error(`Invalid model output: ${validated.error}`);
  }
  // Verify every cited quote exists verbatim in the source; degrade
  // unsupported findings to "unclear" (structured output guarantees shape,
  // not truth).
  const { groundAnalysis } = await import("./grounding");
  return groundAnalysis(validated.analysis, grievance, response).analysis;
}
