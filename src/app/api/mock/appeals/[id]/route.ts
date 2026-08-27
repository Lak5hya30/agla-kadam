import { NextResponse } from "next/server";
import { getAppeal } from "@/lib/mockStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/mock/appeals/:id  (MOCK) — fetch a synthetic appeal record. */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const record = getAppeal(params.id);
  if (!record) {
    return NextResponse.json(
      { error: "Appeal not found in this prototype session." },
      { status: 404 }
    );
  }
  return NextResponse.json(record);
}
