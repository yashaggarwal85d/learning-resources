# Fact-check: de.spill-shuffle-memory-pressure

## Claims table

| Claim | Basis | Check |
|---|---|---|
| A skewed sort genuinely spills; the memory figure exceeds the disk figure for the identical event | Measured (`examples.py`) | `node ... examples.py` assertions, passing |
| Of four tasks, exactly one carries the entire spill; the other three report zero | Measured | same |
| Quadrupling driver memory (512MB to 2GB) leaves the skewed task's spill essentially unchanged, nowhere near proportional | Measured | same |
| Sort-and-spill happens "in response to memory pressure" | Sourced, `UnsafeExternalSorter.java` | `sources.mjs check`, 8/8 quotes |
| The memory-spilled figure counts page-rounding and pointer-array overhead never written to disk | Sourced, `UnsafeExternalSorter.java` | same |
| Execution memory covers shuffles, joins, sorts and aggregations; without caching, a job can use the whole pool for execution, avoiding unnecessary spills | Sourced, Spark "Tuning Spark" docs | same |

## Red team

- **Is the "exactly one task spills" result a property of this specific skew ratio, or would
  a milder skew spread the spill across more tasks?** Not independently re-measured at a
  milder ratio; the claim is scoped to this topic's own worked example (one partition holding
  the overwhelming majority of rows, matching the syllabus's own "skewed or over-wide task"
  framing), not a general law about every skew ratio.
- **Could the "barely moves" result at 4x memory be an artifact of local mode's own task
  concurrency (2 concurrent slots sharing one pool) rather than a general truth about
  executor memory?** Partially — `coverage.json`'s own expert list names this directly:
  concurrency divides the pool among concurrently-running tasks, so the measured result is
  specific to this concurrency level, not a claim that no amount of added memory would ever
  help; the syllabus clause's own wording ("often fails," not "never helps") matches this
  scoped framing.
- **Is the memory-vs-disk gap actually from page-rounding/bookkeeping, or could it just be
  general serialization overhead (same as any compressed write)?** Checked directly against
  the source: the comment at the exact call site incrementing `memoryBytesSpilled` names
  page-rounding and the pointer array specifically, not compression — confirmed as the
  documented mechanism, not inferred from the numbers alone.
- **Did forcing AQE off (to isolate the spill mechanism) hide a real-world mitigation the
  reel should disclose?** Yes, and it's disclosed directly: `coverage.json`'s expert list
  names AQE's own skew-join splitting as an earlier, different intervention point that could
  eliminate this skew before any task runs — this topic deliberately isolates what happens
  once a task is already running with too much data, which AQE's splitting (two chapters
  back) is not guaranteed to have already prevented.

## Abandoned approaches

The first design attempt used a non-combinable hash aggregation (`groupBy("k").agg(
collect_list("v"))`) with one very large group, expecting the same kind of memory-pressure
spill a sort shows. It did not spill at all — it threw a genuine `java.lang.OutOfMemoryError`
instead. Investigating why: `ObjectHashAggregateExec`'s own sort-based spill fallback
triggers only when too many *distinct* groups are active in memory concurrently, never when
one group's own accumulator (an `ArrayBuffer` for `collect_list`) grows too large by itself —
a single oversized group has no spill path at all in that operator, confirmed directly by
reproducing the OOM and its stack trace. This is a real, useful finding in its own right
(named in `coverage.json`'s expert list as its own item) but the wrong vehicle for this
topic's own claims, which need a genuine spill, not an OOM. Switched to `sortWithinPartitions`
on the same kind of skewed data, which uses `UnsafeExternalSorter` directly — the exact
source this topic quotes — and does spill cleanly under pressure, which is what every
measured claim in `examples.py` is built on.
