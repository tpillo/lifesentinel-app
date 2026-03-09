import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

type Body = {
  file_id: string
  expires_in?: number // seconds
}

export async function POST(req: Request) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()

  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!body?.file_id) {
    return NextResponse.json({ error: "Missing file_id" }, { status: 400 })
  }

  const expiresIn = Math.max(60, Math.min(body.expires_in ?? 600, 3600)) // 1–60 min (default 10)

  // Ensure the file belongs to the current user
  const { data: file, error: fileErr } = await supabase
    .from("readiness_document_files")
    .select("id,storage_bucket,storage_path,file_name")
    .eq("id", body.file_id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (fileErr) return NextResponse.json({ error: fileErr.message }, { status: 500 })
  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { data, error } = await supabase.storage
    .from(file.storage_bucket)
    .createSignedUrl(file.storage_path, expiresIn)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    ok: true,
    url: data?.signedUrl,
    file_name: file.file_name,
    expires_in: expiresIn,
  })
}