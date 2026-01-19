"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

type DocItem = {
  id: string;
  category: string;
  item_key: string;
  item_label: string;
  is_present: boolean;
};

export default function ReadinessPage() {
  const supabase = createClient();

  const [items, setItems] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const { data, error } = await supabase
        .from("readiness_documents")
        .select("*")
        .order("category", { ascending: true });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setItems(data ?? []);
      setLoading(false);
    }

    load();
  }, [supabase]);

  if (loading) {
    return <div style={{ padding: 24 }}>Loading readiness…</div>;
  }

  if (error) {
    return (
      <div style={{ padding: 24, color: "red" }}>
        Error loading readiness: {error}
      </div>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, marginBottom: 20 }}>Readiness</h1>

      <p style={{ marginBottom: 24 }}>
        Track critical documents and preparedness items for your family.
      </p>

      {items.length === 0 && (
        <p>No readiness items found.</p>
      )}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {items.map((item) => (
          <li
            key={item.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px 0",
              borderBottom: "1px solid #ddd",
            }}
          >
            <span>{item.item_label}</span>
            <span>
              {item.is_present ? "✅" : "❌"}
            </span>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 32 }}>
        <Link href="/dashboard">
          ← Back to dashboard
        </Link>
      </div>
    </main>
  );
}
