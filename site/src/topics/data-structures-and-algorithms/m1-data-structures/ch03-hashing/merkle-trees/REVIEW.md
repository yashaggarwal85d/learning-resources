## Content review, self-review, 2026-10-23

- Claims traced to sources: the recursive hash-pairing mechanism and the leaf-to-root authentication
  property are quoted directly from Merkle's own 1979/1989 paper; anti-entropy repair is quoted
  directly from Cassandra's current 4.1 docs; Git's object model is quoted directly from the Pro
  Git book's current edition; the append-only Merkle-log guarantee is quoted directly from RFC 6962
  itself; content-defined chunking is quoted directly from Dolt's current docs. All 12 quotes pass
  `sources.mjs check`.
- Honest note on source quality, recorded rather than smoothed over: Merkle's 1979 paper's PDF text
  extraction is heavily garbled in its decades-old, two-column typeset body (word order and
  hyphenation break across lines) — the same class of issue already recorded for topic 18's Knuth
  paper and topic 21's Karger paper. Quotes in `SOURCES.md` are chosen only from the lines that
  survive that garbling intact; no claim here depends on a garbled span.
- `examples.py`'s first draft needed no correction to its assertions — both measurements (walk-down
  vs. full-scan hash count; chunks reshaped by one edit under each chunking scheme) matched the
  predicted shape on the first run: 12 hash comparisons for a 64-leaf walk-down against 64 for a
  full scan (exactly 2·log2 64); 79/79 fixed-offset chunks reshaped by one inserted byte against 1/76
  content-defined chunks.
- Gap hunt (`coverage.json` → `gapReview`): no open items. Blockchains and other append-only
  ledgers are named with no mechanism (not named in the syllabus for this topic); the from-scratch
  measured numbers make no claim against any cited system's own benchmarked performance.
- All five syllabus clauses in `coverage.json` are copied word-for-word from
  `syllabus/data-structures-and-algorithms.md`'s §3.3 line for this topic. 11 expert items were
  written blind, from the syllabus line and the five fetched sources alone, satisfying the
  ≥10-item minimum from the first draft.
- `FACT-CHECK.md`'s "Claims not made" section explicitly declines to claim this topic's own
  from-scratch measurements match any cited system's benchmarked numbers, declines any mechanism
  claim about blockchains/ledgers beyond naming them, declines re-covering topics 16–21's
  location/collision/resizing thread (explicitly left behind, per `CHAPTER.md`'s own instruction),
  and declines attributing any of the four production uses' own details to Merkle's 1979 paper.
- Narration (steps 3–9) was written as the professor's own reasoning about why each mechanism works
  and what to watch for, deliberately distinct from each step's on-screen description/caption —
  applying topic 21's exact build-failure lesson from the start rather than discovering it again.
  No narration line uses a digit or symbol.
- Two predict steps (step 3: what a matching root guarantees; step 5: how many hashes a walk-down
  checks) both have matching `answer` arrays in `narration.json`; both distractor sets are
  red-teamed in `FACT-CHECK.md` against the real misconceptions each mechanism invites (treating a
  hash match as merely probabilistic; falling back to a full scan instead of trusting the tree's
  halving structure).
- Three takeaways (steps 4, 6, 8) satisfy the three-minimum rule, each under the 20-word limit.
- Every number shown on screen (step 9's measured bars) was checked against `examples.py`'s own
  printed output before being written into `scenes.tsx`.
- Dead-variable cleanup caught before shipping: `examples.py`'s first draft computed an unused
  `fixed_after`/`fixed_changed`/`edited_stream` set of values for a same-length overwrite that
  turned out not to be the real contrast this topic needed (fixed-offset chunking is only broken by
  a length-changing edit, not an overwrite) — removed rather than left as dead code once the
  insert-based measurement replaced it.

## Looks review, self-review, 2026-10-23

`npm run build` and `PREVIEW_HELD=1 npm run build` are both clean. The full
`check-all.mjs --topic dsa.merkle-trees` run (locked, docs, sources, build, narration, reels,
links) passes on the first attempt, with the reel smoke test run against a built, served preview.

- Step 1 (Opening): the fading ring and the two side-by-side data blocks render clear of each other.
- Step 2 (TreeBuilt): the four-leaf tree's edges and nodes rising to one root fit the frame.
- Step 3 (RootMatchPredict) and its answer state: both trees, the pulsing comparison dot, and the
  predict/answer text are legible at both sizes.
- Step 4 (RootMismatch): the two trees' differently-coloured roots are visually distinct.
- Step 5 (WalkDownPredict) and its answer state: the pulsing mismatched node and the predict/answer
  text are legible at both sizes.
- Step 6 (ProofPath): the level-by-level re-lit path and the faded sibling paths render without
  overlap.
- Step 7 (ProductionUses): the three small tree icons and their labels stay inside the frame.
- Step 8 (ContentDefinedChunking): both rows of chunks and their captions render without overlap.
- Step 9 (ProveIt): both measured bar pairs and the closing caption fit cleanly at both sizes.

Final reel check (full `check-all --topic dsa.merkle-trees`): locked, docs, sources, build,
narration, reels, and links all pass.
