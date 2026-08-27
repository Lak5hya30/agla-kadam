import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/status — reports whether live OpenAI analysis is configured on
 * THIS deployment. Returns only a boolean; the key itself is never exposed.
 * Lets the "What's real" page tell the runtime truth instead of a static claim.
 */
export async function GET() {
  const liveAiConfigured =
    typeof process.env.OPENAI_API_KEY === "string" &&
    process.env.OPENAI_API_KEY.length > 0;
  return NextResponse.json({
    liveAiConfigured,
    model: liveAiConfigured ? process.env.OPENAI_MODEL || "gpt-4o-mini" : null,
  });
}
