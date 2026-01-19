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

  useEffect(() => {
    async function loadDocs() {
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

      const res = await fetch(`/api/readiness/documents?userId=${user.id}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Failed to load documents");
        setLoading(false);
        return;
      }

      setDocs(data);
      setLoading(false);
    }

    loadDocs();
  }, []);

  async function toggle(id: string, current: boolean) {
    const res = await fetch("/api/readiness/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_present: !current }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data?.error ?? "Update failed");
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

  if (error) {
    return (
      <main style={{ padding: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Documents</h1>
        <p style={{ marginTop: 8 }}>Error:</p>
        <pre style={{ marginTop: 12, background: "#111", color: "#eee", padding: 12, borderRadius: 8 }}>
{error}
        </pre>
        <div style={{ marginTop: 24 }}>
          <Link href="/dashboard/readiness/overview">← Back</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: 16, maxWidth: 800 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Documents</h1>
      <p style={{ marginTop: 8 }}>Confirm required documents are present.</p>

      {Object.keys(grouped).length === 0 ? (
        <div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
          No readiness checklist items found yet.
        </div>
      ) : (
        <div style={{ marginTop: 16 }}>
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} style={{ marginBottom: 18, padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>{category}</div>
              {items.map((doc) => (
                <label key={doc.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "6px 0" }}>
                  <input
                    type="checkbox"
                    checked={doc.is_present}
                    onChange={() => toggle(doc.id, doc.is_present)}
                  />
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
