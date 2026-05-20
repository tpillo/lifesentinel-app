import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { STATE_ED_MODEL, buildStateEdPrompt } from "@/lib/generateReviews";
import { computeProfileHash, getCachedReview, saveCachedReview } from "@/lib/reviewCache";

export const runtime = "nodejs";
export const maxDuration = 180;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  console.log("[state-education] POST received");

  let body: { state?: string; isPT?: boolean; rating?: string; scDeath?: boolean; isVeteranFamily?: boolean; relationship?: string | null } = {};
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { state, isPT = false, rating = "", scDeath = false, isVeteranFamily = false, relationship = null } = body;
  if (!state) return new Response("Missing state", { status: 400 });

  const fields = { state, isPT, rating, scDeath, isVeteranFamily, relationship };
  console.log("[state-education] fields", fields);

  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    // unauthenticated context — proceed without caching
  }
  console.log("[state-education] auth", { userId: userId ?? "unauthenticated" });

  const profileHash = computeProfileHash(fields as unknown as Record<string, unknown>);
  console.log("[state-education] profile hash computed", { profileHash });

  if (userId) {
    const cached = await getCachedReview(userId, "state_education");
    const hashMatch = cached?.profile_hash === profileHash;
    const modelMatch = cached?.model === STATE_ED_MODEL;
    console.log("[state-education] cache check", { hit: !!cached, hashMatch, modelMatch });

    if (cached && hashMatch && modelMatch) {
      console.log("[state-education] returning cached response", { contentChars: cached.content.length });
      return new Response(cached.content, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  }

  console.log("[state-education] cache miss — starting LLM stream");

  try {
    const stream = anthropic.messages.stream({
      model: STATE_ED_MODEL,
      max_tokens: 600,
      messages: [{ role: "user", content: buildStateEdPrompt(fields) }],
    });

    const capturedUserId = userId;
    const encoder = new TextEncoder();
    const buffer: string[] = [];

    const readable = new ReadableStream({
      async start(controller) {
        try {
          console.log("[state-education] stream start");
          let eventCount = 0;

          for await (const event of stream) {
            eventCount++;
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const text = event.delta.text
                .replace(/^---+\s*$/gm, "")
                .replace(/^\*\*\*+\s*$/gm, "")
                .replace(/^___+\s*$/gm, "");
              controller.enqueue(encoder.encode(text));
              buffer.push(text);
            }
          }

          console.log("[state-education] for-await loop completed", {
            eventCount,
            totalChars: buffer.join("").length,
          });

          if (capturedUserId) {
            console.log("[state-education] calling saveCachedReview");
            await saveCachedReview(capturedUserId, "state_education", profileHash, buffer.join(""), STATE_ED_MODEL);
            console.log("[state-education] saveCachedReview returned");
          }

          controller.close();
          console.log("[state-education] controller closed");
        } catch (err) {
          console.error("[state-education] start() error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to generate state education report";
    console.error("[state-education] API error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
