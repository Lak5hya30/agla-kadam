import { NextResponse } from "next/server";
import { getCase } from "@/lib/caseData";
import { submitAppeal } from "@/lib/mockStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/mock/appeals  (MOCK)
 * Body: { caseId, confirmed: true, appealText }
 * Simulates an appeal submission and issues a fake reference number.
 */
export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const caseId = String(body?.caseId ?? "");
  const appealText = String(body?.appealText ?? "");
  const confirmed = body?.confirmed === true;

  if (!getCase(caseId)) {
    return NextResponse.json({ error: "Unknown demo case." }, { status: 404 });
  }
  if (!confirmed) {
    return NextResponse.json(
      { error: "Citizen confirmation is required before submission." },
      { status: 400 }
    );
  }
  if (appealText.trim().length === 0) {
    return NextResponse.json(
      { error: "Appeal text is empty." },
      { status: 400 }
    );
  }

  const record = submitAppeal(caseId, appealText);
  return NextResponse.json(record);
}
