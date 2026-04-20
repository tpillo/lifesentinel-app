"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trackEvent } from "@/lib/gtag";

type OccupationType = "law_enforcement" | "military_veteran" | "firefighter" | "civilian" | "";

type FormData = {
  occupation_type: OccupationType;
  state: string;
  department_type: string;
  branch: string;
  career_volunteer: string;
  occupation: string;
  years_of_service: string;
  status: string;
  va_disability_rating: string;
  va_pt_designation: string;
  service_connected_death: string;
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

export default function ProfileSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>({
    occupation_type: "",
    state: "",
    department_type: "",
    branch: "",
    career_volunteer: "",
    occupation: "",
    years_of_service: "",
    status: "",
    va_disability_rating: "",
    va_pt_designation: "",
    service_connected_death: "",
    full_name: "",
    date_of_birth: "",
    marital_status: "",
    num_dependents: "",
  });

  function set(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function canAdvanceStep1() {
    return form.occupation_type !== "";
  }

  function canAdvanceStep2() {
    if (!form.state) return false;
    if (form.occupation_type === "law_enforcement") return !!form.department_type && !!form.status;
    if (form.occupation_type === "military_veteran") return !!form.branch && !!form.status;
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
                  <div>
                    <label className="block text-sm font-medium text-stone-700">Branch of service</label>
                    <select value={form.branch} onChange={(e) => set("branch", e.target.value)} className={selectClass}>
                      <option value="">Select…</option>
                      <option value="army">Army</option>
                      <option value="navy">Navy</option>
                      <option value="marines">Marine Corps</option>
                      <option value="air_force">Air Force</option>
                      <option value="coast_guard">Coast Guard</option>
                      <option value="space_force">Space Force</option>
                      <option value="national_guard">National Guard</option>
                      <option value="reserves">Reserves</option>
                    </select>
                  </div>

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
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/50 px-5 py-5 space-y-4">
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
