import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const { data: link, error: linkErr } = await supabaseAdmin
    .from("guardian_links")
    .select("owner_user_id, expires_at, revoked_at")
    .eq("token", token)
    .single();

  if (linkErr || !link) {
    return NextResponse.json({ error: "Invalid link" }, { status: 401 });
  }

  if (link.revoked_at) {
    return NextResponse.json({ error: "This link has been revoked." }, { status: 403 });
  }

  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return NextResponse.json({ error: "This link has expired." }, { status: 403 });
  }

  const { data: docs, error: docsErr } = await supabaseAdmin
    .from("readiness_documents")
    .select("id, item_label, is_present")
    .eq("user_id", link.owner_user_id)
    .order("item_label", { ascending: true });

  if (docsErr) {
    return NextResponse.json({ error: docsErr.message }, { status: 500 });
  }

  const items = (docs ?? []).map((d) => ({
    id: d.id,
    title: d.item_label,
    completed: d.is_present,
  }));

  const total = items.length;
  const completed = items.filter((i) => i.completed).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return NextResponse.json({ total, completed, percent, items });
}
