## Content review, self-review, 2026-10-22

- Claims traced to sources: the full/empty fix (unmasked, always-increasing in/out counters, masked
  only at array access) is quoted word-for-word from the Linux kernel's `kfifo.h`; the bitwise-vs-
  division cost claim is quoted word-for-word from Agner Fog's *Optimizing software in C++*; the
  overwrite policy is quoted from Python's `collections.deque(maxlen=...)` docs; the block policy and
  backpressure framing are quoted from Rust's `std::sync::mpsc::sync_channel` docs. All 10 quotes pass
  `sources.mjs check`.
- `examples.py` backs every on-screen number with a real C microbenchmark (not a Python-level timing,
  which was tried first, found too noisy — interpreter overhead swamps the real cost difference — and
  deliberately not used): the capacity is passed in at run time so the compiler can't substitute the
  mask for modulo itself, and modulo measures consistently slower (roughly one and a half times
  masking's cost) at every capacity tried. A correctness check (masked-index ring vs a plain-list
  reference) agrees exactly across five thousand randomized pushes and pops with many wraps; the
  full/empty ambiguity is demonstrated directly (head equals tail at both the empty start and the
  full end state of a naively-masked ring); both the overwrite and block policies are demonstrated
  against their documented semantics.
- FACT-CHECK.md explicitly declines to assert that Agner Fog's historical cycle-count figures
  transfer unchanged to any specific machine, to claim this topic's single-threaded structures are
  safe under concurrent access, or to rank kfifo's own fix as superior to the two named alternatives
  it doesn't build.
- Found and fixed a real inaccuracy before it shipped: `prerequisites.mdx` and `post-notes.md`
  originally named a non-existent syllabus topic ("Lock-free queues") pulled from CHAPTER.md's own
  informal shorthand for Ch.7 — the Resource component validates reel titles against the actual
  syllabus and would have failed the build. Corrected to the syllabus's real Chapter 7/10 titles.
- Both syllabus clauses in `coverage.json` (power-of-two index masking; full/empty disambiguation;
  overwrite vs block policies; boundedness as backpressure) are copied word-for-word from
  `syllabus/data-structures-and-algorithms.md` §2.2, split on commas, matching CHAPTER.md's own
  per-clause breakdown.
- Narration was written directly in the MIT-professor persona this time (after topic 4 needed a
  rewrite pass) and validated clean on the first try: `narration-teaches.mjs` reports zero to one
  percent description overlap on every step, well under the fifty percent limit.
- Two predict steps (step 4: the next tail index after five pushes; step 8: overwrite vs block on a
  full metrics ring) both have matching `answer` arrays in narration.json.
- Four takeaways (steps 3, 6, 8, 9) satisfy the three-minimum rule, after trimming one from
  twenty-one to twenty words to pass the build's word-cap check.

## Looks review, self-review, 2026-10-22

Inspected real screenshots at desktop and phone sizes: steps 2, 4 (and its answer state), 5, 6, 7, 8
(and its answer state), 10. Reel-only Playwright check green at all ten steps, both sizes, after two
rounds of fixes.

- Step 2 (Mechanism): the sixteen-slot ring with head/tail markers and both captions render cleanly.
- Step 4 (IndexPredict) and its answer state: four answer choices legible; the answered state's ring
  (all sixteen slots filled, both markers at zero) and caption render without overlap.
- Step 5 (Ambiguity): the two-line caption, originally one long line running outside the drawing on
  phone, is now split and confirmed clean at both sizes.
- Step 6 (TheFix): both multi-line caption blocks, originally overflowing phone width, are now split
  into short lines each — confirmed clean.
- Step 7 (FullPolicy): the overwrite/block columns, originally placed side by side and overlapping on
  phone, are now stacked vertically — confirmed clean at both sizes.
- Step 8 (PolicyPredict) and its answer state: four choices legible; the answered state's ring and
  caption render cleanly.
- Step 10 (ProveIt): the masking/modulo comparison bars and captions render cleanly.

Two rounds of fixes made and confirmed this session:
1. Build-check round: one takeaway (step 9) was twenty-one words, one over the cap → trimmed to
   twenty.
2. Playwright phone-layout round: step 5's caption line ran outside the drawing; step 6's two caption
   blocks overflowed phone width; step 7's side-by-side overwrite/block columns overlapped on phone →
   all fixed in `scenes.tsx` (`Ambiguity`, `TheFix`, `FullPolicy`).

Final reel check: `Reel smoke test passed: 1 live reel(s) at desktop and phone sizes.`
