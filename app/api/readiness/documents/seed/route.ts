 import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type SeedItem = {
  category: string;
  item_key: string;
  item_label: string;
};

const DEFAULT_SEED: SeedItem[] = [
  {
    category: "Identity",
    item_key: "identity",
    item_label: "Identity",
  },
  {
    category: "Legal",
    item_key: "legal",
    item_label: "Legal",
  },
  {
    category: "Insurance",
    item_key: "insurance",
    item_label: "Insurance",
  },
  {
    category: "Finance",
    item_key: "finance",
    item_label: "Finance",
  },
  {
    category: "Family",
    item_key: "family",
    item_label: "Family",
  },
  {
    category: "Military",
    item_key: "military",
    item_label: "Military",
  },
  {
    category: "VA",
    item_key: "va",
    item_label: "VA",
  },
  {
    category: "Other",
    item_key: "other",
    item_label: "Other",
  },
  {
    category: "Deployment",
    item_key: "deployment",
    item_label: "Deployment",
  },
];

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Use POST to seed readiness_documents for the current user.",
    count: DEFAULT_SEED.length,
    items: DEFAULT_SEED,
  });
}

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: existing, error: existingErr } = await supabase
    .from("readiness_documents")
    .select("item_key")
    .eq("user_id", user.id);

  if (existingErr) {
    return NextResponse.json({ error: existingErr.message }, { status: 500 });
  }

  const existingKeys = new Set((existing ?? []).map((r: any) => r.item_key));
  const missing = DEFAULT_SEED.filter((i) => !existingKeys.has(i.item_key));

  if (missing.length === 0) {
    return NextResponse.json({
      ok: true,
      inserted: 0,
      message: "Already seeded.",
    });
  }

  const now = new Date().toISOString();

  const rows = missing.map((i) => ({
    user_id: user.id,
    category: i.category,
    item_key: i.item_key,
    item_label: i.item_label,
    is_present: false,
    notes: null,
    created_at: now,
    updated_at: now,
    last_reviewed_at: null,
  }));

  const { error: insErr } = await supabase.from("readiness_documents").insert(rows);

  if (insErr) {
    return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    inserted: rows.length,
  });
}