"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase";

const navLinks = [
  { href: "/dashboard/readiness/overview", label: "Overview" },
  { href: "/dashboard/readiness/documents", label: "Documents" },
  { href: "/dashboard/vault", label: "Vault" },
  { href: "/dashboard/readiness/deployment", label: "Pre-Deployment" },
  { href: "/dashboard/readiness/survivor", label: "Survivor" },
  { href: "/dashboard/guardian", label: "Share" },
  { href: "/profile-setup", label: "Profile" },
];

export default function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  return (
    <header className="border-b border-stone-200 bg-white relative z-40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-8">
        <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
          <span className="text-amber-600 text-xl">❧</span>
          <span className="font-serif text-lg font-semibold text-stone-900 tracking-tight">
            LifeSentinel
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-3">
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

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="md:hidden flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg text-stone-500 hover:bg-stone-100 transition"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          <span className={`block h-0.5 w-5 bg-current transition-all duration-200 ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`block h-0.5 w-5 bg-current transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-5 bg-current transition-all duration-200 ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </div>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className="md:hidden border-t border-stone-100 bg-white px-6 pb-5 pt-3 space-y-1">
          {navLinks.map((link) => {
            const active = pathname === link.href || pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block rounded-xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-amber-50 text-amber-800"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-stone-100 mt-2">
            <button
              onClick={() => { setMenuOpen(false); handleSignOut(); }}
              className="block w-full text-left rounded-xl px-4 py-3 text-sm font-medium text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
