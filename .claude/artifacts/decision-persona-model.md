# Decision: Persona model — drop Civilian, two military-connected personas
Date: 2026-07-05 · Status: Scoped, not yet built

## Decision
LS has no civilian audience. The two real personas are both military-connected:
1. **Veteran / Service Member** — account holder is the veteran; LS outlines his benefits and his family's.
2. **Military Family Member** — spouse/dependent whose benefits derive from the veteran's service (DIC, CHAMPVA, DEA, SBP). May be planning alongside a living veteran, or a surviving spouse/dependent after his passing.

There is NO plain-civilian persona. "Civilian" was a vestige of the old 4-option selector (collapsed to 2 on June 7). Both personas see veteran-derived benefits, framed for their perspective.

## Why
- No civilian audience exists; the moat is the veteran/veteran-family entitlement engine.
- The "civilian wife whose vet husband passes" is not a civilian — she's a Military Family Member whose benefits derive from his service. Survivor content is not a leak to hide; for her it's the core use case.
- Dropping civilian dissolves most of the remaining Phase 2 gating: if every user is veteran or veteran-family, showVeteranContent is trivially true — nothing to hide, so gates simplify rather than needing per-page civilian variants.

## What already exists (recon 2026-07-05 — ~80% built)
- Veteran-family branch is FULLY WIRED, not a stub: getBenefits (BenefitsGuide.tsx) and buildBenefitsPrompt (generateReviews.ts) both compute survivor benefits (DIC, CHAMPVA, DEA, Fry, Survivors Pension, VA Burial) for the family case, with family-perspective ("you as a surviving spouse") prose.
- DB fields exist: veteran_family_member, veteran_family_relationship, veteran_family_sc_death, veteran_family_disability_rating (all on profiles, with CHECK constraints).
- resolvePersona triad wired through cache hashing, benefits page, BenefitsGuide subsections, and the Overview banner/widget (Phase 2 PR 1, merged today).

## TIER 1 — Promote family-member to first-class persona; remove civilian (the near-term build)
Mostly deletion + re-labeling. The model asked for.
- Replace the "Civilian" selector tile (app/profile-setup/page.tsx OCCUPATION_OPTIONS :55-68) with a "Military Family Member" tile. DB already supports it.
- Today a family member must pick "Civilian" then answer a buried "are you a veteran's family member?" sub-question (:675). Promote that to a top-level persona choice; remove the buried sub-form flow.
- Remove dead code (with legacy-read fallback — do NOT break reads of old rows until backfilled):
  - Civilian tile + civilian handleSubmit occupation path (:461)
  - LE/FF dead branches in handleSubmit (isLEO/isFF :423-424)
  - buildBenefitsPrompt civilian branch (generateReviews.ts:107-152) — becomes dead code
  - Plain-civilian empty-state in getBenefits
- Keep resolvePersona's civilian/"" mappings for LEGACY ROW READS until backfill is confirmed.
- Simplify (don't delete) the showVeteranContent gates — they become trivially true; keep them defensive during transition since legacy rows may still read civilian pre-backfill.
- Note the second rendering path in profile-setup (:810+ appears to duplicate the wizard — likely mobile/alt-layout; confirm and update BOTH or de-dupe).
- Legacy backfill footprint: rows with occupation_type in (civilian, law_enforcement, firefighter) and veteran_family_member != 'yes'. Guardian/vault recons showed ~1 test account = near-zero real users. Confirm count before designing backfill.

## TIER 2 — Benefits-engine precision (the real moat; the bigger project)
The engine currently GUESSES inputs it should KNOW. Recon-identified missing inputs:
- **Alive-vs-deceased veteran**: currently inferred from sc_death="yes" (bad proxy). DIC eligibility hinges on this and is guessed. Add explicit capture.
- **Date of death**: not collected → all "file within 1 year" deadline logic is generic, can't personalize.
- **Veteran-identity fields on family accounts** (name, DOB, branch, SSN, VA file number): none captured → can't prefill VA forms, can't distinguish claimant type.
- **Primary DIC claimant vs eligible child**: relationship field distinguishes but doesn't gate.
This is the entitlement-precision work — the difference between "generic survivor info" and "what YOU specifically are owed and how to claim it." Scope as its own project after Tier 1.

## TIER 3 — Deferred greenfield (not now)
- Multiple beneficiaries / per-child records (num_dependents is only a count today; no per-child rows).
- Structural distinction between "planning while veteran alive" vs "surviving family post-death" (currently both route through one ambiguous prompt, generateReviews.ts:65).

## Sequencing
1. Tier 1 first (own PR/branch, full checkpoint chain — touches persona selector + handleSubmit, high blast radius, fresh-head work).
2. Tier 2 as the benefits-engine precision project.
3. Tier 3 deferred.

## Phase 2 status under this model
PR 1 (Overview gating) merged and stands. PRs 2-4 as originally scoped (hide-from-civilian) are OBSOLETE — most dissolve because there's no civilian to hide from. Re-derive any still-needed page work from the two-persona model, not the old civilian-gating premise. Known-open leak deferred: benefits page AI block still generates for any profile (Finding A) — resolves naturally once civilian is gone.
