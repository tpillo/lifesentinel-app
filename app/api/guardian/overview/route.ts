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

  const [docsResult, profileResult] = await Promise.all([
    supabaseAdmin
      .from("readiness_documents")
      .select("id, item_label, is_present")
      .eq("user_id", link.owner_user_id)
      .order("item_label", { ascending: true }),
    supabaseAdmin
      .from("profiles")
      .select("full_name, service_connected_death, status, occupation_type, va_disability_rating, va_pt_designation, pt_award_date, state, num_dependents, marital_status, years_of_service, branch, retirement_type, rcsbp_election, sbp_base_amount, collecting_retired_pay, branches_served, retirement_branch, primary_service_branch")
      .eq("user_id", link.owner_user_id)
      .maybeSingle(),
  ]);

  if (docsResult.error) {
    return NextResponse.json({ error: docsResult.error.message }, { status: 500 });
  }

  const items = (docsResult.data ?? []).map((d) => ({
    id: d.id,
    title: d.item_label,
    completed: d.is_present,
  }));

  const total = items.length;
  const completed = items.filter((i) => i.completed).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  const profile = profileResult.data ?? null;

  return NextResponse.json({ total, completed, percent, items, profile });
}
