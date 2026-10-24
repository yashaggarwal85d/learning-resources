import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Three real experiments against a real Postgres cluster in this sandbox under REPEATABLE READ
// (examples.py): topic 11's own read-skew scenario, rerun, now prevented (x=50, y=50 both
// times); a real write-write conflict on one row, caught with a genuine SerializationFailure,
// first-committer-wins; and the "on-call doctors" write-skew reproduction, where two disjoint
// writes never conflict and the invariant ends up broken (on-call count: 0) with no error at all.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Two on-call doctors. The hospital's own rule: at least one has to stay. Both check the
          schedule, both go home, both transactions commit cleanly. Zero doctors on call.
        </>
      ),
      duration: 4.8,
      fig: 'two doctors, one rule, two clean commits. Zero doctors left on call. No error anywhere.',
      Visual: S.Hook,
    },
    {
      title: "Reveal: snapshot isolation's own mechanism",
      body: (
        <>
          Every read inside a transaction comes from one fixed snapshot, taken at its own start.
          On commit, if anything you touched was changed by someone else since then, you lose.
        </>
      ),
      duration: 4.8,
      fig: 'one fixed snapshot per transaction. Commit fails if a touched row changed since then.',
      Visual: S.RevealSnapshotMechanism,
    },
    {
      title: 'Predict: two doctors, one rule',
      body: (
        <>
          Snapshot isolation catches a real write-write conflict on the same row. Does it also
          catch two doctors, each updating a different row?
        </>
      ),
      duration: 2.8,
      fig: 'one row, caught. Two different rows, each updated by a different doctor — caught too?',
      predict: {
        options: [
          { label: 'Yes — the shared rule they both read from makes it a conflict either way' },
          { label: "No — two different rows never conflict, no matter what they're both reading", correct: true },
        ],
        explain: (
          <>
            It feels like it should count as a conflict — they're reading the same shared rule.
            But snapshot isolation only ever compares what you wrote against what changed since
            your snapshot. Two different rows never collide, however related they are in meaning.
          </>
        ),
      },
      Visual: S.PredictTwoDoctorsOneRule,
    },
    {
      title: 'Reveal: SI prevents read skew',
      body: (
        <>
          The same scenario from the last topic, rerun with a real snapshot instead of Read
          Committed. Both of T1's own reads now land on the same point in time: x fifty, y fifty.
        </>
      ),
      duration: 4.8,
      fig: "T1's two reads, same snapshot both times: x=50, y=50. Topic 11's inconsistent pair, gone.",
      Visual: S.RevealPreventsReadSkew,
    },
    {
      title: 'Reveal: SI catches a write-write conflict',
      body: (
        <>
          Two transactions both update the same row from the same snapshot. T1 commits balance
          one hundred ten. T2's own conflicting write gets a real serialization failure.
        </>
      ),
      duration: 4.8,
      fig: 'same row, same snapshot, both try to write. T1 commits. T2: a real serialization failure.',
      Visual: S.RevealCatchesWriteWriteConflict,
    },
    {
      title: 'Reveal: write skew survives anyway',
      body: (
        <>
          The hook's own doctors, reproduced for real. Both read a count of two from their own
          snapshot, both write their own separate row. Neither write ever touches the other's row.
        </>
      ),
      duration: 4.8,
      fig: 'both doctors read 2, both write their own row. No shared row, no conflict, both commit.',
      takeaway: 'Snapshot isolation checks whether a written row changed since your snapshot — never a rule spanning two separate rows.',
      Visual: S.RevealWriteSkewSurvives,
    },
    {
      title: 'Reveal: the vendor-naming traps',
      body: (
        <>
          Postgres's own Repeatable Read is snapshot isolation, by its own docs. Oracle's own
          Serializable is snapshot isolation too — and Oracle calls it serializable anyway.
        </>
      ),
      duration: 4.8,
      fig: 'Postgres "Repeatable Read" = SI. Oracle "Serializable" = SI. MySQL mixes two read kinds.',
      takeaway: 'Three real vendors, three names for the same mechanism — none of them the word the standard actually uses.',
      Visual: S.RevealVendorNamingTraps,
    },
    {
      title: 'Predict: a fix without changing levels?',
      body: (
        <>
          Without touching the isolation level at all, is there any way to make the doctors
          scenario safe?
        </>
      ),
      duration: 2.8,
      fig: 'same isolation level, same two transactions. Any fix at all, without raising the level?',
      predict: {
        options: [
          { label: 'No — the only real fix is a stricter isolation level entirely' },
          { label: "Yes — force a real conflict onto a shared row, and SI's own rule catches it", correct: true },
        ],
        explain: (
          <>
            Raising the level is one route, but not the only one. Give both transactions a real
            row to collide on — lock it, or touch it — and the exact same first-committer-wins
            rule that already works for one row now has something to catch.
          </>
        ),
      },
      Visual: S.PredictFixWithoutChangingLevels,
    },
    {
      title: 'Reveal: materializing the conflict',
      body: (
        <>
          A real lock on a shared row closes this one case. But it's a patch for this scenario,
          not a guarantee — a different query against the same rule can reopen the same gap.
        </>
      ),
      duration: 4.8,
      fig: 'lock a shared row: this case, closed. A different query on the same rule: open again.',
      takeaway: 'A patch closes only the case you wrote it for. A guarantee needs no case thought of at all.',
      Visual: S.RevealMaterializingConflict,
    },
    {
      title: 'Recap',
      body: (
        <>
          One mechanism: a snapshot, and first-committer-wins. Two real preventions. One real
          survivor. Three vendors, three names for the same thing.
        </>
      ),
      duration: 4.8,
      fig: 'one mechanism, two anomalies prevented, one that survives, three vendor names for it.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Two transactions, each reading the same shared total, each updating only its own
          separate row, both committing with no error. Safe, a caught conflict, or write skew?
        </>
      ),
      duration: 2.8,
      fig: 'shared read, separate writes, no error from either commit. Which of the three is this?',
      predict: {
        options: [
          { label: 'A caught write-write conflict — the same row was touched twice' },
          { label: 'Write skew — a shared constraint, two disjoint writes, no row in common', correct: true },
        ],
        explain: (
          <>
            No row was ever written twice, so snapshot isolation never had anything to catch.
            Two transactions reading one shared total, then each independently writing a
            different row that total depends on, is exactly write skew.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
