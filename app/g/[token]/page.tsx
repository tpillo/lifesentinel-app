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
        const res = await fetch("/api/readiness/overview", { cache: "no-store" })
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

    if (token) {
      load()
    }
  }, [token])

  if (error) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-white mb-4">Life Sentinel Guardian Access</h1>
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-red-600 font-semibold mb-2">Failed to load guardian overview</div>
          <pre className="text-sm whitespace-pre-wrap text-gray-700">{error}</pre>
        </div>
      </div>
    )
  }

  if (!data) {
    return <div className="p-8 text-white">Loading guardian overview...</div>
  }

  const presentItems = data.items.filter((item) => item.completed)
  const missingItems = data.items.filter((item) => !item.completed)

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-5xl font-bold text-white">Life Sentinel Guardian Access</h1>
        <p className="mt-4 text-xl text-gray-400">
          This read-only view allows a trusted guardian to see what documents are available and what may still be needed for family readiness.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <div className="text-sm text-gray-500">Protected Documents</div>
          <div className="mt-4 text-5xl font-bold text-gray-900">{presentItems.length}</div>
        </div>

        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <div className="text-sm text-gray-500">Still Missing</div>
          <div className="mt-4 text-5xl font-bold text-gray-900">{missingItems.length}</div>
        </div>

        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <div className="text-sm text-gray-500">Readiness Score</div>
          <div className="mt-4 text-5xl font-bold text-gray-900">{data.percent}%</div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        <h2 className="text-3xl font-semibold text-gray-900 mb-6">Available Documents</h2>

        <div className="space-y-4">
          {presentItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 px-6 py-5"
            >
              <div>
                <div className="text-2xl font-medium text-gray-900">{item.title}</div>
                <div className="text-lg text-gray-500">Document available in the family vault</div>
              </div>

              <div className="rounded-full bg-green-100 px-5 py-2 text-lg font-semibold text-green-800">
                Present
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold text-gray-900">Still Needed</h2>
            <p className="mt-2 text-lg text-gray-500">Missing items preventing full family readiness</p>
          </div>

          <Link
            href={`/g/${token}/vault`}
            className="text-2xl text-blue-600 hover:text-blue-700"
          >
            Open documents →
          </Link>
        </div>

        <div className="space-y-4">
          {missingItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 px-6 py-5"
            >
              <div>
                <div className="text-2xl font-medium text-gray-900">{item.title}</div>
                <div className="text-lg text-gray-500">Document not yet added</div>
              </div>

              <div className="rounded-full bg-red-100 px-5 py-2 text-lg font-semibold text-red-700">
                Missing
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}