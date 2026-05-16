"use client";

import { useState } from "react";
import Link from "next/link";
import {
  UserCheck,
  Sparkles,
  Shield,
  Users,
  FileText,
  ClipboardCheck,
  CheckCircle,
  ChevronRight,
  X,
} from "lucide-react";

type StepId = "profile" | "benefits" | "guardian" | "roles" | "documents" | "overview";

export type Completions = Record<StepId, boolean>;

const STEPS = [
  {
    id: "profile" as StepId,
    title: "Complete your profile",
    subtitle: "Personalizes everything — your benefits, guardian access, and readiness plan",
    route: "/profile-setup",
    timeEst: "~5 min",
    Icon: UserCheck,
  },
  {
    id: "benefits" as StepId,
    title: "Review your benefits report",
    subtitle: "Your personalized guide to federal and state benefits — generated just for you",
    route: "/dashboard/benefits",
    timeEst: "~5 min",
    Icon: Sparkles,
  },
  {
    id: "guardian" as StepId,
    title: "Designate a Guardian",
    subtitle: "Someone you trust who can access your info in an emergency",
    route: "/dashboard/guardian",
    timeEst: "~2 min",
    Icon: Shield,
  },
  {
    id: "roles" as StepId,
    title: "Name your trusted people",
    subtitle: "Your Primary Survivor, Trigger Authority, and secondary helper",
    route: "/dashboard/readiness/roles",
    timeEst: "~3 min",
    Icon: Users,
  },
  {
    id: "documents" as StepId,
    title: "Map your key documents",
    subtitle: "Your family needs to know where to find your will, insurance, and ID",
    route: "/dashboard/readiness/documents",
    timeEst: "~10 min",
    Icon: FileText,
  },
  {
    id: "overview" as StepId,
    title: "Review your readiness",
    subtitle: "One final pass to see exactly where you stand",
    route: "/dashboard/readiness/overview",
    timeEst: "~3 min",
    Icon: ClipboardCheck,
  },
];

interface Props {
  completions: Completions;
  initialDismissed: boolean;
}

async function callAcknowledge(field: string) {
  await fetch("/api/profile/acknowledge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ field }),
  });
}

export default function GetStartedCard({ completions, initialDismissed }: Props) {
  const [dismissed, setDismissed] = useState(initialDismissed);

  const steps = STEPS.map((s) => ({ ...s, complete: completions[s.id] }));
  const completedCount = steps.filter((s) => s.complete).length;
  const allComplete = completedCount === steps.length;
  const nextStep = steps.find((s) => !s.complete) ?? null;

  const circumference = 2 * Math.PI * 32;
  const dashOffset = circumference * (1 - completedCount / steps.length);

  function handleDismiss() {
    setDismissed(true);
    callAcknowledge("onboarding_dismissed_at");
  }

  // All complete — thin success pill
  if (allComplete) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 shadow-sm">
        <CheckCircle className="h-5 w-5 flex-shrink-0 text-emerald-600" />
        <span className="text-sm font-medium text-emerald-800">
          Setup complete — your family is protected.
        </span>
      </div>
    );
  }

  // Dismissed — collapsed pill
  if (dismissed) {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-5 py-3.5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0" style={{ width: 36, height: 36 }}>
            <svg width="36" height="36" className="-rotate-90 absolute inset-0">
              <circle cx="18" cy="18" r="14" fill="none" strokeWidth="3" stroke="#e7e5e4" />
              <circle
                cx="18" cy="18" r="14" fill="none" strokeWidth="3"
                stroke="#d97706" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 14}
                strokeDashoffset={2 * Math.PI * 14 * (1 - completedCount / steps.length)}
              />
            </svg>
          </div>
          <span className="text-sm text-stone-500">
            Setup underway —{" "}
            <span className="font-semibold text-stone-700">{completedCount} of {steps.length}</span>{" "}
            steps complete
          </span>
        </div>
        <button
          onClick={() => setDismissed(false)}
          className="text-xs font-medium text-amber-700 hover:text-amber-800 transition"
        >
          Resume →
        </button>
      </div>
    );
  }

  // Full card
  return (
    <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-5 border-b border-stone-100 px-6 py-5">
        {/* Progress ring */}
        <div className="relative flex-shrink-0" style={{ width: 80, height: 80 }}>
          <svg width="80" height="80" className="-rotate-90 absolute inset-0">
            <circle cx="40" cy="40" r="32" fill="none" strokeWidth="6" stroke="#e7e5e4" />
            <circle
              cx="40" cy="40" r="32" fill="none" strokeWidth="6"
              stroke="#d97706" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold leading-none text-stone-900">{completedCount}</span>
            <span className="mt-0.5 text-xs leading-none text-stone-400">of {steps.length}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-serif text-xl font-semibold text-stone-900">Get Started</h2>
          <p className="mt-1 text-sm text-stone-500">
            {completedCount === 0
              ? "Complete these steps to protect your family."
              : `${steps.length - completedCount} step${steps.length - completedCount !== 1 ? "s" : ""} left to complete your setup.`}
          </p>
        </div>

        <button
          onClick={handleDismiss}
          aria-label="Dismiss setup guide"
          className="flex-shrink-0 rounded-lg p-1.5 text-stone-300 hover:bg-stone-100 hover:text-stone-500 transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Next Step card */}
        {nextStep && (
          <>
            <Link
              href={nextStep.route}
              className="flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 transition hover:bg-amber-100 group"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100 group-hover:bg-amber-200 transition">
                <nextStep.Icon className="h-5 w-5 text-amber-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                    Next Step
                  </span>
                  <span className="text-xs text-amber-600">{nextStep.timeEst}</span>
                </div>
                <p className="font-semibold text-stone-900">{nextStep.title}</p>
                <p className="mt-1 text-sm text-stone-600">{nextStep.subtitle}</p>
              </div>
              <div className="flex-shrink-0 self-center">
                <span className="inline-flex items-center rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white group-hover:bg-amber-700 transition whitespace-nowrap">
                  Start →
                </span>
              </div>
            </Link>
            <div className="text-center">
              <button
                onClick={handleDismiss}
                className="text-xs text-stone-400 hover:text-stone-600 transition underline underline-offset-2"
              >
                Skip for now
              </button>
            </div>
          </>
        )}

        {/* Steps list */}
        <div className="divide-y divide-stone-100">
          {steps.map((step) => {
            const isNext = step.id === nextStep?.id;
            return (
              <Link
                key={step.id}
                href={step.route}
                className="-mx-1 flex items-center gap-3 rounded-xl px-1 py-3 transition hover:bg-stone-50"
              >
                {step.complete ? (
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                ) : isNext ? (
                  <div className="h-5 w-5 flex-shrink-0 rounded-full border-2 border-amber-500" />
                ) : (
                  <div className="h-5 w-5 flex-shrink-0 rounded-full border-2 border-stone-300" />
                )}
                <step.Icon
                  className={`h-4 w-4 flex-shrink-0 ${
                    step.complete ? "text-stone-300" : "text-stone-400"
                  }`}
                />
                <span
                  className={`flex-1 text-sm ${
                    step.complete
                      ? "text-stone-400 line-through decoration-stone-300"
                      : isNext
                      ? "font-medium text-stone-800"
                      : "text-stone-600"
                  }`}
                >
                  {step.title}
                </span>
                <span className="flex-shrink-0 text-xs text-stone-400">{step.timeEst}</span>
                {!step.complete && (
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-stone-300" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
