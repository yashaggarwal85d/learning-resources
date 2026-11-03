# REVIEW: Merge sort

## Pass 1 — content

- Every exact claim (the merge's own min/max comparison bounds, the top-down/bottom-up
  equal-and-different counts, the worst-case formula, the gap to the information-theoretic
  bound, stability and its one-character break, the three buffer peaks, the natural merge
  sort run counts) is checked or asserted directly in `examples.py`, not stated from memory
  of the planning values. All assertions pass (`python3 examples.py`); one bug was caught
  and fixed while writing it: `merge_unstable`'s initial comparison used the full
  `(key, tag)` tuple instead of the key alone, so Python's own tuple comparison broke the
  tie on the tag character before the intended `<=`-to-`<` change could — fixed by
  comparing only the key component in both `merge` and `merge_unstable`.
- `sources.mjs check` passes: 9/9 quotes verified, across CPython's `listsort.txt`, the
  official Oracle Java SE 21 Javadoc, and Rust's current `std::primitive::slice`
  documentation. No fetch-pipeline mangling was hit this topic — all three sources are
  either plain-text or cleanly structured HTML.
- Knuth (*TAOCP* vol. 3) and Sedgewick & Wayne stay citation-only this session, per
  `CHAPTER.md`'s own instruction; the worst-case formula and the recurrence's own bound are
  instead verified computationally (brute force for small n, `math.lgamma` for the
  information-theoretic bound at larger n), which is a stronger check than a citation alone
  would give.

## Pass 2 — looks and mechanics

- `reel.tsx`: all thirteen steps use only spelled-out numbers; no stray digit was found in
  any title or body text, including the file's own absence of a header comment with a
  chapter/milestone number (unlike two Chapter 14/15 topics earlier in this project, which
  both needed a reword for exactly this reason).
- `narration.json`: thirteen steps, written to teach the mechanism rather than read the
  screen, each kept under the fifty-word longest-line limit and the fifty-percent
  description-overlap limit.
- `coverage.json`: all four syllabus clauses are literal substrings of the syllabus scope;
  three primary sources mapped with items; a six-item independent expert list; no open
  gap-review items.
- `prerequisites.mdx`: all four linked titles (Elementary sorts and sorting networks,
  Recurrences: Master theorem and Akra–Bazzi, Lower bounds and adversary arguments, Linked
  and intrusive lists) verified against `registry.ts` by exact grep before use.
- `scenes.tsx`: every label font size at twelve units or above; takeaways placed on steps
  five and seven — not on the first non-predict step after hook+predict, following the
  lesson learned shipping earlier Chapter 14/15 topics in this project.
