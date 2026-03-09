"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

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

export default function VaultPage() {
  const [data, setData] = useState<OverviewResponse | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/readiness/overview", {
          cache: "no-store",
        })

        const text = await res.text()

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${text || "No response body"}`)
        }

        const json = JSON.parse(text) as OverviewResponse
        setData(json)
      } catch (err) {
        console.error("Vault page load failed:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      }
    }

    load()
  }, [])

  if (error) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-4">Family Vault</h1>
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-red-600 font-semibold mb-2">Failed to load vault</div>
          <pre className="text-sm whitespace-pre-wrap text-gray-700">{error}</pre>
        </div>
      </div>
    )
  }

  if (!data) {
    return <div className="p-8 text-white">Loading vault...</div>
  }

  const presentItems = data.items.filter((item) => item.completed)
  const missingItems = data.items.filter((item) => !item.completed)

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white">Family Vault</h1>
          <p className="text-gray-400 mt-2">
            A single place to see what is already protected and what still needs to be added.
          </p>
        </div>

        <Link
          href="/dashboard/readiness/overview"
          className="rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-gray-800"
        >
          Back to Overview
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-sm text-gray-500">Ready Now</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{presentItems.length}</div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-sm text-gray-500">Still Missing</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{missingItems.length}</div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-sm text-gray-500">Readiness Score</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{data.percent}%</div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Protected Documents</h2>
            <p className="text-sm text-gray-500 mt-1">
              Items currently marked present in your readiness vault
            </p>
          </div>
        </div>

        {presentItems.length === 0 ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
            No documents are marked present yet.
          </div>
        ) : (
          <div className="space-y-3">
            {presentItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3"
              >
                <div>
                  <div className="font-medium text-gray-900">{item.title}</div>
                  <div className="text-sm text-gray-500">Available in your family vault</div>
                </div>

                <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                  Present
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Still Needed</h2>
            <p className="text-sm text-gray-500 mt-1">
              Missing items preventing full family readiness
            </p>
          </div>

          <Link
            href="/dashboard/readiness/documents"
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Open documents →
          </Link>
        </div>

        {missingItems.length === 0 ? (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-800 font-medium">
            Everything is currently covered.
          </div>
        ) : (
          <div className="space-y-3">
            {missingItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3"
              >
                <div>
                  <div className="font-medium text-gray-900">{item.title}</div>
                  <div className="text-sm text-gray-500">Not yet added to your vault</div>
                </div>

                <div className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                  Missing
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}