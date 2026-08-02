"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Logo from "@/components/Logo";

const audiences = [
  {
    icon: "✦",
    title: "Veterans",
    body: "Every benefit your service earned — DIC, CHAMPVA, DEA, and more — captured for your family, with every key document locatable.",
  },
  {
    icon: "◈",
    title: "Active, Reserve & Guard",
    body: "Every benefit your service is earning for your family — captured, organized, and ready the day they need it.",
  },
  {
    icon: "⌂",
    title: "Spouses & Dependents",
    body: "Understand exactly what you're owed — DIC, CHAMPVA, DEA, and more — and know where every document lives.",
  },
];

const steps = [
  {
    number: "1",
    title: "Build your profile",
    body: "Tell us about your service, state, and family. Takes 5 minutes.",
  },
  {
    number: "2",
    title: "Protect your family",
    body: "Your family knows exactly what they're entitled to and where every key document is kept — no scramble, no guessing.",
  },
];

const features = [
  {
    icon: "◆",
    title: "Post-Death Benefits Guide",
    body: "An AI-powered, personalized summary of every federal and state benefit your family is entitled to after your passing — DIC, survivor pension, CHAMPVA, property tax transfers, education benefits, burial benefits, and more.",
  },
  {
    icon: "❋",
    title: "Records Locator",
    body: "Note where every critical document lives — will, DD-214, insurance, VA letters. Your family finds them in seconds, not weeks.",
  },
];

const trustItems = [
  { icon: "🔐", label: "Encrypted in transit", detail: "HTTPS everywhere, no exceptions" },
  { icon: "👤", label: "Private by design", detail: "Only you can see your data" },
  { icon: "🚫", label: "Never sold or shared", detail: "Your data is yours, full stop" },
];

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#faf8f5] font-sans">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-8">
          <Link href="/" className="flex items-center">
            <Logo />
          </Link>
          {loggedIn ? (
            <Link
              href="/dashboard"
              className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* ── 1. HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-[#faf8f5] to-stone-100">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -right-20 h-96 w-96 rounded-full bg-amber-100/40 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-stone-200/50 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-24 md:px-8 md:py-36 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-medium text-amber-800 mb-8">
            Built for military families
          </div>

          <h1 className="font-serif text-4xl font-semibold tracking-tight text-stone-900 leading-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl mx-auto">
            Every benefit your service earned. Every document your family needs.
          </h1>

          <p className="mt-8 text-stone-600 text-lg leading-relaxed max-w-2xl mx-auto md:text-xl">
            Whether you served, are still serving, or your family&rsquo;s benefits derive from someone who did — Life Sentinel
            tells your family exactly what they&rsquo;re entitled to and where every key document lives.
          </p>

          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="rounded-xl bg-amber-600 px-8 py-4 text-base font-medium text-white shadow-lg shadow-amber-200 transition hover:bg-amber-700 hover:shadow-amber-300"
            >
              Get Started Free
            </Link>
            <a
              href="#how-it-works"
              className="rounded-xl border border-stone-300 bg-white px-8 py-4 text-base font-medium text-stone-700 transition hover:bg-stone-50"
            >
              See how it works
            </a>
          </div>

          <p className="mt-5 text-sm text-stone-500 max-w-lg mx-auto">
            No uploads required. Use the planning tools and just tell your family where your documents live.
          </p>

          <p className="mt-3 text-xs text-stone-400">
            No credit card required. Takes less than 10 minutes to set up.
          </p>
        </div>
      </section>

      {/* ── 2. WHO IT'S FOR ── */}
      <section className="bg-white py-24 border-t border-stone-200">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-medium uppercase tracking-widest text-amber-600 mb-3">
              Who it&rsquo;s for
            </p>
            <h2 className="font-serif text-4xl font-semibold text-stone-900 md:text-5xl">
              Built for veterans, service members, and their families
            </h2>
          </div>

          <div className="mx-auto max-w-4xl grid gap-5 lg:grid-cols-3">
            {audiences.map((a) => (
              <div
                key={a.title}
                className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-[#faf8f5] p-7 hover:border-amber-200 hover:shadow-sm transition"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 border border-amber-100 text-2xl text-amber-600 select-none">
                  {a.icon}
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-stone-900 mb-2">
                    {a.title}
                  </h3>
                  <p className="text-stone-500 text-sm leading-relaxed">{a.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. THE PROBLEM ── */}
      <section className="bg-stone-900 py-24">
        <div className="mx-auto max-w-4xl px-6 md:px-8 text-center">
          <h2 className="font-serif text-3xl font-semibold text-white md:text-4xl leading-snug">
            Two crises at once.
          </h2>

          <p className="mt-8 text-stone-300 text-lg leading-relaxed">
            When a veteran passes, their family faces two crises at once — grief,
            and an overwhelming maze of documents, benefits, and decisions they were never prepared for.
          </p>

          <div className="mt-10 grid gap-4 text-left md:grid-cols-3">
            {[
              "Most families miss benefits they're entitled to simply because they didn't know to ask.",
              "Critical documents — DD-214, insurance policies, VA letters — are scattered or missing.",
              "When documents aren't inventoried, families are left searching at the worst possible moment.",
            ].map((text) => (
              <div
                key={text}
                className="rounded-2xl border border-stone-800 bg-stone-800/50 px-5 py-5"
              >
                <p className="text-stone-300 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-3xl border border-amber-900/50 bg-amber-950/30 px-8 py-8">
            <p className="font-serif text-2xl text-amber-100 leading-relaxed md:text-3xl">
              Life Sentinel changes that.
            </p>
            <p className="mt-4 text-stone-400 text-base leading-relaxed">
              A few hours of preparation today can spare your family weeks of confusion.
              Life Sentinel makes that preparation simple, private, and permanent.
            </p>
          </div>
        </div>
      </section>

      {/* ── 4. HOW IT WORKS ── */}
      <section id="how-it-works" className="bg-white py-24 border-t border-stone-200">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-medium uppercase tracking-widest text-amber-600 mb-3">
              Simple by design
            </p>
            <h2 className="font-serif text-4xl font-semibold text-stone-900 md:text-5xl">
              How it works
            </h2>
            <p className="mt-4 text-stone-500 text-base max-w-xl mx-auto leading-relaxed">
              Two steps. No technical knowledge required. Start today and finish at your own pace.
            </p>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-12 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
            <div className="grid gap-8 md:grid-cols-2">
              {steps.map((step) => (
                <div key={step.number} className="relative text-center">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-600 text-white font-serif text-2xl font-semibold shadow-lg shadow-amber-200 mb-6">
                    {step.number}
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-stone-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-stone-500 text-sm leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 rounded-3xl border border-amber-100 bg-amber-50/50 px-8 py-7">
            <h3 className="font-serif text-lg font-semibold text-stone-900">
              Your documents stay where you want them
            </h3>
            <p className="mt-3 text-stone-500 text-sm leading-relaxed">
              Keep them in your own cloud drive, safe deposit box, or wherever you prefer —
              just leave instructions on where to find them. Life Sentinel&rsquo;s planning tools work regardless.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. KEY FEATURES ── */}
      <section className="bg-[#faf8f5] py-24 border-t border-stone-200">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-medium uppercase tracking-widest text-amber-600 mb-3">
              What you get
            </p>
            <h2 className="font-serif text-4xl font-semibold text-stone-900 md:text-5xl">
              Everything in one calm place
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 border border-amber-100 text-2xl text-amber-600 mb-6 select-none">
                  {f.icon}
                </div>
                <h3 className="font-serif text-xl font-semibold text-stone-900 mb-3">
                  {f.title}
                </h3>
                <p className="text-stone-500 text-sm leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. SECURITY & TRUST ── */}
      <section className="bg-stone-900 py-24">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-medium uppercase tracking-widest text-amber-500 mb-3">
              Built to be trusted
            </p>
            <h2 className="font-serif text-4xl font-semibold text-white md:text-5xl">
              Security & Trust
            </h2>
            <p className="mt-5 text-stone-400 text-base max-w-2xl mx-auto leading-relaxed">
              Your information is protected with AES-256 encryption — the same standard used by banks
              and the U.S. military. Only you can access your data. We never sell or share your information.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trustItems.map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-4 rounded-2xl border border-stone-800 bg-stone-800/40 px-5 py-5"
              >
                <div className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-950/60 border border-amber-900/50 text-lg select-none">
                  {item.icon}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{item.label}</div>
                  <div className="mt-0.5 text-xs text-stone-400">{item.detail}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-3xl border border-amber-700/30 bg-amber-950/20 px-8 py-8">
            <p className="font-serif text-xl font-semibold text-amber-100">
              The most secure document is the one you never upload.
            </p>
            <p className="mt-3 text-stone-400 text-sm leading-relaxed max-w-2xl">
              Life Sentinel doesn&rsquo;t store your documents at all. Keep them in your preferred cloud
              drive, safe deposit box, or wherever you prefer — Life Sentinel tells your family
              where to find them.
            </p>
          </div>

          <div className="mt-4 rounded-3xl border border-stone-700 bg-stone-800/30 px-8 py-7 text-center">
            <p className="text-stone-300 text-sm leading-relaxed max-w-2xl mx-auto">
              We will never sell your data, share it with advertisers, or use it for any purpose
              other than providing this service to you and your family. Your data is yours alone.
            </p>
          </div>
        </div>
      </section>

      {/* ── 8. FAQ ── */}
      <section className="bg-white py-24 border-t border-stone-200">
        <div className="mx-auto max-w-4xl px-6 md:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-medium uppercase tracking-widest text-amber-600 mb-3">
              Common questions
            </p>
            <h2 className="font-serif text-4xl font-semibold text-stone-900 md:text-5xl">
              Frequently asked
            </h2>
          </div>

          <div className="divide-y divide-stone-100">
            <div className="py-8">
              <h3 className="font-serif text-lg font-semibold text-stone-900">
                Do I have to upload my documents?
              </h3>
              <p className="mt-3 text-stone-500 text-sm leading-relaxed">
                No. Life Sentinel&rsquo;s planning tools, benefits guidance, and Digital Estate sections
                all work without uploading anything. If you&rsquo;d rather keep documents in iCloud,
                Google Drive, Proton Drive, or a safe deposit box, just record where they are so
                your family can find them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. FINAL CTA ── */}
      <section className="bg-gradient-to-br from-amber-50 via-[#faf8f5] to-stone-100 py-28">
        <div className="mx-auto max-w-3xl px-6 md:px-8 text-center">
          <h2 className="font-serif text-4xl font-semibold text-stone-900 md:text-5xl leading-tight">
            Make sure your family gets what your service earned.
          </h2>

          <p className="mt-6 text-stone-600 text-lg leading-relaxed max-w-xl mx-auto">
            A few minutes to build your profile — Life Sentinel generates your personalized benefits guide
            (DIC, CHAMPVA, and more) plus a Records Locator your family can find in a crisis.
          </p>

          <Link
            href="/login"
            className="mt-10 inline-flex rounded-xl bg-amber-600 px-10 py-4 text-base font-medium text-white shadow-lg shadow-amber-200 transition hover:bg-amber-700 hover:shadow-amber-300"
          >
            Get Started Free
          </Link>

          <p className="mt-5 text-xs text-stone-400">
            No credit card required.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-stone-200 bg-white py-10">
        <div className="mx-auto max-w-6xl px-6 md:px-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif text-sm font-semibold text-stone-900">Life Sentinel</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-stone-400">
            <Link href="/privacy" className="hover:text-amber-700 transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-amber-700 transition">Terms of Service</Link>
            <Link href="/login" className="hover:text-amber-700 transition">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
