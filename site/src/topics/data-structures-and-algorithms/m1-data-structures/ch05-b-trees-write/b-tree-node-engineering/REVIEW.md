## Content review, self-review, 2026-10-23

- Claims traced to sources: suffix truncation's mechanism and purpose, and deduplication's lazy,
  split-time-only application, are quoted directly from PostgreSQL's own `nbtree` README (fetched
  from the `master` branch). The deduplication version and `REINDEX` requirement are quoted
  directly from the PostgreSQL 13.0 Release Notes. Fill factor's definition, default and range are
  quoted directly from the PostgreSQL CREATE INDEX reference. The slotted page layout is quoted
  directly from CMU 15-445's own Spring 2024 Lecture 3 slides. Bulk loading's algorithm and
  right-most-path property are quoted directly from University at Buffalo CSE 350's own Lecture
  16. Key normalization's byte-level encoding is quoted directly from MyRocks's own record-format
  wiki, a real, current production key-value store's documentation. All 34 quote-check passes
  (`sources.mjs check`) pass.
- `examples.py` builds a slotted-page simulation and measures a routing entry's byte size before
  and after suffix truncation on a real key set (eighteen bytes full, eight bytes truncated).
  Three hundred signed integers and three hundred floats are normalized to their byte-comparable
  form and sorting the normalized byte strings is asserted to match sorting the original typed
  values exactly. A B+Tree is bulk-loaded from two hundred already-sorted keys, with every split
  during the build asserted to touch only the tree's own right-most node at its level; the build
  costs ninety-two page writes, against one thousand one hundred sixty-four for one-at-a-time
  insertion of the identical sorted input — asserted to be less than a third. A deduplication
  simulation on sixty inserts across five distinct keys shows the deduplicated storage size
  (five hundred twenty bytes) smaller than the raw size (nine hundred sixty bytes).
- Gap hunt (`coverage.json` → `gapReview`): no open items. Bayer and Unterauer's full 1977 paper is
  named as suffix truncation's origin, not re-derived; posting-list compression is named only in
  the frontier section as explicitly declined by PostgreSQL's own README; unique-index
  deduplication (a different section of the same README) is out of scope.
- The syllabus clause plus the cross-domain arrow reference (`→ Rust Systems Engineering Ch.19`)
  are both mapped in `coverage.json`, the arrow clause pointing to the "In production" post-notes
  section, following the same pattern topic 26 established for a cross-domain reference to a
  topic that doesn't exist yet. Ten expert items were written blind, from the syllabus line and
  the six fetched sources alone.
- `FACT-CHECK.md`'s red team confirmed suffix truncation's one documented edge case (keeping more
  than one byte when no shorter prefix distinguishes the split) and its one documented boundary
  (never applied at an internal-page split, per the source's own explicit statement, which
  `coverage.json`'s sources section records as an `out` item rather than an on-screen claim); both
  predict steps' distractor options were checked against the mechanism already shown earlier in
  the reel.
- Narration (all ten steps) was written as the professor's own reasoning, distinct from each
  step's on-screen caption/body, drawing from `OUTLINE.md`'s own "Narrator's line of thought"
  section written during planning. Verified clean with `scripts/narration-teaches.mjs` (the real
  build check, not an approximation): one description-verbatim overlap (step 8, "wants room left
  on purpose") and one unspeakable-character hit (step 9, "I/O") were both caught and rewritten
  before the first `check-all` run, rather than discovered by it.
- Two predict steps (step 3: a leaf split's routing-entry bytes; step 6: bulk loading from sorted
  input) satisfy the full topic's two-predict requirement; both have matching `answer` arrays in
  `narration.json`.
- Three takeaways (steps 4, 7, 9) satisfy the three-minimum rule.
- One build failure caught and fixed: `coverage.json`'s expert list initially had eight items
  against the ten-item minimum the build's coverage checker enforces — fixed by adding two more
  blind-review items (the slot array's offset-vs-tuple distinction; PostgreSQL's own concurrency
  rationale for not compressing posting lists) rather than padding existing ones.
- Every number in `reel.tsx`/`scenes.tsx` prose is spelled as a word (no digit characters), and no
  on-screen visual renders a literal numeral — bars and labels are drawn proportionally from
  `examples.py`'s own measured ratios, following the same convention topics 24–26 established.

## Looks review, self-review, 2026-10-23

`npm run build` is clean. The full `check-all.mjs --changed` run (locked, docs, sources, build,
narration, reels, links) passes, with zero broken links.

- Step 1 (Opening): topic 26's wide page redrawn with wasted space shaded renders without overlap
  at both sizes.
- Step 2 (SlottedLayout): the header, slot array and growing data area stay legible and inside the
  frame.
- Step 3 (PrefixSuffixPredict) and its answer state: the split leaf and the predict/answer text
  are legible at both sizes.
- Step 4 (PrefixSuffixReveal): the full-key-vs-truncated-key comparison renders clearly, without
  the two forms overlapping.
- Step 5 (KeyNormalization): the signed-integer byte flip renders cleanly at both sizes.
- Step 6 (BulkLoadPredict) and its answer state: the sorted-key-set sketch and the predict/answer
  text fit the frame.
- Step 7 (BulkLoadReveal): the leaf-fill and right-most-path split render without crowding.
- Step 8 (FillFactor): the packed-vs-reserved-room comparison renders cleanly.
- Step 9 (Deduplication): the repeated-key-to-posting-list merge fits inside the frame at both
  sizes.
- Step 10 (ProveIt): all three measured comparisons (truncation/normalization bytes, bulk-load vs.
  one-at-a-time page writes, dedup ratio) and their captions fit cleanly at both sizes.

Final reel check (full `check-all.mjs --changed`): locked, docs, sources, build, narration, reels
and links all pass. This is the second topic of Chapter 5 (B-Trees and Write-Optimized Trees).
