export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Guardian sharing has been retired." },
    { status: 410 }
  );
}
