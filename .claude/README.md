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

## How Agent Invocation Works

The `.claude/agents/` files are **system prompts for the Claude Code CLI's native subagent system** — they are loaded when you type `use the scout agent` (or similar) in an interactive Claude Code session. They are NOT invocable via an internal `Agent` tool call from within the same session.

In practice, the primary Claude Code session acts as the orchestrator and **embodies each role directly**, reading that agent's `.md` file as the governing system prompt for that step. The agent files define the role, tool allowlist, inputs, outputs, and guardrails — the orchestrator applies them in sequence.

This means:
- You do not need to open separate sessions per agent.
- The orchestrator enforces each agent's tool constraints and output format as it runs each step.
- If a future Claude Code release supports true multi-agent spawning from within a session, these files are already in the correct format to use.

## Starting a Feature or Bug Fix

1. Drop the finding or request into the primary Claude Code session.
2. Invoke Scout: `run the scout agent on [the request]` — orchestrator embodies Scout's role (Read, Grep, Glob only; produces recon brief).
3. Scout produces a recon brief in chat.
4. Invoke Scribe: `run the scribe agent on scout's brief` — orchestrator embodies Scribe's role; writes `artifacts/story-[slug].md`.
5. **CP1:** Review `artifacts/story-[slug].md`. Approve or give revision notes.
6. Invoke Architect: `run the architect agent on the approved story` — writes `artifacts/spec-[slug].md`.
7. **CP2:** Review `artifacts/spec-[slug].md`. Approve or give revision notes.
8. Invoke Snipe: `run the snipe agent on the approved spec` — implements; writes `artifacts/build-[slug].md`.
9. Invoke Topside in parallel or immediately after: `run the topside agent` — writes tests and `artifacts/tests-[slug].md`.
10. Invoke Range: `run the range agent` — writes `artifacts/validation-[slug].md`.
11. Invoke IG: `run the ig agent on the full chain output` — writes `artifacts/ig-audit-[slug].md`.
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
