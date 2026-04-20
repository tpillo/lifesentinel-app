"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { findBestFileMatch, type VaultFile } from "@/lib/filenameMatch"

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

type VaultApiFile = {
  name: string
  path?: string
  url?: string
  created_at?: string | null
  updated_at?: string | null
}

type VaultApiResponse = {
  files: VaultApiFile[]
}

type MatchedDoc = {
  id: string
  title: string
  completed: boolean
  matchedFile: VaultFile | null
}

export default function GuardianVaultPage() {
  const params = useParams()
  const token = Array.isArray(params?.token) ? params.token[0] : params?.token ?? ""

  const [overview, setOverview] = useState<OverviewResponse | null>(null)
  const [vaultFiles, setVaultFiles] = useState<VaultFile[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError("")

        let overviewData: OverviewResponse | null = null

        const cached = sessionStorage.getItem(`guardian-overview-${token}`)
        if (cached) {
          overviewData = JSON.parse(cached) as OverviewResponse
        } else {
          const overviewRes = await fetch(`/api/guardian/overview?token=${token}`, { cache: "no-store" })
          const overviewText = await overviewRes.text()
          if (!overviewRes.ok) {
            throw new Error(`Overview load failed (${overviewRes.status}): ${overviewText || "No response body"}`)
          }
          overviewData = JSON.parse(overviewText) as OverviewResponse
          sessionStorage.setItem(`guardian-overview-${token}`, JSON.stringify(overviewData))
        }

        setOverview(overviewData)

        const vaultRes = await fetch(`/api/guardian/vault?token=${token}`, { cache: "no-store" })
        const vaultText = await vaultRes.text()
        if (!vaultRes.ok) {
          throw new Error(`Vault load failed (${vaultRes.status}): ${vaultText || "No response body"}`)
        }

        const vaultJson = JSON.parse(vaultText) as VaultApiResponse
        const files = (vaultJson.files || []).map((file) => ({
          name: file.name,
          path: file.path ?? file.name,
          url: file.url,
          created_at: file.created_at ?? null,
          updated_at: file.updated_at ?? null,
        }))

        setVaultFiles(files)
      } catch (err) {
        console.error("Guardian vault load failed:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    if (token) load()
  }, [token])

  const matchedDocs = useMemo<MatchedDoc[]>(() => {
    if (!overview) return []
    return overview.items.map((item) => ({
      id: item.id,
      title: item.title,
      completed: item.completed,
      matchedFile: findBestFileMatch(vaultFiles, item.title),
    }))
  }, [overview, vaultFiles])

  const availableDocs = matchedDocs.filter((doc) => doc.matchedFile)
  const notYetAdded = matchedDocs.filter((doc) => !doc.matchedFile)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="text-center">
          <div className="text-amber-600 text-3xl mb-3">❧</div>
          <p className="text-stone-500 text-sm">Loading documents prepared for you…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#faf8f5] p-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <div className="text-red-700 font-semibold mb-2">Unable to load documents</div>
            <pre className="text-sm whitespace-pre-wrap text-red-600">{error}</pre>
          </div>
        </div>
      </div>
    )
  }

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
            href={`/g/${token}`}
            className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
          >
            Back to overview
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 md:px-8 space-y-8">
        <div className="rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 to-stone-50 px-8 py-8 shadow-sm">
          <h1 className="font-serif text-3xl font-semibold text-stone-900">
            Family Documents
          </h1>
          <p className="mt-3 text-stone-500 text-sm leading-relaxed max-w-xl">
            These files were carefully organized and saved for you. Open or download anything you need below.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm text-center">
            <div className="text-sm text-stone-500 mb-3">Total Categories</div>
            <div className="text-5xl font-semibold text-stone-900">{matchedDocs.length}</div>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm text-center">
            <div className="text-sm text-emerald-700 mb-3">Files Ready</div>
            <div className="text-5xl font-semibold text-emerald-800">{availableDocs.length}</div>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm text-center">
            <div className="text-sm text-stone-500 mb-3">Not Yet Added</div>
            <div className="text-5xl font-semibold text-stone-900">{notYetAdded.length}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
          <h2 className="font-serif text-2xl font-semibold text-stone-900 mb-6">All Documents</h2>

          <div className="space-y-3">
            {matchedDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col gap-3 rounded-xl border border-stone-100 bg-stone-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-base font-medium text-stone-800">{doc.title}</div>
                  {doc.matchedFile ? (
                    <div className="mt-1 text-sm text-emerald-600">
                      {doc.matchedFile.name}
                    </div>
                  ) : (
                    <div className="mt-1 text-sm text-stone-400">
                      Not yet added
                    </div>
                  )}
                </div>

                <div className="shrink-0">
                  {doc.matchedFile?.url ? (
                    <a
                      href={doc.matchedFile.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
                    >
                      Open File
                    </a>
                  ) : (
                    <span className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-400">
                      Not yet added
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {vaultFiles.length > 0 && (
          <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
            <h2 className="font-serif text-2xl font-semibold text-stone-900 mb-6">
              All Uploaded Files
            </h2>

            <div className="space-y-3">
              {vaultFiles.map((file) => (
                <div
                  key={file.path || file.name}
                  className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50 px-5 py-4"
                >
                  <div>
                    <div className="text-base font-medium text-stone-800">{file.name}</div>
                    {file.path ? <div className="mt-1 text-sm text-stone-400">{file.path}</div> : null}
                  </div>

                  {file.url ? (
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
                    >
                      Open
                    </a>
                  ) : (
                    <span className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-400">
                      No file
                    </span>
                  )}
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
