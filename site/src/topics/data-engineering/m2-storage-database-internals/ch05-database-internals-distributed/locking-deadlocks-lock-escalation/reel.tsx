import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Three real experiments against this sandbox's real Postgres cluster (examples.py): a genuine
// cyclic-wait deadlock, caught by Postgres's own deadlock monitor; the exact same contention
// with a consistent lock order, producing zero deadlocks across repeated rounds; and a real
// ACCESS EXCLUSIVE lock, measured blocking a concurrent plain read for its own hold time.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Two sessions. Two locks, already held. Each one now wants exactly what the other is
          holding. Neither can move — and neither has errored yet.
        </>
      ),
      duration: 4.8,
      fig: 'two sessions, each holding what the other wants. Neither moves. No error, yet.',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: real lock modes',
      body: (
        <>
          A real database offers a whole range: one mode that only blocks a conflicting write, up
          to one mode that blocks everything, including a plain read.
        </>
      ),
      duration: 4.8,
      fig: 'from a lock that blocks only a write, up to one that blocks every single read too.',
      Visual: S.RevealLockModes,
    },
    {
      title: 'Reveal: intention locks',
      body: (
        <>
          Before locking one row, the engine marks its own intent at the table level first. One
          flag to check, instead of scanning every row lock the table might hold.
        </>
      ),
      duration: 4.8,
      fig: 'intent, marked at the table level first. One flag checked, not every row scanned.',
      Visual: S.RevealIntentionLocks,
    },
    {
      title: 'Predict: is finer granularity always better?',
      body: (
        <>
          Row-level locks protect the least data at once, and let the most transactions run
          side by side. Is finer-grained locking simply always the better choice?
        </>
      ),
      duration: 2.8,
      fig: 'finest granularity, most concurrency. Always the right call, or a real trade-off?',
      predict: {
        options: [
          { label: 'Yes — finer locks only ever help, since they block less' },
          { label: 'No — more, smaller locks cost more to track and can force escalation', correct: true },
        ],
        explain: (
          <>
            Finer locks really do unblock more transactions at once. But every one of them has to
            be tracked somewhere, and a transaction holding thousands of tiny locks is exactly
            what pushes a real engine to escalate to one big one instead.
          </>
        ),
      },
      Visual: S.PredictFinerAlwaysBetter,
    },
    {
      title: 'Reveal: the deadlock, for real',
      body: (
        <>
          The hook's own two sessions, reproduced against a real table. A genuine cyclic wait —
          caught by the engine's own deadlock monitor, and ended with a real error.
        </>
      ),
      duration: 4.8,
      fig: 'a real cyclic wait, measured. One session errors out; the other finally proceeds.',
      Visual: S.RevealDeadlockForReal,
    },
    {
      title: 'Reveal: detection vs prevention',
      body: (
        <>
          One philosophy waits, then checks for a cycle. The other decides from a transaction's
          own priority, before any cycle can even form, and aborts the loser outright.
        </>
      ),
      duration: 4.8,
      fig: 'wait, then check for a cycle — or decide from priority, before a cycle ever forms.',
      takeaway: 'A deadlock is never one transaction behaving badly. It takes two, each correct alone, waiting on exactly each other.',
      Visual: S.RevealDetectionVsPrevention,
    },
    {
      title: 'Reveal: the exact same contention, ordered',
      body: (
        <>
          Same two locks, same two sessions — acquired in the same order this time. Run it
          repeatedly, for real: not one single deadlock.
        </>
      ),
      duration: 4.8,
      fig: 'same contention, same order every time. Repeated, for real: zero deadlocks.',
      takeaway: 'The deadlock was never inevitable. It was one arbitrary choice, made two different ways: which lock to ask for first.',
      Visual: S.RevealConsistentOrder,
    },
    {
      title: 'Reveal: lock escalation',
      body: (
        <>
          Two real engines, two real thresholds: once a single statement holds thousands of
          fine-grained locks, it gets traded in for one coarse lock on the whole table.
        </>
      ),
      duration: 4.8,
      fig: 'thousands of fine-grained locks, traded for one coarse lock. Two real vendor thresholds.',
      Visual: S.RevealLockEscalation,
    },
    {
      title: 'Reveal: the migration hazard, measured',
      body: (
        <>
          The exact lock level most schema changes acquire, held for a fraction of a second.
          A plain read on that same table blocks for that entire fraction of a second.
        </>
      ),
      duration: 4.8,
      fig: 'the DDL lock level, held briefly. A plain read: blocked for that entire stretch.',
      takeaway: "A migration doesn't need to run long to hurt. It only needs the one lock level that blocks every read.",
      Visual: S.RevealMigrationHazard,
    },
    {
      title: 'Recap',
      body: (
        <>
          Real lock modes, a real deadlock caught and a real one avoided, two philosophies for
          catching a cycle, and one lock level that can stall an entire table's own reads.
        </>
      ),
      duration: 4.8,
      fig: 'lock modes, a deadlock caught, one avoided, two philosophies, one lock that stalls reads.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A migration runs an ALTER TABLE that adds a column with an expensive default, on a
          busy production table. What's actually at risk, and for how long?
        </>
      ),
      duration: 2.8,
      fig: 'ALTER TABLE, an expensive default, a busy table. What breaks, and for how long?',
      predict: {
        options: [
          { label: "Only writers are at risk — reads use a snapshot and don't need the table lock" },
          { label: 'Every read and write is blocked for the whole statement, not just the fast part', correct: true },
        ],
        explain: (
          <>
            It's tempting to assume reads are safe since they don't modify anything. But the lock
            level this kind of ALTER TABLE needs blocks every read too, for as long as the
            whole statement takes — including the slow part, computing that expensive default.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
