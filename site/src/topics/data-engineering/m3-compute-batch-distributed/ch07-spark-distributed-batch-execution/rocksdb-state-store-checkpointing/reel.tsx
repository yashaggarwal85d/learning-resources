import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Measured against real local Structured Streaming queries (examples.py): a growing-key
// aggregation on the default HDFS-backed state store provider produces real, climbing JVM
// garbage-collection time; the identical workload on the RocksDB provider stays far lower,
// since its state lives in native memory and on local disk rather than as JVM objects.
// Changelog checkpointing is measured to write real, meaningfully fewer bytes per checkpoint
// than snapshot checkpointing for the identical RocksDB workload.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Exactly-once leans on the state store surviving a restart. This topic is what that
          store actually is, and when the default one stops being enough.
        </>
      ),
      duration: 4.5,
      fig: "exactly-once needs the store to survive. What is that store?",
      Visual: S.Hook,
    },
    {
      title: "Reveal: the default provider keeps state on the JVM's own heap",
      body: (
        <>
          The default state store provider keeps every key's state as an object sitting in the
          executor's own JVM heap. Millions of keys means millions of those objects.
        </>
      ),
      duration: 4.8,
      fig: 'every key, an object, on the heap. Millions of keys, millions of objects.',
      Visual: S.RevealDefaultOnHeap,
    },
    {
      title: 'Predict: a million-key aggregation. GC time flat, or climbing?',
      body: (
        <>
          An aggregation whose key count climbs toward a million, on the default provider. Does
          its garbage-collection time stay flat, or climb along with the key count?
        </>
      ),
      duration: 2.8,
      fig: 'a million keys, on the default provider. GC time: flat, or climbing?',
      predict: {
        options: [
          { label: 'Flat — GC time depends on data volume, not key count' },
          { label: "Climbing — more live objects means more for the GC to walk", correct: true },
        ],
        explain: (
          <>
            Climbing. Every one of those millions of keys is a live object the garbage collector
            has to walk on every collection, not data that passes through once.
          </>
        ),
      },
      Visual: S.PredictGcClimbs,
    },
    {
      title: "Reveal: climbs on the default provider -- RocksDB stays flat",
      body: (
        <>
          Measured: real, climbing GC time on the default provider. The identical growing-key
          workload on RocksDB stays far lower, for the same data.
        </>
      ),
      duration: 4.8,
      fig: "default provider: GC climbs. RocksDB, same load: stays low.",
      Visual: S.RevealGcClimbed,
    },
    {
      title: "Elaborate: native memory and local disk, not JVM objects",
      body: (
        <>
          RocksDB moves the state out of the JVM entirely -- into native memory and the local
          disk. The garbage collector never sees those millions of entries at all.
        </>
      ),
      duration: 5,
      fig: 'state moved off the heap -- the GC has nothing left to walk.',
      takeaway: "Millions of keys cost the garbage collector real time only as JVM objects; move them off-heap and the cost disappears.",
      Visual: S.ElaborateNativeMemory,
    },
    {
      title: 'Predict: every checkpoint re-uploads the full snapshot. True or false?',
      body: (
        <>
          Does every single checkpoint commit re-upload the entire state snapshot from scratch,
          or is there a cheaper way that uploads less than everything?
        </>
      ),
      duration: 2.8,
      fig: 'every checkpoint, the full snapshot again. True, or false?',
      predict: {
        options: [
          { label: "False — changelog checkpointing uploads only what changed", correct: true },
          { label: 'True — a consistent checkpoint has to be the whole state' },
        ],
        explain: (
          <>
            False. Changelog checkpointing uploads only the changes since the last checkpoint,
            not the whole state over again.
          </>
        ),
      },
      Visual: S.PredictFullReupload,
    },
    {
      title: 'Reveal: false -- changelog checkpointing uploads only the changes',
      body: (
        <>
          Measured: switching on changelog checkpointing collapses the bytes written per
          checkpoint, for the identical workload that otherwise uploads a full snapshot.
        </>
      ),
      duration: 4.8,
      fig: 'changelog on: bytes written collapse, same workload, same data.',
      Visual: S.RevealChangelogSmaller,
    },
    {
      title: 'Elaborate: the snapshot still happens -- just not every batch',
      body: (
        <>
          Changelog checkpointing doesn't skip the full snapshot forever. It defers the
          expensive part to a periodic background snapshot, instead of paying it every commit.
        </>
      ),
      duration: 5,
      fig: 'deferred, not skipped -- the snapshot still runs, just less often.',
      takeaway: "Changelog checkpointing is cheaper per commit because it defers the expensive full snapshot, not because it avoids paying for one.",
      Visual: S.ElaborateSnapshotDeferred,
    },
    {
      title: "Reveal: this chapter's own examples never needed any of this",
      body: (
        <>
          Every example run so far in this chapter stayed far below the key count where any of
          this matters. The real threshold is measured in millions of keys, not thousands.
        </>
      ),
      duration: 5,
      fig: "this chapter's own scale: nowhere near where this starts to matter.",
      Visual: S.RevealChapterNeverNeeded,
    },
    {
      title: 'Recap',
      body: (
        <>
          Two providers, one real switch: where the state physically lives, and what a
          checkpoint costs to write once it's there.
        </>
      ),
      duration: 5,
      fig: 'one switch: where state lives, and what writing it costs.',
      takeaway: "The default provider and RocksDB answer one question differently: whether millions of keys reach the garbage collector at all.",
      Visual: S.Recap,
    },
  ],
};

export default reel;
