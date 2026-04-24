"use client";

import { useState, useEffect } from "react";

export type Profile = {
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
  retirement_branch?: string | null;
  primary_service_branch?: string | null;
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

function getDicEnhancementNote(ptAwardDate: string | null | undefined, isPT: boolean): string | undefined {
  if (!isPT) return undefined;
  if (!ptAwardDate) return "? 8-Year Enhancement — P&T Award Date not on file. Add your P&T award date to your profile to see if you qualify for the +$360.85/month enhancement.";
  const award = new Date(ptAwardDate);
  const today = new Date("2026-04-20");
  const msPerYear = 1000 * 60 * 60 * 24 * 365.25;
  const yearsHeld = (today.getTime() - award.getTime()) / msPerYear;
  if (yearsHeld >= 8) {
    return "✓ 8-Year Enhancement Confirmed — your spouse qualifies for the additional +$360.85/month, bringing total DIC to $2,060.21/month.";
  }
  const qualifyDate = new Date(award.getTime() + 8 * msPerYear);
  const qualifyStr = qualifyDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  return `⚠ 8-Year Enhancement Not Yet Reached — qualifies on ${qualifyStr}. Until then, the base DIC rate of $1,699.36/month applies.`;
}

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

export function VmsdepCard() {
  return (
    <div className="rounded-2xl border border-emerald-300 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-emerald-600 text-base select-none">⌂</span>
        <h3 className="font-serif text-base font-semibold text-stone-900">
          VMSDEP — Virginia Military Survivors &amp; Dependents Education Program
        </h3>
        <span className="ml-auto text-xs font-medium text-emerald-700">✓ Confirmed Virginia state benefit</span>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 mb-5">
        <p className="text-xs font-semibold text-amber-900 mb-1">Federal program interaction</p>
        <ul className="space-y-1.5 mt-1">
          {[
            "DEA (Chapter 35) — can be used alongside VMSDEP. It pays cash directly to the dependent or spouse, not to the school, so there is no tuition conflict.",
            "Fry Scholarship / Chapter 33 — not recommended to stack with VMSDEP. Both pay tuition directly to the school, creating overlap and potential conflicts.",
            "Elect VMSDEP first — it does not require an irrevocable election. Evaluate federal options after VMSDEP is in place.",
          ].map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-amber-800 leading-relaxed">
              <span className="text-amber-500 mt-0.5 shrink-0">●</span>
              {b}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-sm font-medium text-stone-700 mb-2">What it provides</p>
      <ul className="space-y-1.5 mb-5">
        {[
          "Full tuition and mandatory fee waiver for 8 semesters (4 academic years) at any Virginia public college or university",
          "Semester stipend to offset room, board, books, and supplies (amount varies annually)",
          "Covers surviving spouse (any age) and dependent children ages 16–29",
        ].map((b, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-stone-600 leading-relaxed">
            <span className="text-emerald-500 mt-1 shrink-0 text-xs">●</span>
            {b}
          </li>
        ))}
      </ul>

      <p className="text-sm font-medium text-stone-700 mb-2">Eligibility</p>
      <ul className="space-y-1.5 mb-5">
        {[
          "Veteran rated 90%+ permanently disabled OR 100% P&T due to military service, OR service member killed, missing in action, or taken prisoner",
          "Veteran and dependent must have resided in Virginia for at least 5 years",
        ].map((b, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-stone-600 leading-relaxed">
            <span className="text-emerald-500 mt-1 shrink-0 text-xs">●</span>
            {b}
          </li>
        ))}
      </ul>

      <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 mb-4">
        <p className="text-xs font-semibold text-stone-700 mb-1">Enrollment reminder</p>
        <p className="text-xs text-stone-600 leading-relaxed">
          Students must update enrollment in the VMSDEP portal <strong>every semester</strong> — it is not automatic.
          Missing the enrollment deadline means losing that semester&apos;s waiver.
        </p>
      </div>

      <div className="space-y-0.5 text-xs text-stone-500">
        <p><span className="text-stone-400">Apply: </span><span className="text-stone-600">dvs.virginia.gov</span></p>
        <p><span className="text-stone-400">Email: </span><span className="text-stone-600">vmsdep@dvs.virginia.gov</span></p>
        <p><span className="text-stone-400">Phone: </span><span className="text-stone-600">804-225-2083 (Mon–Fri 8am–4:30pm)</span></p>
      </div>
    </div>
  );
}

// ── State Education Benefits ───────────────────────────────────────────

function EdBullet({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2 text-sm text-stone-600 leading-relaxed">
      <span className="text-emerald-500 mt-1 shrink-0 text-xs">●</span>
      {text}
    </li>
  );
}

function EdCardShell({ title, label, contact, children }: {
  title: string;
  label: string;
  contact: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-emerald-300 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <h3 className="font-serif text-base font-semibold text-stone-900 flex-1">{title}</h3>
        <span className="text-xs font-medium text-emerald-700">{label}</span>
      </div>
      {children}
      <div className="mt-4 pt-3 border-t border-stone-100 space-y-0.5 text-xs text-stone-500">
        {contact}
      </div>
    </div>
  );
}

function HazlewoodCard() {
  return (
    <EdCardShell
      title="Hazlewood Act — Texas Education Benefit"
      label="✓ Confirmed Texas state benefit"
      contact={
        <>
          <p><span className="text-stone-400">Apply: </span>Texas Veterans Commission — tvc.texas.gov</p>
          <p><span className="text-stone-400">Phone: </span>800-252-8387</p>
        </>
      }
    >
      <ul className="space-y-1.5 mb-4">
        {[
          "Full tuition and most fee exemption — up to 150 semester credit hours at Texas public colleges",
          "Eligible: spouse and dependent children of veterans who died in the line of duty, are MIA/POW, or are totally disabled for employability",
          "Hazlewood Legacy Program: veteran can transfer unused hours to dependent children",
          "Does NOT cover: living expenses, books, supplies, or service fees",
        ].map((b, i) => <EdBullet key={i} text={b} />)}
      </ul>
    </EdCardShell>
  );
}

function FloridaCsddvCard() {
  return (
    <EdCardShell
      title="CSDDV Scholarship — Florida Education Benefit"
      label="✓ Confirmed Florida state benefit"
      contact={
        <>
          <p><span className="text-stone-400">Apply: </span>floridastudentfinancialaid.org</p>
          <p><span className="text-stone-400">Phone: </span>888-827-2004</p>
        </>
      }
    >
      <ul className="space-y-1.5 mb-4">
        {[
          "Scholarships for Children and Spouses of Deceased or Disabled Veterans (CSDDV)",
          "Covers tuition and fees at Florida public colleges and universities",
          "Eligible: dependent children and spouses of veterans who died from service-connected disability OR who are 100% P&T",
          "Death Benefits Program: spouses/dependents of deceased Florida National Guard and Armed Forces members — up to 120 credit hours tuition waiver",
        ].map((b, i) => <EdBullet key={i} text={b} />)}
      </ul>
    </EdCardShell>
  );
}

function CalVetCard() {
  return (
    <EdCardShell
      title="CalVet College Fee Waiver — California Education Benefit"
      label="✓ Confirmed California state benefit"
      contact={
        <>
          <p><span className="text-stone-400">Apply: </span>calvet.ca.gov</p>
          <p><span className="text-stone-400">Also: </span>Local County Veteran Service Officer (CVSO)</p>
        </>
      }
    >
      <ul className="space-y-1.5 mb-4">
        {[
          "Waives mandatory system-wide tuition and fees at any California Community College, CSU, or UC campus",
          "Plan A: unmarried child (14–27) or spouse of totally service-connected disabled veteran OR surviving unremarried spouse of service-connected death",
          "Plan B: child of veteran who died of service-connected disability (income limit applies — $22,273 for 2025–26)",
          "Does NOT cover: books, parking, or room and board",
        ].map((b, i) => <EdBullet key={i} text={b} />)}
      </ul>
    </EdCardShell>
  );
}

function NcScholarshipCard() {
  return (
    <EdCardShell
      title="NC Scholarship for Children of Wartime Veterans"
      label="✓ Confirmed North Carolina state benefit"
      contact={
        <p><span className="text-stone-400">Apply: </span>NC Division of Veterans Affairs — milvets.nc.gov</p>
      }
    >
      <ul className="space-y-1.5 mb-4">
        {[
          "Free tuition for 8 semesters at North Carolina state colleges — covers tuition, room, board, and fees",
          "Eligible: children of wartime veterans who are 100% disabled or died in service",
          "Child must be under 25 at time of application",
          "Qualifying criteria must have occurred during a period of war",
        ].map((b, i) => <EdBullet key={i} text={b} />)}
      </ul>
    </EdCardShell>
  );
}

function parseEdInline(text: string): React.ReactNode[] {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((p, i) =>
    i % 2 === 1 ? <strong key={i} className="font-semibold text-stone-800">{p}</strong> : p
  );
}

function parseEdMarkdown(raw: string) {
  const lines = raw.split("\n");
  const nodes: Array<{ type: "ul"; items: string[] } | { type: "p"; text: string }> = [];
  let buf: string[] = [];
  function flush() { if (buf.length) { nodes.push({ type: "ul", items: [...buf] }); buf = []; } }
  for (const line of lines) {
    if (/^[-*] /.test(line)) { buf.push(line.slice(2)); }
    else if (line.trim() === "" || line.startsWith("#")) { flush(); }
    else { flush(); nodes.push({ type: "p", text: line }); }
  }
  flush();
  return nodes;
}

function StateEdAiCard({ profile }: { profile: Profile }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/state-education", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            state: profile.state,
            isPT: profile.va_pt_designation === "yes",
            rating: profile.va_disability_rating,
            scDeath: profile.service_connected_death === "yes",
          }),
        });
        if (!res.ok || !res.body) throw new Error("Failed");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (!cancelled) setContent((prev) => prev + decoder.decode(value, { stream: true }));
        }
      } catch {
        if (!cancelled) setFetchError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [profile.state, profile.va_pt_designation, profile.va_disability_rating, profile.service_connected_death]);

  const nodes = parseEdMarkdown(content);

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <h3 className="font-serif text-base font-semibold text-stone-900 flex-1">
          {profile.state} — Education Benefits for Surviving Families
        </h3>
        <span className="text-xs font-medium text-amber-600">◎ Verify with your state veterans affairs office</span>
      </div>
      {loading && !content && (
        <div className="space-y-2 animate-pulse">
          <div className="h-3 bg-stone-100 rounded w-4/5" />
          <div className="h-3 bg-stone-100 rounded w-3/5" />
          <div className="h-3 bg-stone-100 rounded w-4/5" />
        </div>
      )}
      {fetchError && (
        <p className="text-sm text-stone-500">Unable to load state-specific education benefits. Check with your state veterans affairs office.</p>
      )}
      {content && (
        <div className="space-y-2">
          {nodes.map((node, i) =>
            node.type === "ul" ? (
              <ul key={i} className="space-y-1.5">
                {node.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-stone-600 leading-relaxed">
                    <span className="text-amber-400 mt-1 shrink-0 text-xs">●</span>
                    <span>{parseEdInline(item)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p key={i} className="text-sm text-stone-600 leading-relaxed">{parseEdInline(node.text)}</p>
            )
          )}
          {loading && (
            <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              Loading…
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const HARDCODED_ED_STATES = ["Virginia", "Texas", "Florida", "California", "North Carolina"];

export function StateEdSection({ profile }: { profile: Profile }) {
  const state = profile.state;
  if (!state) return null;

  const isMilitary = profile.occupation_type === "military_veteran";
  const isPT = profile.va_pt_designation === "yes";
  const scDeath = profile.service_connected_death === "yes";
  const rating = profile.va_disability_rating ?? "";
  const rating90plus = ["90", "100"].includes(rating);
  const rating100 = rating === "100";

  let card: React.ReactNode = null;

  // Hardcoded state cards — eligibility conditions are inherently military-specific
  if (state === "Virginia") {
    card = <VmsdepCard />;
  } else if (state === "Texas" && (scDeath || rating100 || isPT)) {
    card = <HazlewoodCard />;
  } else if (state === "Florida" && (isPT || scDeath)) {
    card = <FloridaCsddvCard />;
  } else if (state === "California" && (scDeath || rating100)) {
    card = <CalVetCard />;
  } else if (state === "North Carolina" && (scDeath || rating100)) {
    card = <NcScholarshipCard />;
  } else if (state && !HARDCODED_ED_STATES.includes(state) && isMilitary) {
    // AI card only for military profiles in non-hardcoded states
    card = <StateEdAiCard profile={profile} />;
  }

  if (!card) return null;

  return (
    <div className="mt-5 pt-5 border-t border-stone-100">
      <p className="text-sm font-semibold text-stone-700 mb-1">Education Benefits</p>
      <p className="text-xs text-stone-500 leading-relaxed mb-3">
        Free or reduced college tuition for surviving spouses and dependent children — separate from and stackable with DEA (Chapter 35).
      </p>
      {card}
    </div>
  );
}

// ── VSO / Nonprofit Organizations ────────────────────────────────────

type OrgDef = {
  id: string;
  name: string;
  tagline: string;
  what: string[];
  contact?: string;
  website: string;
  websiteLabel?: string;
  highlight?: boolean;
};

function getOrgs(p: Profile): OrgDef[] {
  const isFirstResponder = p.occupation_type === "law_enforcement" || p.occupation_type === "firefighter";
  const isLineOfDuty = p.service_connected_death === "yes";
  const hasMarine = Array.isArray(p.branches_served) && p.branches_served.includes("marines");

  const orgs: OrgDef[] = [];

  if (isLineOfDuty || isFirstResponder) {
    orgs.push({
      id: "t2t",
      name: "Tunnel to Towers Foundation",
      tagline: "May pay off your mortgage — apply immediately",
      what: isFirstResponder
        ? [
            "Fallen First Responder Home Program — pays off the mortgage for a surviving spouse with dependent children",
            "Smart Home Program — mortgage-free smart homes for catastrophically injured first responders",
          ]
        : [
            "Gold Star Family Home Program — pays off the mortgage for a surviving spouse with dependent children when a service member dies in the line of duty",
            "Smart Home Program — mortgage-free smart homes for catastrophically injured veterans",
          ],
      contact: "1-718-987-1931",
      website: "t2t.org",
      highlight: true,
    });
  }

  orgs.push({
    id: "taps",
    name: "TAPS — Tragedy Assistance Program for Survivors",
    tagline: "Free support for all military surviving families",
    what: [
      "Free peer-based emotional support for all who have lost a military loved one",
      "Good Grief Camps for children of fallen service members",
      "Survivor seminars and retreats nationwide",
      "24/7 crisis support line: 1-800-959-8277",
    ],
    contact: "1-800-959-8277 (24/7)",
    website: "taps.org",
  });

  orgs.push({
    id: "wwp",
    name: "Wounded Warrior Project — Survivor Outreach Services",
    tagline: "Free — contact to connect with a support coordinator",
    what: [
      "Connects surviving families with dedicated support coordinators",
      "Financial assistance programs",
      "Mental health and counseling resources",
      "Caregiver support programs",
    ],
    website: "woundedwarriorproject.org/programs/survivor-outreach-services",
    websiteLabel: "woundedwarriorproject.org",
  });

  if (hasMarine) {
    orgs.push({
      id: "mcsf",
      name: "Marine Corps Scholarship Foundation",
      tagline: "Scholarships for children of Marines",
      what: [
        "Education scholarships for children of Marines and FMF Corpsmen",
        "Need-based scholarships for undergraduate and vocational programs",
      ],
      website: "mcsf.org",
    });
  }

  orgs.push({
    id: "gsw",
    name: "Gold Star Wives of America",
    tagline: "Support network specifically for surviving spouses",
    what: [
      "Peer support network and advocacy for surviving military spouses",
      "Local chapters nationwide",
    ],
    website: "goldstarwives.org",
  });

  orgs.push({
    id: "hftw",
    name: "Hope For The Warriors",
    tagline: "Transition and wellness support for surviving families",
    what: [
      "Transition and wellness support for service members and families",
      "Spouse and caregiver support programs",
    ],
    website: "hopeforthewarriors.org",
  });

  return orgs;
}

function OrgCard({ org }: { org: OrgDef }) {
  if (org.highlight) {
    return (
      <div className="col-span-full rounded-2xl border-2 border-rose-300 bg-gradient-to-br from-rose-50 to-amber-50 p-6 shadow-sm">
        <div className="flex flex-wrap items-start gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <span className="inline-flex items-center rounded-full bg-rose-100 border border-rose-300 px-2.5 py-0.5 text-xs font-semibold text-rose-800 mb-2">
              ⚡ Act Immediately
            </span>
            <h3 className="font-serif text-lg font-semibold text-stone-900">{org.name}</h3>
            <p className="text-sm font-medium text-rose-700 mt-0.5">{org.tagline}</p>
          </div>
        </div>
        <ul className="space-y-2 mb-4">
          {org.what.map((w, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-stone-700 leading-relaxed">
              <span className="text-rose-400 mt-1 shrink-0 text-xs">●</span>
              {w}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
          {org.contact && (
            <p><span className="text-stone-400">Phone: </span><span className="font-medium text-stone-700">{org.contact}</span></p>
          )}
          <p>
            <span className="text-stone-400">Website: </span>
            <a href={`https://${org.website}`} target="_blank" rel="noopener noreferrer" className="font-medium text-amber-700 underline hover:text-amber-800">
              {org.websiteLabel ?? org.website}
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <h3 className="font-serif text-base font-semibold text-stone-900 mb-0.5">{org.name}</h3>
      <p className="text-xs font-medium text-amber-700 mb-3">{org.tagline}</p>
      <ul className="space-y-1.5 mb-4">
        {org.what.map((w, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-stone-500 leading-relaxed">
            <span className="text-stone-300 mt-1 shrink-0">●</span>
            {w}
          </li>
        ))}
      </ul>
      <div className="space-y-0.5 text-xs">
        {org.contact && (
          <p><span className="text-stone-400">Contact: </span><span className="text-stone-600">{org.contact}</span></p>
        )}
        <p>
          <span className="text-stone-400">Website: </span>
          <a href={`https://${org.website}`} target="_blank" rel="noopener noreferrer" className="text-amber-600 underline hover:text-amber-700">
            {org.websiteLabel ?? org.website}
          </a>
        </p>
      </div>
    </div>
  );
}

export function OrgsSection({ profile }: { profile: Profile }) {
  const orgs = getOrgs(profile);
  return (
    <section>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-amber-500 select-none">◈</span>
        <h2 className="font-serif text-xl font-semibold text-stone-900">Organizations Here to Help</h2>
      </div>
      <p className="text-sm text-stone-500 leading-relaxed mb-5">
        Beyond government benefits, these organizations exist specifically to support families like yours. All services listed are free.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {orgs.map((org) => <OrgCard key={org.id} org={org} />)}
      </div>
    </section>
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
          <StateEdSection profile={profile} />
        </section>
      )}

      <OrgsSection profile={profile} />

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
