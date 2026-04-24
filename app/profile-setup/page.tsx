"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trackEvent } from "@/lib/gtag";

type OccupationType = "law_enforcement" | "military_veteran" | "firefighter" | "civilian" | "";

type FormData = {
  occupation_type: OccupationType;
  state: string;
  department_type: string;
  branch: string;
  branches_served: string[];
  retirement_branch: string;
  primary_service_branch: string;
  career_volunteer: string;
  occupation: string;
  years_of_service: string;
  status: string;
  va_disability_rating: string;
  va_pt_designation: string;
  pt_award_date: string;
  service_connected_death: string;
  retirement_type: string;
  rcsbp_election: string;
  sbp_base_amount: string;
  collecting_retired_pay: string;
  full_name: string;
  date_of_birth: string;
  marital_status: string;
  num_dependents: string;
};

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
  "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming","District of Columbia",
];

const OCCUPATION_OPTIONS: { value: OccupationType; label: string; icon: string; description: string }[] = [
  {
    value: "military_veteran",
    label: "Veteran / Military",
    icon: "✦",
    description: "Active duty, reserve, National Guard, or veteran of any branch",
  },
  {
    value: "law_enforcement",
    label: "Law Enforcement",
    icon: "◈",
    description: "City police, county sheriff, state trooper, federal agent",
  },
  {
    value: "firefighter",
    label: "Fire / First Responder",
    icon: "◆",
    description: "Career or volunteer firefighter, paramedic, EMT",
  },
  {
    value: "civilian",
    label: "Civilian",
    icon: "⌂",
    description: "Private sector, government, self-employed, or retired civilian",
  },
];

const inputClass =
  "mt-1.5 block w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-stone-900 placeholder-stone-400 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100";

const selectClass =
  "mt-1.5 block w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-stone-900 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 appearance-none";

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-stone-400 leading-relaxed">{children}</p>;
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-amber-100 bg-amber-50/60 px-5 py-4">
      <p className="text-xs text-amber-800 leading-relaxed">{children}</p>
    </div>
  );
}

function StepIndicator({ current }: { current: number }) {
  const steps = ["Occupation", "Your Details", "Personal Info"];
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, i) => {
        const num = i + 1;
        const done = num < current;
        const active = num === current;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  done
                    ? "bg-emerald-500 text-white"
                    : active
                    ? "bg-amber-600 text-white"
                    : "border-2 border-stone-300 text-stone-400 bg-white"
                }`}
              >
                {done ? (
                  <svg className="h-4 w-4" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  num
                )}
              </div>
              <span className={`mt-1.5 text-xs font-medium ${active ? "text-amber-700" : done ? "text-emerald-600" : "text-stone-400"}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-3 mb-5 ${done ? "bg-emerald-300" : "bg-stone-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

const BRANCHES = [
  { value: "army", label: "Army" },
  { value: "navy", label: "Navy" },
  { value: "marines", label: "Marine Corps" },
  { value: "air_force", label: "Air Force" },
  { value: "coast_guard", label: "Coast Guard" },
  { value: "space_force", label: "Space Force" },
  { value: "national_guard", label: "National Guard" },
  { value: "reserves", label: "Reserves" },
];

function BranchFields({
  form,
  set,
  toggleBranch,
  selectClass,
}: {
  form: FormData;
  set: (field: keyof FormData, value: string) => void;
  toggleBranch: (b: string) => void;
  selectClass: string;
}) {
  const multipleSelected = form.branches_served.length > 1;
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Branches Served</label>
        <p className="text-xs text-stone-400 mb-2">Select all that apply</p>
        <div className="grid grid-cols-2 gap-2">
          {BRANCHES.map((b) => {
            const checked = form.branches_served.includes(b.value);
            return (
              <button
                key={b.value}
                type="button"
                onClick={() => toggleBranch(b.value)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium text-left transition ${
                  checked
                    ? "border-amber-500 bg-amber-50 text-amber-900"
                    : "border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50"
                }`}
              >
                <span className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${checked ? "border-amber-500 bg-amber-500" : "border-stone-300"}`}>
                  {checked && <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </span>
                {b.label}
              </button>
            );
          })}
        </div>
      </div>

      {multipleSelected && (
        <div>
          <label className="block text-sm font-medium text-stone-700">Retirement Branch</label>
          <p className="text-xs text-stone-400 mt-0.5 mb-1">Which branch are you officially retired from or will retire from?</p>
          <select value={form.retirement_branch} onChange={(e) => set("retirement_branch", e.target.value)} className={selectClass}>
            <option value="">Select…</option>
            {BRANCHES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-stone-700">Primary Service Identity</label>
        <p className="text-xs text-stone-400 mt-0.5 mb-1">Which branch do you most identify with for ceremony and memorial purposes?</p>
        <FieldHint>This helps your Guardian notify the right veteran organizations and arrange branch-appropriate honors and ceremonies.</FieldHint>
        <select value={form.primary_service_branch} onChange={(e) => set("primary_service_branch", e.target.value)} className={selectClass}>
          <option value="">Select…</option>
          {BRANCHES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
        </select>
      </div>
    </>
  );
}

function RcsbpOptionInfo({ option }: { option: string }) {
  const [open, setOpen] = useState(false);
  const tips: Record<string, string> = {
    option_c: "Immediate Annuity: Your spouse begins receiving monthly payments the day after your death, regardless of your age. This is the most protective option and is the default if no election was made within 90 days of your 20-year letter.",
    option_b: "Deferred Annuity: If you die before age 60, your spouse's payments don't start until the date you would have turned 60. If you die after 60, payments start immediately. This option costs less but provides a coverage gap.",
    option_a: "Declined/Deferred: You chose not to enroll at the time of your 20-year letter. If you die before retired pay begins at age 60, your spouse receives no annuity. You can still enroll in standard SBP when retired pay begins.",
  };
  if (!tips[option]) return null;
  return (
    <button type="button" onClick={() => setOpen((o) => !o)} className="mt-1 text-xs text-amber-600 underline hover:text-amber-700">
      {open ? "Hide explanation ↑" : "What does this mean? ↓"}
      {open && <p className="mt-2 text-left text-xs text-stone-600 leading-relaxed font-normal no-underline">{tips[option]}</p>}
    </button>
  );
}

function RetirementFields({
  form,
  set,
  isReserveRetirement,
  selectClass,
}: {
  form: FormData;
  set: (field: keyof FormData, value: string) => void;
  isReserveRetirement: boolean;
  selectClass: string;
}) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-stone-700">Retirement Type</label>
        <p className="mt-1 text-xs text-stone-400 leading-relaxed">
          Reserve and National Guard retirees have different survivor benefit rules than active duty retirees.
          Selecting the correct type ensures your family sees accurate benefit information.
        </p>
        <select value={form.retirement_type} onChange={(e) => set("retirement_type", e.target.value)} className={selectClass}>
          <option value="">Select…</option>
          <option value="active_duty">Active Duty Retirement</option>
          <option value="reserve_ng">Reserve / National Guard Retirement (20-year letter)</option>
          <option value="not_eligible">Not yet eligible for retirement</option>
          <option value="unknown">Unknown</option>
        </select>
      </div>

      {isReserveRetirement && (
        <>
          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 px-4 py-4 space-y-4">
            <p className="text-xs text-blue-800 leading-relaxed">
              When you received your 20-year letter, you had 90 days to elect RCSBP coverage. Your election determines
              whether your spouse receives a monthly annuity after your death — and when those payments begin.
              If you&apos;re unsure what you elected, check your DD Form 2656-5 or contact DFAS at 1-800-321-1080.
            </p>

            <div>
              <label className="block text-sm font-medium text-stone-700">RCSBP Election</label>
              <p className="mt-1 text-xs text-stone-400">Did you elect RCSBP coverage when you received your 20-year letter?</p>
              <select value={form.rcsbp_election} onChange={(e) => set("rcsbp_election", e.target.value)} className={selectClass}>
                <option value="">Select…</option>
                <option value="option_c">Option C — Immediate Annuity (spouse receives annuity immediately upon my death, at any age)</option>
                <option value="option_b">Option B — Deferred Annuity (spouse receives annuity starting when I would have turned 60, if I die before then)</option>
                <option value="option_a">Option A — Declined / Deferred to age 60 (no coverage if I die before retirement pay begins)</option>
                <option value="unknown">I&apos;m not sure / need to check my paperwork</option>
              </select>
              {form.rcsbp_election && <RcsbpOptionInfo option={form.rcsbp_election} />}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700">SBP Base Amount</label>
              <p className="mt-1 text-xs text-stone-400">What base amount did you elect for SBP coverage?</p>
              <select value={form.sbp_base_amount} onChange={(e) => set("sbp_base_amount", e.target.value)} className={selectClass}>
                <option value="">Select…</option>
                <option value="full">Full retired pay</option>
                <option value="reduced">Reduced amount (custom coverage)</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700">Currently Receiving Retired Pay?</label>
              <p className="mt-1 text-xs text-stone-400">
                Gray area retirees have completed 20 years of qualifying service and received their 20-year letter,
                but are not yet receiving retired pay (typically between the 20-year letter and age 60).
                If you elected Option C or B, your RCSBP coverage is active during this period.
              </p>
              <select value={form.collecting_retired_pay} onChange={(e) => set("collecting_retired_pay", e.target.value)} className={selectClass}>
                <option value="">Select…</option>
                <option value="yes">Yes — collecting at age 60+</option>
                <option value="no">No — in the &quot;gray area&quot; (have 20-year letter but not yet collecting)</option>
              </select>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default function ProfileSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState<FormData>({
    occupation_type: "",
    state: "",
    department_type: "",
    branch: "",
    branches_served: [],
    retirement_branch: "",
    primary_service_branch: "",
    career_volunteer: "",
    occupation: "",
    years_of_service: "",
    status: "",
    va_disability_rating: "",
    va_pt_designation: "",
    pt_award_date: "",
    service_connected_death: "",
    retirement_type: "",
    rcsbp_election: "",
    sbp_base_amount: "",
    collecting_retired_pay: "",
    full_name: "",
    date_of_birth: "",
    marital_status: "",
    num_dependents: "",
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) return;
        const { profile } = await res.json();
        if (!profile) return;
        setIsEditing(true);
        setForm({
          occupation_type: profile.occupation_type ?? "",
          state: profile.state ?? "",
          department_type: profile.department_type ?? "",
          branch: profile.branch ?? "",
          branches_served: Array.isArray(profile.branches_served) ? profile.branches_served : [],
          retirement_branch: profile.retirement_branch ?? "",
          primary_service_branch: profile.primary_service_branch ?? "",
          career_volunteer: profile.career_volunteer ?? "",
          occupation: profile.occupation ?? "",
          years_of_service: profile.years_of_service != null ? String(profile.years_of_service) : "",
          status: profile.status ?? "",
          va_disability_rating: profile.va_disability_rating ?? "",
          va_pt_designation: profile.va_pt_designation ?? "",
          pt_award_date: profile.pt_award_date ?? "",
          service_connected_death: profile.service_connected_death ?? "",
          retirement_type: profile.retirement_type ?? "",
          rcsbp_election: profile.rcsbp_election ?? "",
          sbp_base_amount: profile.sbp_base_amount ?? "",
          collecting_retired_pay: profile.collecting_retired_pay ?? "",
          full_name: profile.full_name ?? "",
          date_of_birth: profile.date_of_birth ?? "",
          marital_status: profile.marital_status ?? "",
          num_dependents: profile.num_dependents != null ? String(profile.num_dependents) : "",
        });
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  function set(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleBranch(branch: string) {
    setForm((prev) => {
      const current = prev.branches_served;
      const next = current.includes(branch)
        ? current.filter((b) => b !== branch)
        : [...current, branch];
      return { ...prev, branches_served: next };
    });
  }

  function canAdvanceStep1() {
    return form.occupation_type !== "";
  }

  function canAdvanceStep2() {
    if (!form.state) return false;
    if (form.occupation_type === "law_enforcement") return !!form.department_type && !!form.status;
    if (form.occupation_type === "military_veteran") return form.branches_served.length > 0 && !!form.status;
    if (form.occupation_type === "firefighter") return !!form.career_volunteer && !!form.status;
    if (form.occupation_type === "civilian") return !!form.occupation;
    return false;
  }

  function canSubmit() {
    return !!form.full_name && !!form.date_of_birth && !!form.marital_status && form.num_dependents !== "";
  }

  async function handleSubmit() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          years_of_service: form.years_of_service ? Number(form.years_of_service) : null,
          num_dependents: Number(form.num_dependents),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save profile");
      trackEvent("profile_completed", { occupation_type: form.occupation_type });
      router.replace("/dashboard/benefits");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  const isDeceased = form.status === "deceased";
  const isMilitary = form.occupation_type === "military_veteran";
  const showRetirementType = isMilitary && (form.status === "retired" || form.status === "veteran");
  const isReserveRetirement = form.retirement_type === "reserve_ng";

  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="text-center">
          <div className="text-amber-600 text-3xl mb-3 select-none">❧</div>
          <p className="text-stone-500 text-sm">Loading your profile…</p>
        </div>
      </main>
    );
  }

  if (isEditing) {
    return (
      <main className="min-h-screen bg-[#faf8f5] px-4 py-12">
        <div className="mx-auto w-full max-w-2xl space-y-6">

          <div className="text-center mb-2">
            <Link href="/" className="inline-block">
              <div className="text-amber-600 text-3xl mb-3 select-none">❧</div>
              <h1 className="font-serif text-2xl font-semibold text-stone-900 tracking-tight">Update Profile</h1>
            </Link>
            <p className="mt-2 text-sm text-stone-500">Keep your information current so your family sees the right benefits.</p>
          </div>

          {/* Occupation */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8">
            <h2 className="font-serif text-lg font-semibold text-stone-900 mb-5">Occupation</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {OCCUPATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set("occupation_type", opt.value)}
                  className={`text-left rounded-2xl border-2 p-5 transition-all ${
                    form.occupation_type === opt.value
                      ? "border-amber-500 bg-amber-50"
                      : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  <div className={`text-xl mb-3 select-none ${form.occupation_type === opt.value ? "text-amber-600" : "text-stone-400"}`}>{opt.icon}</div>
                  <div className={`text-sm font-semibold mb-1 ${form.occupation_type === opt.value ? "text-amber-900" : "text-stone-900"}`}>{opt.label}</div>
                  <div className="text-xs text-stone-500 leading-relaxed">{opt.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Service Details */}
          {form.occupation_type && (
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8 space-y-5">
              <h2 className="font-serif text-lg font-semibold text-stone-900">Service Details</h2>

              <div>
                <label className="block text-sm font-medium text-stone-700">State of residence</label>
                <select value={form.state} onChange={(e) => set("state", e.target.value)} className={selectClass}>
                  <option value="">Select your state…</option>
                  {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {form.occupation_type === "law_enforcement" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-stone-700">Department type</label>
                    <select value={form.department_type} onChange={(e) => set("department_type", e.target.value)} className={selectClass}>
                      <option value="">Select…</option>
                      <option value="city_police">City Police</option>
                      <option value="county_sheriff">County Sheriff</option>
                      <option value="state_trooper">State Trooper</option>
                      <option value="federal">Federal Agency</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700">Years of service</label>
                    <input type="number" min="0" max="60" value={form.years_of_service} onChange={(e) => set("years_of_service", e.target.value)} className={inputClass} placeholder="e.g. 12" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700">Status</label>
                    <select value={form.status} onChange={(e) => set("status", e.target.value)} className={selectClass}>
                      <option value="">Select…</option>
                      <option value="active">Active</option>
                      <option value="retired">Retired</option>
                      <option value="deceased">Deceased (family member setting up)</option>
                    </select>
                  </div>
                </>
              )}

              {form.occupation_type === "military_veteran" && (
                <>
                  <BranchFields form={form} set={set} toggleBranch={toggleBranch} selectClass={selectClass} />
                  <div>
                    <label className="block text-sm font-medium text-stone-700">Service status</label>
                    <select value={form.status} onChange={(e) => set("status", e.target.value)} className={selectClass}>
                      <option value="">Select…</option>
                      <option value="active_duty">Active Duty</option>
                      <option value="veteran">Veteran</option>
                      <option value="retired">Retired</option>
                      <option value="separated">Separated</option>
                      <option value="deceased">Deceased (family member setting up)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700">Years of service</label>
                    <input type="number" min="0" max="60" value={form.years_of_service} onChange={(e) => set("years_of_service", e.target.value)} className={inputClass} placeholder="e.g. 8" />
                  </div>
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/50 px-4 py-4 space-y-4">
                    <p className="text-xs text-blue-800 leading-relaxed">
                      A rating increase or new P&amp;T designation can unlock higher monthly benefits for your family. Update these whenever your VA rating changes.
                    </p>
                    <div>
                      <label className="block text-sm font-medium text-stone-700">Combined VA Disability Rating</label>
                      <select value={form.va_disability_rating} onChange={(e) => set("va_disability_rating", e.target.value)} className={selectClass}>
                        <option value="">Select…</option>
                        <option value="none">None</option>
                        {[10,20,30,40,50,60,70,80,90,100].map((r) => (
                          <option key={r} value={String(r)}>{r}%</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700">Permanent &amp; Total (P&amp;T) Designation</label>
                      <select value={form.va_pt_designation} onChange={(e) => set("va_pt_designation", e.target.value)} className={selectClass}>
                        <option value="">Select…</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                    {form.va_pt_designation === "yes" && (
                      <div>
                        <label className="block text-sm font-medium text-stone-700">P&amp;T Award Date</label>
                        <p className="mt-1 text-xs text-stone-400 leading-relaxed">
                          This allows Life Sentinel to automatically calculate whether your spouse qualifies for the enhanced DIC rate — an additional $360.85/month for life — based on the 8-year continuous P&amp;T requirement.
                        </p>
                        <input type="date" value={form.pt_award_date} onChange={(e) => set("pt_award_date", e.target.value)} className={inputClass} />
                      </div>
                    )}
                  </div>
                  {isDeceased && (
                    <div>
                      <label className="block text-sm font-medium text-stone-700">Was the cause of death service-connected?</label>
                      <InfoBox>If the cause of death is service-connected, your family may qualify for significantly higher monthly compensation (DIC) for life.</InfoBox>
                      <select value={form.service_connected_death} onChange={(e) => set("service_connected_death", e.target.value)} className={selectClass}>
                        <option value="">Select…</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                        <option value="unknown">Unknown</option>
                      </select>
                    </div>
                  )}
                  {showRetirementType && <RetirementFields form={form} set={set} isReserveRetirement={isReserveRetirement} selectClass={selectClass} />}
                </>
              )}

              {form.occupation_type === "firefighter" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-stone-700">Career or volunteer?</label>
                    <select value={form.career_volunteer} onChange={(e) => set("career_volunteer", e.target.value)} className={selectClass}>
                      <option value="">Select…</option>
                      <option value="career">Career</option>
                      <option value="volunteer">Volunteer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700">Years of service</label>
                    <input type="number" min="0" max="60" value={form.years_of_service} onChange={(e) => set("years_of_service", e.target.value)} className={inputClass} placeholder="e.g. 15" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700">Status</label>
                    <select value={form.status} onChange={(e) => set("status", e.target.value)} className={selectClass}>
                      <option value="">Select…</option>
                      <option value="active">Active</option>
                      <option value="retired">Retired</option>
                      <option value="deceased">Deceased (family member setting up)</option>
                    </select>
                  </div>
                </>
              )}

              {form.occupation_type === "civilian" && (
                <div>
                  <label className="block text-sm font-medium text-stone-700">Occupation</label>
                  <input type="text" value={form.occupation} onChange={(e) => set("occupation", e.target.value)} className={inputClass} placeholder="e.g. Teacher, Software Engineer, Nurse…" />
                </div>
              )}
            </div>
          )}

          {/* Personal Info */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8 space-y-5">
            <h2 className="font-serif text-lg font-semibold text-stone-900">Personal Information</h2>

            <div>
              <label className="block text-sm font-medium text-stone-700">Full name</label>
              <input type="text" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} className={inputClass} placeholder="Your full legal name" autoComplete="name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">Date of birth</label>
              <input type="date" value={form.date_of_birth} onChange={(e) => set("date_of_birth", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">Marital status</label>
              <select value={form.marital_status} onChange={(e) => set("marital_status", e.target.value)} className={selectClass}>
                <option value="">Select…</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="widowed">Widowed</option>
                <option value="divorced">Divorced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">Number of dependent children under 23</label>
              <FieldHint>Many survivor benefits include additional monthly payments for dependent children, plus education benefits through age 23.</FieldHint>
              <input type="number" min="0" max="20" value={form.num_dependents} onChange={(e) => set("num_dependents", e.target.value)} className={inputClass} placeholder="0" />
            </div>

            {!isMilitary && isDeceased && (
              <div>
                <label className="block text-sm font-medium text-stone-700">Was the cause of death service-connected?</label>
                <InfoBox>If the cause of death is service-connected, your family may qualify for significantly higher monthly compensation (DIC) for life.</InfoBox>
                <select value={form.service_connected_death} onChange={(e) => set("service_connected_death", e.target.value)} className={selectClass}>
                  <option value="">Select…</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
            )}
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          <div className="flex items-center justify-between pb-4">
            <Link href="/dashboard/readiness/overview" className="text-sm text-stone-400 hover:text-stone-600 transition">
              ← Back to dashboard
            </Link>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit() || saving}
              className="rounded-xl bg-amber-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Changes →"}
            </button>
          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf8f5] px-4 py-12">
      <div className="mx-auto w-full max-w-2xl">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="text-amber-600 text-3xl mb-3 select-none">❧</div>
            <h1 className="font-serif text-2xl font-semibold text-stone-900 tracking-tight">
              LifeSentinel
            </h1>
          </Link>
        </div>

        {/* Privacy statement */}
        <div className="mb-8 rounded-2xl border border-stone-200 bg-white px-6 py-5 text-center shadow-sm">
          <p className="text-sm text-stone-500 leading-relaxed max-w-lg mx-auto">
            To personalize your Life Sentinel experience, we need to know a little about you.
            This information is <span className="font-medium text-stone-700">encrypted, never sold</span>,
            and only used to show your family the benefits and protections they&rsquo;ve earned.
          </p>
        </div>

        <StepIndicator current={step} />

        {/* ── Step 1 — Occupation Type ── */}
        {step === 1 && (
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8">
            <h2 className="font-serif text-xl font-semibold text-stone-900 mb-1">
              What best describes your occupation?
            </h2>
            <p className="text-sm text-stone-500 mb-6 leading-relaxed">
              This helps us find the right benefits programs for your family — they vary
              significantly between military, law enforcement, and civilian employees.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {OCCUPATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set("occupation_type", opt.value)}
                  className={`text-left rounded-2xl border-2 p-5 transition-all ${
                    form.occupation_type === opt.value
                      ? "border-amber-500 bg-amber-50"
                      : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  <div className={`text-xl mb-3 select-none ${form.occupation_type === opt.value ? "text-amber-600" : "text-stone-400"}`}>
                    {opt.icon}
                  </div>
                  <div className={`text-sm font-semibold mb-1 ${form.occupation_type === opt.value ? "text-amber-900" : "text-stone-900"}`}>
                    {opt.label}
                  </div>
                  <div className="text-xs text-stone-500 leading-relaxed">{opt.description}</div>
                </button>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!canAdvanceStep1()}
                className="rounded-xl bg-amber-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2 — Occupation-specific fields ── */}
        {step === 2 && (
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8">
            <h2 className="font-serif text-xl font-semibold text-stone-900 mb-1">
              Tell us a bit more
            </h2>
            <p className="text-sm text-stone-500 mb-6">
              These details help match your family to the right programs and resources.
            </p>

            <div className="space-y-5">

              {/* State — all occupation types */}
              <div>
                <label className="block text-sm font-medium text-stone-700">State of residence</label>
                <FieldHint>
                  Benefits vary dramatically by state. This ensures we show your family exactly
                  what they&rsquo;re owed where you live.
                </FieldHint>
                <select value={form.state} onChange={(e) => set("state", e.target.value)} className={selectClass}>
                  <option value="">Select your state…</option>
                  {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* ── Law Enforcement ── */}
              {form.occupation_type === "law_enforcement" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-stone-700">Department type</label>
                    <select value={form.department_type} onChange={(e) => set("department_type", e.target.value)} className={selectClass}>
                      <option value="">Select…</option>
                      <option value="city_police">City Police</option>
                      <option value="county_sheriff">County Sheriff</option>
                      <option value="state_trooper">State Trooper</option>
                      <option value="federal">Federal Agency</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700">Years of service</label>
                    <FieldHint>Many benefits are tied to length of service. This ensures your family gets the complete picture.</FieldHint>
                    <input type="number" min="0" max="60" value={form.years_of_service} onChange={(e) => set("years_of_service", e.target.value)} className={inputClass} placeholder="e.g. 12" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700">Status</label>
                    <select value={form.status} onChange={(e) => set("status", e.target.value)} className={selectClass}>
                      <option value="">Select…</option>
                      <option value="active">Active</option>
                      <option value="retired">Retired</option>
                      <option value="deceased">Deceased (family member setting up)</option>
                    </select>
                  </div>
                </>
              )}

              {/* ── Military / Veteran ── */}
              {form.occupation_type === "military_veteran" && (
                <>
                  <BranchFields form={form} set={set} toggleBranch={toggleBranch} selectClass={selectClass} />

                  <div>
                    <label className="block text-sm font-medium text-stone-700">Service status</label>
                    <select value={form.status} onChange={(e) => set("status", e.target.value)} className={selectClass}>
                      <option value="">Select…</option>
                      <option value="active_duty">Active Duty</option>
                      <option value="veteran">Veteran</option>
                      <option value="retired">Retired</option>
                      <option value="separated">Separated</option>
                      <option value="deceased">Deceased (family member setting up)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700">Years of service</label>
                    <input type="number" min="0" max="60" value={form.years_of_service} onChange={(e) => set("years_of_service", e.target.value)} className={inputClass} placeholder="e.g. 8" />
                  </div>

                  {/* VA disability */}
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/50 px-4 py-4 space-y-4">
                    <p className="text-xs text-blue-800 leading-relaxed">
                      These determine which federal and state benefits your family is entitled to
                      after your passing — many families miss thousands in benefits simply because
                      they didn&rsquo;t know to ask.
                    </p>

                    <div>
                      <label className="block text-sm font-medium text-stone-700">Combined VA Disability Rating</label>
                      <select value={form.va_disability_rating} onChange={(e) => set("va_disability_rating", e.target.value)} className={selectClass}>
                        <option value="">Select…</option>
                        <option value="none">None</option>
                        {[10,20,30,40,50,60,70,80,90,100].map((r) => (
                          <option key={r} value={String(r)}>{r}%</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700">Permanent &amp; Total (P&amp;T) Designation</label>
                      <select value={form.va_pt_designation} onChange={(e) => set("va_pt_designation", e.target.value)} className={selectClass}>
                        <option value="">Select…</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                    {form.va_pt_designation === "yes" && (
                      <div>
                        <label className="block text-sm font-medium text-stone-700">P&amp;T Award Date</label>
                        <p className="mt-1 text-xs text-stone-400 leading-relaxed">
                          This allows Life Sentinel to automatically calculate whether your spouse qualifies for the enhanced DIC rate — an additional $360.85/month for life — based on the 8-year continuous P&amp;T requirement.
                        </p>
                        <input type="date" value={form.pt_award_date} onChange={(e) => set("pt_award_date", e.target.value)} className={inputClass} />
                      </div>
                    )}
                  </div>

                  {/* Service-connected death — only if deceased */}
                  {isDeceased && (
                    <div>
                      <label className="block text-sm font-medium text-stone-700">
                        Was the cause of death service-connected?
                      </label>
                      <InfoBox>
                        If the cause of death is service-connected, your family may qualify for
                        significantly higher monthly compensation (DIC) for life.
                      </InfoBox>
                      <select value={form.service_connected_death} onChange={(e) => set("service_connected_death", e.target.value)} className={selectClass}>
                        <option value="">Select…</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                        <option value="unknown">Unknown</option>
                      </select>
                    </div>
                  )}

                  {/* Retirement type */}
                  {showRetirementType && <RetirementFields form={form} set={set} isReserveRetirement={isReserveRetirement} selectClass={selectClass} />}
                </>
              )}

              {/* ── Firefighter / First Responder ── */}
              {form.occupation_type === "firefighter" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-stone-700">Career or volunteer?</label>
                    <select value={form.career_volunteer} onChange={(e) => set("career_volunteer", e.target.value)} className={selectClass}>
                      <option value="">Select…</option>
                      <option value="career">Career</option>
                      <option value="volunteer">Volunteer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700">Years of service</label>
                    <FieldHint>Many benefits are tied to length of service. This ensures your family gets the complete picture.</FieldHint>
                    <input type="number" min="0" max="60" value={form.years_of_service} onChange={(e) => set("years_of_service", e.target.value)} className={inputClass} placeholder="e.g. 15" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700">Status</label>
                    <select value={form.status} onChange={(e) => set("status", e.target.value)} className={selectClass}>
                      <option value="">Select…</option>
                      <option value="active">Active</option>
                      <option value="retired">Retired</option>
                      <option value="deceased">Deceased (family member setting up)</option>
                    </select>
                  </div>
                </>
              )}

              {/* ── Civilian ── */}
              {form.occupation_type === "civilian" && (
                <div>
                  <label className="block text-sm font-medium text-stone-700">Occupation</label>
                  <input
                    type="text"
                    value={form.occupation}
                    onChange={(e) => set("occupation", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Teacher, Software Engineer, Nurse…"
                  />
                </div>
              )}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button onClick={() => setStep(1)} className="text-sm text-stone-400 hover:text-stone-600 transition">
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canAdvanceStep2()}
                className="rounded-xl bg-amber-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3 — Personal Info ── */}
        {step === 3 && (
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8">
            <h2 className="font-serif text-xl font-semibold text-stone-900 mb-1">
              A few personal details
            </h2>
            <p className="text-sm text-stone-500 mb-6">
              Used to personalize your dashboard and ensure your family has the right information.
            </p>

            <div className="space-y-5">

              <div>
                <label className="block text-sm font-medium text-stone-700">Full name</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => set("full_name", e.target.value)}
                  className={inputClass}
                  placeholder="Your full legal name"
                  autoComplete="name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700">Date of birth</label>
                <input
                  type="date"
                  value={form.date_of_birth}
                  onChange={(e) => set("date_of_birth", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700">Marital status</label>
                <select value={form.marital_status} onChange={(e) => set("marital_status", e.target.value)} className={selectClass}>
                  <option value="">Select…</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="widowed">Widowed</option>
                  <option value="divorced">Divorced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700">
                  Number of dependent children under 23
                </label>
                <FieldHint>
                  Many survivor benefits include additional monthly payments for dependent children,
                  plus education benefits through age 23.
                </FieldHint>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={form.num_dependents}
                  onChange={(e) => set("num_dependents", e.target.value)}
                  className={inputClass}
                  placeholder="0"
                />
              </div>

              {/* Non-military users: service-connected death shown here if deceased */}
              {!isMilitary && isDeceased && (
                <div>
                  <label className="block text-sm font-medium text-stone-700">
                    Was the cause of death service-connected?
                  </label>
                  <InfoBox>
                    If the cause of death is service-connected, your family may qualify for
                    significantly higher monthly compensation (DIC) for life.
                  </InfoBox>
                  <select value={form.service_connected_death} onChange={(e) => set("service_connected_death", e.target.value)} className={selectClass}>
                    <option value="">Select…</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
              )}

            </div>

            {error && (
              <p className="mt-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            {/* Lock statement */}
            <div className="mt-7 rounded-2xl border border-stone-200 bg-stone-50 px-5 py-4 flex items-start gap-3">
              <span className="text-lg select-none shrink-0 mt-0.5">🔒</span>
              <p className="text-xs text-stone-500 leading-relaxed">
                Your information is encrypted and private. Only you and your designated Guardian can see it.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button onClick={() => setStep(2)} className="text-sm text-stone-400 hover:text-stone-600 transition">
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit() || saving}
                className="rounded-xl bg-amber-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving…" : "Complete Setup →"}
              </button>
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-stone-400">
          You can update this information anytime from your profile settings.
        </p>

      </div>
    </main>
  );
}
