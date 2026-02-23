 // app/api/readiness/documents/seed/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

type SeedItem = {
  category: string
  item_key: string
  item_label: string
}

const DEFAULT_SEED: SeedItem[] = [
  { category: "Identity", item_key: "birth_certificates", item_label: "Birth Certificates" },
  { category: "Identity", item_key: "marriage_certificate", item_label: "Marriage Certificate" },

  { category: "Legal", item_key: "will_estate_plan", item_label: "Will / Estate Plan" },

  { category: "Insurance", item_key: "life_insurance", item_label: "Life Insurance Policy" },

  { category: "Finance", item_key: "banking_summary", item_label: "Banking / Accounts Summary" },

  { category: "Contacts", item_key: "emergency_contacts", item_label: "Emergency Contacts" },

  { category: "Military", item_key: "dd214", item_label: "DD-214" },

  { category: "VA", item_key: "va_rating_letter", item_label: "VA Rating Decision Letter" },
]

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Use POST to seed readiness_documents for the current user.",
    count: DEFAULT_SEED.length,
  })
}

export async function POST() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()

  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get existing item_keys for this user
  const { data: existing, error: existingErr } = await supabase
    .from("readiness_documents")
    .select("item_key")
    .eq("user_id", user.id)

  if (existingErr) {
    return NextResponse.json({ error: existingErr.message }, { status: 500 })
  }

  const existingKeys = new Set((existing ?? []).map((r: any) => r.item_key))
  const missing = DEFAULT_SEED.filter((i) => !existingKeys.has(i.item_key))

  if (missing.length === 0) {
    return NextResponse.json({ ok: true, inserted: 0, message: "Already seeded." })
  }

  const now = new Date().toISOString()

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
  }))

  const { error: insErr } = await supabase.from("readiness_documents").insert(rows)

  if (insErr) {
    return NextResponse.json({ error: insErr.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, inserted: rows.length })
}