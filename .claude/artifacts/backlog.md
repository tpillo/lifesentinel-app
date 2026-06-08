# Life Sentinel — Backlog

## Shipped June 7 (verified in production)
- FR removal / profile selector 4→2 (Veteran/Military + Civilian)
- Civilian section heading fix ("Your Details" vs "Service Details")
- Reserve/Guard landing card ("Active, Reserve & Guard")
- Profile page nav header added (was missing DashboardHeader)
- CLAUDE.md persona update (6→2 first-class, resolvePersona documented)
- Guardian .emptyFolderPlaceholder filter
- Test infra: Vitest + RTL stood up; 39-assertion 3-persona regression suite live

## Priority — Guardian/Share raw-storage exposure
Guardian view walks RAW STORAGE (walkFolder), not readiness_document_files, so it serves every file ever uploaded incl. deleted/replaced. No delete-from-storage path exists anywhere in app.
- Fix: option B — point Guardian walk at DB-backed current-file list, same source as owner's /api/vault/files.
- FIRST recon question: when a user removes/replaces a file, what happens to the readiness_document_files row — deleted, updated, or untouched? If DB table is clean, option B works. If DB also stale, fix is bigger (needs delete path or current-version flag).
- Same fix likely resolves count mismatches (overview=DB is_present vs vault=storage objects).
- Also: missing compass logo on Guardian header (same surface).
- NOT screening-blocking: reaching it requires approved account→profile→upload→share-link.

## Benefits-engine prompt pass (one workstream = the eligibility-gating decision)
Ties to .claude/artifacts/decision-pending-benefits-eligibility-gating.md. Do as ONE prompt revision + cache bump + 3-persona re-verify. This is a product decision, not a copy tweak.
- CHAMPVA/TRICARE duplicated across "Federal Survivor Benefits" + "Healthcare for Survivors" sections
- "Paid to all qualifying surviving spouses" — over-broad eligibility language
- VMSDEP name mismatch: card vs detailed analysis

## Low priority
- Guardian :577 isMilitary bug ("military" vs "military_veteran") — renders fine in prod
- will.pdf → "Advance Directive" filename mis-match (minor)
- guardian-vault-debug deleted file appears across every checkout — unexplained, ask CC

## Status
Site is screening-ready for VHA window (~June 10-12). No blocking issues.
