"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Logo from "@/components/Logo";

const audiences = [
  {
    icon: "✦",
    title: "Veterans",
    body: "Discover what your family is entitled to and make sure they can find everything they need.",
  },
  {
    icon: "◈",
    title: "Active Duty",
    body: "Your family is protected if something happens to you.",
  },
  {
    icon: "⌂",
    title: "Families & Spouses",
    body: "Know exactly what to do and where everything is — without the scramble.",
  },
  {
    icon: "◉",
    title: "First Responders",
    body: "Law enforcement, fire, and EMS — your family deserves the same protection you give everyone else.",
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
    title: "Organize your vault",
    body: "Upload critical documents, designate your Guardian, complete your readiness checklist.",
  },
  {
    number: "3",
    title: "Protect your family",
    body: "Your Guardian gets instant secure access when they need it. Your family knows exactly what they're entitled to and how to claim it.",
  },
];

const features = [
  {
    icon: "◆",
    title: "Post-Death Benefits Guide",
    body: "An AI-powered, personalized summary of every federal and state benefit your family is entitled to after your passing — DIC, survivor pension, CHAMPVA, property tax transfers, education benefits, burial benefits, and more.",
  },
  {
    icon: "◈",
    title: "Document Vault",
    body: "Every critical document — DD-214, insurance policies, wills, VA award letters — securely stored and instantly accessible to the people you designate.",
  },
  {
    icon: "◎",
    title: "Guardian Access",
    body: "Your designated Guardian gets secure token-based access without needing an account — exactly when they need it most.",
  },
  {
    icon: "❋",
    title: "Readiness Dashboard",
    body: "A mission-ready checklist so nothing gets missed and your family is never left guessing.",
  },
];

const trustItems = [
  { icon: "🔒", label: "Encrypted at rest", detail: "AES-256 encryption on all stored files" },
  { icon: "🔐", label: "Encrypted in transit", detail: "HTTPS everywhere, no exceptions" },
  { icon: "👤", label: "Private by design", detail: "Only you and your Guardian ever see your vault" },
  { icon: "⏱️", label: "Time-limited secure links", detail: "Guardian access auto-expires" },
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
              href="/dashboard/readiness/overview"
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
            <span className="text-amber-500">❧</span>
            Built for those who protect others
          </div>

          <h1 className="font-serif text-4xl font-semibold tracking-tight text-stone-900 leading-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl mx-auto">
            Prepared for life. Ready for whatever comes next.
          </h1>

          <p className="mt-8 text-stone-600 text-lg leading-relaxed max-w-2xl mx-auto md:text-xl">
            Life Sentinel helps veterans, active duty, and first responders organize what matters —
            and makes sure their families are protected no matter what.
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

          <p className="mt-6 text-xs text-stone-400">
            No credit card required. Takes less than 10 minutes to set up.
          </p>
        </div>
      </section>

      {/* ── 2. WHO IT'S FOR ── */}
      <section className="bg-white py-24 border-t border-stone-200">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-medium uppercase tracking-widest text-amber-600 mb-3">
              Who it's for
            </p>
            <h2 className="font-serif text-4xl font-semibold text-stone-900 md:text-5xl">
              Built for the ones who protect others
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
          <span className="text-amber-500 text-3xl select-none">❧</span>

          <h2 className="mt-6 font-serif text-3xl font-semibold text-white md:text-4xl leading-snug">
            Two crises at once.
          </h2>

          <p className="mt-8 text-stone-300 text-lg leading-relaxed">
            When a veteran or first responder passes, their family faces two crises at once — grief,
            and an overwhelming maze of documents, benefits, and decisions they were never prepared for.
          </p>

          <div className="mt-10 grid gap-4 text-left md:grid-cols-3">
            {[
              "Most families miss benefits they're entitled to simply because they didn't know to ask.",
              "Critical documents — DD-214, insurance policies, VA letters — are scattered or missing.",
              "Without a Guardian designation, families are left searching at the worst possible moment.",
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
              Three steps. No technical knowledge required. Start today and finish at your own pace.
            </p>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-12 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
            <div className="grid gap-8 md:grid-cols-3">
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
              and the U.S. military. Only you and your designated Guardian can ever access your vault.
              We never sell or share your data.
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

          <div className="mt-10 rounded-3xl border border-stone-700 bg-stone-800/30 px-8 py-7 text-center">
            <p className="text-stone-300 text-sm leading-relaxed max-w-2xl mx-auto">
              We will never sell your data, share it with advertisers, or use it for any purpose
              other than providing this service to you and your family. Your vault is yours alone.
            </p>
          </div>
        </div>
      </section>

      {/* ── 7. TESTIMONIAL PLACEHOLDER ── */}
      <section className="bg-white py-24 border-t border-stone-200">
        <div className="mx-auto max-w-4xl px-6 md:px-8 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-amber-600 mb-3">
            Trusted by families
          </p>
          <h2 className="font-serif text-4xl font-semibold text-stone-900 md:text-5xl mb-14">
            What families are saying
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/40 p-8 flex flex-col gap-4"
              >
                <div className="text-2xl text-amber-300 select-none">&ldquo;</div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-full rounded bg-amber-100" />
                  <div className="h-3 w-5/6 rounded bg-amber-100" />
                  <div className="h-3 w-4/6 rounded bg-amber-100" />
                </div>
                <div className="flex items-center gap-3 pt-2 border-t border-amber-100">
                  <div className="h-8 w-8 rounded-full bg-amber-200" />
                  <div className="space-y-1">
                    <div className="h-2.5 w-24 rounded bg-amber-100" />
                    <div className="h-2 w-16 rounded bg-amber-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-10 text-xs text-stone-400 italic">
            Testimonials coming soon — we&rsquo;re just getting started.
          </p>
        </div>
      </section>

      {/* ── 8. FINAL CTA ── */}
      <section className="bg-gradient-to-br from-amber-50 via-[#faf8f5] to-stone-100 py-28">
        <div className="mx-auto max-w-3xl px-6 md:px-8 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 border border-amber-200 text-3xl text-amber-600 mb-8 select-none">
            ❧
          </div>

          <h2 className="font-serif text-4xl font-semibold text-stone-900 md:text-5xl leading-tight">
            Start protecting your family today.
          </h2>

          <p className="mt-6 text-stone-600 text-lg leading-relaxed max-w-xl mx-auto">
            It takes less than ten minutes to create your vault and add your first documents.
            The peace of mind lasts a lifetime.
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
            <span className="text-amber-600 select-none">❧</span>
            <span className="font-serif text-sm font-semibold text-stone-900">Life Sentinel</span>
          </div>
          <p className="font-serif text-sm text-stone-400 italic hidden md:block">
            &ldquo;Prepared for life. Ready for whatever comes next.&rdquo;
          </p>
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
