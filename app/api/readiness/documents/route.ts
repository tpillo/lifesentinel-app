// app/api/readiness/documents/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()

  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("readiness_documents")
    .select(
      "id,user_id,category,item_key,item_label,notes,created_at,updated_at,last_reviewed_at"
    )
    .eq("user_id", user.id)
    .order("category", { ascending: true })
    .order("item_label", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ documents: data ?? [] })
}