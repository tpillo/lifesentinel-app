# Life Sentinel — Current Fix Backlog (Shipyard-ready)

**Reconciled 8 June 2026.** This supersedes the 31 May persona-test handoff doc on three points (noted below). Hand *this* to the LS Engineering Detachment, not the May 31 doc, which has drifted.

---

## Count reconciliation

The 31 May test surfaced **22 findings** (the exec-summary prose said "20" but the body lists 22 — the prose undercounted). Current state:

- **2 critical — RESOLVED in-session** (U, V — Fixes 4 and 5)
- **1 minor — SHIPPED** via the Finding-2 dry-run (commit a80623c)
- **19 remaining — QUEUED** (this backlog)

Plus 5 in-session fixes already live (Fixes 1–5). So the real work ahead is **19 findings**, sequenced below.

---

## What's stale in the 31 May doc (don't follow these)

1. **Decision 2 (multi-identity model)** in the old doc recommends `is_veteran` / `is_law_enforcement` / `is_first_responder` booleans. **SUPERSEDED by Option B** (memory #14, 7 June): primary is a single-select **Veteran/Military vs. Civilian only** — no first-responder, no law-enforcement identity. FRs route through Civilian. Use Option B, not the old Decision 2.
2. **Finding 2** (duplicate "Occupation" label) — already shipped. Don't re-queue.
3. **Phase 1 standup from `ls-factory.zip`** — already done. Shipyard stood up 3 June (agents generated fresh, not from the zip). Skip.

---

## Phase 0 — Prerequisites (do before any gating fix)

These aren't findings; they're the foundation that makes the rest safe.

- **0.1 — Test infrastructure (Vitest + RTL).** LS currently has none. Every gating fix below is a blind change without it. Initial scoped target: the profile-setup component's two render paths. This is the keystone — build it first. *(Memory: test-infra-first decision.)*
- **0.2 — Next.js security upgrade.** LS is on 16.1.6; verify current advisories and upgrade to the current patched release. Do-regardless (PII-handling site). Best done *before* 0.1 so tests run against the current framework version. First step: verify current advisories/version.

---

## Phase 1 — Simplified identity model (foundational, Option B)

Changes the predicate model everything downstream gates on.

- Profile selector goes **4 cards → 2**: **Veteran/Military** and **Civilian**. Remove the Law Enforcement and Fire/First Responder cards.
- **Keep the `occupation_type` enum values in the schema** (`military_veteran, law_enforcement, firefighter, civilian`) — do NOT run an enum migration. Treat any legacy `law_enforcement` / `firefighter` row as Civilian for routing. Fully reversible if FR ever returns in v2.
- **No `is_first_responder` flag.** Option B dropped it entirely.
- **The selector appears in at least two places** — initial **profile setup** (`app/profile-setup/page.tsx`) and the **Update Profile** editor (`app/profile/page.tsx` or equivalent). **Extract to one shared component** so the 4→2 change is made once and can't go half-done.
- All downstream content gates on the resulting predicate: `isMilitaryVeteran` vs. `isCivilian`, with `veteran_family_member` still its own boolean.

---

## Phase 2 — Page-level persona gating (Findings A, F, G/K, L)

The biggest cluster. Civilians currently see veteran/survivor content unconditionally because gating exists at the element level but not the page/section level.

- **A** — Family Benefits Guide renders post-death survivor framing for non-loss civilians
- **F** — Overview renders "Key Deadlines After a Veteran's Passing" for civilians
- **G/K** — Documents and Overview show Military/VA categories framed as user-owned
- **L** — Survivor page renders veteran-tagged items to civilians (filter logic missing)

**Architect Decision 1 (civilian experience model)** gets made here. Three options from the old doc still apply: hide veteran content / reframe to general estate planning / progressive disclosure. **Recommended: progressive disclosure** — replicate the Survivor page's existing "Veteran family?" callout pattern across the other pages. *Simpler now under Option B — only two personas to gate against, not four.*

---

## Phase 3 — Voice/framing consolidation (Findings B, E, N, O)

Copy and prompts slip between addressing the user *as* the veteran vs. *referencing* the veteran in their life. Lower risk; can run parallel to Phase 2.

- **B** — AI prompt says "your loved one was a veteran" for civilians
- **E** — "Pre-Deployment" visible in top nav for non-active-duty personas *(simpler under Option B — gate on military/veteran vs. civilian)*
- **N** — Military/VA document categories framed as user-owned for vet-family spouse
- **O** — Overview tooltip wrong voice for vet-family ("your passing" should be "your spouse's passing")

---

## Phase 4 — State data canonicalization (Findings T + residual of U)

The proper long-term fix that replaces the 31 May interim safety patch (Fix 4).

- Inject `lib/stateData.ts` values into the AI prompt context so prose grounds on curated data instead of training data. Resolves **T** (cards vs. prose inconsistency) and likely **Q** (acronym drift) as a side effect.
- **Fold in the state-coverage gaps** (from prior state audit):
  - 41 states have a null render for property-tax (no fallback) — create a fallback
  - DC is in the dropdown but has no data
  - No retry on AI education-card timeout

---

## Phase 5 — Content accuracy & cleanup (Findings R, S, P, Q, W)

- **R** — SGLI/VGLI card implies coverage is automatic; VGLI requires enrollment
- **S** — Detailed Analysis has significant cross-section duplication
- **P** — VMSDEP acronym drops the "M" in card title (fix in `lib/stateData.ts` VA entry)
- **Q** — Card says VMSDEP, AI prose says VSDEP (may resolve via Phase 4)
- **W** — AI prose doesn't explicitly cross-reference pill cards ("See the [Card] above") — tune prompt; acceptable interim

---

## Phase 6 — Cosmetic / UX polish (Findings 3, C, D, H, J + CTA icon)

- **3** — "Service Details" header shown to civilians on profile setup
- **C** — Markdown "#" rendering as literal text in AI analysis output
- **D** — Broken UI element: empty red bar with truncated "Apply for" near Social Security
- **H** — "Family" framing assumes user has family (off for single civilian)
- **J** — Dashboard not reachable from top-nav (only via logo click)
- **CTA icon** (new, 7 June) — the landing-page CTA lost its icon when the broken ❧ circle was removed; add a real lucide icon (compass/shield, on-brand with the LS logo)

---

## Phase 7 — Mandatory regression re-run

After fixes ship: re-run all three personas (Civilian / Vet-Family / Veteran), walk the same six pages each. Confirm no new regressions, all queued findings resolved, and **no over-correction** — especially that AI prose accuracy constraints didn't loosen too far. Logged as must-do.

---

## Standing Architect decisions (carry into Phase 2)

- **Decision 1 — Civilian experience model.** Made in Phase 2. Recommend progressive disclosure (replicate Survivor page's "Veteran family?" pattern).
- **Decision 3 — Scenario-2 transition state.** Existing civilian vet-family user flips `service_connected_death` to Yes after a living veteran spouse dies. Requirements: (a) cache invalidation must include the sc_death transition — verify the May 19 hash work still holds after Fix 5; (b) post-flip experience must auto-prewarm (user is in acute grief — no manual "Regenerate" click); (c) reversal must revert cleanly (if sc_death is flipped by mistake or a VA determination reverses, no stale "you qualify for DIC" content left behind).

---

## Recommended order summary

```
Phase 0  Test infra + Next.js security        (prereq, enables safe changes)
Phase 1  Identity model 4→2 cards (Option B)   (foundational predicate change)
Phase 2  Page-level gating: A, F, G/K, L       (biggest cluster; Decision 1 here)
Phase 3  Voice/framing: B, E, N, O             (parallel-able with Phase 2)
Phase 4  State canonicalization: T + gaps      (replaces Fix 4 interim)
Phase 5  Content cleanup: R, S, P, Q, W
Phase 6  Cosmetic: 3, C, D, H, J + CTA icon
Phase 7  Mandatory 3-persona regression        (must-do gate)
```

19 findings, 7 phases. Each phase routes through the LS Engineering Det chain with its three human checkpoints (approve Scribe story → approve Architect spec → review IG audit before merge).
