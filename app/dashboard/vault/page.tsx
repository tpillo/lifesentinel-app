"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";

type VaultFile = {
  id: string;
  file_name: string;
  category: string;
  signedUrl: string | null;
  signedUrlError?: string | null;
  mime_type?: string | null;
  file_size?: number | null;
  created_at?: string | null;
};

function formatFileSize(bytes?: number | null) {
  if (!bytes || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size >= 10 || unitIndex === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[unitIndex]}`;
}

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString();
}

export default function VaultPage() {
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadFiles() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/vault/files", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.details || data?.error || "Failed to load vault files");
        }

        if (!cancelled) setFiles(Array.isArray(data) ? data : []);
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Failed to load vault files");
          setFiles([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFiles();
    return () => { cancelled = true; };
  }, []);

  const groupedFiles = useMemo(() => {
    const groups: Record<string, VaultFile[]> = {};
    for (const file of files) {
      const category = file.category || "Other";
      if (!groups[category]) groups[category] = [];
      groups[category].push(file);
    }
    return groups;
  }, [files]);

  const orderedCategories = useMemo(() => {
    const preferredOrder = ["Identity", "Legal", "Insurance", "Finance", "Family", "Military", "VA", "Other"];
    const present = Object.keys(groupedFiles);
    return [
      ...preferredOrder.filter((c) => present.includes(c)),
      ...present.filter((c) => !preferredOrder.includes(c)).sort(),
    ];
  }, [groupedFiles]);

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <DashboardHeader />
      <main className="mx-auto max-w-7xl px-6 py-6 md:px-8 lg:px-10">
        <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          <div className="flex flex-col gap-6 px-8 py-8 md:flex-row md:items-center md:justify-between bg-gradient-to-br from-amber-50/60 to-stone-50 border-b border-stone-100">
            <div>
              <div className="mb-4 inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-medium text-amber-800">
                Secure Storage
              </div>

              <h1 className="font-serif text-3xl font-semibold tracking-tight text-stone-900 md:text-4xl">
                Family Vault
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-500 md:text-base">
                All the documents you&apos;ve safeguarded, organized by category — ready when your family needs them.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/readiness/documents"
                className="inline-flex items-center rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-amber-700"
              >
                Add Documents
              </Link>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {loading ? (
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-8 text-sm text-stone-400">
                Loading your vault…
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-sm text-red-700">
                {error}
              </div>
            ) : orderedCategories.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 p-10 text-center">
                <p className="text-stone-500 text-sm">No documents in the vault yet.</p>
                <Link
                  href="/dashboard/readiness/documents"
                  className="mt-4 inline-flex items-center rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-amber-700"
                >
                  Add your first document
                </Link>
              </div>
            ) : (
              orderedCategories.map((category) => {
                const categoryFiles = groupedFiles[category] || [];

                return (
                  <section
                    key={category}
                    className="rounded-2xl border border-stone-200 bg-stone-50/50 p-6"
                  >
                    <div className="mb-5">
                      <h2 className="font-serif text-xl font-semibold text-stone-900">{category}</h2>
                      <p className="mt-1 text-sm text-stone-400">
                        {categoryFiles.length} document{categoryFiles.length === 1 ? "" : "s"}
                      </p>
                    </div>

                    <div className="space-y-3">
                      {categoryFiles.map((file) => {
                        const canOpen = Boolean(file.signedUrl);

                        return (
                          <div
                            key={file.id}
                            className="flex flex-col gap-4 rounded-xl border border-stone-200 bg-white p-5 transition hover:shadow-sm md:flex-row md:items-center md:justify-between"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-base font-medium text-stone-800">
                                {file.file_name}
                              </div>

                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                {file.mime_type && (
                                  <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-0.5 text-xs text-stone-400">
                                    {file.mime_type}
                                  </span>
                                )}
                                {file.file_size && (
                                  <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-0.5 text-xs text-stone-400">
                                    {formatFileSize(file.file_size)}
                                  </span>
                                )}
                                {file.created_at && (
                                  <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-0.5 text-xs text-stone-400">
                                    Added {formatDate(file.created_at)}
                                  </span>
                                )}
                              </div>

                              {file.signedUrlError && (
                                <div className="mt-2 text-xs text-red-500">{file.signedUrlError}</div>
                              )}
                            </div>

                            <div className="flex shrink-0 items-center gap-3">
                              <a
                                href={canOpen ? file.signedUrl! : "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium transition ${
                                  canOpen
                                    ? "border border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
                                    : "cursor-not-allowed border border-stone-200 bg-stone-50 text-stone-300"
                                }`}
                                onClick={(e) => { if (!canOpen) e.preventDefault(); }}
                              >
                                View
                              </a>

                              <a
                                href={canOpen ? `/api/vault/download?id=${encodeURIComponent(file.id)}` : "#"}
                                className={`inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium transition ${
                                  canOpen
                                    ? "bg-amber-600 text-white hover:bg-amber-700"
                                    : "cursor-not-allowed border border-stone-200 bg-stone-50 text-stone-300"
                                }`}
                                onClick={(e) => { if (!canOpen) e.preventDefault(); }}
                              >
                                Download
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
