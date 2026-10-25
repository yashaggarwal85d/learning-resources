import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// One real measured experiment against this sandbox's real Postgres cluster (examples.py): a
// real physical replication slot, real writes with nothing consuming it, the retained WAL
// measured directly, then dropping to zero once a real consumer catches up.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A replica needs everything the primary has. What exactly does "everything" mean to
          actually ship across the wire?
        </>
      ),
      duration: 4.8,
      fig: 'the replica needs everything. What does "everything" mean to ship?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: physical, exact bytes',
      body: (
        <>
          The exact block addresses, byte for byte. Fast, cheap to decode, and tied to one exact
          major version on both ends.
        </>
      ),
      duration: 4.8,
      fig: 'exact bytes, block for block. One version, on both sides.',
      Visual: S.RevealPhysicalExactBytes,
    },
    {
      title: 'Reveal: logical, decoded changes',
      body: (
        <>
          Not bytes — the actual row changes, decoded, selective, and readable across different
          major versions. The same mechanism change-data-capture is built on.
        </>
      ),
      duration: 4.8,
      fig: 'decoded row changes, not bytes. Readable across versions.',
      Visual: S.RevealLogicalDecodedChanges,
    },
    {
      title: 'Predict: what happens to the data a stalled consumer hasn’t read yet?',
      body: (
        <>
          A replica's own consumer stops reading. What happens to the data it hasn't consumed
          yet?
        </>
      ),
      duration: 2.8,
      fig: "a consumer stops reading. What happens to what it hasn't read yet?",
      predict: {
        options: [
          { label: 'Eventually the primary cleans it up — old WAL gets recycled either way' },
          { label: "The primary keeps it, however long that takes", correct: true },
        ],
        explain: (
          <>
            The primary has no way to know the consumer is gone for good versus just slow. A
            replication slot is its own promise not to guess — it keeps every byte the consumer
            hasn't confirmed yet, for as long as the slot exists.
          </>
        ),
      },
      Visual: S.PredictStalledConsumer,
    },
    {
      title: 'Reveal: replication slots, named',
      body: (
        <>
          A slot is the primary's own promise: don't remove the WAL a consumer still needs,
          however long that consumer takes.
        </>
      ),
      duration: 4.8,
      fig: 'a slot is a promise. Keep the WAL until it is actually read.',
      Visual: S.RevealReplicationSlotsNamed,
    },
    {
      title: 'Reveal: a stalled slot, measured',
      body: (
        <>
          A real slot, real writes, nothing ever consuming it. The WAL retained on its behalf,
          measured directly against this sandbox's own cluster.
        </>
      ),
      duration: 4.8,
      fig: 'thousands of real writes, nothing consuming. Real WAL retained, measured.',
      takeaway: 'A slot keeps its promise whether or not the consumer is ever coming back. Nothing checks for you.',
      Visual: S.RevealStalledSlotMeasured,
    },
    {
      title: 'Reveal: the outage, and the fix, measured',
      body: (
        <>
          Left too long, that promise fills the disk. The same slot, caught up by a real
          consumer: retention drops back to nothing.
        </>
      ),
      duration: 4.8,
      fig: 'left too long, it fills the disk. Caught up, it drops to nothing.',
      takeaway: "The fix only stops further growth. What's already retained needs the consumer to actually catch up to it.",
      Visual: S.RevealOutageAndFixMeasured,
    },
    {
      title: 'Reveal: failover-safe logical slots',
      body: (
        <>
          PostgreSQL 17 lets a logical slot survive its own primary's failover, named directly
          from the release notes. This sandbox runs 16.
        </>
      ),
      duration: 4.8,
      fig: "PostgreSQL seventeen: a logical slot can survive its own failover.",
      Visual: S.RevealFailoverSafeLogicalSlots,
    },
    {
      title: 'Reveal: the same idea elsewhere',
      body: (
        <>
          MySQL's own row-based binary log: not the statement that ran, but every row it
          actually changed, logged separately.
        </>
      ),
      duration: 4.8,
      fig: 'not the statement that ran. Every row it actually changed.',
      takeaway: 'Decoded row changes are not a Postgres-only idea. The same bet, row by row, underlies MySQL replication too.',
      Visual: S.RevealSameIdeaElsewhere,
    },
    {
      title: 'Recap',
      body: (
        <>
          Bytes or changes; a slot's promise, and what it costs when nobody collects on it.
        </>
      ),
      duration: 4.8,
      fig: 'bytes or changes. A promise, and its cost when nobody collects.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A consumer reading a logical replication slot crashes and stays down for six hours,
          during a sale that doubles the write rate.
        </>
      ),
      duration: 2.8,
      fig: 'down for six hours. Double the writes. What does this do to the disk?',
      predict: {
        options: [
          { label: "Restarting the consumer alone undoes whatever already piled up" },
          { label: 'Restarting it only stops further growth — the pile-up needs catching up too', correct: true },
        ],
        explain: (
          <>
            The slot spent six hours, at double the usual rate, retaining every byte the primary
            thought the consumer still needed. Restarting the consumer stops that growth, but
            the already-retained WAL is only released once the consumer actually reads through
            it — exactly what this topic's own measurement showed.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
