'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Progress = {
  overall: {
    done: number
    total: number
    percent: number
  }
  buckets: {
    checklist: {
      done: number
      total: number
      percent: number
    }
    documents: {
      done: number
      total: number
      percent: number
    }
  }
}

export default function ReadinessOverviewPage() {
  const [progress, setProgress] = useState<Progress | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setError(null)
        const res = await fetch('/api/readiness/progress')
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error ?? 'Failed to load readiness')
        setProgress(json)
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load readiness')
        setProgress(null)
      }
    }

    load()
  }, [])

  return (
    <main style={{ padding: 20, maxWidth: 800 }}>
      <h1 style={{ fontSize: 26, fontWeight: 800 }}>Readiness Overview</h1>

      <p style={{ marginTop: 6, opacity: 0.85 }}>
        Your overall preparedness based on checklist items and documents.
      </p>

      <div
        style={{
          marginTop: 20,
          padding: 16,
          border: '1px solid #444',
          borderRadius: 14,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 16 }}>
          Readiness Score
        </div>

        {error ? (
          <div style={{ marginTop: 12, color: '#f66' }}>{error}</div>
        ) : !progress ? (
          <div style={{ marginTop: 12 }}>Loading…</div>
        ) : (
          <>
            <div
              style={{
                marginTop: 12,
                fontSize: 36,
                fontWeight: 900,
              }}
            >
              {progress.overall.percent}%
            </div>

            <div style={{ marginTop: 6, opacity: 0.9 }}>
              {progress.overall.done} / {progress.overall.total} complete
            </div>

            <div style={{ marginTop: 16 }}>
              <div>
                📋 Checklist: {progress.buckets.checklist.percent}%
              </div>
              <div>
                📁 Documents: {progress.buckets.documents.percent}%
              </div>
            </div>
          </>
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        <Link href="/dashboard/readiness/documents">
          → Go to Documents
        </Link>
      </div>
    </main>
  )
}

