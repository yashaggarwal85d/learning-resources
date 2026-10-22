## Content review, self-review, 2026-10-22

- Claims traced to sources: stack/queue/deque semantics and the iterator-vs-reference invalidation
  split are cited to N4868 `[deque]`; the "growable ring buffer" self-description is cited to Rust's
  `VecDeque` docs. Both quotes verified word-for-word by `scripts/sources.mjs check`.
- The two real designs (ring buffer vs chunked blocks) are presented as a genuine trade-off, not a
  "one is better" claim — resize cost vs iterator stability, matching what the sources actually say.
- `examples.py` backs every on-screen number with a real `collections.deque` timing comparison and a
  `list.pop(0)` shift-count demonstration (9 shifts at n=10, ~9999 at n=10,000) — no invented numbers.
- Declares `stacks` (first topic to introduce the term formally as a concept, after informal use in
  Chapter 1); `introduces` lifo/fifo/stack/queue/deque/chunked-deque; `uses` contiguous-storage,
  pointer-invalidation, singly/doubly-linked-list from prior topics — concept ledger order-checks clean.
- Bridge and handoff connect cleanly to `dynamic-arrays-growth-policy` / `linked-intrusive-lists`
  (previous) and foreshadow the next topic (a structure whose own shape proves a second bound without
  resizing for it) without naming it, per house style.
- Two predict steps (step 4: one structure or two; step 7: iterator vs reference survival) both have
  matching `answer` arrays in narration.json.
- 4 takeaways (steps 4, 6, 7, plus implicit verdict framing) satisfy the 3-minimum rule.

## Looks review, self-review, 2026-10-22

Inspected screenshots at both desktop and phone sizes across all 9 steps (01, 04, 04-q, 06, 07-q, 08,
09 read directly; reel-only Playwright check green at all 9 steps for both sizes).

- Step 1 (Opening): row of 6 cells with the "which end may you touch?" question, clean at desktop.
- Step 4 (DequePredict) and its answer state: push/pop labels at both ends, four answer choices legible,
  answer state replaces the question with the resolved one-structure claim.
- Step 6 (TwoDesigns): ring buffer row and chunked-block row both clear, with the highlighted "new
  block" rect distinct from the other three.
- Step 7 (InvalidatePredict) and its answer state: iterator/reference labels positioned without
  overlapping the four answer choices.
- Step 8 (Verdict) and Step 9 (ProveIt): both previously-fixed two-line phone captions ("ring buffer vs
  chunked blocks: / resize cost vs iterator stability" and "O(1) at both ends is a real, measured
  property, / not just a label") now render correctly on separate lines with no clipping or overflow.

Two rounds of fixes made and confirmed this session:
1. Build-check round: `narration.json` step 6 had a forbidden `+` symbol ("C++'s" → "C plus plus's");
   `pre-notes.md` had only 3 term bullets (below the 4-minimum) → added Reallocation and Contiguous
   storage to reach 5.
2. Playwright phone-layout round: steps 8 and 9 each had one long caption line running outside the
   drawing on phone width → split each into two shorter lines in `scenes.tsx`'s `Verdict` and `ProveIt`.

Final reel check: `Reel smoke test passed: 1 live reel(s) at desktop and phone sizes.`
