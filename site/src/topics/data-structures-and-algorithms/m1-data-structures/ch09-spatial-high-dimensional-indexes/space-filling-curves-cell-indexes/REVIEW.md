## Content review, self-review, 2026-10-24

- Claims traced to sources: Z-order/Morton bit-interleaving and its locality-preservation-with-high-probability, Hilbert's recursive construction and its "fairly well"/"better locality-preserving behavior" advantage over Z-order, geohash's direct Z-order relationship and base-32 encoding, S2's six-Hilbert-curves-on-a-cube construction, and H3's hexagon-neighbour-equidistance rationale are all quoted directly from their own sources (Wikipedia for Z-order/Hilbert/geohash, the official S2Geometry developer guide, and H3's own official docs). All 23 quote-check passes (`sources.mjs check`) pass.
- `examples.py` builds real row-major, Morton (bit-interleave), and Hilbert (standard recursive `xy2d`) orderings over an 8x8 grid, verifies all three are real bijections onto every one of the 64 cells, and hand-checks `morton_code(3, 5) == 39`.
- **Honest finding, not assumed (the key methodology decision this topic made)**: an early draft picked a flattering diagonal near-neighbour pair with guessed, unverified distances. Running the real numbers across every adjacent pair on the grid showed Z-order's average distance ties row-major's at this scale — the dramatic locality advantage only shows up at specific quadrant-boundary crossings, not everywhere. The three near-neighbour pairs actually measured (origin, horizontal boundary, vertical boundary) were chosen by inspecting each pair's own binary coordinates for a shared high-bit flip, not by searching after computing for whichever pair looked best. The result at the origin pair — where Hilbert is *not* the smallest of the three orderings — is reported honestly in `OUTLINE.md`'s "Claims not made," `FACT-CHECK.md`'s red team, `post-notes.md`, and the reel's own final takeaway, rather than suppressed.
- Gap hunt (`coverage.json` → `gapReview`): no open items. k-d trees, quadtrees/octrees, R-trees, and the two approximate-nearest-neighbour families are named only as the skipped alternative, per the chapter plan's own skip list; Delta Lake's ZORDER BY and liquid clustering are named only as the Data Engineering cross-link, not rebuilt; BIGMIN/LITMAX range-search machinery is named from the source's own caveat but not built, since this topic's scope is the ordering and its measured locality, not range-query machinery on top of it.
- The syllabus clause (Z-order/Hilbert, geohash/S2/H3, and the Delta Lake cross-link) is mapped in `coverage.json` against three reel steps; all five source groups are mapped to the specific claims they support. Ten expert items were written from the syllabus line and the five fetched sources.
- `FACT-CHECK.md`'s red team specifically checked the origin-pair honesty (confirming Hilbert isn't claimed as universally best), verified the boundary-crossing pairs by binary-coordinate inspection rather than post-hoc cherry-picking, verified the Hilbert `xy2d` construction structurally (as a full bijection) since no source reproduced its own code as extractable text, and checked both predict-step distractors.
- Narration (all nine steps) was written as the professor's own reasoning, distinct from each step's on-screen caption/body, and verified clean with `scripts/narration-teaches.mjs`: no description-verbatim overlap above 15% on any step, no line over the fifty-word limit (one fix needed on step 8, from 56 to 45 words).
- Two predict steps (step 3: does bit-interleaving fix row-major's locality problem everywhere; step 6: can a recursively built curve avoid Z-order's own boundary jump), both within the first six steps, both with matching `answer` arrays in `narration.json`.
- Three takeaways (steps 4, 7, 9) satisfy the three-minimum rule; step 2 deliberately carries none, per the established phone-swipe-check gotcha.
- This topic opens with topic 34's own handoff (Fenwick/segment trees → space-filling curves) as its bridge, quoted word for word in `OUTLINE.md`, `reel.tsx`'s Opening title, and `registry.ts`'s `bridge` field (fetched directly from topic 34's own open branch). It closes Chapter 9's first and only built topic, handing off to Chapter 10 (graph representations): "Adjacency lists, matrices and edge lists, next."

## Looks review, self-review, 2026-10-24

`npm run build` is clean. `node scripts/sources.mjs check`, `python3 examples.py`,
`node scripts/narration-teaches.mjs`, and `node scripts/check-all.mjs --only reels --topic
data-structures-and-algorithms/m1-data-structures/ch09-spatial-high-dimensional-indexes/space-filling-curves-cell-indexes`
all pass, with the reel smoke test confirming zero live-reel regressions (the topic ships
`held`, as every new topic does).

- Step 1 (Opening): the two highlighted neighbouring cells and the question caption render without overlap at both sizes.
- Step 2 (NaiveReveal): the row-major numbering with the vertically adjacent pair circled is legible at both sizes.
- Step 3 (ZOrderPredict) and its answer state: the pulsing cell and the predict/answer text render cleanly.
- Step 4 (ZOrderReveal): the Z-order path traced cell by cell fits the frame without crowding.
- Step 5 (BoundaryReveal): the tight in-quadrant pair beside the large boundary-crossing pair is clearly distinguished at both sizes.
- Step 6 (HilbertPredict) and its answer state: the boundary pair and the sketched Hilbert turn render cleanly.
- Step 7 (HilbertReveal): the Hilbert path traced beside Z-order's own (dimmed) path is legible without overlap.
- Step 8 (CellIndexReveal): the three production-system panels (geohash, S2, H3) and their captions fit cleanly at both sizes.
- Step 9 (ProveIt): the three grouped bars (one per measured pair, three orderings each) and their captions fit without overlap, with visibly different widths matching the real measured gaps — including the honest origin-pair exception.

A first `--only reels` run surfaced nine phone-width caption overflows ("runs outside the drawing")
across steps 1, 2, 4, 5, 6, 7, 8, 9 — captions near x=30-40 in the 600-unit viewBox at font size 13
need to stay under roughly 50-55 characters on phone's scaled text. All nine were shortened (meaning
preserved; detail that's already stated fully in `reel.tsx`'s own title text was not repeated in the
drawing caption) and re-verified; one shortened caption still overflowed on the second pass and was
cut further on a third pass, which passed clean.

Final reel check (`npm run build`, `sources.mjs check`, `check-all.mjs --only reels`): all pass.
This is Chapter 9's first and only built topic (the remainder of §9.1 and all of §9.2 are skipped
per the chapter plan), closing the chapter.
