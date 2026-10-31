# REVIEW: `de.images-layers-local-environments`

Self-review; no independent reviewer ran.

## Content review, self-review, 2026-10-30

1. **Flow.** The refresher assumes nothing from chapters 6–11 (unplanned/unbuilt at this writing) and only uses `ci-pipelines`, `dependency-pinning` (Software delivery workflow refresher, live) and `process-model` (Linux shell refresher, live) — all earlier-live concepts. No forward dependency.
2. **Pre-notes.** Nine terms, each one the reel actually assumes rather than teaches (image, layer, container, registry, tag vs digest, volume, bind mount, bridge network, Compose service); none of them is explained again inside the reel itself.
3. **Gap hunt.** All six syllabus clauses are mapped in `coverage.json`, verified against the build's coverage check. The §12.1 lab's size/cold-start/CVE comparison is honestly disclosed as sourced-only (no Docker daemon on this build machine), not fabricated as measured.
4. **Expert reader.** Added the `metacopy` caveat to the copy_up claim after reading the OverlayFS docs more carefully in the fact-check pass (a plain claim that every write copies the whole file up would have overclaimed past an optional kernel feature). Fixed `-debian12` to `-debian13` to match the Distroless project's current tag.
5. **Engagement.** Hook on step 1 (the shop's real re-push problem), predict on step 2 (within the first four steps), three takeaways (steps 5, 6, 8 — moved off steps 3 and 4 after the reel test's phone caption-swipe check flagged the test's own "from" step; see QUALITY.md #64/#59 for the same gotcha on earlier topics), recap on the last step.
6. **Narration teaches.** Checked with `node scripts/narration-teaches.mjs`: no flagged description-reading; overlap 2–30% across steps, consistent with other shipped refreshers. Narration asks the question before answering it on the predict step and poses "why does more memory make it worse"-style questions elsewhere in the chapter's later topics, not this one (a refresher keeps closer to the mechanism).

No open findings.

## Looks review, self-review, 2026-10-30

Ran `node scripts/check-all.mjs --only reels --topic images-layers-local-environments`, which renders and screenshots every step at desktop and phone size. Found and fixed, in order:

- Step 4 (build-cache ordering): side-by-side stacks scaled to 0.62× shrank 13px labels below the 9px phone minimum and overflowed the canvas; replaced with two un-scaled half-width stacks and short instruction labels.
- Step 5 (whiteout), step 6 (multi-stage), step 7 (volumes/networks), step 8 (Compose health), step 9 (env vs file): several footer captions were long enough to overflow the canvas once the phone's `--svg-text-scale` enlarges them; shortened and split into two short lines each.
- Step 10 (recap): replaced unbounded-length truncated strings with five pre-wrapped two-line takeaways that fit at phone scale.
- Phone caption-swipe check failed on the test's own "from" step (the first non-predict step after the opening predict, almost always this reel's step 3) whichever step there carried a `takeaway`; moved all three takeaways off steps 3 and 4 per the documented gotcha, keeping three elsewhere.

Final run: reel smoke test passed at desktop and phone. (A separate, topic-independent `test:editor` failure — "a save did not open a new GitHub issue" against the unrelated, pre-existing `de.b-trees-vs-lsm` topic and a mocked GitHub API — reproduces on this build machine and is unrelated to this topic's files; flagged to the owner rather than worked around.)
