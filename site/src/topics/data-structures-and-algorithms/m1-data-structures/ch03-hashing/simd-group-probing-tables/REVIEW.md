## Content review, self-review, 2026-10-23

- Claims traced to sources: the H1/H2 hash split, the one-control-byte-per-slot layout, and the
  "winnow 16 candidates" SIMD-compare claim are quoted directly from Abseil's own design notes.
  Go 1.24's adoption, its own 8-slot group width, and the shared load-factor payoff are quoted from
  the Go Blog's current, dated post. Rust's standard library `HashMap`'s adoption (via `hashbrown`,
  since Rust 1.36) and its memory-overhead payoff are quoted from the crate's own current README.
  All 14 quotes pass `sources.mjs check`.
- A deliberate, honest distinction was made and recorded rather than smoothed over: the syllabus's
  own wording ("matching 16 slots per SIMD instruction") names Abseil's original group width. Go's
  own blog post, fetched and dated at research time, is explicit that Go uses groups of 8, not 16.
  This topic names both real widths as sharing one mechanism at two different sizes, rather than
  treating "16" as a universal constant of "the Swiss Table design" — `FACT-CHECK.md` row 6 and
  `post-notes.md`'s internals section both name this explicitly, the same honesty pattern as topics
  16–18's own corrections.
- A second, independent correction was caught and fixed while writing `examples.py`, not asserted
  away: the first draft's false-positive-rate check assumed a flat 1-in-128 chance "per group
  probed." Running the script surfaced that a false positive is actually forced once per *occupied
  slot* a miss lookup has to check, not once per group — at this table's load factor (α = 0.5, ~8
  occupied slots per group on average), the correct theoretical expectation is roughly 8/128 ≈
  0.0625, exactly where the measured rate (0.0616 over 20,000 trials) lands. The script's own
  theoretical calculation was fixed to multiply by the expected occupied-slot count; the assertion
  was not loosened to force a pass. A dead line (`random.seed20261023 = None`, leftover scaffolding
  with no effect) was also removed. A dedicated worst-case demo (a nearly full single group) was
  added to honestly show the real GROUP_SIZE-times asymmetry that the average-case measurement
  alone doesn't surface, since insertion order puts most matches early in a half-full group.
- Gap hunt (`coverage.json` → `gapReview`): two real gaps found and consciously scoped out, both
  recorded with reasons — the full resizing/growth mechanics of a Swiss Table are this chapter's own
  topic 20, not built here; Robin Hood hashing and cuckoo hashing are named with no mechanism,
  matching the syllabus's own skip for this chapter.
- Both syllabus clauses in `coverage.json` are copied word-for-word from
  `syllabus/data-structures-and-algorithms.md` line 81, with backticks stripped to match the site's
  own markdown-cleaning before comparison. 11 expert items were written blind, from the syllabus
  line and the three fetched sources alone, satisfying the ≥10-item minimum from the first draft
  this time (learned from topic 18's build failure).
- `FACT-CHECK.md`'s "Claims not made" section explicitly declines to claim this topic's from-scratch
  table matches any real production implementation's benchmarked performance, declines to claim
  Abseil's and Go's group widths are identical beyond sharing the same mechanism, and declines to
  claim anything about the full resizing mechanics beyond naming topic 20.
- Narration was written directly in the MIT-professor persona and checked against
  `narration-teaches.mjs`'s description-overlap rule (clean at every step).
- The build's own topic-file checks caught two classes of real problems before this was ready to
  ship: a `coverage.json` clause copied with backticks still in it (`` `flat_hash_map` ``, `` `
  hashbrown` ``) failed the literal-substring check against the site's own backtick-stripped
  syllabus text — fixed by stripping backticks from the clauses themselves; and several narration
  lines used bare digits and symbols (H1/H2, C++, version numbers 1.36/1.24) that the speakable-line
  check rejects — fixed by spelling every number and symbol the way it's said ("H one," "H two," "C
  plus plus," "twenty seventeen," "a version released years back"), and by dropping on-screen
  version numbers from `reel.tsx` entirely rather than adding them to `examples.py` as if they were
  computed values — they're historical facts, not measurements this topic makes. Two bare
  cross-topic references ("topic 17," "topic 18") in `reel.tsx`'s body text were also removed,
  matching the project's established "last topic," not "topic N," convention.
- This topic needed its engagement-arc plan revised once, before the reel was built: `OUTLINE.md`'s
  first draft planned only one predict step, which satisfies a refresher but not a `kind: 'full'`
  topic's two-predict minimum. A second predict step (the fingerprint's own false-match odds) was
  added before `reel.tsx` was written, avoiding a repeat of topic 18's exact build-failure pattern
  from a predict step added only after the reel already existed.
- Two predict steps (step 3: how many slots does one SIMD compare test; step 6: what are the odds of
  a false fingerprint match) both have matching `answer` arrays in `narration.json`; both distractor
  sets are red-teamed in `FACT-CHECK.md` against the real misconceptions each mechanism invites.
- Three takeaways (steps 5, 7, 8) satisfy the three-minimum rule, each under the 20-word limit.
- Every number shown on screen (step 9/ProveIt's labels) was checked against `examples.py`'s own
  printed output before being written into `scenes.tsx`.

## Looks review, self-review, 2026-10-23

`npm run build` and `PREVIEW_HELD=1 npm run build` are both clean. The reel smoke test
(`PREVIEW_HELD=1 node tests/reels.mjs ... simd-group-probing-tables`, run against a built, served
preview) passed on the first attempt, desktop and phone, with no fixes needed this time.

- Step 1 (Opening): the dissolving probe-sequence cells and the appearing group-compare cells
  render clear of each other at both sizes.
- Step 2 (ForcingProblem): the chain's fading pointer-and-node markers and the cache-miss-heavy
  probe row stay inside the frame.
- Step 3 (GroupPredictViz) and its answer state: the sixteen-cell group row and the predict/answer
  text are both legible at both sizes.
- Step 4 (H1H2Split): the single hash value and its two labeled, proportionally-sized splits fit
  cleanly.
- Step 5 (GroupMatch): the sixteen-lane sweep, with one lane kept lit and the rest fading, renders
  without overlap.
- Step 6 (FingerprintPredictViz) and its answer state: the two fingerprint-byte blocks and the
  predict/answer text are legible at both sizes.
- Step 7 (FingerprintOdds): the twenty-cell false-match strip and the three-line closing caption fit
  the frame.
- Step 8 (ThreeAdopters): the three staggered-fade-in adopter labels render in order without
  overlapping.
- Step 9 (ProveIt): the adopter recap bar and the packed-group vectorized-vs-naive comparison bars,
  plus their labels, fit the frame at both sizes.

Final reel check (full `check-all --topic dsa.simd-group-probing-tables`): locked, docs, sources,
build, narration, reels, and links all pass.
