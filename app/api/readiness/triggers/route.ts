export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("readiness_triggers")
    .select("user_id, manual_enabled, inactivity_enabled, inactivity_days, doc_trigger_enabled")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If row doesn't exist yet, return sensible defaults (UI can save to create it)
  return NextResponse.json(
    data ?? {
      user_id: userId,
      manual_enabled: true,
      inactivity_enabled: false,
      inactivity_days: 90,
      doc_trigger_enabled: false,
    }
  );
}

export async function POST(req: Request) {
  const body = await req.json();
  const { userId, manual_enabled, inactivity_enabled, inactivity_days, doc_trigger_enabled } = body;

  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const payload = {
    user_id: userId,
    manual_enabled: !!manual_enabled,
    inactivity_enabled: !!inactivity_enabled,
    inactivity_days: Number(inactivity_days ?? 90),
    doc_trigger_enabled: !!doc_trigger_enabled,
  };

  // Upsert (insert if missing, update if exists)
  const { error } = await supabaseAdmin
    .from("readiness_triggers")
    .upsert(payload, { onConflict: "user_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
