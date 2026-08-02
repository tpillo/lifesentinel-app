import { redirect } from "next/navigation";
import Link from "next/link";
import { Sparkles, FileText, BarChart3 } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <DashboardHeader />
      <main className="mx-auto max-w-3xl px-6 py-10 md:px-8 space-y-10">
        <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-5 py-3.5 shadow-sm">
          <span className="text-sm font-medium text-stone-700">
            Welcome back.
          </span>
        </div>

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
    label: "Records Locator",
    description: "Note where every key document lives so your family can find them",
    href: "/dashboard/readiness/documents",
    Icon: FileText,
    iconClass: "bg-stone-100 text-stone-600",
  },
  {
    label: "Overview",
    description: "Your family's readiness at a glance",
    href: "/dashboard/readiness/overview",
    Icon: BarChart3,
    iconClass: "bg-emerald-50 text-emerald-600",
  },
];
