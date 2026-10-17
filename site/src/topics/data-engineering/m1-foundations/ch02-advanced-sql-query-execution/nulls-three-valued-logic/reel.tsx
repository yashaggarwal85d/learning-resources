import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A third truth value, and the five places it behaves differently. Running example: the shop's orders
// (shipped_at is NULL until shipped; referred_by_customer_id is NULL when nobody referred the customer).
// Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'Some values are simply missing',
      body: (
        <>
          An order that has not shipped has no ship date. A customer nobody referred has no referrer. SQL records that gap as <b>NULL</b>, and
          NULL makes ordinary logic misbehave without ever raising an error.
        </>
      ),
      duration: 3.2,
      Visual: S.Missing,
    },
    {
      title: 'Three truth values, not two',
      body: (
        <>
          A predicate can be TRUE, FALSE or <b>UNKNOWN</b>. One sure branch settles OR (TRUE wins) and AND (FALSE wins); otherwise an UNKNOWN
          input makes the result UNKNOWN.
        </>
      ),
      duration: 4,
      Visual: S.TruthTables,
    },
    {
      title: 'Predict: what is NOT UNKNOWN?',
      body: <>Flip an UNKNOWN with NOT. What truth value comes out?</>,
      duration: 1.4,
      predict: {
        options: [
          { label: 'TRUE' },
          { label: 'FALSE' },
          { label: 'UNKNOWN', correct: true },
          { label: 'An error' },
        ],
        explain: (
          <>
            Still UNKNOWN. Negating &ldquo;I do not know&rdquo; does not produce an answer. This one fact sits behind nearly every silent bug in the
            rest of the topic.
          </>
        ),
      },
      Visual: S.NotUnknown,
    },
    {
      title: 'x = NULL is never true',
      body: (
        <>
          Any comparison with NULL is UNKNOWN, even <code>NULL = NULL</code>. A <code>WHERE</code> or <code>JOIN</code> keeps a row only when the
          predicate is TRUE, so an UNKNOWN row is dropped exactly like a FALSE one, with no warning.
        </>
      ),
      duration: 3.8,
      Visual: S.FilterDrop,
    },
    {
      title: 'IS DISTINCT FROM compares NULLs safely',
      body: (
        <>
          <code>IS DISTINCT FROM</code> treats two NULLs as equal and a NULL against a value as different, so it always returns TRUE or FALSE, never
          UNKNOWN. Use it when either side might be missing.
        </>
      ),
      duration: 3.6,
      Visual: S.DistinctFrom,
    },
    {
      title: 'Five places, five different rules',
      body: (
        <>
          NULL is not handled the same way everywhere. <code>GROUP BY</code> puts all NULLs in one group. <code>ORDER BY</code> sorts them as if larger
          than every value. Aggregates skip them. A <code>UNIQUE</code> constraint allows any number. A join never matches them.
        </>
      ),
      duration: 4.8,
      Visual: S.FiveRules,
    },
    {
      title: 'Predict: NOT IN with one NULL in the list',
      body: (
        <>
          A do-not-email list of 500,000 customer ids contains one extra row whose id is NULL. You select every customer whose id is{' '}
          <code>NOT IN</code> that list. How many rows come back?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'About 19,500,000, everyone not on the list' },
          { label: 'None', correct: true },
          { label: 'About 500,000' },
          { label: 'An error' },
        ],
        explain: (
          <>
            None. <code>x NOT IN (a, b, NULL)</code> means &ldquo;x differs from a, and from b, and from NULL&rdquo;. The last link is UNKNOWN, so for
            every customer not on the list the whole chain is UNKNOWN and the row is dropped.
          </>
        ),
      },
      Visual: S.NotInPredict,
    },
    {
      title: 'The chain goes dim; NOT EXISTS fixes it',
      body: (
        <>
          One UNKNOWN link makes the whole AND chain UNKNOWN. The fix is a different question: do not ask what a row is not equal to, ask whether a
          matching row exists. <code>NOT EXISTS</code> does, and returns the 19,500,000 customers you wanted.
        </>
      ),
      duration: 4.2,
      Visual: S.NotExists,
    },
    {
      title: 'COUNT(*) is not COUNT(column)',
      body: (
        <>
          <code>COUNT(*)</code> counts rows: 100,000,000 orders. <code>COUNT(shipped_at)</code> counts non-NULL values: 62,000,000. Both are valid; the
          38,000,000 gap is the unshipped orders. Say which one you mean.
        </>
      ),
      duration: 3.8,
      Visual: S.CountGap,
    },
    {
      title: 'Back to the orders table',
      body: (
        <>
          Three truth values, five rules, two silent bugs. Use <code>IS DISTINCT FROM</code> where a side may be missing, <code>NOT EXISTS</code>{' '}
          instead of <code>NOT IN</code> over a nullable column, and choose your count on purpose.
        </>
      ),
      duration: 3.4,
      Visual: S.Verdict,
    },
    {
      title: 'Prove it · 1 of 2',
      body: <>Is <code>NULL OR TRUE</code> TRUE, FALSE or UNKNOWN?</>,
      duration: 1.2,
      predict: {
        options: [{ label: 'FALSE' }, { label: 'UNKNOWN' }, { label: 'TRUE', correct: true }],
        explain: <>TRUE. One sure TRUE settles an OR whatever the other side is.</>,
      },
      Visual: S.ProveOr,
    },
    {
      title: 'Prove it · 2 of 2',
      body: <>A column has three rows with values 10, 5 and NULL. What does <code>SUM</code> return?</>,
      duration: 1.2,
      predict: {
        options: [{ label: 'UNKNOWN' }, { label: '15', correct: true }, { label: 'NULL' }],
        explain: <>15. Aggregates skip NULLs. Only a column with no non-NULL values at all sums to NULL.</>,
      },
      Visual: S.ProveSum,
    },
  ],
};

export default reel;
