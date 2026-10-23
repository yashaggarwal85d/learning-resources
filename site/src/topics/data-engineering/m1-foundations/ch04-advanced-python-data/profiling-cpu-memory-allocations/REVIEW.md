# Review — de.profiling-cpu-memory-allocations

## Content summary

12 steps, hosting the §4.1 chapter lab directly: deterministic profiling (cProfile) quoted
directly and run for real on this lab's own plain loop, naming the real function it profiled;
tracemalloc quoted and measured, including a real measurement bug this build caught and fixed
(peak traced memory, not a post-call live-block count, which gave a backwards result); py-spy
genuinely attaching to an already-running subprocess from outside, with no code change, reading
its exact real call stack; Scalene genuinely splitting Python time from native time on the
Polars/DuckDB leg; and the chapter's own four processing approaches (plain loop, multiprocessing,
async, native engine) finally measured together on the identical synthetic feed — with async
measured honestly as the slowest of the four here, directly contradicting the "expected"
narrative that it should win again after winning its own topic's race. The Arrow handoff is
measured against a genuine CSV round trip rather than asserted zero-copy, after an initial,
more direct buffer-address test gave an honest negative result and had to be redesigned. Two
predicts (step 3, within the first four; step 7), three takeaways (steps 6, 9, 10), a recap, and
a closing "Prove it" that tests matching each tool to its own specific question.

This topic doesn't force "expected" results where real measurements disagreed: async loses badly
on this CPU-bound workload after winning its own topic's I/O-bound one, and the Arrow handoff's
real benefit had to be relocated after the first, more obvious test of it came back negative.

## Sources

cProfile and tracemalloc's own stdlib docs, py-spy's, Memray's and Scalene's own READMEs, PEP
768, and the Python 3.15 release notes (PEP 799, Tachyon) — 9 quotes total, verified word for
word (`node scripts/sources.mjs check`, 0 problems).

## Build and engagement rules

- First predict is step 3 (within the first-four-steps rule).
- 3 takeaways present (steps 6, 9, 10).
- No narration line reads the on-screen description verbatim (`narration-teaches.mjs`: all 12
  steps well under the flag threshold after one rewrite — see Fixes below; highest overlap 17%,
  longest line 47 words).
- No literal digits appear in `reel.tsx`'s rendered content (only `duration` float fields);
  `examples.py`'s own numbers (throughput per approach, tracemalloc peaks, Scalene's split,
  handoff timings) are all real measurements on this sandbox, not assumed.
- `coverage.json`'s expert list needed ten items; an initial write had nine and the build check
  caught the gap directly.

## Fixes made during this build

- **A real `tracemalloc` measurement bug, found and fixed in `examples.py` itself**: comparing
  live block counts immediately after each approach returned gave a backwards result (the
  native-engine leg appeared to allocate more than the plain loop), because the loop's own
  short-lived per-row objects were already freed by snapshot time while a library's persistent
  wrapper objects were still live and got counted instead. Fixed by reading
  `tracemalloc.get_traced_memory()`'s own peak before stopping, which measures the real
  high-water mark during the run instead of a post-hoc live count — documented directly in
  `FACT-CHECK.md` and the code's own docstring rather than quietly corrected away.
- **The Arrow/DuckDB "zero-copy" claim was redesigned mid-build**: the first, most direct test
  (comparing the buffer address of the input Arrow table's column against DuckDB's own query
  output) came back with different addresses — an honest negative result, because DuckDB's
  vectorized execution engine materializes its own output buffers regardless of input format.
  The real, measurable benefit was relocated to the handoff's actual value: skipping a real
  serialize/deserialize round trip on the way in, verified by timing the same query directly
  against the in-memory Arrow table versus through a genuine CSV round trip.
- `coverage.json`'s expert list initially had nine items; the build's own coverage check
  requires at least ten, so a tenth item (on the synthetic feed's honestly-disclosed size) was
  added.
- One narration line (step 4) initially restated `reel.tsx`'s own body sentence almost verbatim
  ("the native engine wins by a wide margin... measured honestly... slowest of the four"),
  caught directly by the build's own description-overlap check; rewritten to explain the real
  scale of the gap and name which approach it was, instead of restating the reveal's own wording.
- Postgres and the earlier topics' own fixes carried forward unchanged; no repeat of those
  gotchas this build. `pip install scalene` was needed (not preinstalled on this sandbox); py-spy
  and Memray were already installed.

## Checks run

- `node scripts/sources.mjs check` — 9/9 quotes verified word for word.
- `python3 examples.py` — pass, "profiling-cpu-memory-allocations examples: all numbers check
  out" (four-way processing comparison, cProfile trace, tracemalloc peaks, a real py-spy
  live-process attach, a real Scalene Python-vs-native split, and the Arrow-vs-CSV handoff
  timing are all measured directly).
- `node scripts/check-all.mjs --skip reels,links --topic profiling-cpu-memory-allocations` —
  pass (locked, docs, sources, build, narration) after the expert-list and narration-overlap
  fixes above.
- `node scripts/narration-teaches.mjs .../profiling-cpu-memory-allocations` — pass, all 12
  steps under the description-overlap ceiling.
- `node scripts/check-links.mjs` — pass, 0 broken links (pre-existing title-mismatch/blocked
  warnings on other topics only; none from this one).
- `node scripts/check-all.mjs --only reels --topic profiling-cpu-memory-allocations` — run in
  background; result recorded once it completes.

## Self-review note

All reviews in this file are self-review by the same session that wrote the content; no
independent reviewer ran. Expert sign-off: pending.
