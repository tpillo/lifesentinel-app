"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

type OverviewItem = {
  id: string
  title: string
  completed: boolean
}

type Overview = {
  total: number
  completed: number
  percent: number
  items: OverviewItem[]
}

function getScoreTone(percent: number) {
  if (percent >= 80) {
    return {
      barClass: "bg-green-600",
      badgeClass: "bg-green-100 text-green-800 border-green-200",
      label: "Strong",
    }
  }

  if (percent >= 50) {
    return {
      barClass: "bg-amber-500",
      badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
      label: "In Progress",
    }
  }

  return {
    barClass: "bg-red-600",
    badgeClass: "bg-red-100 text-red-800 border-red-200",
    label: "Needs Attention",
  }
}

function getPriorityRank(title: string) {
  const t = title.toLowerCase()

  if (t.includes("will") || t.includes("estate")) return 1
  if (t.includes("insurance")) return 2
  if (t.includes("va")) return 3
  if (t.includes("bank")) return 4
  if (t.includes("marriage")) return 5
  if (t.includes("birth")) return 6
  if (t.includes("emergency")) return 7
  return 99
}

export default function OverviewPage() {
  const [data, setData] = useState<Overview | null>(null)
  const [error, setError] = useState<string>("")

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

        if (!text) {
          throw new Error("API returned an empty response")
        }

        const json = JSON.parse(text) as Overview
        setData(json)
      } catch (err) {
        console.error("Overview fetch failed:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      }
    }

    load()
  }, [])

  const missing = useMemo(() => {
    if (!data) return []

    return [...data.items]
      .filter((item) => !item.completed)
      .sort((a, b) => getPriorityRank(a.title) - getPriorityRank(b.title))
      .slice(0, 5)
  }, [data])

  if (error) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-white">Readiness Overview</h1>
        <div className="border rounded-2xl p-6 bg-white shadow-sm">
          <div className="text-red-600 font-semibold mb-2">Failed to load overview</div>
          <pre className="text-sm whitespace-pre-wrap text-gray-700">{error}</pre>
        </div>
      </div>
    )
  }

  if (!data) {
    return <div className="p-6 text-white">Loading...</div>
  }

  const tone = getScoreTone(data.percent)

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white">Readiness Overview</h1>
        <p className="text-gray-400 mt-2">
          Track what is complete, what is missing, and what needs attention next.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 border rounded-2xl p-6 shadow-sm bg-white">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Readiness Score</h2>
              <p className="text-sm text-gray-500 mt-1">
                Based on your current essential document checklist
              </p>
            </div>

            <div className="text-right">
              <div className="text-4xl font-bold text-gray-900">{data.percent}%</div>
              <div
                className={`inline-flex mt-2 items-center rounded-full border px-3 py-1 text-xs font-semibold ${tone.badgeClass}`}
              >
                {tone.label}
              </div>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className={`${tone.barClass} h-4 transition-all duration-500`}
              style={{ width: `${data.percent}%` }}
            />
          </div>

          <div className="mt-3 text-sm text-gray-600">
            {data.completed} of {data.total} items complete
          </div>
        </div>

        <div className="border rounded-2xl p-6 shadow-sm bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Checklist Snapshot</h2>

          <div className="mt-5 space-y-4">
            <div>
              <div className="text-sm text-gray-500">Completed</div>
              <div className="text-3xl font-bold text-gray-900">{data.completed}</div>
            </div>

            <div>
              <div className="text-sm text-gray-500">Remaining</div>
              <div className="text-3xl font-bold text-gray-900">
                {Math.max(data.total - data.completed, 0)}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500">Total Items</div>
              <div className="text-3xl font-bold text-gray-900">{data.total}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-2xl p-6 shadow-sm bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Top Missing Items</h2>
            <p className="text-sm text-gray-500 mt-1">
              Prioritized items to improve your readiness fastest
            </p>
          </div>

          <Link
            href="/dashboard/readiness/documents"
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Open documents →
          </Link>
        </div>

        {missing.length === 0 ? (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-800 font-medium">
            You&apos;re fully prepared.
          </div>
        ) : (
          <div className="space-y-3">
            {missing.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{item.title}</div>
                    <div className="text-sm text-gray-500">Missing from your readiness vault</div>
                  </div>
                </div>

                <Link
                  href="/dashboard/readiness/documents"
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Fix
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}