## Content review, self-review, 2026-10-23

- Claims traced to sources: the B+Tree's self-balancing/M-way/fanout definition, the fill-factor
  properties, the 1972-B-tree-vs-B+Tree distinction, the insert/split and delete/merge algorithms,
  and the clustered leaf-sibling scan pattern are quoted directly from CMU 15-445/645's own Spring
  2024 Lecture 8 slides. The sibling-link range-scan mechanism and the fanout/height formula with
  its worked trillion-key table are quoted directly from Stanford CS145's own course page. A real,
  current production system's own documentation (PostgreSQL's `nbtree` README, fetched from the
  `master` branch) independently corroborates the sibling-link claim, naming its own right-link
  mechanism directly. All 36 quote-check passes (`sources.mjs check`) pass.
- `examples.py` builds a real order-four B+Tree from scratch (insert/split, delete/borrow/merge,
  sibling-linked leaves, range scan), on the identical two-hundred-key set topics 23 through 25
  used, and measures its height directly against topic 24's own measured red-black-tree height on
  the same keys — height five vs. height thirteen. Deleting sixty of the two hundred keys forces
  both a borrow and a merge to occur (both code paths confirmed exercised, not just one). A range
  scan's I/O count is measured directly against what re-descending from the root for every
  matching key would have cost (fifteen I/Os measured vs. one hundred and five for re-descending).
  The fanout/height formula is checked arithmetically against Stanford's own worked table at a
  trillion keys (four cases) and separately against a billion keys at three realistic page/key
  sizes, all giving height three or four.
- Gap hunt (`coverage.json` → `gapReview`): no open items. Copy-on-write B-trees and the Linux
  maple tree are explicitly declined (skipped in the syllabus, named only in passing in the
  frontier section); no claim that the illustrative order-four tree reflects a real page's fanout.
- Both syllabus clauses plus the cross-domain arrow reference (`→ Data Engineering §5.1, Rust
  Systems Engineering Ch.21`) are mapped in `coverage.json`, the arrow clause pointing to the
  "In production" post-notes section per the established pattern for cross-domain references to
  topics that don't exist yet (see `CHAPTER.md` → "Notes for the release run" #4). Ten expert
  items were written blind, from the syllabus line and the two fetched sources alone.
- `FACT-CHECK.md`'s red team checked both underflow-direction code paths (left-sibling-only and
  right-sibling-only cases), the root-collapse case (the only way height decreases), and both
  predict steps' distractor options against the fill-rule logic already shown two steps earlier
  for each.
- Narration (all ten steps) was written as the professor's own reasoning, distinct from each
  step's on-screen caption/body; verified clean against the `UNSPEAKABLE` symbol/digit regex via a
  Node script before any check run, applying the lesson from prior topics' build failures
  proactively rather than waiting for one here.
- Two predict steps (step three: a leaf overflow; step five: a leaf underflow) satisfy the full
  topic's two-predict minimum, the first at index three (within the required limit of three); both
  have matching `answer` arrays in `narration.json`.
- Three takeaways (steps four, six, eight) satisfy the three-minimum rule.
- One build failure caught and fixed: step six's reel.tsx title used a single-quoted JS string
  containing an unescaped apostrophe ("parent's"), a straightforward syntax error rather than the
  escaped-apostrophe title-matching gotcha seen in earlier topics — fixed by switching that one
  title to a double-quoted string, which left the quoted text itself (and `coverage.json`'s
  matching entry) unchanged.
- One coverage gap caught and fixed by the build itself: the syllabus line's cross-domain arrow
  suffix (`→ Data Engineering §5.1, Rust Systems Engineering Ch.21`) was not initially mapped as
  its own clause — the coverage checker's full-line tokenization flagged the unmapped words
  directly, and it was added as a separate clause pointing to the "In production" section, since
  neither target topic exists yet to quote from.
- Every number in `reel.tsx`/`scenes.tsx` prose is spelled as a word (no digit characters), and no
  on-screen visual renders a literal numeral — bars and labels are drawn proportionally from
  `examples.py`'s own measured ratios, following the same convention topics 24–25 established, so
  no number-matching assertion was required beyond what `examples.py` itself already proves.

## Looks review, self-review, 2026-10-23

`npm run build` is clean after the fixes above. The full `check-all.mjs --topic dsa.b-tree-b-tree`
run (locked, docs, sources, build, narration, reels, links) passes, with zero broken links.

- Step 1 (Opening): the pointer-tree sketch and the wide disk page render without overlap at both
  sizes.
- Step 2 (BTreeShape): the three layers (root, inner, leaves) and their connecting edges stay
  legible and inside the frame.
- Step 3 (SplitPredict) and its answer state: the pulsing overfull leaf and the predict/answer
  text are legible at both sizes.
- Step 4 (SplitReveal): the before/after split frames and the promoted-key arrow render clearly,
  without the two halves overlapping.
- Step 5 (MergePredict) and its answer state: the three sibling pages (empty, full, half-full) and
  the predict/answer text fit the frame.
- Step 6 (MergeReveal): the borrow and merge halves render side by side without crowding.
- Step 7 (SiblingScan): the descent arrow and the chain of sibling-linked leaves fit inside the
  frame at both sizes.
- Step 8 (FanoutHeight): the formula text and the low-fanout/high-fanout comparison render
  cleanly.
- Step 9 (IOComparison): all three bars (pointer tree, illustrative B+Tree, realistic page) render
  without clipping.
- Step 10 (ProveIt): all three measured bar groups and their captions fit cleanly at both sizes.

Final reel check (full `check-all --topic dsa.b-tree-b-tree`): locked, docs, sources, build,
narration, reels and links all pass. This is the first topic of Chapter 5 (B-Trees and
Write-Optimized Trees).
