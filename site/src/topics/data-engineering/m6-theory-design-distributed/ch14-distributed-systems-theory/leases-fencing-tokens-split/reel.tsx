import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// examples.py: the check-before-write hazard run as an actual event sequence; the identical
// zombie-leader scenario shown corrupting data with no fencing and rejected cleanly with it; and
// a random, unique-but-non-increasing token shown unable to tell which write came later. No
// literal digits anywhere (duration numbers exempt).
const reel: Reel = {
  steps: [
    {
      title: "Hook: a worker checks its lease, then overwrites a job that moved on without it",
      body: (
        <>
          A worker holds the lock on a nightly rebuild job and pauses for a long stretch mid-task.
          The lease expires; a second worker takes it and starts writing. The first worker wakes
          up, finishes, and writes over the second worker's result — having checked, just before
          pausing, that its lease was still held.
        </>
      ),
      duration: 4.8,
      fig: "a paused worker's lease expires, a second worker takes over and writes, and the first worker wakes and overwrites it — having checked its lease just before it paused",
      Visual: S.Hook,
    },
    {
      title: 'Predict: re-check the lease, lengthen it, or make storage reject the old holder?',
      body: (
        <>
          What would have actually prevented this: having the first worker re-check its lease
          right before writing, giving it a longer lease to begin with, or having the storage
          layer itself refuse the old worker's write?
        </>
      ),
      duration: 2.8,
      fig: "would re-checking the lease before writing, a longer lease, or storage refusing the old write have actually prevented this?",
      predict: {
        options: [
          { label: 'Re-checking the lease right before the write would have caught it' },
          { label: "Only storage refusing a write from an old holder actually prevents it, regardless of any check or lease length", correct: true },
        ],
        explain: (
          <>
            Only the storage check works. The pause can land at any point, including between
            whatever check you add and the write itself — a longer lease only delays the same
            failure, and another check is just one more place for the pause to land.
          </>
        ),
      },
      Visual: S.PredictFix,
    },
    {
      title: 'Reveal: a lease turns a quorum read into a local one',
      body: (
        <>
          A lease is a promise from a quorum not to elect another leader until a deadline. While
          it holds, no other leader can exist, so the holder can answer reads locally and still be
          linearizable — at the price of assuming its clock and the quorum's drift by less than a
          known bound.
        </>
      ),
      duration: 4.8,
      fig: "a lease is a quorum's promise not to elect another leader until a deadline; while it holds, a local read stays linearizable, at the price of a bounded clock-drift assumption",
      Visual: S.RevealLease,
    },
    {
      title: 'Reveal: why checking right before the write does not help',
      body: (
        <>
          A pause can begin at any point in a program, including the single instant between a
          check and the write that follows it. Moving the check closer to the write does not close
          that gap; it just relocates where the pause can land.
        </>
      ),
      duration: 4.8,
      fig: "a pause can land anywhere, including the gap between a check and the write right after it — moving the check closer doesn't close that gap, it just relocates it",
      Visual: S.RevealCheckFails,
    },
    {
      title: 'Reveal: a fencing token, checked by the resource itself',
      body: (
        <>
          The fix moves the check off the client and onto the resource: a number that only
          increases, sent with every write, and rejected by the storage layer if it has already
          seen something higher. The paused worker's stale write carries an old number and gets
          turned away.
        </>
      ),
      duration: 4.8,
      fig: "a fencing token only increases, travels with every write, and gets checked by the resource itself, which rejects any write carrying a token lower than one it has already seen",
      takeaway: "Safety has to be enforced by the resource, because no client-side check can survive an arbitrarily long pause.",
      Visual: S.RevealFencingToken,
    },
    {
      title: 'Reveal: the same idea under four different names',
      body: (
        <>
          Chubby hands out a sequencer carrying a lock generation number. Kafka's producer carries
          an epoch, fencing an older producer with the same transactional id. ZooKeeper stamps
          every change with a zxid. Raft's term does the identical job for a leader. One
          mechanism, four production names.
        </>
      ),
      duration: 4.8,
      fig: "Chubby's sequencer, Kafka's producer epoch, ZooKeeper's zxid, and Raft's term are the same fencing idea under four different names",
      Visual: S.RevealFourNames,
    },
    {
      title: 'Reveal: a lock alone is a hint, not a guarantee',
      body: (
        <>
          A lock only coordinates well-behaved clients; it cannot force a paused one to stay quiet.
          Safety has to live in the resource, not in the handshake around it. Chubby's lock-delay,
          a grace period after an apparent failure, is its imperfect fallback for resources that
          cannot check a token at all.
        </>
      ),
      duration: 4.8,
      fig: "a lock coordinates well-behaved clients but cannot force a paused one to stay quiet; Chubby's lock-delay is an imperfect fallback for resources that cannot check a token",
      takeaway: "A distributed lock without fencing is only a hint about who should act, never a guarantee that only they will.",
      Visual: S.RevealLockIsHint,
    },
    {
      title: 'Recap',
      body: (
        <>
          A lease buys a local linearizable read at the price of a clock-drift bound. No check
          beats an arbitrarily long pause. A fencing token, enforced by the resource, does. Chubby,
          Kafka, ZooKeeper and Raft all reach for the identical number.
        </>
      ),
      duration: 4.8,
      fig: "a lease buys a local read at the price of a clock-drift bound; no client-side check beats a long pause; a resource-enforced fencing token does, under four production names",
      takeaway: "The pause that breaks a lease check is exactly the pause a resource-enforced fencing token was built to survive.",
      Visual: S.Recap,
    },
    {
      title: 'Prove it: a lock service hands out a unique random token every time — is that enough?',
      body: (
        <>
          A lock service switches from an increasing counter to a unique random string for every
          grant, reasoning that uniqueness alone should stop a stale write from being mistaken for
          a fresh one. Does that fix the zombie-leader problem?
        </>
      ),
      duration: 2.8,
      fig: "a lock service switches to a unique random token instead of an increasing counter — does uniqueness alone fix the zombie-leader problem?",
      predict: {
        options: [
          { label: 'No — uniqueness tells the storage the writes are different, but gives it no way to know which one came later', correct: true },
          { label: "Yes — as long as every token is different, the storage can always tell the paused client's write is the wrong one" },
        ],
        explain: (
          <>
            No. The storage layer's whole defense depends on comparing a new token against the
            highest one it has already seen. A random token is distinct from every other, but
            distinctness carries no order — the storage cannot tell an old random string from a
            new one just by looking at it.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
