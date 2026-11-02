# Content and looks review — `de.gitops-reconciliation-data-platforms`

## Content review

- CHAPTER.md's planning brief names Chapter 10 §10.4 (Infrastructure as code and FinOps) and Chapter 11 §11.4 (CI/CD for data pipelines, write-audit-publish) as material this topic builds on and should draw `uses` ids from. Checked `registry.ts` directly: neither chapter has a §10.4 or §11.4 topic built yet (only §10.1 and §11.1 topics exist in each). Logged as a declared cross-chapter gap in OUTLINE.md — the same pattern topics 6 and 7 already hit for Chapter 7 §7.3 and Chapter 9 §9.1/§9.3. `uses` draws only on ids that actually exist in `registry.ts`; `coverage.json`'s `gapReview.open` stays empty, since the IaC-vs-GitOps seam and the CI/write-audit-publish gates this topic leaves out are described from CHAPTER.md's own clause text, not assumed as taught background.
- Every quote fetched and verified cleanly on the first `sources.mjs check` run (25/25) — no misattribution, no fabricated claim, no markdown-link stripping issue this time, unlike several earlier topics in this chapter.
- Did not attribute the "a naive redeploy of a stateful stream job is a data incident" claim to Argo Rollouts' own documentation. Argo Rollouts' docs don't discuss Flink or stateful stream jobs at all; this is explicitly design reasoning built on topic 7's already-sourced upgrade-mode facts (stateless mode starts from nothing), and is marked as reasoning rather than sourced in FACT-CHECK.md and coverage.json, per CHAPTER.md's own instruction for this clause.
- Did not imply SOPS's encryption removes the exposure of a decrypted secret once it's actually applied to a running cluster — CHAPTER.md's own clause explicitly asks for "what it still exposes," and the topic states that exposure plainly (post-notes.md, the secrets scene, and the secrets narration step all name it) rather than letting the encryption framing suggest the problem is fully solved.

## Build fixes

- `npm run build` failed once: two narration lines (51 and 58 words) exceeded the 50-word limit. Both were two full sentences joined into one array element; split each into two separate `lines` entries, which also improved the pacing.
- Proactively applied every lesson accumulated across topics 4-7 in this chapter from the start: no literal digits anywhere in `reel.tsx` (including its file-header comment), `coverage.json`'s `expert` list written with ten items from the first draft, at least two genuine predict steps planned into the storyboard before writing scenes, and every comparison scene built as full-width (400px) stacked rows via a shared `CompareRow` helper rather than side-by-side boxes.

## Looks review (Playwright reel test)

No phone-overflow issues found. Every multi-row scene (`FluxOci`, `PromotionByPr`, `DriftCorrection`, `SecretsGitops`, `ProgressiveDelivery`, `IacVsGitopsSeam`) uses the same full-width `CompareRow` helper, and the single shared positioned helper (`StateBand`) takes an explicit `y` parameter with a safe default, following the fix topic 6 needed for its own hardcoded-position helper.

Verified via `node scripts/check-all.mjs --only reels,docs,sources --topic gitops-reconciliation-data-platforms`: reel smoke test passes at desktop and phone ("Reel smoke test passed: 1 live reel(s) at desktop and phone sizes"); docs and sources both pass. The run's `test:editor` failure ("a save did not open a new GitHub issue") is the same pre-existing, unrelated failure documented for every topic in this chapter.

## Sandbox disclosure

No local Kubernetes cluster exists on this build machine, and neither Argo CD nor the Flink Kubernetes Operator is reachable either — the same limitation confirmed across every topic in this chapter, one layer further up the stack. This topic hosts the chapter's §12.3 lab (promote a Flink job through Argo CD with a savepoint-preserving upgrade, inject drift with a direct edit, observe reconciliation, roll back and verify no state loss); none of that can be run live here. Per CHAPTER.md's own fallback order, the drift-and-rollback half is modeled computationally in `examples.py` against Argo CD's own documented sync/self-heal/prune/`ignoreDifferences` semantics (fifteen tests, including the hook's exact scenario), and the Flink savepoint-preserving-upgrade half is disclosed as sourced-only, reusing topic 7's already-verified upgrade-mode facts rather than re-deriving them.

This is the eighth and final topic of Chapter 12 (Containers, Kubernetes and Delivery): all eight are now built, held, and queued for narration.
