"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // If Supabase returned an active session, email confirmation is off — go straight to dashboard.
    // If session is null, confirmation email was sent and the user needs to verify first.
    if (data.session) {
      router.replace("/profile-setup");
    } else {
      setConfirmed(true);
    }
  }

  if (confirmed) {
    return (
      <main className="min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-amber-600 text-4xl mb-4 select-none">❧</div>
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200 text-xl text-emerald-600 mb-5 mx-auto">
              ✓
            </div>
            <h2 className="font-serif text-xl font-semibold text-stone-900 mb-3">
              Check your inbox
            </h2>
            <p className="text-stone-500 text-sm leading-relaxed">
              We sent a confirmation link to{" "}
              <span className="font-medium text-stone-700">{email}</span>.
              Click it to activate your account, then sign in.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-amber-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-amber-700"
            >
              Go to sign in
            </Link>
          </div>
          <p className="mt-6 text-xs text-stone-400 leading-relaxed">
            Didn&apos;t receive it? Check your spam folder or{" "}
            <button
              onClick={() => setConfirmed(false)}
              className="text-amber-700 hover:text-amber-800 transition underline"
            >
              try again
            </button>
            .
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="text-amber-600 text-3xl mb-3 select-none">❧</div>
            <h1 className="font-serif text-3xl font-semibold text-stone-900 tracking-tight">
              LifeSentinel
            </h1>
          </Link>
          <p className="mt-3 text-stone-500 text-sm leading-relaxed">
            Create your vault and start protecting<br />what matters most to your family.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
          <h2 className="font-serif text-xl font-semibold text-stone-800 mb-6">
            Create your account
          </h2>

          <form onSubmit={handleRegister} className="space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-stone-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="mt-1.5 block w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-stone-900 placeholder-stone-400 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                placeholder="you@example.com"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-stone-700">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="mt-1.5 block w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-stone-900 placeholder-stone-400 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                placeholder="At least 8 characters"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-stone-700">Confirm password</span>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                className="mt-1.5 block w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-stone-900 placeholder-stone-400 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                placeholder="Re-enter your password"
              />
            </label>

            {error && (
              <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-amber-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating your account…" : "Create Account"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-stone-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-amber-700 hover:text-amber-800 transition">
            Sign in
          </Link>
        </p>

        <p className="mt-4 text-center text-xs text-stone-400 leading-relaxed">
          &ldquo;Because your loved ones deserve certainty.&rdquo;
        </p>
      </div>
    </main>
  );
}
