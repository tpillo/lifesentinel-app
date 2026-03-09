import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

type StorageItem = {
  name: string
  id?: string | null
  created_at?: string | null
  updated_at?: string | null
  metadata?: Record<string, unknown> | null
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

async function listPath(bucket: string, path: string) {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase.storage.from(bucket).list(path, {
    limit: 200,
    sortBy: { column: "name", order: "asc" },
  })

  return {
    bucket,
    path,
    error: error ? error.message : null,
    items: ((data || []) as StorageItem[]).map((item) => ({
      name: item.name,
      id: item.id ?? null,
      created_at: item.created_at ?? null,
      updated_at: item.updated_at ?? null,
      isFolder: !item.id,
      metadata: item.metadata ?? null,
    })),
  }
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      throw new Error(`listBuckets failed: ${bucketsError.message}`)
    }

    const bucketNames = (buckets || []).map((b) => b.name)

    const results = []

    for (const bucketName of bucketNames) {
      results.push(await listPath(bucketName, ""))
    }

    return NextResponse.json({
      buckets: bucketNames,
      results,
    })
  } catch (error) {
    console.error("guardian-vault-debug GET failed:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}