import { redirect } from "next/navigation";
import Link from "next/link";
import { Sparkles, Shield, FileText, BarChart3 } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import GetStartedCard, { type Completions } from "@/components/GetStartedCard";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileRes, guardianRes, rolesRes, docsRes] = await Promise.all([
    supabaseAdmin
      .from("profiles")
      .select(
        "occupation_type, benefits_acknowledged_at, onboarding_dismissed_at, onboarding_completed_at, readiness_overview_acknowledged_at"
      )
      .eq("user_id", user.id)
      .maybeSingle(),
    supabaseAdmin
      .from("guardian_links")
      .select("id", { count: "exact", head: true })
      .eq("owner_user_id", user.id)
      .is("revoked_at", null),
    supabaseAdmin
      .from("readiness_roles")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabaseAdmin
      .from("readiness_documents")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_present", true),
  ]);

  const profile = profileRes.data;
  const guardianCount = guardianRes.count ?? 0;
  const rolesCount = rolesRes.count ?? 0;
  const presentDocsCount = docsRes.count ?? 0;

  const completions: Completions = {
    profile: !!profile?.occupation_type,
    benefits: !!profile?.benefits_acknowledged_at,
    guardian: guardianCount > 0,
    roles: rolesCount > 0,
    documents: presentDocsCount >= 3,
    overview: !!profile?.readiness_overview_acknowledged_at,
  };

  const allComplete = Object.values(completions).every(Boolean);

  // Write onboarding_completed_at once when all steps detected — fire and forget
  if (allComplete && !profile?.onboarding_completed_at) {
    supabaseAdmin
      .from("profiles")
      .update({ onboarding_completed_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .then(() => {});
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <DashboardHeader />
      <main className="mx-auto max-w-3xl px-6 py-10 md:px-8 space-y-10">
        <GetStartedCard
          completions={completions}
          initialDismissed={!!profile?.onboarding_dismissed_at}
        />

        <div>
          <h3 className="mb-4 font-serif text-lg font-semibold text-stone-800">
            Your Dashboard
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {QUICK_ACTIONS.map(({ label, description, href, Icon, iconClass }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:shadow"
              >
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${iconClass}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-stone-900 transition group-hover:text-amber-800">
                    {label}
                  </p>
                  <p className="mt-1 text-sm text-stone-500">{description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

const QUICK_ACTIONS = [
  {
    label: "Family Benefits Guide",
    description: "Your personalized federal and state benefits analysis",
    href: "/dashboard/benefits",
    Icon: Sparkles,
    iconClass: "bg-amber-50 text-amber-700",
  },
  {
    label: "Guardian Access",
    description: "Share secure access with someone you trust",
    href: "/dashboard/guardian",
    Icon: Shield,
    iconClass: "bg-blue-50 text-blue-600",
  },
  {
    label: "Documents & Vault",
    description: "Map and protect your family's key documents",
    href: "/dashboard/readiness/documents",
    Icon: FileText,
    iconClass: "bg-stone-100 text-stone-600",
  },
  {
    label: "Readiness Overview",
    description: "See your full protection score at a glance",
    href: "/dashboard/readiness/overview",
    Icon: BarChart3,
    iconClass: "bg-emerald-50 text-emerald-600",
  },
];
