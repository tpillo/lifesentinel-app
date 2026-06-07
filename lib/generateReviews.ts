import Anthropic from "@anthropic-ai/sdk";
import { computeProfileHash, getCachedReview, saveCachedReview } from "@/lib/reviewCache";
import { resolvePersona } from "@/lib/resolvePersona";

export const BENEFITS_MODEL = "claude-sonnet-4-6";
export const STATE_ED_MODEL = "claude-sonnet-4-6";

// Bump this string whenever buildBenefitsPrompt() changes in a way that should
// produce different output. Date-string format: "YYYY-MM-DD". Cosmetic edits
// (whitespace, internal comments) do not require a bump. Prompt logic, section
// wording, constraint additions, or accuracy rule changes do.
export const BENEFITS_PROMPT_VERSION = "2026-06-07";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Prompt builders ────────────────────────────────────────────────────────────

const DIC_ACCURACY = [
  "## Critical Accuracy Requirements",
  "- DIC remarriage rule: the correct age is 55, NOT 57. As of 2021, surviving spouses who remarry at age 55 or older keep DIC. Remarriage before age 55 ends DIC permanently. Do not use age 57 anywhere.",
  "- DIC base rate: $1,699.36/month (2026). Do not use approximate or rounded figures.",
  "- DIC 8-year enhancement: +$360.85/month (not a child allowance — this is the 8-year rule for spouses).",
  "- DIC per child: +$421.00/month per dependent child under 18.",
  "- DIC transitional benefit: +$342.00/month for first 2 years if surviving spouse has dependent children.",
];

const FORMAT_RULES = [
  "Format using ## for main sections, ### for subsections, **bold** for key terms and dollar amounts, and bullet points for lists.",
  "Do NOT use markdown tables under any circumstances. Use bullet points for all lists including DIC breakdowns.",
  "Do NOT use horizontal rules or dividers of any kind — no ---, no ***, no ___. Never output three or more dashes, asterisks, or underscores on a line. Use ## and ### headings to separate sections instead.",
  "Write in a warm, clear, family-friendly tone. This report will be read by a family — be compassionate and practical.",
];

const STATE_ACCURACY_CONSTRAINTS = [
  "## State & Federal Benefit Amount Accuracy — Critical Rules",
  "- Do NOT generate specific dollar amounts for state property tax exemptions, exclusions, assessed value reductions, income caps, or deductions. These figures are set by annual legislative action and can vary by county — quoting them from training data risks giving materially wrong financial guidance to real families.",
  "- Do NOT characterize policy outcomes with absolute phrases like 'complete exemption', 'full waiver', '$0 in property taxes', or 'entire assessed value excluded' unless the relevant statute unambiguously provides a blanket full exemption for this exact situation. Describe what the program does, not the final dollar or tax outcome.",
  "- If the user's state has a benefit card displayed above this analysis, reference it explicitly: use language like 'See the [Benefit Name] card above for current figures and eligibility details.' Do not repeat, expand on, or contradict the amounts shown there.",
  "- You MAY describe what a benefit does at a high level (e.g., 'California offers a Disabled Veterans\\' Property Tax Exemption that reduces the assessed value of the primary residence for qualifying veterans or their surviving spouses').",
  "- You MAY cite statutes by number (e.g., 'under NC General Statute 105-277.1C').",
  "- You MAY describe qualitative eligibility criteria: VA rating thresholds, remarriage rules, residency requirements, income tier categories — without quoting specific dollar cutoffs.",
  "- For federal benefits other than DIC (whose amounts are pinned in the Critical Accuracy Requirements above): do not quote specific dollar figures for CHAMPVA cost-sharing caps, DEA monthly stipends, VA burial allowances, or similar programs. Describe the benefit qualitatively and direct the reader to va.gov or the relevant program page for current rates.",
];

export function buildBenefitsPrompt(profile: Record<string, unknown> | null): string {
  const occ = resolvePersona(profile?.occupation_type as string | null | undefined);
  const isMilitaryVet = occ === "military_veteran";
  const isVeteranFamily = !isMilitaryVet && profile?.veteran_family_member === "yes";

  // ── Veteran family member (non-military user who is a vet's spouse/child/etc.) ──
  if (isVeteranFamily) {
    const rel = (profile?.veteran_family_relationship as string) || "";
    const relLabel =
      rel === "spouse" ? "spouse" :
      rel === "child" ? "dependent child" :
      rel === "parent" ? "parent" :
      rel === "sibling" ? "sibling" :
      "family member";
    const famRating = profile?.veteran_family_disability_rating as string | null | undefined;
    const famScDeath = profile?.veteran_family_sc_death as string | null | undefined;

    const lines: string[] = [
      "You are a veteran benefits advisor helping a family member of a veteran understand what survivor benefits they qualify for.",
      "",
      `This account is set up by the veteran's ${relLabel} — the veteran may have already passed or they are planning ahead for their family.`,
      "Generate a clear, compassionate, organized summary of ALL post-death benefits this family qualifies for as survivors of a veteran.",
      "Cover federal benefits, state benefits, and important deadlines. Be specific about dollar amounts, eligibility requirements, required forms, and who to contact.",
      "",
      "## Veteran Profile",
      `- Account holder's relationship to veteran: ${relLabel}`,
    ];
    if (profile?.state) lines.push(`- State of Residence: ${profile.state}`);
    if (famRating) lines.push(`- Veteran's VA Disability Rating: ${famRating === "none" ? "None" : famRating + "%"}`);
    if (famScDeath) lines.push(`- Veteran's Death Service-Connected: ${famScDeath}`);
    if (profile?.marital_status) lines.push(`- Marital Status: ${profile.marital_status}`);
    if (profile?.num_dependents != null) lines.push(`- Number of Dependent Children Under 23: ${profile.num_dependents}`);

    lines.push(
      "",
      "## Report Sections",
      "",
      "### 1. Federal Survivor Benefits",
      "Cover DIC, Survivors Pension, CHAMPVA, DEA/Chapter 35, VA Burial Benefits, SGLI/VGLI, and Social Security survivor benefits. Cover eligibility conditions, required forms, and contacts. For DIC, use the amounts in the Critical Accuracy Requirements section below. For all other federal benefits, describe qualitatively and direct readers to va.gov for current rates.",
      "",
      "### 2. State-Specific Benefits",
      `Cover survivor benefits available in ${profile?.state ?? "the veteran's state"} — property tax exemptions, income tax benefits, state pension survivor benefits, education waivers, and special programs. Describe what each program does and who qualifies. Note which benefits transfer if the surviving spouse moves. Apply the State & Federal Benefit Amount Accuracy rules below.`,
      "",
      "### 3. Healthcare for Survivors",
      "Cover CHAMPVA eligibility, TRICARE if applicable, and state health program options for surviving family members.",
      "",
      "### 4. Education Benefits for Dependents",
      "Cover DEA/Chapter 35, state tuition waivers, and any other education benefits for dependent children or surviving spouse.",
      "",
      "### 5. Additional Resources & Less-Known Benefits",
      "Highlight any less-known benefits — burial benefits, Gold Star family programs, income tax exemptions, state veteran license plate waivers.",
      "",
      ...STATE_ACCURACY_CONSTRAINTS,
      "",
      ...DIC_ACCURACY,
      "",
      ...FORMAT_RULES,
    );
    return lines.join("\n");
  }

  // ── Non-military, not veteran family (civilian — LE/FF resolve here via resolvePersona) ──
  if (!isMilitaryVet) {
    // v2: FR path per Option B decision — occLabel, isLEO, isFF previously branched on raw occupation_type.
    // After resolvePersona(), occ is always "civilian" here. Restore FR-specific copy when FR EAP ships.
    const occLabel = "Civilian";
    const sectionOffset = 0;

    const lines: string[] = [
      `You are a survivor benefits advisor helping the family of a ${occLabel} understand what financial benefits they are entitled to after their passing.`,
      "",
      "Generate a clear, compassionate, organized summary of the survivor benefits this family may qualify for.",
      "Be specific about dollar amounts where known, eligibility requirements, required forms, and who to contact.",
      "Focus only on post-death survivor benefits — not benefits for the living person.",
      "",
      "## Profile",
      `- Occupation: ${occLabel}`,
    ];
    if (profile?.state) lines.push(`- State of Residence: ${profile.state}`);
    if (profile?.years_of_service) lines.push(`- Years of Service: ${profile.years_of_service}`);
    if (profile?.marital_status) lines.push(`- Marital Status: ${profile.marital_status}`);
    if (profile?.num_dependents != null) lines.push(`- Number of Dependent Children: ${profile.num_dependents}`);

    // v2: FR path per Option B decision — PSOB section removed; restore when FR EAP ships.

    lines.push(
      "",
      "## Report Sections",
      "",
      "### 1. Social Security Survivor Benefits",
      "Cover monthly survivor payments to spouse and children, lump-sum death benefit ($255), eligibility requirements. Include 2026 benefit amounts and how to apply via SSA.",
      "",
      `### ${2 + sectionOffset}. State-Specific Survivor Benefits`,
      `Cover survivor benefits available in ${profile?.state ?? "this state"} — state pension survivor provisions (if public employee), workers' compensation death benefits, state-funded life insurance programs, and any state programs for civilian families. Describe what each program does and who qualifies; do not generate specific dollar amounts for state benefits. Apply the State & Federal Benefit Amount Accuracy rules below.`,
      "",
      `### ${3 + sectionOffset}. Employer, Union & Insurance Benefits`,
      "Cover employer-provided life insurance, union death benefits, pension survivor provisions, COBRA health continuation, and accidental death & dismemberment (AD&D) benefits where applicable.",
      "",
      `### ${4 + sectionOffset}. Additional Resources & Less-Known Benefits`,
      `Highlight programs specific to this profile — state-funded education assistance for survivor children, property tax relief for surviving spouses, emergency funds from professional associations, and any relevant state or local programs for civilian families.`,
      "",
      "Do NOT include VA/military-specific benefits like DIC, CHAMPVA, or DEA unless this person has documented veteran status.",
      ...STATE_ACCURACY_CONSTRAINTS,
      "",
      ...FORMAT_RULES,
    );
    return lines.join("\n");
  }

  // ── Military veteran (original prompt) ──────────────────────────────────────
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
    `- Occupation: Military Service Member / Veteran`,
  ];

  if (profile?.branch) lines.push(`- Branch of Service: ${profile.branch}`);
  if (profile?.status) lines.push(`- Service Status: ${profile.status}`);
  if (profile?.state) lines.push(`- State of Residence: ${profile.state}`);
  if (profile?.years_of_service) lines.push(`- Years of Service: ${profile.years_of_service}`);
  if (isMilitaryVet && profile?.va_disability_rating) lines.push(`- VA Combined Disability Rating: ${profile.va_disability_rating === "none" ? "None" : profile.va_disability_rating + "%"}`);
  if (isMilitaryVet && profile?.va_pt_designation) lines.push(`- Permanent & Total (P&T) Designation: ${ptLabel}`);
  if (isMilitaryVet && profile?.service_connected_death) lines.push(`- Cause of Death Service-Connected: ${profile.service_connected_death}`);
  if (profile?.marital_status) lines.push(`- Marital Status: ${profile.marital_status}`);
  if (profile?.num_dependents != null) lines.push(`- Number of Dependent Children Under 23: ${profile.num_dependents}`);

  lines.push(
    "",
    "## Report Sections",
    "",
    "### 1. Federal Survivor Benefits",
    "Cover DIC, Survivors Pension, CHAMPVA, DEA/Chapter 35, Fry Scholarship, VA Burial Benefits, VA Home Loan for surviving spouse, SGLI/VGLI, and Social Security survivor benefits. Cover eligibility conditions, required forms, and contacts. For DIC, use the amounts in the Critical Accuracy Requirements section below. For all other federal benefits, describe qualitatively and direct readers to va.gov for current rates.",
    "",
    "### 2. State-Specific Benefits",
    `Cover survivor benefits available in ${profile?.state ?? "the veteran's state"} — property tax exemptions, income tax benefits, state pension survivor benefits, education waivers, and any special programs. Describe what each program does and who qualifies; do not generate specific dollar amounts for state exemptions. Note which benefits transfer to a new residence. Apply the State & Federal Benefit Amount Accuracy rules below.`,
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
    ...STATE_ACCURACY_CONSTRAINTS,
    "",
    ...DIC_ACCURACY,
    "",
    ...FORMAT_RULES,
  );

  return lines.join("\n");
}

export function buildStateEdPrompt(fields: {
  state: string;
  isPT: boolean;
  rating: string;
  scDeath: boolean;
  isVeteranFamily?: boolean;
  relationship?: string | null;
}): string {
  const { state, isPT, rating, scDeath, isVeteranFamily = false, relationship } = fields;

  const relLabel =
    relationship === "child" ? "dependent child"
    : relationship === "parent" ? "parent"
    : relationship === "sibling" ? "sibling"
    : "surviving spouse";

  const profileLines = [
    `- State: ${state}`,
    `- VA Disability Rating: ${rating || "Not specified"}`,
    `- Permanent & Total (P&T) Designation: ${isPT ? "Yes" : "No"}`,
    `- Service-Connected Death: ${scDeath ? "Yes" : "No"}`,
  ].join("\n");

  let intro: string;
  let addressLine: string;

  if (isVeteranFamily) {
    if (scDeath) {
      intro = `You are a state benefits expert helping a ${relLabel} of a veteran who died from a service-connected cause understand state education benefits in ${state}. Address this person directly — they are the surviving family member, not the veteran.`;
      addressLine = `As a surviving ${relLabel}, you or your dependents may qualify for the following programs in ${state}:`;
    } else {
      intro = `You are a state benefits expert helping a ${relLabel} of a military veteran understand state education benefits that may be available in ${state}. Address this person directly as the family member — not the veteran.`;
      addressLine = `Based on your veteran's service history and eligibility, you or your dependents may qualify for the following programs in ${state}:`;
    }
  } else {
    intro = `You are a veteran benefits expert helping a military veteran plan ahead for their family in ${state}. The veteran wants to understand what state education benefits their surviving family could access.`;
    addressLine = `Based on your service profile, your surviving spouse and dependents may qualify for the following education programs in ${state}:`;
  }

  return `${intro}

Veteran profile:
${profileLines}

${addressLine}
- Program name and administering agency
- What it covers (tuition, fees, stipends, credit hour limits)
- Who qualifies and any age limits
- Residency requirements
- How to apply (website, phone number)
- Any interaction or conflict with federal programs like DEA (Chapter 35) or the Fry Scholarship

If ${state} does not have a dedicated state education benefit program, say so clearly and advise them to contact the ${state} Department of Veterans Affairs or equivalent office.

CRITICAL RULES:
- Only describe programs that genuinely exist in ${state}. Do not invent or fabricate programs.
- Do NOT use markdown tables.
- Do NOT use horizontal rules (---, ***, ___).
- Use bullet points and short paragraphs.
- Keep the response practical and under 300 words.
- Do not use headers (##, ###) — just use bold text and bullets.`;
}

// ── Hash field extractors ──────────────────────────────────────────────────────

export function benefitsHashFields(profile: Record<string, unknown>): Record<string, unknown> {
  return {
    _prompt_version: BENEFITS_PROMPT_VERSION,
    occupation_type: resolvePersona(profile?.occupation_type as string | null | undefined) || null,
    branch: profile?.branch ?? null,
    status: profile?.status ?? null,
    state: profile?.state ?? null,
    years_of_service: profile?.years_of_service ?? null,
    va_disability_rating: profile?.va_disability_rating ?? null,
    va_pt_designation: profile?.va_pt_designation ?? null,
    service_connected_death: profile?.service_connected_death ?? null,
    marital_status: profile?.marital_status ?? null,
    num_dependents: profile?.num_dependents ?? null,
    department_type: profile?.department_type ?? null,
    career_volunteer: profile?.career_volunteer ?? null,
    veteran_family_member: profile?.veteran_family_member ?? null,
    veteran_family_relationship: profile?.veteran_family_relationship ?? null,
    veteran_family_sc_death: profile?.veteran_family_sc_death ?? null,
    veteran_family_disability_rating: profile?.veteran_family_disability_rating ?? null,
  };
}

// ── Pre-warm functions (non-streaming, called from profile route) ──────────────

export async function prewarmBenefitsCache(
  userId: string,
  profile: Record<string, unknown>
): Promise<void> {
  const profileHash = computeProfileHash(benefitsHashFields(profile));
  const cached = await getCachedReview(userId, "benefits");
  if (cached && cached.profile_hash === profileHash && cached.model === BENEFITS_MODEL) return;

  const response = await anthropic.messages.create({
    model: BENEFITS_MODEL,
    max_tokens: 8192,
    messages: [{ role: "user", content: buildBenefitsPrompt(profile) }],
  });
  const content =
    response.content[0]?.type === "text" ? response.content[0].text : "";
  await saveCachedReview(userId, "benefits", profileHash, content, BENEFITS_MODEL);
}

export async function prewarmStateEdCache(
  userId: string,
  fields: { state: string; isPT: boolean; rating: string; scDeath: boolean; isVeteranFamily?: boolean; relationship?: string | null }
): Promise<void> {
  if (!fields.state) return;
  const profileHash = computeProfileHash(fields as unknown as Record<string, unknown>);
  const cached = await getCachedReview(userId, "state_education");
  if (cached && cached.profile_hash === profileHash && cached.model === STATE_ED_MODEL) return;

  const response = await anthropic.messages.create({
    model: STATE_ED_MODEL,
    max_tokens: 600,
    messages: [{ role: "user", content: buildStateEdPrompt(fields) }],
  });
  const content =
    response.content[0]?.type === "text" ? response.content[0].text : "";
  await saveCachedReview(userId, "state_education", profileHash, content, STATE_ED_MODEL);
}
