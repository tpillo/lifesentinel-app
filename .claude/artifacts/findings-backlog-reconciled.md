# Life Sentinel — Current Fix Backlog (Shipyard-ready)

**Reconciled 9 June 2026.** Merges the 8 June reconciled doc with in-session work completed 7–8 June. Supersedes both prior backlog files. Hand this to the LS Engineering Detachment.

---

## Count reconciliation

The 31 May test surfaced **22 findings** (the exec-summary prose said "20" but the body lists 22 — the prose undercounted). Current state after June 7–8 session:

- **2 critical — RESOLVED in-session** (U, V — Fixes 4 and 5)
- **1 minor — SHIPPED** via the Finding-2 dry-run (commit a80623c)
- **Phase 0.1 and Phase 1 — SHIPPED** (7 June, verified in production — see below)
- **Finding 3 — SHIPPED** (7 June, verified in production)
- **~15 remaining — QUEUED** (this backlog)

Plus 5 in-session fixes already live (Fixes 1–5), plus the June 7–8 session work. Remaining queued work is Phases 2–7 plus the Guardian storage finding.

---

## What's stale in prior docs (don't follow these)

1. **Decision 2 (multi-identity model)** in the 31 May doc recommends `is_veteran` / `is_law_enforcement` / `is_first_responder` booleans. **SUPERSEDED by Option B** (7 June): primary is a single-select **Veteran/Military vs. Civilian only** — no first-responder, no law-enforcement identity. FRs route through Civilian via `resolvePersona()`. Use Option B, not the old Decision 2.
2. **Finding 2** (duplicate "Occupation" label) — already shipped. Don't re-queue.
3. **Phase 1 standup from `ls-factory.zip`** — already done. Shipyard stood up 3 June (agents generated fresh, not from the zip). Skip.
4. **Phase 0.1 (test infra)** — SHIPPED 7 June. Do not re-implement.
5. **Phase 1 (identity model 4→2)** — SHIPPED 7 June. Do not re-implement.
6. **Finding 3 ("Service Details" heading)** — SHIPPED 7 June. Do not re-implement.

---

## Shipped June 7–8 (verified in production — DO NOT RE-IMPLEMENT)

- ✓ **Phase 0.1** — Test infra: Vitest + RTL configured (jsdom, `@/*` alias); 39-assertion 3-persona regression suite live (`__tests__/persona-regression.test.ts`)
- ✓ **Phase 1** — Identity model 4→2 (Option B): profile selector reduced to Veteran/Military + Civilian; `lib/resolvePersona.ts` added; legacy `law_enforcement`/`firefighter` normalize to civilian at read time; cache hash consumes resolved persona + `BENEFITS_PROMPT_VERSION`; CLAUDE.md updated
- ✓ **Finding 3** — "Service Details" → "Your Details" heading for civilian on Update Profile page
- ✓ Reserve/Guard landing card ("Active, Reserve & Guard")
- ✓ Profile page nav header (was missing `DashboardHeader`)
- ✓ Guardian `.emptyFolderPlaceholder` filter (was generating signed URLs for placeholder objects, causing all-categories-same-URL bug)

---

## Phase 0 (remaining) — Prerequisites

- **0.2 — Next.js security upgrade.** LS is on 16.1.6; verify current advisories and upgrade to the current patched release. Do-regardless (PII-handling site). *(Security, independent, do soon, non-blocking. No longer a prereq — the test infra it was gating is done. Slot after Guardian fix.)*

*(0.1 is DONE — test infra shipped 7 June.)*

---

## Guardian raw-storage exposure — HIGH PRIORITY (surfaced 7 June, slot before Phase 2)

**New finding, not in the 8 June reconciled doc.** Guardian view (`app/api/guardian/vault/route.ts`) walks RAW STORAGE via `walkFolder()`, not `readiness_document_files`, so it serves every file ever uploaded including deleted/replaced files. No delete-from-storage path exists anywhere in the app.

- **Side effect fix:** resolves count mismatches (Guardian overview counts `is_present` DB flags; vault section counts raw storage objects — they'll align once both read from DB).
- **Also on this surface:** missing compass logo on Guardian header.
- **Not screening-blocking:** reaching it requires approved account → profile → upload → share-link.

### Recon finding — 15 June 2026

**We are in the bad case. Option B alone does NOT fix the exposure.**

Full trace confirmed: `readiness_document_files` is INSERT/SELECT only. No `DELETE` export exists on any route touching this table. `storage.remove()` is never called anywhere in the codebase. The only `DELETE` handler in the app is `document-locations/route.ts` — a completely separate table (physical-location notes, unrelated to uploaded files). The "Remove" button in the documents UI calls that handler, not a file-removal path.

Consequence: when a user replaces a file by uploading a new version, both the old and new rows remain in `readiness_document_files`, and both storage objects persist. The DB table is exactly as stale as raw storage. Pointing Guardian at `readiness_document_files` instead of `walkFolder()` would expose the same full upload history — it fixes nothing.

### Revised fix — two parts required

**Part 1 — Add a removal path** that runs on user remove/replace. Must clear both the storage object and the DB row (or mark it). No such path exists today.

**Part 2 — Point Guardian at current-only files.** Once Part 1 is in place, Guardian reads from `readiness_document_files` filtered to current records only (replacing `walkFolder()`).

### Two approaches for Part 1

| | Hard delete | Soft delete |
|---|---|---|
| **Mechanism** | `storage.remove()` + `DELETE` from `readiness_document_files` | `is_current = false` / `deleted_at` flag; storage object kept |
| **Recovery** | Irreversible — file is gone | Recoverable — file exists in storage, flag can be reversed |
| **Storage cost** | Clean | Accumulates over time |
| **Read-path impact** | None — row is gone | All read paths (`/api/vault/files`, Guardian, signed-url) must filter `WHERE is_current = true` or `deleted_at IS NULL` |
| **Risk profile** | High for a survivor-document platform | Low — non-destructive by default |

### Recommendation

**Soft delete** — non-destructive is the right default for a platform holding survivor documents. Users may upload a replacement and later want the prior version; hard delete forecloses that permanently. Soft delete keeps the object in storage (cost is negligible at this scale), marks the DB row inactive, and all read paths filter to current. A future purge job can hard-delete old versions if storage cost ever becomes a concern.

**Decision required next session before any implementation begins:** confirm soft delete, agree on the column name (`is_current` boolean vs. `deleted_at` timestamptz), and confirm that ALL read paths that touch `readiness_document_files` will be updated in the same PR.

---

## Phase 2 — Page-level persona gating (Findings A, F, G/K, L)

The biggest cluster. Civilians currently see veteran/survivor content unconditionally because gating exists at the element level but not the page/section level.

- **A** — Family Benefits Guide renders post-death survivor framing for non-loss civilians
- **F** — Overview renders "Key Deadlines After a Veteran's Passing" for civilians
- **G/K** — Documents and Overview show Military/VA categories framed as user-owned
- **L** — Survivor page renders veteran-tagged items to civilians (filter logic missing)

**Architect Decision 1 (civilian experience model)** gets made here. Three options: hide veteran content / reframe to general estate planning / progressive disclosure. **Recommended: progressive disclosure** — replicate the Survivor page's existing "Veteran family?" callout pattern across the other pages. *Simpler under Option B — only two personas to gate against, not four.*

---

## Phase 3 — Voice/framing consolidation (Findings B, E, N, O)

Copy and prompts slip between addressing the user *as* the veteran vs. *referencing* the veteran in their life. Lower risk; can run parallel to Phase 2.

- **B** — AI prompt says "your loved one was a veteran" for civilians
- **E** — "Pre-Deployment" visible in top nav for non-active-duty personas *(gate on military/veteran vs. civilian under Option B)*
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

## Phase 5 — Benefits-engine prompt pass + content accuracy (Findings R, S, P, Q, W)

**This is the same workstream as "Benefits-engine prompt pass" in the prior backlog** — do as ONE prompt revision + `BENEFITS_PROMPT_VERSION` bump + 3-persona re-verify. This is a product decision, not a copy tweak.

- **Eligibility-gating decision** *(this bullet IS the product decision)* — `buildBenefitsPrompt()` currently instructs the AI to cover DIC, CHAMPVA, and Fry Scholarship unconditionally for all military_veteran profiles, regardless of P&T status, SC-death flag, or disability rating. The AI is expected to self-filter eligibility from the profile context. Whether to move this to deterministic prompt-level gating is an open product/engineering decision. **Logged in `.claude/artifacts/decision-pending-benefits-eligibility-gating.md`.** Resolve here before writing any prompt changes — the answer determines the scope of everything else in this phase.
- **S** — Detailed Analysis has significant cross-section duplication (CHAMPVA/TRICARE duplicated across "Federal Survivor Benefits" + "Healthcare for Survivors" sections)
- **W** — AI prose doesn't explicitly cross-reference pill cards ("See the [Card] above") — tune prompt; acceptable interim
- **P** — VMSDEP acronym drops the "M" in card title (fix in `lib/stateData.ts` VA entry)
- **Q** — Card says VMSDEP, AI prose says VSDEP (name mismatch: card vs. detailed analysis — may resolve via Phase 4)
- **R** — SGLI/VGLI card implies coverage is automatic; VGLI requires enrollment

---

## Phase 6 — Cosmetic / UX polish (Findings C, D, H, J + CTA icon)

*(Finding 3 already shipped — removed from this phase.)*

- **C** — Markdown "#" rendering as literal text in AI analysis output
- **D** — Broken UI element: empty red bar with truncated "Apply for" near Social Security
- **H** — "Family" framing assumes user has family (off for single civilian)
- **J** — Dashboard not reachable from top-nav (only via logo click)
- **CTA icon** — the landing-page CTA lost its icon when the broken ❧ circle was removed; add a real lucide icon (compass/shield, on-brand with the LS logo)

---

## Phase 7 — Mandatory regression re-run

After fixes ship: re-run all three personas (Civilian / Vet-Family / Veteran), walk the same six pages each. Confirm no new regressions, all queued findings resolved, and **no over-correction** — especially that AI prose accuracy constraints didn't loosen too far. Logged as must-do.

---

## Standing Architect decisions (carry into Phase 2)

- **Decision 1 — Civilian experience model.** Made in Phase 2. Recommend progressive disclosure (replicate Survivor page's "Veteran family?" pattern).
- **Decision 3 — Scenario-2 transition state.** Existing civilian vet-family user flips `service_connected_death` to Yes after a living veteran spouse dies. Requirements: (a) cache invalidation must include the sc_death transition — verify the May 19 hash work still holds after Fix 5; (b) post-flip experience must auto-prewarm (user is in acute grief — no manual "Regenerate" click); (c) reversal must revert cleanly (if sc_death is flipped by mistake or a VA determination reverses, no stale "you qualify for DIC" content left behind).

---

## Low priority / parking lot

- **Guardian `:577` isMilitary bug** — `occupation_type === "military"` should be `"military_veteran"`; `isMilitary` is always false, affects 3 conditional blocks. Renders fine in prod currently. Has TODO comment in code. Needs own branch + guardian display logic audit before fix.
- **`will.pdf` → "Advance Directive" filename mis-match** — pre-existing quirk in `filenameMatch.ts` partial-match logic. Minor.
- **`guardian-vault-debug` deleted file** — appears across every checkout, unexplained. Ask CC.

---

## Recommended order summary

```
Guardian   Raw-storage exposure fix             (high priority, active exposure)
Phase 0.2  Next.js security upgrade             (security, independent, do soon, non-blocking)
Phase 2    Page-level gating: A, F, G/K, L      (biggest cluster; Decision 1 here)
Phase 3    Voice/framing: B, E, N, O            (parallel-able with Phase 2)
Phase 4    State canonicalization: T + gaps     (replaces Fix 4 interim)
Phase 5    Benefits-engine prompt pass: R, S, P, Q, W + eligibility-gating decision
Phase 6    Cosmetic: C, D, H, J + CTA icon
Phase 7    Mandatory 3-persona regression       (must-do gate)
```

Phases 0.1 and 1 complete. Finding 3 complete. ~15 findings remain across 6 active phases. Each phase routes through the LS Engineering Det chain with its three human checkpoints (approve Scribe story → approve Architect spec → review IG audit before merge).

**Site is screening-ready for VHA window (~June 10–12). No blocking issues.**
