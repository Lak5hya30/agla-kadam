import { NextResponse } from "next/server";
import { getCase } from "@/lib/caseData";
import { recordFeedback } from "@/lib/mockStore";
import type { FeedbackStatus } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID: FeedbackStatus[] = ["satisfied", "partly", "poor", "none"];

/**
 * POST /api/mock/feedback  (MOCK)
 * Body: { caseId, rating, unresolvedPoints? }
 * Records synthetic feedback. Nothing reaches a real government system.
 */
export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const caseId = String(body?.caseId ?? "");
  const rating = body?.rating as FeedbackStatus;
  const unresolvedPoints: string[] = Array.isArray(body?.unresolvedPoints)
    ? body.unresolvedPoints.map((s: unknown) => String(s))
    : [];

  if (!getCase(caseId)) {
    return NextResponse.json({ error: "Unknown demo case." }, { status: 404 });
  }
  if (!VALID.includes(rating)) {
    return NextResponse.json({ error: "Invalid rating." }, { status: 400 });
  }

  const record = recordFeedback(caseId, rating, unresolvedPoints);
  return NextResponse.json(record);
}
