// app/dashboard/readiness/documents/page.tsx
"use client"

import { useEffect, useMemo, useState } from "react"

type ReadinessDoc = {
  id: string
  category: string
  item_key: string
  item_label: string
  is_present: boolean
  notes: string | null
  updated_at: string
  last_reviewed_at: string | null
}

type ReadinessFile = {
  id: string
  readiness_document_id: string
  storage_bucket: string
  storage_path: string
  file_name: string
  mime_type: string | null
  file_size: number | null
  created_at: string
}

function groupByCategory(docs: ReadinessDoc[]) {
  const map = new Map<string, ReadinessDoc[]>()
  for (const d of docs) {
    const key = d.category || "Uncategorized"
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(d)
  }
  return Array.from(map.entries()).map(([category, items]) => ({
    category,
    items,
  }))
}

export default function ReadinessDocumentsPage() {
  const [docs, setDocs] = useState<ReadinessDoc[]>([])
  const [files, setFiles] = useState<ReadinessFile[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setErr(null)
    try {
      const res = await fetch("/api/readiness/documents", { cache: "no-store" })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Failed to load")
      setDocs(json.documents ?? [])
    } catch (e: any) {
      setErr(e?.message || "Failed to load")
    } finally {
      setLoading(false)
    }
  }

  async function loadFiles() {
    try {
      const res = await fetch("/api/readiness/documents/files", { cache: "no-store" })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Failed to load files")
      setFiles(json.files ?? [])
    } catch (e: any) {
      // non-fatal: documents page still works without file list
      console.warn(e?.message || "Failed to load files")
    }
  }

  useEffect(() => {
    load()
    loadFiles()
  }, [])

  const grouped = useMemo(() => groupByCategory(docs), [docs])

  // Map readiness_document_id -> files (newest-first because API sorts by created_at desc)
  const fileByDocId = useMemo(() => {
    const m = new Map<string, ReadinessFile[]>()
    for (const f of files) {
      if (!m.has(f.readiness_document_id)) m.set(f.readiness_document_id, [])
      m.get(f.readiness_document_id)!.push(f)
    }
    return m
  }, [files])

  const total = docs.length
  const present = docs.filter((d) => d.is_present).length
  const percent = total === 0 ? 0 : Math.round((present / total) * 100)

  async function toggle(doc: ReadinessDoc) {
    // optimistic UI
    setDocs((prev) =>
      prev.map((d) => (d.id === doc.id ? { ...d, is_present: !d.is_present } : d))
    )

    try {
      const res = await fetch("/api/readiness/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: doc.id, is_present: !doc.is_present }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Failed to update")

      // sync response
      setDocs((prev) =>
        prev.map((d) => (d.id === doc.id ? (json.document as ReadinessDoc) : d))
      )
    } catch (e: any) {
      // rollback on failure
      setDocs((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, is_present: doc.is_present } : d))
      )
      alert(e?.message || "Failed to update")
    }
  }

  async function seedDefaults() {
    try {
      const res = await fetch("/api/readiness/documents/seed", { method: "POST" })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Seed failed")
      await load()
      await loadFiles()
      alert(`Seed complete. Inserted: ${json.inserted ?? 0}`)
    } catch (e: any) {
      alert(e?.message || "Seed failed")
    }
  }

  // 6.17: Attach a real file to a readiness item (calls /api/readiness/documents/upload)
  async function attachFile(doc: ReadinessDoc, file: File) {
    const fd = new FormData()
    fd.append("readiness_document_id", doc.id)
    fd.append("file", file)

    const res = await fetch("/api/readiness/documents/upload", {
      method: "POST",
      body: fd,
    })

    const json = await res.json()
    if (!res.ok) throw new Error(json?.error || "Upload failed")

    // API returns updated readiness doc; sync it into state
    setDocs((prev) =>
      prev.map((d) => (d.id === doc.id ? (json.document as ReadinessDoc) : d))
    )

    // refresh file list so the "View" button appears immediately
    await loadFiles()
  }

  // 6.18: View latest attached file via signed URL
  async function viewFile(fileId: string) {
    const res = await fetch("/api/readiness/documents/files/signed-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file_id: fileId, expires_in: 600 }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json?.error || "Failed to create signed URL")
    if (!json?.url) throw new Error("No signed URL returned")

    window.open(json.url, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Readiness Documents</h1>
          <p className="text-sm text-muted-foreground">
            Toggle what’s present. This affects your readiness score.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={seedDefaults}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Seed defaults
          </button>

          <div className="rounded-lg border px-4 py-2 text-right">
            <div className="text-sm text-muted-foreground">Overall</div>
            <div className="text-lg font-semibold">
              {present}/{total} ({percent}%)
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : err ? (
        <div className="text-sm text-red-600">{err}</div>
      ) : docs.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No readiness documents found. Click “Seed defaults”.
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(({ category, items }) => {
            const catTotal = items.length
            const catPresent = items.filter((i) => i.is_present).length
            const catPct = catTotal === 0 ? 0 : Math.round((catPresent / catTotal) * 100)

            return (
              <section key={category} className="rounded-xl border p-4 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold">{category}</h2>
                  <div className="text-sm text-muted-foreground">
                    {catPresent}/{catTotal} ({catPct}%)
                  </div>
                </div>

                <div className="divide-y">
                  {items.map((d) => {
                    const list = fileByDocId.get(d.id) ?? []
                    const latest = list[0] // newest-first
                    return (
                      <div key={d.id} className="py-3 flex items-center justify-between gap-4">
                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={d.is_present}
                            onChange={() => toggle(d)}
                          />
                          <span className="font-medium">{d.item_label}</span>
                        </label>

                        {/* status + view + attach */}
                        <div className="flex items-center gap-3">
                          <div className="text-sm text-muted-foreground">
                            {d.is_present ? "Present" : "Missing"}
                          </div>

                          {latest ? (
                            <button
                              className="rounded-md border px-3 py-1 text-sm hover:bg-muted"
                              onClick={async () => {
                                try {
                                  await viewFile(latest.id)
                                } catch (e: any) {
                                  alert(e?.message || "View failed")
                                }
                              }}
                              title={latest.file_name}
                            >
                              View
                            </button>
                          ) : null}

                          <label className="text-sm underline cursor-pointer">
                            Attach file
                            <input
                              type="file"
                              className="hidden"
                              onChange={async (e) => {
                                const f = e.target.files?.[0]
                                // allow re-select same file later
                                e.currentTarget.value = ""
                                if (!f) return
                                try {
                                  await attachFile(d, f)
                                } catch (err: any) {
                                  alert(err?.message || "Upload failed")
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}