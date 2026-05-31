# LS Engineering Detachment — Shipyard Chain Reference

## The Chain

```
Scout → Scribe → [CP1] → Architect → [CP2] → Snipe ⇄ Topside → Range → IG → [CP3] → merge
```

**Three human checkpoints:**
- **CP1** — Approve or revise the user story before Architect designs
- **CP2** — Approve or revise the spec before Snipe builds
- **CP3** — Review IG's audit before merging to main

## Agents

| Agent | File | Role | Writes |
|---|---|---|---|
| Scout | `agents/scout.md` | Codebase recon, lay of the land | Recon brief (in chat) |
| Scribe | `agents/scribe.md` | User story + acceptance criteria | `artifacts/story-[slug].md` |
| Architect | `agents/architect.md` | Implementation spec | `artifacts/spec-[slug].md` |
| Snipe | `agents/snipe.md` | Implementation | Code + `artifacts/build-[slug].md` |
| Topside | `agents/topside.md` | Tests against AC | Test files + `artifacts/tests-[slug].md` |
| Range | `agents/range.md` | QA validation, suite runner | `artifacts/validation-[slug].md` |
| IG | `agents/ig.md` | Final audit, go/no-go | `artifacts/ig-audit-[slug].md` |

## Starting a Feature or Bug Fix

1. Drop the finding or request into the primary Claude Code session.
2. Invoke Scout: `use the scout agent to recon [the request]`
3. Scout produces a recon brief in chat.
4. Invoke Scribe: `use the scribe agent to write a user story based on scout's brief`
5. **CP1:** Review `artifacts/story-[slug].md`. Approve or give revision notes.
6. Invoke Architect: `use the architect agent to design the spec for the approved story`
7. **CP2:** Review `artifacts/spec-[slug].md`. Approve or give revision notes.
8. Invoke Snipe: `use the snipe agent to implement the approved spec`
9. Invoke Topside in parallel or immediately after: `use the topside agent to write tests`
10. Invoke Range: `use the range agent to validate the build`
11. Invoke IG: `use the ig agent to audit the chain output`
12. **CP3:** Review `artifacts/ig-audit-[slug].md`. Merge if GO.

## Resuming Mid-Chain

Each agent's output is a file in `.claude/artifacts/`. If a session ends mid-chain, start the next session by pointing the next agent at the relevant artifact files. The chain state is in the artifacts, not the session context.

## Artifacts Directory

`.claude/artifacts/` is created per-run and not committed to git (see `.gitignore`). Artifacts are working documents for the chain — not deliverables. The deliverable is the merged code.

If you need to preserve a chain's artifacts for audit purposes, copy them out of `.claude/artifacts/` before the next run overwrites them.

## Installing the Pre-Commit Hook

```bash
git config core.hooksPath .githooks
```

Run once per clone. The hook runs `npm run typecheck` and `npm run lint` on every commit. Failing either blocks the commit.
