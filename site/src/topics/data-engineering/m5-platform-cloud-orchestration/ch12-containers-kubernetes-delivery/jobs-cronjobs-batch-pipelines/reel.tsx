import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Full topic: Indexed Jobs, per-index backoff (GA per the release post in SOURCES.md), pod
// failure policy, success policy (GA likewise), TTL cleanup, and the CronJob's concurrency
// policies and missed-schedule rule. No local
// Kubernetes cluster is reachable on this build machine, so the controllers' live behaviour is
// sourced from Kubernetes' own docs; the per-index, failure-policy, success-policy, concurrency
// and missed-schedule mechanics are run for real in examples.py.
const reel: Reel = {
  steps: [
    {
      title: "Partition 137 won't finish",
      body: (
        <>
          The shop's `orders-rollup` Job has 200 partitions. Partition 137 contains a malformed record and crashes every single time. With one shared
          retry budget, six failures kill the whole Job — leaving the other 199 partitions possibly unfinished.
        </>
      ),
      duration: 2.6,
      fig: '200-partition grid, one failing cell',
      Visual: S.Hook,
    },
    {
      title: "Isolate the one bad partition",
      body: (
        <>
          Which setting makes exactly partition 137 fail alone while the other 199 finish — and what does the Job's final status end up being?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [
          { label: 'raise the shared backoffLimit' },
          { label: 'per-index backoff — but the Job still ends Failed', correct: true },
          { label: 'per-index backoff, and the Job ends Complete' },
          { label: "nothing — a Job can't isolate one partition" },
        ],
        explain: (
          <>
            `backoffLimitPerIndex` retries each index on its own; a failing index lands in `failedIndexes` without stopping the other 199. But the Job
            controller still marks the overall Job Failed the moment any index failed — even with 199 out of 200 done.
          </>
        ),
      },
      fig: 'predict: isolate the failure',
      Visual: S.PredictIsolate,
    },
    {
      title: 'No external queue',
      body: (
        <>
          An Indexed Job gives each pod a completion index — an annotation, a label, its own hostname, and the `JOB_COMPLETION_INDEX` environment
          variable. Index *i* always processes partition *i*. There is no work queue to coordinate.
        </>
      ),
      duration: 2.4,
      fig: 'index assigns the partition',
      Visual: S.IndexedNoQueue,
    },
    {
      title: 'Two pods, one index, briefly',
      body: (
        <>
          The Job controller can start a replacement pod as soon as a failing pod's termination becomes apparent — before that pod is confirmed
          terminal. The same index can briefly have two pods running. Each index's work has to tolerate that.
        </>
      ),
      duration: 2.6,
      takeaway: "An index's work must be idempotent — more than one pod can briefly run it.",
      fig: 'two pods sharing an index',
      Visual: S.TwoPodsOneIndex,
    },
    {
      title: 'One bad index, 199 good ones',
      body: (
        <>
          With `backoffLimitPerIndex` set, a failing index retries on its own budget, then joins `failedIndexes`. The succeeded indexes land in
          `completedIndexes` regardless. A failing index never interrupts the others.
        </>
      ),
      duration: 2.6,
      fig: 'per-index retry grid',
      Visual: S.PerIndexBackoff,
    },
    {
      title: 'The cap: maxFailedIndexes',
      body: (
        <>
          Without a cap, every index still runs even if many of them fail — only the Job's final condition changes. Set `maxFailedIndexes`, and
          exceeding it terminates every remaining running pod early.
        </>
      ),
      duration: 2.6,
      takeaway: 'maxFailedIndexes caps failures across indexes; backoffLimitPerIndex caps retries within one.',
      fig: 'under the cap vs. over it',
      Visual: S.MaxFailedIndexes,
    },
    {
      title: 'Classify the failure, not just count it',
      body: (
        <>
          A pod failure policy reads exit codes and pod conditions. Exit code 42 can mean "fail the whole Job now" — no more retries. A
          `DisruptionTarget` condition, from an eviction or preemption, can mean "ignore this one; don't burn the budget."
        </>
      ),
      duration: 2.8,
      fig: 'exit code vs. disruption condition',
      Visual: S.FailurePolicy,
    },
    {
      title: 'Does a drain count?',
      body: (
        <>
          A node drain evicts a running pod partway through the Job. Does that eviction count against `backoffLimitPerIndex`?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [
          { label: 'yes, always — any pod failure counts' },
          { label: "no — Kubernetes always ignores evictions automatically" },
          { label: 'only if the pod failure policy names DisruptionTarget as Ignore', correct: true },
          { label: 'it depends on the exit code the kubelet reports' },
        ],
        explain: (
          <>
            Only if the policy says so. Without a rule naming `DisruptionTarget` with action `Ignore`, the eviction falls through to the default
            handling and does count toward the retry budget — Kubernetes doesn't exempt disruptions on its own.
          </>
        ),
      },
      fig: 'predict: does the drain count',
      Visual: S.PredictDrain,
    },
    {
      title: 'Done at partial completion',
      body: (
        <>
          A success policy declares the Job succeeded once chosen indexes, or a count of them, have succeeded — then the controller kills the
          lingering pods. A simulation where one scenario's success is enough doesn't need the other 199 to finish.
        </>
      ),
      duration: 2.8,
      takeaway: "A success policy ends the Job early; it doesn't wait for every index.",
      fig: 'one index satisfies the policy',
      Visual: S.SuccessPolicy,
    },
    {
      title: 'Cleanup has a cost',
      body: (
        <>
          `ttlSecondsAfterFinished` deletes a finished Job and its pods together, automatically. That's convenient — and it means the pods' logs are
          gone too, unless something shipped them out first.
        </>
      ),
      duration: 2.2,
      fig: 'TTL deletes Job and pods together',
      Visual: S.TtlCleanup,
    },
    {
      title: 'One overrun, three outcomes',
      body: (
        <>
          The previous run is still going when the next one is due. `Allow` lets them run side by side. `Forbid` skips the new run. `Replace` kills
          the old run and starts the new one. The same overrun, three different results.
        </>
      ),
      duration: 2.6,
      fig: 'Allow, Forbid, Replace',
      Visual: S.ConcurrencyPolicies,
    },
    {
      title: 'Give up after 100 misses',
      body: (
        <>
          If the controller is down long enough, Kubernetes doesn't try to catch up forever. More than 100 missed schedules — counted from
          `startingDeadlineSeconds` if it's set, or from the last scheduled time if it isn't — and the CronJob simply doesn't start, and logs an error.
        </>
      ),
      duration: 2.8,
      takeaway: 'Past 100 missed schedules, a CronJob gives up and logs an error instead of catching up.',
      fig: 'the 100-miss cutoff',
      Visual: S.MissedSchedules,
    },
    {
      title: "What a CronJob doesn't give you",
      body: (
        <>
          A CronJob creates a Job "approximately once" per schedule — its own Jobs must be idempotent. It has no dependency graph, no data intervals,
          no backfill, and no cross-job retries or alerts. That's an orchestrator's job, not a CronJob's.
        </>
      ),
      duration: 2.6,
      fig: 'CronJob vs. orchestrator',
      Visual: S.CronJobBoundary,
    },
    {
      title: 'Jobs that end, on purpose',
      body: (
        <>
          A Job runs a fixed set of pods you wrote down. Spark does something stranger: you start one pod, the driver, and it asks the API server to
          create the rest.
        </>
      ),
      duration: 2.2,
      fig: 'recap',
      Visual: S.Recap,
    },
  ],
};

export default reel;
