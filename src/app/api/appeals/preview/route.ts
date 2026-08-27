import { NextResponse } from "next/server";
import { parseAnalysis } from "@/lib/schema";
import { composeAppeal } from "@/lib/appeal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/appeals/preview
 * Body: { analysis, selectedRequestIds }
 *
 * Deterministically composes a source-mapped appeal draft. The analysis
 * is re-validated so the draft is only ever built from well-formed,
 * grounded structured data (§20, §43).
 */
export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parseAnalysis(body?.analysis);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: `Invalid analysis: ${parsed.error}` },
      { status: 400 }
    );
  }
  const selected: string[] = Array.isArray(body?.selectedRequestIds)
    ? body.selectedRequestIds.map((s: unknown) => String(s))
    : [];

  const appeal = composeAppeal(parsed.analysis, selected);
  return NextResponse.json({ appeal });
}
