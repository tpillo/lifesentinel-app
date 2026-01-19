"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [status, setStatus] = useState("Checking Supabase connection...");

  useEffect(() => {
    async function test() {
      const { error } = await supabase.auth.getSession();
      setStatus(
        error
          ? `❌ Supabase error: ${error.message}`
          : "✅ Supabase connected"
      );
    }
    test();
  }, []);

  return (
    <main style={{ padding: 40, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 32, marginBottom: 6 }}>Life Sentinel</h1>
      <p style={{ opacity: 0.85, marginBottom: 18 }}>
        Because your loved ones deserve certainty.
      </p>

      <p>{status}</p>

      <div style={{ marginTop: 18, display: "flex", gap: 14 }}>
        <a href="/login">Login</a>
        <a href="/vault">Document Vault</a>
      </div>
    </main>
  );
}

