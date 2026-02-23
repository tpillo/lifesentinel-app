// app/api/readiness/documents/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

type PatchBody = {
  id: string
  is_present?: boolean
  notes?: string | null
}

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
      "id,user_id,category,item_key,item_label,is_present,notes,created_at,updated_at,last_reviewed_at"
    )
    .eq("user_id", user.id)
    .order("category", { ascending: true })
    .order("item_label", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ documents: data ?? [] })
}

export async function PATCH(req: Request) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()

  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: PatchBody
  try {
    body = (await req.json()) as PatchBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!body?.id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  const update: Record<string, any> = {
    updated_at: new Date().toISOString(),
    last_reviewed_at: new Date().toISOString(),
  }

  if (typeof body.is_present === "boolean") update.is_present = body.is_present
  if (body.notes !== undefined) update.notes = body.notes

  const { data, error } = await supabase
    .from("readiness_documents")
    .update(update)
    .eq("id", body.id)
    .eq("user_id", user.id)
    .select(
      "id,user_id,category,item_key,item_label,is_present,notes,created_at,updated_at,last_reviewed_at"
    )
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json({ document: data })
}