"use client";

import Link from "next/link";

const steps = [
  {
    number: "1",
    title: "Create your vault",
    body: "Sign up in minutes. Your private, encrypted vault is ready immediately — no setup required.",
  },
  {
    number: "2",
    title: "Complete your checklist",
    body: "Work through the pre-deployment or readiness checklist at your own pace. Upload documents, mark items complete, and close the gaps.",
  },
  {
    number: "3",
    title: "Share with your guardian",
    body: "Generate a private link for a trusted person. They get read-only access to exactly what they need — and nothing more.",
  },
];

const features = [
  {
    icon: "◈",
    title: "Family Vault",
    body: "A secure, organized home for every document that matters. Identity, legal, insurance, finance, military records, and more — all in one place.",
  },
  {
    icon: "◉",
    title: "Readiness Dashboard",
    body: "See at a glance what's protected and what still needs attention. A simple progress view that moves at your pace.",
  },
  {
    icon: "◎",
    title: "Guardian Access",
    body: "Share a private, expiring link with someone you trust. They can view your documents without an account — and you can revoke access anytime.",
  },
  {
    icon: "✦",
    title: "Pre-Deployment Checklist",
    body: "A step-by-step checklist for service members and families: POA, updated will, SGLI beneficiaries, DEERS enrollment, financial independence, and more — before you leave.",
  },
  {
    icon: "◆",
    title: "Survivor's Checklist",
    body: "A guided timeline for the weeks after a loss — from the first 48 hours through 90 days. DIC, SBP, CHAMPVA, Social Security, probate — nothing falls through the cracks.",
  },
  {
    icon: "❋",
    title: "Veteran Document Guide",
    body: "Deep guidance on every critical veteran document: DD-214, VA Rating Decision, SBP election, CHAMPVA, burial benefits, and what to do if any of them are missing.",
  },
];

const featuredAudiences = [
  {
    icon: "✦",
    title: "Military & Veteran Families",
    body: "From pre-deployment prep to survivor benefits — POA, updated will, SGLI beneficiaries, DD-214, SBP, CHAMPVA, DIC. Built for every stage of military family life.",
    badge: "Pre-Deployment Checklist →",
    badgeHref: "/login",
  },
  {
    icon: "◆",
    title: "First Responders",
    body: "Every shift carries risk. Make sure your family has legal authority, financial access, and every critical document — so they're never left searching if something happens to you.",
    badge: "Family Readiness →",
    badgeHref: "/login",
  },
];

const regularAudiences = [
  {
    icon: "⌂",
    title: "Families planning ahead",
    body: "Give your spouse, children, or parents the clarity they deserve. One organized place, ready when they need it.",
  },
  {
    icon: "❋",
    title: "Aging individuals & caregivers",
    body: "Help an aging parent get organized, or get organized yourself. Reduce the burden on the people who will one day need to step in.",
  },
];

const trustItems = [
  { icon: "⬡", label: "AES-256 Encryption", detail: "All files encrypted at rest" },
  { icon: "◈", label: "HTTPS Everywhere", detail: "All data encrypted in transit" },
  { icon: "◎", label: "Private by Default", detail: "Nothing shared without your consent" },
  { icon: "◆", label: "Expiring Links", detail: "Guardian access auto-expires" },
  { icon: "✦", label: "No Data Sales", detail: "Your data is never sold or shared" },
  { icon: "⌂", label: "Revoke Anytime", detail: "Withdraw guardian access instantly" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#faf8f5] font-sans">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-amber-600 text-xl select-none">❧</span>
            <span className="font-serif text-lg font-semibold text-stone-900 tracking-tight">
              LifeSentinel
            </span>
          </Link>
          <Link
            href="/login"
            className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-[#faf8f5] to-stone-100">
        {/* Decorative background elements */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -right-20 h-96 w-96 rounded-full bg-amber-100/40 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-stone-200/50 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-24 md:px-8 md:py-36 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-medium text-amber-800 mb-8">
            <span className="text-amber-500">❧</span>
            A quiet act of love
          </div>

          <h1 className="font-serif text-5xl font-semibold tracking-tight text-stone-900 leading-tight md:text-6xl lg:text-7xl max-w-4xl mx-auto">
            The Greatest Gift You Can Leave Your Family
          </h1>

          <p className="mt-8 text-stone-600 text-lg leading-relaxed max-w-2xl mx-auto md:text-xl">
            LifeSentinel helps you organize your most important documents, protect them
            in a private vault, and share them with someone you trust — so your family
            is never left searching when it matters most.
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

      {/* ── Problem ── */}
      <section className="bg-stone-900 py-24">
        <div className="mx-auto max-w-4xl px-6 md:px-8 text-center">
          <span className="text-amber-500 text-3xl select-none">❧</span>

          <h2 className="mt-6 font-serif text-3xl font-semibold text-white md:text-4xl leading-snug">
            When a family loses someone they love, the grief is already overwhelming.
          </h2>

          <p className="mt-8 text-stone-400 text-lg leading-relaxed">
            Then comes the searching.
          </p>

          <div className="mt-10 grid gap-4 text-left md:grid-cols-3">
            {[
              "Through drawers and filing cabinets for a will that may not exist.",
              "Through old emails for an insurance policy number no one remembers.",
              "Through contacts for a lawyer's phone number that was never written down.",
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
              It doesn&rsquo;t have to be that way.
            </p>
            <p className="mt-4 text-stone-400 text-base leading-relaxed">
              A few hours of preparation today can spare your family weeks of confusion
              and heartache tomorrow. LifeSentinel makes that preparation simple,
              private, and permanent.
            </p>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="bg-white py-24 border-t border-stone-200">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-medium uppercase tracking-widest text-amber-600 mb-3">
              Simple by design
            </p>
            <h2 className="font-serif text-4xl font-semibold text-stone-900 md:text-5xl">
              How It Works
            </h2>
            <p className="mt-4 text-stone-500 text-base max-w-xl mx-auto leading-relaxed">
              Three steps. No technical knowledge required. Start today and finish at your own pace.
            </p>
          </div>

          <div className="relative">
            {/* Connecting line */}
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

      {/* ── Key Features ── */}
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

          <div className="grid gap-6 md:grid-cols-3">
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

      {/* ── Who It's For ── */}
      <section className="bg-white py-24 border-t border-stone-200">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <div className="text-center mb-6">
            <p className="text-xs font-medium uppercase tracking-widest text-amber-600 mb-3">
              Built for real families
            </p>
            <h2 className="font-serif text-4xl font-semibold text-stone-900 md:text-5xl">
              Who It&rsquo;s For
            </h2>
          </div>

          <div className="mx-auto max-w-3xl text-center mb-10">
            <p className="font-serif text-xl text-stone-500 leading-relaxed italic">
              &ldquo;The people who protect others deserve to protect their own families too.&rdquo;
            </p>
          </div>

          {/* Featured: Military & First Responders */}
          <div className="grid gap-4 md:grid-cols-2 mb-4">
            {featuredAudiences.map((a) => (
              <div
                key={a.title}
                className="flex flex-col gap-4 rounded-2xl bg-stone-900 border border-stone-700 p-7"
              >
                <div className="flex gap-4">
                  <div className="shrink-0 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-600/20 border border-amber-500/30 text-xl text-amber-400 select-none">
                    {a.icon}
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-white mb-2">
                      {a.title}
                    </h3>
                    <p className="text-stone-400 text-sm leading-relaxed">{a.body}</p>
                  </div>
                </div>
                <Link
                  href={a.badgeHref}
                  className="self-start rounded-lg border border-amber-500/40 bg-amber-600/20 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-600/30 transition"
                >
                  {a.badge}
                </Link>
              </div>
            ))}
          </div>

          {/* Regular audiences */}
          <div className="grid gap-4 md:grid-cols-2">
            {regularAudiences.map((a) => (
              <div
                key={a.title}
                className="flex gap-5 rounded-2xl border border-stone-200 bg-[#faf8f5] p-7"
              >
                <div className="shrink-0 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 border border-amber-100 text-xl text-amber-600 select-none">
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

      {/* ── Security & Trust ── */}
      <section className="bg-stone-900 py-24">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-medium uppercase tracking-widest text-amber-500 mb-3">
              Built to be trusted
            </p>
            <h2 className="font-serif text-4xl font-semibold text-white md:text-5xl">
              Security & Trust
            </h2>
            <p className="mt-4 text-stone-400 text-base max-w-xl mx-auto leading-relaxed">
              Your family&rsquo;s most important documents deserve the highest level of protection.
              Here&rsquo;s what we do to keep them safe.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trustItems.map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-4 rounded-2xl border border-stone-800 bg-stone-800/40 px-5 py-5"
              >
                <div className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-950/60 border border-amber-900/50 text-lg text-amber-500 select-none">
                  {item.icon}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{item.label}</div>
                  <div className="mt-0.5 text-xs text-stone-400">{item.detail}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-3xl border border-stone-700 bg-stone-800/30 px-8 py-8 text-center">
            <p className="text-stone-300 text-sm leading-relaxed max-w-2xl mx-auto">
              We will never sell your data, share it with advertisers, or use it for
              any purpose other than providing this service to you and your family.
              Your vault is yours alone.
            </p>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
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
            No credit card required &nbsp;·&nbsp; Private and secure &nbsp;·&nbsp; Cancel anytime
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-stone-200 bg-white py-10">
        <div className="mx-auto max-w-6xl px-6 md:px-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-amber-600 select-none">❧</span>
            <span className="font-serif text-sm font-semibold text-stone-900">LifeSentinel</span>
          </div>
          <p className="font-serif text-sm text-stone-400 italic">
            &ldquo;Because your loved ones deserve certainty.&rdquo;
          </p>
          <Link
            href="/login"
            className="text-xs text-stone-400 hover:text-amber-700 transition"
          >
            Sign In
          </Link>
        </div>
      </footer>
    </div>
  );
}
