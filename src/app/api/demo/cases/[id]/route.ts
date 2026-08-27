import { NextResponse } from "next/server";
import { getCase } from "@/lib/caseData";

export const runtime = "nodejs";

/** GET /api/demo/cases/:id — full synthetic case detail. */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const c = getCase(params.id);
  if (!c) {
    return NextResponse.json({ error: "Unknown demo case." }, { status: 404 });
  }
  return NextResponse.json({ case: c });
}
