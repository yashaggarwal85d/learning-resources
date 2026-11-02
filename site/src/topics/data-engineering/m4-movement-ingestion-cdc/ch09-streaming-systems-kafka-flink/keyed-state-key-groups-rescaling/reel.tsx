import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real results from this topic's own examples.py: a real key-group hash-and-reassign simulation
// across a rescale, verified with no key group ever split across instances; a real recovery-time
// model showing it tracks state held, not operator count; and a real heap-vs-RocksDB access-cost
// and capacity comparison. No literal digits anywhere below (duration numbers are exempt); the
// real values live in scenes.tsx.
const reel: Reel = {
  steps: [
    {
      title: "Hook: recovery time tracks the state a worker held, not the job's shape",
      body: (
        <>
          Kill a TaskManager and measure how long recovery actually takes. It isn't the number of
          operators in the job that decides that time — it's exactly how much state the key
          groups on that one instance happened to hold.
        </>
      ),
      duration: 4.8,
      fig: "one worker dies; recovery time tracks the state it held, not the job's shape",
      Visual: S.Hook,
    },
    {
      title: 'Setup: what is a snapshot actually a snapshot of?',
      body: (
        <>
          The last topic covered how a checkpoint or savepoint takes a consistent snapshot. This
          topic is what that snapshot actually contains for a keyed operator, and the one fact
          that makes rescaling it tractable at all.
        </>
      ),
      duration: 4.8,
      fig: 'a snapshot was taken — but what is it actually a snapshot of?',
      Visual: S.Setup,
    },
    {
      title: 'Predict: when a job rescales, what actually moves?',
      body: (
        <>
          A job's parallelism changes from four instances to six. Does keyed state get
          redistributed key by key, individually, or does something else move instead?
        </>
      ),
      duration: 2.8,
      fig: 'a job rescales — what actually moves?',
      predict: {
        options: [
          { label: 'Every key gets rehashed and moved individually, one at a time' },
          { label: 'Fixed, pre-defined groups of keys move together, as whole blocks', correct: true },
          { label: "Nothing moves — state just gets recomputed from scratch" },
        ],
        explain: (
          <>
            Fixed groups move as whole blocks. Keyed state is hashed into a fixed number of key
            groups up front, and it's those groups — never individual keys — that get
            reassigned to instances on a rescale.
          </>
        ),
      },
      Visual: S.PredictRescaleUnit,
    },
    {
      title: 'Reveal: every key hashes into a fixed key group',
      body: (
        <>
          Keyed state is never assigned directly to an operator instance. Every key is first
          hashed into one of a fixed number of key groups — set once, by max parallelism, and
          never recomputed from the job's current parallelism.
        </>
      ),
      duration: 4.8,
      fig: 'every key hashes into a fixed key group, set once, independent of parallelism',
      Visual: S.RevealKeyGroups,
    },
    {
      title: 'Reveal: rescaling moves whole key groups, never splitting one',
      body: (
        <>
          Rescaling slides entire key groups between instances — it never moves individual keys,
          and it never splits a key group across two instances. Every key inside a moved group
          checksums identically to its pre-rescale value.
        </>
      ),
      duration: 4.8,
      fig: 'rescaling slides whole key groups between instances, never splitting one',
      takeaway: "Max parallelism isn't a knob to tune later — it's the number of key groups rescaling can ever redistribute.",
      Visual: S.RevealRescaleBlocks,
    },
    {
      title: 'Reveal: heap and RocksDB trade speed for capacity',
      body: (
        <>
          Heap state lives as plain objects on the JVM heap: fast access, but bounded by cluster
          memory. RocksDB state lives on local disk, paying a real de/serialization cost on every
          access — in exchange for capacity far beyond what memory alone could hold.
        </>
      ),
      duration: 4.8,
      fig: 'heap state is fast and memory-bound; rocksdb is slower and disk-bound',
      Visual: S.RevealBackends,
    },
    {
      title: 'Predict: does a more complex job take longer to recover?',
      body: (
        <>
          One job has a single operator; another has dozens, doing much more work per record.
          Both lose the same TaskManager, holding the same key groups. Does the more complex job
          take longer to recover?
        </>
      ),
      duration: 2.8,
      fig: 'does a more complex job take longer to recover?',
      predict: {
        options: [
          { label: 'Yes — more operators means more to recompute on restart', correct: false },
          { label: 'No — recovery time depends only on the state held, not operator count', correct: true },
          { label: "It depends on how many sinks the job writes to" },
        ],
        explain: (
          <>
            No — recovery time depends only on the state held. The failed instance's key groups
            determine how much has to be restored; the number of operators the job happens to run
            doesn't enter into it at all.
          </>
        ),
      },
      Visual: S.PredictRecoveryDriver,
    },
    {
      title: "Reveal: recovery time tracks state, not the job's shape",
      body: (
        <>
          Measured directly: a simple job and a far more complex one, losing the identical
          TaskManager with the identical key groups, recover in exactly the same time. Only the
          instance holding more state recovers measurably slower.
        </>
      ),
      duration: 4.8,
      fig: "recovery time tracks the failed instance's state, nothing about the job itself",
      Visual: S.RevealRecoveryDriver,
    },
    {
      title: 'Reveal: TTL expires idle state; schema evolution has real limits',
      body: (
        <>
          A time-to-live setting cleans up a key's state automatically once it's gone idle long
          enough, on a best-effort basis. A POJO's schema can evolve — fields added or removed —
          but a key's own structure and a field's declared type cannot change.
        </>
      ),
      duration: 4.8,
      fig: 'idle state expires on its own; a changed schema follows real, narrow rules',
      takeaway: "State TTL and schema evolution both sound like free flexibility, but each covers only a narrow, documented set of changes.",
      Visual: S.RevealTtlSchema,
    },
    {
      title: "Reveal: an older savepoint doesn't carry into the newest major version",
      body: (
        <>
          Flink's own savepoint compatibility table lists only its own recent minor releases as
          valid restore targets — the newest major version isn't on it at all. The underlying
          cause is a serializer rewrite that changes the binary format any Kryo-serialized state
          was stored in.
        </>
      ),
      duration: 5,
      fig: "flink's own docs don't cover restoring a two-oh job from an old savepoint",
      takeaway: "A major-version jump isn't guaranteed to carry a savepoint across it — verify that against the current guide, never assume.",
      Visual: S.RevealVersionBreak,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Every figure in this reel came from a real run of this topic's own toy model, just now —
          the rescale that moved whole key groups and checksummed clean, the recovery time that
          tracked state and ignored operator count, and the measured heap-versus-RocksDB cost gap.
        </>
      ),
      duration: 4.8,
      fig: "this topic's own real run, every number read straight off it",
      Visual: S.ProveIt,
    },
    {
      title: 'Recap',
      body: (
        <>
          Keys hash into fixed key groups, set once. Rescaling moves whole groups, never splits
          one. Heap and RocksDB trade speed for capacity. Recovery time tracks state, not the
          job's shape. And an older savepoint isn't guaranteed to carry into the newest version.
        </>
      ),
      duration: 5.2,
      fig: 'a fixed group, a block that moves, a backend trade, a version that breaks',
      Visual: S.Recap,
    },
  ],
};

export default reel;
