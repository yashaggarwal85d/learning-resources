import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real results from this topic's own examples.py: a toy transaction coordinator that really
// fences a zombie instance by transactional id, and a toy log that really filters an aborted
// transaction's records by isolation level. No literal digits anywhere below (duration numbers
// are exempt); the real values are shown in scenes.tsx.
const reel: Reel = {
  steps: [
    {
      title: 'Hook: one offset, several writes, all or nothing',
      body: (
        <>
          Idempotence covers one producer, one partition, one session. Reading an input offset and
          writing several output partitions needs all of that to succeed or fail as a single unit.
        </>
      ),
      duration: 4.8,
      fig: "an input offset and several output partitions, all needing to succeed or fail as one unit",
      Visual: S.Hook,
    },
    {
      title: 'Setup: an identity that outlives a restart',
      body: (
        <>
          A producer can carry a stable, application-chosen identity across restarts now. A
          dedicated coordinator tracks every transaction's state, separate from the data itself.
        </>
      ),
      duration: 4.8,
      fig: "a stable id across restarts, and a dedicated coordinator tracking every transaction's state",
      Visual: S.Setup,
    },
    {
      title: 'Predict: what happens to a still-writing old instance?',
      body: (
        <>
          A producer restarts under the same stable identity, but its old instance is still
          mid-write somewhere. What happens to that old instance's writes?
        </>
      ),
      duration: 2.8,
      fig: 'a producer restarts under the same transactional id while an old instance is still writing',
      predict: {
        options: [
          { label: 'They queue up behind the new instance and eventually land' },
          { label: "They're fenced off, rejected as belonging to a finished session", correct: true },
          { label: 'The coordinator merges both instances into one session' },
        ],
        explain: (
          <>
            They're fenced off outright. The restart is given a higher session marker, and
            anything still arriving under the old one is recognized as stale and rejected.
          </>
        ),
      },
      Visual: S.PredictZombie,
    },
    {
      title: 'Reveal: a restart fences, it never merges',
      body: (
        <>
          The new instance gets a higher session marker. A write still carrying the old one is
          rejected, not queued or merged — a zombie instance from before the restart loses outright.
        </>
      ),
      duration: 4.8,
      fig: 'the restart bumps the epoch — a write still under the old one is fenced off',
      Visual: S.RevealZombie,
    },
    {
      title: 'Predict: does a reader see an aborted write?',
      body: (
        <>
          A transaction gets aborted, but its records are still physically sitting in the log.
          Does an ordinary reader see them, the same way it sees anything else?
        </>
      ),
      duration: 2.8,
      fig: "an aborted transaction's records are still sitting right there in the log — does a reader see them?",
      predict: {
        options: [
          { label: "No — Kafka deletes an aborted transaction's records immediately" },
          { label: "It depends entirely on which isolation level the reader chose", correct: true },
          { label: 'Yes — every reader sees every record, aborted or not' },
        ],
        explain: (
          <>
            It depends on isolation level. The records are never deleted — one isolation level
            shows them anyway, and the other filters them out by checking each transaction's
            outcome.
          </>
        ),
      },
      Visual: S.PredictVisibility,
    },
    {
      title: 'Reveal: filtered at read time, not erased at write time',
      body: (
        <>
          One isolation level returns every record, aborted or not. The stricter one only returns
          records from transactions that actually committed, filtered up to a tracked boundary.
        </>
      ),
      duration: 4.8,
      fig: 'read_uncommitted sees everything; read_committed filters by outcome, up to the last stable offset',
      takeaway: 'An aborted transaction never gets erased from the log — the stricter isolation level just declines to show it.',
      Visual: S.RevealVisibility,
    },
    {
      title: "Reveal: the second crash window, closed inside Kafka",
      body: (
        <>
          Committing the input offset inside the exact same transaction as the output writes means
          both happen or neither does — closing the consumer-side crash window named earlier.
        </>
      ),
      duration: 4.8,
      fig: 'committing the input offset inside the same transaction as the output writes',
      takeaway: "Reading, transforming, and producing become one atomic unit once the offset commit rides inside the same transaction as the output.",
      Visual: S.RevealConsumeTransformProduce,
    },
    {
      title: 'Reveal: a stuck transaction defended against, a door opened wider',
      body: (
        <>
          A newer server-side defense stops one hung transaction from blocking every strict reader
          indefinitely. A separate addition lets an entirely external system join a transaction
          too.
        </>
      ),
      duration: 4.8,
      fig: 'a server-side defense against a stuck transaction, and a door opening to an external coordinator',
      takeaway: "A server-side defense bounds a stuck transaction's damage; a separate addition lets an outside system join the same transaction.",
      Visual: S.RevealNewerKips,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Every figure in this reel so far came from a real run of this topic's own toy
          coordinator-and-log model, just now — the fencing, and the committed-versus-uncommitted
          comparison.
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
          A stable identity survives a restart. A coordinator tracks every transaction. One
          isolation level filters by outcome. And offsets ride inside the same write as the output.
        </>
      ),
      duration: 4.8,
      fig: 'a stable id, a coordinator, a visibility rule, and offsets committed inside the write itself',
      Visual: S.Recap,
    },
  ],
};

export default reel;
