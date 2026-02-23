import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function Page() {
  const supabase = await createClient()

  const { data: auth, error: authErr } = await supabase.auth.getUser()
  if (authErr || !auth?.user) {
    redirect("/login")
  }

  const userId = auth.user.id

  const { data, error } = await supabase
    .from("readiness_documents")
    .select("is_present")
    .eq("user_id", userId)

  if (error) {
    return (
      <div style={{ padding: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Readiness Overview</h1>
        <p style={{ marginTop: 12 }}>Failed to load readiness score.</p>
        <pre style={{ whiteSpace: "pre-wrap", opacity: 0.8 }}>{error.message}</pre>
      </div>
    )
  }

  const total = (data ?? []).length
  const present = (data ?? []).filter(r => r.is_present).length
  const scorePct = total === 0 ? 0 : Math.round((present / total) * 100)

  return (
    <div style={{ padding: 16, display: "grid", gap: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Readiness Overview</h1>

      <div style={{ border: "1px solid #ddd", borderRadius: 16, padding: 16 }}>
        <div style={{ fontSize: 44, fontWeight: 900, lineHeight: 1 }}>{scorePct}%</div>
        <div style={{ opacity: 0.85, marginTop: 8 }}>
          {present} of {total} present
        </div>
        <div style={{ opacity: 0.65, marginTop: 6, fontSize: 13 }}>
          Source of truth: readiness_documents
        </div>
      </div>

      <div style={{ opacity: 0.85 }}>
        Tip: Go to <b>/dashboard/readiness/documents</b> to mark items present and watch this score update.
      </div>
    </div>
  )
}