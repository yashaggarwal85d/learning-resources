import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// No live lab of its own (CHAPTER.md): five real simulations in examples.py -- the Spanner
// pattern as a composition of range-sharding, per-range consensus, and two-phase commit; a
// hybrid logical clock staying monotonic despite skew; commit-wait enforcing external
// consistency; optimistic concurrency control checking conflicts only at commit time; and the
// real round-trip price a distributed-SQL commit pays that a single-node Postgres doesn't.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Range-sharding, per-range consensus, two-phase commit — three mechanisms this chapter
          already built, separately. One real system runs all three, together, on every write.
        </>
      ),
      duration: 4.8,
      fig: 'three mechanisms, already built separately. One system runs them together.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: is the Spanner pattern a fourth, new mechanism?',
      body: (
        <>
          Does the distributed SQL pattern these systems use need a genuinely new mechanism, or
          is it built entirely from pieces already covered in this chapter?
        </>
      ),
      duration: 2.8,
      fig: 'a new mechanism, or entirely pieces already covered?',
      predict: {
        options: [
          { label: "A new mechanism — distributed SQL needs something beyond replication, partitioning and consensus" },
          { label: "Entirely a composition — range-sharding, per-range consensus, and two-phase commit, together", correct: true },
        ],
        explain: (
          <>
            A cross-range write really does just chain the pieces already built: each range's own
            consensus group commits its own slice, and a two-phase commit gets every slice to
            agree together.
          </>
        ),
      },
      Visual: S.PredictNewMechanism,
    },
    {
      title: 'Reveal: the composition, measured',
      body: (
        <>
          A transaction touching two ranges: each range's own consensus group commits its own
          piece, then a two-phase commit gets both pieces to agree together. Nothing new.
        </>
      ),
      duration: 4.8,
      fig: 'two ranges, each committing on its own, then agreeing together.',
      Visual: S.RevealComposition,
    },
    {
      title: 'Reveal: a clock that never goes backward',
      body: (
        <>
          Feed a clock real, skewed readings that jump backward twice. A hybrid logical clock's
          own timestamps still strictly increase every time — the skew never shows up downstream.
        </>
      ),
      duration: 4.8,
      fig: 'real clock skew, twice. The HLC timestamps still only go up.',
      takeaway: "A hybrid logical clock doesn't need a perfect physical clock — it only needs to never repeat or go backward.",
      Visual: S.RevealHLC,
    },
    {
      title: 'Reveal: commit wait, measured',
      body: (
        <>
          A commit waits out its clock's own uncertainty window before anyone can see it. That
          wait is exactly what guarantees an earlier commit always gets a smaller timestamp.
        </>
      ),
      duration: 5.2,
      fig: "a commit waits out its own uncertainty. The order becomes real.",
      takeaway: "External consistency isn't free — it's purchased with a real wait, measured in exactly how uncertain the clock is.",
      Visual: S.RevealCommitWait,
    },
    {
      title: 'Predict: when does an optimistic scheme actually check for a conflict?',
      body: (
        <>
          Two transactions read and modify the identical row, with no lock taken by either one.
          When does an optimistic scheme actually notice they conflict?
        </>
      ),
      duration: 2.8,
      fig: 'two transactions, same row, no locks. When does a conflict surface?',
      predict: {
        options: [
          { label: "Immediately — the second transaction is blocked the moment it touches the row" },
          { label: "Only at commit time — the loser finds out after doing all its own work", correct: true },
        ],
        explain: (
          <>
            With no lock table at all, nothing stops either transaction from reading and working
            against the row. The check only happens once a transaction tries to commit, against
            whatever actually landed first.
          </>
        ),
      },
      Visual: S.PredictOCCTiming,
    },
    {
      title: 'Reveal: optimistic concurrency, measured',
      body: (
        <>
          Both transactions read the same unlocked row. The first to commit succeeds outright.
          The second only discovers the conflict when its own commit is rejected.
        </>
      ),
      duration: 4.8,
      fig: 'both read, unlocked. First commits; second is rejected, only now.',
      takeaway: "Optimistic concurrency trades a lock's upfront cost for a real chance of wasted work that only surfaces at commit.",
      Visual: S.RevealOCCMeasured,
    },
    {
      title: 'Reveal: the real latency price',
      body: (
        <>
          A single-node Postgres commit pays no extra network round trip beyond the one the
          client already made. The identical write, spread across ranges, pays for several.
        </>
      ),
      duration: 4.8,
      fig: 'single-node: no extra trip. Spread across ranges: several.',
      Visual: S.RevealLatencyPrice,
    },
    {
      title: 'Recap',
      body: (
        <>
          The Spanner pattern composes range-sharding, per-range consensus and two-phase commit;
          HLC and commit-wait buy external consistency; optimistic concurrency checks late; none
          of it is free.
        </>
      ),
      duration: 4.8,
      fig: "a composition, with a real, measured price, not a free upgrade.",
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A team's entire dataset fits comfortably on one machine, every write stays inside one
          table, and they're choosing between a distributed SQL system and a single Postgres
          instance.
        </>
      ),
      duration: 2.8,
      fig: 'data fits on one machine. Distributed SQL, or plain Postgres?',
      predict: {
        options: [
          { label: "Distributed SQL — the global scale and consistency guarantees are always worth having" },
          { label: "Plain Postgres — paying consensus and two-phase-commit round trips for data that fits on one machine buys nothing", correct: true },
        ],
        explain: (
          <>
            Every one of this topic's own measured costs — the per-range consensus round trip,
            the two-phase commit, the commit-wait window — exists to coordinate data that's
            actually spread across machines. None of it has anything to solve when the data isn't
            spread in the first place.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
