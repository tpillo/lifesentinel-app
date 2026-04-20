"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const navLinks = [
  { href: "/dashboard/readiness/overview", label: "Overview" },
  { href: "/dashboard/readiness/documents", label: "Documents" },
  { href: "/dashboard/vault", label: "Vault" },
  { href: "/dashboard/readiness/deployment", label: "Pre-Deployment" },
  { href: "/dashboard/readiness/survivor", label: "Survivor" },
  { href: "/dashboard/guardian", label: "Share" },
];

export default function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-amber-600 text-xl">❧</span>
          <span className="font-serif text-lg font-semibold text-stone-900 tracking-tight">
            LifeSentinel
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-1">
            {navLinks.map((link) => {
              const active = pathname === link.href || pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    active
                      ? "bg-amber-50 text-amber-800"
                      : "text-stone-500 hover:bg-stone-100 hover:text-stone-800"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={handleSignOut}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
