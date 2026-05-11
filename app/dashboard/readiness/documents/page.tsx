"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import { trackEvent } from "@/lib/gtag";

// ── Types ──────────────────────────────────────────────────────────────────────

type ReadinessDoc = {
  id: string;
  category: string;
  item_key: string;
  item_label: string;
  is_present: boolean;
  notes: string | null;
  updated_at: string;
  last_reviewed_at: string | null;
};

type ReadinessFile = {
  id: string;
  readiness_document_id: string;
  storage_bucket: string;
  storage_path: string;
  file_name: string;
  mime_type: string | null;
  file_size: number | null;
  created_at: string;
};

type DocumentLocation = {
  id: string;
  user_id: string;
  readiness_document_id: string | null;
  document_type: string;
  location_description: string;
  access_instructions: string | null;
  contact_person: string | null;
  created_at: string;
  updated_at: string;
};

type LocationForm = {
  document_type: string;
  location_description: string;
  access_instructions: string;
  contact_person: string;
};

const BLANK_FORM: LocationForm = {
  document_type: "",
  location_description: "",
  access_instructions: "",
  contact_person: "",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getCategoryLabel(category: string) {
  if (category.trim().toLowerCase() === "va") return "VA";
  return category;
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

function getCategoryExamples(category: string) {
  const key = category.trim().toLowerCase();
  switch (key) {
    case "identity":  return ["Birth certificates", "Marriage certificate", "Passports", "Social Security cards"];
    case "legal":     return ["Will", "Trust", "Power of attorney", "Advance directive"];
    case "insurance": return ["Life insurance policy", "Beneficiary details", "Health insurance documents", "Supplemental coverage"];
    case "finance":   return ["Banking summary", "Mortgage details", "Debt list", "Recurring bills"];
    case "family":    return ["Emergency contacts", "Dependent information", "Care instructions", "Key family records"];
    case "military":  return ["DD-214", "Retirement orders", "SBP or RCSBP paperwork", "Service records"];
    case "va":        return ["VA rating decision", "Award letters", "Claims correspondence", "Survivor benefit paperwork"];
    case "other":     return ["Anything important your family would need", "Special instructions", "Unique personal records"];
    default:          return ["Upload the key documents your family would need for this category"];
  }
}

function getDocumentTypesForCategory(category: string): string[] {
  const key = category.trim().toLowerCase();
  switch (key) {
    case "identity":  return ["Birth Certificate", "Marriage Certificate", "Passport", "SSN Card", "Divorce Decree", "Other"];
    case "legal":     return ["Will", "Trust", "Power of Attorney", "Medical Directives", "Other"];
    case "insurance": return ["Life Insurance Policy", "Health Insurance Card", "Supplemental Coverage", "Other"];
    case "finance":   return ["Property Deed", "Vehicle Title", "Bank Account Summary", "Other"];
    case "military":  return ["DD-214", "Retirement Orders", "SBP/RCSBP Paperwork", "Service Records", "Other"];
    case "va":        return ["VA Rating Decision", "Award Letter", "Claims Correspondence", "Survivor Benefit Paperwork", "Other"];
    case "family":    return ["Emergency Contacts", "Dependent Information", "Care Instructions", "Other"];
    default:          return [
        "DD-214", "Will", "Trust", "Birth Certificate", "Marriage Certificate",
        "Life Insurance Policy", "Passport", "SSN Card", "Property Deed", "Vehicle Title",
        "Power of Attorney", "Medical Directives", "Other",
      ];
  }
}

function StatCard({ label, value, subtext }: { label: string; value: string | number; subtext: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-medium text-stone-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">{value}</div>
      <div className="mt-2 text-sm text-stone-400">{subtext}</div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ReadinessDocumentsPage() {
  const [docs, setDocs] = useState<ReadinessDoc[]>([]);
  const [files, setFiles] = useState<ReadinessFile[]>([]);
  const [locations, setLocations] = useState<DocumentLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busyDocId, setBusyDocId] = useState<string | null>(null);
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);

  // Location notes form state
  const [addingLocationForDocId, setAddingLocationForDocId] = useState<string | null>(null);
  const [locationForm, setLocationForm] = useState<LocationForm>(BLANK_FORM);
  const [savingLocationForDocId, setSavingLocationForDocId] = useState<string | null>(null);
  const [deletingLocationId, setDeletingLocationId] = useState<string | null>(null);

  // ── Data fetching ──────────────────────────────────────────────────────────

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/readiness/documents", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load");
      setDocs(json.documents ?? []);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function loadFiles() {
    try {
      const res = await fetch("/api/readiness/documents/files", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load files");
      setFiles(json.files ?? []);
    } catch (e: unknown) {
      console.warn(e instanceof Error ? e.message : "Failed to load files");
    }
  }

  async function loadLocations() {
    try {
      const res = await fetch("/api/document-locations", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load locations");
      setLocations(json.locations ?? []);
    } catch (e: unknown) {
      console.warn(e instanceof Error ? e.message : "Failed to load locations");
    }
  }

  useEffect(() => {
    load();
    loadFiles();
    loadLocations();
  }, []);

  // ── Derived state ──────────────────────────────────────────────────────────

  const docsSorted = useMemo(() => {
    const preferredOrder = ["Identity", "Legal", "Insurance", "Finance", "Family", "Military", "VA", "Other"];
    return [...docs].sort((a, b) => {
      const aIndex = preferredOrder.indexOf(a.item_label);
      const bIndex = preferredOrder.indexOf(b.item_label);
      if (aIndex === -1 && bIndex === -1) return a.item_label.localeCompare(b.item_label);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }, [docs]);

  const fileByDocId = useMemo(() => {
    const m = new Map<string, ReadinessFile[]>();
    for (const f of files) {
      if (!m.has(f.readiness_document_id)) m.set(f.readiness_document_id, []);
      m.get(f.readiness_document_id)!.push(f);
    }
    return m;
  }, [files]);

  const locationsByDocId = useMemo(() => {
    const m = new Map<string, DocumentLocation[]>();
    for (const loc of locations) {
      const key = loc.readiness_document_id ?? "";
      if (!key) continue;
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(loc);
    }
    return m;
  }, [locations]);

  // A category is complete if explicitly marked present OR has a location note
  function isComplete(doc: ReadinessDoc) {
    return doc.is_present || (locationsByDocId.get(doc.id)?.length ?? 0) > 0;
  }

  const total = docs.length;
  const complete = docs.filter(isComplete).length;
  const incomplete = Math.max(0, total - complete);
  const percent = total === 0 ? 0 : Math.round((complete / total) * 100);

  const uploadedCount = docs.filter((d) => (fileByDocId.get(d.id)?.length ?? 0) > 0).length;
  const locationNotedCount = docs.filter(
    (d) => (fileByDocId.get(d.id)?.length ?? 0) === 0 && (locationsByDocId.get(d.id)?.length ?? 0) > 0
  ).length;

  const completionTone = useMemo(() => {
    if (percent >= 80) {
      return {
        badge: "Well protected",
        text: "Your family's most important records are in strong shape. Keep them current as life changes.",
      };
    }
    if (percent >= 50) {
      return {
        badge: "Building protection",
        text: "Add documents or location notes by category, then mark each one protected when you feel it's covered.",
      };
    }
    return {
      badge: "Starting your journey",
      text: "Start with key categories. Upload documents to the vault, or record where each one lives — either path works.",
    };
  }, [percent]);

  // ── Actions ────────────────────────────────────────────────────────────────

  async function toggle(doc: ReadinessDoc) {
    setBusyDocId(doc.id);
    setDocs((prev) => prev.map((d) => (d.id === doc.id ? { ...d, is_present: !d.is_present } : d)));
    try {
      const res = await fetch("/api/readiness/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: doc.id, is_present: !doc.is_present }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to update");
      setDocs((prev) => prev.map((d) => (d.id === doc.id ? (json.document as ReadinessDoc) : d)));
    } catch (e: unknown) {
      setDocs((prev) => prev.map((d) => (d.id === doc.id ? { ...d, is_present: doc.is_present } : d)));
      alert(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setBusyDocId(null);
    }
  }

  async function seedDefaults() {
    try {
      const res = await fetch("/api/readiness/documents/seed", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Seed failed");
      await load();
      await loadFiles();
      await loadLocations();
      alert(`Setup complete. Added: ${json.inserted ?? 0} categories`);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Setup failed");
    }
  }

  async function attachFile(doc: ReadinessDoc, file: File) {
    setUploadingDocId(doc.id);
    try {
      const fd = new FormData();
      fd.append("readiness_document_id", doc.id);
      fd.append("file", file);
      const res = await fetch("/api/readiness/documents/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Upload failed");
      trackEvent("document_uploaded", { category: doc.category, item_key: doc.item_key });
      setDocs((prev) => prev.map((d) => (d.id === doc.id ? (json.document as ReadinessDoc) : d)));
      await loadFiles();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingDocId(null);
    }
  }

  async function viewFile(fileId: string) {
    const res = await fetch("/api/readiness/documents/files/signed-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file_id: fileId, expires_in: 600 }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || "Failed to create signed URL");
    if (!json?.url) throw new Error("No signed URL returned");
    window.open(json.url, "_blank", "noopener,noreferrer");
  }

  function openLocationForm(docId: string) {
    setAddingLocationForDocId(docId);
    setLocationForm(BLANK_FORM);
  }

  function closeLocationForm() {
    setAddingLocationForDocId(null);
    setLocationForm(BLANK_FORM);
  }

  async function addLocation(doc: ReadinessDoc) {
    if (!locationForm.document_type || !locationForm.location_description.trim()) return;
    setSavingLocationForDocId(doc.id);
    try {
      const res = await fetch("/api/document-locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          readiness_document_id: doc.id,
          document_type: locationForm.document_type,
          location_description: locationForm.location_description,
          access_instructions: locationForm.access_instructions || undefined,
          contact_person: locationForm.contact_person || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to save");
      setLocations((prev) => [json.location as DocumentLocation, ...prev]);
      closeLocationForm();
      trackEvent("document_location_recorded", { category: doc.category });
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to save location note");
    } finally {
      setSavingLocationForDocId(null);
    }
  }

  async function deleteLocation(locationId: string) {
    setDeletingLocationId(locationId);
    try {
      const res = await fetch(`/api/document-locations?id=${locationId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to delete");
      setLocations((prev) => prev.filter((l) => l.id !== locationId));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setDeletingLocationId(null);
    }
  }

  // ── Loading / error states ─────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5]">
        <DashboardHeader />
        <main className="mx-auto max-w-7xl px-6 py-8 md:px-8 lg:px-10">
          <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
            <div className="border-b border-stone-100 px-6 py-8 md:px-8">
              <div className="h-4 w-36 animate-pulse rounded bg-stone-100" />
              <div className="mt-4 h-10 w-80 animate-pulse rounded bg-stone-100" />
            </div>
            <div className="grid gap-5 px-6 py-6 md:grid-cols-3 md:px-8">
              {[1, 2, 3].map((item) => (
                <div key={item} className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
                  <div className="h-4 w-24 animate-pulse rounded bg-stone-200" />
                  <div className="mt-4 h-10 w-16 animate-pulse rounded bg-stone-200" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen bg-[#faf8f5]">
        <DashboardHeader />
        <main className="mx-auto max-w-7xl px-6 py-8 md:px-8 lg:px-10">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <div className="text-lg font-semibold text-stone-900">Documents</div>
            <p className="mt-2 text-sm text-red-700">{err}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/dashboard/readiness/overview" className="inline-flex items-center rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700">
                Back to Overview
              </Link>
              <button type="button" onClick={() => window.location.reload()} className="inline-flex items-center rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50">
                Try again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <DashboardHeader />
      <main className="mx-auto max-w-7xl px-6 py-8 md:px-8 lg:px-10">
        <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">

          {/* Header */}
          <div className="relative border-b border-stone-100 px-6 py-8 md:px-8 md:py-10 bg-gradient-to-br from-amber-50/60 to-stone-50">
            <div className="relative">
              <div className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
                {completionTone.badge}
              </div>

              <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <h1 className="font-serif text-3xl font-semibold tracking-tight text-stone-900 md:text-4xl">
                    Family Documents
                  </h1>
                  <p className="mt-3 text-sm leading-7 text-stone-500 md:text-base">
                    {completionTone.text}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link href="/dashboard/readiness/overview" className="inline-flex items-center justify-center rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50">
                    Back to Overview
                  </Link>
                  <Link href="/dashboard/vault" className="inline-flex items-center justify-center rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-amber-700">
                    Open Vault
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid gap-5 px-6 py-6 md:grid-cols-3 md:px-8">
            <StatCard
              label="Protection Score"
              value={`${percent}%`}
              subtext={`${complete} of ${total} categories secured`}
            />
            <StatCard
              label="Secured"
              value={complete}
              subtext={
                complete === 0
                  ? "Add uploads or location notes to get started"
                  : `${uploadedCount} uploaded · ${locationNotedCount} location ${locationNotedCount === 1 ? "note" : "notes"}`
              }
            />
            <StatCard
              label="Not yet recorded"
              value={incomplete}
              subtext="Upload a file or record where it lives"
            />
          </div>

          <div className="px-6 pb-8 md:px-8">

            {/* Optional-upload info card */}
            <div className="mb-6 rounded-2xl border border-amber-100 bg-amber-50/60 px-5 py-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0 text-amber-500 select-none text-lg">◈</div>
                <div>
                  <div className="font-medium text-stone-800 text-sm">
                    Already have your documents secured elsewhere?
                  </div>
                  <p className="mt-1 text-sm text-stone-500 leading-relaxed">
                    That&apos;s perfectly fine. Many users keep important documents in their own cloud drive,
                    a fireproof safe, or with a trusted attorney. Life Sentinel&apos;s readiness features work
                    whether or not you upload here. If you&apos;d rather not upload, use{" "}
                    <span className="font-medium text-stone-700">Document Location Notes</span> below to record
                    where your family can find each item — it counts toward your readiness score just the same.
                  </p>
                </div>
              </div>
            </div>

            {docs.length === 0 ? (
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6 shadow-sm">
                <h2 className="font-serif text-lg font-semibold text-stone-900">
                  Let&apos;s set up your categories
                </h2>
                <p className="mt-2 text-sm text-stone-500">
                  We&apos;ll create the standard document categories to get you started.
                </p>
                <div className="mt-5">
                  <button
                    onClick={seedDefaults}
                    className="inline-flex items-center justify-center rounded-xl bg-amber-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-amber-700"
                  >
                    Set up my categories
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {docsSorted.map((doc) => {
                  const list = fileByDocId.get(doc.id) ?? [];
                  const locationList = locationsByDocId.get(doc.id) ?? [];
                  const latest = list[0];
                  const isBusy = busyDocId === doc.id;
                  const isUploading = uploadingDocId === doc.id;
                  const hasFiles = list.length > 0;
                  const hasLocationNotes = locationList.length > 0;
                  const docComplete = doc.is_present || hasFiles || hasLocationNotes;
                  const isAddingLocation = addingLocationForDocId === doc.id;
                  const isSavingLocation = savingLocationForDocId === doc.id;
                  const docTypes = getDocumentTypesForCategory(doc.item_label);
                  const examples = getCategoryExamples(doc.item_label);

                  const statusLabel = hasFiles
                    ? "Uploaded to vault"
                    : hasLocationNotes
                      ? "Location recorded"
                      : "Not yet recorded";

                  const badgeText = doc.is_present ? "Protected" : hasLocationNotes ? "Location recorded" : "In progress";
                  const badgeClass = doc.is_present
                    ? "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                    : hasLocationNotes
                      ? "rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700"
                      : "rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-semibold text-stone-500";

                  void docComplete; // used for scoring; rendering uses badgeText

                  return (
                    <section
                      key={doc.id}
                      className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                        {/* Left column */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <div className={`h-2.5 w-2.5 rounded-full ${getCategoryAccent(doc.item_label)}`} />
                            <h2 className="font-serif text-2xl font-semibold text-stone-900">
                              {getCategoryLabel(doc.item_label)}
                            </h2>
                          </div>

                          {/* Common documents hint */}
                          <div className="mt-4 rounded-2xl border border-stone-100 bg-stone-50 px-4 py-4">
                            <div className="text-sm font-medium text-stone-600">
                              Common documents for this category
                            </div>
                            <div className="mt-2 text-sm leading-7 text-stone-400">
                              {examples.join(" · ")}
                            </div>
                          </div>

                          {/* Uploaded files */}
                          <div className="mt-5 rounded-2xl border border-stone-100 bg-stone-50 p-4">
                            <div className="text-sm font-medium text-stone-600">Documents added</div>
                            {list.length === 0 ? (
                              <div className="mt-2 text-sm text-stone-400">No documents uploaded yet.</div>
                            ) : (
                              <div className="mt-3 space-y-2">
                                {list.slice(0, 4).map((file) => (
                                  <div
                                    key={file.id}
                                    className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-3 py-2"
                                  >
                                    <div className="truncate text-sm text-stone-700">{file.file_name}</div>
                                    <button
                                      className="shrink-0 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:bg-stone-100"
                                      onClick={async () => {
                                        try { await viewFile(file.id); }
                                        catch (e: unknown) { alert(e instanceof Error ? e.message : "View failed"); }
                                      }}
                                    >
                                      View
                                    </button>
                                  </div>
                                ))}
                                {list.length > 4 && (
                                  <div className="text-xs text-stone-400">+{list.length - 4} more documents</div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* ── Document Location Notes ── */}
                          <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50/30 p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-medium text-stone-700">Document location notes</div>
                                <div className="mt-0.5 text-xs text-stone-400 leading-relaxed">
                                  Prefer not to upload? Record where these documents can be found.
                                </div>
                              </div>
                              {!isAddingLocation && (
                                <button
                                  onClick={() => openLocationForm(doc.id)}
                                  className="shrink-0 rounded-xl border border-amber-200 bg-white px-3 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-50"
                                >
                                  + Add note
                                </button>
                              )}
                            </div>

                            {/* Existing location notes */}
                            {locationList.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {locationList.map((loc) => (
                                  <div
                                    key={loc.id}
                                    className="rounded-xl border border-amber-100 bg-white p-3"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="min-w-0">
                                        <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                                          {loc.document_type}
                                        </div>
                                        <div className="mt-1 text-sm text-stone-700 leading-relaxed">
                                          {loc.location_description}
                                        </div>
                                        {loc.access_instructions && (
                                          <div className="mt-1 text-xs text-stone-500 leading-relaxed">
                                            Access: {loc.access_instructions}
                                          </div>
                                        )}
                                        {loc.contact_person && (
                                          <div className="mt-1 text-xs text-stone-400">
                                            Contact: {loc.contact_person}
                                          </div>
                                        )}
                                      </div>
                                      <button
                                        disabled={deletingLocationId === loc.id}
                                        onClick={() => deleteLocation(loc.id)}
                                        className="shrink-0 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs text-stone-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                      >
                                        {deletingLocationId === loc.id ? "…" : "Remove"}
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Add location form */}
                            {isAddingLocation && (
                              <div className="mt-3 rounded-xl border border-amber-200 bg-white p-4 space-y-3">
                                <div>
                                  <label className="block text-xs font-medium text-stone-600 mb-1">
                                    Document type <span className="text-red-400">*</span>
                                  </label>
                                  <select
                                    value={locationForm.document_type}
                                    onChange={(e) => setLocationForm((f) => ({ ...f, document_type: e.target.value }))}
                                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                  >
                                    <option value="">Select a document type…</option>
                                    {docTypes.map((t) => (
                                      <option key={t} value={t}>{t}</option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-stone-600 mb-1">
                                    Where is it? <span className="text-red-400">*</span>
                                  </label>
                                  <textarea
                                    value={locationForm.location_description}
                                    onChange={(e) => setLocationForm((f) => ({ ...f, location_description: e.target.value }))}
                                    placeholder="e.g. Fireproof safe in master bedroom closet, top shelf. Or: iCloud Drive › Documents › Legal."
                                    rows={2}
                                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-stone-600 mb-1">
                                    Access instructions <span className="text-stone-300">(optional)</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={locationForm.access_instructions}
                                    onChange={(e) => setLocationForm((f) => ({ ...f, access_instructions: e.target.value }))}
                                    placeholder="e.g. Safe combination is in 1Password under 'Home Safe'"
                                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                  />
                                  <p className="mt-1.5 flex items-start gap-1.5 text-xs text-stone-400 leading-relaxed">
                                    <span className="mt-px select-none">◈</span>
                                    <span>
                                      <span className="font-medium text-stone-500">Tip:</span>{" "}
                                      Avoid storing actual passwords, combinations, or PINs here. Instead, point to where they&rsquo;re stored — e.g., &ldquo;1Password vault,&rdquo; &ldquo;sealed envelope with attorney,&rdquo; or &ldquo;written inside the front cover of the family Bible.&rdquo;
                                    </span>
                                  </p>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-stone-600 mb-1">
                                    Contact person <span className="text-stone-300">(optional)</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={locationForm.contact_person}
                                    onChange={(e) => setLocationForm((f) => ({ ...f, contact_person: e.target.value }))}
                                    placeholder="e.g. Attorney Jane Smith, (703) 555-0100"
                                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                  />
                                </div>

                                <div className="flex gap-2 pt-1">
                                  <button
                                    disabled={isSavingLocation || !locationForm.document_type || !locationForm.location_description.trim()}
                                    onClick={() => addLocation(doc)}
                                    className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-amber-700 disabled:opacity-50"
                                  >
                                    {isSavingLocation ? "Saving…" : "Save note"}
                                  </button>
                                  <button
                                    onClick={closeLocationForm}
                                    className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-xs font-medium text-stone-600 transition hover:bg-stone-100"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right column — protection status */}
                        <div className="w-full max-w-md">
                          <div className="rounded-2xl border border-stone-100 bg-stone-50 p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="text-sm font-medium text-stone-700">Protection status</div>
                                <div className="mt-1 text-xs text-stone-400">{statusLabel}</div>
                                <div className="mt-2 text-sm text-stone-500">
                                  Upload a document or record a location note — both count toward your score.
                                </div>
                              </div>
                              <div className={badgeClass}>{badgeText}</div>
                            </div>

                            <div className="mt-5">
                              <label className="flex items-center gap-3 text-sm text-stone-700">
                                <input
                                  type="checkbox"
                                  checked={doc.is_present}
                                  disabled={isBusy}
                                  onChange={() => toggle(doc)}
                                  className="h-4 w-4 rounded border-stone-300 accent-amber-600"
                                />
                                <span>Mark this category protected</span>
                              </label>
                            </div>

                            <div className="mt-5 flex flex-wrap gap-2">
                              <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50">
                                {isUploading ? "Uploading…" : "Add document"}
                                <input
                                  type="file"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const f = e.target.files?.[0];
                                    e.currentTarget.value = "";
                                    if (!f) return;
                                    await attachFile(doc, f);
                                  }}
                                />
                              </label>

                              {latest && (
                                <button
                                  className="inline-flex items-center justify-center rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                                  onClick={async () => {
                                    try { await viewFile(latest.id); }
                                    catch (e: unknown) { alert(e instanceof Error ? e.message : "View failed"); }
                                  }}
                                >
                                  View latest
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
