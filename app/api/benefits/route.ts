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
export const maxDuration = 60;

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

  console.log("[benefits] cache miss — starting LLM stream");

  try {
    const stream = anthropic.messages.stream({
      model: BENEFITS_MODEL,
      max_tokens: 8192,
      messages: [{ role: "user", content: buildBenefitsPrompt(profile) }],
    });

    const userId = user.id;
    const buffer: string[] = [];

    const readable = new ReadableStream({
      async start(controller) {
        try {
          console.log("[benefits] stream start");
          let eventCount = 0;

          for await (const event of stream) {
            eventCount++;
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const text = event.delta.text;
              controller.enqueue(new TextEncoder().encode(text));
              buffer.push(text);
            }
          }

          console.log("[benefits] for-await loop completed", {
            eventCount,
            totalChars: buffer.join("").length,
          });

          console.log("[benefits] calling saveCachedReview");
          await saveCachedReview(userId, "benefits", profileHash, buffer.join(""), BENEFITS_MODEL);
          console.log("[benefits] saveCachedReview returned");

          controller.close();
          console.log("[benefits] controller closed");
        } catch (err) {
          console.error("[benefits] start() error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to generate benefits report";
    console.error("[benefits] API error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
