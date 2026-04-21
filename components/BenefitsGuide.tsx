"use client";

import { useState } from "react";

export type Profile = {
  occupation_type?: string | null;
  va_disability_rating?: string | null;
  va_pt_designation?: string | null;
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
};

type StateInfo = {
  title: string;
  bullets: string[];
  howToApply: string;
};

// ── Hardcoded state data ───────────────────────────────────────────────

const STATE_INFO: Record<string, StateInfo> = {
  Virginia: {
    title: "Virginia — Property Tax & Income Tax Benefits",
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

export function getBenefits(p: Profile): BenefitDef[] {
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
    const dicElig: Eligibility | null =
      scDeath ? "yes" :
      (isPT || rating100 || scUnknown) ? "verify" : null;

    if (dicElig) {
      list.push({
        id: "dic",
        title: "DIC — Dependency & Indemnity Compensation",
        amount: "$1,699.36/month base rate (tax-free, for life)\n+$360.85/month if veteran was totally disabled 8+ years\n+$421.00/month per dependent child under 18",
        description: "Monthly tax-free compensation for the surviving spouse of a veteran whose death was service-connected, or who was totally disabled for a qualifying period. Surviving spouses who remarry after age 55 keep DIC.",
        eligibility: dicElig,
        form: "VA Form 21P-534EZ",
        contact: "VA: 1-800-827-1000",
        deadline: "File within 1 year of death to receive retroactive pay back to date of death",
        howToApply: "File VA Form 21P-534EZ with the VA Pension Management Center for your state. Apply at va.gov or call 1-800-827-1000.",
        confirmed: true,
      });
    }

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

      <div className="space-y-1 text-xs mb-3">
        {b.form && <p><span className="text-stone-400">Form: </span><span className="font-medium text-stone-700">{b.form}</span></p>}
        {b.contact && <p><span className="text-stone-400">Contact: </span><span className="text-stone-600">{b.contact}</span></p>}
        {b.deadline && <p className="font-medium text-red-600">⚠ Deadline: {b.deadline}</p>}
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
        <p className="mt-3 text-xs text-stone-500 leading-relaxed rounded-xl bg-stone-50 px-4 py-3">
          {b.howToApply}
        </p>
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

// ── RCSBP Card ─────────────────────────────────────────────────────────

function RcsbpCard({ profile, guardian = false }: { profile: Profile; guardian?: boolean }) {
  const election = profile.rcsbp_election;
  const isGrayArea = profile.collecting_retired_pay === "no";
  const baseLabel = profile.sbp_base_amount === "full" ? "full retired pay" : profile.sbp_base_amount === "reduced" ? "your elected reduced base amount" : "your elected base amount";
  const name = profile.full_name ?? "the veteran";

  const content = {
    option_c: {
      icon: "✓",
      color: "emerald",
      headline: guardian ? `${name} elected Immediate Annuity (Option C) — Your spouse is protected.` : "✓ Your spouse is protected now.",
      body: guardian
        ? `${name} elected an Immediate Annuity (Option C). Your monthly annuity begins the day after their death — at any age. Contact DFAS immediately at 1-800-321-1080 with the death certificate to start your annuity.`
        : `You elected an Immediate Annuity (Option C). If you die at any age — including during the gray area before age 60 — your spouse will begin receiving a monthly SBP annuity the day after your death.`,
      details: [
        `Monthly annuity: ~55% of ${baseLabel} (tax-free, for life)`,
        "Payments begin: the day after death — no waiting period",
        guardian ? "Have your DD Form 2656-5 (RCSBP election certificate) ready — it should be in the document vault" : "Store your DD Form 2656-5 (RCSBP election certificate) in this vault",
        "DFAS contact: 1-800-321-1080",
      ],
    },
    option_b: {
      icon: "⚠",
      color: "amber",
      headline: guardian ? `${name} elected Deferred Annuity (Option B) — Note the timing.` : "⚠ Coverage gap before age 60.",
      body: guardian
        ? `${name} elected a Deferred Annuity (Option B). Your annuity IS owed to you — but if ${name} died before age 60, payments won't begin until the date they would have turned 60. If they died after 60, contact DFAS now.`
        : `You elected a Deferred Annuity (Option B). Your spouse IS covered, but if you die before age 60, payments won't begin until the date you would have turned 60.`,
      details: [
        `Monthly annuity: ~55% of ${baseLabel} (when payments begin)`,
        "If death before 60: payments start on veteran's 60th birthday",
        "If death after 60: payments begin immediately",
        "DFAS contact: 1-800-321-1080",
      ],
    },
    option_a: {
      icon: "⚠",
      color: "red",
      headline: "⚠ No RCSBP coverage currently.",
      body: "You declined coverage at your 20-year letter (Option A). If you die before retired pay begins at age 60, your spouse will not receive an SBP annuity. However, when you begin collecting retired pay at age 60, you can enroll in standard SBP at that time.",
      details: [
        "No annuity if death occurs before age 60",
        "Action: Review SBP enrollment options when you reach retirement age",
        "Contact DFAS for options: 1-800-321-1080",
      ],
    },
    unknown: {
      icon: "❓",
      color: "amber",
      headline: "❓ RCSBP election unknown — action required.",
      body: "Your RCSBP election status is unclear. This is critical information for your family. Steps to find out:",
      details: [
        "Locate your DD Form 2656-5 (RCSBP Election Certificate) — store a copy in this vault",
        "Contact DFAS at 1-800-321-1080",
        "Log in to myPay at mypay.dfas.mil to view your SBP coverage",
        "Update your LifeSentinel profile once confirmed",
      ],
    },
  };

  const key = (election as keyof typeof content) ?? "unknown";
  const card = content[key] ?? content.unknown;

  const borderColor = card.color === "emerald" ? "border-emerald-200 bg-emerald-50/40"
    : card.color === "red" ? "border-red-200 bg-red-50"
    : "border-amber-200 bg-amber-50/40";

  return (
    <div className={`rounded-2xl border px-6 py-5 ${borderColor}`}>
      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
        <h3 className="font-serif text-base font-semibold text-stone-900">{card.headline}</h3>
        {isGrayArea && !guardian && (
          <span className="shrink-0 text-xs font-medium text-amber-700 bg-amber-100 border border-amber-200 rounded-full px-2.5 py-0.5">
            Gray Area Retiree
          </span>
        )}
      </div>
      <p className="text-sm text-stone-600 leading-relaxed mb-3">{card.body}</p>
      <ul className="space-y-1.5 text-sm text-stone-600">
        {card.details.map((d, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-amber-400 mt-1 shrink-0 text-xs">●</span>
            <span>{d}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RcsbpSection({ profile, guardian = false }: { profile: Profile; guardian?: boolean }) {
  if (profile.retirement_type !== "reserve_ng") return null;
  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-amber-500 select-none">◈</span>
        <h2 className="font-serif text-xl font-semibold text-stone-900">Reserve Retirement &amp; SBP/RCSBP</h2>
      </div>
      <RcsbpCard profile={profile} guardian={guardian} />
    </section>
  );
}

// ── Main exported component ────────────────────────────────────────────

export default function BenefitsGuide({
  profile,
  veteranName,
}: {
  profile: Profile;
  veteranName?: string | null;
}) {
  const benefits = getBenefits(profile);
  const stateHasData = profile.state ? !!STATE_INFO[profile.state] : false;
  const name = veteranName ?? "your loved one";

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 to-stone-50 px-8 py-8 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-amber-500 select-none text-lg">✦</span>
          <h2 className="font-serif text-2xl font-semibold text-stone-900">
            {veteranName ? `What Your Family Is Entitled To` : "Family Benefits Guide"}
          </h2>
        </div>
        <p className="text-sm text-stone-600 leading-relaxed max-w-2xl mt-2">
          {veteranName
            ? `Based on ${name}'s service and profile, here is a summary of the benefits your family may be entitled to. Review each one carefully — some have time-sensitive deadlines.`
            : "These are the federal and state benefits your family may be entitled to."
          }
        </p>
        <p className="text-sm text-stone-500 leading-relaxed max-w-2xl mt-3">
          Benefits marked{" "}
          <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-medium text-emerald-800">✓ Likely Qualifies</span>
          {" "}are based on the information on file.{" "}
          <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-medium text-amber-700">◎ Verify Eligibility</span>
          {" "}means confirm with the VA or a VSO before filing.
        </p>
      </div>

      {benefits.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-amber-500 select-none">✦</span>
            <h2 className="font-serif text-xl font-semibold text-stone-900">Federal Survivor Benefits</h2>
            <span className="ml-auto text-xs text-stone-400">{benefits.length} benefits identified</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {benefits.map((b) => <BenefitCard key={b.id} b={b} />)}
          </div>
        </section>
      )}

      {stateHasData && profile.state && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-emerald-600 select-none">⌂</span>
            <h2 className="font-serif text-xl font-semibold text-stone-900">State Benefits — {profile.state}</h2>
          </div>
          <StateCard state={profile.state} />
        </section>
      )}

      <RcsbpSection profile={profile} guardian={!!veteranName} />

      <DeadlineTimeline />

      <div className="rounded-2xl border border-amber-100 bg-amber-50/60 px-6 py-5 space-y-2">
        <p className="text-sm font-semibold text-stone-700">Need help filing claims?</p>
        <p className="text-sm text-stone-600 leading-relaxed">
          Veterans Service Organizations (VSOs) provide free assistance filing VA claims — no cost to you, ever.
          Find one near you at{" "}
          <a href="https://www.va.gov/decision-reviews/get-help-with-your-decision" target="_blank" rel="noopener noreferrer" className="text-amber-600 underline">
            va.gov/decision-reviews/get-help-with-your-decision
          </a>.
        </p>
        <p className="text-xs text-stone-400 leading-relaxed pt-1">
          This is a starting point for research, not legal or financial advice. Always verify eligibility with the VA or a VSO before filing.
        </p>
      </div>
    </div>
  );
}
