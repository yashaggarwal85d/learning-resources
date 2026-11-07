# Review — dsa.mapreduce-as-algorithmic-pattern

## Content review

- Every quote in `SOURCES.md` checked word for word against the fetched text
  (`node scripts/sources.mjs check`): 19/19 pass, after fixing the same class of `pdftotext`
  page-break splice already seen in topic 105 (a "To appear in OSDI 2004" footer injected
  mid-sentence into the OSDI04 paper's partitioning-function paragraph, fixed by splitting into
  two separate quote blocks at the exact boundary).
- Karloff, Suri and Vassilvitskii's SODA 2010 paper ("A model of computation for MapReduce")
  could not be read directly — its own homepage URL was unreachable at research time, exactly as
  CHAPTER.md anticipated. It is named in one sentence via the Beame-Koutris-Suciu paper's own
  summary of it, quoted in `SOURCES.md`, with no definition of its specific parameters stated
  beyond that summary.
- Every claim in `FACT-CHECK.md` confirmed against a fetched primary source or direct
  computation in `examples.py`.
- `examples.py` runs clean: the word-count shuffle with and without a combiner (asserting
  identical final counts, far fewer records with one), the broken-mean counter-example and its
  (sum, count) fix landing exactly on the true pooled mean, a tiny simulated four-server MPC
  cluster comparing a chain join against a triangle query's replication need, and a
  doubling-rounds table for transitive closure — all `assert` statements passing.
- The MPC-model round/replication simulation is explicitly documented, in its own comments, as a
  simplification illustrating BKS's stated space exponents (0 for a chain join, 1/3 for a
  triangle query), not a reproduction of their one-round algorithm. The doubling-rounds table is
  likewise documented as an illustration of *why* a growing chain resists a constant round count
  under one natural scheme, not a reproduction of BKS's own proof.
- `coverage.json`'s five syllabus clauses are literal substrings of the real syllabus scope line
  (`syllabus/data-structures-and-algorithms.md` line 518), including the cross-domain arrow
  mapped via `{topic, domain, quote}` to the live Data Engineering Ch.7 topic "Sort-based shuffle
  mechanics," not `{out}`. Every `step` reference verified by script to match a `reel.tsx` title
  exactly (`total titles 15`, no mismatches). Eleven `expert.items` entries.
- One content deviation recorded in `OUTLINE.md`: the Karloff/Suri/Vassilvitskii paper named only
  via BKS's summary, and the syllabus's own Lab bullet (resting on topics marked *(skipped)*) not
  separately built beyond what `examples.py` already computes.

## Looks review

Reel smoke test (`tests/reels.mjs`) run at both phone and desktop sizes: passed. First run
caught a phone-viewport text overflow in step 15's recap (the "what makes a problem hard at
all" label running past the drawing and into the line above it); fixed by shortening and
wrapping the `scenes.tsx` text across two lines below the box, and the re-run passed clean
(`Reel smoke test passed: 1 live reel(s) at desktop and phone sizes`). The build check also
caught a `coverage.json` cross-domain quote that didn't match the Data Engineering target
topic's own syllabus text (it had quoted the target's `SOURCES.md` instead of its syllabus
scope line); fixed by quoting the syllabus line's own words.

## Changes from the chapter plan

Recorded in `OUTLINE.md`: the unreachable Karloff/Suri/Vassilvitskii homepage (named via BKS's
own summary instead, per CHAPTER.md's own anticipation), and no separate lab section beyond
`examples.py`'s own computations, since the syllabus's own Lab bullet rests on topics already
marked *(skipped)* and deferred by topic 105's own "Notes for the release run."
