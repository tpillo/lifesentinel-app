"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type DocItem = {
  id: string;
  category: string;
  item_label: string;
  is_present: boolean;
};

export default function ReadinessDocumentsPage() {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchDocs(userId: string) {
    const res = await fetch(`/api/readiness/documents?userId=${userId}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error ?? "Failed to load documents");
    return json as DocItem[];
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      const { data: auth, error: authErr } = await supabase.auth.getUser();
      if (authErr) {
        setError(authErr.message);
        setLoading(false);
        return;
      }

      const user = auth?.user;
      if (!user) {
        setError("NOT_AUTHENTICATED");
        setLoading(false);
        return;
      }

      try {
        const data = await fetchDocs(user.id);
        setDocs(data);
      } catch (e: any) {
        setError(e?.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function seedChecklist() {
    setError(null);

    const { data: sessionData, error: sessErr } = await supabase.auth.getSession();
    if (sessErr) {
      setError(sessErr.message);
      return;
    }

    const accessToken = sessionData?.session?.access_token;
    if (!accessToken) {
      setError("No access token found. Are you logged in?");
      return;
    }

    const res = await fetch("/api/readiness/seed", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json?.error ?? "Seed failed");
      return;
    }

    // Reload
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) {
      setError("NOT_AUTHENTICATED");
      return;
    }

    const fresh = await fetchDocs(user.id);
    setDocs(fresh);
  }

  async function toggle(id: string, current: boolean) {
    const res = await fetch("/api/readiness/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_present: !current }),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json?.error ?? "Update failed");
      return;
    }

    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, is_present: !current } : d)));
  }

  const grouped = docs.reduce<Record<string, DocItem[]>>((acc, d) => {
    acc[d.category] = acc[d.category] || [];
    acc[d.category].push(d);
    return acc;
  }, {});

  if (loading) return <main style={{ padding: 16 }}>Loading…</main>;

  return (
    <main style={{ padding: 16, maxWidth: 800 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Documents</h1>
      <p style={{ marginTop: 8 }}>Confirm required documents are present.</p>

      <button
        onClick={seedChecklist}
        style={{
          marginTop: 12,
          padding: "8px 12px",
          borderRadius: 8,
          border: "1px solid #444",
          cursor: "pointer",
        }}
      >
        Seed checklist (one-time)
      </button>

      {error ? (
        <pre style={{ marginTop: 12, background: "#111", color: "#eee", padding: 12, borderRadius: 8 }}>
{error}
        </pre>
      ) : null}

      {Object.keys(grouped).length === 0 ? (
        <div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
          No checklist items yet. Click “Seed checklist (one-time)”.
        </div>
      ) : (
        <div style={{ marginTop: 16 }}>
          {Object.entries(grouped).map(([category, items]) => (
            <div
              key={category}
              style={{
                marginBottom: 18,
                padding: 12,
                border: "1px solid #ddd",
                borderRadius: 10,
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 8 }}>{category}</div>

              {items.map((doc) => (
                <label key={doc.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "6px 0" }}>
                  <input type="checkbox" checked={doc.is_present} onChange={() => toggle(doc.id, doc.is_present)} />
                  <span>{doc.item_label}</span>
                </label>
              ))}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <Link href="/dashboard/readiness/overview">← Back to Overview</Link>
      </div>
    </main>
  );
}
