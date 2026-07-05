# Decision: Guardian / document-sharing — DISABLE, do not fix
Date: 2026-07-05 · Status: Decided
Supersedes the "Guardian raw-storage exposure fix" framing and the 15 June soft-delete recommendation in findings-backlog-reconciled.md.

## Decision
Life Sentinel is a benefits-navigation product, not a document-storage product. The vault is deprecated. The Guardian document-sharing surface will be DISABLED, not fixed.
- Disable creation of new Guardian share links.
- Make existing share links inert (revoke).
- Document the raw-storage exposure as known and unfixed BY DESIGN.
- Do NOT implement the soft-delete / delete-path work (is_current vs deleted_at, the two-part fix). That is correct engineering for a storage product; LS is not one.
- If the vault is ever revived, RE-ARCHITECT the storage/data model — do not patch the current raw-storage walk.

## Why
- Vault overlaps IronClad Family (nearest competitor); the entitlement engine is the moat, not the vault.
- Recon (15 June) showed the fix is larger than expected: no delete path exists, so a real fix means building removal across all read paths. Multi-part build on a non-core feature.
- Disabling the share surface neutralizes the exposure without that build: if the Guardian share view is unreachable, the raw-storage walk is never served.

## Not blocking
Site remains screening-ready. Reaching the surface required approved account → profile → upload → share-link; disabling creation + revoking closes it.
