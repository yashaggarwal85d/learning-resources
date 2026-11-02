import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// examples.py: the hook's own four combinations run as an ISR simulator (acks=all committing
// only once every in-sync replica has it; unclean leader election on vs off; min.insync.replicas
// at its two settings); the replica-count comparison between majority vote and the ISR approach
// for the same failure tolerance; and an Iceberg-style compare-and-swap commit where a losing
// writer retries. No literal digits anywhere (duration numbers exempt).
const reel: Reel = {
  steps: [
    {
      title: 'Hook: the one surviving replica never had the acknowledged write',
      body: (
        <>
          A topic's in-sync set has shrunk to the leader and one follower; a second follower
          fell behind and was dropped. A write gets acknowledged once both in-sync replicas have
          it. Then the leader and that follower fail together, leaving only the dropped follower
          standing — the one replica that never received the write.
        </>
      ),
      duration: 4.8,
      fig: "a write is acknowledged by both in-sync replicas; then both fail together, leaving only the one replica that was already dropped from the in-sync set",
      Visual: S.Hook,
    },
    {
      title: 'Predict: which settings decide whether the acknowledged write survives?',
      body: (
        <>
          Two settings each have two positions: unclean leader election on or off, and
          min.insync.replicas requiring every in-sync replica or letting the leader alone count.
          Across those combinations, does the acknowledged write survive?
        </>
      ),
      duration: 2.8,
      fig: "across unclean-election on/off and min.insync.replicas's two settings, does the acknowledged write survive the leader and its one in-sync follower both failing?",
      predict: {
        options: [
          { label: 'It depends only on min.insync.replicas; unclean leader election makes no difference to whether the write survives' },
          { label: 'With unclean election off the write stays safely unavailable; with it on, the dropped replica can become leader and the write is gone', correct: true },
        ],
        explain: (
          <>
            Unclean election is the deciding switch. With it off, the cluster waits for an
            in-sync replica to return, so the acknowledged write stays intact though unreachable.
            With it on, the dropped replica can become leader immediately, and its log — missing
            the write — becomes the new truth.
          </>
        ),
      },
      Visual: S.PredictCombinations,
    },
    {
      title: "Reveal: ZooKeeper's two guarantees, and a read that can lag behind them",
      body: (
        <>
          ZooKeeper promises linearizable writes and FIFO client order. An ephemeral node vanishes
          the instant its creating session ends, and a watch tells a client something changed — the
          two primitives behind leader election. Reads are served locally, so a plain read can
          lag; `sync` before a read closes that gap.
        </>
      ),
      duration: 4.8,
      fig: "ZooKeeper guarantees linearizable writes and FIFO client order; ephemeral nodes vanish when their session ends, watches signal change, and a local read can lag until a sync",
      Visual: S.RevealZooKeeper,
    },
    {
      title: 'Reveal: etcd, strictly serializable by default, with an opt-in stale read',
      body: (
        <>
          Every etcd key-value call is strictly serializable by default: atomic, totally ordered,
          and consistent with real time. An opt-in serializable read trades that guarantee for
          speed, allowed to return something stale. Leases bind a key to a lifetime; a revision
          counts every change exactly once.
        </>
      ),
      duration: 4.8,
      fig: "etcd's default is strictly serializable; an opt-in serializable read may be stale but is faster; leases bind keys to a lifetime, and a revision counts every change",
      Visual: S.RevealEtcd,
    },
    {
      title: "Reveal: Kafka's own words — the first major release without ZooKeeper",
      body: (
        <>
          Kafka's own release announcement calls this version the first major one to run entirely
          without the coordination service it depended on for years. In its place, a controller
          quorum replicates cluster metadata through the identical mechanism this chapter already
          opened: Raft.
        </>
      ),
      duration: 4.8,
      fig: "Kafka's own release announcement: the first major version to run entirely without the coordination service it depended on, replaced by a Raft-replicated controller quorum",
      Visual: S.RevealKRaft,
    },
    {
      title: "Reveal: the in-sync set is a quorum, but not a majority one",
      body: (
        <>
          Instead of a majority vote, Kafka keeps a dynamic set of in-sync replicas and commits
          only once every member of that set has the write. To tolerate a given number of
          failures, this costs one fewer replica than a majority vote needs — at the price of a
          commit waiting on the slowest in-sync replica, not just the fastest.
        </>
      ),
      duration: 4.8,
      fig: "Kafka's in-sync set commits a write once every member has it, needing one fewer replica than majority vote for the same failure tolerance, at the cost of waiting on the slowest member, not the fastest",
      takeaway: "A smaller quorum that waits for every member trades the majority vote's speed for the in-sync set's cheaper replica count.",
      Visual: S.RevealIsrQuorum,
    },
    {
      title: "Reveal: the trade a dropped setting makes, and the gap it still leaves",
      body: (
        <>
          With every in-sync replica required, a write survives any single failure among them.
          Letting the leader alone satisfy that requirement weakens the floor before any failure
          even happens. Unclean leader election trades consistency for availability outright —
          and even with it off, a last replica standing can still lose data on its own unclean
          restart, which is exactly what a later fix closes.
        </>
      ),
      duration: 4.8,
      fig: "requiring every in-sync replica protects against any one failure among them; letting the leader alone satisfy it weakens that floor before any failure happens; unclean election trades consistency for availability outright",
      Visual: S.RevealUncleanElection,
    },
    {
      title: "Reveal: a table commit is one compare-and-swap on a single pointer",
      body: (
        <>
          Changing a table's state means building new metadata and swapping one pointer to point
          at it — atomically, so every reader sees either the whole old state or the whole new
          one, never a mix. A writer whose swap loses the race doesn't fail; it rebuilds against
          whatever the pointer now says and tries again.
        </>
      ),
      duration: 4.8,
      fig: "a table commit swaps one pointer atomically, so every reader sees the whole old state or the whole new one, never a mix; a writer that loses the race rebuilds and retries",
      takeaway: "A table commit is this chapter's linearizable register: one pointer, swapped atomically, a losing writer retrying instead of failing.",
      Visual: S.RevealIcebergCas,
    },
    {
      title: 'Recap',
      body: (
        <>
          ZooKeeper and etcd each hand out a strongly consistent, if sometimes stale-on-request,
          store. KRaft replaces one with a Raft-replicated log. Kafka's in-sync set is a cheaper
          quorum with a real cost. A table commit is this chapter's linearizable register, swapped
          as one pointer.
        </>
      ),
      duration: 4.8,
      fig: "ZooKeeper and etcd hand out strongly consistent stores; KRaft replaces one with Raft; Kafka's in-sync set is a cheaper quorum with a cost; a table commit is a linearizable register swapped as one pointer",
      takeaway: "Every mechanism here is the same promise: one agreed value, changed atomically, kept by whichever group of replicas was asked.",
      Visual: S.Recap,
    },
    {
      title: 'Prove it: reads needing more than half the replicas and writes needing more than half — does that alone give a linearizable store?',
      body: (
        <>
          A design requires every read to query more than half the replicas and every write to
          reach more than half, reasoning that any read and any write must then overlap on at
          least one replica. Does that overlap alone make the store linearizable?
        </>
      ),
      duration: 2.8,
      fig: "a store requires more-than-half-sized read and write quorums, guaranteeing they overlap on at least one replica — does that overlap alone make the store linearizable?",
      predict: {
        options: [
          { label: 'Yes — any read quorum and any write quorum are guaranteed to share a replica, so a read always sees the latest write' },
          { label: "No — overlapping on one replica guarantees a read can see the latest write, not that it will, without more machinery to pick it out", correct: true },
        ],
        explain: (
          <>
            No. The overlap guarantees a shared replica exists somewhere in the intersection, not
            that the read protocol identifies and prefers whatever that replica is holding over
            every other answer it receives. Overlapping quorums are a necessary ingredient, not a
            finished linearizability proof by themselves.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
