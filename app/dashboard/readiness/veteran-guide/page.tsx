"use client";

import Link from "next/link";
import { useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";

type DocGuide = {
  id: string;
  title: string;
  abbr?: string;
  category: "Military" | "VA" | "Insurance" | "Legal" | "Finance";
  priority: "critical" | "important" | "helpful";
  summary: string;
  whyItMatters: string;
  whatItUnlocks: string[];
  ifMissing: string;
  contact?: string;
  deadline?: string;
};

const GUIDES: DocGuide[] = [
  {
    id: "dd214",
    title: "Certificate of Release or Discharge from Active Duty",
    abbr: "DD-214",
    category: "Military",
    priority: "critical",
    summary:
      "The single most important document a veteran's family will ever need. It is the official record of military service.",
    whyItMatters:
      "Without a DD-214, a family cannot claim virtually any veteran benefit, request burial with military honors, or establish a veteran's service history for any official purpose. It is the foundation of everything else.",
    whatItUnlocks: [
      "Burial in a national cemetery",
      "Military funeral honors (flag, bugler)",
      "VA burial allowance",
      "VA home loan Certificate of Eligibility",
      "GI Bill education benefits for dependents",
      "Almost all VA benefits claims",
      "State veteran license plates and discounts",
    ],
    ifMissing:
      "Request from the National Archives via eVetRecs at archives.gov/veterans/military-service-records. Processing takes 1–3 months standard, or 2–4 weeks with expedite for a medical emergency. You can also visit your nearest VA Regional Office for assistance.",
    contact: "National Archives: 1-86-NARA-NARA (1-866-272-6272)",
    deadline: "No deadline, but needed before filing most claims",
  },
  {
    id: "va-rating",
    title: "VA Rating Decision Letter",
    category: "VA",
    priority: "critical",
    summary:
      "The official VA letter stating the veteran's combined disability rating (0%–100%) and which conditions are service-connected.",
    whyItMatters:
      "The rating percentage determines survivor benefit amounts and eligibility. A 100% Permanent & Total (P&T) rating means CHAMPVA healthcare for all dependents, higher DIC payments, and additional state benefits. This letter is the key that unlocks most survivor benefits.",
    whatItUnlocks: [
      "CHAMPVA health coverage for dependents (requires 100% P&T)",
      "DIC compensation amounts (higher rating = higher payment)",
      "Property tax exemptions in many states",
      "State veterans bonus programs",
      "Priority VA healthcare enrollment",
    ],
    ifMissing:
      "Request from your VA Regional Office or download from va.gov (sign in → My VA → letters). A VSO can pull it on your behalf. If the veteran was recently rated, the decision is mailed and may be in the Legal or VA section of the vault.",
    contact: "VA: 1-800-827-1000",
  },
  {
    id: "sbp",
    title: "Survivor Benefit Plan Election Certificate",
    abbr: "SBP",
    category: "Military",
    priority: "critical",
    summary:
      "Documents the veteran's election to enroll their spouse or dependents in the Survivor Benefit Plan at retirement.",
    whyItMatters:
      "SBP pays the surviving spouse 55% of the veteran's retirement pay for life. This election is made once at retirement and is generally irrevocable. Without knowing an election was made, many families miss years of monthly payments worth tens of thousands of dollars.",
    whatItUnlocks: [
      "Monthly SBP annuity (55% of retirement pay, for life)",
      "TRICARE coverage under Survivor Benefit Plan",
      "Cost-of-living-adjusted payments",
    ],
    ifMissing:
      "Contact DFAS (Defense Finance and Accounting Service) at 1-888-332-7411. Request a copy of the retirement election. A VSO or JAG officer can assist. Note: if no election was made at retirement, SBP coverage does not exist — but verify before assuming.",
    contact: "DFAS: 1-888-332-7411",
    deadline: "SBP elections are made at retirement and cannot be changed after 1 year",
  },
  {
    id: "retirement-orders",
    title: "Military Retirement Orders",
    category: "Military",
    priority: "important",
    summary:
      "The official orders confirming the veteran's retirement date, rank, and pay grade.",
    whyItMatters:
      "Retirement orders establish the pay grade used to calculate SBP annuity amounts and confirm retirement status for DFAS processing. Without them, calculating the correct benefit amount is difficult and delays can occur.",
    whatItUnlocks: [
      "SBP payment amount calculations",
      "DFAS processing of survivor benefits",
      "State retirement benefit verification",
    ],
    ifMissing:
      "Contact the veteran's branch of service records center or the National Personnel Records Center (NPRC) in St. Louis via archives.gov. DFAS may also have a copy on file.",
    contact: "NPRC: 1-866-272-6272",
  },
  {
    id: "dic",
    title: "VA Award Letter — Compensation & Pension",
    category: "VA",
    priority: "critical",
    summary:
      "The monthly letters from the VA showing what compensation or pension the veteran was receiving.",
    whyItMatters:
      "Award letters establish the baseline for calculating Dependency and Indemnity Compensation (DIC) after death. They also confirm the veteran was receiving VA compensation, which may affect DIC eligibility. Keep the most recent letter.",
    whatItUnlocks: [
      "DIC claim processing baseline",
      "Proof of VA compensation receipt",
      "Verification of service-connected conditions",
    ],
    ifMissing:
      "Download from va.gov (sign in → My VA → letters → Benefit Summary and Service Verification Letter). Or request from your VA Regional Office. A VSO can also pull this on your behalf.",
    contact: "VA: 1-800-827-1000",
  },
  {
    id: "champva",
    title: "CHAMPVA Enrollment & Eligibility Documents",
    abbr: "CHAMPVA",
    category: "VA",
    priority: "important",
    summary:
      "Documents confirming enrollment in CHAMPVA — the VA's healthcare program for dependents of permanently and totally disabled veterans.",
    whyItMatters:
      "CHAMPVA provides comprehensive health coverage to dependents when the veteran was rated 100% P&T, or died from a service-connected condition. Many eligible families don't know they qualify, or delay applying and lose retroactive coverage. Coverage is not automatic — it must be applied for.",
    whatItUnlocks: [
      "Healthcare coverage for eligible dependents",
      "Pharmacy benefits",
      "Mental health and preventive care",
      "Coverage for children up to age 23 (if full-time student)",
    ],
    ifMissing:
      "Apply using VA Form 10-10d, available at va.gov. Call the CHAMPVA Center at 1-800-733-8387. Surviving spouses who remarry before age 55 lose eligibility; those who remarry at 55 or older retain it.",
    contact: "CHAMPVA Center: 1-800-733-8387",
    deadline: "No strict deadline, but coverage is not retroactive — apply as soon as eligible",
  },
  {
    id: "sgli",
    title: "Service Members' Group Life Insurance Policy",
    abbr: "SGLI / VGLI",
    category: "Insurance",
    priority: "critical",
    summary:
      "Government-sponsored life insurance available to service members (SGLI) and veterans (VGLI — Veterans' Group Life Insurance).",
    whyItMatters:
      "SGLI provides up to $500,000 in life insurance coverage. At separation, veterans have 1 year and 120 days to convert to VGLI without a medical exam. Many families don't know a policy exists or who the beneficiaries are.",
    whatItUnlocks: [
      "Lump-sum life insurance benefit (up to $500,000)",
      "Tax-free death benefit to named beneficiaries",
    ],
    ifMissing:
      "Contact the Office of Servicemembers' Group Life Insurance (OSGLI) at 1-800-419-1473. They can confirm coverage and initiate a claim. The beneficiary designation on file at separation determines who receives the benefit — not the will.",
    contact: "OSGLI: 1-800-419-1473",
    deadline: "Claims should be filed as soon as possible after death",
  },
  {
    id: "burial-docs",
    title: "Pre-Arranged Burial or Funeral Documents",
    category: "Legal",
    priority: "important",
    summary:
      "Any pre-paid funeral contracts, burial preferences, or documentation of the veteran's wishes for final arrangements.",
    whyItMatters:
      "Veterans are entitled to burial in a national cemetery at no cost, with a headstone provided by the VA. If the veteran had preferences or pre-paid arrangements, these should be documented and accessible immediately — families often make costly duplicate arrangements without knowing.",
    whatItUnlocks: [
      "Burial in a national cemetery (free for eligible veterans)",
      "VA-provided headstone or grave marker",
      "Military funeral honors",
      "VA burial allowance for eligible cases",
    ],
    ifMissing:
      "Contact the National Cemetery Scheduling Office at 1-800-535-1117. Any VA medical center can also confirm burial eligibility based on the DD-214.",
    contact: "National Cemetery Scheduling: 1-800-535-1117",
  },
  {
    id: "advance-directive",
    title: "Advance Directive / Living Will",
    category: "Legal",
    priority: "important",
    summary:
      "Legal documents stating the veteran's wishes for end-of-life medical care, and designating a healthcare proxy.",
    whyItMatters:
      "Without an advance directive, medical decisions may be made by the hospital or state law — not by family. The VA encourages all veterans to complete a VA Advance Directive (VA Form 10-0137). A healthcare proxy gives someone legal authority to make medical decisions.",
    whatItUnlocks: [
      "Family authority for medical decisions",
      "Alignment of care with the veteran's wishes",
      "Reduced burden on family during a crisis",
    ],
    ifMissing:
      "Complete VA Form 10-0137 at any VA facility or va.gov. For a general advance directive, many states provide free templates. An estate attorney can prepare a durable power of attorney for healthcare.",
    contact: "VA: 1-800-827-1000",
  },
];

const PRIORITY_STYLES = {
  critical: { label: "Critical", classes: "bg-red-50 border-red-200 text-red-700" },
  important: { label: "Important", classes: "bg-amber-50 border-amber-200 text-amber-800" },
  helpful: { label: "Helpful", classes: "bg-stone-100 border-stone-200 text-stone-600" },
};

const CATEGORY_COLORS: Record<string, string> = {
  Military: "bg-emerald-50 border-emerald-200 text-emerald-800",
  VA: "bg-blue-50 border-blue-200 text-blue-800",
  Insurance: "bg-sky-50 border-sky-200 text-sky-800",
  Legal: "bg-amber-50 border-amber-200 text-amber-800",
  Finance: "bg-orange-50 border-orange-200 text-orange-800",
};

export default function VeteranGuidePage() {
  const [open, setOpen] = useState<string | null>(null);

  function toggle(id: string) {
    setOpen((prev) => (prev === id ? null : id));
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <DashboardHeader />
      <main className="mx-auto max-w-3xl px-6 py-8 md:px-8 space-y-8">

        {/* Header */}
        <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50/60 to-stone-50 px-8 py-10 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800 mb-4">
            ✦ Veterans & Military Families
          </div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-stone-900 md:text-4xl">
            Veteran Document Guide
          </h1>
          <p className="mt-3 text-stone-500 text-sm leading-relaxed max-w-xl md:text-base">
            The documents that matter most for veteran families — what each one is,
            why it matters, what benefits it unlocks, and exactly what to do if it&rsquo;s missing.
          </p>
        </div>

        {/* Survivor checklist callout */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 flex items-start gap-4">
          <div className="shrink-0 text-amber-600 text-xl select-none mt-0.5">◈</div>
          <div>
            <div className="text-sm font-semibold text-amber-900">Need step-by-step guidance?</div>
            <p className="mt-1 text-sm text-amber-800 leading-relaxed">
              The{" "}
              <Link href="/dashboard/readiness/survivor" className="underline font-medium hover:text-amber-900">
                Survivor&rsquo;s Checklist
              </Link>{" "}
              walks through exactly what to do and when — from the first 48 hours through the first 90 days and beyond.
            </p>
          </div>
        </div>

        {/* Priority legend */}
        <div className="flex flex-wrap gap-3 text-xs">
          {Object.entries(PRIORITY_STYLES).map(([key, val]) => (
            <span key={key} className={`rounded-full border px-3 py-1 font-medium ${val.classes}`}>
              {val.label}
            </span>
          ))}
          <span className="text-stone-400 self-center">— how urgently your family needs this document</span>
        </div>

        {/* Document cards */}
        <div className="space-y-4">
          {GUIDES.map((doc) => {
            const isOpen = open === doc.id;
            const priority = PRIORITY_STYLES[doc.priority];
            const catColor = CATEGORY_COLORS[doc.category] ?? "bg-stone-100 border-stone-200 text-stone-600";

            return (
              <div
                key={doc.id}
                className={`rounded-2xl border bg-white shadow-sm overflow-hidden transition-shadow ${isOpen ? "shadow-md" : "hover:shadow-md"}`}
              >
                {/* Card header — always visible */}
                <button
                  onClick={() => toggle(doc.id)}
                  className="w-full text-left px-6 py-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${priority.classes}`}>
                          {priority.label}
                        </span>
                        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${catColor}`}>
                          {doc.category}
                        </span>
                        {doc.abbr && (
                          <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-0.5 text-xs font-mono font-semibold text-stone-600">
                            {doc.abbr}
                          </span>
                        )}
                      </div>
                      <h2 className="font-serif text-lg font-semibold text-stone-900 leading-snug">
                        {doc.title}
                      </h2>
                      <p className="mt-1.5 text-sm text-stone-500 leading-relaxed">
                        {doc.summary}
                      </p>
                    </div>
                    <div className={`shrink-0 mt-1 text-stone-400 transition-transform ${isOpen ? "rotate-180" : ""}`}>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Expanded content */}
                {isOpen && (
                  <div className="border-t border-stone-100 px-6 pb-6 pt-5 space-y-5">

                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-2">
                        Why it matters
                      </div>
                      <p className="text-sm text-stone-600 leading-relaxed">{doc.whyItMatters}</p>
                    </div>

                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-3">
                        What it unlocks
                      </div>
                      <ul className="space-y-2">
                        {doc.whatItUnlocks.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-stone-600">
                            <span className="shrink-0 mt-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-xl border border-stone-100 bg-stone-50 px-4 py-4">
                      <div className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-2">
                        If this document is missing
                      </div>
                      <p className="text-sm text-stone-600 leading-relaxed">{doc.ifMissing}</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {doc.contact && (
                        <div className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-600">
                          📞 {doc.contact}
                        </div>
                      )}
                      {doc.deadline && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                          ⏱ {doc.deadline}
                        </div>
                      )}
                      <Link
                        href="/dashboard/readiness/documents"
                        className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 hover:bg-amber-100 transition"
                      >
                        Add to {doc.category} category →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="rounded-2xl border border-stone-200 bg-stone-50 px-6 py-5 text-sm text-stone-500 leading-relaxed">
          <span className="font-medium text-stone-700">Remember:</span> VSOs like the DAV, VFW,
          and American Legion provide free, accredited claims assistance. A VSO representative
          can help you locate missing documents, file claims, and navigate the VA system at
          no cost to you. Find your nearest VSO at va.gov/vso.
        </div>

      </main>
    </div>
  );
}
