"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type TriggerSettings = {
  manual_enabled: boolean;
  inactivity_enabled: boolean;
  inactivity_days: number;
  doc_trigger_enabled: boolean;
};

export default function ReadinessTriggersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const [settings, setSettings] = useState<TriggerSettings>({
    manual_enabled: true,
    inactivity_enabled: false,
    inactivity_days: 90,
    doc_trigger_enabled: false,
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

      const res = await fetch(`/api/readiness/triggers?userId=${userId}`);
      const json = await res.json();

      if (!res.ok) {
        setError(json?.error ?? "Failed to load triggers");
        setLoading(false);
        return;
      }

      setSettings({
        manual_enabled: !!json.manual_enabled,
        inactivity_enabled: !!json.inactivity_enabled,
        inactivity_days: Number(json.inactivity_days ?? 90),
        doc_trigger_enabled: !!json.doc_trigger_enabled,
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

    const res = await fetch("/api/readiness/triggers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...settings }),
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
    <main style={{ padding: 16, maxWidth: 800 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Triggers</h1>
      <p style={{ marginTop: 8 }}>
        Choose how Life Sentinel determines readiness activation.
      </p>

      {error ? (
        <pre style={{ marginTop: 12, background: "#111", color: "#eee", padding: 12, borderRadius: 8 }}>
{error}
        </pre>
      ) : null}

      <div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
        <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={settings.manual_enabled}
            onChange={(e) => setSettings((s) => ({ ...s, manual_enabled: e.target.checked }))}
          />
          Manual trigger enabled (recommended)
        </label>

        <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 12 }}>
          <input
            type="checkbox"
            checked={settings.inactivity_enabled}
            onChange={(e) => setSettings((s) => ({ ...s, inactivity_enabled: e.target.checked }))}
          />
          Inactivity trigger enabled
        </label>

        <div style={{ marginTop: 8, paddingLeft: 28, opacity: settings.inactivity_enabled ? 1 : 0.5 }}>
          <div>Trigger after (days):</div>
          <input
            type="number"
            value={settings.inactivity_days}
            disabled={!settings.inactivity_enabled}
            onChange={(e) => setSettings((s) => ({ ...s, inactivity_days: Number(e.target.value) }))}
            style={{ marginTop: 6, width: 120 }}
          />
        </div>

        <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 12 }}>
          <input
            type="checkbox"
            checked={settings.doc_trigger_enabled}
            onChange={(e) => setSettings((s) => ({ ...s, doc_trigger_enabled: e.target.checked }))}
          />
          Document-based trigger (later version)
        </label>

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
