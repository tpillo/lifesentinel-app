import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("readiness_roles")
    .select("id, role_type, full_name, email, phone, notes")
    .eq("user_id", userId)
    .order("role_type");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { userId, role_type, full_name, email, phone, notes } = body;

  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  if (!role_type) return NextResponse.json({ error: "Missing role_type" }, { status: 400 });
  if (!full_name) return NextResponse.json({ error: "Missing full_name" }, { status: 400 });

  const { error } = await supabaseAdmin.from("readiness_roles").insert({
    user_id: userId,
    role_type,
    full_name,
    email: email || null,
    phone: phone || null,
    notes: notes || null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
