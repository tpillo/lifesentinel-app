"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import DashboardHeader from "@/components/DashboardHeader";
import { RcsbpSection, OrgsSection, StateEdSection, DigitalEstateSection } from "@/components/BenefitsGuide";
import { trackEvent } from "@/lib/gtag";

// ── Types ──────────────────────────────────────────────────────────────

type Profile = {
  occupation_type?: string | null;
  va_disability_rating?: string | null;
  va_pt_designation?: string | null;
  pt_award_date?: string | null;
  service_connected_death?: string | null;
  state?: string | null;
  num_dependents?: number | null;
  marital_status?: string | null;
  years_of_service?: number | null;
  status?: string | null;
  branch?: string | null;
  full_name?: string | null;
  retirement_type?: string | null;
  rcsbp_election?: string | null;
  sbp_base_amount?: string | null;
  collecting_retired_pay?: string | null;
  branches_served?: string[] | null;
};

type Eligibility = "yes" | "verify";

type BenefitDef = {
  id: string;
  title: string;
  amount?: string;
  description: string;
  eligibility: Eligibility;
  form?: string;
  contact?: string;
  deadline?: string;
  howToApply: string;
  confirmed: boolean;
  qualificationNote?: string;
  plainLanguageNote?: string;
  enhancementNote?: string;
};

type StateInfo = {
  title: string;
  bullets: string[];
  howToApply: string;
};

// ── Hardcoded state data ───────────────────────────────────────────────

const STATE_INFO: Record<string, StateInfo> = {
  Virginia: {
    title: "Property Tax & Income Tax Benefits",
    bullets: [
      "Surviving spouse of 100% P&T veteran: full property tax exemption (no remarriage required, transferable to new primary residence)",
      "Surviving spouse of veteran who died in line of duty: full property tax exemption (updated Jan 2025)",
      "Military SBP survivor benefits: up to $40,000 state income tax subtraction (2025+)",
    ],
    howToApply: "dvs.virginia.gov",
  },
  Texas: {
    title: "Texas — Homestead Exemption",
    bullets: [
      "Surviving unremarried spouse of 100% P&T veteran: full homestead exemption, transferable to new homestead",
      "Surviving spouse of service member killed in line of duty: 100% homestead exemption",
    ],
    howToApply: "County Appraisal District — deadline April 30",
  },
  Florida: {
    title: "Florida — Homestead Exemption",
    bullets: [
      "Surviving unremarried spouse of 100% P&T veteran: full homestead exemption",
    ],
    howToApply: "County Property Appraiser",
  },
  "South Carolina": {
    title: "South Carolina — Property Tax Exemption",
    bullets: [
      "Surviving unremarried spouse: exemption on home + up to 5 acres (retroactive to 2022)",
    ],
    howToApply: "County Assessor",
  },
  Michigan: {
    title: "Michigan — Homestead Exemption",
    bullets: [
      "Surviving unremarried spouse of 100% P&T veteran: full homestead exemption",
      "No reapplication required after veteran's death (2025+)",
    ],
    howToApply: "County Assessor",
  },
  Maryland: {
    title: "Maryland — Property Tax Exemption",
    bullets: [
      "Surviving spouse remaining in same home: exemption continues",
      "Surviving spouse of line-of-duty death: full exemption",
    ],
    howToApply: "County Supervisor of Assessments",
  },
  Wisconsin: {
    title: "Wisconsin — Property Tax Credit",
    bullets: [
      "Surviving unremarried spouse: 100% refundable property tax credit",
      "Claimed on state income tax return after WDVA verification",
    ],
    howToApply: "Wisconsin Department of Veterans Affairs",
  },
  "North Carolina": {
    title: "North Carolina — Property Tax Exemption",
    bullets: [
      "$45,000 assessed value exemption continues for unremarried surviving spouse",
      "$2,000 annual mortgage tax credit continues",
    ],
    howToApply: "County Tax Assessor",
  },
  Pennsylvania: {
    title: "Pennsylvania — Property Tax Exemption",
    bullets: [
      "Full exemption if household income below $114,637 (2025 limit) — surviving spouse may qualify",
    ],
    howToApply: "County Veterans Affairs Office",
  },
  Oregon: {
    title: "Oregon — Property Tax Exemption",
    bullets: [
      "$26,303–$31,565 assessed value exemption continues for surviving spouse or partner",
    ],
    howToApply: "County Assessor",
  },
};

// ── Benefit eligibility logic ──────────────────────────────────────────

function getDicEnhancementNote(ptAwardDate: string | null | undefined, isPT: boolean): string | undefined {
  if (!isPT) return undefined;
  if (!ptAwardDate) return "? 8-Year Enhancement — P&T Award Date not on file. Add your P&T award date to your profile to see if you qualify for the +$360.85/month enhancement.";
  const award = new Date(ptAwardDate);
  const today = new Date();
  const msPerYear = 1000 * 60 * 60 * 24 * 365.25;
  const yearsHeld = (today.getTime() - award.getTime()) / msPerYear;
  if (yearsHeld >= 8) {
    return "✓ 8-Year Enhancement Confirmed — your spouse qualifies for the additional +$360.85/month, bringing total DIC to $2,060.21/month.";
  }
  const qualifyDate = new Date(award.getTime() + 8 * msPerYear);
  const qualifyStr = qualifyDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  return `⚠ 8-Year Enhancement Not Yet Reached — qualifies on ${qualifyStr}. Until then, the base DIC rate of $1,699.36/month applies.`;
}

function getBenefits(p: Profile): BenefitDef[] {
  const isMilitary = p.occupation_type === "military_veteran";
  const rating = p.va_disability_rating;
  const isPT = p.va_pt_designation === "yes";
  const isPTPending = p.va_pt_designation === "pending";
  const scDeath = p.service_connected_death === "yes";
  const scUnknown = p.service_connected_death === "unknown";
  const isActiveduty = p.status === "active_duty";
  const hasSpouse = ["married", "widowed"].includes(p.marital_status ?? "");
  const rating100 = rating === "100";
  const highRating = ["70", "80", "90", "100"].includes(rating ?? "");

  const list: BenefitDef[] = [];

  if (isMilitary) {
    // DIC
    const dicElig: Eligibility | null =
      scDeath ? "yes" :
      (isPT || rating100 || scUnknown) ? "verify" : null;

    if (dicElig) {
      const dicQualNote = isPT
        ? "Yes — because the veteran held a 100% P&T rating, the surviving spouse qualifies for DIC regardless of cause of death, provided the marriage lasted at least 1 year."
        : scDeath
        ? "Yes — because the cause of death was service-connected."
        : "Verify — contact the VA to confirm eligibility based on the veteran's service record.";

      list.push({
        id: "dic",
        title: "DIC — Dependency & Indemnity Compensation",
        amount: "$1,699.36/month — paid to all qualifying surviving spouses, tax-free, for life\n+$360.85/month — if veteran was rated 100% disabled for 8+ continuous years before death AND you were married during those same 8 years (total: $2,060.21)\n+$421.00/month — per dependent child under 18\n+$342.00/month — transitional benefit for first 2 years after death if you have dependent children",
        description: "DIC is a monthly payment the VA makes to surviving spouses for life. Your income and assets do NOT affect eligibility — this is not means-tested. Eligibility is based on the veteran's service history and disability rating, not financial need. Must not have remarried — except if remarriage occurs at age 55 or older, in which case DIC continues uninterrupted. Surviving spouses who remarry at age 55 or older keep DIC. Remarriage before age 55 ends DIC payments permanently.",
        eligibility: dicElig,
        form: "VA Form 21P-534EZ",
        contact: "VA: 1-800-827-1000",
        deadline: "File within 1 year of death to receive retroactive pay back to date of death",
        howToApply: "File VA Form 21P-534EZ with the VA Pension Management Center for your state. Apply at va.gov or call 1-800-827-1000.",
        confirmed: true,
        qualificationNote: dicQualNote,
        plainLanguageNote: "The 8-year enhancement (+$360.85) is separate from the child allowance (+$421 per child). A family with 2 children AND the 8-year qualification could receive: $1,699.36 + $360.85 + $842.00 = $2,902.21/month — all tax-free.",
        enhancementNote: getDicEnhancementNote(p.pt_award_date, isPT),
      });
    }

    // Survivors Pension
    list.push({
      id: "pension",
      title: "Survivors Pension",
      amount: "Up to $10,726/year (no dependents) · Up to $14,051/year (with one child)",
      description: "Income-based pension for surviving family members of wartime veterans. Not disability-based — eligibility depends on income and financial need. The veteran must have served during a wartime period.",
      eligibility: "verify",
      form: "VA Form 21P-534EZ",
      contact: "VA: 1-800-827-1000",
      howToApply: "File VA Form 21P-534EZ at va.gov. A VSO can help assess income eligibility.",
      confirmed: true,
    });

    // CHAMPVA
    const champvaElig: Eligibility | null =
      (isPT || scDeath) ? "yes" :
      (rating100 || isPTPending) ? "verify" : null;

    if (champvaElig) {
      list.push({
        id: "champva",
        title: "CHAMPVA — Family Healthcare Coverage",
        amount: "Covers most medical costs for surviving spouse and dependent children under 18 (or 23 if full-time student)",
        description: "Comprehensive healthcare for eligible surviving spouses and dependents — inpatient, outpatient, mental health, pharmacy, and preventive care. Surviving spouse loses CHAMPVA upon remarriage before age 55.",
        eligibility: champvaElig,
        form: "VA Form 10-10d",
        contact: "VA Health Eligibility Center: 1-800-733-8387",
        deadline: "Apply within 2 years of death",
        howToApply: "Apply at va.gov/health-care/family-caregiver-benefits/champva or call 1-800-733-8387.",
        confirmed: true,
      });
    }

    // DEA / Chapter 35
    if (isPT || isPTPending || scDeath || scUnknown || highRating) {
      list.push({
        id: "dea",
        title: "DEA — Dependents Educational Assistance (Ch. 35)",
        amount: "Up to 45 months of education benefits for eligible spouse and children",
        description: "Education benefits covering college, vocational training, and apprenticeships. Spouse has up to 20 years to use; dependent children ages 18–26.",
        eligibility: "verify",
        contact: "VA.gov or 1-888-442-4551",
        howToApply: "Apply online at va.gov or call 1-888-442-4551. Submit VA Form 22-5490.",
        confirmed: true,
      });
    }

    // Fry Scholarship
    if (isActiveduty) {
      list.push({
        id: "fry",
        title: "Fry Scholarship (Post-9/11 GI Bill Equivalent)",
        amount: "Full tuition at public schools + monthly housing allowance + books/supplies stipend. Children eligible ages 18–33.",
        description: "For surviving spouses and children of service members who died in the line of duty on or after September 11, 2001. Both surviving spouse and children may apply separately.",
        eligibility: "verify",
        contact: "VA.gov or 1-888-442-4551",
        howToApply: "Apply at va.gov/education/survivor-dependent-benefits/fry-scholarship.",
        confirmed: true,
      });
    }

    // VA Burial — always for military
    list.push({
      id: "burial",
      title: "VA Burial Benefits",
      amount: "National cemetery burial: free (veteran, spouse, dependents)\nBurial allowance: up to $796 (service-connected) or $300 (non-service-connected)\nGrave marker/headstone: free · Presidential Memorial Certificate: free",
      description: "VA burial benefits include interment in a national cemetery, a government-furnished headstone or marker, a burial flag, and a burial allowance. Apply for burial allowance within 2 years of burial.",
      eligibility: "yes",
      contact: "National Cemetery Scheduling: 1-800-535-1117",
      deadline: "Apply for burial allowance within 2 years of burial (VA Form 21P-530EZ)",
      howToApply: "Contact National Cemetery Scheduling at 1-800-535-1117. Apply for burial allowance at va.gov using VA Form 21P-530EZ. Request burial flag through the funeral home.",
      confirmed: true,
    });

    // VA Home Loan
    if (hasSpouse) {
      list.push({
        id: "home-loan",
        title: "VA Home Loan — Surviving Spouse",
        amount: "No down payment required · No private mortgage insurance · Competitive interest rates",
        description: "Eligible unremarried surviving spouses may qualify for the VA home loan guaranty for purchase or refinance. One of the most powerful home-buying benefits available.",
        eligibility: "verify",
        contact: "VA Home Loans: 1-877-827-3702",
        howToApply: "Obtain a Certificate of Eligibility at va.gov/housing-assistance/home-loans or through a VA-approved lender.",
        confirmed: true,
      });
    }

    // SGLI/VGLI
    list.push({
      id: "sgli",
      title: "SGLI / VGLI Life Insurance",
      amount: "SGLI (active duty): up to $500,000 · VGLI (veteran): per coverage elected",
      description: "Life insurance payable to designated beneficiaries. SGLI covers active duty service members. VGLI is the conversion option for veterans post-separation. Separate from VA compensation — file promptly.",
      eligibility: "verify",
      form: "SGLV 8283",
      contact: "OSGLI: 1-800-419-1473",
      deadline: "File SGLI claim within 1 year of death",
      howToApply: "File form SGLV 8283 with OSGLI. Call 1-800-419-1473 for claims assistance.",
      confirmed: true,
    });
  }

  // Social Security — all occupation types
  list.push({
    id: "ss",
    title: "Social Security Survivor Benefits",
    amount: "Surviving spouse: up to 100% of deceased's benefit at full retirement age\nChildren under 18: typically 75% of deceased's benefit",
    description: "Monthly payments based on the deceased's earnings record. Applies to surviving spouses, minor children, and sometimes dependent parents. Completely separate from VA — must be filed with SSA.",
    eligibility: "verify",
    contact: "SSA: 1-800-772-1213 · ssa.gov",
    deadline: "Apply promptly — some retroactivity is limited",
    howToApply: "Call SSA at 1-800-772-1213 or visit a local Social Security office. Benefits are not automatic.",
    confirmed: true,
  });

  return list;
}

// ── Markdown renderer ──────────────────────────────────────────────────

type RenderNode =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "p"; text: string };

function parseInline(text: string): React.ReactNode[] {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-semibold text-stone-800">{part}</strong> : part
  );
}

function parseMarkdown(raw: string): RenderNode[] {
  const lines = raw.split("\n");
  const nodes: RenderNode[] = [];
  let buf: string[] = [];
  function flush() { if (buf.length) { nodes.push({ type: "ul", items: [...buf] }); buf = []; } }
  for (const line of lines) {
    if (line.startsWith("## ")) { flush(); nodes.push({ type: "h2", text: line.slice(3) }); }
    else if (line.startsWith("### ")) { flush(); nodes.push({ type: "h3", text: line.slice(4) }); }
    else if (/^[-*] /.test(line)) { buf.push(line.slice(2)); }
    else if (line.trim() === "") { flush(); }
    else { flush(); nodes.push({ type: "p", text: line }); }
  }
  flush();
  return nodes;
}

function BenefitsContent({ markdown }: { markdown: string }) {
  const nodes = parseMarkdown(markdown);
  return (
    <div className="space-y-1">
      {nodes.map((node, i) => {
        if (node.type === "h2") return (
          <div key={i} className="pt-6 first:pt-0">
            <div className="flex items-center gap-3 pb-3 border-b border-amber-100 mb-4">
              <span className="text-amber-500 select-none text-lg">◈</span>
              <h2 className="font-serif text-xl font-semibold text-stone-900">{node.text}</h2>
            </div>
          </div>
        );
        if (node.type === "h3") return (
          <h3 key={i} className="font-semibold text-stone-800 text-sm mt-5 mb-1.5">{node.text}</h3>
        );
        if (node.type === "ul") return (
          <ul key={i} className="space-y-1.5 my-2">
            {node.items.map((item, j) => (
              <li key={j} className="flex items-start gap-2.5 text-sm text-stone-600 leading-relaxed">
                <span className="text-amber-400 mt-1 shrink-0 text-xs">●</span>
                <span>{parseInline(item)}</span>
              </li>
            ))}
          </ul>
        );
        if (node.type === "p") return (
          <p key={i} className="text-sm text-stone-600 leading-relaxed">{parseInline(node.text)}</p>
        );
        return null;
      })}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────

function EligBadge({ e }: { e: Eligibility }) {
  if (e === "yes") return (
    <span className="shrink-0 inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
      ✓ Likely Qualifies
    </span>
  );
  return (
    <span className="shrink-0 inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-medium text-amber-700">
      ◎ Verify Eligibility
    </span>
  );
}

function BenefitCard({ b }: { b: BenefitDef }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <h3 className="font-serif text-base font-semibold text-stone-900 leading-snug">{b.title}</h3>
        <EligBadge e={b.eligibility} />
      </div>

      {b.amount && (
        <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-2.5 mb-3">
          <p className="text-xs font-medium text-amber-900 leading-relaxed whitespace-pre-line">{b.amount}</p>
        </div>
      )}

      <p className="text-sm text-stone-500 leading-relaxed mb-3">{b.description}</p>

      {b.qualificationNote && (
        <div className="rounded-xl border border-stone-100 bg-stone-50 px-4 py-3 mb-3">
          <p className="text-xs text-stone-500 leading-relaxed">
            <span className="font-semibold text-stone-700">Does this family qualify? </span>
            {b.qualificationNote}
          </p>
        </div>
      )}

      {b.enhancementNote && (
        <div className={`rounded-xl border px-4 py-3 mb-3 ${
          b.enhancementNote.startsWith("✓")
            ? "border-emerald-200 bg-emerald-50/50"
            : b.enhancementNote.startsWith("⚠")
            ? "border-amber-200 bg-amber-50/50"
            : "border-stone-200 bg-stone-50"
        }`}>
          <p className="text-xs leading-relaxed text-stone-700">{b.enhancementNote}</p>
        </div>
      )}

      <div className="space-y-1 text-xs mb-3">
        {b.form && (
          <p><span className="text-stone-400">Form: </span><span className="font-medium text-stone-700">{b.form}</span></p>
        )}
        {b.contact && (
          <p><span className="text-stone-400">Contact: </span><span className="text-stone-600">{b.contact}</span></p>
        )}
        {b.deadline && (
          <p className="font-medium text-red-600">⚠ Deadline: {b.deadline}</p>
        )}
      </div>

      <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
        <span className={`text-xs font-medium ${b.confirmed ? "text-emerald-600" : "text-amber-600"}`}>
          {b.confirmed ? "✓ Confirmed benefit" : "Verify with your state VA office"}
        </span>
        <button
          onClick={() => setOpen(!open)}
          className="text-xs text-amber-600 hover:text-amber-700 transition font-medium"
        >
          {open ? "Hide ↑" : "How to apply ↓"}
        </button>
      </div>

      {open && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-stone-500 leading-relaxed rounded-xl bg-stone-50 px-4 py-3">
            {b.howToApply}
          </p>
          {b.plainLanguageNote && (
            <p className="text-xs text-stone-600 leading-relaxed rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-3">
              <span className="font-semibold text-amber-800">Example: </span>{b.plainLanguageNote}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function StateCard({ state }: { state: string }) {
  const data = STATE_INFO[state];
  if (!data) return null;
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-6">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-emerald-600 text-base select-none">⌂</span>
        <h3 className="font-serif text-base font-semibold text-stone-900">{data.title}</h3>
        <span className="ml-auto text-xs font-medium text-emerald-700">✓ Confirmed benefit</span>
      </div>
      <ul className="space-y-2 mb-3">
        {data.bullets.map((bullet, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-stone-600 leading-relaxed">
            <span className="text-emerald-500 mt-1 shrink-0 text-xs">●</span>
            {bullet}
          </li>
        ))}
      </ul>
      <p className="text-xs text-stone-400">
        How to apply: <span className="text-stone-600">{data.howToApply}</span>
      </p>
    </div>
  );
}

function DeadlineTimeline() {
  const groups = [
    {
      label: "Within 1 year of death",
      color: "red" as const,
      items: [
        "File DIC claim (VA Form 21P-534EZ) — missing this deadline loses retroactive pay to date of death",
        "File SGLI/VGLI life insurance claim (SGLV 8283) with OSGLI",
        "Apply for Social Security survivor benefits (1-800-772-1213)",
      ],
    },
    {
      label: "Within 2 years",
      color: "amber" as const,
      items: [
        "Apply for CHAMPVA healthcare coverage (VA Form 10-10d)",
        "Apply for surviving spouse property tax exemption transfer with your county",
        "File VA burial allowance claim (VA Form 21P-530EZ)",
      ],
    },
    {
      label: "Ongoing",
      color: "stone" as const,
      items: [
        "DEA / Fry Scholarship — apply when a dependent is ready to start school",
        "Update VA direct deposit and contact information",
        "Notify VA of any marital status changes (affects CHAMPVA and DIC)",
        "VA Home Loan — available when purchasing or refinancing a home",
      ],
    },
  ];

  const styles = {
    red: { dot: "bg-red-500", badge: "bg-red-50 border border-red-200 text-red-800", dash: "text-red-500" },
    amber: { dot: "bg-amber-500", badge: "bg-amber-50 border border-amber-200 text-amber-800", dash: "text-amber-500" },
    stone: { dot: "bg-stone-400", badge: "bg-stone-100 border border-stone-200 text-stone-600", dash: "text-stone-400" },
  };

  return (
    <div className="rounded-3xl border border-stone-200 bg-white px-8 py-8 shadow-sm">
      <div className="flex items-center gap-3 pb-4 border-b border-amber-100 mb-6">
        <span className="text-amber-500 select-none text-lg">◆</span>
        <h2 className="font-serif text-xl font-semibold text-stone-900">Critical Deadlines</h2>
      </div>
      <div className="space-y-6">
        {groups.map((g, gi) => {
          const s = styles[g.color];
          return (
            <div key={g.label} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`h-3 w-3 rounded-full shrink-0 mt-1 ${s.dot}`} />
                {gi < groups.length - 1 && <div className="flex-1 w-px bg-stone-200 mt-1" />}
              </div>
              <div className="pb-2 flex-1">
                <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold mb-2 ${s.badge}`}>
                  {g.label}
                </span>
                <ul className="space-y-1.5">
                  {g.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-stone-600 leading-relaxed">
                      <span className={`mt-1.5 shrink-0 ${s.dash}`}>—</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StreamingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {[1, 2, 3].map((s) => (
        <div key={s}>
          <div className="h-5 w-56 rounded bg-stone-200 mb-4" />
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-stone-100" />
            <div className="h-3 w-5/6 rounded bg-stone-100" />
            <div className="h-3 w-4/6 rounded bg-stone-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────

export default function BenefitsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [markdown, setMarkdown] = useState("");
  const [streamLoading, setStreamLoading] = useState(false);
  const [streamDone, setStreamDone] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function generate() {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setMarkdown("");
    setStreamDone(false);
    setStreamError(null);
    setStreamLoading(true);
    try {
      const res = await fetch("/api/benefits", { method: "POST", signal: ctrl.signal });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Failed to generate benefits report");
      }
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const cleaned = chunk.replace(/^---+\s*$/gm, "").replace(/^\*\*\*+\s*$/gm, "").replace(/^___+\s*$/gm, "");
        setMarkdown((prev) => prev + cleaned);
      }
      setStreamDone(true);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setStreamError(err.message ?? "Something went wrong.");
      }
    } finally {
      setStreamLoading(false);
    }
  }

  useEffect(() => {
    trackEvent("benefits_guide_viewed");
    fetch("/api/profile")
      .then((r) => r.ok ? r.json() : { profile: {} })
      .then((d) => setProfile(d.profile ?? {}))
      .catch(() => setProfile({}))
      .finally(() => setProfileLoading(false));
  }, []);

  // Start stream once profile is loaded
  useEffect(() => {
    if (!profileLoading) {
      generate();
    }
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileLoading]);

  const isMilitary = profile?.occupation_type === "military_veteran";
  const benefits = profile ? getBenefits(profile) : [];
  const hasHardcodedState = !!(profile?.state && STATE_INFO[profile.state]);

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <DashboardHeader />
      <main className="mx-auto max-w-6xl px-6 py-8 md:px-8 space-y-6">

        {/* Header */}
        <div className="rounded-3xl border border-stone-200 bg-gradient-to-br from-stone-800 to-stone-900 px-6 py-8 md:px-10 md:py-10 shadow-lg">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-600/40 bg-amber-600/20 px-3 py-1 text-xs font-medium text-amber-300 mb-4">
            ◆ Post-Death Survivor Benefits
          </div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">
            Family Benefits Guide
          </h1>
          <p className="mt-3 text-stone-300 text-sm leading-relaxed max-w-2xl">
            A personalized summary of every federal and state benefit your family may be entitled
            to after your passing — based on your service history, disability rating, and state.
          </p>
          {profile && (
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {profile.state && (
                <span className="rounded-full bg-stone-700 px-3 py-1 text-stone-300">⌂ {profile.state}</span>
              )}
              {profile.va_disability_rating && profile.va_disability_rating !== "none" && (
                <span className="rounded-full bg-stone-700 px-3 py-1 text-stone-300">
                  {profile.va_disability_rating}% Disability Rating
                </span>
              )}
              {profile.va_pt_designation === "yes" && (
                <span className="rounded-full bg-amber-700/60 px-3 py-1 text-amber-200">P&T Designation</span>
              )}
              {profile.service_connected_death === "yes" && (
                <span className="rounded-full bg-red-900/60 px-3 py-1 text-red-200">Service-Connected Death</span>
              )}
            </div>
          )}
          {streamDone && (
            <button
              onClick={generate}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-stone-600 bg-stone-700/50 px-4 py-2 text-sm font-medium text-stone-200 transition hover:bg-stone-600"
            >
              ↺ Regenerate Analysis
            </button>
          )}
        </div>

        {/* Profile incomplete notice */}
        {!profileLoading && !profile?.occupation_type && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 flex items-start gap-4">
            <span className="text-amber-500 text-xl select-none shrink-0 mt-0.5">◎</span>
            <div>
              <p className="text-sm font-semibold text-amber-900 mb-1">Complete your profile to see personalized benefits</p>
              <p className="text-sm text-amber-700 mb-3 leading-relaxed">
                Your profile helps us show only the benefits your family qualifies for — tailored to your state, service history, and disability rating.
              </p>
              <Link
                href="/profile-setup"
                className="inline-flex rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition"
              >
                Complete Profile →
              </Link>
            </div>
          </div>
        )}

        {/* Profile update reminder */}
        {!profileLoading && profile?.occupation_type && (
          <div className="rounded-2xl border border-stone-200 bg-stone-50 px-5 py-4 flex items-start gap-3">
            <span className="text-stone-400 text-base select-none shrink-0 mt-0.5">↻</span>
            <p className="text-xs text-stone-500 leading-relaxed">
              <strong className="text-stone-700">Keep your profile current.</strong> A VA disability rating increase,
              new P&amp;T designation, change in dependents, or remarriage can unlock additional benefits.{" "}
              <Link href="/profile-setup" className="text-amber-600 underline hover:text-amber-700">
                Update your profile →
              </Link>
            </p>
          </div>
        )}

        {/* Two-column layout on large screens */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* Left column — benefit cards & sections */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* Federal Benefits */}
            {!profileLoading && benefits.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-amber-500 select-none">✦</span>
                  <h2 className="font-serif text-xl font-semibold text-stone-900">Federal Survivor Benefits</h2>
                  <span className="ml-auto text-xs text-stone-400">{benefits.length} benefits identified</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {benefits.map((b) => <BenefitCard key={b.id} b={b} />)}
                </div>
              </section>
            )}

            {/* State Benefits */}
            {!profileLoading && profile?.state && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-amber-500 select-none">⌂</span>
                  <h2 className="font-serif text-xl font-semibold text-stone-900">
                    State Benefits — {profile.state}
                  </h2>
                </div>
                {hasHardcodedState ? (
                  <StateCard state={profile.state} />
                ) : (
                  <div className="rounded-2xl border border-amber-100 bg-amber-50/40 px-5 py-4">
                    <p className="text-sm text-amber-800 leading-relaxed">
                      State-specific survivor benefits for <strong>{profile.state}</strong> are included in the detailed
                      analysis to the right.
                    </p>
                    <p className="mt-1 text-xs text-amber-600">Verify with your state VA office</p>
                  </div>
                )}
                <StateEdSection profile={profile} />
              </section>
            )}

            {/* Organizations Here to Help */}
            {!profileLoading && profile && <OrgsSection profile={profile} />}

            {/* Digital Estate */}
            {!profileLoading && <DigitalEstateSection />}

            {/* Parks & Recreation note */}
            {isMilitary && (
              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-5 py-4 flex items-start gap-3">
                <span className="text-stone-400 text-base select-none shrink-0 mt-0.5">❋</span>
                <p className="text-xs text-stone-500 leading-relaxed">
                  After your passing, your family may qualify for additional recreation benefits based on cause of death.
                  Life Sentinel will surface these automatically for your Guardian.
                </p>
              </div>
            )}

            {/* RCSBP */}
            {!profileLoading && profile && <RcsbpSection profile={profile} />}

            {/* Deadlines */}
            {!profileLoading && <DeadlineTimeline />}

            {/* VSO Note */}
            {!profileLoading && (
              <div className="rounded-2xl border border-stone-200 bg-white px-6 py-5 flex items-start gap-4">
                <span className="text-amber-500 text-xl select-none shrink-0 mt-0.5">◎</span>
                <div>
                  <p className="text-sm font-semibold text-stone-900 mb-1">Need help filing?</p>
                  <p className="text-sm text-stone-500 leading-relaxed">
                    Veterans Service Organizations (VSOs) provide free claims assistance — they can help your
                    family file every claim at no cost.{" "}
                    <a
                      href="https://www.va.gov/decision-reviews/get-help-with-your-decision"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-600 underline hover:text-amber-700"
                    >
                      Find a VSO at va.gov
                    </a>
                  </p>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            {!profileLoading && (
              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-6 py-5">
                <p className="text-xs text-stone-500 leading-relaxed">
                  <span className="font-semibold text-stone-600">Disclaimer: </span>
                  This is a starting point for research, not legal or financial advice. Benefit amounts,
                  eligibility rules, and programs change over time. Always verify with the VA, SSA, your
                  state veterans affairs office, or a VA-accredited attorney before making decisions.
                </p>
              </div>
            )}

          </div>

          {/* Right column — AI Analysis (sticky sidebar) */}
          <div className="w-full lg:w-[420px] shrink-0">
            <div className="lg:sticky lg:top-6">
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-amber-500 select-none">◈</span>
                  <h2 className="font-serif text-xl font-semibold text-stone-900">Detailed Analysis</h2>
                  {streamLoading && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-stone-400 ml-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                      Generating…
                    </span>
                  )}
                </div>

                {streamError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5">
                    <p className="text-sm font-semibold text-red-900 mb-1">Unable to generate report</p>
                    <p className="text-sm text-red-700">{streamError}</p>
                    <button
                      onClick={generate}
                      className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {(streamLoading || markdown) && (
                  <div className="rounded-3xl border border-stone-200 bg-white px-5 py-6 md:px-6 md:py-7 shadow-sm max-h-[80vh] overflow-y-auto">
                    {streamLoading && !markdown && <StreamingSkeleton />}
                    {markdown && <BenefitsContent markdown={markdown} />}
                    {streamLoading && markdown && (
                      <div className="mt-4 flex items-center gap-2 text-xs text-stone-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                        Generating…
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
