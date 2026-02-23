 // app/dashboard/guardian/page.tsx
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function GuardianDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If you already have middleware that guarantees auth, this is just extra safety.
  if (!user) {
    return (
      <div className="p-6 space-y-3">
        <h1 className="text-2xl font-semibold">Guardian</h1>
        <p className="text-sm text-red-600">Unauthorized</p>
        <Link
          href="/login"
          className="inline-flex items-center rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Go to Login
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Guardian</h1>
        <p className="text-sm text-muted-foreground">
          Read-only access to your loved one’s readiness and key info.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border p-5 space-y-3">
          <div>
            <h2 className="text-lg font-semibold">Readiness</h2>
            <p className="text-sm text-muted-foreground">
              View readiness status by category. No edits.
            </p>
          </div>

          <Link
            href="/dashboard/guardian/readiness"
            className="inline-flex items-center rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted w-fit"
          >
            View Readiness (Read-only)
          </Link>
        </div>

        <div className="rounded-xl border p-5 space-y-3">
          <div>
            <h2 className="text-lg font-semibold">Coming Next</h2>
            <p className="text-sm text-muted-foreground">
              Documents, instructions, triggers, and emergency actions—scoped by
              allowed categories.
            </p>
          </div>

          <div className="text-sm text-muted-foreground">
            You’ll see links here as modules go live.
          </div>
        </div>
      </div>

      <div className="rounded-xl border p-5 space-y-2">
        <div className="text-sm text-muted-foreground">Signed in as</div>
        <div className="text-sm font-medium">{user.email ?? user.id}</div>
      </div>
    </div>
  )
}