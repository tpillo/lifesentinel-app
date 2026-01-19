import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function randomToken() {
  return crypto.randomBytes(24).toString("hex");
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const owner_user_id = body.owner_user_id as string | undefined;
  if (!owner_user_id) {
    return NextResponse.json({ error: "Missing owner_user_id" }, { status: 400 });
  }

  const expiresInHours = Number(body.expiresInHours ?? 72);
  const allowed_categories =
    Array.isArray(body.allowed_categories) && body.allowed_categories.length > 0
      ? body.allowed_categories
      : ["policies", "legal", "medical", "banking", "dmv", "emergency", "survivor"];

  const token = randomToken();
  const expires_at = new Date(
    Date.now() + expiresInHours * 60 * 60 * 1000
  ).toISOString();

  const { error } = await supabaseAdmin.from("guardian_links").insert({
    owner_user_id,
    token,
    expires_at,
    allowed_categories,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ token, expires_at, allowed_categories });
}
