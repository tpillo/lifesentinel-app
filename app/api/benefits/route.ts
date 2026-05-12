import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  BENEFITS_MODEL,
  buildBenefitsPrompt,
  benefitsHashFields,
} from "@/lib/generateReviews";
import {
  computeProfileHash,
  getCachedReview,
  saveCachedReview,
} from "@/lib/reviewCache";

export const runtime = "nodejs";
export const maxDuration = 180;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST() {
  console.log("[benefits] POST received");

  const supabase = await createClient();
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    console.log("[benefits] unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  console.log("[benefits] authenticated", { userId: user.id });

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  console.log("[benefits] profile fetched", { hasProfile: !!profile });

  const profileHash = computeProfileHash(benefitsHashFields(profile ?? {}));
  console.log("[benefits] profile hash computed", { profileHash });

  const cached = await getCachedReview(user.id, "benefits");
  const hashMatch = cached?.profile_hash === profileHash;
  const modelMatch = cached?.model === BENEFITS_MODEL;
  console.log("[benefits] cache check", { hit: !!cached, hashMatch, modelMatch });

  if (cached && hashMatch && modelMatch) {
    console.log("[benefits] returning cached response", { contentChars: cached.content.length });
    return new Response(cached.content, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  console.log("[benefits] cache miss — calling Anthropic (non-streaming)");

  try {
    const startTime = Date.now();
    const response = await anthropic.messages.create({
      model: BENEFITS_MODEL,
      max_tokens: 8192,
      messages: [{ role: "user", content: buildBenefitsPrompt(profile) }],
    });
    const elapsed = Date.now() - startTime;
    console.log("[benefits] Anthropic response received", { elapsedMs: elapsed, stopReason: response.stop_reason });

    const content = response.content[0]?.type === "text" ? response.content[0].text : "";
    console.log("[benefits] extracted content", { contentChars: content.length });

    if (!content) {
      console.error("[benefits] empty content from Anthropic");
      return NextResponse.json({ error: "Empty response from AI" }, { status: 500 });
    }

    console.log("[benefits] saving to cache");
    await saveCachedReview(user.id, "benefits", profileHash, content, BENEFITS_MODEL);
    console.log("[benefits] cache saved, returning response");

    return new Response(content, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to generate benefits report";
    console.error("[benefits] API error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
