"use client";

import { useEffect, useRef, useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";

type RenderNode =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "p"; text: string };

function parseInline(text: string): React.ReactNode[] {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-stone-800">
        {part}
      </strong>
    ) : (
      part
    )
  );
}

function parseMarkdown(raw: string): RenderNode[] {
  const lines = raw.split("\n");
  const nodes: RenderNode[] = [];
  let listBuf: string[] = [];

  function flushList() {
    if (listBuf.length) {
      nodes.push({ type: "ul", items: [...listBuf] });
      listBuf = [];
    }
  }

  for (const line of lines) {
    if (line.startsWith("## ")) {
      flushList();
      nodes.push({ type: "h2", text: line.slice(3) });
    } else if (line.startsWith("### ")) {
      flushList();
      nodes.push({ type: "h3", text: line.slice(4) });
    } else if (/^[-*] /.test(line)) {
      listBuf.push(line.slice(2));
    } else if (line.trim() === "") {
      flushList();
    } else {
      flushList();
      nodes.push({ type: "p", text: line });
    }
  }
  flushList();
  return nodes;
}

function BenefitsContent({ markdown }: { markdown: string }) {
  const nodes = parseMarkdown(markdown);

  return (
    <div className="space-y-1">
      {nodes.map((node, i) => {
        if (node.type === "h2") {
          return (
            <div key={i} className="pt-8 first:pt-0">
              <div className="flex items-center gap-3 pb-3 border-b border-amber-100 mb-4">
                <span className="text-amber-500 select-none text-lg">◈</span>
                <h2 className="font-serif text-xl font-semibold text-stone-900">
                  {node.text}
                </h2>
              </div>
            </div>
          );
        }
        if (node.type === "h3") {
          return (
            <h3 key={i} className="font-semibold text-stone-800 text-sm mt-5 mb-1.5">
              {node.text}
            </h3>
          );
        }
        if (node.type === "ul") {
          return (
            <ul key={i} className="space-y-1.5 my-2">
              {node.items.map((item, j) => (
                <li key={j} className="flex items-start gap-2.5 text-sm text-stone-600 leading-relaxed">
                  <span className="text-amber-400 mt-1 shrink-0 text-xs">●</span>
                  <span>{parseInline(item)}</span>
                </li>
              ))}
            </ul>
          );
        }
        if (node.type === "p") {
          return (
            <p key={i} className="text-sm text-stone-600 leading-relaxed">
              {parseInline(node.text)}
            </p>
          );
        }
        return null;
      })}
    </div>
  );
}

function StreamingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {[1, 2, 3].map((s) => (
        <div key={s}>
          <div className="h-5 w-56 rounded bg-stone-200 mb-4" />
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-stone-100" />
            <div className="h-3 w-5/6 rounded bg-stone-100" />
            <div className="h-3 w-4/6 rounded bg-stone-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BenefitsPage() {
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function generate() {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setMarkdown("");
    setDone(false);
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/benefits", {
        method: "POST",
        signal: ctrl.signal,
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Failed to generate benefits report");
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;
        setMarkdown((prev) => prev + decoder.decode(value, { stream: true }));
      }
      setDone(true);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError(err.message ?? "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    generate();
    return () => abortRef.current?.abort();
  }, []);

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <DashboardHeader />
      <main className="mx-auto max-w-3xl px-6 py-8 md:px-8 space-y-6">

        {/* Header card */}
        <div className="rounded-3xl border border-stone-200 bg-gradient-to-br from-stone-800 to-stone-900 px-8 py-10 shadow-lg">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-600/40 bg-amber-600/20 px-3 py-1 text-xs font-medium text-amber-300 mb-4">
            ❋ Personalized Benefits Report
          </div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-white md:text-4xl">
            My Benefits
          </h1>
          <p className="mt-3 text-stone-300 text-sm leading-relaxed max-w-xl">
            A personalized overview of the federal, state, and survivor benefits your family
            may be entitled to — based on your occupation, service history, and profile.
          </p>
          {done && (
            <button
              onClick={generate}
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-stone-600 bg-stone-700/50 px-4 py-2 text-sm font-medium text-stone-200 transition hover:bg-stone-600"
            >
              ↺ Regenerate Report
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5">
            <p className="text-sm font-semibold text-red-900 mb-1">Unable to generate report</p>
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={generate}
              className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition"
            >
              Try again
            </button>
          </div>
        )}

        {/* Content */}
        {(loading || markdown) && (
          <div className="rounded-3xl border border-stone-200 bg-white px-8 py-8 shadow-sm">
            {loading && !markdown && <StreamingSkeleton />}
            {markdown && <BenefitsContent markdown={markdown} />}
            {loading && markdown && (
              <div className="mt-4 flex items-center gap-2 text-xs text-stone-400">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                Generating…
              </div>
            )}
          </div>
        )}

        {/* Disclaimer */}
        {done && (
          <div className="rounded-2xl border border-stone-200 bg-stone-50 px-6 py-5">
            <p className="text-xs text-stone-500 leading-relaxed">
              <span className="font-semibold text-stone-600">Disclaimer: </span>
              This information is a starting point for research, not legal or financial advice.
              Benefit amounts, eligibility rules, and programs change over time. Always verify
              with the relevant agency — VA, SSA, your state veterans affairs office, or a
              VA-accredited attorney — before making decisions.
            </p>
          </div>
        )}

      </main>
    </div>
  );
}
