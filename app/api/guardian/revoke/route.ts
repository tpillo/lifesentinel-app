import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user }, error: userErr } = await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token } = await req.json().catch(() => ({}));
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  // Verify the link belongs to this user before revoking
  const { data: link, error: findErr } = await supabaseAdmin
    .from("guardian_links")
    .select("id, owner_user_id")
    .eq("token", token)
    .single();

  if (findErr || !link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  if (link.owner_user_id !== user.id) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const { error: revokeErr } = await supabaseAdmin
    .from("guardian_links")
    .update({ revoked_at: new Date().toISOString() })
    .eq("token", token);

  if (revokeErr) {
    return NextResponse.json({ error: revokeErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
