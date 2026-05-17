import { NextResponse, after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prewarmBenefitsCache, prewarmStateEdCache } from "@/lib/generateReviews";

export const runtime = "nodejs";
export const maxDuration = 180;

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
    branches_served: Array.isArray(body.branches_served) ? body.branches_served : null,
    retirement_branch: body.retirement_branch ?? null,
    primary_service_branch: body.primary_service_branch ?? null,
    career_volunteer: body.career_volunteer ?? null,
    occupation: body.occupation ?? null,
    va_disability_rating: body.va_disability_rating ?? null,
    va_pt_designation: body.va_pt_designation ?? null,
    pt_award_date: body.pt_award_date || null,
    va_rating_date: body.va_rating_date || null,
    service_connected_death: body.service_connected_death ?? null,
    retirement_type: body.retirement_type ?? null,
    rcsbp_election: body.rcsbp_election ?? null,
    sbp_base_amount: body.sbp_base_amount ?? null,
    collecting_retired_pay: body.collecting_retired_pay ?? null,
    veteran_family_member: body.veteran_family_member ?? null,
    veteran_family_relationship: body.veteran_family_relationship ?? null,
    veteran_family_sc_death: body.veteran_family_sc_death ?? null,
    veteran_family_disability_rating: body.veteran_family_disability_rating ?? null,
    updated_at: now,
  };

  const { error } = await supabase
    .from("profiles")
    .upsert({ ...row, created_at: now }, { onConflict: "user_id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (row.occupation_type) {
    after(async () => {
      try {
        console.log("[prewarm] starting benefits pre-warm");
        const t1 = Date.now();
        await prewarmBenefitsCache(user.id, row);
        console.log("[prewarm] benefits pre-warm complete", { elapsedMs: Date.now() - t1 });
      } catch (err) {
        console.error("[prewarm] benefits error:", err);
      }

      try {
        console.log("[prewarm] starting state-ed pre-warm");
        const t2 = Date.now();
        const isVeteranFamilyMember =
          row.occupation_type !== "military_veteran" && row.veteran_family_member === "yes";
        await prewarmStateEdCache(user.id, {
          state: String(row.state ?? ""),
          isPT: isVeteranFamilyMember ? false : row.va_pt_designation === "yes",
          rating: isVeteranFamilyMember
            ? String(row.veteran_family_disability_rating ?? "")
            : String(row.va_disability_rating ?? ""),
          scDeath: isVeteranFamilyMember
            ? row.veteran_family_sc_death === "yes"
            : row.service_connected_death === "yes",
        });
        console.log("[prewarm] state-ed pre-warm complete", { elapsedMs: Date.now() - t2 });
      } catch (err) {
        console.error("[prewarm] state-ed error:", err);
      }
    });
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
