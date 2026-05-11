import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export const dynamic = "force-dynamic"

type ReadinessRow = {
  id: string
  item_label: string | null
  is_present: boolean | null
}

export async function GET() {
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set() {},
          remove() {},
        },
      }
    )

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      return NextResponse.json(
        { error: `Auth error: ${userError.message}` },
        { status: 401 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: "No authenticated user found" },
        { status: 401 }
      )
    }

    // Fetch readiness document rows
    const { data, error } = await supabase
      .from("readiness_documents")
      .select("id, item_label, is_present")
      .eq("user_id", user.id)
      .order("item_label", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Fetch which readiness_document_ids have at least one location note
    const { data: locationData } = await supabase
      .from("document_locations")
      .select("readiness_document_id")
      .eq("user_id", user.id)
      .not("readiness_document_id", "is", null)

    const locatedDocIds = new Set(
      (locationData ?? []).map((r) => r.readiness_document_id as string)
    )

    // An item is complete if explicitly marked present OR a location note exists for it
    const items = (data ?? []).map((row: ReadinessRow) => ({
      id: String(row.id),
      title: String(row.item_label ?? "Untitled"),
      completed: Boolean(row.is_present) || locatedDocIds.has(String(row.id)),
    }))

    const total = items.length
    const completed = items.filter((item) => item.completed).length
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100)

    return NextResponse.json({
      total,
      completed,
      percent,
      items,
    })
  } catch (err) {
    console.error("GET /api/readiness/overview failed:", err)

    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Unknown server error",
      },
      { status: 500 }
    )
  }
}
