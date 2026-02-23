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

  useEffect(() => {
    load()
  }, [])

  const grouped = useMemo(() => groupByCategory(docs), [docs])

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
      alert(`Seed complete. Inserted: ${json.inserted ?? 0}`)
    } catch (e: any) {
      alert(e?.message || "Seed failed")
    }
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
                  {items.map((d) => (
                    <div key={d.id} className="py-3 flex items-center justify-between gap-4">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={d.is_present}
                          onChange={() => toggle(d)}
                        />
                        <span className="font-medium">{d.item_label}</span>
                      </label>

                      <div className="text-sm text-muted-foreground">
                        {d.is_present ? "Present" : "Missing"}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}