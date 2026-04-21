import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function buildPrompt(profile: Record<string, any> | null): string {
  const occ = profile?.occupation_type ?? "unknown";
  const occLabel =
    occ === "law_enforcement" ? "Law Enforcement Officer"
    : occ === "military_veteran" ? "Military Service Member / Veteran"
    : occ === "firefighter" ? "Firefighter / First Responder"
    : "Civilian";

  const ptLabel =
    profile?.va_pt_designation === "yes" ? "Yes"
    : profile?.va_pt_designation === "pending" ? "Pending"
    : profile?.va_pt_designation === "no" ? "No"
    : "Unknown";

  const lines: string[] = [
    "You are a veteran benefits advisor helping a family understand what they are entitled to after a veteran's passing.",
    "",
    "Based on this veteran's profile, generate a clear, compassionate, organized summary of ALL post-death benefits their family qualifies for.",
    "Cover federal benefits, state benefits, and important deadlines. Be specific about dollar amounts where known, eligibility requirements,",
    "required forms, and who to contact. Focus only on survivor/post-death benefits — not benefits for the living veteran.",
    "",
    "## Veteran Profile",
    `- Occupation: ${occLabel}`,
  ];

  if (profile?.branch) lines.push(`- Branch of Service: ${profile.branch}`);
  if (profile?.status) lines.push(`- Service Status: ${profile.status}`);
  if (profile?.state) lines.push(`- State of Residence: ${profile.state}`);
  if (profile?.years_of_service) lines.push(`- Years of Service: ${profile.years_of_service}`);
  if (profile?.va_disability_rating) lines.push(`- VA Combined Disability Rating: ${profile.va_disability_rating === "none" ? "None" : profile.va_disability_rating + "%"}`);
  if (profile?.va_pt_designation) lines.push(`- Permanent & Total (P&T) Designation: ${ptLabel}`);
  if (profile?.service_connected_death) lines.push(`- Cause of Death Service-Connected: ${profile.service_connected_death}`);
  if (profile?.marital_status) lines.push(`- Marital Status: ${profile.marital_status}`);
  if (profile?.num_dependents != null) lines.push(`- Number of Dependent Children Under 23: ${profile.num_dependents}`);
  if (profile?.department_type) lines.push(`- Department Type: ${profile.department_type}`);
  if (profile?.career_volunteer) lines.push(`- Career/Volunteer: ${profile.career_volunteer}`);

  lines.push(
    "",
    "## Report Sections",
    "",
    "### 1. Federal Survivor Benefits",
    "Cover DIC, Survivors Pension, CHAMPVA, DEA/Chapter 35, Fry Scholarship, VA Burial Benefits, VA Home Loan for surviving spouse, SGLI/VGLI, and Social Security survivor benefits. Include 2026 dollar amounts, eligibility conditions, required forms, and contacts.",
    "",
    "### 2. State-Specific Benefits",
    `Cover survivor benefits available in ${profile?.state ?? "the veteran's state"} — property tax exemptions, income tax benefits, state pension survivor benefits, education waivers, and any special programs. Be specific about current law and how to apply. Note which benefits transfer to a new residence.`,
    "",
    "### 3. Healthcare for Survivors",
    "Cover CHAMPVA (if not already addressed), TRICARE if applicable, and state health program options for surviving family members.",
    "",
    "### 4. Education Benefits for Dependents",
    "Cover DEA/Chapter 35, Fry Scholarship (if applicable), state tuition waivers for the veteran's state, and any other education benefits for dependent children or surviving spouse.",
    "",
    "### 5. Additional Resources & Less-Known Benefits",
    "Highlight any less-known benefits specific to this veteran's profile — such as CHAMPVA dental, state veteran license plate fee waivers, burial benefits, Gold Star family programs, or income tax exemptions.",
    "",
    "## Critical Accuracy Requirements",
    "- DIC remarriage rule: the correct age is 55, NOT 57. As of 2021, surviving spouses who remarry at age 55 or older keep DIC. Remarriage before age 55 ends DIC permanently. Do not use age 57 anywhere.",
    "- DIC base rate: $1,699.36/month (2026). Do not use approximate or rounded figures.",
    "- DIC 8-year enhancement: +$360.85/month (not a child allowance — this is the 8-year rule for spouses).",
    "- DIC per child: +$421.00/month per dependent child under 18.",
    "- DIC transitional benefit: +$342.00/month for first 2 years if surviving spouse has dependent children.",
    "",
    "Format using ## for main sections, ### for subsections, **bold** for key terms and dollar amounts, and bullet points for lists.",
    "Write in a warm, clear, family-friendly tone. This report will be read by a grieving family — be compassionate and practical.",
  );

  return lines.join("\n");
}

export async function POST() {
  const supabase = await createClient();

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const prompt = buildPrompt(profile);

  try {
    const stream = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      stream: true,
      messages: [{ role: "user", content: prompt }],
    });

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              controller.enqueue(new TextEncoder().encode(chunk.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          console.error("[benefits] stream error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err: any) {
    console.error("[benefits] API error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to generate benefits report" },
      { status: 500 }
    );
  }
}
