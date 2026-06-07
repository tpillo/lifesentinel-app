import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function WaitlistPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const { denied } = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: approval } = await supabase
    .from("signup_approvals")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle();

  // Approved users should not be here
  if (approval?.status === "approved") redirect("/dashboard/benefits");

  const isDenied = approval?.status === "denied" || denied === "true";

  return (
    <main className="min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="font-serif text-3xl font-semibold text-stone-900 tracking-tight">
              LifeSentinel
            </h1>
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
          {isDenied ? (
            <>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 border border-stone-200 text-xl text-stone-500 mb-5 mx-auto flex">
                ✕
              </div>
              <h2 className="font-serif text-xl font-semibold text-stone-800 mb-4">
                Account not approved
              </h2>
              <p className="text-stone-500 text-sm leading-relaxed mb-4">
                Thanks for your interest in Life Sentinel. We&apos;re not able to
                approve your account at this time.
              </p>
              <p className="text-stone-500 text-sm leading-relaxed">
                If you believe this is a mistake or would like to discuss,
                please reach out to{" "}
                <a
                  href="mailto:support@lifesentinelfamily.com"
                  className="text-amber-700 hover:text-amber-800 transition underline"
                >
                  support@lifesentinelfamily.com
                </a>
                .
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 border border-amber-200 text-xl text-amber-600 mb-5 mx-auto flex">
                ⏳
              </div>
              <h2 className="font-serif text-xl font-semibold text-stone-800 mb-4">
                You&apos;re on the list
              </h2>
              <p className="text-stone-500 text-sm leading-relaxed mb-4">
                Thanks for signing up for Life Sentinel. We&apos;re keeping access
                intentional and reviewing each new account personally.
              </p>
              <p className="text-stone-500 text-sm leading-relaxed mb-4">
                We&apos;ll send you an email at{" "}
                <span className="font-medium text-stone-700">{user.email}</span>{" "}
                as soon as your account is ready.
              </p>
              <p className="text-stone-400 text-xs leading-relaxed">
                Typical approval time: 24–48 hours.
              </p>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-stone-400">
          <Link
            href="/api/auth/signout"
            className="text-stone-400 hover:text-stone-600 transition underline"
          >
            Sign out
          </Link>
        </p>
      </div>
    </main>
  );
}
