import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Full join-diff vs checksum bisection on identical old/new fct_orders with a single planted
// column regression (examples.py): same mismatches found, bisection scanning far fewer rows;
// a tolerance band that ignores harmless float-summation-order noise while still catching the
// real bug; a column-level change summary; and a measured cost curve showing bisection's relative
// advantage widen as the table grows while the number of real changes stays fixed. Sourced:
// datafold/data-diff's own technical-explanation docs, PostgreSQL's numeric and datetime docs.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A one-line rounding fix ships. A naive equality check reports a huge pile of changed
          rows -- true, useless, and impossible to review. A column-level summary instead names
          the one column that moved and by how much.
        </>
      ),
      duration: 4.8,
      fig: 'every row changed. or did it?',
      Visual: S.Hook,
    },
    {
      title: 'Predict: does an exact diff have to read every row?',
      body: (
        <>
          A full join-diff compares old and new, column by column, and it is exact. Does being
          exact mean it has to scan every single row to get there?
        </>
      ),
      duration: 2.8,
      fig: 'exact. does exact mean every row, every time?',
      predict: {
        options: [
          { label: 'Yes -- exactness requires reading every row' },
          { label: 'No -- a checksum can stand in for a whole range', correct: true },
        ],
        explain: (
          <>
            A checksum over a range of rows is exact too: if it matches, nothing in that range
            changed, and it never needed to be read row by row at all.
          </>
        ),
      },
      Visual: S.PredictExactMeansEveryRow,
    },
    {
      title: 'Reveal: the full join-diff',
      body: (
        <>
          Join old and new on the key, compare every column, exact and complete -- and it reads
          every row on both sides, every single time, whether anything changed or not.
        </>
      ),
      duration: 4.8,
      fig: 'join on key. compare every column. read every row.',
      Visual: S.RevealJoinDiff,
    },
    {
      title: 'Reveal: checksum bisection',
      body: (
        <>
          Hash a range of keys on both sides. A matching checksum skips the whole range,
          unread. A mismatching one splits and recurses, narrowing down to the rows that
          actually changed.
        </>
      ),
      duration: 4.8,
      fig: 'hash the range. split only where it mismatches.',
      takeaway: 'A matching checksum proves a whole range is unchanged without reading it.',
      Visual: S.RevealChecksumBisection,
    },
    {
      title: 'Predict: does a different float always mean a real change?',
      body: (
        <>
          The exact same total, computed by summing the same pieces in a different order, can
          land on a different floating-point value. Does a diff that sees that difference have
          found a real regression?
        </>
      ),
      duration: 2.8,
      fig: 'same pieces, different order. a real change?',
      predict: {
        options: [
          { label: 'Yes -- any numeric difference is a real change' },
          { label: 'No -- summation order alone can move the last digits', correct: true },
        ],
        explain: (
          <>
            Floating-point addition is not associative. A harmless reordering inside a pipeline
            can shift a total by a tiny amount with nothing actually wrong.
          </>
        ),
      },
      Visual: S.PredictFloatDifferenceReal,
    },
    {
      title: 'Reveal: tolerance in practice',
      body: (
        <>
          A harmless reordering and a genuine planted bug go through the same diff. An exact
          comparison flags both. A tolerance band lets the harmless one pass and still catches
          the real one.
        </>
      ),
      duration: 4.8,
      fig: 'one band. noise passes. the real bug does not.',
      Visual: S.RevealTolerance,
    },
    {
      title: 'Reveal: column-level change summary',
      body: (
        <>
          From the same planted bug, the summary names the one column that moved, how many rows
          it touched, and the size of the move -- instead of a raw count of changed rows.
        </>
      ),
      duration: 4.8,
      fig: 'one column named. every other column untouched.',
      takeaway: 'A usable diff report names the column, not just the row count.',
      Visual: S.RevealColumnSummary,
    },
    {
      title: 'Reveal: the cost curve',
      body: (
        <>
          Keep the number of real changes fixed and grow the table. Join-diff's cost grows right
          along with the table. Bisection's relative advantage over it keeps widening.
        </>
      ),
      duration: 4.8,
      fig: 'same real changes. a bigger table. a widening gap.',
      takeaway: "Bisection's advantage over a full join-diff grows with the table, not with the bug count.",
      Visual: S.RevealCostCurve,
    },
    {
      title: 'Recap',
      body: (
        <>
          Two exact strategies with a real cost tradeoff, a tolerance band for noise that is not
          a regression, and a column-level summary that turns a row count into something a human
          can actually review.
        </>
      ),
      duration: 4.8,
      fig: 'exact. tolerant. reviewable.',
      takeaway: 'An exact diff can still choose how much of the table it actually has to read.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          This topic's own real diff: the same table, the same planted bug, run through both
          strategies and compared on exactly how many rows each one actually read.
        </>
      ),
      duration: 2.8,
      fig: 'same table. same bug. how many rows read?',
      predict: {
        options: [
          { label: 'Both strategies read the same number of rows' },
          { label: 'Bisection reads far fewer rows for the same result', correct: true },
        ],
        explain: (
          <>
            Both strategies find exactly the same changed rows. Join-diff reads the whole table
            every time. Bisection reads only the ranges whose checksum actually mismatched.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
