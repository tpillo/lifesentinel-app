// app/api/guardian/readiness/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

type ReadinessDoc = {
  id: string
  user_id: string
  category: string
  item_key: string
  item_label: string
  is_present: boolean
  notes: string | null
  updated_at: string
  last_reviewed_at: string | null
}

export async function GET() {
  const supabase = await createClient()

  // 1) Guardian must be logged in
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()

  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // 2) Find active guardian link
  const { data: link, error: linkErr } = await supabase
    .from("guardian_links")
    .select("owner_user_id, revoked_at, expires_at")
    .eq("guardian_user_id", user.id)
    .is("revoked_at", null)
    .maybeSingle()

  if (linkErr) {
    return NextResponse.json({ error: linkErr.message }, { status: 500 })
  }

  if (!link?.owner_user_id) {
    return NextResponse.json(
      { error: "No active guardian access found." },
      { status: 403 }
    )
  }

  // If expires_at exists and is expired → block
  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return NextResponse.json(
      { error: "Guardian access has expired." },
      { status: 403 }
    )
  }

  const ownerUserId = link.owner_user_id as string

  // 3) Fetch readiness documents for owner
  const { data: docs, error: docsErr } = await supabase
    .from("readiness_documents")
    .select(
      "id,user_id,category,item_key,item_label,is_present,notes,updated_at,last_reviewed_at"
    )
    .eq("user_id", ownerUserId)
    .order("category", { ascending: true })
    .order("item_label", { ascending: true })

  if (docsErr) {
    return NextResponse.json({ error: docsErr.message }, { status: 500 })
  }

  const typedDocs = (docs ?? []) as ReadinessDoc[]

  const total = typedDocs.length
  const present = typedDocs.filter((d) => d.is_present).length
  const percent = total === 0 ? 0 : Math.round((present / total) * 100)

  return NextResponse.json({
    owner_user_id: ownerUserId,
    stats: { present, total, percent },
    documents: typedDocs,
  })
}