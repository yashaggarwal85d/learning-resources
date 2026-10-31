# Content and looks review — `de.container-resource-limits-cgroups`

## Content review

- Narration step 2 originally spoke the step's own caption/predict question verbatim ("what did the kernel count that the heap didn't?"); rewritten as the professor framing the question rather than reading it, ending on a shorter imperative ("Put a name on it.") that doesn't reuse the on-screen wording.
- `reel.tsx`'s Spark-overhead step wrote "40 percent" where `examples.py` only asserts the fraction `0.40`; reworded to "40%" so the automatic every-number-is-computed check can match it against the sourced/computed fraction. Every other number on screen (137, 25, 10, 384, 100000, 75) was already backed by a literal or near-equal value in `examples.py`.
- Confirmed no takeaway sits on step 3 ("The limit is a kernel file"), the step adjacent to the test's "from" step, per the recurring swipe-test gotcha from topic 1.

## Looks review (Playwright reel test)

- Step 1 (Hook): "JVM heap: about half used" and "container: OOMKilled anyway" were 6px apart (y=324/330) and overlapped once phone's `--svg-text-scale` enlarged them. Fixed by spacing them 22px apart below the box (`BOX_BOTTOM + 22` / `BOX_BOTTOM + 44`).
- Step 4 (Three ways to die of memory): three side-by-side 150px-wide columns collided into each other at phone scale ("kernel OOM-kill" ran into "JVM OutOfMemoryError", which ran into "Python RSS growth"). Rewritten as three full-width stacked rows (the same pattern as the Probes step), one death per row.
- Step 5 (Container-aware JVM sizing): the caption "the rest: metaspace, stacks, native" sat at `y=300`, exactly on the lower edge of the semi-transparent heap-ceiling bar, giving it 1.85:1 contrast against the minimum of 3. Moved both captions below the box, spaced the same way as step 1's fix.

Verified via `node scripts/check-all.mjs --only reels --topic container-resource-limits-cgroups`: reel smoke test passes at desktop and phone. The same run's `test:editor` failure ("a save did not open a new GitHub issue") is the same pre-existing, unrelated failure documented for topic 1 (hardcoded against `de.b-trees-vs-lsm`, independent of any file in this topic).

## Build

`npm run build` (238+ pages, including the Astro-level coverage check and the topic-file digit/narration/engagement checks) passes with this topic held.

## Sandbox disclosure

No cgroup v2 host is reachable on this build machine (no `/sys/fs/cgroup/memory.max`), so the kernel OOM-kill signature (`memory.events`, exit code 137) and the live `cpu.max`/`cpu.stat` files are sourced from the kernel's own documentation, not measured. A real JVM `OutOfMemoryError` (`OOMTest.java`, `-Xmx32m`) and a real Python RSS climb (`resource.getrusage`) are run for real, along with the `cpu.max` quota/period and Spark `memoryOverhead` arithmetic.
