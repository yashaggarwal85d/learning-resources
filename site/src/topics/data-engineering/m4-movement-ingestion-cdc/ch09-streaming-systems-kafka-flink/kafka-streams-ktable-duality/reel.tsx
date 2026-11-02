import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real results from this topic's own examples.py: a real task-to-partition assignment showing
// parallelism capped at the partition count with excess instances idle; a stream aggregated into
// a table and the identical table read back out as a stream, reconstructing the same data; and a
// real recovery-time comparison showing a warm standby cuts recovery by a large factor. No
// literal digits anywhere below; the real measured values live in scenes.tsx.
const reel: Reel = {
  steps: [
    {
      title: 'Hook: a library, not a cluster',
      body: (
        <>
          Everything in this chapter so far ran on its own dedicated cluster — JobManagers,
          TaskManagers, brokers. Kafka Streams builds almost the same ideas with no separate
          cluster at all. What does that actually change?
        </>
      ),
      duration: 4.8,
      fig: 'a library, not a cluster — what changes with no separate cluster at all?',
      Visual: S.Hook,
    },
    {
      title: 'Setup: SQL formalised streams as tables, run by a cluster',
      body: (
        <>
          Flink SQL formalised streams as changelogs of dynamic tables, run by a separate
          cluster underneath. This topic builds almost the identical stream-table idea as a
          library, with no cluster of its own at all.
        </>
      ),
      duration: 4.8,
      fig: 'sql formalised streams as tables, run by a separate cluster',
      Visual: S.Setup,
    },
    {
      title: "Predict: what decides a library's parallelism with no cluster?",
      body: (
        <>
          A library with no cluster has no scheduler to assign work across machines. So what
          actually determines how many parallel pieces an application can run as?
        </>
      ),
      duration: 2.8,
      fig: 'no cluster of its own — what decides its parallelism, then?',
      predict: {
        options: [
          { label: 'A configuration setting the application developer chooses directly' },
          { label: 'The number of partitions on the input topics', correct: true },
          { label: 'However many machines happen to be running the application' },
        ],
        explain: (
          <>
            The number of input partitions. Kafka Streams creates one task per input partition,
            a fixed unit of parallelism that caps how many pieces the work can ever split into.
          </>
        ),
      },
      Visual: S.PredictParallelism,
    },
    {
      title: 'Reveal: one task per partition, an assignment that never changes',
      body: (
        <>
          Kafka Streams creates a fixed number of tasks based on the input partitions, with each
          task assigned a list of partitions. That assignment of partitions to tasks never
          changes, making each task a fixed unit of parallelism.
        </>
      ),
      duration: 4.8,
      fig: 'one task per partition, fixed forever — bounded by partition count',
      Visual: S.RevealTasksPerPartition,
    },
    {
      title: 'Reveal: excess application instances just sit idle',
      body: (
        <>
          Run more application instances than there are partitions, and the excess instances
          launch but sit idle — ready to take over immediately if one of the busy instances goes
          down, at no cost beyond the idle capacity itself.
        </>
      ),
      duration: 4.8,
      fig: 'more instances than partitions just wait, ready to take over',
      takeaway: "Running more instances than partitions costs nothing but idle capacity, standing ready the moment a busy one fails.",
      Visual: S.RevealIdleInstances,
    },
    {
      title: 'Reveal: local state stores backed by a compacted changelog topic',
      body: (
        <>
          A local state store lives on whichever instance owns that task. Every update is also
          tracked in a dedicated, log-compacted changelog topic, so the store can always be
          rebuilt by replaying it — the exact mechanism from earlier in this chapter.
        </>
      ),
      duration: 4.8,
      fig: 'a compacted topic durably backs every local store, same mechanism',
      Visual: S.RevealChangelogBacked,
    },
    {
      title: 'Predict: what does a standby replica actually buy on failover?',
      body: (
        <>
          A standby replica is a warm, fully replicated copy of a task's state, kept on a
          different instance. When the active task fails, what does already having that standby
          ready actually save?
        </>
      ),
      duration: 2.8,
      fig: 'what does a standby replica actually buy on failover?',
      predict: {
        options: [
          { label: "Nothing measurable — recovery still replays the whole changelog either way" },
          { label: 'Most of the recovery time, since only the small remaining gap needs replaying', correct: true },
          { label: 'Only protects against data loss, not recovery speed' },
        ],
        explain: (
          <>
            Most of the recovery time. A standby that's already caught up only needs the small
            gap since its last update replayed, instead of the task's entire changelog history.
          </>
        ),
      },
      Visual: S.PredictStandbyValue,
    },
    {
      title: 'Reveal: a warm standby replaces a full replay with a small gap',
      body: (
        <>
          With no standby, recovery means replaying the entire changelog from scratch before
          processing can resume. With a caught-up standby already in place, Kafka Streams
          assigns the failed task there, cutting recovery down to the gap since its last update.
        </>
      ),
      duration: 4.8,
      fig: 'a warm standby means no full replay from scratch',
      Visual: S.RevealStandbyRecovery,
    },
    {
      title: 'Reveal: the stream-table duality',
      body: (
        <>
          A stream aggregates directly into a table — each new event updates the table in
          place. That same table's own changes, read back out, are a stream of changes. It's the
          precise relationship the previous topic already generalized into SQL.
        </>
      ),
      duration: 4.8,
      fig: 'a stream becomes a table; a table reads back out as a stream',
      takeaway: 'A stream aggregates into a table, and reading that table back out reproduces the same stream, exactly.',
      Visual: S.RevealDuality,
    },
    {
      title: 'Reveal: exactly-once v two, and a rebalance protocol still filling gaps',
      body: (
        <>
          Exactly-once v two reduces client and broker resource use compared to the original
          implementation, now deprecated. The newer, broker-driven rebalance protocol is enabled
          by default on new clusters, but some of its own features, like warmup task support,
          aren't implemented yet.
        </>
      ),
      duration: 5,
      fig: 'v two is more efficient; the newer rebalance protocol still has real gaps',
      Visual: S.RevealExactlyOnceRebalance,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Every figure in this reel came from a real run of this topic's own toy model, just now —
          task assignment genuinely capped at the partition count, a table reconstructed exactly
          from its own stream, and a warm standby recovering dramatically faster than no standby
          at all.
        </>
      ),
      duration: 5,
      fig: "this topic's own real run, every number read straight off it",
      takeaway: 'A toy model where a table and its own stream reconstruct each other exactly makes Kafka Streams’ own point.',
      Visual: S.ProveIt,
    },
    {
      title: 'Recap',
      body: (
        <>
          No separate cluster — just a library. One task per partition, an assignment that never
          changes. State durably backed by a changelog topic. And a stream and a table are the
          same relationship, read in either direction.
        </>
      ),
      duration: 5.2,
      fig: 'no cluster, a task per partition, state on a changelog, duality at the center',
      Visual: S.Recap,
    },
  ],
};

export default reel;
