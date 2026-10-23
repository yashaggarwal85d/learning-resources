# Review — de.cpython-object-model-memory

## Content summary

12 steps opening Chapter 4: the PyObject header (reference count, type pointer) quoted directly
from CPython's own C API reference; a real measured ratio between a list of boxed Python
integers and the identical values packed into a native buffer; a real measured ratio between a
plain class instance and a `__slots__` instance, confirmed directly that the slotted instance has
no `__dict__` at all; the specializing adaptive interpreter's own real effect, shown by
disassembling the identical function cold and warm for two different argument types; the
experimental JIT (3.13+), quoted directly and honestly disclosed as something this sandbox's own
CPython 3.13.16 build does not have, checked directly rather than assumed; a real measured
speedup of a vectorized call over an equivalent per-row Python loop, with the vectorized call's
own first-call overhead disclosed separately; and a closing "Prove it" scenario measuring the
real extra cost of calling the same function with a genuine mix of argument types. Three
predicts (step 3, within the first four), three takeaways (steps 5, 9, 10), a recap, and a
"Prove it" that measures a genuinely new case rather than restating an earlier reveal.

This topic opens Chapter 4 (Advanced Python for Data Systems) and its own `CHAPTER.md`, planned
in this same session. Every number in the topic is measured directly on this sandbox's own
installed CPython (`examples.py`), never assumed from a benchmark elsewhere; the two syllabus
clauses this topic can't run directly on this sandbox (the experimental JIT, free-threading) are
disclosed honestly as sourced-only, confirmed absent by checking `sys._jit` and
`Py_GIL_DISABLED` directly rather than guessed from the Python version number.

## Sources

CPython's own documentation and PEPs (the C API reference's object-structures page, PEP 659, the
3.13 release notes) — 14 quotes total, verified word for word (`node scripts/sources.mjs check`,
0 problems).

## Build and engagement rules

- First predict is step 3 (within the first-four-steps rule).
- 3 takeaways present (steps 5, 9, 10).
- No narration line reads the on-screen description verbatim (`narration-teaches.mjs`: all 12
  steps well under the flag threshold, highest overlap 14%, longest line 42 words).
- No literal digits appear in `reel.tsx`'s rendered content (only `duration` float fields);
  `examples.py`'s own numbers (the boxed/packed ratio, the `__slots__` ratio, the loop/vectorized
  speedup, the mixed-type cost) are all real measurements on this sandbox, not assumed.

## Fixes made during this build

- One `reel.tsx` takeaway (the JIT-disclosure step) was initially 23 words, over the twenty-word
  limit — shortened twice (first to 22, then to 21, then to 19 words) without changing its claim,
  since each successive edit still left stray words past the limit until counted carefully.
- The syllabus line's own `__slots__` backticks were removed from `coverage.json`'s clause text
  to match the site's own Markdown-stripping of the raw syllabus line (the now-standard fix from
  earlier chapters' recurring-bugs list).

## Checks run

- `node scripts/sources.mjs check` — 14/14 quotes verified word for word.
- `python3 examples.py` — pass, "cpython-object-model-memory examples: all numbers check out"
  (the boxed-vs-packed ratio, the `__slots__` ratio, the specializing interpreter's real
  disassembly, the JIT/free-threading absence check, the loop-vs-vectorized speedup and its
  first-call overhead, and the mixed-type cost are all measured directly).
- `node scripts/check-all.mjs --skip reels,links --topic cpython-object-model-memory` — pass
  (locked, docs, sources, build, narration) after the takeaway fix above.
- `node scripts/narration-teaches.mjs .../cpython-object-model-memory` — pass, all 12 steps under
  the description-overlap ceiling.
- `node scripts/check-links.mjs` — pass, 0 broken links (pre-existing title-mismatch/blocked
  warnings on other topics only; none from this one).
- `node scripts/check-all.mjs --only reels --topic cpython-object-model-memory` — pass, Playwright
  desktop and phone.

## Self-review note

All reviews in this file are self-review by the same session that wrote the content; no
independent reviewer ran. Expert sign-off: pending.
