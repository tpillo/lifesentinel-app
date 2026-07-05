import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    { error: "File storage has been retired." },
    { status: 410 }
  );
}
