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

  // Return all readiness file links for the current user
  const { data, error } = await supabase
    .from("readiness_document_files")
    .select("id,readiness_document_id,storage_bucket,storage_path,file_name,mime_type,file_size,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ files: data ?? [] })
}