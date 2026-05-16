export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ALLOWED_FIELDS = new Set([
  "benefits_acknowledged_at",
  "readiness_overview_acknowledged_at",
  "onboarding_dismissed_at",
  "onboarding_completed_at",
]);

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { field?: string } = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { field } = body;
  if (!field || !ALLOWED_FIELDS.has(field)) {
    return NextResponse.json({ error: "Invalid field" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ [field]: new Date().toISOString() })
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
