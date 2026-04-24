"use client";

import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import Link from "next/link";

type User = {
  id: string;
  email: string;
  full_name: string | null;
  approved: boolean;
  created_at: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchUsers() {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    if (!res.ok) { setError("Failed to load users"); setLoading(false); return; }
    const data = await res.json();
    setUsers(data.users);
    setLoading(false);
  }

  async function approve(user_id: string) {
    setApproving(user_id);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id }),
    });
    if (!res.ok) { setError("Approval failed"); setApproving(null); return; }
    setUsers((prev) => prev.map((u) => u.id === user_id ? { ...u, approved: true } : u));
    setApproving(null);
  }

  useEffect(() => { fetchUsers(); }, []);

  const pending = users.filter((u) => !u.approved);
  const approved = users.filter((u) => u.approved);

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <header className="border-b border-stone-200 bg-white px-6 py-4 flex items-center justify-between">
        <Link href="/"><Logo /></Link>
        <span className="text-xs text-stone-400 font-medium uppercase tracking-widest">Admin</span>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8 space-y-8">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-stone-900">User Management</h1>
          <p className="text-sm text-stone-500 mt-1">{users.length} total users · {pending.length} pending approval</p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {loading ? (
          <div className="text-sm text-stone-400">Loading users…</div>
        ) : (
          <>
            {pending.length > 0 && (
              <section>
                <h2 className="font-serif text-lg font-semibold text-stone-800 mb-3">Pending Approval</h2>
                <div className="space-y-2">
                  {pending.map((u) => (
                    <div key={u.id} className="rounded-2xl border border-amber-200 bg-amber-50/40 px-5 py-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-stone-800">{u.full_name ?? <span className="text-stone-400 italic">No name yet</span>}</p>
                        <p className="text-xs text-stone-500">{u.email}</p>
                        <p className="text-xs text-stone-400 mt-0.5">Registered {new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                      </div>
                      <button
                        onClick={() => approve(u.id)}
                        disabled={approving === u.id}
                        className="shrink-0 rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700 disabled:opacity-50"
                      >
                        {approving === u.id ? "Approving…" : "Approve"}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {approved.length > 0 && (
              <section>
                <h2 className="font-serif text-lg font-semibold text-stone-800 mb-3">Approved Users</h2>
                <div className="space-y-2">
                  {approved.map((u) => (
                    <div key={u.id} className="rounded-2xl border border-stone-200 bg-white px-5 py-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-stone-800">{u.full_name ?? <span className="text-stone-400 italic">No name yet</span>}</p>
                        <p className="text-xs text-stone-500">{u.email}</p>
                        <p className="text-xs text-stone-400 mt-0.5">Registered {new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                      </div>
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">✓ Approved</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {users.length === 0 && (
              <p className="text-sm text-stone-400">No users yet.</p>
            )}
          </>
        )}
      </main>
    </div>
  );
}
