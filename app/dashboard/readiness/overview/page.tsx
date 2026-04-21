"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";

type CategoryProgress = {
  category: string;
  total: number;
  completed: number;
  percent: number;
};

type NewOverviewResponse = {
  overallPercent?: number;
  totalItems?: number;
  completedItems?: number;
  missingItems?: number;
  categoryProgress?: CategoryProgress[];
};

type LegacyItem = {
  id: string;
  title: string;
  completed: boolean;
};

type LegacyOverviewResponse = {
  total?: number;
  completed?: number;
  percent?: number;
  items?: LegacyItem[];
};

type ReadinessDoc = {
  id: string;
  item_label: string;
  is_present: boolean;
};

type ReadinessFile = {
  id: string;
  readiness_document_id: string;
  file_name: string;
};

type NormalizedOverview = {
  overallPercent: number;
  totalItems: number;
  completedItems: number;
  missingItems: number;
  categoryProgress: CategoryProgress[];
};

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getCategoryAccent(category: string) {
  const key = category.trim().toLowerCase();
  switch (key) {
    case "identity":   return "bg-stone-400";
    case "legal":      return "bg-amber-600";
    case "insurance":  return "bg-sky-500";
    case "military":   return "bg-emerald-600";
    case "family":     return "bg-rose-400";
    case "finance":    return "bg-amber-500";
    case "va":         return "bg-blue-600";
    case "other":      return "bg-stone-400";
    default:           return "bg-stone-400";
  }
}

function getCategoryLabel(category: string) {
  if (category.trim().toLowerCase() === "va") return "VA";
  return category;
}

function normalizeOverviewResponse(
  raw: NewOverviewResponse | LegacyOverviewResponse
): NormalizedOverview {
  const hasNewShape =
    typeof (raw as NewOverviewResponse).overallPercent === "number" ||
    typeof (raw as NewOverviewResponse).totalItems === "number" ||
    typeof (raw as NewOverviewResponse).completedItems === "number";

  if (hasNewShape) {
    const next = raw as NewOverviewResponse;
    const totalItems = Number(next.totalItems ?? 0);
    const completedItems = Number(next.completedItems ?? 0);
    const overallPercent =
      typeof next.overallPercent === "number"
        ? next.overallPercent
        : totalItems > 0
        ? (completedItems / totalItems) * 100
        : 0;
    const missingItems =
      typeof next.missingItems === "number"
        ? next.missingItems
        : Math.max(0, totalItems - completedItems);
    return {
      overallPercent: clampPercent(overallPercent),
      totalItems,
      completedItems,
      missingItems,
      categoryProgress: Array.isArray(next.categoryProgress) ? next.categoryProgress : [],
    };
  }

  const legacy = raw as LegacyOverviewResponse;
  const items = Array.isArray(legacy.items) ? legacy.items : [];
  const totalItems = typeof legacy.total === "number" ? legacy.total : items.length;
  const completedItems =
    typeof legacy.completed === "number"
      ? legacy.completed
      : items.filter((item) => item.completed).length;
  const overallPercent =
    typeof legacy.percent === "number"
      ? legacy.percent
      : totalItems > 0
      ? (completedItems / totalItems) * 100
      : 0;
  const categoryProgress: CategoryProgress[] = items.map((item) => ({
    category: item.title,
    total: 1,
    completed: item.completed ? 1 : 0,
    percent: item.completed ? 100 : 0,
  }));

  return {
    overallPercent: clampPercent(overallPercent),
    totalItems,
    completedItems,
    missingItems: Math.max(0, totalItems - completedItems),
    categoryProgress,
  };
}

function StatCard({
  label,
  value,
  subtext,
}: {
  label: string;
  value: string | number;
  subtext: string;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-medium text-stone-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">{value}</div>
      <div className="mt-2 text-sm text-stone-400">{subtext}</div>
    </div>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  const safePercent = clampPercent(percent);
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-stone-100">
      <div
        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500"
        style={{ width: `${safePercent}%` }}
      />
    </div>
  );
}

export default function ReadinessOverviewPage() {
  const [data, setData] = useState<NormalizedOverview | null>(null);
  const [docs, setDocs] = useState<ReadinessDoc[]>([]);
  const [files, setFiles] = useState<ReadinessFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadOverview() {
      try {
        setLoading(true);
        setError("");

        const [overviewRes, docsRes, filesRes] = await Promise.all([
          fetch("/api/readiness/overview", { method: "GET", cache: "no-store" }),
          fetch("/api/readiness/documents", { cache: "no-store" }),
          fetch("/api/readiness/documents/files", { cache: "no-store" }),
        ]);

        if (!overviewRes.ok) throw new Error("Failed to load readiness overview.");
        if (!docsRes.ok) throw new Error("Failed to load readiness documents.");
        if (!filesRes.ok) throw new Error("Failed to load readiness files.");

        const overviewJson = await overviewRes.json();
        const docsJson = await docsRes.json();
        const filesJson = await filesRes.json();
        const normalized = normalizeOverviewResponse(overviewJson);

        if (!cancelled) {
          setData(normalized);
          setDocs(docsJson.documents ?? []);
          setFiles(filesJson.files ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Something went wrong loading the overview."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadOverview();
    return () => { cancelled = true; };
  }, []);

  const docIdByCategory = useMemo(() => {
    const map = new Map<string, string>();
    for (const doc of docs) map.set(doc.item_label, doc.id);
    return map;
  }, [docs]);

  const filesByCategory = useMemo(() => {
    const map = new Map<string, ReadinessFile[]>();
    for (const category of docIdByCategory.keys()) map.set(category, []);
    for (const file of files) {
      const matchingDoc = docs.find((doc) => doc.id === file.readiness_document_id);
      if (!matchingDoc) continue;
      const key = matchingDoc.item_label;
      const existing = map.get(key) ?? [];
      existing.push(file);
      map.set(key, existing);
    }
    return map;
  }, [files, docs, docIdByCategory]);

  const sortedCategories = useMemo(() => {
    if (!data?.categoryProgress) return [];
    const preferredOrder = ["Identity", "Legal", "Insurance", "Finance", "Family", "Military", "VA", "Other"];
    return [...data.categoryProgress].sort((a, b) => {
      const aIndex = preferredOrder.indexOf(a.category);
      const bIndex = preferredOrder.indexOf(b.category);
      if (aIndex === -1 && bIndex === -1) return a.category.localeCompare(b.category);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }, [data]);

  const completionTone = useMemo(() => {
    const percent = clampPercent(data?.overallPercent ?? 0);
    if (percent >= 80) {
      return {
        badge: "Mission ready",
        text: "Your critical documents are secured and accessible. Your family is prepared for whatever comes next.",
      };
    }
    if (percent >= 50) {
      return {
        badge: "Building readiness",
        text: "Solid progress. Each category you complete closes a gap your family might face in an emergency.",
      };
    }
    return {
      badge: "Begin your prep",
      text: "Every prepared family started here. Work through one category at a time — each step strengthens your family's readiness.",
    };
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5]">
        <DashboardHeader />
        <main className="mx-auto max-w-7xl px-6 py-8 md:px-8 lg:px-10">
          <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
            <div className="border-b border-stone-100 px-6 py-8 md:px-8">
              <div className="h-4 w-40 animate-pulse rounded bg-stone-100" />
              <div className="mt-4 h-10 w-80 animate-pulse rounded bg-stone-100" />
              <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-stone-100" />
            </div>
            <div className="grid gap-5 px-6 py-6 md:grid-cols-3 md:px-8">
              {[1, 2, 3].map((item) => (
                <div key={item} className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
                  <div className="h-4 w-24 animate-pulse rounded bg-stone-200" />
                  <div className="mt-4 h-10 w-20 animate-pulse rounded bg-stone-200" />
                  <div className="mt-3 h-4 w-32 animate-pulse rounded bg-stone-200" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#faf8f5]">
        <DashboardHeader />
        <main className="mx-auto max-w-7xl px-6 py-8 md:px-8 lg:px-10">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <div className="text-lg font-semibold text-stone-900">Readiness Overview</div>
            <p className="mt-2 text-sm text-red-700">{error || "Unable to load overview data."}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/dashboard/readiness/documents"
                className="inline-flex items-center rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
              >
                Go to Documents
              </Link>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
              >
                Try again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const overallPercent = clampPercent(data.overallPercent);

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <DashboardHeader />
      <main className="mx-auto max-w-7xl px-6 py-8 md:px-8 lg:px-10 space-y-6">

        {/* ── Family Benefits Guide Banner ── */}
        <div className="flex flex-col gap-4 rounded-3xl border border-stone-700 bg-gradient-to-br from-stone-800 to-stone-900 px-5 py-6 md:px-7 shadow-lg sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="text-2xl select-none shrink-0 mt-0.5">📋</span>
            <div>
              <p className="font-serif text-base font-semibold text-white leading-snug">
                Your Family Benefits Guide is ready
              </p>
              <p className="mt-1 text-sm text-stone-300 leading-relaxed">
                See what your family is entitled to after your passing — federal benefits, state benefits, and critical deadlines.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/benefits"
            className="shrink-0 inline-flex items-center justify-center rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-amber-700 shadow-lg shadow-amber-900/30"
          >
            View Benefits Guide →
          </Link>
        </div>

        {/* ── Main Readiness Section ── */}
        <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          <div className="relative border-b border-stone-100 px-6 py-8 md:px-8 md:py-10 bg-gradient-to-br from-amber-50/60 to-stone-50">
            <div className="relative">
              <div className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
                {completionTone.badge}
              </div>

              <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <h1 className="font-serif text-3xl font-semibold tracking-tight text-stone-900 md:text-4xl">
                    Family Readiness Briefing
                  </h1>
                  <p className="mt-3 text-sm leading-7 text-stone-500 md:text-base">
                    {completionTone.text}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/dashboard/readiness/documents"
                    className="inline-flex items-center justify-center rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-amber-700"
                  >
                    Manage Documents
                  </Link>
                  <Link
                    href="/dashboard/vault"
                    className="inline-flex items-center justify-center rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                  >
                    Open Vault
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5 px-6 py-6 md:grid-cols-3 md:px-8">
            <StatCard
              label="Protection Score"
              value={`${overallPercent}%`}
              subtext={`${data.completedItems} of ${data.totalItems} categories protected`}
            />
            <StatCard
              label="Protected"
              value={data.completedItems}
              subtext="Categories your family can count on"
            />
            <StatCard
              label="Still to add"
              value={data.missingItems}
              subtext="Categories worth completing when you're ready"
            />
          </div>

          <div className="px-6 pb-8 md:px-8">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-lg font-semibold text-stone-900">
                      Protection by Category
                    </h2>
                    <p className="mt-1 text-sm text-stone-400">
                      How each area of your family's life is covered.
                    </p>
                  </div>
                  <div className="hidden rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-500 sm:inline-flex">
                    {sortedCategories.length} categories
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {sortedCategories.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 p-6 text-sm text-stone-400">
                      No category data available yet.
                    </div>
                  ) : (
                    sortedCategories.map((item) => {
                      const percent = clampPercent(item.percent);
                      const uploadedFiles = filesByCategory.get(item.category) ?? [];

                      return (
                        <div
                          key={item.category}
                          className="rounded-2xl border border-stone-100 bg-stone-50/50 p-4"
                        >
                          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`h-2.5 w-2.5 rounded-full ${getCategoryAccent(item.category)}`} />
                              <div className="text-sm font-medium text-stone-800">
                                {getCategoryLabel(item.category)}
                              </div>
                            </div>
                            <div className="text-sm text-stone-500">
                              {item.completed}/{item.total} complete
                            </div>
                          </div>

                          <ProgressBar percent={percent} />

                          <div className="mt-2 flex items-center justify-between text-xs text-stone-400">
                            <span>{percent}% protected</span>
                            <span>
                              {Math.max(0, item.total - item.completed)} remaining
                            </span>
                          </div>

                          <div className="mt-4 rounded-xl border border-stone-100 bg-white px-3 py-3">
                            <div className="text-xs font-medium uppercase tracking-wide text-stone-400">
                              Documents added
                            </div>
                            {uploadedFiles.length === 0 ? (
                              <div className="mt-2 text-sm text-stone-400">
                                No documents added yet.
                              </div>
                            ) : (
                              <div className="mt-2 space-y-1">
                                {uploadedFiles.slice(0, 3).map((file) => (
                                  <div
                                    key={file.id}
                                    className="truncate text-sm text-stone-600"
                                    title={file.file_name}
                                  >
                                    · {file.file_name}
                                  </div>
                                ))}
                                {uploadedFiles.length > 3 ? (
                                  <div className="text-xs text-stone-400">
                                    +{uploadedFiles.length - 3} more
                                  </div>
                                ) : null}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <h2 className="font-serif text-lg font-semibold text-stone-900">Summary</h2>
                <p className="mt-1 text-sm text-stone-400">
                  A clear picture of where things stand today.
                </p>

                <div className="mt-6 rounded-2xl border border-stone-100 bg-stone-50 p-5">
                  <div className="text-sm font-medium text-stone-500">
                    Overall protection score
                  </div>
                  <div className="mt-3 flex items-end gap-3">
                    <div className="text-4xl font-semibold tracking-tight text-stone-900">
                      {overallPercent}%
                    </div>
                    <div className="pb-1 text-sm text-stone-400">
                      families protected
                    </div>
                  </div>
                  <div className="mt-4">
                    <ProgressBar percent={overallPercent} />
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="rounded-xl border border-stone-100 bg-stone-50 px-4 py-3">
                    <div className="text-xs uppercase tracking-wide text-stone-400">
                      Total categories
                    </div>
                    <div className="mt-1 text-lg font-semibold text-stone-900">
                      {data.totalItems}
                    </div>
                  </div>

                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                    <div className="text-xs uppercase tracking-wide text-emerald-600">
                      Protected
                    </div>
                    <div className="mt-1 text-lg font-semibold text-emerald-800">
                      {data.completedItems}
                    </div>
                  </div>

                  <div className="rounded-xl border border-stone-100 bg-stone-50 px-4 py-3">
                    <div className="text-xs uppercase tracking-wide text-stone-400">
                      Still to add
                    </div>
                    <div className="mt-1 text-lg font-semibold text-stone-700">
                      {data.missingItems}
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                  <div className="text-sm font-medium text-amber-900">
                    A gentle suggestion
                  </div>
                  <p className="mt-2 text-sm leading-6 text-amber-800">
                    Open Documents, add records for each category, and mark it protected
                    when you feel it's covered. Even one category is a gift to your family.
                  </p>
                </div>

                <div className="mt-5">
                  <Link
                    href="/dashboard/readiness/documents"
                    className="inline-flex w-full items-center justify-center rounded-xl bg-amber-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-amber-700"
                  >
                    Go to Documents
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </section>

        {/* ── Key Deadlines Widget ── */}
        <div className="rounded-3xl border border-stone-200 bg-white px-7 py-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-amber-500 select-none">◆</span>
            <h2 className="font-serif text-lg font-semibold text-stone-900">Key Deadlines After a Veteran's Passing</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
              <div className="inline-flex items-center rounded-full bg-red-100 border border-red-200 px-2.5 py-0.5 text-xs font-semibold text-red-800 mb-2">
                Within 1 year — Critical
              </div>
              <p className="text-sm font-semibold text-stone-900 mb-1">File DIC Claim</p>
              <p className="text-xs text-stone-500 leading-relaxed">
                Missing this deadline forfeits retroactive payments back to the date of death. File VA Form 21P-534EZ immediately.
              </p>
            </div>
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
              <div className="inline-flex items-center rounded-full bg-red-100 border border-red-200 px-2.5 py-0.5 text-xs font-semibold text-red-800 mb-2">
                Within 1 year — Critical
              </div>
              <p className="text-sm font-semibold text-stone-900 mb-1">File SGLI / VGLI Claim</p>
              <p className="text-xs text-stone-500 leading-relaxed">
                Life insurance claim must be filed within 1 year. File form SGLV 8283 with OSGLI at 1-800-419-1473.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
              <div className="inline-flex items-center rounded-full bg-amber-100 border border-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-800 mb-2">
                Within 2 years
              </div>
              <p className="text-sm font-semibold text-stone-900 mb-1">Apply for CHAMPVA</p>
              <p className="text-xs text-stone-500 leading-relaxed">
                Family healthcare coverage for eligible surviving spouses and dependents. File VA Form 10-10d within 2 years.
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs text-stone-400">
            See all deadlines and benefit details in your{" "}
            <Link href="/dashboard/benefits" className="text-amber-600 hover:text-amber-700 underline">
              Family Benefits Guide
            </Link>
          </p>
        </div>

      </main>
    </div>
  );
}
