import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const DEFAULT_DOCS = [
  { category: "Legal", item_key: "will_estate_plan", item_label: "Will / Estate Plan" },
  { category: "Insurance", item_key: "life_insurance", item_label: "Life Insurance Policy" },
  { category: "Military", item_key: "dd214", item_label: "DD-214" },
  { category: "VA", item_key: "va_rating_letter", item_label: "VA Rating Decision Letter" },
  { category: "Identity", item_key: "marriage_certificate", item_label: "Marriage Certificate" },
  { category: "Identity", item_key: "birth_certificates", item_label: "Birth Certificates" },
  { category: "Finance", item_key: "banking_summary", item_label: "Banking / Accounts Summary" },
  { category: "Contacts", item_key: "emergency_contacts", item_label: "Emergency Contacts" }
];

// GET = dry run (no insert). Requires ?userId=...
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId (add ?userId=...)" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("readiness_documents")
    .select("id,item_key,item_label,category")
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: "Failed to read readiness_documents", detail: error.message }, { status: 500 });
  }

  const existingKeys = new Set((data ?? []).map(r => (r.item_key ?? "").toLowerCase()));
  const missing = DEFAULT_DOCS.filter(d => !existingKeys.has(d.item_key.toLowerCase()));

  return NextResponse.json({
    ok: true,
    existing_count: (data ?? []).length,
    would_insert_count: missing.length,
    would_insert: missing
  });
}

// POST = insert missing defaults. Requires JSON body: { "userId": "..." }
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const userId = body?.userId;

  if (!userId) {
    return NextResponse.json({ error: "Missing userId in body (send { userId })" }, { status: 400 });
  }

  const { data: existing, error: readErr } = await supabaseAdmin
    .from("readiness_documents")
    .select("id,item_key")
    .eq("user_id", userId);

  if (readErr) {
    return NextResponse.json({ error: "Failed to read readiness_documents", detail: readErr.message }, { status: 500 });
  }

  const existingKeys = new Set((existing ?? []).map(r => (r.item_key ?? "").toLowerCase()));
  const toAdd = DEFAULT_DOCS.filter(d => !existingKeys.has(d.item_key.toLowerCase()));

  if (toAdd.length === 0) {
    return NextResponse.json({ ok: true, inserted: 0, message: "Nothing to seed (already present)." });
  }

  const rows = toAdd.map(d => ({
    user_id: userId,
    category: d.category,
    item_key: d.item_key,
    item_label: d.item_label,
    is_present: false
  }));

  const { error: insertErr } = await supabaseAdmin
    .from("readiness_documents")
    .insert(rows);

  if (insertErr) {
    return NextResponse.json({ error: "Seed insert failed", detail: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, inserted: rows.length, inserted_keys: toAdd.map(d => d.item_key) });
}
