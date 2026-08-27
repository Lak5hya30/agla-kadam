import { NextResponse } from "next/server";
import { advanceAppeal } from "@/lib/mockStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/mock/appeals/:id/advance  (MOCK)
 * Advances the mock appeal to the next tracking stage. Judges-only control.
 */
export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const record = advanceAppeal(params.id);
  if (!record) {
    return NextResponse.json(
      { error: "Appeal not found in this prototype session." },
      { status: 404 }
    );
  }
  return NextResponse.json(record);
}
