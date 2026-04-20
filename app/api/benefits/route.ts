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

  const lines: string[] = [
    "You are a knowledgeable benefits advisor helping families understand the survivor, disability, and service-related benefits they may be entitled to.",
    "",
    "Generate a comprehensive, personalized benefits report for the following individual. Be specific — include program names, dollar amounts or ranges where known, eligibility thresholds, and filing timelines. Note where something varies by situation or requires verification.",
    "",
    "## Individual Profile",
    `- Occupation: ${occLabel}`,
  ];

  if (profile?.branch) lines.push(`- Branch of Service: ${profile.branch}`);
  if (profile?.department_type) lines.push(`- Department Type: ${profile.department_type}`);
  if (profile?.career_volunteer) lines.push(`- Career/Volunteer: ${profile.career_volunteer}`);
  if (profile?.occupation) lines.push(`- Occupation: ${profile.occupation}`);
  if (profile?.status) lines.push(`- Status: ${profile.status}`);
  if (profile?.state) lines.push(`- State of Residence: ${profile.state}`);
  if (profile?.years_of_service) lines.push(`- Years of Service: ${profile.years_of_service}`);
  if (profile?.va_disability_rating) lines.push(`- VA Combined Disability Rating: ${profile.va_disability_rating === "none" ? "None" : profile.va_disability_rating + "%"}`);
  if (profile?.va_pt_designation != null) lines.push(`- Permanent & Total (P&T) Designation: ${profile.va_pt_designation ? "Yes" : "No"}`);
  if (profile?.marital_status) lines.push(`- Marital Status: ${profile.marital_status}`);
  if (profile?.num_dependents != null) lines.push(`- Number of Dependents: ${profile.num_dependents}`);

  lines.push(
    "",
    "## Report Requirements",
    "",
    "Please cover each of the following sections in detail, tailored specifically to this individual's profile:",
    "",
    "### 1. Federal Benefits Overview",
    "Key federal programs this person and their family may be entitled to based on their occupation, service, and status.",
    "",
    "### 2. VA Benefits (if applicable)",
    "Based on their disability rating, P&T status, branch, and years of service — cover compensation amounts, additional allowances for dependents, and what changes at P&T designation.",
    "",
    "### 3. Survivor Financial Benefits",
    "DIC (Dependency and Indemnity Compensation), SBP (Survivor Benefit Plan), LODI/PSOB (for law enforcement/fire), Social Security survivor benefits, and any other financial survivor programs relevant to their occupation.",
    "",
    "### 4. Healthcare Benefits for Survivors",
    "TRICARE, CHAMPVA, Medicaid transitions, COBRA, and any state-specific health programs for survivors of this occupation type.",
    "",
    "### 5. Education Benefits for Dependents",
    "Chapter 35/DEA, MyCAA, Fry Scholarship, state tuition waivers, and any scholarship programs specific to their occupation or state.",
    "",
    "### 6. State-Specific Benefits",
    `Benefits specifically available to survivors of ${occLabel.toLowerCase()}s in ${profile?.state ?? "their state"}, including property tax exemptions, license fee waivers, pension survivor benefits, and any special state programs.`,
    "",
    "### 7. Important Deadlines & Key Contacts",
    "Filing deadlines, time-sensitive elections (like SBP), and the specific agencies and phone numbers their family should contact.",
    "",
    "Format your response using ## for main sections, ### for subsections, **bold** for important terms and amounts, and bullet points for lists. Write in a warm, clear, family-friendly tone — not bureaucratic jargon.",
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
