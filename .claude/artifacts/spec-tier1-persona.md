# Spec — Tier 1: Promote Military Family Member; remove Civilian
Date: 2026-07-05 · Status: Ready to build · Implements: decision-persona-model.md (Tier 1 only)

Scope: promote Military Family Member to a first-class persona in the selector, retire the Civilian persona from the UI, and remove now-dead code paths — WITHOUT breaking reads of legacy rows. Tier 2 (entitlement precision) and Tier 3 (per-child rows, alive-vs-post-death split) are OUT of scope for this build.

## Preconditions (verify BEFORE writing code)

1. **Legacy row count.** Run in Supabase SQL editor:
   ```sql
   SELECT
     COUNT(*) FILTER (WHERE occupation_type IN ('civilian','law_enforcement','firefighter')
                        AND (veteran_family_member IS NULL OR veteran_family_member <> 'yes')) AS orphan_civilian,
     COUNT(*) FILTER (WHERE occupation_type IN ('civilian','law_enforcement','firefighter')
                        AND veteran_family_member = 'yes') AS legacy_civilian_family,
     COUNT(*) FILTER (WHERE occupation_type = 'military_veteran') AS veteran,
     COUNT(*) FILTER (WHERE occupation_type IS NULL) AS incomplete
   FROM profiles;
   ```
   Guardian/vault recons implied ~1 test account. Confirm before proceeding. If `orphan_civilian > 0` real users exist, a real user-comms + backfill plan is needed before shipping — otherwise those users' AI prose disappears (buildBenefitsPrompt civilian branch is being removed).

2. **Confirm the second rendering path.** `app/profile-setup/page.tsx` has a second wizard-like block at :810+ that mirrors the primary selector at :488-780. Before editing, decide: is it a live mobile/alt-layout that must also change, or dead code from a refactor? If live, EVERY structural change below applies to both blocks. If dead, delete it in step 0 as its own commit for a clean slate.

3. **Baseline the persona regression suite.** `npx vitest run __tests__/persona-regression.test.ts` — 38/38 passes on `main` today. Any drop is a regression from Tier 1 work, not something to explain away.

## Ordered changes

### Step 1 — Selector: swap Civilian tile for Military Family Member

`app/profile-setup/page.tsx`:

- `OccupationType` (:9): add `"military_family"` to the union. Keep `"civilian"` and `"law_enforcement"` and `"firefighter"` in the union for legacy row READ compatibility (see Legacy-read guards below).
- `OCCUPATION_OPTIONS` (:55-68): replace the Civilian tile with:
  ```ts
  {
    value: "military_family",
    label: "Military Family Member",
    icon: "◈",
    description: "Spouse or dependent of a Veteran / Service Member",
  }
  ```
  Keep the `military_veteran` tile as-is.

- If the second rendering path (:810+) is live, apply the identical swap to its `OCCUPATION_OPTIONS` usage or shared constant.

### Step 2 — Remove the buried veteran-family sub-form; keep the fields, promote them

Today: on Civilian, a nested block at :675 asks "Are you a veteran's family member?" and — if yes — reveals relationship / sc_death / disability_rating.

New shape: those same fields become the primary "Your Details" step when `occupation_type === "military_family"`. Concretely:

- The `form.occupation_type && form.occupation_type !== "military_veteran"` gate at :675 becomes `form.occupation_type === "military_family"`.
- Remove the inner yes/no `veteran_family_member` select (:685) — presence on this branch implies "yes". Force `veteran_family_member = "yes"` in `handleSubmit` for the `military_family` case (this keeps legacy downstream code that keys off `veteran_family_member === "yes"` working with zero changes).
- Keep `veteran_family_relationship` / `veteran_family_sc_death` / `veteran_family_disability_rating` — they're the actual Tier 1 identity signal.
- The heading at :533 (`form.occupation_type === "military_veteran" ? "Service Details" : "Your Details"`) becomes:
  ```ts
  form.occupation_type === "military_veteran" ? "Service Details" : "Family Details"
  ```
  (or "Your Family" — user copy call).

### Step 3 — `handleSubmit` (:418-471): update branching

- Add an `isMilFamily = form.occupation_type === "military_family"` derivation next to `isMil` (:422).
- Delete the `isLEO` and `isFF` locals (:423-424) — dead branches, LE/FF are read-only legacy from here on.
- Delete the civilian `occupation` field write (:461) — civilian tile is gone; `occupation` on `profiles` will stay in the schema but no code writes it after this. Tier 1 does NOT drop the column (defer to a schema cleanup once legacy rows are backfilled).
- On the `military_family` path:
  - Force `veteran_family_member = "yes"` in the submitted row (make this literal, not from the form).
  - Persist relationship / sc_death / disability_rating from the form.
  - Null every veteran-service field (branches_served, retirement_branch, primary_service_branch, status, va_disability_rating, va_pt_designation, pt_award_date, va_rating_date, service_connected_death, retirement_type, rcsbp_election, sbp_base_amount, collecting_retired_pay).
- On the `military_veteran` path: unchanged — still nulls all veteran_family_* fields.

The **`/api/profile` route** (`app/api/profile/route.ts`) does NOT need changes — it already accepts these fields and its `veteran_family_*` handling at :57-59 gates on `veteran_family_member === "yes"`, which the new `military_family` submit now guarantees.

### Step 4 — Retire dead prompt / card paths

`lib/generateReviews.ts`:

- `buildBenefitsPrompt` (:45): the civilian branch at :107-152 becomes dead code once no user can be a plain civilian AT SIGNUP — but legacy rows can still land here. Keep the branch, but add a one-line comment at :107 noting it's legacy-only per `decision-persona-model.md`. Do NOT delete it in Tier 1 (see Legacy-read guards). Tier 1 removal is limited to selector + submit; the branch dies naturally after backfill.

`components/BenefitsGuide.tsx`:

- `getBenefits` (:70-92): the `isMilitary || isVeteranFamily` gate stays. Plain-civilian returns `[]` and that's fine as a legacy fallback. No change needed in Tier 1.

### Step 5 — Simplify (don't delete) `showVeteranContent` gates

Under the new model, `showVeteranContent = isMilitary || isVeteranFamily` becomes trivially true for any user who signed up via the new selector. But legacy rows still exist. Rule:

- **Do NOT rip the gates out.** They stay defensive during transition. If a legacy civilian row logs in mid-transition and hasn't been backfilled, the current gate behavior (hide veteran/survivor content) is the right conservative default — that user hasn't opted into either persona and their content is empty in the old civilian branch anyway.
- Once backfill completes and prod DB shows zero non-`military_veteran`-or-`veteran_family` rows, gates can be deleted in a follow-up cleanup PR. Not now.

### Step 6 — Update CLAUDE.md persona section

The Personas table at the top of `CLAUDE.md` shows civilian as a persona. Update:

- Replace the "Civilian" row with a "Military Family Member" row:
  `Military Family Member | occupation_type === "military_family" (post-Tier-1) OR occupation_type IN legacy-civilian-set + veteran_family_member === "yes" (legacy) | Spouse or dependent whose benefits derive from the veteran's service.`
- Update the "Derived predicates" block to add `isMilitaryFamily = resolvePersona(occupation_type) === "military_family" || (!isMilitary && veteran_family_member === "yes")` — the OR captures both new and legacy rows.
- Note the retired Civilian tile as of 2026-07-XX.

### Step 7 — `lib/resolvePersona.ts`: add the new value; keep legacy mappings

- Extend `ResolvedPersona` to include `"military_family"`.
- Extend the function:
  ```ts
  if (raw === "military_veteran") return "military_veteran";
  if (raw === "military_family")  return "military_family";  // NEW
  if (raw === "law_enforcement" || raw === "firefighter") return "civilian";  // legacy read only
  if (raw === "civilian") return "civilian";  // legacy read only
  return "";
  ```
- Update the header comment to say civilian/LE/FF returns are legacy-read-only and will be dropped after backfill.

### Step 8 — Verify persona regression suite

`__tests__/persona-regression.test.ts` — 38 assertions today. After Tier 1:

- All must still pass. If any assertion hard-codes the "Civilian" LABEL from the selector, update the assertion to the new label. If any tests the `civilian` occupation_type as an INPUT, keep those — they cover the legacy-read path.
- Add new assertions for the `military_family` occupation_type: it resolves through `resolvePersona` correctly, `veteran_family_member === "yes"` is forced on submit, and downstream benefits render the veteran-family branch.

## Legacy-read guards (MUST NOT break)

Everything below must continue to work correctly for a legacy row where `occupation_type IN ('civilian','law_enforcement','firefighter')` and `veteran_family_member === 'yes'`:
- The benefits page renders the veteran-family branch (already correct — driven by `isVeteranFamily = !isMilitary && veteran_family_member === "yes"`).
- Cache hash includes `veteran_family_*` fields (already correct — `benefitsHashFields`).
- Pre-warm on POST /api/profile still fires with veteran-family branch (already correct — line 85-98).
- `resolvePersona` maps LE/FF/civilian → civilian so the `isVeteranFamily` derivation still returns true for those legacy rows.

And for legacy rows with `occupation_type` = civilian/LE/FF and `veteran_family_member != 'yes'`:
- The plain-civilian branch of `buildBenefitsPrompt` (:107-152) must still work — it's the only thing rendering meaningful AI content for these accounts. Do not delete it in Tier 1. It dies after backfill.

## Non-goals for Tier 1

- No new fields on `profiles`. Alive-vs-deceased veteran, DOD, veteran-identity fields → Tier 2.
- No prompt logic changes beyond the header comment mentioned in Step 4.
- No AI prompt-version bump (`BENEFITS_PROMPT_VERSION`). Tier 1 doesn't change generated output for any live persona — it only changes the SIGNUP path. Legacy rows' cached content stays valid.
- No backfill migration in the code PR. Backfill is a separate SQL step run in Supabase after the code merges, once orphan counts are confirmed.
- No RLS changes.
- No `occupation` column drop. It's now unwritten but not orphaned in schema — cleanup after Tier 1 lands.

## Backfill plan (run AFTER code merges, before "legacy-only" branches can be removed)

Two migrations, in this order:

1. Move veteran-family legacy rows to the new persona value:
   ```sql
   UPDATE profiles
   SET occupation_type = 'military_family'
   WHERE occupation_type IN ('civilian','law_enforcement','firefighter')
     AND veteran_family_member = 'yes';
   ```

2. Orphan civilian rows — no automatic mapping. Options:
   - Leave `occupation_type` as-is; those users see the plain-civilian branch until they update their profile (safe default; matches current behavior).
   - Force to `NULL` to trigger the "profile incomplete" flow on next login (safer for a real audience audit).
   - User-comms + prompted re-selection.
   Pick after confirming the orphan count in Preconditions #1.

Migration files: `supabase/migrations/YYYYMMDDHHMMSS_persona_backfill_family.sql` (step 1) and a second file if step 2 requires a schema-touching change. Neither goes into the code PR; run manually per project convention.

## Verification (before merging Tier 1 code PR)

- [ ] `npx tsc --noEmit` clean.
- [ ] `npx vitest run __tests__/persona-regression.test.ts` — 38/38 (or updated N/N).
- [ ] Manual: sign up as new Military Family Member, submit, verify `profiles` row has `occupation_type = 'military_family'` and `veteran_family_member = 'yes'`.
- [ ] Manual: sign up as Veteran, submit, verify `occupation_type = 'military_veteran'`, veteran fields set, veteran_family_* nulled.
- [ ] Manual: existing veteran-family legacy row (`occupation_type='civilian'`, `veteran_family_member='yes'`) — benefits page + AI still render family-perspective content correctly.
- [ ] Manual: existing plain-civilian legacy row still renders the civilian AI branch (until backfill).

## Sequencing / PR strategy

Single PR, `feat/tier1-persona-family-member`. High blast radius (persona selector + handleSubmit + resolvePersona + CLAUDE.md). Full Shipyard chain: Scribe story → Architect spec → Snipe/Topside implementation → Range check → IG audit → merge. Human checkpoints at each transition per CLAUDE.md.

Do NOT combine with Tier 2 or Tier 3 work — those need their own scope and DB migrations.

## Post-merge, out of Tier 1 scope

- Backfill migrations (see above).
- After backfill: cleanup PR to delete the plain-civilian branch of `buildBenefitsPrompt`, drop LE/FF from `resolvePersona`, drop the `occupation` column, and remove `showVeteranContent` gates where they're now trivially true.
- Tier 2 build (entitlement precision).
