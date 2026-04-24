import Anthropic from "@anthropic-ai/sdk";

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

  const { state, isPT, rating, scDeath } = body;
  if (!state) return new Response("Missing state", { status: 400 });

  const prompt = `You are a veteran benefits expert helping a surviving military family understand state education benefits available to them in ${state}.

Veteran profile:
- State: ${state}
- VA Disability Rating: ${rating || "Not specified"}
- Permanent & Total (P&T) Designation: ${isPT ? "Yes" : "No"}
- Service-Connected Death: ${scDeath ? "Yes" : "No"}

Provide a concise, accurate summary of ${state}'s education benefit programs for surviving spouses and dependent children of veterans or service members. For each program that exists, cover:
- Program name and administering agency
- What it covers (tuition, fees, stipends, credit hour limits)
- Who qualifies and any age limits
- Residency requirements
- How to apply (website, phone number)
- Any interaction or conflict with federal programs like DEA (Chapter 35) or the Fry Scholarship that this family should know about

If ${state} does not have a dedicated state education benefit program, say so clearly and advise them to contact the ${state} Department of Veterans Affairs or equivalent office.

CRITICAL RULES:
- Only describe programs that genuinely exist in ${state}. Do not invent or fabricate programs.
- Do NOT use markdown tables.
- Do NOT use horizontal rules (---, ***, ___).
- Use bullet points and short paragraphs.
- Keep the response practical and under 300 words.
- Do not use headers (##, ###) — just use bold text and bullets.`;

  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    messages: [{ role: "user", content: prompt }],
  });

  const encoder = new TextEncoder();
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
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
