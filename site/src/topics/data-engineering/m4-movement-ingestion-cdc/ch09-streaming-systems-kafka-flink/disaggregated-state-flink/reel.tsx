import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real results from this topic's own examples.py: a real checkpoint-cost comparison showing a
// remote-primary checkpoint stays flat while a local-primary one grows with state size, a real
// per-key-ordering model proving same-key accesses stay in order while different keys interleave,
// a real sync-vs-async throughput multiple, and a real warm-vs-cold cache latency gap. No literal
// digits anywhere below; the real measured values live in scenes.tsx.
const reel: Reel = {
  steps: [
    {
      title: "Hook: what if the primary copy didn't stay next to the processing?",
      body: (
        <>
          Every state backend so far kept its authoritative copy on the same machine doing the
          processing. That was never a law of nature — it was a choice. What changes if a backend
          makes the opposite choice on purpose?
        </>
      ),
      duration: 4.8,
      fig: 'every backend so far kept its primary copy right next to the processing',
      Visual: S.Hook,
    },
    {
      title: 'Setup: heap and RocksDB both keep their primary copy local',
      body: (
        <>
          Heap state lives in memory on the TaskManager. RocksDB state lives on that same
          TaskManager's local disk. Both backends, so far, treat the local machine as the
          authoritative home for a key's state.
        </>
      ),
      duration: 4.8,
      fig: 'heap and rocksdb both keep their primary copy on local disk',
      Visual: S.Setup,
    },
    {
      title: 'Predict: what happens to a checkpoint once the primary copy moves remote?',
      body: (
        <>
          Suppose the authoritative copy of state moves off the TaskManager entirely, onto remote
          object storage. What happens to the cost of taking a checkpoint?
        </>
      ),
      duration: 2.8,
      fig: 'the primary copy moves off the machine — what happens to a checkpoint?',
      predict: {
        options: [
          { label: 'Checkpointing gets slower, since every byte now crosses the network' },
          { label: "Checkpointing barely changes cost, since the copy to move is already there", correct: true },
          { label: 'Checkpointing becomes impossible without a local copy to read from' },
        ],
        explain: (
          <>
            Checkpointing barely changes cost. If the authoritative copy already lives where a
            checkpoint would copy it to, there's nothing left to move but a little bookkeeping.
          </>
        ),
      },
      Visual: S.PredictCheckpointCost,
    },
    {
      title: 'Reveal: ForSt is an LSM-tree store built on remote storage',
      body: (
        <>
          ForSt is an LSM-tree key-value store, built the same way RocksDB is, except its own
          files live on remote storage such as HDFS or object storage. Local disk becomes a
          cache for performance, not the place state actually lives.
        </>
      ),
      duration: 4.8,
      fig: 'forst is an lsm-tree store whose files live on remote storage',
      Visual: S.RevealForSt,
    },
    {
      title: 'Reveal: a checkpoint becomes a near-metadata update',
      body: (
        <>
          Because the authoritative copy is already durable on the same remote storage a
          checkpoint would write to, taking a checkpoint collapses into a lightweight metadata
          update — recording what already exists, instead of copying it there.
        </>
      ),
      duration: 4.8,
      fig: 'the primary copy is already durable, so a checkpoint barely has to move',
      takeaway: 'Checkpointing gets close to free once the authoritative copy is already durable off the machine doing the work.',
      Visual: S.RevealCheckpointsNearFree,
    },
    {
      title: 'Reveal: faster recovery, scale-in, and scale-out follow from the same cause',
      body: (
        <>
          The paper's own measurements show large multiples on recovery time, scale-in time, and
          scale-out time, all tracing back to the same root cause: a checkpoint that was already
          close to metadata-only, instead of a full copy of the state.
        </>
      ),
      duration: 4.8,
      fig: 'faster recovery, faster scale-in, faster scale-out, all from the same cause',
      Visual: S.RevealSpeedups,
    },
    {
      title: 'Predict: what has to change about processing a record now?',
      body: (
        <>
          State access can now cross the network on every read or write. If a record's processing
          just blocked and waited for every state access the way it always has, what would that
          do to throughput?
        </>
      ),
      duration: 2.8,
      fig: 'state access can now cross the network — what has to change?',
      predict: {
        options: [
          { label: 'Nothing changes — blocking on each access still works fine' },
          { label: 'Throughput collapses unless access becomes non-blocking', correct: true },
          { label: 'The record stream has to stop using keyed state entirely' },
        ],
        explain: (
          <>
            Throughput collapses unless access becomes non-blocking. Blocking on every remote
            round trip would stall the whole record stream, so the API itself has to change.
          </>
        ),
      },
      Visual: S.PredictAsyncAccess,
    },
    {
      title: 'Reveal: the async state API returns a non-blocking future',
      body: (
        <>
          The synchronous state API blocks until an access completes. The new asynchronous API
          returns a future instead, letting one key's remote round trip overlap with another
          key's, rather than stalling the whole stream on each one.
        </>
      ),
      duration: 4.8,
      fig: 'a non-blocking state future lets other keys’ round trips overlap',
      Visual: S.RevealAsyncStateApi,
    },
    {
      title: 'Reveal: same-key order is preserved while different keys interleave freely',
      body: (
        <>
          The guarantee that makes this safe: accesses for the same key still complete in the
          exact order they were issued, every time. Accesses for different keys are free to
          complete in any order, which is exactly what lets their round trips overlap.
        </>
      ),
      duration: 4.8,
      fig: 'same key stays strictly ordered; different keys are free to interleave',
      takeaway: 'Asynchronous state access overlaps different keys freely while keeping every single key in its original order.',
      Visual: S.RevealPerKeyOrder,
    },
    {
      title: 'Reveal: no cache costs real throughput; a modest one earns it back',
      body: (
        <>
          Running with no local cache at all measurably hurts throughput on I/O-heavy workloads.
          But even a modest local cache recovers that loss, and ends up ahead of the old
          local-primary setup it replaced.
        </>
      ),
      duration: 4.8,
      fig: 'no cache costs real throughput; even a modest cache earns it back',
      Visual: S.RevealCacheTradeoff,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Every figure in this reel came from a real run of this topic's own toy model, just now —
          checkpoint cost staying flat as state grew instead of growing with it, per-key order
          holding while different keys interleaved, and a real gap between a warm and a cold
          cache.
        </>
      ),
      duration: 5,
      fig: "this topic's own real run, every number read straight off it",
      takeaway: 'A toy model staying flat under growing state and widening under a cold cache makes the paper’s own point.',
      Visual: S.ProveIt,
    },
    {
      title: 'Recap',
      body: (
        <>
          The primary copy of state moved off the machine doing the processing. Checkpoints paid
          that move back by becoming near-free. Asynchronous access hides the remote latency
          without breaking per-key order. A cold cache is the real price for all of it.
        </>
      ),
      duration: 5.2,
      fig: 'the primary copy moved; checkpoints paid that back; async hid the rest',
      Visual: S.Recap,
    },
  ],
};

export default reel;
