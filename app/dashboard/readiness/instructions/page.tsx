"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type InstructionData = {
  immediate_72h: string;
  short_term_90d: string;
  long_term: string;
  do_not_do_yet: string;
  key_contacts: string;
  deploying_checklist: string;
};

export default function ReadinessInstructionsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const [data, setData] = useState<InstructionData>({
    immediate_72h: "",
    short_term_90d: "",
    long_term: "",
    do_not_do_yet: "",
    key_contacts: "",
    deploying_checklist: "",
  });

  async function getUserId() {
    const { data: auth } = await supabase.auth.getUser();
    return auth?.user?.id ?? null;
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      const userId = await getUserId();
      if (!userId) {
        setError("NOT_AUTHENTICATED");
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/readiness/instructions?userId=${userId}`);
      const json = await res.json();

      if (!res.ok) {
        setError(json?.error ?? "Failed to load instructions");
        setLoading(false);
        return;
      }

      setData({
        immediate_72h: json.immediate_72h ?? "",
        short_term_90d: json.short_term_90d ?? "",
        long_term: json.long_term ?? "",
        do_not_do_yet: json.do_not_do_yet ?? "",
        key_contacts: json.key_contacts ?? "",
        deploying_checklist: json.deploying_checklist ?? "",
      });

      setLoading(false);
    }

    load();
  }, []);

  async function save() {
    setError(null);
    setSavedMsg(null);

    const userId = await getUserId();
    if (!userId) {
      setError("NOT_AUTHENTICATED");
      return;
    }

    const res = await fetch("/api/readiness/instructions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...data }),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json?.error ?? "Save failed");
      return;
    }

    setSavedMsg("Saved ✅");
    setTimeout(() => setSavedMsg(null), 1500);
  }

  if (loading) return <main style={{ padding: 16 }}>Loading…</main>;

  return (
    <main style={{ padding: 16, maxWidth: 900 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Instructions</h1>
      <p style={{ marginTop: 8 }}>Write guidance your survivor can follow. Keep it simple and actionable.</p>

      {error ? (
        <pre style={{ marginTop: 12, background: "#111", color: "#eee", padding: 12, borderRadius: 8 }}>
{error}
        </pre>
      ) : null}

      <div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
        <Section
          title="Immediate (next 72 hours)"
          hint="Who to call first, where docs are, what must happen right away."
          value={data.immediate_72h}
          onChange={(v) => setData((d) => ({ ...d, immediate_72h: v }))}
          rows={6}
        />

        <Section
          title="Short-term (next 90 days)"
          hint="Benefits, accounts, notifications, deadlines."
          value={data.short_term_90d}
          onChange={(v) => setData((d) => ({ ...d, short_term_90d: v }))}
          rows={6}
        />

        <Section
          title="Long-term"
          hint="Estate, taxes, long-running accounts, annual reminders."
          value={data.long_term}
          onChange={(v) => setData((d) => ({ ...d, long_term: v }))}
          rows={6}
        />

        <Section
          title="Do NOT do yet"
          hint="Things to avoid until a pro confirms (estate attorney, etc.)."
          value={data.do_not_do_yet}
          onChange={(v) => setData((d) => ({ ...d, do_not_do_yet: v }))}
          rows={4}
        />

        <Section
          title="Key contacts"
          hint="Attorney, commander/unit, VSO, funeral home, executor, etc."
          value={data.key_contacts}
          onChange={(v) => setData((d) => ({ ...d, key_contacts: v }))}
          rows={5}
        />

        <Section
          title="Deploying checklist (optional)"
          hint="Pre-deployment readiness: beneficiaries, passwords, check-ins."
          value={data.deploying_checklist}
          onChange={(v) => setData((d) => ({ ...d, deploying_checklist: v }))}
          rows={5}
        />

        <button
          onClick={save}
          style={{
            marginTop: 16,
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #444",
            cursor: "pointer",
          }}
        >
          Save
        </button>

        {savedMsg ? <div style={{ marginTop: 10 }}>{savedMsg}</div> : null}
      </div>

      <div style={{ marginTop: 24 }}>
        <Link href="/dashboard/readiness/overview">← Back to Overview</Link>
      </div>
    </main>
  );
}

function Section({
  title,
  hint,
  value,
  onChange,
  rows,
}: {
  title: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  rows: number;
}) {
  return (
    <div style={{ marginTop: 14 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h2>
      <p style={{ marginTop: 6, opacity: 0.85 }}>{hint}</p>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} style={{ width: "100%", marginTop: 10 }} />
    </div>
  );
}
