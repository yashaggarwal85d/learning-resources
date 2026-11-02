# Review — de.latency-percentiles-histogram-aggregation

## Content review (self-review, 2026-10-30)

- Every syllabus clause maps to a step (coverage.json): why means hide tails (Reveal: why means
  hide tails); the full percentile ladder (Reveal: the percentile ladder, p50 through max);
  merging histograms instead of averaging percentiles (Reveal: merging histograms instead of
  averaging percentiles); fan-out tail amplification (Reveal: fan-out tail amplification).
- Sourcing: HdrHistogram's and wrk2's own raw GitHub READMEs fetched cleanly on the first try.
  Dean & Barroso's "The Tail at Scale" needed a research subagent after two direct guesses failed
  (a CACM page bot-blocked; Google's own research-publication page a JS-rendered SPA with no
  working embedded PDF link); the agent found a working, author-hosted copy on Luiz Barroso's own
  site. One quoted passage's continuation crosses a PDF page break with a garbled running-header
  artifact; the SOURCES.md quote was trimmed to end just before that break rather than quoting
  through it, documented in FACT-CHECK.md's Problem Solving section.
- **CHAPTER.md self-correction:** this topic's own planning entry (and OUTLINE.md) initially
  claimed Chapter 5's §5.6 quantile-sketch material (`quantile-sketches-t-digest`) was already
  live and cited it by id. Cross-checking `registry.ts` directly (per QUALITY.md's "never guess a
  fact" discipline) found Chapter 5 currently only reaches §5.3 live — §5.5–§5.6 are not live, as
  CHAPTER.md's own "Cross-chapter ids" section already correctly stated elsewhere. Fixed in
  CHAPTER.md, OUTLINE.md and this topic's registry entry: t-digest/DDSketch are now named in prose
  only, with no `uses` id, matching the chapter's own documented cross-chapter-id discipline.
- This topic's lab is real measurement, not a simulated number: `examples.py` runs five hundred
  real order-lookup requests with an injected stall (mean-vs-tail), two genuinely different real
  query shapes as a two-hosts stand-in (histogram merge), a Monte Carlo simulation checked against
  both a first-principles derivation and the paper's own cited figure (fan-out), and the chapter
  lab's closed-loop-vs-constant-rate generator comparison against the identical request sequence
  with the identical injected stall. All assertions passed on three separate runs with naturally
  varying absolute numbers; the closed-loop/constant-rate p99 gap was dramatic on every run
  (closed-loop stayed under four milliseconds; constant-rate landed near the full two-second
  stall), consistent with measuring a real mechanism rather than a tuned, fragile threshold.
- The reel's engagement arc holds: one predict (step 2) plus the closing "Prove it," no takeaway
  on step 3 (the reel test's reference step, "Reveal: why means hide tails"), takeaways on steps
  4, 5, 6, 7 (four takeaways).
- Narration (verified via `narration-teaches.mjs`): passed clean on the first full draft. No
  digits, symbols or code names anywhere in `narration.json` — every number (ten hosts, five
  milliseconds, a hundred shards) is spoken in words.
- Takeaways: all four checked and kept at or under the twenty-word limit, counting the em dash in
  steps 6 and 7's takeaways as its own word (both land at exactly twenty).
- Bridge answers topic 1's handoff verbatim per CHAPTER.md; handoff opens into topic 3's exact
  subject (representative data and workload skew) as planned.

## Looks review (self-review, 2026-10-30)

Checked via the topic-scoped reel smoke test (`tests/reels.mjs`) at desktop and phone sizes.

- First run failed on phone: step 4's percentile-ladder scene had one row's caption ("p ninety
  nine point nine — rare, only visible at volume") running past the drawing's right edge at
  phone's larger text scale.
- Fixed by shortening every row in that scene's list to a tighter phrase (e.g. "rare" instead of
  "rare, only visible at volume"), keeping the same five-point structure.
- Second run passed cleanly at both sizes with no further issues.

Final `node scripts/check-all.mjs --only reels --topic latency-percentiles-histogram-aggregation`
run: `test:reels` passed ("Reel smoke test passed: 1 live reel(s) at desktop and phone sizes").
`test:editor` still fails with "a save did not open a new GitHub issue" — the same known,
pre-existing, topic-independent Playwright/Chromium sandbox limitation documented on every prior
topic's REVIEW.md in this domain, not caused by this topic and not a shipping blocker.

A build-time coverage check also initially failed: two `coverage.json` items pointed at a reel
step title using a curly apostrophe ("lab’s stall") while `reel.tsx`'s actual title used a plain
one after an edit — fixed by making `reel.tsx`'s title a plain, double-quoted string with a
straight apostrophe, matching `coverage.json` exactly.
