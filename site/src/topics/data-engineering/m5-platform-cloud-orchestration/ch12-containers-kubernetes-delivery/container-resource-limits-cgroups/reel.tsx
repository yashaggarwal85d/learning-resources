import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Full topic: cgroups v2 memory/CPU limits and the three ways a process actually dies. No
// cgroup v2 host is reachable on this build machine (no /sys/fs/cgroup/memory.max), so the
// kernel's own OOM-kill signature is sourced (SOURCES.md); a real JVM OutOfMemoryError and a
// real Python RSS climb are run for real in examples.py.
const reel: Reel = {
  steps: [
    {
      title: 'A healthy heap, killed anyway',
      body: (
        <>
          The shop's <code>orders-rollup</code> executor pod is OOMKilled while its JVM heap sits at about half of what it was given. The engineer's fix
          — raise the executor's memory — makes it worse: the pod is killed more often than before.
        </>
      ),
      duration: 2.4,
      fig: 'the limit line, a half-full heap',
      Visual: S.Hook,
    },
    {
      title: 'What did the kernel count?',
      body: (
        <>
          The heap is half full; the container is full anyway. What did the kernel count that the heap didn't?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [
          { label: 'heap fragmentation' },
          { label: "the JVM's non-heap memory", correct: true },
          { label: 'a memory leak in the pipeline code' },
          { label: 'nothing — this is a kernel bug' },
        ],
        explain: (
          <>
            The JVM's non-heap memory: metaspace, thread stacks, native buffers. The heap is only part of the process; a container limit covers all of
            it, not just what <code>-Xmx</code> bounds.
          </>
        ),
      },
      fig: 'predict: non-heap memory',
      Visual: S.PredictNonHeap,
    },
    {
      title: 'The limit is a kernel file',
      body: (
        <>
          <code>memory.max</code> is a hard ceiling the kernel enforces. Crossing it and failing to reduce usage invokes the cgroup's own OOM killer,
          which doesn't care whether the byte that crossed the line was heap or something else.
        </>
      ),
      duration: 2.2,
      fig: 'memory.max, a kernel file',
      Visual: S.KernelFile,
    },
    {
      title: 'Three ways to die of memory',
      body: (
        <>
          A kernel OOM-kill ends the whole process; its exit code is 137, and <code>memory.events</code>' <code>oom_kill</code> counter increments. A JVM{' '}
          <code>OutOfMemoryError</code> is an exception the process survives. Python's RSS just climbs, with no exception at all, until something else
          stops it.
        </>
      ),
      duration: 3.0,
      takeaway: 'Three memory deaths, three different log lines: never guess which one happened.',
      fig: 'kernel kill vs JVM OOM vs RSS growth',
      Visual: S.ThreeDeaths,
    },
    {
      title: "The JVM doesn't size itself to the limit",
      body: (
        <>
          The JVM reads the container's memory limit, but <code>-XX:MaxRAMPercentage</code> defaults to 25 percent of it. Heap is only part of a JVM
          process — metaspace, thread stacks, direct buffers and native libraries fill the rest of that remaining 75 percent.
        </>
      ),
      duration: 2.6,
      takeaway: 'A JVM defaults its heap ceiling to 25% of the container limit, not all of it.',
      fig: "the JVM's default heap ceiling",
      Visual: S.JvmSizing,
    },
    {
      title: "Spark's memoryOverhead arithmetic",
      body: (
        <>
          Spark adds <code>memoryOverhead</code> on top of executor memory: 10 percent for a JVM job, 40% for a Kubernetes non-JVM job like
          PySpark, floored at 384 mebibytes either way. Heap plus overhead has to fit inside the container's own limit.
        </>
      ),
      duration: 2.6,
      takeaway: "PySpark's overhead factor is four times a JVM job's, floored at 384 MiB.",
      fig: 'executor memory + overhead',
      Visual: S.SparkOverhead,
    },
    {
      title: 'CPU: a quota and a period',
      body: (
        <>
          <code>cpu.max</code> is "<code>$MAX $PERIOD</code>" in microseconds — "<code>max 100000</code>" by default, unlimited. A process can burn its
          quota early in the period and sit throttled for the rest, visible in <code>cpu.stat</code>'s <code>nr_throttled</code> and{' '}
          <code>throttled_usec</code>.
        </>
      ),
      duration: 2.6,
      fig: 'quota burned early, throttled late',
      Visual: S.CpuQuota,
    },
    {
      title: 'Throttled on an idle node?',
      body: (
        <>
          A pod has a CPU limit, but the node it runs on is otherwise idle. Is the pod throttled anyway?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [
          { label: 'no — limits only matter under contention' },
          { label: "yes — a burst past its own quota is throttled regardless", correct: true },
          { label: 'only if another pod is also running' },
          { label: 'never — CPU limits are advisory' },
        ],
        explain: (
          <>
            Yes. <code>cpu.max</code> throttles against the group's own quota, not against demand from anyone else on the node — an idle node changes
            nothing about a process that asks for more than its own period allows.
          </>
        ),
      },
      fig: 'predict: throttled on an idle node',
      Visual: S.PredictCpuIdle,
    },
    {
      title: 'Three probes, three actions',
      body: (
        <>
          A startup probe holds liveness and readiness back until it succeeds. A liveness probe that starts checking before a slow JVM finishes
          initializing restarts a container that was never actually stuck — an endless restart loop, fixed by a startup probe or a longer{' '}
          <code>initialDelaySeconds</code>.
        </>
      ),
      duration: 2.8,
      takeaway: 'A startup probe holds liveness and readiness back until the slow part finishes.',
      fig: 'startup, liveness, readiness',
      Visual: S.Probes,
    },
    {
      title: 'Five things to keep',
      body: (
        <>
          A container limit is a kernel file, not a JVM setting. Reading it right — heap, overhead, probes — is what the next topic's QoS classes and
          eviction order build on.
        </>
      ),
      duration: 2.2,
      fig: 'recap',
      Visual: S.Recap,
    },
  ],
};

export default reel;
