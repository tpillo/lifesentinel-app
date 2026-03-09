import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()

  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const form = await req.formData()
  const readiness_document_id = form.get("readiness_document_id") as string | null
  const file = form.get("file") as File | null

  if (!readiness_document_id) {
    return NextResponse.json({ error: "Missing readiness_document_id" }, { status: 400 })
  }
  if (!file) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 })
  }

  // Confirm the readiness doc belongs to this user
  const { data: rd, error: rdErr } = await supabase
    .from("readiness_documents")
    .select("id,item_key,category")
    .eq("id", readiness_document_id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (rdErr) return NextResponse.json({ error: rdErr.message }, { status: 500 })
  if (!rd) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const safeName = file.name.replace(/[^\w.\-() ]+/g, "_")
  const stamp = new Date().toISOString().replace(/[:.]/g, "-")
  const path = `${user.id}/readiness/${rd.category}/${rd.item_key}/${stamp}-${safeName}`

  const buf = Buffer.from(await file.arrayBuffer())

  const { error: upErr } = await supabase.storage
    .from("vault")
    .upload(path, buf, { contentType: file.type || "application/octet-stream", upsert: false })

  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 })
  }

  // Insert link row
  const { data: link, error: insErr } = await supabase
    .from("readiness_document_files")
    .insert({
      user_id: user.id,
      readiness_document_id,
      storage_bucket: "vault",
      storage_path: path,
      file_name: file.name,
      mime_type: file.type || null,
      file_size: file.size,
    })
    .select("*")
    .single()

  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 })

  // Auto-mark readiness item present
  const { data: updated, error: upDocErr } = await supabase
    .from("readiness_documents")
    .update({
      is_present: true,
      updated_at: new Date().toISOString(),
      last_reviewed_at: new Date().toISOString(),
    })
    .eq("id", readiness_document_id)
    .eq("user_id", user.id)
    .select("id,user_id,category,item_key,item_label,is_present,notes,created_at,updated_at,last_reviewed_at")
    .single()

  if (upDocErr) return NextResponse.json({ error: upDocErr.message }, { status: 500 })

  return NextResponse.json({ ok: true, file: link, document: updated })
}