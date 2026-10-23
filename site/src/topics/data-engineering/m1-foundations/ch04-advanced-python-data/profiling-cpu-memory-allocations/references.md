Last verified against these sources: 23 October 2026. Real measurements on this sandbox's own
CPython (`examples.py`), hosting the §4.1 chapter lab. Expert sign-off: pending.

- Python Software Foundation, "profile — Pure Python profiler": [docs.python.org](https://docs.python.org/3/library/profile.html). Deterministic vs. statistical profiling.
- Python Software Foundation, "tracemalloc — Trace memory allocations": [docs.python.org](https://docs.python.org/3/library/tracemalloc.html). Allocation tracking and snapshot comparison.
- Ben Frederickson, "py-spy README": [github.com](https://github.com/benfred/py-spy). A sampling profiler that attaches to a live process without code changes.
- Bloomberg, "Memray README": [github.com](https://github.com/bloomberg/memray). A memory profiler tracking Python and native allocations.
- Emery Berger et al., "Scalene README": [github.com](https://github.com/plasma-umass/scalene). Splitting Python time from native time.
- "PEP 768 – Safe external debugger interface for CPython": [peps.python.org](https://peps.python.org/pep-0768/). The 3.14 live-process-attach interface, sourced-only on this sandbox.
- Python Software Foundation, "What's New In Python 3.15": [docs.python.org](https://docs.python.org/3.15/whatsnew/3.15.html). The `profiling.sampling` module (Tachyon), sourced-only on this sandbox.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=profiling-cpu-memory-allocations:%20).
