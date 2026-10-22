import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Measured on this sandbox: a real customer dimension loaded with a single MERGE statement, run
// twice to prove idempotency, and a real out-of-order, duplicated change feed rebuilt into the
// correct effective/expiry chain (SOURCES.md, examples.py). Every number on screen traces to a
// literal constant in examples.py; everything else is spelled in words.
const reel: Reel = {
  steps: [
    {
      title: 'One customer, one changed address',
      body: (
        <>
          A customer's address changes. Overwrite the old one, and every past fact row silently
          points at an address that was never true when the sale actually happened.
        </>
      ),
      duration: 4.8,
      fig: 'overwrite the address, or keep both versions?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: SCD Type 2, quoted directly',
      body: (
        <>
          Type 2 changes add a new row with the updated values instead of overwriting — a new
          surrogate key for the new version, with the old row and its own key left untouched.
        </>
      ),
      duration: 4.8,
      fig: 'a new row, a new surrogate key, the old row left alone',
      Visual: S.RevealSCD2Quote,
    },
    {
      title: 'Predict: does a single MERGE statement expire the old row and insert the new one at once?',
      body: (
        <>
          Expiring the old address version and inserting the new one both have to happen together.
          Can one single MERGE statement actually do both at once?
        </>
      ),
      duration: 2.8,
      fig: 'expire the old row, insert the new one — one statement?',
      predict: {
        options: [
          { label: 'No — that genuinely needs two separate statements' },
          { label: 'Yes — one MERGE, with the right WHEN clauses, does both', correct: true },
        ],
        explain: (
          <>
            Yes. A single MERGE can carry a clause for the row that's no longer matched by the new
            source and a clause for the version that wasn't matched by the old target, both at once.
          </>
        ),
      },
      Visual: S.PredictSingleMerge,
    },
    {
      title: 'Reveal: MERGE, quoted directly',
      body: (
        <>
          MERGE provides one single SQL statement that can conditionally insert, update, or delete
          — a task that would otherwise need several separate procedural steps.
        </>
      ),
      duration: 4.8,
      fig: 'one statement, conditional insert, update, or delete',
      Visual: S.RevealMergeQuote,
    },
    {
      title: 'Reveal: the MERGE load, measured',
      body: (
        <>
          Run for real on a customer with one current address: a single MERGE statement expired the
          old row and inserted the new current row, both in the same atomic command.
        </>
      ),
      duration: 4.8,
      fig: 'one real MERGE: old row expired, new row inserted, atomically',
      takeaway: 'One MERGE statement, with the right WHEN clauses, both expires the old version and inserts the new one.',
      Visual: S.RevealMergeMeasured,
    },
    {
      title: 'Predict: does running the identical load again change anything?',
      body: (
        <>
          The exact same MERGE statement, with the exact same source row, runs a second time
          immediately after the first. Does anything change?
        </>
      ),
      duration: 2.8,
      fig: 'the identical load, run twice — anything changes the second time?',
      predict: {
        options: [
          { label: 'Yes — it inserts another new version regardless' },
          { label: 'No — the join condition already matches the current state', correct: true },
        ],
        explain: (
          <>
            No. The second run's source row now matches the current row's own hash exactly, so no
            WHEN clause has anything left to fire — nothing changes.
          </>
        ),
      },
      Visual: S.PredictRerun,
    },
    {
      title: 'Reveal: idempotency, measured',
      body: (
        <>
          Run a second time, with nothing changed between runs, the identical MERGE statement
          changes nothing at all — the load is genuinely idempotent, not just assumed to be.
        </>
      ),
      duration: 4.8,
      fig: 'identical load, run twice: zero rows changed the second time',
      takeaway: 'An idempotent MERGE load is provable: run it twice and check that the second run changes nothing.',
      Visual: S.RevealIdempotency,
    },
    {
      title: 'Reveal: hash-diff detection',
      body: (
        <>
          Comparing one hash of every column at once catches any real change in a single
          comparison, instead of writing — and maintaining — a separate check for each column by hand.
        </>
      ),
      duration: 4.8,
      fig: 'one hash comparison, instead of one comparison per column',
      Visual: S.RevealHashDiff,
    },
    {
      title: 'Predict: does an out-of-order, duplicated feed still converge correctly?',
      body: (
        <>
          A real change feed arrives out of order, with one event duplicated. Does the final
          history still come out correct?
        </>
      ),
      duration: 2.8,
      fig: 'out of order, duplicated — the history still comes out right?',
      predict: {
        options: [
          { label: "No — arrival order has to match for the chain to be right" },
          { label: 'Yes — rebuilding from each event\'s own timestamp fixes the order', correct: true },
        ],
        explain: (
          <>
            Yes. Deduplicating by content and rebuilding the chain from each event's own timestamp
            never depends on the order the events happened to arrive in.
          </>
        ),
      },
      Visual: S.PredictReplayOrder,
    },
    {
      title: 'Reveal: the replay, measured',
      body: (
        <>
          Four real feed rows, one of them a duplicate, fed in out of order: the rebuilt chain comes
          out as exactly three distinct versions, correctly ordered by their own timestamps.
        </>
      ),
      duration: 4.8,
      fig: 'four fed, one duplicate, out of order: three correct versions, chained right',
      takeaway: 'A chain rebuilt from each event\'s own timestamp converges correctly no matter what order the events arrive in.',
      Visual: S.RevealReplayMeasured,
    },
    {
      title: 'Reveal: the as-of query, measured',
      body: (
        <>
          Asking what was true on a date inside the middle version's own window recovers that exact
          version — the rebuilt chain answers an as-of question correctly, not just a "what's current" one.
        </>
      ),
      duration: 4.8,
      fig: 'a date inside the middle window: the middle version, recovered exactly',
      Visual: S.RevealAsOf,
    },
    {
      title: 'Recap',
      body: (
        <>
          A new row and a new key per version, never an overwrite. One MERGE statement expires the
          old and inserts the new, provably idempotent. A chain rebuilt from each event's own
          timestamp survives out-of-order arrival and duplicates alike.
        </>
      ),
      duration: 4.8,
      fig: 'new row per version, atomic MERGE, order-independent chain',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          The entire change feed arrives a second time, duplicated from start to finish, not just
          one event. Does the rebuild still converge to the same correct history?
        </>
      ),
      duration: 2.8,
      fig: 'the whole feed, duplicated start to finish — still converges?',
      predict: {
        options: [
          { label: 'No — a fully duplicated feed is a different failure mode' },
          { label: "Yes — deduplication by content doesn't care how many duplicates arrive", correct: true },
        ],
        explain: (
          <>
            Yes. Deduplicating by the exact content of each event removes every duplicate equally,
            whether there's one or an entire feed's worth, and the rebuild proceeds from what's left.
          </>
        ),
      },
      Visual: S.ProveFullDuplicateFeed,
    },
  ],
};

export default reel;
