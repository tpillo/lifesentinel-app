"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";

type ReadinessDoc = {
  id: string;
  category: string;
  item_key: string;
};

type ReadinessFile = {
  id: string;
  readiness_document_id: string;
  file_name: string;
  created_at: string;
};

type ChecklistItem = {
  id: string;
  title: string;
  description: string;
  critical?: boolean;
  contact?: string;
  documents?: string[];
  tip?: string;
};

type Section = {
  id: string;
  label: string;
  icon: string;
  tagline: string;
  accentColor: "amber" | "blue" | "emerald" | "rose" | "violet" | "stone";
  items: ChecklistItem[];
};

const SECTIONS: Section[] = [
  {
    id: "legal",
    label: "Legal Authority",
    icon: "◈",
    tagline: "Your family needs legal authority to act while you're gone.",
    accentColor: "amber",
    items: [
      {
        id: "general-poa",
        title: "Execute a General Power of Attorney",
        description:
          "A General POA gives your spouse or designated person authority to handle financial, legal, and administrative matters on your behalf while you are deployed. Without it, they may be unable to sign for a car repair, close a bank account, or handle housing issues. Execute this at the installation legal office — it is free for service members.",
        critical: true,
        documents: ["Legal"],
        tip: "Get it notarized and make multiple certified copies. Your spouse should keep one, your attorney should have one, and one should be in the vault.",
        contact: "Installation Legal Assistance Office (free for service members)",
      },
      {
        id: "will",
        title: "Update your will",
        description:
          "Every deploying service member should have a current will. Review beneficiaries, guardianship of minor children, and executor designation. If you got married, had children, bought property, or divorced since your last will, it needs to be updated. This is also free at the installation legal office.",
        critical: true,
        documents: ["Legal"],
        contact: "Installation Legal Assistance Office (free for service members)",
      },
      {
        id: "healthcare-poa",
        title: "Execute a Healthcare Power of Attorney",
        description:
          "Designates who can make medical decisions for you if you are incapacitated. Separate from general POA. Also consider a living will / advance directive stating your wishes for end-of-life care.",
        documents: ["Legal"],
      },
      {
        id: "sgli-beneficiary",
        title: "Review and update SGLI beneficiary",
        description:
          "Confirm who receives your Service Members' Group Life Insurance (up to $500,000) in the event of your death. Update via SOES (Servicemembers' Online Enrollment System) at milConnect or with your unit's personnel office. SGLI beneficiary designations override your will — make sure they match your intent.",
        critical: true,
        documents: ["Insurance", "Military"],
        contact: "milConnect: milconnect.dmdc.osd.mil",
      },
      {
        id: "tsp-beneficiary",
        title: "Update TSP beneficiary designation",
        description:
          "Your Thrift Savings Plan beneficiary may be different from your SGLI beneficiary. Log in to tsp.gov to confirm or update. Like SGLI, TSP beneficiary designations override your will.",
        documents: ["Finance"],
        contact: "TSP: tsp.gov or 1-877-968-3778",
      },
      {
        id: "dd93",
        title: "Update DD-93 — Record of Emergency Data",
        description:
          "The DD-93 designates your emergency contacts and beneficiaries for official notification purposes. It must be current before every deployment. Your unit's S1 or admin section will require this. Ensure beneficiary designations are consistent with SGLI and your will.",
        critical: true,
        documents: ["Military"],
        contact: "Unit S1 / Personnel Office",
      },
    ],
  },
  {
    id: "financial",
    label: "Financial Readiness",
    icon: "◉",
    tagline: "Make sure your family can operate financially without you.",
    accentColor: "emerald",
    items: [
      {
        id: "joint-accounts",
        title: "Add your spouse as a joint owner on all bank accounts",
        description:
          "If your accounts are in your name only, your spouse may be unable to access funds during deployment. Visit your bank or use online banking to add them. Both USAA and Navy Federal allow this remotely.",
        critical: true,
        documents: ["Finance"],
      },
      {
        id: "spouse-credit",
        title: "Ensure your spouse has credit in their own name",
        description:
          "Credit cards as an authorized user don't build independent credit. Your spouse should have at least one card in their own name so they can establish credit history and handle emergencies independently.",
      },
      {
        id: "auto-pay",
        title: "Set up automatic bill payments",
        description:
          "Mortgage or rent, utilities, car payment, insurance premiums, phone, internet — set every recurring bill to auto-pay from a joint account. Leave a written list of what's automated and what requires manual action.",
        tip: "Create a simple spreadsheet: bill name, amount, due date, payment method, and login credentials stored securely in the vault.",
        documents: ["Finance"],
      },
      {
        id: "budget-plan",
        title: "Create a written household budget plan",
        description:
          "Document monthly income (including deployment pay, BAH, BAS), fixed expenses, and discretionary spending. Your spouse should know exactly what comes in and goes out each month.",
        documents: ["Finance"],
      },
      {
        id: "emergency-fund",
        title: "Confirm the emergency fund is accessible to your spouse",
        description:
          "Ensure you have 3–6 months of expenses in a joint savings account your spouse can access. Murphy's Law applies especially during deployments — home repairs, car breakdowns, and medical bills don't pause.",
        documents: ["Finance"],
      },
      {
        id: "allotment",
        title: "Set up a military pay allotment if needed",
        description:
          "If additional funds need to be routed to family members, savings accounts, or debt payments during deployment, set up allotments through myPay at mypay.dfas.mil.",
        contact: "myPay: mypay.dfas.mil or DFAS: 1-888-332-7411",
      },
    ],
  },
  {
    id: "military-admin",
    label: "Military Admin",
    icon: "✦",
    tagline: "Administrative tasks your family will depend on during the deployment.",
    accentColor: "blue",
    items: [
      {
        id: "deers",
        title: "Verify DEERS enrollment for all dependents",
        description:
          "All dependents must be enrolled in DEERS (Defense Enrollment Eligibility Reporting System) to access TRICARE, commissary, base exchange, and other benefits. Verify enrollment is current at milConnect. Newborns and new spouses are commonly missed.",
        critical: true,
        contact: "milConnect: milconnect.dmdc.osd.mil | DEERS: 1-800-538-9552",
      },
      {
        id: "tricare",
        title: "Confirm TRICARE enrollment and coverage",
        description:
          "Review your family's TRICARE plan and confirm your family knows how to use it. Locate the nearest MTF (Military Treatment Facility) and the TRICARE regional contractor. Leave insurance cards and plan information in the vault.",
        documents: ["Insurance"],
        contact: "TRICARE: tricare.mil or 1-800-444-5445",
      },
      {
        id: "dependent-ids",
        title: "Check dependent ID card expiration dates",
        description:
          "Dependent ID cards expire. If any family member's card expires during deployment, they will lose access to base services and may have TRICARE claim issues. Renew early at an ID card office (RAPIDS site).",
        contact: "RAPIDS Site Locator: idco.dmdc.osd.mil",
      },
      {
        id: "frg-contact",
        title: "Connect your family to the Family Readiness Group (FRG)",
        description:
          "The FRG provides support, information, and community for families during deployment. Ensure your spouse has the FRG leader's contact information and understands what resources are available.",
      },
      {
        id: "rear-d",
        title: "Share Rear Detachment Commander contact information",
        description:
          "Your family should know who to call at the unit for emergencies, casualty notifications, or urgent issues. The Rear-D Commander is the primary point of contact while you are deployed.",
        documents: ["Family"],
      },
      {
        id: "mypay-spouse",
        title: "Leave myPay access instructions",
        description:
          "Your spouse may need to verify or inquire about your pay. Ensure they understand how to reach DFAS and what information they'll need to provide on your behalf. Do not share your actual login, but leave a note about the process.",
        contact: "myPay: mypay.dfas.mil | DFAS: 1-888-332-7411",
      },
    ],
  },
  {
    id: "documents",
    label: "Documents to Upload Before You Leave",
    icon: "◆",
    tagline: "Get these into the vault before departure so your family has everything they need.",
    accentColor: "violet",
    items: [
      {
        id: "upload-dd214-orders",
        title: "Upload deployment orders and current military ID copy",
        description:
          "Deployment orders may be needed for school enrollment, legal matters, and accessing benefits. Upload to the Military category in the vault.",
        critical: true,
        documents: ["Military"],
      },
      {
        id: "upload-identity",
        title: "Upload copies of all identity documents",
        description:
          "Passports, Social Security cards, birth certificates, marriage certificate, and adoption papers for all family members. If a document is lost or stolen while you're deployed, your spouse will need these.",
        documents: ["Identity"],
      },
      {
        id: "upload-legal",
        title: "Upload the signed POA, will, and advance directive",
        description:
          "Once executed, upload scanned copies to the Legal category. The originals should be with your attorney or in a safe; the vault gives your family digital access.",
        critical: true,
        documents: ["Legal"],
      },
      {
        id: "upload-insurance",
        title: "Upload all insurance policies and cards",
        description:
          "SGLI policy documents, TRICARE cards, auto insurance, home/renter's insurance, and any supplemental life insurance. Include the SGLI beneficiary designation.",
        documents: ["Insurance"],
      },
      {
        id: "upload-finance",
        title: "Upload a financial summary",
        description:
          "A document listing all bank accounts, investment accounts, TSP balance, outstanding loans, credit cards, and monthly bills — with account numbers, contact numbers, and login instructions. Encrypt sensitive items if storing plaintext.",
        documents: ["Finance"],
      },
      {
        id: "upload-vehicle",
        title: "Upload vehicle registrations and titles",
        description:
          "If a vehicle is in your name only, your spouse may need proof of ownership for registration renewal, insurance claims, or emergency sale.",
        documents: ["Finance"],
      },
      {
        id: "upload-family",
        title: "Leave emergency contacts and household instructions",
        description:
          "Trusted neighbors, family members, childcare contacts, school info, pediatrician, vet, and a home systems guide (circuit breakers, water shutoff, HVAC filters). Upload to the Family category.",
        documents: ["Family"],
      },
    ],
  },
  {
    id: "home",
    label: "Home & Family Readiness",
    icon: "⌂",
    tagline: "Prepare your home and family to operate smoothly while you're away.",
    accentColor: "rose",
    items: [
      {
        id: "home-maintenance",
        title: "Leave a list of trusted home repair contacts",
        description:
          "Plumber, electrician, HVAC technician, locksmith, and a general handyman. Your spouse should know who to call and roughly what things cost so they aren't taken advantage of.",
        documents: ["Family"],
      },
      {
        id: "vehicle-maintenance",
        title: "Service vehicles before departure and leave a maintenance schedule",
        description:
          "Oil change, tire rotation, fluid check, and battery test. Leave the maintenance log and a note for when the next service is due so nothing gets missed during deployment.",
      },
      {
        id: "childcare-backup",
        title: "Establish a childcare backup plan",
        description:
          "What happens if the primary daycare is closed or a child gets sick? Identify at least two backup caregivers your children know and trust. Document their contacts in the Family section of the vault.",
        documents: ["Family"],
      },
      {
        id: "spare-keys",
        title: "Leave spare keys with a trusted neighbor or family member",
        description:
          "House keys, mailbox keys, car keys, safe keys. Document who has what.",
      },
      {
        id: "school-info",
        title: "Update school emergency contacts and authorized pickup list",
        description:
          "Schools need to know who can pick up your children in an emergency. Update their records to include trusted adults who can act in your absence.",
        documents: ["Family"],
      },
      {
        id: "pet-plan",
        title: "Create a plan for pets",
        description:
          "If your spouse cannot care for pets alone, identify a backup caregiver. Ensure vaccinations are current and upload records to the vault. A signed authorization letter allows a vet to treat your pet in an emergency.",
        documents: ["Family"],
      },
    ],
  },
  {
    id: "communications",
    label: "Communications Plan",
    icon: "◎",
    tagline: "Agree on how you'll stay connected and what to do when you can't.",
    accentColor: "stone",
    items: [
      {
        id: "comm-schedule",
        title: "Agree on a communication schedule",
        description:
          "Set realistic expectations for call/message frequency based on your mission and time zone. Avoid the common pattern of over-promising and under-delivering — consistent, lower-frequency contact is less stressful than sporadic high-frequency communication.",
      },
      {
        id: "blackout-periods",
        title: "Explain communication blackout procedures",
        description:
          "Your family should understand that communication blackouts happen — and that they mean an operation is underway, not that something is wrong. Agree in advance on how long to wait before escalating concern.",
        tip: "Designate a point of contact at the unit your family can call after a blackout exceeds a specific duration.",
      },
      {
        id: "emergency-code",
        title: "Establish an emergency code word or phrase",
        description:
          "A pre-agreed word that signals a true emergency requiring immediate action, distinct from normal stress or difficulty. Helps your family cut through routine worry to know when something genuinely needs to be escalated.",
      },
      {
        id: "secondary-contact",
        title: "Identify a 'second contact' for your family",
        description:
          "A trusted person your family can call if they need advice, support, or help when you're unreachable — and if they're unsure whether something rises to the level of a unit notification. Typically a trusted friend, neighbor, or nearby family member.",
        documents: ["Family"],
      },
      {
        id: "apo-address",
        title: "Share your APO/FPO mailing address",
        description:
          "Once you have your APO or FPO address, share it with your family and anyone who may want to send mail or care packages. Receiving mail is a significant morale factor for both you and your family.",
      },
    ],
  },
];

const STORAGE_KEY = "lifesentinel-deployment-checklist-v1";

type AccentColor = Section["accentColor"];

function accentClasses(color: AccentColor) {
  const map: Record<AccentColor, { dot: string; badge: string; header: string; check: string }> = {
    amber:   { dot: "bg-amber-500",  badge: "bg-amber-50 border-amber-200 text-amber-800",   header: "from-amber-50/60 to-stone-50",   check: "border-amber-500 bg-amber-500" },
    blue:    { dot: "bg-blue-500",   badge: "bg-blue-50 border-blue-200 text-blue-800",       header: "from-blue-50/60 to-stone-50",    check: "border-blue-500 bg-blue-500" },
    emerald: { dot: "bg-emerald-500",badge: "bg-emerald-50 border-emerald-200 text-emerald-800", header: "from-emerald-50/60 to-stone-50", check: "border-emerald-500 bg-emerald-500" },
    rose:    { dot: "bg-rose-400",   badge: "bg-rose-50 border-rose-200 text-rose-800",       header: "from-rose-50/60 to-stone-50",    check: "border-rose-400 bg-rose-400" },
    violet:  { dot: "bg-violet-500", badge: "bg-violet-50 border-violet-200 text-violet-800", header: "from-violet-50/60 to-stone-50",  check: "border-violet-500 bg-violet-500" },
    stone:   { dot: "bg-stone-400",  badge: "bg-stone-100 border-stone-200 text-stone-600",   header: "from-stone-100/60 to-stone-50",  check: "border-stone-400 bg-stone-400" },
  };
  return map[color];
}

export default function DeploymentChecklistPage() {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const [docsByCat, setDocsByCat] = useState<Record<string, ReadinessDoc>>({});
  const [filesByDocId, setFilesByDocId] = useState<Record<string, ReadinessFile[]>>({});
  const [uploadingItem, setUploadingItem] = useState<string | null>(null);
  const [openingFile, setOpeningFile] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setChecked(new Set(JSON.parse(saved)));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    async function loadDocs() {
      let docsRes = await fetch("/api/readiness/documents");
      let docsData = await docsRes.json();
      if ((docsData.documents ?? []).length < 8) {
        await fetch("/api/readiness/documents/seed", { method: "POST" });
        docsRes = await fetch("/api/readiness/documents");
        docsData = await docsRes.json();
      }
      const catMap: Record<string, ReadinessDoc> = {};
      for (const doc of docsData.documents ?? []) catMap[doc.category] = doc;
      setDocsByCat(catMap);

      const filesRes = await fetch("/api/readiness/documents/files");
      const filesData = await filesRes.json();
      const fileMap: Record<string, ReadinessFile[]> = {};
      for (const f of filesData.files ?? []) {
        if (!fileMap[f.readiness_document_id]) fileMap[f.readiness_document_id] = [];
        fileMap[f.readiness_document_id].push(f);
      }
      setFilesByDocId(fileMap);
    }
    loadDocs();
  }, []);

  async function uploadFile(itemId: string, category: string, file: File) {
    const doc = docsByCat[category];
    if (!doc) return;
    setUploadingItem(itemId);
    try {
      const form = new FormData();
      form.append("readiness_document_id", doc.id);
      form.append("file", file);
      const res = await fetch("/api/readiness/documents/upload", { method: "POST", body: form });
      const data = await res.json();
      if (data.ok && data.file) {
        setFilesByDocId((prev) => {
          const updated = { ...prev };
          updated[doc.id] = [data.file, ...(updated[doc.id] ?? [])];
          return updated;
        });
      }
    } finally {
      setUploadingItem(null);
    }
  }

  async function viewFile(fileId: string) {
    setOpeningFile(fileId);
    try {
      const res = await fetch("/api/readiness/documents/files/signed-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_id: fileId }),
      });
      const data = await res.json();
      if (data.url) window.open(data.url, "_blank");
    } finally {
      setOpeningFile(null);
    }
  }

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...next])); } catch {}
      return next;
    });
  }

  const allItems = SECTIONS.flatMap((s) => s.items);
  const criticalItems = allItems.filter((i) => i.critical);
  const totalCount = allItems.length;
  const doneCount = allItems.filter((i) => checked.has(i.id)).length;
  const criticalDone = criticalItems.filter((i) => checked.has(i.id)).length;
  const pct = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);
  const criticalPct = criticalItems.length === 0 ? 0 : Math.round((criticalDone / criticalItems.length) * 100);

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <DashboardHeader />
      <main className="mx-auto max-w-3xl px-6 py-8 md:px-8 space-y-8">

        {/* Header */}
        <div className="rounded-3xl border border-stone-200 bg-gradient-to-br from-stone-800 to-stone-900 px-8 py-10 shadow-lg">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-600/40 bg-amber-600/20 px-3 py-1 text-xs font-medium text-amber-300 mb-4">
            ✦ Military Pre-Deployment
          </div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Pre-Deployment Checklist
          </h1>
          <p className="mt-3 text-stone-300 text-sm leading-relaxed max-w-xl md:text-base">
            Everything a service member and their family should complete before deployment.
            Legal authority, financial independence, military admin, and documents — ready
            before you leave.
          </p>

          {loaded && (
            <div className="mt-7 space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-stone-400">Overall progress</span>
                  <span className="font-medium text-white">{doneCount}/{totalCount} complete</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-stone-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-stone-400">Critical items</span>
                  <span className={`font-medium ${criticalPct === 100 ? "text-emerald-400" : "text-amber-400"}`}>
                    {criticalDone}/{criticalItems.length} complete
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-stone-700">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${criticalPct === 100 ? "bg-emerald-500" : "bg-red-400"}`}
                    style={{ width: `${criticalPct}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Critical warning if not done */}
        {loaded && criticalPct < 100 && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 flex items-start gap-4">
            <div className="shrink-0 text-red-500 text-lg mt-0.5 select-none">◆</div>
            <div>
              <div className="text-sm font-semibold text-red-900">
                {criticalItems.length - criticalDone} critical {criticalItems.length - criticalDone === 1 ? "item" : "items"} not yet complete
              </div>
              <p className="mt-1 text-sm text-red-700 leading-relaxed">
                Items marked <span className="font-semibold">Critical</span> — like the General POA, updated will, SGLI beneficiary, and DD-93 — should be completed before departure. These protect your family if something goes wrong.
              </p>
            </div>
          </div>
        )}

        {/* All complete celebration */}
        {loaded && criticalPct === 100 && doneCount > 0 && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-5 flex items-start gap-4">
            <div className="shrink-0 text-emerald-600 text-lg mt-0.5 select-none">✦</div>
            <div>
              <div className="text-sm font-semibold text-emerald-900">All critical items complete</div>
              <p className="mt-1 text-sm text-emerald-700 leading-relaxed">
                Your family has legal authority, financial access, and the documents they need. Complete the remaining items when you can.
              </p>
            </div>
          </div>
        )}

        {/* Cross-link to veteran guide */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 flex items-start gap-4">
          <div className="shrink-0 text-amber-600 text-xl select-none mt-0.5">◈</div>
          <div>
            <div className="text-sm font-semibold text-amber-900">Plan ahead for your family</div>
            <p className="mt-1 text-sm text-amber-800 leading-relaxed">
              The{" "}
              <Link href="/dashboard/readiness/veteran-guide" className="underline font-medium hover:text-amber-900">
                Veteran Document Guide
              </Link>{" "}
              explains every key benefit document in detail — DD-214, SBP, CHAMPVA, DIC — so your family knows what they have and what to do if they need to use it.
            </p>
          </div>
        </div>

        {/* Sections */}
        {SECTIONS.map((section) => {
          const accent = accentClasses(section.accentColor);
          const sectionDone = section.items.filter((i) => checked.has(i.id)).length;
          const sectionCritical = section.items.filter((i) => i.critical).length;

          return (
            <section key={section.id} className="space-y-3">
              <div className={`rounded-2xl bg-gradient-to-r ${accent.header} border border-stone-200 px-5 py-4`}>
                <div className="flex items-center gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full ${accent.dot}`} />
                  <div className="flex items-center gap-2">
                    <span className="text-stone-500 select-none">{section.icon}</span>
                    <h2 className="font-serif text-lg font-semibold text-stone-900">{section.label}</h2>
                  </div>
                  <span className={`ml-auto rounded-full border px-3 py-0.5 text-xs font-medium ${accent.badge}`}>
                    {sectionDone}/{section.items.length}
                    {sectionCritical > 0 && ` · ${sectionCritical} critical`}
                  </span>
                </div>
                <p className="mt-1 ml-5 pl-3.5 text-xs text-stone-500">{section.tagline}</p>
              </div>

              <div className="space-y-3">
                {section.items.map((item) => {
                  const done = checked.has(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`rounded-2xl border p-5 transition-colors ${
                        done
                          ? "border-emerald-200 bg-emerald-50/60"
                          : item.critical
                          ? "border-stone-300 bg-white ring-1 ring-amber-200/60"
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
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <h3 className={`text-sm font-semibold ${done ? "text-emerald-800 line-through decoration-emerald-400" : "text-stone-900"}`}>
                              {item.title}
                            </h3>
                            {item.critical && !done && (
                              <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                                Critical
                              </span>
                            )}
                          </div>

                          <p className={`text-sm leading-relaxed ${done ? "text-emerald-700/80" : "text-stone-500"}`}>
                            {item.description}
                          </p>

                          {item.tip && !done && (
                            <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50/60 px-3 py-2.5">
                              <p className="text-xs text-amber-800 leading-relaxed">
                                <span className="font-semibold">Tip: </span>{item.tip}
                              </p>
                            </div>
                          )}

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

                          {item.documents && (() => {
                            const targetCat = item.documents[0];
                            const targetDoc = docsByCat[targetCat];
                            const files = targetDoc ? (filesByDocId[targetDoc.id] ?? []) : [];
                            const isUploading = uploadingItem === item.id;
                            return (
                              <div className="mt-3 space-y-2">
                                {files.length > 0 && (
                                  <div className="rounded-xl border border-stone-200 bg-stone-50 divide-y divide-stone-100">
                                    {files.map((f) => (
                                      <div key={f.id} className="flex items-center gap-2 px-3 py-2">
                                        <span className="text-stone-400 text-xs select-none">📎</span>
                                        <span className="text-xs text-stone-600 truncate flex-1 min-w-0">{f.file_name}</span>
                                        <button
                                          onClick={() => viewFile(f.id)}
                                          disabled={openingFile === f.id}
                                          className="shrink-0 text-xs font-medium text-amber-700 hover:text-amber-800 disabled:opacity-50 transition"
                                        >
                                          {openingFile === f.id ? "Opening…" : "View"}
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <label
                                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-stone-300 px-3 py-1.5 text-xs text-stone-500 transition hover:border-amber-400 hover:text-amber-700 ${isUploading ? "pointer-events-none opacity-50" : ""}`}
                                >
                                  <span>{isUploading ? "Uploading…" : "＋ Attach file"}</span>
                                  <input
                                    ref={(el) => { fileInputRefs.current[item.id] = el; }}
                                    type="file"
                                    className="sr-only"
                                    disabled={isUploading}
                                    onChange={(e) => {
                                      const f = e.target.files?.[0];
                                      if (f) uploadFile(item.id, targetCat, f);
                                      e.target.value = "";
                                    }}
                                  />
                                </label>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Footer */}
        <div className="rounded-2xl border border-stone-200 bg-stone-50 px-6 py-5 text-sm text-stone-500 leading-relaxed">
          <span className="font-medium text-stone-700">A note:</span> Installation legal offices
          provide free wills, POAs, and advance directives to active-duty service members and
          their dependents. Use them — don&rsquo;t pay a civilian attorney for what you can get
          on base. JAG officers can also help with SGLI, beneficiary questions, and pre-deployment
          financial planning.
        </div>

      </main>
    </div>
  );
}
