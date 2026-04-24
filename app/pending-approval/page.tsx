"use client";

import Link from "next/link";
import Logo from "@/components/Logo";

export default function PendingApprovalPage() {
  return (
    <main className="min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="flex justify-center mb-6">
          <Link href="/">
            <Logo />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 border border-amber-200 text-2xl text-amber-600 mb-5 mx-auto">
            ◎
          </div>
          <h2 className="font-serif text-xl font-semibold text-stone-900 mb-3">
            Account Pending Approval
          </h2>
          <p className="text-stone-500 text-sm leading-relaxed">
            Thank you for registering. Your account is pending approval — we review each account personally to ensure Life Sentinel remains a trusted resource for military families.
          </p>
          <p className="text-stone-400 text-sm leading-relaxed mt-3">
            You&apos;ll receive an email once your account has been approved.
          </p>
        </div>

        <p className="mt-6 text-xs text-stone-400">
          Questions?{" "}
          <a href="mailto:support@lifesentinelfamily.com" className="text-amber-600 hover:text-amber-700 underline">
            Contact us
          </a>
        </p>
      </div>
    </main>
  );
}
