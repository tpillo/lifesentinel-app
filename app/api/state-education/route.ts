import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { STATE_ED_MODEL, buildStateEdPrompt } from "@/lib/generateReviews";
import { computeProfileHash, getCachedReview, saveCachedReview } from "@/lib/reviewCache";

export const runtime = "nodejs";
export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  let body: { state?: string; isPT?: boolean; rating?: string; scDeath?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { state, isPT = false, rating = "", scDeath = false } = body;
  if (!state) return new Response("Missing state", { status: 400 });

  const fields = { state, isPT, rating, scDeath };

  // Attempt to resolve the authenticated user for caching (gracefully skipped if unauthenticated)
  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    // unauthenticated context — proceed without caching
  }

  const profileHash = computeProfileHash(fields as unknown as Record<string, unknown>);

  // Cache hit — return instantly
  if (userId) {
    const cached = await getCachedReview(userId, "state_education");
    if (cached && cached.profile_hash === profileHash && cached.model === STATE_ED_MODEL) {
      return new Response(cached.content, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  }

  try {
    const response = await anthropic.messages.create({
      model: STATE_ED_MODEL,
      max_tokens: 600,
      messages: [{ role: "user", content: buildStateEdPrompt(fields) }],
    });

    const content =
      response.content[0]?.type === "text" ? response.content[0].text : "";

    if (userId) {
      await saveCachedReview(userId, "state_education", profileHash, content, STATE_ED_MODEL);
    }

    return new Response(content, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to generate state education report";
    console.error("[state-education] API error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
