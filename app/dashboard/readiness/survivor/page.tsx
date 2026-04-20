"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";

type ChecklistItem = {
  id: string;
  title: string;
  description: string;
  contact?: string;
  documents?: string[];
  veteranSpecific?: boolean;
};

type Phase = {
  id: string;
  label: string;
  timeframe: string;
  color: string;
  items: ChecklistItem[];
};

const PHASES: Phase[] = [
  {
    id: "immediate",
    label: "Immediate",
    timeframe: "First 48 hours",
    color: "amber",
    items: [
      {
        id: "death-certificates",
        title: "Obtain certified death certificates",
        description:
          "Request 10–15 certified copies from the funeral home — more than you think you'll need. Banks, insurance companies, the VA, and government agencies each require their own original.",
      },
      {
        id: "locate-will",
        title: "Locate the will and any trust documents",
        description:
          "Check the vault first, then home filing cabinets, safe deposit boxes, and the family attorney. The will dictates who has legal authority to act.",
        documents: ["Legal"],
      },
      {
        id: "notify-va",
        title: "Notify the VA immediately",
        description:
          "Call 1-800-827-1000 to report the veteran's death. This stops compensation payments (overpayments must be returned) and starts the survivor benefits process. Have the veteran's Social Security number and VA file number ready.",
        contact: "VA: 1-800-827-1000",
        veteranSpecific: true,
      },
      {
        id: "funeral-home",
        title: "Contact the funeral home and discuss military honors",
        description:
          "If the veteran is entitled to burial in a national cemetery or burial with military honors, the funeral home coordinates this. Honors include a flag presentation and bugler — at no cost to the family.",
        documents: ["Military", "Identity"],
        veteranSpecific: true,
      },
      {
        id: "notify-family",
        title: "Notify immediate family and close friends",
        description:
          "Reach out personally before any public announcements. Check the vault's Family section for emergency contacts and dependent information.",
        documents: ["Family"],
      },
    ],
  },
  {
    id: "first-week",
    label: "First Week",
    timeframe: "Days 2–7",
    color: "orange",
    items: [
      {
        id: "social-security",
        title: "Report the death to Social Security",
        description:
          "Call 1-800-772-1213. If the surviving spouse is 60 or older (or 50+ if disabled), they may be entitled to Social Security survivor benefits. A one-time $255 death benefit may also be available.",
        contact: "SSA: 1-800-772-1213",
      },
      {
        id: "dfas",
        title: "Notify DFAS if the veteran was a military retiree",
        description:
          "Call 1-888-332-7411 to report the death to the Defense Finance and Accounting Service. This stops retirement pay and begins processing Survivor Benefit Plan (SBP) annuity payments if elected.",
        contact: "DFAS: 1-888-332-7411",
        documents: ["Military"],
        veteranSpecific: true,
      },
      {
        id: "life-insurance",
        title: "File life insurance claims",
        description:
          "Notify all life insurance companies. SGLI (Service members' Group Life Insurance) claims go through the Office of Servicemembers' Group Life Insurance at 1-800-419-1473. Most claims can be filed within 30 days.",
        contact: "SGLI: 1-800-419-1473",
        documents: ["Insurance"],
        veteranSpecific: true,
      },
      {
        id: "vso-contact",
        title: "Contact a Veterans Service Organization (VSO)",
        description:
          "VSOs like the DAV, VFW, and American Legion provide free, accredited claims assistance. A VSO representative will help you file for DIC, SBP, CHAMPVA, and other benefits — at no charge. This is one of the most valuable calls you can make.",
        contact: "DAV: 1-800-827-1000 | VFW: 1-833-639-8387 | American Legion: 1-800-433-3318",
        veteranSpecific: true,
      },
      {
        id: "financial-institutions",
        title: "Notify banks and financial institutions",
        description:
          "Bring certified death certificates. Joint accounts continue; sole accounts may be frozen pending probate. Get a list of all accounts from the Finance section of the vault.",
        documents: ["Finance"],
      },
    ],
  },
  {
    id: "thirty-days",
    label: "First 30 Days",
    timeframe: "Days 8–30",
    color: "stone",
    items: [
      {
        id: "dic-claim",
        title: "File for VA Dependency and Indemnity Compensation (DIC)",
        description:
          "DIC provides monthly compensation to surviving spouses and dependents of veterans who died from a service-connected condition. There is no filing deadline, but file promptly — benefits begin the month after the claim is filed, not the date of death. Use VA Form 21P-534EZ.",
        documents: ["VA", "Military"],
        veteranSpecific: true,
      },
      {
        id: "sbp-annuity",
        title: "Begin Survivor Benefit Plan (SBP) annuity claim",
        description:
          "If the veteran elected SBP at retirement, the surviving spouse is entitled to 55% of the veteran's retirement pay for life. Contact DFAS with the SBP election certificate and death certificate. This does not happen automatically.",
        contact: "DFAS: 1-888-332-7411",
        documents: ["Military"],
        veteranSpecific: true,
      },
      {
        id: "champva",
        title: "Apply for CHAMPVA health coverage",
        description:
          "CHAMPVA provides healthcare coverage to dependents of veterans rated 100% permanently and totally disabled, or who died from a service-connected condition. There is no strict deadline but don't delay — coverage isn't retroactive. Use VA Form 10-10d.",
        contact: "CHAMPVA: 1-800-733-8387",
        documents: ["VA", "Insurance"],
        veteranSpecific: true,
      },
      {
        id: "burial-allowance",
        title: "Apply for VA burial allowance",
        description:
          "The VA may reimburse burial and funeral costs if the veteran was receiving VA pension or compensation, or died in a VA facility. File VA Form 21P-530EZ within 2 years of the burial date.",
        documents: ["VA"],
        veteranSpecific: true,
      },
      {
        id: "employer-benefits",
        title: "Notify employer and review pension or survivor benefits",
        description:
          "Contact the veteran's or your own employer's HR department. Review any pension survivor benefits, group life insurance through work, and accrued leave payouts.",
        documents: ["Finance"],
      },
      {
        id: "update-insurance",
        title: "Review and update your own insurance coverage",
        description:
          "Health, auto, and home insurance policies may need to be updated. If you were on the veteran's employer health plan, you have 60 days from the date of death to elect COBRA or find alternative coverage.",
        documents: ["Insurance"],
      },
    ],
  },
  {
    id: "ninety-days",
    label: "30–90 Days",
    timeframe: "Days 31–90",
    color: "stone",
    items: [
      {
        id: "ss-survivor-benefits",
        title: "Apply for Social Security survivor benefits",
        description:
          "A surviving spouse aged 60 or older can receive reduced Social Security benefits. At full retirement age, you receive 100% of the deceased's benefit. Children under 18 may also be eligible. Apply at ssa.gov or call 1-800-772-1213.",
        contact: "SSA: 1-800-772-1213",
      },
      {
        id: "final-tax-return",
        title: "File the veteran's final income tax return",
        description:
          "The final return covers January 1 through the date of death. You may file jointly for that year. A tax professional or the IRS's Volunteer Income Tax Assistance (VITA) program can help. Note: certain military pay and VA disability compensation is tax-exempt.",
      },
      {
        id: "probate",
        title: "Begin probate or estate administration",
        description:
          "If there's a will, file it with your county probate court. If there's a trust, the successor trustee takes over. An estate attorney can guide this process. Assets with named beneficiaries (life insurance, IRAs) pass outside probate.",
        documents: ["Legal"],
      },
      {
        id: "property-titles",
        title: "Update property titles and vehicle registrations",
        description:
          "Real estate owned jointly passes automatically; sole-ownership property goes through probate. Vehicle titles need to be transferred at your state DMV. Gather deeds and titles from the vault.",
        documents: ["Finance", "Identity"],
      },
      {
        id: "gi-bill-dependents",
        title: "Check GI Bill transfer eligibility for dependents",
        description:
          "If the veteran transferred Post-9/11 GI Bill benefits to dependents before death, those benefits remain available. Contact the school's veterans certifying official or va.gov/education.",
        documents: ["Military", "VA"],
        veteranSpecific: true,
      },
    ],
  },
  {
    id: "ongoing",
    label: "Ongoing",
    timeframe: "After 90 days",
    color: "stone",
    items: [
      {
        id: "track-va-claims",
        title: "Track VA claim status",
        description:
          "Log in to va.gov or call 1-800-827-1000 to check the status of DIC, CHAMPVA, and other claims. Keep copies of every document you submit. Average DIC processing time is 3–6 months.",
        contact: "VA: 1-800-827-1000",
        veteranSpecific: true,
      },
      {
        id: "sbp-payments",
        title: "Confirm SBP payment schedule",
        description:
          "SBP annuity payments are paid monthly, similar to the retirement pay schedule. Confirm payment amounts with DFAS and set up direct deposit if not already in place.",
        veteranSpecific: true,
      },
      {
        id: "annual-benefits-review",
        title: "Annual review of benefits and dependents",
        description:
          "VA benefits, SBP amounts, and Social Security benefits can change. Review annually, especially after any change in your income, health, or dependent status.",
      },
      {
        id: "update-vault",
        title: "Keep the vault current",
        description:
          "Update beneficiary designations on any accounts you've opened or changed. Add new legal documents. Ensure your own guardian has access to an updated link.",
        documents: ["Legal", "Finance"],
      },
    ],
  },
];

const STORAGE_KEY = "lifesentinel-survivor-checklist-v1";

function phaseAccentClasses(color: string) {
  if (color === "amber") return { dot: "bg-amber-500", badge: "bg-amber-50 border-amber-200 text-amber-800", number: "bg-amber-600" };
  if (color === "orange") return { dot: "bg-orange-400", badge: "bg-orange-50 border-orange-200 text-orange-800", number: "bg-orange-500" };
  return { dot: "bg-stone-400", badge: "bg-stone-100 border-stone-200 text-stone-600", number: "bg-stone-500" };
}

export default function SurvivorWorkflowPage() {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setChecked(new Set(JSON.parse(saved)));
    } catch {}
    setLoaded(true);
  }, []);

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...next])); } catch {}
      return next;
    });
  }

  const allItems = PHASES.flatMap((p) => p.items);
  const totalCount = allItems.length;
  const doneCount = allItems.filter((i) => checked.has(i.id)).length;
  const pct = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <DashboardHeader />
      <main className="mx-auto max-w-3xl px-6 py-8 md:px-8 space-y-8">

        {/* Header */}
        <div className="rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 to-stone-50 px-8 py-10 shadow-sm">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-stone-900 md:text-4xl">
            Survivor&rsquo;s Checklist
          </h1>
          <p className="mt-3 text-stone-500 text-sm leading-relaxed max-w-xl md:text-base">
            A step-by-step guide through the weeks after a loss — what to do, who to call,
            and what documents you&rsquo;ll need. Take it one step at a time.
          </p>

          {loaded && (
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-stone-500">{doneCount} of {totalCount} steps complete</span>
                <span className="font-medium text-stone-700">{pct}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-stone-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Veteran guide callout */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 flex items-start gap-4">
          <div className="shrink-0 text-amber-600 text-xl select-none mt-0.5">✦</div>
          <div>
            <div className="text-sm font-semibold text-amber-900">Veteran family?</div>
            <p className="mt-1 text-sm text-amber-800 leading-relaxed">
              Many of the steps below are veteran-specific. See the{" "}
              <Link href="/dashboard/readiness/veteran-guide" className="underline font-medium hover:text-amber-900">
                Veteran Document Guide
              </Link>{" "}
              for detailed guidance on DD-214s, SBP, CHAMPVA, DIC, and more.
            </p>
          </div>
        </div>

        {/* Phases */}
        {PHASES.map((phase) => {
          const accent = phaseAccentClasses(phase.color);
          const phaseDone = phase.items.filter((i) => checked.has(i.id)).length;

          return (
            <section key={phase.id} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`h-2.5 w-2.5 rounded-full ${accent.dot}`} />
                <h2 className="font-serif text-xl font-semibold text-stone-900">{phase.label}</h2>
                <span className={`rounded-full border px-3 py-0.5 text-xs font-medium ${accent.badge}`}>
                  {phase.timeframe}
                </span>
                <span className="ml-auto text-xs text-stone-400">{phaseDone}/{phase.items.length}</span>
              </div>

              <div className="space-y-3">
                {phase.items.map((item) => {
                  const done = checked.has(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`rounded-2xl border p-5 transition-colors ${
                        done
                          ? "border-emerald-200 bg-emerald-50/60"
                          : "border-stone-200 bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => toggle(item.id)}
                          className={`mt-0.5 shrink-0 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                            done
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : "border-stone-300 bg-white hover:border-amber-400"
                          }`}
                          aria-label={done ? "Mark incomplete" : "Mark complete"}
                        >
                          {done && (
                            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className={`text-sm font-semibold ${done ? "text-emerald-800 line-through decoration-emerald-400" : "text-stone-900"}`}>
                              {item.title}
                            </h3>
                            {item.veteranSpecific && (
                              <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                                Veteran
                              </span>
                            )}
                          </div>

                          <p className={`mt-1.5 text-sm leading-relaxed ${done ? "text-emerald-700/80" : "text-stone-500"}`}>
                            {item.description}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {item.contact && (
                              <span className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs text-stone-600">
                                📞 {item.contact}
                              </span>
                            )}
                            {item.documents?.map((doc) => (
                              <Link
                                key={doc}
                                href="/dashboard/readiness/documents"
                                className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs text-amber-800 hover:bg-amber-100 transition"
                              >
                                Vault: {doc}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Footer note */}
        <div className="rounded-2xl border border-stone-200 bg-stone-50 px-6 py-5 text-sm text-stone-500 leading-relaxed">
          <span className="font-medium text-stone-700">A note:</span> This checklist is a guide, not legal advice.
          Every situation is different. A VSO representative, estate attorney, or financial advisor
          can help you navigate anything that feels unclear. You don&rsquo;t have to do this alone.
        </div>

      </main>
    </div>
  );
}
