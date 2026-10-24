# Review — de.gil-free-threading-subinterpreters

## Content summary

12 steps covering all six syllabus clauses: what the GIL serializes (quoted directly from the
Python Glossary); multiprocessing costs, measured directly — `fork` vs. `spawn`/`forkserver` pool
startup, a real memory-duplication difference between a fork child (inherits the parent's memory)
and a spawn child (genuinely doesn't), and a real pickling round-trip cost; native code that
releases the GIL, measured directly against a pure-Python loop that doesn't speed up at all;
free-threaded CPython's own disclosed single-thread performance penalty, memory cost, and
C-extension-compatibility cost, quoted directly from PEP 703 and PEP 779 since this sandbox's own
build doesn't have it; and per-interpreter GILs, exercised directly on this sandbox through the
low-level `_interpreters` module (the higher-level `concurrent.interpreters`, 3.14, isn't
available here) measuring a real multi-core speedup for pure Python work. Two predicts (step 3,
within the first four; step 7), three takeaways (steps 4, 6, 10), a recap, and a closing
"Prove it" that measures a genuinely new scenario — whether creating subinterpreters alone, with
no new threads, delivers any parallelism by itself.

This is the second topic of Chapter 4 (Advanced Python for Data Systems). Every quantitative
claim that can be measured on this sandbox is measured directly in `examples.py`; the two claims
that can't (free-threading's own single-thread/memory cost, since this build isn't free-threaded)
are disclosed honestly as sourced-only from PEP 779, consistent with the same disclosure pattern
used in topic 26 for the JIT and free-threading checks.

## Sources

CPython's own Glossary, PEP 703, PEP 779, the multiprocessing docs, and the
`concurrent.interpreters` docs — 16 quotes total, verified word for word (`node scripts/sources.mjs
check`, 0 problems).

## Build and engagement rules

- First predict is step 3 (within the first-four-steps rule).
- 3 takeaways present (steps 4, 6, 10).
- No narration line reads the on-screen description verbatim (`narration-teaches.mjs`: all 12
  steps well under the flag threshold, highest overlap 11%, longest line 43 words).
- No literal digits appear in `reel.tsx`'s rendered content (only `duration` float fields);
  `examples.py`'s own numbers (pool startup times, RSS, pickling cost, hashlib/python thread
  speedups, subinterpreter speedups) are all real measurements on this sandbox, not assumed.

## Fixes made during this build

- `registry.ts`'s title/`syllabusTitle` initially read "The GIL, free-threading and
  subinterpreters" (an added "The" not in the raw syllabus bullet) — the build check caught the
  mismatch directly ("is not a topic in syllabus/data-engineering.md"); fixed to match the
  syllabus bullet exactly.
- The sixth syllabus clause ("C-extension compatibility as the gating factor") had no quoted
  source at all until this build: read PEP 703's own Distribution section in full and added its
  sentence about requiring separately compiled C-API extensions to `SOURCES.md` and `reel.tsx`
  step 8's body, so the coverage map's `at.step` reference has genuine textual grounding.
- `reel.tsx`'s step-10 takeaway went through three word-count passes (24 → 22 → 19 words) before
  landing under the twenty-word limit.
- A fourth takeaway was needed (the build check requires at least three): added one to step 4
  (native GIL release) after the step-10 one and the pickling one (step 6) only totaled two,
  shortened once from 23 to 18 words to clear the limit.
- `examples.py`'s multiprocessing benchmark originally used an inline `python3 -c` snippet for the
  `spawn`/`forkserver` legs, which fails with `AttributeError: Can't get attribute 'worker'...`
  because there's no real importable module for the child to re-import; fixed by writing the
  worker as a real module-level, picklable function and running the benchmark as a script.
- The fork-vs-spawn memory-duplication check originally allocated its large list at true
  top-level module scope, so a spawn child's fresh re-import silently rebuilt its own separate
  copy, making fork and spawn RSS look misleadingly similar; fixed by allocating inside
  `if __name__ == "__main__":` and checking a direct `hasattr` probe in the child instead of RSS
  alone.
- One `SOURCES.md` quote (PEP 779's single-thread-penalty sentence) originally used an ellipsis to
  elide part of the sentence, which `sources.mjs check` can't match word for word; fixed by
  quoting the complete sentence verbatim.

## Checks run

- `node scripts/sources.mjs check` — 16/16 quotes verified word for word.
- `python3 examples.py` — pass, "gil-free-threading-subinterpreters examples: all numbers check
  out" (pool startup times, fork/spawn RSS and list-presence checks, pickling cost, hashlib/python
  thread speedups, subinterpreter speedups are all measured directly).
- `node scripts/check-all.mjs --skip reels,links --topic gil-free-threading-subinterpreters` —
  pass (locked, docs, sources, build, narration) after the title and takeaway-count fixes above.
- `node scripts/narration-teaches.mjs .../gil-free-threading-subinterpreters` — pass, all 12 steps
  under the description-overlap ceiling.
- `node scripts/check-links.mjs` — pass, 0 broken links (pre-existing title-mismatch/blocked
  warnings on other topics only; this topic's own Python Glossary link shows a cosmetic
  title-mismatch warning, same harmless pattern as other topics' links to versioned docs pages).
- `node scripts/check-all.mjs --only reels --topic gil-free-threading-subinterpreters` — run in
  background; result recorded once it completes.

## Self-review note

All reviews in this file are self-review by the same session that wrote the content; no
independent reviewer ran. Expert sign-off: pending.
