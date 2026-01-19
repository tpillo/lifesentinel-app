import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  // Documents completion
  const { data: docs, error: docsErr } = await supabaseAdmin
    .from("readiness_documents")
    .select("is_present")
    .eq("user_id", userId);

  if (docsErr) return NextResponse.json({ error: docsErr.message }, { status: 500 });

  const docsTotal = docs?.length ?? 0;
  const docsDone = (docs ?? []).filter((d: any) => d.is_present).length;

  // Roles completion (at least 1 role)
  const { data: roles, error: rolesErr } = await supabaseAdmin
    .from("readiness_roles")
    .select("id")
    .eq("user_id", userId);

  if (rolesErr) return NextResponse.json({ error: rolesErr.message }, { status: 500 });

  const rolesDone = (roles?.length ?? 0) > 0;

  // Triggers completion (row exists)
  const { data: triggers, error: trigErr } = await supabaseAdmin
    .from("readiness_triggers")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (trigErr) return NextResponse.json({ error: trigErr.message }, { status: 500 });

  const triggersDone = !!triggers;

  // Instructions completion (any non-empty instruction field)
  const { data: instr, error: instrErr } = await supabaseAdmin
    .from("readiness_instructions")
    .select("immediate_72h, short_term_90d, long_term, do_not_do_yet, key_contacts, deploying_checklist")
    .eq("user_id", userId)
    .maybeSingle();

  if (instrErr) return NextResponse.json({ error: instrErr.message }, { status: 500 });

  const instrDone =
    !!instr &&
    Object.values(instr).some((v) => typeof v === "string" && v.trim().length > 0);

  // Score: 4 modules
  const moduleDoneCount =
    (docsTotal > 0 && docsDone > 0 ? 1 : 0) +
    (rolesDone ? 1 : 0) +
    (triggersDone ? 1 : 0) +
    (instrDone ? 1 : 0);

  const percent = Math.round((moduleDoneCount / 4) * 100);

  return NextResponse.json({
    percent,
    documents: { total: docsTotal, done: docsDone },
    roles: { done: rolesDone },
    triggers: { done: triggersDone },
    instructions: { done: instrDone },
  });
}
