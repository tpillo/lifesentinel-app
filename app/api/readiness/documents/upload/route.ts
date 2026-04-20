 import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const readiness_document_id = form.get("readiness_document_id") as string | null;
  const file = form.get("file") as File | null;

  if (!readiness_document_id) {
    return NextResponse.json({ error: "Missing readiness_document_id" }, { status: 400 });
  }

  if (!file) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const { data: rd, error: rdErr } = await supabase
    .from("readiness_documents")
    .select("id,user_id,category,item_key,item_label,is_present,notes,created_at,updated_at,last_reviewed_at")
    .eq("id", readiness_document_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (rdErr) {
    return NextResponse.json({ error: rdErr.message }, { status: 500 });
  }

  if (!rd) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const safeName = file.name.replace(/[^\w.\-() ]+/g, "_");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const path = `${user.id}/readiness/${rd.category}/${rd.item_key}/${stamp}-${safeName}`;

  const buf = Buffer.from(await file.arrayBuffer());

  const { error: upErr } = await supabase.storage
    .from("vault")
    .upload(path, buf, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

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
    .single();

  if (insErr) {
    return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  // Important:
  // Uploading a file should NOT automatically mark the readiness item complete.
  // We return the existing document row unchanged so the UI can refresh files
  // while leaving completion under user control.
  return NextResponse.json({
    ok: true,
    file: link,
    document: rd,
  });
}