# Review — dsa.reservoir-sampling

## Content review

- Every quote in `SOURCES.md` checked word for word against the fetched text
  (`node scripts/sources.mjs check`): 18/18 pass, after two rounds of fixing quotes that
  crossed a `//`/`*` comment-marker line break in the Spark source files (see the project's
  check-all gotchas memory — `norm()` collapses newlines but not comment markers).
- Every claim in `FACT-CHECK.md` confirmed against a fetched primary source or against direct
  computation in `examples.py`.
- `examples.py` runs clean: the n=10/k=3 inclusion frequencies, the million-item Algorithm
  R-vs-L comparison, the weighted example (checked two independent ways — simulation and the
  invalid-probability arithmetic argument), and the two-reservoir merge — all `assert`
  statements passing.
- `coverage.json`'s five syllabus clauses are literal substrings of the real syllabus scope
  line (`syllabus/data-structures-and-algorithms.md` line 476), including the trailing
  cross-reference arrow, mapped to the actual Data Engineering topic it names (via `{topic,
  domain, quote}`, since that domain's own matching topic is itself marked skipped there). 15
  `expert.items` entries.
- The one deliberate content deviation — naming the Efraimidis–Spirakis algorithm "A-ES" per
  the one source actually fetched for it, instead of the chapter plan's unconfirmed
  "A-Res"/"A-ExpJ" — is recorded in three places (`SOURCES.md`, `OUTLINE.md`'s "Changes from
  the chapter plan", `FACT-CHECK.md`'s red team) so it cannot be missed at a later audit.

## Looks review

Pending: reel smoke test (`tests/reels.mjs`) to be run after this review, same as the ship
sequence for every other topic in this chapter.

## Changes from the chapter plan

Recorded in `OUTLINE.md`: the Efraimidis–Spirakis algorithm's name. No other deviation.
