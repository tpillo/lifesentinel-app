import { createClient } from "@/lib/supabase/server";
import { READINESS_DOCUMENT_DEFAULTS } from "./documentDefaults";

export async function ensureReadinessDocumentsSeeded() {
  console.log("🚨 ENSURE DOCUMENTS SEEDED CALLED");

  // 1) Create server-side Supabase client (with cookies)
  const supabase = await createClient();

  // 2) Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    console.error("❌ AUTH ERROR:", authError);
    throw authError;
  }

  console.log("👤 USER FROM AUTH:", user?.id);

  if (!user) {
    console.warn("⚠️ No authenticated user — skipping seeding");
    return { seeded: false as const, reason: "no-user" as const };
  }

  // 3) Build default rows
  const rows = READINESS_DOCUMENT_DEFAULTS.map((d) => ({
    user_id: user.id,
    category: d.category,
    item_key: d.item_key,
    item_label: d.item_label,
    is_present: false,
  }));

  // 4) UPSERT (requires UNIQUE(user_id, item_key))
  const { error: upsertError } = await supabase
    .from("readiness_documents")
    .upsert(rows, { onConflict: "user_id,item_key" });

  if (upsertError) {
    console.error("❌ UPSERT ERROR:", upsertError);
    throw upsertError;
  }

  console.log("✅ READINESS DOCUMENTS SEEDED (or already existed)");

  return { seeded: true as const, reason: "upsert" as const };
}
