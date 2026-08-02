"use client";

import Link from "next/link";
import { useEffect } from "react";
import DashboardHeader from "@/components/DashboardHeader";

type HubCard = {
  title: string;
  description: string;
  href: string;
};

const CARDS: HubCard[] = [
  {
    title: "Family Benefits Guide",
    description:
      "Your personalized guide to federal and state benefits — DIC, CHAMPVA, DEA, state exemptions, and more.",
    href: "/dashboard/benefits",
  },
  {
    title: "Pre-Deployment",
    description:
      "Checklist for service members and their families before leaving on deployment.",
    href: "/dashboard/readiness/deployment",
  },
  {
    title: "Survivor",
    description:
      "Step-by-step guide for surviving spouses and dependents — what to do, when, who to call.",
    href: "/dashboard/readiness/survivor",
  },
  {
    title: "Records Locator",
    description:
      "Note where your family will find each critical document.",
    href: "/dashboard/readiness/documents",
  },
];

export default function ReadinessOverviewPage() {
  // Mark the Overview step acknowledged for the Get Started onboarding gate.
  useEffect(() => {
    fetch("/api/profile/acknowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field: "readiness_overview_acknowledged_at" }),
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <DashboardHeader />
      <main className="mx-auto max-w-4xl px-6 py-10 md:px-8 space-y-8">
        <header>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-stone-900 md:text-4xl">
            Overview
          </h1>
          <p className="mt-3 text-sm leading-7 text-stone-500 md:text-base">
            Your family&apos;s readiness at a glance.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          {CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group flex flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:border-amber-300 hover:shadow"
            >
              <h2 className="font-serif text-lg font-semibold text-stone-900 group-hover:text-amber-800">
                {card.title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-500">
                {card.description}
              </p>
              <span className="mt-4 inline-flex items-center text-sm font-medium text-amber-700 group-hover:text-amber-800">
                Open →
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
