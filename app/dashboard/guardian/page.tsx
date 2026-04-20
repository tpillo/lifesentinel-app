"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import DashboardHeader from "@/components/DashboardHeader";
import { trackEvent } from "@/lib/gtag";

type GuardianLink = {
  id: string;
  token: string;
  expires_at: string | null;
  revoked_at: string | null;
  allowed_categories: string[];
  created_at: string;
};

const EXPIRY_OPTIONS = [
  { label: "24 hours", hours: 24 },
  { label: "3 days", hours: 72 },
  { label: "7 days", hours: 168 },
  { label: "30 days", hours: 720 },
  { label: "1 year", hours: 8760 },
];

function linkStatus(link: GuardianLink): "active" | "expired" | "revoked" {
  if (link.revoked_at) return "revoked";
  if (link.expires_at && new Date(link.expires_at) < new Date()) return "expired";
  return "active";
}

function formatExpiry(link: GuardianLink): string {
  if (link.revoked_at) return "Revoked";
  if (!link.expires_at) return "No expiry";
  const exp = new Date(link.expires_at);
  if (exp < new Date()) return `Expired ${exp.toLocaleDateString()}`;
  const diffMs = exp.getTime() - Date.now();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 1) return "Expires tomorrow";
  return `Expires in ${diffDays} days`;
}

export default function GuardianSharePage() {
  const [links, setLinks] = useState<GuardianLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expiryHours, setExpiryHours] = useState(720);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  async function loadLinks() {
    const res = await fetch("/api/guardian/list");
    const json = await res.json();
    if (!res.ok) { setError(json?.error ?? "Failed to load links"); return; }
    setLinks(json.links ?? []);
  }

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
      await loadLinks();
      setLoading(false);
    }
    init();
  }, []);

  async function createLink() {
    if (!userId) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/guardian/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner_user_id: userId, expiresInHours: expiryHours }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to create link");
      trackEvent("guardian_designated", { expires_in_hours: expiryHours });
      await loadLinks();
    } catch (e: any) {
      setError(e?.message ?? "Failed to create link");
    } finally {
      setCreating(false);
    }
  }

  async function revokeLink(token: string) {
    setRevoking(token);
    try {
      const res = await fetch("/api/guardian/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to revoke");
      await loadLinks();
    } catch (e: any) {
      setError(e?.message ?? "Failed to revoke");
    } finally {
      setRevoking(null);
    }
  }

  function copyLink(token: string) {
    const url = `${window.location.origin}/g/${token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    });
  }

  const activeLinks = links.filter((l) => linkStatus(l) === "active");
  const inactiveLinks = links.filter((l) => linkStatus(l) !== "active");

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5]">
        <DashboardHeader />
        <main className="mx-auto max-w-3xl px-6 py-8 md:px-8">
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-8 text-sm text-stone-400">
            Loading…
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <DashboardHeader />
      <main className="mx-auto max-w-3xl px-6 py-8 md:px-8 space-y-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-stone-900">
            Share with a Guardian
          </h1>
          <p className="mt-2 text-sm text-stone-500 leading-relaxed">
            Create a private link for a trusted family member or advisor. They can view your
            documents without needing an account. Links expire automatically and can be
            revoked at any time.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Create new link */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-lg font-semibold text-stone-900 mb-4">
            Create a new link
          </h2>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <label className="flex-1 block">
              <span className="text-sm font-medium text-stone-700">Link expires after</span>
              <select
                value={expiryHours}
                onChange={(e) => setExpiryHours(Number(e.target.value))}
                className="mt-1.5 block w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-stone-900 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
              >
                {EXPIRY_OPTIONS.map((opt) => (
                  <option key={opt.hours} value={opt.hours}>{opt.label}</option>
                ))}
              </select>
            </label>

            <button
              onClick={createLink}
              disabled={creating || !userId}
              className="rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60 sm:mb-0"
            >
              {creating ? "Creating…" : "Create link"}
            </button>
          </div>
        </div>

        {/* Active links */}
        {activeLinks.length > 0 && (
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-lg font-semibold text-stone-900 mb-5">
              Active links
            </h2>

            <div className="space-y-4">
              {activeLinks.map((link) => {
                const url = `${typeof window !== "undefined" ? window.location.origin : ""}/g/${link.token}`;
                const isCopied = copiedToken === link.token;
                const isRevoking = revoking === link.token;

                return (
                  <div
                    key={link.id}
                    className="rounded-xl border border-stone-100 bg-stone-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-2 w-2 rounded-full bg-emerald-500" />
                          <span className="text-xs font-medium text-emerald-700">Active</span>
                          <span className="text-xs text-stone-400">·</span>
                          <span className="text-xs text-stone-400">{formatExpiry(link)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="truncate rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-600 block max-w-xs sm:max-w-sm">
                            {url}
                          </code>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => copyLink(link.token)}
                          className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-amber-700"
                        >
                          {isCopied ? "Copied!" : "Copy link"}
                        </button>
                        <button
                          onClick={() => revokeLink(link.token)}
                          disabled={isRevoking}
                          className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-medium text-stone-500 transition hover:bg-red-50 hover:border-red-200 hover:text-red-600 disabled:opacity-50"
                        >
                          {isRevoking ? "Revoking…" : "Revoke"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeLinks.length === 0 && !loading && (
          <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 p-8 text-center">
            <p className="text-sm text-stone-400">
              No active links. Create one above to share access with a trusted person.
            </p>
          </div>
        )}

        {/* Expired / revoked */}
        {inactiveLinks.length > 0 && (
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-base font-semibold text-stone-500 mb-4">
              Past links
            </h2>

            <div className="space-y-3">
              {inactiveLinks.map((link) => {
                const status = linkStatus(link);
                return (
                  <div
                    key={link.id}
                    className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50 px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${status === "revoked" ? "bg-red-400" : "bg-stone-300"}`} />
                      <span className="text-xs text-stone-400 font-mono">/g/{link.token.slice(0, 12)}…</span>
                    </div>
                    <span className="text-xs text-stone-400">{formatExpiry(link)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
          <p className="text-sm text-amber-800 leading-relaxed">
            <span className="font-medium">How it works:</span> Anyone with a link can view your
            family documents without logging in. They cannot edit or delete anything.
            Revoke the link at any time to cut off access immediately.
          </p>
        </div>
      </main>
    </div>
  );
}
