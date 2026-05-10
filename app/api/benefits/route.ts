import Anthropic from "@anthropic-ai/sdk";
import { NextResponse, after } from "next/server";
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
  const supabase = await createClient();

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const profileHash = computeProfileHash(benefitsHashFields(profile ?? {}));

  // Cache hit — return instantly, no LLM call
  const cached = await getCachedReview(user.id, "benefits");
  if (cached && cached.profile_hash === profileHash && cached.model === BENEFITS_MODEL) {
    return new Response(cached.content, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const prompt = buildBenefitsPrompt(profile);

  try {
    const stream = anthropic.messages.stream({
      model: BENEFITS_MODEL,
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const userId = user.id;
    const buffer: string[] = [];

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              const text = chunk.delta.text;
              controller.enqueue(new TextEncoder().encode(text));
              buffer.push(text);
            }
          }
          controller.close();
          after(() =>
            saveCachedReview(userId, "benefits", profileHash, buffer.join(""), BENEFITS_MODEL)
          );
        } catch (err) {
          console.error("[benefits] stream error:", err);
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
