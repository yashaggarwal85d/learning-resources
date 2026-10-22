## Content review, self-review, 2026-10-22

- Both syllabus clauses (next-greater-element and sliding-window maximum; the enters-and-leaves-once
  invariant) are copied word-for-word from `syllabus/data-structures-and-algorithms.md` §2.2 into
  `coverage.json`, and mapped to the exact step titles used in `reel.tsx` (coverage check passes).
- Claims traced to sources: the monotonic-deque maintenance rule and its enqueue-once/dequeue-at-most-
  once complexity argument are quoted word-for-word from Sarah Zhang's TJHSST lecture notes; the
  aggregate-method framing this topic's own argument reuses is quoted word-for-word from Jeff
  Erickson's amortized-analysis lecture, already verified in full by Chapter 1's own
  "Aggregate and accounting methods" topic. Both quotes pass `sources.mjs check` (8/8).
- `examples.py` backs every on-screen number: the source's own worked example
  (`[1, 3, -1, -3, 5, 3, 6, 7]`, width three, giving `[3, 3, 5, 5, 6, 7]`) is reproduced exactly;
  push/pop totals are shown staying within twice the input size from a hundred to a hundred thousand
  elements; both techniques are checked against brute force on random and adversarial inputs.
- FACT-CHECK.md explicitly declines to attribute the monotonic-stack/deque technique's invention or
  origin to anyone — the TJHSST notes are cited only as a current, citable treatment, matching the
  project's "no guessing or naming unverified facts" rule, since a web search found no clear original
  source.
- Declares `aggregate-method` (already introduced by Chapter 1 topic 5); `introduces` monotonic-stack,
  next-greater-element, monotonic-deque, sliding-window-maximum, invariant-based-amortization; `uses`
  stack, deque, lifo, fifo, amortized-cost, aggregate-method — concept ledger order-checks clean
  against topic 3 (stack/deque) and Chapter 1 (amortized-cost, aggregate-method).
- Bridge and handoff connect cleanly to `stacks-queues-deques` (previous, same bridge text) and
  foreshadow `ring-buffers-bounded-queues` (next) without naming it by name in the reel body.
- Narration was rewritten after the first automated pass flagged six steps as reading the description
  verbatim (`narration-teaches.mjs`); the rewrite uses the MIT-professor persona (reasons before rules,
  directs attention to what the scene actually draws, names the wrong intuition on the naive scan,
  ties steps together) and now shows zero to two percent description overlap on every step, well under
  the fifty percent limit.
- Two predict steps (step 4: stack contents before six is pushed; step 8: deque contents once the
  window reaches the source's own worked window) both have matching `answer` arrays in narration.json.
- Four takeaways (steps 4, 5, 7, 9) satisfy the three-minimum rule.

## Looks review, self-review, 2026-10-22

Inspected real screenshots at desktop and phone sizes: steps 2, 4 (and its answer state), 7, 8 (and
its answer state), 9, 10. Reel-only Playwright check green at all ten steps, both sizes, after two
rounds of fixes.

- Step 2 (Problem): the decreasing-bar row and the two caption lines render clearly, no overlap.
- Step 4 (StackPredict) and its answer state: four answer choices legible; the answer state's two
  captions ("3 already popped — found its answer: 4" and "5, 4, 2 still waiting, bottom to top") sit
  clear of the bars.
- Step 7 (MonotonicDeque): the front/back labels, originally placed side by side and overlapping both
  at desktop and on phone width, are now stacked as two separate lines — confirmed clean at both sizes.
- Step 8 (DequePredict) and its answer state: four choices legible; the single surviving bar and its
  caption render without overlap.
- Step 9 (Compared): the two-column row notes, originally one long line each and overflowing phone
  width, are now split across two short lines per row — confirmed clean at both sizes, including the
  phone screenshot where "Chapter 1" / "This chapter" and their two-line notes stack correctly.
- Step 10 (ProveIt): both comparison bars and their captions render cleanly.

Two rounds of fixes made and confirmed this session:
1. Build-check round: `coverage.json`'s syllabus clauses didn't match the syllabus line word for word
   (abbreviated from CHAPTER.md's scope summary instead), and the expert list had only seven items
   (below the ten-minimum) → fixed both; also rewrote all ten narration steps after the automated
   description-overlap check flagged six of them.
2. Playwright phone-layout round: step 7's front/back labels overlapped (desktop) and ran outside the
   drawing (phone); step 9's two long row-note lines overflowed phone width → both fixed in
   `scenes.tsx`'s `MonotonicDeque` and `Compared`.

Final reel check: `Reel smoke test passed: 1 live reel(s) at desktop and phone sizes.`
