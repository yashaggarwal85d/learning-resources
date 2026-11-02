import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The hot-key-expiry measurement and the real async-replication failover-loss window are both
// reproduced for real in examples.py against this sandbox's own Redis instance and a real,
// genuinely connected replica. The event loop, RDB/AOF, cluster slots and licensing claims are
// sourced from Redis's and the Linux Foundation's own documentation and announcements, named but
// not separately run, since all four describe engine internals or corporate decisions this
// course's own sandbox cannot run as a live measurement.
// No literal digits anywhere except the pinned cluster-slot count, which is in examples.py too.
const reel: Reel = {
  steps: [
    {
      title: "Hook: a real Redis instance runs every command on a single thread, yet handles tens of thousands a second",
      body: (
        <>
          A real Redis instance, in this sandbox, answers every command — not just a plain
          key-value get or set, but operations on whole data structures: lists, sets, hashes — on
          one single thread. And it still handles tens of thousands of operations a second. How
          does single-threaded code reach that throughput?
        </>
      ),
      duration: 5.6,
      fig: "a real Redis instance runs every command on a single thread, yet handles tens of thousands a second",
      Visual: S.Hook,
    },
    {
      title: 'Predict: is Redis fast despite being single-threaded, or because of it',
      body: (
        <>
          One thread runs every command. Is Redis's speed happening in spite of that limit, or is
          the single thread itself the actual reason it's fast?
        </>
      ),
      duration: 2.8,
      fig: 'is Redis fast despite being single-threaded, or because of it?',
      predict: {
        options: [
          { label: 'Despite it — a single thread is a limit Redis works around' },
          { label: 'Because of it — one thread skips locks and cross-core coordination entirely', correct: true },
        ],
        explain: (
          <>
            Because of it. A single thread never pays for locks, context switches, or
            coordinating state across cores. The cost that one thread avoids is bigger than the
            parallelism it gives up, which is why Redis chose it on purpose.
          </>
        ),
      },
      Visual: S.PredictSpeedCause,
    },
    {
      title: 'Reveal: the event loop, with optional I/O threads',
      body: (
        <>
          Command execution itself always stays on that one thread. I/O threads exist, but only
          as an opt-in extra, off by default, used purely for reading and writing sockets — the
          same kind of event loop the asyncio model used earlier in this course, with commands
          instead of coroutines.
        </>
      ),
      duration: 5.6,
      fig: "commands always run on one thread; I/O threads are an opt-in extra for sockets only",
      Visual: S.RevealEventLoop,
    },
    {
      title: 'Reveal: RDB vs AOF',
      body: (
        <>
          RDB snapshots the whole dataset at set intervals; AOF logs every write operation
          instead, for replay. An unclean stop loses whatever changed since the last RDB
          snapshot — a gap AOF's own write-by-write log simply doesn't have.
        </>
      ),
      duration: 5.6,
      fig: 'RDB snapshots periodically and can lose recent writes; AOF logs every write instead',
      takeaway: 'RDB can lose whatever changed since its last snapshot; AOF logs every write instead.',
      Visual: S.RevealRdbVsAof,
    },
    {
      title: "Reveal: async replication's real failover loss",
      body: (
        <>
          Replication is asynchronous by default. Measured directly against this sandbox's own
          real replica: a write the master already acknowledged can still be sitting unapplied on
          the replica — and if the master failed at that instant, that acknowledged write is
          simply gone.
        </>
      ),
      duration: 5.6,
      fig: "a real write, acknowledged by the master, measured still missing from a real frozen replica",
      takeaway: 'An acknowledged write can still be lost on failover, since replication runs asynchronously.',
      Visual: S.RevealReplicationLoss,
    },
    {
      title: "Reveal: Redis Cluster's hash slots",
      body: (
        <>
          Redis Cluster's own key space is split into one fixed set of slots, each owned by
          exactly one node at a time — a concrete instance of the hash partitioning this chapter
          already named in general terms.
        </>
      ),
      duration: 5.6,
      fig: "Redis Cluster's own key space, split into one fixed set of owned slots",
      takeaway: "Cluster's fixed slot count turns key partitioning into one node owning each slot.",
      Visual: S.RevealClusterSlots,
    },
    {
      title: 'Reveal: the licensing history',
      body: (
        <>
          BSD, until Redis moved to the dual RSALv2 and SSPL source-available licenses. The same
          year, the BSD-licensed Valkey fork formed under the Linux Foundation. A later major
          Redis release then added AGPLv3 as a further licensing option.
        </>
      ),
      duration: 5.6,
      fig: "BSD, until a licensing move spun off a BSD-licensed fork, then a later release added AGPLv3",
      takeaway: 'The licensing move split the engine into Redis and a separate BSD-licensed Valkey fork.',
      Visual: S.RevealLicensing,
    },
    {
      title: 'Recap',
      body: (
        <>
          One thread is the speed, not a limit on it. AOF trades RDB's own snapshot gap for
          logging every write. Async replication can lose an acknowledged write on failover.
          Cluster fixes the key space into owned slots. And licensing is now a real factor in
          choosing which engine to run at all.
        </>
      ),
      duration: 5.6,
      fig: "one thread for speed, RDB vs AOF, replication's own loss window, fixed hash slots, a real licensing split",
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A team needs a cache that must never lose an acknowledged write, even across a crash.
          Which of this topic's own defaults would they have to change, and to what?
        </>
      ),
      duration: 2.8,
      fig: 'a cache that must never lose an acknowledged write, even across a crash — change what?',
      predict: {
        options: [
          { label: 'Nothing — RDB snapshots already cover this' },
          { label: 'Switch to AOF with an aggressive fsync policy instead of relying on RDB alone', correct: true },
        ],
        explain: (
          <>
            Switch to AOF with an aggressive fsync policy. RDB alone accepts losing whatever
            changed since its last snapshot by design; AOF's own write-by-write log, fsynced
            aggressively, is what actually closes that gap.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
