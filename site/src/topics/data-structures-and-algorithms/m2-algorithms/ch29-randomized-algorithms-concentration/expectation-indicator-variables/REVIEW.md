# Review — dsa.expectation-indicator-variables

## Content review

- Every quote in `SOURCES.md` checked word for word against the fetched text
  (`node scripts/sources.mjs check`): 27/27 pass.
- Every claim in `FACT-CHECK.md` confirmed against a fetched primary source or against direct
  computation in `examples.py`; the one claim needing agreement with a live topic
  (`dsa.asymptotic-notation`'s recurrence-based 2(n+1)Hₙ − 4n) is checked by grep against that
  topic's own `post-notes.md`.
- `examples.py` runs clean: quicksort's exact expectation at three sizes, a 200-run simulation,
  the coupon collector's exact expectation at three sizes and a 2,000-run simulation, the
  fixed-point expectation's 20,000-shuffle simulation (and Sattolo's zero-fixed-point
  20,000-run check), and the urn example's exact match between linearity and exhaustive
  enumeration — eleven `assert` statements, all passing.
- `coverage.json`'s four syllabus clauses ("linearity of expectation", "indicators", "expected
  comparisons in randomized quicksort", "the coupon collector") are literal substrings of the
  real syllabus scope line, copied from `syllabus/data-structures-and-algorithms.md` line 468,
  not from `CHAPTER.md`'s own transcription. 15 `expert.items` entries (above the 10 minimum).
- No apostrophe-style mismatch risk: the two titles using a possessive ("event's probability",
  "the algorithm's own recursive structure") were typed once in `reel.tsx` and the identical
  curly-apostrophe string was then copied into `coverage.json`'s matching `step` fields, not
  retyped — avoiding the topic-53/topic-94 class of bug.

## Looks review

- Reel smoke test (`tests/reels.mjs`) passed at desktop and phone sizes on the first run — no
  text-overlap, overflow, or font-size failures. The one predict step (step 2) and the three
  takeaway steps (5, 9, 10) render correctly; no takeaway sits on step 4, the step immediately
  after the step-3 reveal of the linearity property, as the project's phone-caption-swipe
  constraint requires.
- `test:editor`'s failure is the known pre-existing sandbox limitation (a Playwright popup
  event that never fires in this container), unrelated to this topic's own content — confirmed
  against team memory and by the fact that it fails identically on an unmodified topic.

## Changes from the chapter plan

None beyond the source substitution already recorded in `OUTLINE.md` and `SOURCES.md`: the
Har-Peled and Erickson lecture-notes URLs named in `CHAPTER.md` still return errors at research
time, so Ben Lynn's "Probability — Quicksort" page is used in their place for the
pair-indicator proof, since it gives the identical argument and closed form and is directly
fetchable.
