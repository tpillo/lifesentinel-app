import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("readiness_instructions")
    .select(
      "user_id, immediate_72h, short_term_90d, long_term, do_not_do_yet, key_contacts, deploying_checklist"
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(
    data ?? {
      user_id: userId,
      immediate_72h: "",
      short_term_90d: "",
      long_term: "",
      do_not_do_yet: "",
      key_contacts: "",
      deploying_checklist: "",
    }
  );
}

export async function POST(req: Request) {
  const body = await req.json();
  const {
    userId,
    immediate_72h,
    short_term_90d,
    long_term,
    do_not_do_yet,
    key_contacts,
    deploying_checklist,
  } = body;

  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const payload = {
    user_id: userId,
    immediate_72h: immediate_72h ?? "",
    short_term_90d: short_term_90d ?? "",
    long_term: long_term ?? "",
    do_not_do_yet: do_not_do_yet ?? "",
    key_contacts: key_contacts ?? "",
    deploying_checklist: deploying_checklist ?? "",
  };

  const { error } = await supabaseAdmin
    .from("readiness_instructions")
    .upsert(payload, { onConflict: "user_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
