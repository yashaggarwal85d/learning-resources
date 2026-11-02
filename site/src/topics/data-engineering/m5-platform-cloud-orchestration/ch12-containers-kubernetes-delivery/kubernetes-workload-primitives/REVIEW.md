# Content and looks review — `de.kubernetes-workload-primitives`

## Content review

- CHAPTER.md's planning brief named `consensus-raft-paxos-in-systems` as a Chapter 5 `uses` dependency, but no DE chapter 5 topic currently introduces a concept id with that name in `registry.ts` (checked directly: `de.synchronous-asynchronous-semi-synchronous` and `de.physical-vs-logical-replication` are chapter 5's replication topics, neither introduces a consensus id). Per CHAPTER.md's own cross-chapter-id rule, moved it from `uses` to a declared, logged gap in `OUTLINE.md` instead of guessing an id. `coverage.json`'s `gapReview.open` stays empty (the build's coverage check requires it) — the etcd/Raft source item is marked `{ out: ... }` with the same reasoning, and the seam-pass pointer lives in `OUTLINE.md` and this file, not in `gapReview`.
- Syllabus clause coverage required adding two things the reel itself doesn't dramatize (node pools, restart policies) — added as a short Deep-dive paragraph ("Node pools and restart policies" in `post-notes.md`) rather than stretching the reel to cover them, since a 5-minute refresher's reel already carries Pods/Deployments/StatefulSets/Services/Secrets/PVs/taints/affinity.
- One `reel.tsx` title/takeaway contains an apostrophe ("A Secret isn't encryption", "A Deployment's pods are interchangeable..."); both written with double quotes (never an escaped single-quoted string), per the recurring title/takeaway-extraction-regex gotcha from earlier topics in this chapter.

## Looks review (Playwright reel test)

- Step 4 (Pod, Deployment, StatefulSet): the original side-by-side layout (a label box, a connecting line, then a description string starting at x=350) let "interchangeable, stateless replicas" and "sticky identity, its own volume" run outside the drawing on phone, where `--svg-text-scale` enlarges text and there was no width budget left. Rewritten as three full-width stacked rows (name centered above, a short description centered below), the same pattern already proven for topic 2's "Three ways to die of memory" step, and shortened "interchangeable, stateless replicas" to "interchangeable replicas" and "sticky identity, its own volume" to "sticky identity, own volume".

Verified via `node scripts/check-all.mjs --only reels --topic kubernetes-workload-primitives`: reel smoke test passes at desktop and phone. The same run's `test:editor` failure ("a save did not open a new GitHub issue") is the same pre-existing, unrelated failure documented for topics 1 and 2 (hardcoded against `de.b-trees-vs-lsm`, independent of any file in this topic).

## Build

`npm run build` passes with this topic held; the coverage check (`gapReview.open` must be empty) initially failed because the chapter-5 cross-id note was logged there instead of in `OUTLINE.md` alone — moved and fixed.

## Sandbox disclosure

No local Kubernetes cluster exists on this build machine (no `kubectl`, no `kind`/`k3s`), so every object's documented behaviour is sourced from Kubernetes' own concept pages, not demonstrated against a running API server. The reconciliation-loop and taint/toleration-matching mechanics the reel draws are run for real in `examples.py` as pure-Python models built strictly from the sourced rules.
