import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Snapshot isolation's own commit rule only checks for same-key writes,
// so it genuinely lets write skew through even while two transactions
// each individually preserve a shared invariant; a stricter,
// dependency-graph check catches exactly that pattern, a cycle of
// opposing read-write dependencies, while correctly leaving unrelated
// transactions alone.
const reel: Reel = {
  steps: [
    {
      title: 'Two on-call doctors, both currently on call. Each one separately checks: is at least one other doctor on call? Each gets yes, and each goes off call. Does the shared rule survive?',
      body: (
        <>
          Two doctors, both on call, both about to check and leave.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, since each check genuinely passed' },
          { label: 'No, it genuinely breaks, even though neither check was wrong', correct: true },
          { label: 'It depends on which one commits first' },
        ],
        explain: (
          <>
            It breaks. Each check was individually correct, yet together they fail.
          </>
        ),
      },
      Visual: S.WriteSkewPredict,
    },
    {
      title: 'Measured: it breaks, with no write-write conflict at all',
      body: (
        <>
          Snapshot isolation lets this through because the two writes never touch the same key.
        </>
      ),
      duration: 3.0,
      Visual: S.WriteSkewReveal,
    },
    {
      title: "Both transactions wrote different doctors' own rows, never the same one. Does a snapshot-isolation database even notice a conflict here at all?",
      body: (
        <>
          Two disjoint writes, one commit rule.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, any two concurrent transactions conflict' },
          { label: 'No, genuinely; same-key writes are the only conflict it checks for', correct: true },
          { label: 'Only if they commit at the exact same instant' },
        ],
        explain: (
          <>
            No conflict. Same-key writes are the only thing checked.
          </>
        ),
      },
      Visual: S.NoConflictPredict,
    },
    {
      title: "Measured: no conflict, genuinely; snapshot isolation's own commit rule only checks for writes to the identical key",
      body: (
        <>
          The real, measured result, no conflict found.
        </>
      ),
      duration: 3.0,
      takeaway: 'Snapshot isolation genuinely permits write skew through; its own commit rule was never designed to catch it.',
      Visual: S.NoConflictReveal,
    },
    {
      title: "A stricter check instead builds a real dependency graph between the two transactions' own reads and writes. Does that graph genuinely catch what the write-write check missed?",
      body: (
        <>
          The same two transactions, a dependency graph instead.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, it misses the identical thing' },
          { label: 'Yes, genuinely; it finds a dangerous two-edge cycle', correct: true },
          { label: 'Only with a third, unrelated transaction watching' },
        ],
        explain: (
          <>
            Yes. It finds a real, dangerous two-edge cycle.
          </>
        ),
      },
      Visual: S.CyclePredict,
    },
    {
      title: "Measured: a real, two-edge cycle, genuinely found; each transaction's own read was invalidated by the other's write",
      body: (
        <>
          The real, measured cycle, found.
        </>
      ),
      duration: 3.0,
      takeaway: "A cycle of two opposing read-write dependencies between the identical pair of transactions is exactly write skew's own signature.",
      Visual: S.CycleReveal,
    },
    {
      title: 'Run that same stricter check against two entirely unrelated transactions instead, touching different doctors nobody else reads from. Does it still flag them?',
      body: (
        <>
          Two independent transactions, the same check.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, it flags every concurrent pair the same way' },
          { label: 'No, genuinely; it correctly finds no cycle at all', correct: true },
          { label: 'Only if they happen to commit in the same instant' },
        ],
        explain: (
          <>
            No cycle. Unrelated transactions pass straight through.
          </>
        ),
      },
      Visual: S.NoCyclePredict,
    },
    {
      title: "Measured: no cycle, genuinely, for two transactions that never read each other's own writes",
      body: (
        <>
          The real, measured result, no cycle found.
        </>
      ),
      duration: 3.0,
      takeaway: "The stricter check isn't simply stricter about everything; it correctly lets unrelated transactions straight through.",
      Visual: S.NoCycleReveal,
    },
    {
      title: "PostgreSQL's own documentation states this exact anomaly directly, using two account classes instead of two doctors. What does it call the result of committing a group of transactions in a way no one-at-a-time ordering could produce?",
      body: (
        <>
          PostgreSQL's own words on the serialization anomaly, shown directly.
        </>
      ),
      duration: 2.8,
      Visual: S.SerializationAnomalyReveal,
    },
    {
      title: 'Recap: what a stricter check catches, and what it leaves alone',
      body: (
        <>
          Snapshot isolation's own commit rule only checks for same-key writes, so it genuinely lets write skew through even while two transactions each individually preserve a shared invariant; a stricter, dependency-graph check catches exactly that pattern, a cycle of opposing read-write dependencies, while correctly leaving unrelated transactions alone.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
