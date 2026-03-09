import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

type StorageItem = {
  name: string
  id?: string | null
  created_at?: string | null
  updated_at?: string | null
}

type VaultFile = {
  name: string
  path: string
  url: string
  created_at: string | null
  updated_at: string | null
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRole) {
    throw new Error("Missing Supabase env vars")
  }

  return createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

async function listFolder(bucket: string, folder: string) {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase.storage.from(bucket).list(folder, {
    limit: 200,
    sortBy: { column: "name", order: "asc" },
  })

  if (error) {
    throw new Error(`List failed for "${bucket}/${folder}": ${error.message}`)
  }

  return (data || []) as StorageItem[]
}

function buildPublicUrl(path: string) {
  const supabase = getSupabaseAdmin()
  const { data } = supabase.storage.from("vault").getPublicUrl(path)
  return data.publicUrl
}

async function walkBucket(
  bucket: string,
  folder = "",
  depth = 0,
  maxDepth = 6
): Promise<VaultFile[]> {
  if (depth > maxDepth) return []

  const items = await listFolder(bucket, folder)
  const files: VaultFile[] = []

  for (const item of items) {
    const isFolder = !item.id
    const fullPath = folder ? `${folder}/${item.name}` : item.name

    if (isFolder) {
      const nested = await walkBucket(bucket, fullPath, depth + 1, maxDepth)
      files.push(...nested)
      continue
    }

    files.push({
      name: item.name,
      path: fullPath,
      url: buildPublicUrl(fullPath),
      created_at: item.created_at ?? null,
      updated_at: item.updated_at ?? null,
    })
  }

  return files
}

export async function GET() {
  try {
    const files = await walkBucket("vault", "", 0, 6)

    return NextResponse.json({
      count: files.length,
      files,
    })
  } catch (error) {
    console.error("guardian-vault GET failed:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}