# Fact-check: de.executor-memory-model

## Claims table

| Claim | Basis | Check |
|---|---|---|
| A ~294MB pool (768MB heap) matches `(heap - 300MB) * 0.6` | Measured (`examples.py`) | `node ... examples.py` assertions, passing |
| A cache past the protected minimum is fully evicted under real execution pressure, and the task still spills | Measured | same |
| The identical pressure against a cache under the protected minimum leaves it completely untouched | Measured | same |
| A driver heap too small for a `collect()` throws a real `java.lang.OutOfMemoryError: Java heap space`, with a full stack trace | Measured | same |
| A real cgroup memory limit around the same kind of `collect()` produces a kernel-level `cgroup out of memory: Killed process (java)`, with zero Java exception | Measured once this session (disclosed below, not re-run in `examples.py`) | manual reproduction, documented below |
| A soft boundary lets either side borrow; storage's borrowed memory is evicted, execution's never is | Sourced, `UnifiedMemoryManager.scala` | `sources.mjs check`, 16/16 quotes |
| The pool's size formula and `storageFraction`'s own split | Sourced, `UnifiedMemoryManager.scala` | same |
| `memoryOverhead` covers off-heap memory, Python workers, native overhead; a container's real ceiling is `memory + memoryOverhead` | Sourced, Spark configuration docs | same |

## Red team

- **Is the measured "full eviction" actually complete, or could `/storage/rdd` just be hiding
  a partially-evicted remainder?** Checked directly: the endpoint returns an empty list
  entirely once every partition is gone, not an entry showing partial bytes — confirmed by
  asserting `storage_after == []`, not merely `memoryUsed == 0`.
- **Could the "protected minimum holds" result just be luck — the sort happening not to need
  much memory that run?** Ruled out: the identical sort against the identical row count is
  used in both the eviction case and the protected-minimum case; only the cache's own size
  relative to the floor changes between the two runs.
- **Is the captured `OutOfMemoryError` text actually from this run's `collect()`, or could it
  be leftover output from a previous JVM in the same log stream?** Ruled out by running the
  heap-OOM scenario as its own fresh subprocess with `capture_output=True`, so the captured
  text is exclusively that one process's own combined output, not anything from a shared log.
- **Is the cgroup-kill demonstration a genuine container-level kill, or could it just be a
  slow JVM startup timing out for an unrelated reason?** Checked directly against `dmesg`:
  the kernel's own line names the mechanism explicitly — "Memory cgroup out of memory:
  Killed process (java)" with `oom-kill:constraint=CONSTRAINT_MEMCG` — not a generic timeout
  or an application-level failure.

## Abandoned approaches

None outright, but the container-OOM-kill claim (claim 5) needed a different design from the
other claims. The first attempt tried to demonstrate it purely by comparing Python-side
exception messages between a heap OOM and a hypothetical container kill, but a container kill
by definition leaves no Python-side exception to compare — the client just sees a dead
connection (`Py4JNetworkError: Answer from Java side is empty` or `ConnectionRefusedError`).
Demonstrating the real contrast required a genuine Linux cgroup: a `memory` cgroup v1
controller was created under `/sys/fs/cgroup/memory/` (this sandbox runs as root, with
cgroups v1 available and writable), given a fixed `memory.limit_in_bytes` below what the
JVM process needs for the same `collect()` scenario used in claim 4, and the shell's own PID
was written to that cgroup's `cgroup.procs` before launching the JVM. The result, reproduced
twice: `dmesg` recorded `Memory cgroup out of memory: Killed process (java) total-vm:...
anon-rss:...`, the Python driver saw only a dead connection with no Java exception text
anywhere, and the process exited with no graceful shutdown at all — a genuine measurement,
not a simulation. This is disclosed here rather than folded into `examples.py` because it
needs root privileges and a cgroups v1 memory controller, neither of which is guaranteed in
every environment this script might be re-run in (a GitHub Actions runner or a future
sandbox without root, for instance) — unlike the other four claims, which only need a plain
PySpark session.
