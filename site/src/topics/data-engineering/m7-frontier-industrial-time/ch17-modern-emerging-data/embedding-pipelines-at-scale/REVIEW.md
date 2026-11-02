# Review — de.embedding-pipelines-at-scale

## Content review (self-review, 2026-10-30)

- Every syllabus clause maps to a step (coverage.json): batch inference throughput / GPU
  batching / API rate limits / cost per million tokens (Reveal: throughput and cost per million
  tokens; Reveal: the API-bound case), content hashing to re-embed only changed chunks (Reveal:
  content hashing, the mechanism), deletes and tombstones propagated to the index (Reveal:
  deletes and tombstones), backfills after a model change without downtime (Reveal: why a model
  change cannot be an in-place swap; Reveal: the dual-index backfill).
- All claims in FACT-CHECK.md are grounded either in a fetched, quote-checked primary source
  ("The Embedder's Dilemma" (COLM 2026) for the throughput/cost benchmark method and figures,
  OpenAI's own text-embedding-3-large model page for its rate-limit tiers, Qdrant's own FAQ for
  soft-delete/tombstone/zero-downtime-rebuild semantics) or in this topic's own `examples.py`, a
  real CPU-bound numpy encoder stand-in (no GPU or embedding-model library exists in this
  sandbox), run for real: measured throughput applied to the paper's own cost formula (disclosed
  explicitly as illustrative, not a GPU-scale estimate), a compute-bound-vs-rate-limit-bound
  comparison on an identical 50M-token backlog, one edited ticket out of a 400-chunk corpus
  triggering exactly one re-embedded chunk, a deleted document's vector becoming unretrievable
  after being tombstoned, and a simulated dual-index backfill where the old index answers every
  query during the build and the old/new model's vectors for the identical chunk show no
  meaningful cosine alignment.
- No coverage.json or build-check failures this time — the syllabus clauses were copied directly
  from `syllabus/data-engineering.md` line 943 with no special characters to get wrong, unlike
  topic 5's en-dash issue.
- The reel's engagement arc holds: two predicts (step 2 and the closing "Prove it"), no takeaway
  on step 3 (the reel test's reference step), five takeaways (steps 4, 5, 6, 7, 8).
- Narration (verified via `narration-teaches.mjs`): zero description-overlap flags, every line
  under the 50-word floor.
- One takeaway was initially 23 words ("A benchmark's number is only meaningful next to its own
  stated method: the sequence length, the batch size, the hardware it ran on.") and was trimmed
  to 14 words before the build ran.
- Bridge answers topic 5's handoff verbatim per CHAPTER.md; handoff leads into topic 7 (choosing
  a vector store) exactly as planned. This opens §17.1.1.

## Looks review (self-review, 2026-10-30)

Checked via the topic-scoped reel smoke test (`tests/reels.mjs`) at desktop and phone sizes.

- The first run failed on phone with four layout issues, all from the same class of bug seen on
  earlier topics (a caption or label running outside the drawing, or two side-by-side labels
  overlapping at phone's larger text scale): step 3's caption ("one edited chunk relights one
  tag. The rest stay exactly as they were.") ran outside the drawing, fixed by splitting it into
  two separate `<T>` lines; step 7's two side-by-side labels ("old model's vector for one chunk"
  / "new model's vector, same chunk") overlapped, fixed by stacking them vertically instead of
  side-by-side; step 9's (Recap) first stacked block's value line ran outside the drawing, fixed
  by shortening it; step 10's (Prove it) caption ran outside the drawing, fixed by splitting it
  into two lines.
- Second run passed cleanly at both sizes with no further issues.

Final `node scripts/check-all.mjs --only reels --topic embedding-pipelines-at-scale` run:
`test:reels` passed ("1 live reel(s) at desktop and phone sizes"). `test:editor` still fails with
"a save did not open a new GitHub issue" — the same known, pre-existing, topic-independent
Playwright/Chromium sandbox limitation documented on topics 1-5's REVIEW.md, not caused by this
topic and not a shipping blocker.
