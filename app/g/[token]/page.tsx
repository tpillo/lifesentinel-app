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
    <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-stone-50 px-5 py-6 md:px-8 md:py-8 shadow-sm">
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

        {/* DIC — Time-Sensitive (most urgent first) */}
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-red-500 text-sm select-none">⚠</span>
            <h3 className="font-serif text-base font-semibold text-stone-900">
              DIC — Time-Sensitive: File Within 1 Year
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

        {/* CAO */}
        <div className="rounded-2xl border border-amber-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
            <h3 className="font-serif text-base font-semibold text-stone-900">
              Casualty Assistance Officer (CAO)
            </h3>
            <span className="shrink-0 text-xs font-medium text-emerald-700">✓ Confirmed federal benefit</span>
          </div>
          <p className="text-sm text-stone-500 leading-relaxed">
            A Military Casualty Assistance Officer will be assigned to help your family navigate
            all benefits, paperwork, and next steps at no cost to you. If one has not yet been
            assigned, contact your branch of service casualty affairs office immediately.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-stone-500">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1 shrink-0 text-xs">●</span>
              <span><strong className="font-medium text-stone-700">Army:</strong> 1-800-626-3317 | <strong className="font-medium text-stone-700">Navy:</strong> 1-800-368-3202 | <strong className="font-medium text-stone-700">Marines:</strong> 1-800-847-1597</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1 shrink-0 text-xs">●</span>
              <span><strong className="font-medium text-stone-700">Air Force / Space Force:</strong> 1-800-433-0048 | <strong className="font-medium text-stone-700">Coast Guard:</strong> 1-800-872-4957</span>
            </li>
          </ul>
        </div>

        {/* TRICARE */}
        <div className="rounded-2xl border border-amber-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
            <h3 className="font-serif text-base font-semibold text-stone-900">
              TRICARE Health Coverage Continuation
            </h3>
            <span className="shrink-0 text-xs font-medium text-emerald-700">✓ Confirmed federal benefit</span>
          </div>
          <p className="text-sm text-stone-500 leading-relaxed mb-3">
            Surviving spouses and dependent children of active duty service members who died in
            the line of duty may continue TRICARE coverage at no cost for up to 3 years, then
            transition to the Survivor Benefit Plan rate.
          </p>
          <ul className="space-y-1.5 text-sm text-stone-500 mb-4">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1 shrink-0 text-xs">●</span>
              <span><strong className="font-medium text-stone-700">Surviving spouse:</strong> Free TRICARE Prime for 3 years, then reduced cost. Coverage ends if spouse remarries before age 55.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1 shrink-0 text-xs">●</span>
              <span><strong className="font-medium text-stone-700">Dependent children:</strong> TRICARE continues until age 21, or 23 if enrolled full-time in college.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1 shrink-0 text-xs">●</span>
              <span><strong className="font-medium text-stone-700">CHAMPVA alternative:</strong> If not eligible for TRICARE, surviving spouses and dependents may qualify for CHAMPVA (VA health coverage).</span>
            </li>
          </ul>
          <a
            href="https://www.tricare.mil/Plans/Eligibility/SurvivingFamily"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-amber-600 underline hover:text-amber-700"
          >
            TRICARE survivor eligibility details →
          </a>
        </div>

        {/* TAPS */}
        <div className="rounded-2xl border border-amber-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
            <h3 className="font-serif text-base font-semibold text-stone-900">
              TAPS — Tragedy Assistance Program for Survivors
            </h3>
            <span className="shrink-0 text-xs font-medium text-emerald-700">✓ Free national program</span>
          </div>
          <p className="text-sm text-stone-500 leading-relaxed mb-3">
            TAPS provides free peer support, grief counseling, and survivor resources to all
            surviving family members of military service members, regardless of the cause or
            circumstance of death.
          </p>
          <ul className="space-y-1.5 text-sm text-stone-500 mb-4">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1 shrink-0 text-xs">●</span>
              <span><strong className="font-medium text-stone-700">24/7 Survivor Helpline:</strong> 1-800-959-TAPS (8277) — crisis support, peer mentors, referrals</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1 shrink-0 text-xs">●</span>
              <span><strong className="font-medium text-stone-700">TAPS Good Grief Camp:</strong> Free annual camps for surviving children and teens across the country</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1 shrink-0 text-xs">●</span>
              <span><strong className="font-medium text-stone-700">Peer mentor network:</strong> Connects survivors with others who have experienced similar loss</span>
            </li>
          </ul>
          <a
            href="https://www.taps.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-amber-600 underline hover:text-amber-700"
          >
            taps.org — free resources for survivors →
          </a>
        </div>

        {/* Survivor Outreach Services */}
        <div className="rounded-2xl border border-amber-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
            <h3 className="font-serif text-base font-semibold text-stone-900">
              Survivor Outreach Services (SOS)
            </h3>
            <span className="shrink-0 text-xs font-medium text-emerald-700">✓ Confirmed DoD program</span>
          </div>
          <p className="text-sm text-stone-500 leading-relaxed mb-3">
            DoD&apos;s Survivor Outreach Services provides long-term, ongoing support to surviving
            families — financial counseling, grief support, and benefits navigation — for as
            long as it is needed, not just immediately after the loss.
          </p>
          <ul className="space-y-1.5 text-sm text-stone-500 mb-4">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1 shrink-0 text-xs">●</span>
              <span><strong className="font-medium text-stone-700">Financial counselors:</strong> Free counseling on survivor benefits, insurance, and long-term financial planning</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1 shrink-0 text-xs">●</span>
              <span><strong className="font-medium text-stone-700">Available at:</strong> Every Army installation worldwide. Other branches have equivalent programs through their casualty offices.</span>
            </li>
          </ul>
          <a
            href="https://www.armymwr.com/programs-and-services/personal-assistance/survivor-outreach"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-amber-600 underline hover:text-amber-700"
          >
            Survivor Outreach Services →
          </a>
        </div>

        {/* DoD Installation Benefits */}
        <div className="rounded-2xl border border-amber-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
            <h3 className="font-serif text-base font-semibold text-stone-900">
              Commissary, PX/BX &amp; Installation Access
            </h3>
            <span className="shrink-0 text-xs font-medium text-emerald-700">✓ Confirmed federal benefit</span>
          </div>
          <p className="text-sm text-stone-500 leading-relaxed mb-3">
            Surviving spouses and dependents of active duty service members who died in the line
            of duty retain access to military installation benefits.
          </p>
          <ul className="space-y-1.5 text-sm text-stone-500 mb-4">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1 shrink-0 text-xs">●</span>
              <span><strong className="font-medium text-stone-700">Commissary:</strong> Lifetime access for surviving spouses. Dependents until age 21 (23 if in college).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1 shrink-0 text-xs">●</span>
              <span><strong className="font-medium text-stone-700">Exchange (PX/BX):</strong> Lifetime shopping access including online at shopmyexchange.com</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1 shrink-0 text-xs">●</span>
              <span><strong className="font-medium text-stone-700">MWR facilities:</strong> Access to gyms, recreation, and support programs on base</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1 shrink-0 text-xs">●</span>
              <span><strong className="font-medium text-stone-700">BAH / BAH-T:</strong> Transitional housing allowance may be available for up to 365 days</span>
            </li>
          </ul>
          <p className="text-xs text-amber-600 font-medium">Verify eligibility and ID card issuance with your CAO or nearest RAPIDS office</p>
        </div>

        {/* National Parks Pass */}
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

        {/* Gold Star Lapel Pin */}
        <div className="rounded-2xl border border-amber-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
            <h3 className="font-serif text-base font-semibold text-stone-900">
              Gold Star Lapel Button (Pin)
            </h3>
            <span className="shrink-0 text-xs font-medium text-emerald-700">✓ Confirmed federal benefit</span>
          </div>
          <p className="text-sm text-stone-500 leading-relaxed mb-3">
            The Gold Star Lapel Button is the official recognition given by the U.S. government
            to next of kin of service members who died in active service or as a result of
            service-connected causes.
          </p>
          <ul className="space-y-1.5 text-sm text-stone-500 mb-4">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1 shrink-0 text-xs">●</span>
              <span><strong className="font-medium text-stone-700">Who receives it:</strong> Widow/widower, children, parents, and siblings of eligible service members</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1 shrink-0 text-xs">●</span>
              <span><strong className="font-medium text-stone-700">How to request:</strong> Contact your branch casualty affairs office or the National Personnel Records Center</span>
            </li>
          </ul>
          <a
            href="https://www.archives.gov/veterans/military-service-records/gold-star-lapel-button"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-amber-600 underline hover:text-amber-700"
          >
            Gold Star Lapel Button information →
          </a>
        </div>

        {/* Gold Star Family Registry */}
        <div className="rounded-2xl border border-amber-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
            <h3 className="font-serif text-base font-semibold text-stone-900">
              Gold Star Family Registry
            </h3>
            <span className="shrink-0 text-xs font-medium text-amber-700">◎ Verify eligibility</span>
          </div>
          <p className="text-sm text-stone-500 leading-relaxed mb-3">
            Many states maintain official Gold Star Family Registries that unlock additional
            state-level benefits: property tax exemptions, free or reduced-cost state park
            passes, college tuition waivers, DMV fee waivers, and more. Benefits vary widely
            by state.
          </p>
          <ul className="space-y-1.5 text-sm text-stone-500 mb-4">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1 shrink-0 text-xs">●</span>
              <span><strong className="font-medium text-stone-700">How to register:</strong> Contact your state Department of Veterans Affairs or Military Family Support office</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1 shrink-0 text-xs">●</span>
              <span><strong className="font-medium text-stone-700">Tip:</strong> Some states require registration within a specific timeframe to claim retroactive benefits</span>
            </li>
          </ul>
          <a
            href="https://www.nasdva.us"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-amber-600 underline hover:text-amber-700"
          >
            Find your state VA office at nasdva.us →
          </a>
        </div>

        {/* Branch-specific portals */}
        <div className="rounded-2xl border border-stone-200 bg-stone-50 px-6 py-5">
          <h3 className="font-serif text-base font-semibold text-stone-900 mb-2">
            Branch-Specific Survivor Portals
          </h3>
          <p className="text-sm text-stone-500 leading-relaxed mb-4">
            Each branch of service maintains its own survivor benefits portal with branch-specific
            programs, scholarships, and support networks not available through other channels.
          </p>
          <ul className="space-y-2 text-sm text-stone-600">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1 shrink-0 text-xs">●</span>
              <span><strong className="font-medium">Army:</strong> <a href="https://www.myarmybenefits.us.army.mil" target="_blank" rel="noopener noreferrer" className="text-amber-600 underline">myarmybenefits.us.army.mil</a> — Army Survivor Benefits Handbook</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1 shrink-0 text-xs">●</span>
              <span><strong className="font-medium">Navy / Marines:</strong> <a href="https://www.mynavyhr.navy.mil/Support-Services/Casualty-Assistance" target="_blank" rel="noopener noreferrer" className="text-amber-600 underline">mynavyhr.navy.mil</a></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1 shrink-0 text-xs">●</span>
              <span><strong className="font-medium">Air Force / Space Force:</strong> <a href="https://www.afpc.af.mil/Benefits-Entitlements/Casualty-Assistance" target="_blank" rel="noopener noreferrer" className="text-amber-600 underline">afpc.af.mil</a></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1 shrink-0 text-xs">●</span>
              <span><strong className="font-medium">All branches:</strong> <a href="https://www.va.gov/family-member-benefits" target="_blank" rel="noopener noreferrer" className="text-amber-600 underline">va.gov/family-member-benefits</a> — complete VA survivor benefit guide</span>
            </li>
          </ul>
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
  const [serviceConnected, setServiceConnected] = useState<boolean | null>(null)

  useEffect(() => {
    const saved = sessionStorage.getItem(`guardian-sc-${token}`)
    if (saved !== null) setServiceConnected(saved === "true")
  }, [token])

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

  function handleServiceConnected(answer: boolean | null) {
    setServiceConnected(answer)
    if (answer === null) {
      sessionStorage.removeItem(`guardian-sc-${token}`)
    } else {
      sessionStorage.setItem(`guardian-sc-${token}`, String(answer))
    }
  }

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
  const isMilitary = data.profile?.occupation_type === "military"
  const veteranName = data.profile?.full_name ?? null

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

        {isMilitary && serviceConnected === null && (
          <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-stone-50 px-6 py-8 md:px-10 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl select-none">★</span>
              <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-800">
                Gold Star Family Benefits
              </span>
            </div>
            <h2 className="font-serif text-xl font-semibold text-stone-900 leading-snug mb-2">
              Was {veteranName ? `${veteranName}'s` : "this"} death related to their military service?
            </h2>
            <p className="text-sm text-stone-500 leading-relaxed mb-6 max-w-xl">
              If so, your family may qualify for Gold Star Family benefits — including monthly
              compensation, free health coverage, and additional support programs.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleServiceConnected(true)}
                className="rounded-xl bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-700"
              >
                Yes, it was service-connected
              </button>
              <button
                onClick={() => handleServiceConnected(false)}
                className="rounded-xl border border-stone-300 bg-white px-6 py-3 text-sm font-medium text-stone-600 transition hover:bg-stone-50"
              >
                No / Not sure
              </button>
            </div>
          </div>
        )}

        {isMilitary && serviceConnected === true && (
          <GoldStarSection veteranName={veteranName} />
        )}

        {isMilitary && serviceConnected === false && (
          <div className="rounded-2xl border border-stone-200 bg-white px-6 py-5 shadow-sm">
            <p className="text-sm text-stone-500">
              If circumstances change or you&apos;re unsure, a VA representative can help determine
              eligibility. Call <strong className="text-stone-700">1-800-827-1000</strong> or visit{" "}
              <a href="https://www.va.gov/family-member-benefits" target="_blank" rel="noopener noreferrer" className="text-amber-600 underline">
                va.gov/family-member-benefits
              </a>.
            </p>
            <button
              onClick={() => handleServiceConnected(null)}
              className="mt-3 text-xs text-stone-400 underline hover:text-stone-600"
            >
              Go back
            </button>
          </div>
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
