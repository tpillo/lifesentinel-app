import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const DEFAULT_ITEMS: Array<{ category: string; item_key: string; item_label: string }> = [
  { category: "Estate", item_key: "estate_will", item_label: "Will / Estate Plan" },
  { category: "Estate", item_key: "estate_poa", item_label: "Power of Attorney" },
  { category: "Estate", item_key: "estate_advance_directive", item_label: "Advance Directive / Medical POA" },

  { category: "Insurance", item_key: "ins_sgli_vgli", item_label: "SGLI / VGLI (or equivalent)" },
  { category: "Insurance", item_key: "ins_life_private", item_label: "Private Life Insurance" },
  { category: "Insurance", item_key: "ins_home_auto", item_label: "Home / Auto Policies" },

  { category: "Service", item_key: "svc_dd214", item_label: "DD-214 / Service Separation Docs" },
  { category: "Service", item_key: "svc_orders", item_label: "Deployment/Assignment Orders (if applicable)" },
  { category: "Service", item_key: "svc_va_rating", item_label: "VA Rating / Benefit Letters" },

  { category: "Financial", item_key: "fin_bank_overview", item_label: "Banking Overview (accounts list)" },
  { category: "Financial", item_key: "fin_bills_subscriptions", item_label: "Bills & Subscriptions List" },
  { category: "Financial", item_key: "fin_debts_loans", item_label: "Debts / Loans List" },

  { category: "Identity", item_key: "id_passports_ids", item_label: "IDs / Passports" },
  { category: "Identity", item_key: "id_birth_marriage", item_label: "Birth / Marriage Certificates" },
  { category: "Identity", item_key: "id_social_security_cards", item_label: "Social Security Cards" },
];

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return NextResponse.json({ error: "Missing Authorization Bearer token" }, { status: 401 });
  }

  const { data: userRes, error: userErr } = await supabaseAdmin.auth.getUser(token);
  if (userErr || !userRes?.user) {
    return NextResponse.json({ error: userErr?.message ?? "Invalid token" }, { status: 401 });
  }

  const userId = userRes.user.id;

  const { data: existing, error: existErr } = await supabaseAdmin
    .from("readiness_documents")
    .select("item_key")
    .eq("user_id", userId);

  if (existErr) return NextResponse.json({ error: existErr.message }, { status: 500 });

  const existingKeys = new Set((existing ?? []).map((x: any) => x.item_key));

  const toInsert = DEFAULT_ITEMS
    .filter((x) => !existingKeys.has(x.item_key))
    .map((x) => ({
      user_id: userId,
      category: x.category,
      item_key: x.item_key,
      item_label: x.item_label,
      is_present: false,
    }));

  if (toInsert.length === 0) {
    return NextResponse.json({ ok: true, inserted: 0 });
  }

  const { error: insErr } = await supabaseAdmin.from("readiness_documents").insert(toInsert);
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, inserted: toInsert.length });
}
