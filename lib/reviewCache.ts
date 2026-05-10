import { createHash } from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type ReviewType = "benefits" | "state_education";

export function computeProfileHash(fields: Record<string, unknown>): string {
  const sorted = Object.keys(fields)
    .sort()
    .reduce((acc, k) => ({ ...acc, [k]: fields[k] }), {} as Record<string, unknown>);
  return createHash("sha256").update(JSON.stringify(sorted)).digest("hex");
}

export async function getCachedReview(
  userId: string,
  reviewType: ReviewType
): Promise<{ content: string; profile_hash: string; model: string } | null> {
  const { data, error } = await supabaseAdmin
    .from("cached_reviews")
    .select("content, profile_hash, model")
    .eq("user_id", userId)
    .eq("review_type", reviewType)
    .maybeSingle();
  if (error) {
    console.error("[reviewCache] getCachedReview FAILED:", { userId, reviewType, message: error.message });
    return null;
  }
  if (!data) {
    console.log("[reviewCache] cache miss:", { userId, reviewType });
    return null;
  }
  console.log("[reviewCache] cache hit:", { userId, reviewType });
  return data;
}

export async function saveCachedReview(
  userId: string,
  reviewType: ReviewType,
  profileHash: string,
  content: string,
  model: string
): Promise<void> {
  const { error } = await supabaseAdmin.from("cached_reviews").upsert(
    {
      user_id: userId,
      review_type: reviewType,
      profile_hash: profileHash,
      content,
      model,
      generated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,review_type" }
  );
  if (error) {
    console.error("[reviewCache] saveCachedReview FAILED:", { userId, reviewType, code: error.code, message: error.message, details: error.details });
  } else {
    console.log("[reviewCache] saveCachedReview ok:", { userId, reviewType, contentChars: content.length });
  }
}
