"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type VaultFile = {
  id: string;
  name: string;
  fullPath: string;
  size: number | null;
  mimetype: string | null;
  createdAt: string | null;
};

const BUCKET = "VAULT";

// Option A categories
const CATEGORIES = [
  "policies",
  "legal",
  "medical",
  "banking",
  "dmv",
  "emergency",
  "survivor",
] as const;

type Category = (typeof CATEGORIES)[number];

export default function VaultPage() {
  const [category, setCategory] = useState<Category>("policies");
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [error, setError] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = useMemo(
    () => `Vault — ${category.charAt(0).toUpperCase()}${category.slice(1)}`,
    [category]
  );

  async function getUserIdOrError(): Promise<string | null> {
    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    const user = userRes?.user;
    if (userErr || !user) {
      setError("Not logged in. Go to /login first, then come back to /vault.");
      return null;
    }
    return user.id;
  }

  async function loadFiles(activeCategory: Category = category) {
    setError("");
    setLoading(true);

    try {
      const userId = await getUserIdOrError();
      if (!userId) return;

      const prefix = `${userId}/${activeCategory}`;

      const { data, error } = await supabase.storage
        .from(BUCKET)
        .list(prefix, {
          limit: 100,
          offset: 0,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (error) {
        setError(error.message);
        return;
      }

      const onlyFiles = (data ?? []).filter((item) => item?.id !== null);

      setFiles(
        onlyFiles.map((f: any) => ({
          id: f.id,
          name: f.name,
          fullPath: `${prefix}/${f.name}`,
          size: f.metadata?.size ?? null,
          mimetype: f.metadata?.mimetype ?? null,
          createdAt: f.created_at ?? null,
        }))
      );
    } finally {
      setLoading(false);
    }
  }

  async function uploadFile(file: File) {
    setError("");
    setUploading(true);

    try {
      const userId = await getUserIdOrError();
      if (!userId) return;

      const path = `${userId}/${category}/${file.name}`;

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });

      if (error) {
        setError(error.message);
        return;
      }

      await loadFiles(category);
    } finally {
      setUploading(false);
    }
  }

  async function openFile(fullPath: string) {
    setError("");

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(fullPath, 60);

    if (error) {
      setError(error.message);
      return;
    }

    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  useEffect(() => {
    loadFiles(category);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ marginBottom: 10 }}>{title}</h1>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {CATEGORIES.map((c) => {
          const active = c === category;
          return (
            <button
              key={c}
              onClick={() => setCategory(c)}
              disabled={uploading}
              style={{
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid #ddd",
                cursor: "pointer",
                fontWeight: active ? 700 : 400,
                opacity: active ? 1 : 0.85,
              }}
            >
              {c}
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
        <input
          type="file"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadFile(file);
            e.currentTarget.value = "";
          }}
        />
        <button onClick={() => loadFiles(category)} disabled={uploading || loading}>
          Refresh
        </button>
        {uploading && <span>Uploading…</span>}
        {loading && <span>Loading…</span>}
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* List */}
      {files.length === 0 ? (
        <p>{loading ? "Loading…" : "No files found yet."}</p>
      ) : (
        <ul>
          {files.map((f) => (
            <li key={f.id} style={{ marginBottom: 8 }}>
              <button onClick={() => openFile(f.fullPath)}>{f.name}</button>
              {f.size != null && <span> — {Math.round(f.size / 1024)} KB</span>}
              {f.mimetype && <span> — {f.mimetype}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
