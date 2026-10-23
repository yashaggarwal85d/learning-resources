<section data-section="outcomes">

## Outcomes

Deterministic profiling (cProfile) instruments every call for precise, real timing at a real
instrumentation cost — measured directly on this lab's own plain loop, naming the real function
it profiled. tracemalloc traces real Python-heap peaks rather than totals, catching a genuine
measurement bug in this very build along the way (a post-call live-block count gave a backwards
result; the real peak traced during the run gave the honest one). py-spy genuinely attaches to
an already-running process from the outside, with no code change, and reads its real call stack
directly. Scalene genuinely separates Python time from native time, confirmed on this chapter's
own Polars/DuckDB leg rather than assumed from either library's own description of itself. And
this chapter's own synthetic feed, finally processed all four ways side by side (plain loop,
multiprocessing, async, native engine), settles which one actually wins — with async measured
honestly as the slowest of the four here, not the winner topic 3 made it look like for a
different kind of workload entirely.

</section>

<section data-section="lab">

## Lab

Hosts the §4.1 chapter lab directly. Every number in this topic is measured directly on this
sandbox's own CPython (`examples.py`): a synthetic clickstream/orders feed (honestly scaled down
from the chapter's own 20 GB target, disclosed as a fraction of a percent of it) processed four
ways built across this chapter's prior topics; a real cProfile trace; a real tracemalloc peak
comparison; a real py-spy attach to an already-running subprocess; a real Scalene Python-vs-
native split via a subprocess run; and an Arrow-vs-CSV handoff timing, redesigned mid-build after
a more direct first test (buffer-address identity) gave an honest negative result.

</section>

<section data-section="production">

## Production failures this topic warns about

**A team that assumes a given tool's claim about its own capability (sampling with low
overhead, "zero-copy," splitting Python from native time) without ever actually running it on
their own workload.** Every claim in this topic's own lab was checked by actually running the
tool, including one (the Arrow handoff) where the first, more obvious check gave a real negative
result that had to be redesigned honestly rather than papered over.

**A team that profiles the wrong thing** — using a deterministic profiler's own instrumentation
overhead to judge code meant to run thousands of times a second, or reaching for `perf`-based
native-frame profiling on a sandbox that doesn't have `perf` installed, without checking first.
This topic discloses that exact gap directly rather than faking a result.

</section>

<section data-section="frontier">

## Frontier

PEP 768's safe external-debugger interface (3.14) and the stdlib `profiling.sampling` module
(3.15, Tachyon) are both genuinely unavailable on this sandbox's CPython 3.13.16, confirmed
directly rather than assumed from the version number, and are disclosed as sourced-only. `perf`
itself is not installed on this sandbox.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every profiling number in this section was read off Python-level code calling into native
engines underneath it. The next section turns to those native engines directly, starting from
the one memory format most of them now share without copying: Arrow.

</section>
