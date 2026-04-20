"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

type OverviewItem = {
  id: string
  title: string
  completed: boolean
}

type OverviewResponse = {
  total: number
  completed: number
  percent: number
  items: OverviewItem[]
}

export default function GuardianOverviewPage() {
  const params = useParams()
  const token = Array.isArray(params?.token) ? params.token[0] : params?.token ?? ""

  const [data, setData] = useState<OverviewResponse | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/guardian/overview?token=${token}`, { cache: "no-store" })
        const text = await res.text()

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${text || "No response body"}`)
        }

        const json = JSON.parse(text) as OverviewResponse
        sessionStorage.setItem(`guardian-overview-${token}`, JSON.stringify(json))
        setData(json)
      } catch (err) {
        console.error("Guardian overview load failed:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      }
    }

    if (token) load()
  }, [token])

  if (error) {
    return (
      <div className="min-h-screen bg-[#faf8f5] p-8">
        <div className="mx-auto max-w-2xl">
          <div className="text-amber-600 text-3xl mb-4 text-center">❧</div>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <div className="text-red-700 font-semibold mb-2">Unable to load documents</div>
            <pre className="text-sm whitespace-pre-wrap text-red-600">{error}</pre>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="text-center">
          <div className="text-amber-600 text-3xl mb-3">❧</div>
          <p className="text-stone-500 text-sm">Loading documents prepared for you…</p>
        </div>
      </div>
    )
  }

  const presentItems = data.items.filter((item) => item.completed)
  const notYetAdded = data.items.filter((item) => !item.completed)

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 md:px-8">
          <div className="flex items-center gap-2">
            <span className="text-amber-600 text-xl">❧</span>
            <span className="font-serif text-lg font-semibold text-stone-900 tracking-tight">
              LifeSentinel
            </span>
          </div>
          <Link
            href={`/g/${token}/vault`}
            className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
          >
            Open Documents
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 md:px-8 space-y-8">
        <div className="rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 to-stone-50 px-8 py-10 shadow-sm text-center">
          <div className="text-amber-600 text-4xl mb-4">❧</div>
          <h1 className="font-serif text-3xl font-semibold text-stone-900 md:text-4xl">
            Documents prepared for you
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-stone-500 text-sm leading-relaxed md:text-base">
            Someone who cares about you took the time to organize these important records.
            They&apos;re here so that when you need them, you won&apos;t have to search.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm text-center">
            <div className="text-sm text-stone-500 mb-3">Documents Ready</div>
            <div className="text-5xl font-semibold text-stone-900">{presentItems.length}</div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm text-center">
            <div className="text-sm text-stone-500 mb-3">Not Yet Added</div>
            <div className="text-5xl font-semibold text-stone-900">{notYetAdded.length}</div>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6 shadow-sm text-center">
            <div className="text-sm text-amber-700 mb-3">Preparation Score</div>
            <div className="text-5xl font-semibold text-amber-800">{data.percent}%</div>
          </div>
        </div>

        {presentItems.length > 0 && (
          <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
            <h2 className="font-serif text-2xl font-semibold text-stone-900 mb-2">
              Documents ready for you
            </h2>
            <p className="text-sm text-stone-400 mb-6">
              These categories have been prepared and are waiting for you in the vault.
            </p>

            <div className="space-y-3">
              {presentItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50 px-5 py-4"
                >
                  <div className="text-base font-medium text-stone-800">{item.title}</div>
                  <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-sm font-medium text-emerald-700">
                    Ready
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {notYetAdded.length > 0 && (
          <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-stone-900">
                  Not yet added
                </h2>
                <p className="mt-2 text-sm text-stone-400">
                  These categories haven&apos;t been filled in yet — that&apos;s okay.
                </p>
              </div>

              <Link
                href={`/g/${token}/vault`}
                className="shrink-0 rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
              >
                Open Documents
              </Link>
            </div>

            <div className="space-y-3">
              {notYetAdded.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50 px-5 py-4"
                >
                  <div className="text-base font-medium text-stone-700">{item.title}</div>
                  <div className="rounded-full border border-stone-200 bg-white px-4 py-1 text-sm font-medium text-stone-400">
                    Not yet added
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-stone-400 pb-4">
          This page was created with care. All documents are securely stored.
        </p>
      </main>
    </div>
  )
}
