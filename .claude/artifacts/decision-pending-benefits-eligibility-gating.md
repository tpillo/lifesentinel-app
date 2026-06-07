# Decision Pending: Benefits Prompt Eligibility Gating

## What the current design does

`buildBenefitsPrompt()` for military_veteran profiles unconditionally instructs the AI to
"Cover DIC, Survivors Pension, CHAMPVA, DEA/Chapter 35, Fry Scholarship…" regardless of
the veteran's disability rating, P&T status, or service-connected-death flag. The profile
data block (rating, P&T, SC death) is passed as context and the AI is expected to apply
its own eligibility knowledge when generating the report.

## Why this is a real question

DIC requires SC death or 100% P&T for 10 years. CHAMPVA generally requires P&T or SC death.
Fry Scholarship requires line-of-duty death. A 70% non-P&T veteran with no SC death gets a
prompt that says "cover DIC, CHAMPVA, Fry" — the AI may correctly caveat eligibility or may
hallucinate partial entitlement. This is not reliably deterministic.

## The two options

**Option A — Keep AI-delegated (current):** Profile flags feed context; AI self-filters.
Risk: eligibility accuracy depends on model behavior, not code. Hard to regression-test.
Low implementation cost.

**Option B — Move to deterministic gating:** Add conditional logic to `buildBenefitsPrompt()`
that adjusts the Section 1 instruction based on flags (e.g., only mention DIC if
`service_connected_death === "yes"` or `va_pt_designation === "yes"`). Testable, auditable,
predictable. Requires mapping every benefit's eligibility conditions into code.

## Why this was deferred

Surfaced during test-plan review for fix/drop-fr-card (June 2026). Out of scope for the
FR-removal branch — adding eligibility gating would be a separate prompt change requiring
a BENEFITS_PROMPT_VERSION bump and its own regression run. Logging here so it isn't lost.

## Suggested next step

Before Option B: audit one or two real AI outputs for a low-rating non-P&T non-SC-death
veteran to see whether the model actually hallucinates entitlement or correctly caveats.
That data point determines urgency.
