# Decision: File storage (Vault) — RETIRE; keep location-notes
Date: 2026-07-05 · Status: Decided

## Decision
Life Sentinel does not hold users' sensitive files. File storage (the Vault / document upload) is retired. The location-notes feature (the document_locations table — "where a family's physical documents are") is KEPT. It is the low-liability, survivor-relevant replacement for storage.
- RETIRE: file upload, the Vault view, and any route that stores or serves uploaded files.
- KEEP: location-notes (document_locations) — recording where physical documents live.
- Leave readiness_document_files rows and the storage bucket in place but unreachable. Do NOT hard-delete user files (irreversible). A future purge job can remove them.
- Confirmed via prod DB: only the founder's test account has uploaded files (2 files, one account, April 2026). No real users. No user comms needed.

## Why
- Storage is the liability surface (it caused the Guardian raw-storage exposure) and is off-strategy — LS is a benefits-navigation product, not a document-storage product.
- Location-notes delivers the survivor-relevant value ("where is it, in a crisis") without holding sensitive files.
- Sharpens the pitch: LS never holds your sensitive documents — it tells your family what benefits they're owed and where to find the paperwork to claim them.

## If revived
Re-architect storage properly; the current raw-storage model is known-flawed. Do not un-retire the existing vault.
