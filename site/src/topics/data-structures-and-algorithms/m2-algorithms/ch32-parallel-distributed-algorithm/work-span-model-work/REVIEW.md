# Review — dsa.work-span-model-work

## Content review

- Every quote in `SOURCES.md` checked word for word against the fetched text
  (`node scripts/sources.mjs check`): 21/21 pass, after fixing several `pdftotext` rendering
  quirks (control-byte renderings of ≥/≤ in the Blumofe technical report, a page-break-crossing
  sentence whose correct capitalization had to be read from the raw cached text rather than
  guessed, and a Wikipedia MathML fragment that had to be truncated before the garbled markup
  rather than reproduced).
- The canonical Blumofe and Leiserson *Journal of the ACM* 1999 paper could not be read
  directly (ACM 403s; a third-party PDF mirror returned only an unreliable summary). Blumofe's
  own MIT technical report (MIT-LCS-TR-677, 1995) — the same joint research, explicitly credited
  to Leiserson in its own text — is used instead, and every theorem quoted from it is checked
  against the chapter plan's own planning-time reading of the JACM abstract (expected
  T1/P + O(T∞), space S1·P) to confirm no substantive difference.
- Every claim in `FACT-CHECK.md` confirmed against a fetched primary source or direct
  computation in `examples.py`.
- `examples.py` runs clean: the sum DAG's work/span/parallelism, a real greedy-schedule
  simulation against both forms of Brent's bound at five worker counts, the merge sort's span
  and work read off their recurrences up to n = 65,536, and a discrete-event work-stealing
  simulation reporting real steal fractions — all `assert` statements passing.
- Two numeric claims from the chapter plan were refined rather than taken on faith: the
  work-stealing simulation's step count is checked against a *constant-factor* multiple of
  Brent's bound, not an exact ceiling, since the theorem itself bounds an *expectation* with a
  big-O term and this simulation's thieves pay a full discrete step for a failed steal attempt
  (a legitimate simplification that is honestly slower than an idealized greedy schedule); and
  the steal-fraction claim ("steals are rare") is stated at the actual measured range (about
  seven percent at two workers, rising to about fifteen percent at sixteen), not an unverified
  small constant.
- `coverage.json`'s five syllabus clauses are literal substrings of the real syllabus scope line
  (`syllabus/data-structures-and-algorithms.md` line 513), including the cross-domain arrow
  mapped via `{topic, domain, quote}` to the live Rust Systems Engineering Ch.9 topic's own
  syllabus text, not `{out}`. Ten `expert.items` entries.
- One content deviation recorded in `OUTLINE.md`: the bridge uses the chapter plan's own
  supplied fallback text, since Chapter 31 (topic 104) is not yet published to the registry,
  exactly as CHAPTER.md anticipated and instructed.

## Looks review

Reel smoke test (`tests/reels.mjs`) run at both phone and desktop sizes: passed. First run
caught two phone-viewport text overflows (step 15's compare-and-swap label running past the
drawing, step 16's recap labels running into each other); both fixed by shortening/repositioning
the `scenes.tsx` text, and the re-run passed clean (`Reel smoke test passed: 1 live reel(s) at
desktop and phone sizes`).

## Changes from the chapter plan

Recorded in `OUTLINE.md`: the unpublished-Chapter-31 bridge fallback, the MIT technical report
standing in for the unreachable JACM paper, the omission of a real multi-core speed-up
measurement (not reproducible in this build sandbox), and computing the sort's span/work from
their recurrences directly rather than a node-level DAG simulation at n = 65,536 (equivalent,
and tractable).
