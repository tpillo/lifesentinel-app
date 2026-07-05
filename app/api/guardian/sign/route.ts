export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "File storage has been retired." },
    { status: 410 }
  );
}
