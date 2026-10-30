# OUTLINE: Container resource limits: cgroups and OOM (`de.container-resource-limits-cgroups`)

Full, §12.1, ~15 min. Folder: `container-resource-limits-cgroups`. Hosts part of the §12.1 chapter lab.

## Progress

Research done, SOURCES.md checked (27 quotes). No cgroup v2 host on this build machine (confirmed: no `/sys/fs/cgroup/memory.max`), so `memory.events`' `oom`/`oom_kill` counters and exit code 137 are sourced, not measured. What runs for real in `examples.py`: a genuine JVM `OutOfMemoryError` under `-Xmx32m` (`OOMTest.java`, compiled and run as a subprocess) and a genuine Python RSS climb (`resource.getrusage`), which are exactly the two signatures the lab can demonstrate without a cgroup host; plus the `cpu.max` quota/period arithmetic and Spark's `memoryOverhead` arithmetic, both checked against SOURCES.md's sourced numbers.

## Outcomes

1. Read `memory.events` and `cpu.stat` for a running container and say what each counter means.
2. Given an `OOMKilled` pod with a healthy-looking heap, name what the kernel counted that the heap didn't, and set heap, overhead and limit consistently.
3. Tell the three memory deaths (kernel OOM-kill, JVM `OutOfMemoryError`, Python RSS growth) apart from their log lines.
4. Explain why a liveness probe on a slow JVM start produces a restart loop, and which probe fixes it.

## Reel steps (storyboard)

1. **Hook** — the shop's `orders-rollup` executor pod is `OOMKilled` while its JVM heap sits at about half of what it was given; the engineer raises executor memory and the pod is killed *more often*. `fig`: the chapter's limit line with nested boxes (container > JVM heap + non-heap + page cache); outer box full, heap box half.
2. **Predict** (step 2, within first four) — "What did the kernel count that the heap didn't?" Options: heap fragmentation / the JVM's non-heap memory (metaspace, thread stacks, native buffers) / a memory leak in the pipeline code / nothing, this is a kernel bug. Correct: non-heap. This is the "from" step's neighbour, so no takeaway sits on step 3 or 4.
3. **The limit is a kernel file** — `memory.max` is a hard ceiling the kernel enforces; crossing it invokes the cgroup's own OOM killer, which doesn't care whether the crossing byte was heap or something else. `fig`: limit line, no takeaway here (step index 2, the test's "from" step — keep it takeaway-free per the recurring gotcha).
4. **Three ways to die of memory** — kernel OOM-kill (the whole container's main process killed, signature: `memory.events` `oom_kill` increments, exit code 137 = 128+SIGKILL), JVM `OutOfMemoryError` (an exception the *process survives*, demonstrated for real), Python RSS growth (no exception at all, climbs until something else intervenes, demonstrated for real). Takeaway: three different failures, three different log lines.
5. **Container-aware JVM sizing** — the JVM reads the container's limit but defaults `-XX:MaxRAMPercentage` to 25 percent of it; heap is only part of the process (metaspace, thread stacks, direct buffers, native libraries fill the rest). Takeaway.
6. **Spark `memoryOverhead` arithmetic** — executor memory × an overhead factor (0.10 for JVM jobs, 0.40 for Kubernetes non-JVM jobs like PySpark), floored at 384 MiB; heap + overhead must fit the container limit. Takeaway.
7. **CPU: quota and period** — `cpu.max` is "$MAX $PERIOD" in microseconds ("max 100000" by default: unlimited); a multi-threaded process can burn its quota early in the period and sit throttled for the rest, visible in `cpu.stat`'s `nr_throttled`/`throttled_usec`. Whether to set a CPU limit at all is topic 4's debate — named, not settled, here.
8. **Predict 2** — "A pod has a CPU limit but the node is completely idle. Is it throttled anyway?" Options: no, limits only matter under contention / yes, a burst that exceeds its own quota is throttled even on an idle node / only if another pod is also running / never, CPU limits are advisory. Correct: yes — `cpu.max` throttles against the group's own quota, not against other demand on the node.
9. **Probes: liveness vs readiness vs startup** — what each decides (restart the container / remove it from service / hold the others back until started); a startup probe holds liveness and readiness back until it succeeds; a liveness probe that starts checking before a slow JVM finishes initializing produces an endless restart loop, fixed by a startup probe or a longer `initialDelaySeconds`. Takeaway.
10. **Recap.**

Engagement: hook step 1, two predicts (steps 2 and 8, first within four), ≥3 takeaways (steps 4, 5, 6, 9 — four, safely off the "from" step), full-topic "Prove it" folded into step 4's real JVM/Python runs plus the Lab section.

## Claims list

| Claim | Source |
|---|---|
| `memory.max` is a hard limit; crossing it and failing to reduce invokes the cgroup's OOM killer | kernel cgroup-v2.rst |
| `memory.oom.group` (default 0) decides whether the whole cgroup dies together | kernel cgroup-v2.rst |
| `memory.events`' `oom` (about to fail) and `oom_kill` (processes actually killed) are distinct counters | kernel cgroup-v2.rst |
| `cpu.max` is "$MAX $PERIOD" in microseconds; "max 100000" is the default (unthrottled) | kernel cgroup-v2.rst |
| `cpu.stat` reports `usage_usec`/`user_usec`/`system_usec` always, `nr_periods`/`nr_throttled`/`throttled_usec` when the CPU controller is enabled | kernel cgroup-v2.rst |
| `-XX:MaxRAMPercentage` defaults to 25 percent | Oracle java(1), Java SE 21 |
| Spark's `memoryOverheadFactor` defaults to 0.10, except Kubernetes non-JVM jobs at 0.40; floored at `minMemoryOverhead` (384m) | Spark 4.2.0 configuration docs |
| A startup probe holds liveness/readiness back until it succeeds; its own failure kills the container | Kubernetes probes docs |
| A liveness probe catches a stuck-but-running process (a deadlock) and triggers a restart | Kubernetes probes docs |
| A readiness-probe failure removes the pod from service without restarting it | Kubernetes probes docs |
| Exit code 137 = 128 + SIGKILL (9), the kernel OOM killer's signal | computed in examples.py; Chapter 1's shell refresher teaches the 128+signal convention |

## Post-notes headings

`outcomes`, `internals` ("A little deeper": The limit is a kernel file; Three ways to die of memory; Sizing the JVM and Spark inside a container; CPU quota and throttling), `lab` ("Try it": the real JVM/Python runs, the §12.1 lab's second half disclosed sourced-only for the cgroup-file side), `production` ("In code review": probes, memory/overhead sizing), `next` ("Where this goes next": gang scheduling/Kueue pointer stays with topic 6, not here — this topic's own forward pointer is topic 4's QoS/eviction).

## Bridge / handoff

Per CHAPTER.md topic 2 entry.

## Concept ledger

Introduces: `cgroup-memory-cpu-limits`, `oom-kill-vs-runtime-oom`, `health-probes-restart-loops`.
Uses: `image-layers-build-cache` (topic 1), `process-model`, `signals`, `exit-status`, `process-inspection`, `cpu-memory-profiling`.
Declared: the JVM heap and a Python process's memory as a user sees them. Chapter 7 §7.3's executor-memory-model id cannot be resolved yet (chapter 7 is unplanned/unbuilt at this writing, per CHAPTER.md's cross-chapter-id rule) — gap logged here rather than guessed; a seam pass should add it to `uses` once that id exists in `registry.ts`.
