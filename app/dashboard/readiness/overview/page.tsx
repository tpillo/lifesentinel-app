"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type OverviewData = {
  percent: number;
  documents: { total: number; done: number };
  roles: { done: boolean };
  triggers: { done: boolean };
  instructions: { done: boolean };
};

export default function ReadinessOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<OverviewData | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) {
        setError("NOT_AUTHENTICATED");
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/readiness/overview?userId=${user.id}`);
      const json = await res.json();

      if (!res.ok) {
        setError(json?.error ?? "Failed to load overview");
        setLoading(false);
        return;
      }

      setData(json);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) return <main style={{ padding: 16 }}>Loading…</main>;

  if (error) {
    return (
      <main style={{ padding: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Readiness Overview</h1>
        <pre style={{ marginTop: 12 }}>{error}</pre>
      </main>
    );
  }

  return (
    <main style={{ padding: 16, maxWidth: 900 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Readiness Overview</h1>
      <p style={{ marginTop: 8, opacity: 0.9 }}>
        Left-of-death readiness: roles, triggers, instructions, and document presence.
      </p>

      <div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
        <div style={{ fontWeight: 700 }}>Completion</div>
        <div style={{ fontSize: 32, fontWeight: 800, marginTop: 6 }}>{data?.percent ?? 0}%</div>
        <div style={{ marginTop: 6, opacity: 0.85 }}>
          Keep going—small steps reduce family chaos.
        </div>
      </div>

      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
        <Card
          title="Documents"
          status={`${data!.documents.done}/${data!.documents.total} checked`}
          done={data!.documents.total > 0 && data!.documents.done > 0}
          href="/dashboard/readiness/documents"
        />
        <Card
          title="Roles"
          status={data!.roles.done ? "Configured" : "Add at least one"}
          done={data!.roles.done}
          href="/dashboard/readiness/roles"
        />
        <Card
          title="Triggers"
          status={data!.triggers.done ? "Configured" : "Set triggers"}
          done={data!.triggers.done}
          href="/dashboard/readiness/triggers"
        />
        <Card
          title="Instructions"
          status={data!.instructions.done ? "Started" : "Write first notes"}
          done={data!.instructions.done}
          href="/dashboard/readiness/instructions"
        />
      </div>

      <div style={{ marginTop: 24 }}>
        <Link href="/dashboard/readiness">← Back</Link>
      </div>
    </main>
  );
}

function Card({
  title,
  status,
  done,
  href,
}: {
  title: string;
  status: string;
  done: boolean;
  href: string;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 800 }}>{title}</div>
          <div style={{ fontWeight: 700 }}>{done ? "✅" : "⏳"}</div>
        </div>
        <div style={{ marginTop: 6, opacity: 0.85 }}>{status}</div>
      </div>
    </Link>
  );
}
