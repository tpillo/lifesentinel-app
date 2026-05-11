import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type DocumentLocation = {
  id: string;
  user_id: string;
  readiness_document_id: string | null;
  document_type: string;
  location_description: string;
  access_instructions: string | null;
  contact_person: string | null;
  created_at: string;
  updated_at: string;
};

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("document_locations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ locations: data ?? [] });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    readiness_document_id?: string | null;
    document_type: string;
    location_description: string;
    access_instructions?: string;
    contact_person?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body?.document_type?.trim() || !body?.location_description?.trim()) {
    return NextResponse.json(
      { error: "document_type and location_description are required" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("document_locations")
    .insert({
      user_id: user.id,
      readiness_document_id: body.readiness_document_id ?? null,
      document_type: body.document_type.trim(),
      location_description: body.location_description.trim(),
      access_instructions: body.access_instructions?.trim() || null,
      contact_person: body.contact_person?.trim() || null,
      created_at: now,
      updated_at: now,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ location: data }, { status: 201 });
}

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Partial<Omit<DocumentLocation, "id" | "user_id" | "created_at">> & { id: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body?.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { id, ...rest } = body;
  const update = { ...rest, updated_at: new Date().toISOString() };

  const { data, error } = await supabase
    .from("document_locations")
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ location: data });
}

export async function DELETE(req: Request) {
  const supabase = await createClient();
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await supabase
    .from("document_locations")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
