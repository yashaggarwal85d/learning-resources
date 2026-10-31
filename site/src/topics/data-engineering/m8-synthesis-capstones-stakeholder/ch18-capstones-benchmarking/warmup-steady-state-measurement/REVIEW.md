# Review — de.warmup-steady-state-measurement

## Content review (self-review, 2026-10-30)

- Every syllabus clause maps to a step (coverage.json): the five warm-up causes, by name (Reveal:
  why the first minutes lie); cold page cache/buffer pool, reproduced directly (Reveal: cold page
  cache and buffer pool, reproduced); detecting steady state and run length (Reveal: detecting
  steady state); repeated trials with confidence intervals (Reveal: repeated trials and confidence
  intervals); cold-cache/hot-cache as two separate results (Reveal: cold-cache and hot-cache as two
  honest numbers).
- Sourcing: PostgreSQL's and RocksDB's own documentation fetched cleanly once the correct URL form
  was used for RocksDB (GitHub's own rendered wiki page 403s in this sandbox — the same recurring,
  domain-wide GitHub-web limitation seen on earlier topics; its `raw.githubusercontent.com/wiki/...`
  source fetched clean). The Georges et al. (OOPSLA 2007) paper needed a research subagent to find
  a working, non-paywalled, author-hosted PDF after a direct guess 404'd; two of its three quotes
  needed adjusting around PDF-extraction artifacts (a footnote marker fused onto "(CoV)" with no
  space; a stray superscript-summation character injected into a later, line-wrapped sentence) —
  both documented in FACT-CHECK.md's Problem Solving section.
- This topic's lab is a real measurement, not a simulated number dressed up as one: `examples.py`
  restarts this sandbox's actual Postgres cluster, measures the shop's order-lookup query's
  wall-clock latency immediately after, runs a sliding-window steady-state detector adapted from
  the paper's own coefficient-of-variation convention, repeats the whole procedure five times
  (each its own fresh restart) for a reported confidence interval, and runs a second, separate
  experiment (a heavy aggregate query's first run vs. five warm repeats) to isolate the "empty
  result caches" cause from the per-request cold-start cause. All five assertions (steady state
  detected, cold slower than hot, cold-cache number separately reported and slower than the
  confidence-interval mean, first aggregate run slower than its warm repeats) passed on three
  separate runs with naturally varying absolute numbers, consistent with measuring a real, shared
  sandbox instance rather than a fixed, memorized result.
- The reel's engagement arc holds: one predict (step 2) plus the closing "Prove it," no takeaway
  on step 3 (the reel test's reference step, "Reveal: why the first minutes lie"), takeaways on
  steps 4, 5, 6, 7.
- Narration (verified via `narration-teaches.mjs`): passed clean on the first full draft once an
  empty `answer` array left over from an early draft (on step 4, which has no predict question)
  was removed — the checker flags an answer clip on a non-predict step. No digits, symbols or code
  names anywhere in `narration.json`; every number in the lab is spoken in words in the narration's
  own prose, never as a digit.
- Takeaways: all four checked and kept at or under the 20-word limit, counting the em dash in
  step 4's takeaway as its own word (it lands at exactly 20).
- Bridge quotes Chapter 17's own closing handoff verbatim, per CHAPTER.md's "Assumption about the
  previous chapter"; handoff opens into topic 2's exact subject (percentiles and histogram
  aggregation) as planned.

## Looks review (self-review, 2026-10-30)

Checked via the topic-scoped reel smoke test (`tests/reels.mjs`) at desktop and phone sizes.

- First and only run passed cleanly at both sizes with no overflow issues on any of the nine
  scenes.

Final `node scripts/check-all.mjs --only reels --topic warmup-steady-state-measurement` run:
`test:reels` passed ("Reel smoke test passed: 1 live reel(s) at desktop and phone sizes").
`test:editor` still fails with "a save did not open a new GitHub issue" — the same known,
pre-existing, topic-independent Playwright/Chromium sandbox limitation documented on every prior
topic's REVIEW.md in this domain, not caused by this topic and not a shipping blocker.

A build-time check (`npm run build`'s `checkTopicFiles`) initially flagged the literal number
"18" appearing in a `reel.tsx` source comment ("Opens Chapter 18 on..."), since every number in
`reel.tsx` is checked against what `examples.py` actually computes or asserts. Fixed by rewording
the comment to "Opens this chapter on..." — no on-screen text was affected, only a code comment.
