import { NextResponse } from "next/server";
import { listCases } from "@/lib/caseData";

export const runtime = "nodejs";

/** GET /api/demo/cases — list synthetic demo cases (metadata only). */
export async function GET() {
  const cases = listCases().map((c) => ({
    id: c.id,
    label: c.label,
    tagline: c.tagline,
    citizen: c.citizen,
    status: c.caseContext.status,
    jurisdiction: c.caseContext.jurisdiction,
  }));
  return NextResponse.json({ cases });
}
