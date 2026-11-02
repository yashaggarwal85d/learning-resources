# Fact-check, currency and red team — `de.container-resource-limits-cgroups`

Self-review; no independent reviewer.

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | `memory.max` crossing invokes the cgroup's own OOM killer | Confirmed | kernel cgroup-v2.rst, verbatim |
| 2 | `memory.oom.group` defaults to "0" (per-task kill, not whole-group) | Confirmed | kernel cgroup-v2.rst, verbatim |
| 3 | `memory.events`' `oom` and `oom_kill` are separate counters (about-to-fail vs. actually killed) | Confirmed | kernel cgroup-v2.rst, verbatim |
| 4 | `cpu.max` default is "max 100000" (no limit, 100ms period) | Confirmed | kernel cgroup-v2.rst, verbatim |
| 5 | `-XX:MaxRAMPercentage` default is 25 percent | Confirmed | Oracle java(1), Java SE 21, verbatim |
| 6 | Spark overhead factor: 0.10 JVM, 0.40 Kubernetes non-JVM; floor 384m | Confirmed, version-checked | Spark 4.2.0 docs (current release at research time), verbatim |
| 7 | A startup probe gates liveness/readiness until it succeeds | Confirmed | Kubernetes probes docs, verbatim |
| 8 | Exit code 137 is 128 + SIGKILL | Confirmed by computation | `examples.py`; SIGKILL=9 is POSIX-standard, not sourced from a single doc page |

## Red team

- Checked the hook's premise against the docs rather than folk wisdom: raising executor memory without also raising `-XX:MaxRAMPercentage` or an explicit `-Xmx` *does* make an `OOMKilled` more likely to recur, because the JVM's heap ceiling stays at 25% of the (now larger) limit while non-heap usage (which caused the kill) is unaffected by the memory bump — the fix is sizing heap, overhead and limit together, not just raising the limit. This is reasoning from the sourced mechanism, not an independent claim; flagged as such in the reel's narration.
- Edge case on step 2's predict: could "a memory leak in the pipeline code" also be a valid answer? In general yes, but the hook specifically describes a *healthy-looking heap* at half its allowance, which a leak would eventually breach — the predict's framing (heap half full, container full) points at non-heap specifically, and the explanation says so.
- Verified `memory.oom.group`'s "tasks with the OOM protection (oom_score_adj set to -1000) are treated as an exception" detail exists in the source but left it out of the reel (too deep for this topic's 15 minutes; it belongs with topic 4's eviction/`oom_score_adj` material, which is where `qos-classes-eviction` is introduced).
- The `cpu.max` "1 MiB at a time" JVM test and the CPU quota/period arithmetic in `examples.py` are independent of each other and of any real cgroup host; confirmed neither needs one.
