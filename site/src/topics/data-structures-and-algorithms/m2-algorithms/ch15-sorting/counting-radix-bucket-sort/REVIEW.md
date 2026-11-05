# REVIEW: Counting, radix and bucket sort

## Pass 1 — content

- Every exact claim (counting sort's move count and stability, LSD radix sort's pass and
  move counts, American flag sort's swap count and instability, DuckDB's byte-encoding row
  order, the IEEE 754 float flip's order preservation, the crossover's move and comparison
  counts, and the bucket-sort empty fraction) is computed or asserted directly in
  `examples.py`, with literal `assert` statements pinning exact figures, not inequalities.
  All assertions pass (`python3 examples.py`). The bucket-sort simulation reproduces
  `CHAPTER.md`'s own planning value (largest bucket 8, 36.7% empty against a predicted
  e^-1 = 36.8%) almost exactly on this topic's own seed.
- `sources.mjs check` passes: 18/18 quotes verified on the first attempt, across DuckDB's
  2021 post, its own 2023 ICDE follow-up paper (found by following the post's own link, its
  title and authors confirmed by reading the paper's own title page), McIlroy, Bostic &
  McIlroy's 1993 paper (found via a background research agent after its full text turned
  out to be openly archived on USENIX's own static server), Sedgewick & Wayne's own
  booksite (used as an independent second confirmation of American flag sort's name and
  mechanism, since the 1993 paper's own PDF code listings are too OCR-damaged to quote), and
  Herf's "Radix Tricks" page for the IEEE 754 bit-flip transform.
- CLRS's bucket-sort lemma, Graefe's 2006 survey, and Knuth's TAOCP vol. 3 section 5.2.5
  stay citation-only, per `CHAPTER.md`'s own "to verify"/"not opened" framing; no claim in
  `FACT-CHECK.md`'s claims table rests on any of them. The IEEE 754 standard itself is
  paywalled and not opened; the bit-flip rule is instead cited from a widely reproduced
  technical page, corroborated by a second independent source read at research time.

## Pass 2 — looks and mechanics

- `reel.tsx`: thirteen steps, two predict steps (each with an `answer`/explanation), three
  takeaways (American flag sort, the byte-encoding-enables-radix step, and bucket sort —
  none immediately after a predict step, per this project's own logged gotcha). The bridge
  is word for word topic 52's own shipped handoff text.
- The build's own coverage check caught a real character mismatch: two step titles used a
  Unicode curly apostrophe while `coverage.json`'s matching `step` references used a plain
  ASCII apostrophe, so the coverage check reported those steps as entirely missing from
  `reel.tsx`. Fixed by making every apostrophe in `reel.tsx` plain ASCII, consistent with
  `coverage.json`.
- The build's own number-literalness check caught two real gaps: the crossover step's
  "about 718,000" comparisons had no literal match (the real figure, 718,346, is exact on
  this seed), and the bucket-sort percentages (36.7%, 36.8%) had no literal digit backing
  them (only the underlying ratio, computed via division). Fixed by stating the exact
  comparison figure in the reel and adding literal `assert` statements for both the exact
  comparison count and the rounded percentages.
- A takeaway (bucket sort's) was 23 words, over this project's 20-word limit; shortened to
  18 words.
- `narration.json`: thirteen steps, written to teach the mechanism rather than read the
  screen (confirmed with a self-run `readsTheScreen` check before any build run — no
  violations), every number spelled out in words, with `answer` present on both predict
  steps, no line over 50 words (confirmed with a self-run word-count check before any build
  run).
- `coverage.json`: all four syllabus clauses (LSD vs MSD radix sort; American-flag in-place
  MSD; key normalization to byte strings; the Theta(n w / log n) crossover, which also
  carries bucket sort) are literal substrings of the syllabus scope; five primary-source
  citations mapped with items; a ten-item independent expert list; no open gap-review items.
- `prerequisites.mdx`: all linked titles (Elementary sorts and sorting networks, Quicksort
  and partitioning schemes, The word-RAM model and its assumptions, Lower bounds and
  adversary arguments, External merge sort) verified against `syllabus/data-structures-and-
  algorithms.md` by exact grep before use — including a forward reference to topic 54
  ("External merge sort"), which is not yet built or registered but is a real syllabus
  title, the same pattern topic 51 used for topic 52 before it existed.
- `scenes.tsx`: every on-screen caption kept to a few words from the first draft, following
  this project's own logged overflow gotcha, rather than writing full sentences and fixing
  them after a failed Playwright pass.
- `node scripts/check-all.mjs --skip reels,links --topic .../counting-radix-bucket-sort`:
  locked, docs, sources, build and narration all pass outright on the second run (the first
  run's real failures — the apostrophe mismatch and the two un-asserted/imprecise numbers —
  are listed above, fixed, and reconfirmed). `node scripts/check-all.mjs --only reels
  --topic .../counting-radix-bucket-sort`: `test:reels` passes outright on the first attempt
  ("Reel smoke test passed: 1 live reel(s) at desktop and phone sizes"); the unrelated
  `test:editor` sub-check still fails with its own documented, sandbox-only limitation
  (confirmed by multiple prior threads on a clean, unmodified `main`), which is why the
  combined check reports FAIL despite the actual reel test passing.
