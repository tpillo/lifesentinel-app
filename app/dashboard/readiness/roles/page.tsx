"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import DashboardHeader from "@/components/DashboardHeader";

type RoleRow = {
  id: string;
  role_type: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
};

const roleLabels: Record<string, string> = {
  primary_survivor: "Primary Survivor",
  trigger_authority: "Trigger Authority",
  secondary_helper: "Secondary Helper",
};

export default function ReadinessRolesPage() {
  const [rows, setRows] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [roleType, setRoleType] = useState("primary_survivor");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  async function getUserId() {
    const { data: auth } = await supabase.auth.getUser();
    return auth?.user?.id ?? null;
  }

  async function load() {
    setLoading(true);
    setError(null);
    const userId = await getUserId();
    if (!userId) { setError("NOT_AUTHENTICATED"); setLoading(false); return; }
    const res = await fetch(`/api/readiness/roles?userId=${userId}`);
    const json = await res.json();
    if (!res.ok) { setError(json?.error ?? "Failed to load roles"); setLoading(false); return; }
    setRows(json);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function addRole() {
    setError(null);
    const userId = await getUserId();
    if (!userId) { setError("NOT_AUTHENTICATED"); return; }
    const res = await fetch("/api/readiness/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role_type: roleType, full_name: fullName, email, phone, notes }),
    });
    const json = await res.json();
    if (!res.ok) { setError(json?.error ?? "Failed to add role"); return; }
    setFullName(""); setEmail(""); setPhone(""); setNotes("");
    await load();
  }

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
            Trusted People
          </h1>
          <p className="mt-2 text-sm text-stone-500 leading-relaxed">
            Designate the people in your life who should know where to find things and what to do.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-lg font-semibold text-stone-900 mb-5">Add a person</h2>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-stone-700">Role</span>
                <select
                  value={roleType}
                  onChange={(e) => setRoleType(e.target.value)}
                  className="mt-1.5 block w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-stone-900 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                >
                  <option value="primary_survivor">Primary Survivor</option>
                  <option value="trigger_authority">Trigger Authority</option>
                  <option value="secondary_helper">Secondary Helper</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-stone-700">Full Name *</span>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Smith"
                  className="mt-1.5 block w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-stone-900 placeholder-stone-400 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-stone-700">Email</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="mt-1.5 block w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-stone-900 placeholder-stone-400 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-stone-700">Phone</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  className="mt-1.5 block w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-stone-900 placeholder-stone-400 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-stone-700">Notes</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Any additional context about this person's role…"
                className="mt-1.5 block w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-stone-900 placeholder-stone-400 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 resize-none"
              />
            </label>

            <button
              onClick={addRole}
              className="rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-amber-700"
            >
              Add person
            </button>
          </div>
        </div>

        {rows.length > 0 && (
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-lg font-semibold text-stone-900 mb-5">
              People you&apos;ve designated
            </h2>

            <div className="space-y-4">
              {rows.map((r) => (
                <div key={r.id} className="rounded-xl border border-stone-100 bg-stone-50 px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-stone-900">{r.full_name}</div>
                      {(r.email || r.phone) && (
                        <div className="mt-1 text-sm text-stone-500">
                          {[r.email, r.phone].filter(Boolean).join(" · ")}
                        </div>
                      )}
                      {r.notes && (
                        <div className="mt-2 text-sm text-stone-400">{r.notes}</div>
                      )}
                    </div>
                    <div className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
                      {roleLabels[r.role_type] ?? r.role_type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {rows.length === 0 && !loading && (
          <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 p-8 text-center">
            <p className="text-sm text-stone-400">No one added yet. Use the form above to designate trusted people.</p>
          </div>
        )}

        <div>
          <Link href="/dashboard/readiness/overview" className="text-sm text-amber-700 hover:text-amber-800 transition">
            ← Back to Overview
          </Link>
        </div>
      </main>
    </div>
  );
}
