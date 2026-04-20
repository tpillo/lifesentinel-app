import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const now = new Date().toISOString();

  const row = {
    user_id: user.id,
    full_name: body.full_name ?? null,
    date_of_birth: body.date_of_birth ?? null,
    marital_status: body.marital_status ?? null,
    num_dependents: body.num_dependents != null ? Number(body.num_dependents) : null,
    occupation_type: body.occupation_type ?? null,
    state: body.state ?? null,
    years_of_service: body.years_of_service != null ? Number(body.years_of_service) : null,
    status: body.status ?? null,
    department_type: body.department_type ?? null,
    branch: body.branch ?? null,
    career_volunteer: body.career_volunteer ?? null,
    occupation: body.occupation ?? null,
    updated_at: now,
  };

  const { error } = await supabase
    .from("profiles")
    .upsert({ ...row, created_at: now }, { onConflict: "user_id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}
