import { NextResponse } from "next/server";
import { getCase } from "@/lib/caseData";
import { analyzeResolution } from "@/lib/analyze";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/analyze-resolution
 * Body: { caseId: string }
 *
 * Runs the OpenAI resolution analysis (or the cached fixture fallback).
 * Only accepts known synthetic case ids — the demo never analyses
 * arbitrary user-supplied text in the MVP (§31).
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const caseId =
    typeof body === "object" && body !== null && "caseId" in body
      ? String((body as { caseId: unknown }).caseId)
      : "";

  const demoCase = getCase(caseId);
  if (!demoCase) {
    return NextResponse.json(
      { error: "Unknown demo case." },
      { status: 404 }
    );
  }

  try {
    const result = await analyzeResolution(
      caseId,
      demoCase.grievance.text,
      demoCase.response.text
    );
    return NextResponse.json({
      caseId,
      source: result.source,
      fallbackReason: result.fallbackReason ?? null,
      analysis: result.analysis,
    });
  } catch (err) {
    // getCachedAnalysis threw (corrupted/missing fixture) — polished error.
    return NextResponse.json(
      {
        error:
          "We could not analyse this demo case right now. Please try another case.",
      },
      { status: 500 }
    );
  }
}
