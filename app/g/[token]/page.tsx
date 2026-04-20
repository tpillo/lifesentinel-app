"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

type OverviewItem = {
  id: string
  title: string
  completed: boolean
}

type VeteranProfile = {
  full_name: string | null
  service_connected_death: string | null
  status: string | null
  occupation_type: string | null
}

type OverviewResponse = {
  total: number
  completed: number
  percent: number
  items: OverviewItem[]
  profile: VeteranProfile | null
}

function GoldStarSection({ veteranName }: { veteranName: string | null }) {
  const name = veteranName ?? "the veteran"
  return (
    <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-stone-50 px-8 py-8 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl select-none">★</span>
        <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-800">
          Gold Star Family
        </span>
      </div>

      <h2 className="font-serif text-2xl font-semibold text-stone-900 mt-3 leading-snug">
        Your Family May Qualify for Gold Star Family Benefits
      </h2>
      <p className="mt-3 text-sm text-stone-600 leading-relaxed max-w-2xl">
        Because {name}&apos;s death may be classified as a line-of-duty death, your family could
        be eligible for Gold Star Family designation and the benefits that come with it.
        Contact your Military Casualty Assistance Officer or the VA to confirm eligibility.
      </p>

      <div className="mt-7 space-y-4">

        {/* Benefit 1 — Parks Pass */}
        <div className="rounded-2xl border border-amber-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
            <h3 className="font-serif text-base font-semibold text-stone-900">
              Gold Star Family Lifetime National Parks Pass
            </h3>
            <span className="shrink-0 text-xs font-medium text-emerald-700">✓ Confirmed federal benefit</span>
          </div>
          <p className="text-sm text-stone-500 leading-relaxed mb-3">
            Free lifetime access to 2,000+ federal recreation sites — national parks, wildlife refuges,
            national forests, BLM land, and Army Corps of Engineers sites.
          </p>
          <ul className="space-y-1.5 text-sm text-stone-500 mb-4">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1 shrink-0 text-xs">●</span>
              <span><strong className="font-medium text-stone-700">Who qualifies:</strong> Next of kin of a service member who died in a qualifying situation (war, international terrorist attack, or military operation outside the US)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1 shrink-0 text-xs">●</span>
              <span><strong className="font-medium text-stone-700">How to get it:</strong> Free in person at any national park entrance, or $10 online at store.usgs.gov. Requires a Gold Star Family self-verification form.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1 shrink-0 text-xs">●</span>
              <span><strong className="font-medium text-stone-700">Does not cover:</strong> Camping fees, boat launches, transportation, or special tours.</span>
            </li>
          </ul>
          <a
            href="https://www.nps.gov/planyourvisit/veterans-and-gold-star-families-free-access.htm"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-amber-600 underline hover:text-amber-700"
          >
            Full details at nps.gov →
          </a>
        </div>

        {/* Benefit 2 — CAO */}
        <div className="rounded-2xl border border-amber-200 bg-white px-6 py-5 shadow-sm">
          <h3 className="font-serif text-base font-semibold text-stone-900 mb-2">
            Casualty Assistance Officer
          </h3>
          <p className="text-sm text-stone-500 leading-relaxed">
            A Military Casualty Assistance Officer (CAO) will be assigned to help your family
            navigate all benefits and paperwork. If one has not yet been assigned, contact your
            branch of service casualty affairs office immediately.
          </p>
          <p className="mt-2 text-xs text-amber-600 font-medium">
            Verify with your Military Casualty Assistance Officer or VA
          </p>
        </div>

        {/* Benefit 3 — DIC Reminder */}
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-red-500 text-sm select-none">⚠</span>
            <h3 className="font-serif text-base font-semibold text-stone-900">
              DIC — Time-Sensitive Reminder
            </h3>
          </div>
          <p className="text-sm text-stone-600 leading-relaxed mb-2">
            Line-of-duty deaths qualify for Dependency &amp; Indemnity Compensation (DIC)
            regardless of disability rating — <strong>$1,699.36/month, tax-free, for life</strong>.
          </p>
          <p className="text-sm font-semibold text-red-700">
            File VA Form 21P-534EZ within 1 year of death to receive full retroactive benefits
            back to the date of death.
          </p>
          <p className="mt-2 text-xs text-stone-500">Contact VA: 1-800-827-1000</p>
        </div>

      </div>
    </div>
  )
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
  const showGoldStar = data.profile?.service_connected_death === "yes"

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

        {showGoldStar && (
          <GoldStarSection veteranName={data.profile?.full_name ?? null} />
        )}

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
