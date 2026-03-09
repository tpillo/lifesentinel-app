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
          const overviewRes = await fetch("/api/readiness/overview", { cache: "no-store" })
          const overviewText = await overviewRes.text()

          if (!overviewRes.ok) {
            throw new Error(
              `Overview load failed (${overviewRes.status}): ${overviewText || "No response body"}`
            )
          }

          overviewData = JSON.parse(overviewText) as OverviewResponse
          sessionStorage.setItem(`guardian-overview-${token}`, JSON.stringify(overviewData))
        }

        setOverview(overviewData)

        const vaultRes = await fetch("/api/guardian-vault", { cache: "no-store" })
        const vaultText = await vaultRes.text()

        if (!vaultRes.ok) {
          throw new Error(
            `Vault load failed (${vaultRes.status}): ${vaultText || "No response body"}`
          )
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

    if (token) {
      load()
    }
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
  const missingDocs = matchedDocs.filter((doc) => !doc.matchedFile)

  if (loading) {
    return <div className="p-8 text-white">Loading guardian vault...</div>
  }

  if (error) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-white mb-4">Guardian Vault</h1>
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-red-600 font-semibold mb-2">Failed to load guardian vault</div>
          <pre className="text-sm whitespace-pre-wrap text-gray-700">{error}</pre>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-5xl font-bold text-white">Guardian Vault</h1>
          <p className="mt-4 text-xl text-gray-400">
            Read-only view of matched family readiness documents.
          </p>
        </div>

        <Link
          href={`/g/${token}`}
          className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-white hover:bg-white/20"
        >
          Back to overview
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <div className="text-sm text-gray-500">Checklist Items</div>
          <div className="mt-4 text-5xl font-bold text-gray-900">{matchedDocs.length}</div>
        </div>

        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <div className="text-sm text-gray-500">Files Matched</div>
          <div className="mt-4 text-5xl font-bold text-gray-900">{availableDocs.length}</div>
        </div>

        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <div className="text-sm text-gray-500">Still Missing</div>
          <div className="mt-4 text-5xl font-bold text-gray-900">{missingDocs.length}</div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        <h2 className="text-3xl font-semibold text-gray-900 mb-6">Matched Documents</h2>

        <div className="space-y-4">
          {matchedDocs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 px-6 py-5"
            >
              <div>
                <div className="text-2xl font-medium text-gray-900">{doc.title}</div>
                <div className="text-lg text-gray-500">
                  {doc.completed ? "Checklist marked complete" : "Checklist not marked complete"}
                </div>

                {doc.matchedFile ? (
                  <div className="mt-2 text-sm text-green-700">
                    Matched file: {doc.matchedFile.name}
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-amber-700">
                    No matching file found
                  </div>
                )}
              </div>

              <div>
                {doc.matchedFile?.url ? (
                  <a
                    href={doc.matchedFile.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-gray-300 px-4 py-2 text-lg text-gray-900 hover:bg-gray-50"
                  >
                    Open File
                  </a>
                ) : (
                  <span className="rounded-xl border border-gray-200 px-4 py-2 text-lg text-gray-400">
                    No File
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        <h2 className="text-3xl font-semibold text-gray-900 mb-6">All Uploaded Vault Files</h2>

        {vaultFiles.length === 0 ? (
          <div className="text-lg text-gray-500">No vault files found.</div>
        ) : (
          <div className="space-y-4">
            {vaultFiles.map((file) => (
              <div
                key={file.path || file.name}
                className="flex items-center justify-between rounded-xl border border-gray-200 px-6 py-5"
              >
                <div>
                  <div className="text-xl font-medium text-gray-900">{file.name}</div>
                  {file.path ? <div className="mt-1 text-sm text-gray-500">{file.path}</div> : null}
                </div>

                {file.url ? (
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-gray-300 px-4 py-2 text-lg text-gray-900 hover:bg-gray-50"
                  >
                    Open
                  </a>
                ) : (
                  <span className="rounded-xl border border-gray-200 px-4 py-2 text-lg text-gray-400">
                    No URL
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}