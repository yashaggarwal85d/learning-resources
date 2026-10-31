<section data-section="outcomes">

## After this topic you can

- Read `memory.events` and `cpu.stat` for a running container and say what each counter means.
- Given an `OOMKilled` pod with a healthy-looking heap, name what the kernel counted that the heap didn't, and set heap, overhead and limit consistently.
- Tell the three memory deaths (kernel OOM-kill, JVM `OutOfMemoryError`, Python RSS growth) apart from their log lines.
- Explain why a liveness probe on a slow JVM start produces a restart loop, and which probe fixes it.

</section>

<section data-section="internals">

## A little deeper

### The limit is a kernel file

A cgroup v2 memory limit lives at `memory.max`, a file the kernel itself enforces. The kernel's own cgroup v2 documentation states it plainly: `memory.max` is a "memory usage hard limit," and "if a cgroup's memory usage reaches this limit and can't be reduced, the OOM killer is invoked in the cgroup." `memory.oom.group` (default "0") decides whether the whole cgroup dies together or just the one task picked for killing; `memory.events`' `oom` counter increments when the limit is breached, and its separate `oom_kill` counter increments only for processes actually killed — the limit doesn't ask whether the byte that crossed it was JVM heap, native memory, or anything else.

### Three ways to die of memory

A kernel OOM-kill ends the main process outright: the kernel sends `SIGKILL`, and the container's exit code is 128 + 9 = 137. A JVM `OutOfMemoryError` is an exception the process can catch and survive — demonstrated for real in this topic's `OOMTest.java`, run with `-Xmx32m`: it holds about a dozen one-mebibyte chunks before the heap runs out, catches the error, and keeps running. A Python process growing its resident set raises no exception at all; `resource.getrusage(resource.RUSAGE_SELF).ru_maxrss` climbs steadily as a twenty-million-element list grows, with nothing short of a kernel limit ever stepping in.

### Sizing the JVM and Spark inside a container

The JVM reads a container's memory limit (via its own cgroup-awareness), but Oracle's `java(1)` manual page for Java SE 21 states `-XX:MaxRAMPercentage`'s default as 25 percent of that limit — heap is sized to a quarter of what the container gets, leaving three-quarters for metaspace, thread stacks, direct buffers and native libraries. Raising a container's memory limit without also raising `-XX:MaxRAMPercentage` or an explicit `-Xmx` makes a non-heap-driven `OOMKilled` *more* likely to recur, not less: the heap ceiling stays a fixed fraction of a now-larger limit, while the non-heap usage that caused the kill is untouched. Spark's own `memoryOverheadFactor` configuration doc gives the same shape of number for executors: 0.10 of executor memory for a JVM job, 0.40 for a Kubernetes job running non-JVM code such as PySpark, floored at a minimum (`spark.kubernetes.memoryOverheadFactor`'s floor, 384 mebibytes) either way — heap plus overhead has to fit inside the pod's own container limit.

### CPU quota and throttling

`cpu.max` holds two numbers, "$MAX $PERIOD" in microseconds; the kernel's default is "max 100000" — no quota, a 100 millisecond period. Set a quota below the period and a multi-threaded process can burn it all in the opening slice of a period and sit throttled for the rest, which `cpu.stat`'s `nr_throttled` and `throttled_usec` fields report directly. Whether to set a CPU limit at all — and the throttling-versus-no-limit debate it invites — is a question this topic only names; topic 4 (QoS classes and eviction) is where it gets argued.

</section>

<section data-section="lab">

## Try it

This build machine has no cgroup v2 host (no `/sys/fs/cgroup/memory.max` to read or write), so the kernel-OOM-kill signature (`memory.events`, exit code 137) and the live `cpu.max`/`cpu.stat` files are disclosed here as sourced, not measured on this machine — exactly the half of the §12.1 lab the kernel's own cgroup v2 documentation covers in full.

What *is* run for real: a genuine JVM `OutOfMemoryError` under a deliberately small heap, and a genuine Python RSS climb, which are the other two death signatures this topic tells apart; plus the `cpu.max` quota/period arithmetic and Spark's `memoryOverhead` arithmetic, both checked against the sourced numbers.

```
$ python3 examples.py
ok  test_cpu_max_default_is_unthrottled
ok  test_cpu_max_quota_throttles_a_hungry_workload
ok  test_default_max_ram_percentage_leaves_headroom_for_non_heap
ok  test_jvm_executor_overhead_is_ten_percent
ok  test_jvm_oom_is_caught_and_the_process_survives
ok  test_oomkilled_exit_code_is_128_plus_sigkill
ok  test_pyspark_executor_needs_four_times_the_overhead_fraction
ok  test_python_rss_climbs_as_a_list_grows_no_heap_exception_ever_raised
ok  test_small_jvm_executor_overhead_is_floored_at_the_minimum

9 checks passed.
```

</section>

<section data-section="production">

## In code review

- **An `OOMKilled` pod with a healthy-looking heap metric.** Check non-heap first — metaspace, thread stacks, native buffers and direct `ByteBuffer`s don't show up in a heap dashboard but count fully against the container limit.
- **Raising a limit without raising `-XX:MaxRAMPercentage` or `-Xmx`.** This is a common but incomplete fix: it raises the ceiling the non-heap usage can grow into, but doesn't change the fraction the JVM reserves for heap, so the real cause of the kill is untouched.
- **A liveness probe with a short `initialDelaySeconds` on a slow-starting process.** Look for a startup probe (or a generous `initialDelaySeconds`/`failureThreshold` on the liveness probe itself) whenever a container's own startup time can vary — a JVM warming up a large heap, a Spark driver initializing its shuffle service.

</section>

<section data-section="next">

## Where this goes next

Gang scheduling and queueing for a batch of pods that must all be scheduled together or not at all (Kueue) is topic 6's subject, not this one. This topic's own forward pointer is topic 4: requests versus limits, QoS classes, node-pressure eviction order, and the CPU-limit-throttling debate this topic only named.

</section>
