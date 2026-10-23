# Sources — de.profiling-cpu-memory-allocations

All quotes verified word for word against the fetched text in `sources/` via
`node scripts/sources.mjs check`.

## Python Documentation, "profile — Pure Python profiler"
URL: https://docs.python.org/3/library/profile.html

> Deterministic profiling is meant to reflect the fact that all function call, function return, and exception events are monitored, and precise timings are made for the intervals between these events

> In contrast, statistical profiling (which is provided by the profiling.sampling module) periodically samples the effective instruction pointer, and deduces where time is being spent.

## Python Documentation, "tracemalloc — Trace memory allocations"
URL: https://docs.python.org/3/library/tracemalloc.html

> The tracemalloc module is a debug tool to trace memory blocks allocated by Python.

> Compute the differences between two snapshots to detect memory leaks

## py-spy README
URL: https://raw.githubusercontent.com/benfred/py-spy/master/README.md

> py-spy is a sampling profiler for Python programs. It lets you visualize what your Python program is spending time on without restarting the program or modifying the code in any way.

## Memray README
URL: https://raw.githubusercontent.com/bloomberg/memray/main/README.md

> Memray is a memory profiler for Python. It can track memory allocations in Python code, in native extension

## Scalene README
URL: https://raw.githubusercontent.com/plasma-umass/scalene/master/README.md

> Scalene **separates out time spent in Python from time in native code** (including libraries).

## PEP 768, "Safe external debugger interface for CPython"
URL: https://peps.python.org/pep-0768/

> This PEP proposes adding a zero-overhead debugging interface to CPython that allows debuggers and profilers to safely attach to running Python processes.

## Python 3.15 Release Notes, "What's New In Python 3.15"
URL: https://docs.python.org/3.15/whatsnew/3.15.html

> A new statistical sampling profiler (Tachyon) has been added as profiling.sampling. This profiler enables low-overhead performance analysis of running Python processes without requiring code modification or process restart.
