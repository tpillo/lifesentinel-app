"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type RoleRow = {
  id: string;
  role_type: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
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
    if (!userId) {
      setError("NOT_AUTHENTICATED");
      setLoading(false);
      return;
    }

    const res = await fetch(`/api/readiness/roles?userId=${userId}`);
    const json = await res.json();
    if (!res.ok) {
      setError(json?.error ?? "Failed to load roles");
      setLoading(false);
      return;
    }

    setRows(json);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function addRole() {
    setError(null);

    const userId = await getUserId();
    if (!userId) {
      setError("NOT_AUTHENTICATED");
      return;
    }

    const res = await fetch("/api/readiness/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        role_type: roleType,
        full_name: fullName,
        email,
        phone,
        notes,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json?.error ?? "Failed to add role");
      return;
    }

    setFullName("");
    setEmail("");
    setPhone("");
    setNotes("");
    await load();
  }

  if (loading) return <main style={{ padding: 16 }}>Loading…</main>;

  return (
    <main style={{ padding: 16, maxWidth: 900 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Roles</h1>
      <p style={{ marginTop: 8 }}>
        Choose trusted people for left-of-death readiness.
      </p>

      {error ? (
        <pre style={{ marginTop: 12, background: "#111", color: "#eee", padding: 12, borderRadius: 8 }}>
{error}
        </pre>
      ) : null}

      <div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <label>
            Role
            <div>
              <select value={roleType} onChange={(e) => setRoleType(e.target.value)}>
                <option value="primary_survivor">Primary Survivor</option>
                <option value="trigger_authority">Trigger Authority</option>
                <option value="secondary_helper">Secondary Helper</option>
              </select>
            </div>
          </label>

          <label>
            Full Name *
            <div>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
          </label>

          <label>
            Email
            <div>
              <input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </label>

          <label>
            Phone
            <div>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </label>
        </div>

        <label style={{ display: "block", marginTop: 12 }}>
          Notes
          <div>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} style={{ width: "100%" }} />
          </div>
        </label>

        <button
          onClick={addRole}
          style={{
            marginTop: 12,
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #444",
            cursor: "pointer",
          }}
        >
          Add Role
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        {rows.length === 0 ? (
          <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
            No roles added yet.
          </div>
        ) : (
          <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
            <strong>Current roles</strong>
            {rows.map((r) => (
              <div key={r.id} style={{ marginTop: 10 }}>
                <div><strong>{r.role_type}</strong>: {r.full_name}</div>
                <div style={{ opacity: 0.85 }}>{r.email ?? ""} {r.phone ?? ""}</div>
                {r.notes ? <div style={{ opacity: 0.85 }}>{r.notes}</div> : null}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        <Link href="/dashboard/readiness/overview">← Back to Overview</Link>
      </div>
    </main>
  );
}
