# Sources — CPU and memory profiling

## Flame Graphs — Brendan Gregg
URL: https://www.brendangregg.com/flamegraphs.html
Fetched: 2026-10-24, cached at `sources/flamegraphs.txt`.
> This is the official website for flame graphs: a visualization of hierarchical data that I created to visualize stack traces of profiled software so that the most frequent code-paths can be identified quickly and accurately.

> The x-axis shows the stack profile population, sorted alphabetically (it is not the passage of time), and the y-axis shows stack depth, counting from zero at the bottom. Each rectangle represents a stack frame. The wider a frame is is, the more often it was present in the stacks.

## mimalloc — README (GitHub)
URL: https://raw.githubusercontent.com/microsoft/mimalloc/master/readme.md
Fetched: 2026-10-24, cached at `sources/mimalloc-readme.txt`.
> _mimalloc_ outperforms other leading allocators (_jemalloc_, _tcmalloc_, _Hoard_, etc), and often uses less memory. A nice property is that it does consistently well over a wide range
of benchmarks.

> there is a 13%
speedup over _tcmalloc_. This is
quite significant: if Lean spends 20% of its time in the
allocator that means that _mimalloc_ is 1.6&times; faster than _tcmalloc_
here.
