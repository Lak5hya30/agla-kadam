import { NextResponse } from "next/server";
import { getCase } from "@/lib/caseData";
import { analyzeResolution, analyzeAdHoc } from "@/lib/analyze";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_LEN = 4000;

/**
 * POST /api/analyze-resolution
 * Body: { caseId } for a known demo case,
 *   OR  { grievance, response } for a user-filed (ad-hoc) grievance.
 *
 * Demo cases use OpenAI (or the cached fixture fallback). Ad-hoc filings
 * use OpenAI when a key is configured, otherwise a deterministic offline
 * comparison — clearly labelled, never presented as AI.
 */
export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Path 1 — known synthetic demo case.
  const caseId = body?.caseId ? String(body.caseId) : "";
  if (caseId) {
    const demoCase = getCase(caseId);
    if (!demoCase) {
      return NextResponse.json({ error: "Unknown demo case." }, { status: 404 });
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
    } catch {
      return NextResponse.json(
        { error: "We could not analyse this demo case right now. Please try another case." },
        { status: 500 }
      );
    }
  }

  // Path 2 — ad-hoc user-filed grievance.
  const grievance = String(body?.grievance ?? "").slice(0, MAX_LEN).trim();
  const response = String(body?.response ?? "").slice(0, MAX_LEN).trim();
  if (grievance.length < 10) {
    return NextResponse.json(
      { error: "Please enter your grievance (at least a sentence)." },
      { status: 400 }
    );
  }

  try {
    const result = await analyzeAdHoc(grievance, response);
    return NextResponse.json({
      caseId: null,
      source: result.source,
      fallbackReason: result.fallbackReason ?? null,
      analysis: result.analysis,
    });
  } catch {
    return NextResponse.json(
      { error: "We could not analyse this text right now. Please try again." },
      { status: 500 }
    );
  }
}
