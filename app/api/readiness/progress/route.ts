import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

function pct(done: number, total: number) {
  if (!total) return 0;
  return Math.round((done / total) * 100);
}

export async function GET() {
  const supabase = await createClient();

  // Accept Bearer token OR cookie session
  const authHeader = (await headers()).get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  const {
    data: { user },
    error: userErr,
  } = token
    ? await supabase.auth.getUser(token)
    : await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // ✅ CONFIRMED FROM YOUR SCREENSHOT
  const CHECKLIST_TABLE = "readiness_documents";

  // 1️⃣ Checklist totals
  const { count: checklistTotal, error: ctErr } = await supabase
    .from(CHECKLIST_TABLE)
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (ctErr) {
    return NextResponse.json({ error: ctErr.message }, { status: 500 });
  }

  const { count: checklistDone, error: cdErr } = await supabase
    .from(CHECKLIST_TABLE)
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_present", true);

  if (cdErr) {
    return NextResponse.json({ error: cdErr.message }, { status: 500 });
  }

  // 2️⃣ Document placeholders totals (Step 6.13)
  const { count: docsTotal, error: dtErr } = await supabase
    .from("documents")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (dtErr) {
    return NextResponse.json({ error: dtErr.message }, { status: 500 });
  }

  const { count: docsDone, error: ddErr } = await supabase
    .from("documents")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "complete");

  if (ddErr) {
    return NextResponse.json({ error: ddErr.message }, { status: 500 });
  }

  const checklist = {
    done: checklistDone ?? 0,
    total: checklistTotal ?? 0,
    percent: pct(checklistDone ?? 0, checklistTotal ?? 0),
  };

  const documents = {
    done: docsDone ?? 0,
    total: docsTotal ?? 0,
    percent: pct(docsDone ?? 0, docsTotal ?? 0),
  };

  const overallDone = checklist.done + documents.done;
  const overallTotal = checklist.total + documents.total;

  return NextResponse.json({
    overall: {
      done: overallDone,
      total: overallTotal,
      percent: pct(overallDone, overallTotal),
    },
    buckets: {
      checklist,
      documents,
    },
  });
}
