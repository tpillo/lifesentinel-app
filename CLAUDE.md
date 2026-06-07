# Life Sentinel — Project Context & Engineering Conventions

## Project

Life Sentinel is a Next.js 14 / TypeScript / Tailwind / Supabase readiness platform for service members, veterans, veteran families, and first responders. It helps users document their affairs and surfaces personalized survivor benefits analysis.

Production: **lifesentinelfamily.com** — deployed on Vercel Pro (auto-deploy from `main`).

## Stack

| Layer | Detail |
|---|---|
| Framework | Next.js 16 App Router, TypeScript, Tailwind CSS |
| Database | Supabase Postgres — RLS on all 14 user-data tables |
| Auth | Supabase Auth |
| AI | Anthropic API — `claude-sonnet-4-6`, non-streaming, `maxDuration: 180`, `max_tokens: 8192` |
| Email | Resend (transactional) |
| Storage | Supabase vault bucket (encrypted documents — built, not yet operationalized as core feature) |

## Personas

Two first-class personas, gated at page, component, and AI prompt levels:

| Persona | `occupation_type` value | Notes |
|---|---|---|
| Military / Veteran | `military_veteran` | Active duty, reserve, Guard, veteran |
| Veteran Family | any + `veteran_family_member === "yes"` | Non-military user whose family member served |
| Civilian | `civilian` | |

`law_enforcement` and `firefighter` are **legacy `occupation_type` values** — preserved in the DB and enum for possible v2 FR EAP, but not first-class personas. At read time they normalize to `civilian` via `resolvePersona()` in `lib/resolvePersona.ts`. Do not add new branching on these values.

**Derived predicates — always use these, never raw profile fields:**
```ts
const isMilitary = occupation_type === "military_veteran";
const isVeteranFamily = !isMilitary && veteran_family_member === "yes";
const showVeteranContent = isMilitary || isVeteranFamily;
```

Persona routing uses `resolvePersona()` in `lib/resolvePersona.ts` — all persona-dependent paths (benefits engine, cache hash, benefits page, BenefitsGuide, profile API) route through it. Inline ternaries at render sites use the resolved value, not raw `occupation_type`.

**Multi-identity refactor** (replace `occupation_type` single-select with independent booleans) is pinned future work. Do not design around it yet.

## Critical Conventions

### 1. AI prompt cache invalidation
All AI content cache hashes include `BENEFITS_PROMPT_VERSION` (defined in `lib/generateReviews.ts`). **Bump this string whenever `buildBenefitsPrompt()` changes in a way that produces different output.** The hash changes → existing cache rows are naturally superseded on next request.

Bump format: `"YYYY-MM-DD"`. Cosmetic changes (whitespace, comments) do not require a bump.

### 2. AI prompt dollar amount safety
- **State benefit exemptions, exclusions, assessed value reductions, income caps:** DO NOT generate specific dollar amounts in AI prompts. These figures change annually. Canonical state data lives in `lib/stateData.ts` — reference it from structured cards, not AI prose.
- **Federal benefits (CHAMPVA caps, DEA stipends, burial allowances):** describe qualitatively, direct users to va.gov for current rates.
- **DIC amounts:** canonical exception. `DIC_ACCURACY` constant in `lib/generateReviews.ts` pins the verified 2026 figures. Use them.

### 3. RLS
Every user-data table has Row Level Security. New tables require RLS policies before merge. This is a hard blocker.

### 4. Persona gating completeness
Veteran-specific content must be gated at three levels: page render, component render, and AI prompt. A missing gate at any level is a content leak bug. Known open class: page-level gating gaps for veteran pills and section headers.

### 5. Profile payload normalization
`handleSubmit()` in `app/profile-setup/page.tsx` sends an explicit per-persona payload — not `...form` spread. Veteran/LEO/FF/civilian fields are nulled when the occupation doesn't own them. `veteran_family_*` fields are nulled when `veteran_family_member !== "yes"`. Do not regress to spread-based submission.

## The Shipyard Chain

Seven-agent linear chain with three human checkpoints. Primary Claude Code session is the orchestrator.

```
Scout → Scribe → [CHECKPOINT 1] → Architect → [CHECKPOINT 2] → Snipe ⇄ Topside → Range → IG → [CHECKPOINT 3] → merge
```

Agent files: `.claude/agents/`
Artifact outputs: `.claude/artifacts/` (created per-run)
Chain reference: `.claude/README.md`

## Don'ts

- Don't bypass RLS on any user-data table
- Don't generate state benefit dollar amounts in AI prompts
- Don't modify `buildBenefitsPrompt()` or `buildStateEdPrompt()` without bumping `BENEFITS_PROMPT_VERSION`
- Don't add npm dependencies without flagging to the human — document the reason and alternatives considered
- Don't use `--no-verify` or `--no-gpg-sign` on git operations
- Don't spread `...form` in profile submission payloads
- Don't read `occupation_type` raw for persona branching — always route through `resolvePersona()` first
