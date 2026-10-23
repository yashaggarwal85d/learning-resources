## Content review, self-review, 2026-10-23

- Claims traced to sources: the size field's recurrence, the OS-SELECT algorithm, the
  recolouring/rotation fixup claim, and the four-step augmentation methodology are quoted directly
  from Charles E. Leiserson's own MIT 6.046J Lecture 11 slides (Leiserson co-authored CLRS, whose
  Chapter 14 covers exactly this material). The precise two-node rotation-fixup claim is
  independently corroborated by the University of South Carolina's csce750 lecture notes, itself
  following CLRS Chapter 14. All 10 quotes pass `sources.mjs check`.
- The general augmentation-survives-rotation rule (an augmented field survives a rotation in O(1)
  exactly when it's computable from the rotated node's new children alone) is this topic's own
  explicit generalization from both sources' specific size-and-rotation example — documented as a
  generalization, not attributed to either source as a direct quote, in `FACT-CHECK.md`.
- `examples.py` reuses topic 24's red-black tree class directly (copied verbatim, documented as
  such), augmented with a `size` field. Insert's size bookkeeping rides the same root-to-leaf walk
  insert already does; a rotation's size fixup is isolated and measured on a standalone
  `_left_rotate` call (bypassing any fixup chain) to test the two-node claim cleanly; delete's own
  size-fix uses a correctness-only full recompute rather than a partial, hand-rolled one, with that
  choice documented directly in the code rather than silently claimed as O(log n) (no claim is made
  about delete's own size-fix complexity — only insert's path-walk and a single rotation's
  two-node fixup are measured and asserted). On the identical 200-key set topic 24 used, select and
  rank queries' comparison counts never exceed the tree's actual height; an isolated rotation
  recomputes exactly two sizes.
- Gap hunt (`coverage.json` → `gapReview`): no open items. Interval trees are explicitly declined
  (skipped in the syllabus, named only as the same general rule applied elsewhere); no claim that
  this topic's own measured numbers are a universal worst case beyond what the sources state.
- Both syllabus clauses in `coverage.json` are copied word-for-word from
  `syllabus/data-structures-and-algorithms.md` line 102's §4.2 entry, split on the semicolon. 10
  expert items were written blind, from the syllabus line and the two fetched sources alone,
  meeting the ≥10-item minimum exactly after one addition (an initial draft had 9).
- `FACT-CHECK.md`'s "Claims not made" section declines re-teaching interval trees, declines
  claiming rank could be stored directly (the sources' own stated reason it can't is cited instead
  of re-derived), declines re-proving topic 24's own rotation-count bound, and declines treating
  this topic's own measurements as anything beyond one honest run.
- Narration (all 10 steps) was written as the professor's own reasoning, deliberately distinct from
  each step's on-screen description/caption. One build failure caught this on the first attempt:
  step 4's narration echoed its own body text ("the insert was already walking this exact path")
  verbatim — rewritten to make the same point from a different angle. Two narration lines for the
  predict steps (3 and 6) were also written to avoid echoing their own body/question text, applying
  the lesson proactively rather than waiting for a failure to catch it a second time. No narration
  line uses a digit or symbol.
- Two predict steps (step 3: which sizes change on insert; step 6: how many sizes a rotation
  touches) satisfy the full topic's ≥2-predict minimum, with the first at index 3 (within the
  required ≤3); both have matching `answer` arrays in `narration.json`, and both distractor sets
  are red-teamed in `FACT-CHECK.md` against the real misconceptions each mechanism invites
  (assuming a structural change this visible must disturb more than it actually does; confusing
  the insert-path update rule with the rotation-fixup rule).
- Three takeaways (steps 4, 7, 8) satisfy the three-minimum rule; all were counted and trimmed to
  at most 20 words (counting an em-dash as its own token) before any check run.
- One coverage.json / reel.tsx title-matching miss caught by the build: a reel.tsx step title used
  an escaped apostrophe (`\'`) inside a single-quoted string, which the coverage checker compared
  byte-for-byte against the unescaped text in `coverage.json` and found different. Fixed by
  switching that one title to a double-quoted string (matching the convention already used for
  other titles containing an apostrophe), rather than trying to match the escape sequence.

## Looks review, self-review, 2026-10-23

`npm run build` is clean after the fixes above. The full
`check-all.mjs --topic dsa.order-statistic-trees` run (locked, docs, sources, build, narration,
reels, links) passes, with 0 broken links.

- Step 1 (Opening): the small size-label rings beside each node stay inside the frame.
- Step 2 (SizeAugmentation): the two child-to-parent arrows and the size labels render clearly.
- Step 3 (InsertPredict) and its answer state: the highlighted insert path and the predict/answer
  text are legible at both sizes.
- Step 4 (InsertReveal): the incrementing path labels and the dimmed rest of the tree render
  without overlap.
- Step 5 (SelectWalk): the three staged comparison labels and the descending path fit the frame.
- Step 6 (RotationPredict) and its answer state: the pulsing rotated pair and the predict/answer
  text are legible at both sizes.
- Step 7 (RotationReveal): the two-node size update and the frozen third node render clearly.
- Step 8 (GeneralRule): the two labelled boxes and the crossed-out alternative fit without overlap.
- Step 9 (RankQuery): the upward climb path and its arrow render inside the frame.
- Step 10 (ProveIt): both measured bar pairs and their captions fit cleanly at both sizes.

Final reel check (full `check-all --topic dsa.order-statistic-trees`): locked, docs, sources,
build, narration, reels, and links all pass. This closes Chapter 4 (Binary Search Trees and
Balancing).
