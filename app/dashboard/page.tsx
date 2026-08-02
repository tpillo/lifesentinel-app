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

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("user_id", user.id)
    .maybeSingle();

  const firstName = profile?.full_name?.trim().split(/\s+/)[0] ?? "";

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <DashboardHeader />
      <main className="mx-auto max-w-3xl px-6 py-10 md:px-8 space-y-10">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-stone-900 md:text-3xl">
            Welcome back{firstName ? `, ${firstName}` : ""}.
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Everything your family needs, in one place.
          </p>
        </div>

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
