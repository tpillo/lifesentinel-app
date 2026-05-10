import Anthropic from "@anthropic-ai/sdk";
import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { STATE_ED_MODEL, buildStateEdPrompt } from "@/lib/generateReviews";
import { computeProfileHash, getCachedReview, saveCachedReview } from "@/lib/reviewCache";

export const runtime = "nodejs";
export const maxDuration = 30;

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

  const prompt = buildStateEdPrompt(fields);
  const stream = await anthropic.messages.stream({
    model: STATE_ED_MODEL,
    max_tokens: 600,
    messages: [{ role: "user", content: prompt }],
  });

  const encoder = new TextEncoder();
  const buffer: string[] = [];
  const capturedUserId = userId;

  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          const chunk = event.delta.text
            .replace(/^---+\s*$/gm, "")
            .replace(/^\*\*\*+\s*$/gm, "")
            .replace(/^___+\s*$/gm, "");
          controller.enqueue(encoder.encode(chunk));
          buffer.push(chunk);
        }
      }
      controller.close();
      if (capturedUserId) {
        after(() =>
          saveCachedReview(capturedUserId, "state_education", profileHash, buffer.join(""), STATE_ED_MODEL)
        );
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
