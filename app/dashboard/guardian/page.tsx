import DashboardHeader from "@/components/DashboardHeader";

export default function GuardianRetiredPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <DashboardHeader />
      <main className="mx-auto max-w-3xl px-6 py-8 md:px-8">
        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm text-center">
          <h1 className="font-serif text-2xl font-semibold text-stone-900">
            Share with a Guardian has been retired.
          </h1>
          <p className="mt-3 text-sm text-stone-500 leading-relaxed">
            Life Sentinel no longer offers document sharing via guardian links.
          </p>
        </div>
      </main>
    </div>
  );
}
