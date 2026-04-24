export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const BUCKET = "VAULT";

export async function POST(req: Request) {
  const { token, fullPath } = await req.json();

  if (!token || !fullPath) {
    return NextResponse.json(
      { error: "Missing token or fullPath" },
      { status: 400 }
    );
  }

  const { data: link, error: linkErr } = await supabaseAdmin
    .from("guardian_links")
    .select("owner_user_id, expires_at, revoked_at, allowed_categories")
    .eq("token", token)
    .single();

  if (linkErr || !link) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  if (link.revoked_at) {
    return NextResponse.json({ error: "Link revoked" }, { status: 403 });
  }

  if (new Date(link.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "Link expired" }, { status: 403 });
  }

  // Validate path belongs to owner and allowed category
  const parts = fullPath.split("/");
  const ownerId = parts[0];
  const category = parts[1];

  if (ownerId !== link.owner_user_id) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  if (!link.allowed_categories.includes(category)) {
    return NextResponse.json({ error: "Category not allowed" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(fullPath, 60);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ signedUrl: data.signedUrl });
}
