import Logo from "@/components/Logo";

export default function GuardianRetiredPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center px-6 py-4 md:px-8">
          <Logo />
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-md text-center">
          <h1 className="font-serif text-2xl font-semibold text-stone-900">
            This sharing feature has been retired.
          </h1>
          <p className="mt-3 text-sm text-stone-500 leading-relaxed">
            Life Sentinel no longer offers document sharing via guardian links.
          </p>
        </div>
      </main>
    </div>
  );
}
