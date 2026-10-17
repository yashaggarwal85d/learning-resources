import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Position within a group, and ties. Running example: four scores 90, 80, 80, 70 (a tie for second), and a dedup of
// five records for three customers. Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'A number for each row, and then a cutoff',
      body: (
        <>
          Everything so far has climbed one row at a time. Here the question is position: who is first, who is in the top three, and which single record to
          keep. The trouble is always the same: what to do when rows tie.
        </>
      ),
      duration: 3.2,
      Visual: S.Podium,
    },
    {
      title: 'Three numberings, three answers to a tie',
      body: (
        <>
          Scores 90, 80, 80, 70. <code>ROW_NUMBER</code> gives 1, 2, 3, 4 and picks arbitrarily between the tied pair. <code>RANK</code> gives 1, 2, 2, 4,
          with a gap. <code>DENSE_RANK</code> gives 1, 2, 2, 3, with none.
        </>
      ),
      duration: 4.6,
      Visual: S.ThreeNumberings,
    },
    {
      title: 'Predict: the row after a three-way tie',
      body: (
        <>
          Three customers tie for first place on orders this month. What does <code>RANK</code> give the customer just below them?
        </>
      ),
      duration: 1.6,
      predict: {
        options: [{ label: '2' }, { label: '3' }, { label: '4', correct: true }, { label: '1' }],
        explain: (
          <>
            Four. <code>RANK</code> is the row number of the first row of the peer group, so after three rows tied for first, the next rank skips to 4.{' '}
            <code>DENSE_RANK</code> would give 2: it counts peer groups, not rows.
          </>
        ),
      },
      Visual: S.GapPredict,
    },
    {
      title: 'Among tied rows, ROW_NUMBER picks arbitrarily',
      body: (
        <>
          When two rows tie, <code>ROW_NUMBER</code> must still give one of them 2 and the other 3, and nothing in SQL says which. It depends on the order
          the rows arrive from the scan below it, which can change between runs.
        </>
      ),
      duration: 4,
      Visual: S.Arbitrary,
    },
    {
      title: 'Predict: same query, same data, run twice',
      body: (
        <>
          The ordering does not fully separate two rows. You run the same <code>ROW_NUMBER</code> query twice on unchanged data. Are the two assignments
          guaranteed to match?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'Yes, same data means same result' },
          { label: 'No, the order of tied rows is unspecified', correct: true },
          { label: 'Yes, if the table has an index' },
          { label: 'Only on PostgreSQL' },
        ],
        explain: (
          <>
            No guarantee. A single run often repeats, which hides the problem, but a different scan order after maintenance or a plan change can swap
            the tied rows. A reproducible ranking needs a reproducible order.
          </>
        ),
      },
      Visual: S.RunTwice,
    },
    {
      title: 'Add a unique tie-breaker',
      body: (
        <>
          End the <code>ORDER BY</code> with a column that is unique, usually the primary key. Then no two rows tie, every run assigns the same numbers,
          and anything built on the ranking, a <code>LIMIT</code>, a dedup, a test, is stable.
        </>
      ),
      duration: 3.8,
      Visual: S.TieBreaker,
    },
    {
      title: 'Dedup is a cutoff of one',
      body: (
        <>
          Five records for three customers. <code>ROW_NUMBER() … = 1</code> over each customer, newest first with a unique tie-breaker, keeps exactly one
          record per customer. <code>RANK</code> would keep every tied first, so the duplicates would survive.
        </>
      ),
      duration: 4.4,
      Visual: S.Dedup,
    },
    {
      title: 'WHERE runs before the window',
      body: (
        <>
          You cannot write <code>WHERE ROW_NUMBER() OVER (…) &lt;= 3</code>: filtering happens before window functions are computed. The portable fix is a
          CTE that computes the number and an outer query that filters on it.
        </>
      ),
      duration: 3.8,
      Visual: S.WhereTooEarly,
    },
    {
      title: 'QUALIFY filters on a window directly',
      body: (
        <>
          <code>QUALIFY</code> does for window functions what <code>HAVING</code> does for aggregates, and runs right after them. Snowflake, BigQuery,
          DuckDB and Databricks have it. It is not part of the ISO standard, and PostgreSQL does not have it.
        </>
      ),
      duration: 4.2,
      Visual: S.Qualify,
    },
    {
      title: 'Two plans for top-N per group',
      body: (
        <>
          Ranking sorts the whole input once, numbers every row, then discards the rest. <code>LATERAL</code> with <code>LIMIT</code> takes each group on its
          own. An index on (group, order) makes the second cheap; a sort already shared with other windows makes the first nearly free.
        </>
      ),
      duration: 4.4,
      Visual: S.TwoPlans,
    },
    {
      title: 'Back to the leaderboard',
      body: (
        <>
          Say which numbering you mean and why. End every ranking order with a unique key. Use <code>QUALIFY</code> where it exists and a CTE where it does
          not, and pick between ranking and <code>LATERAL</code> by index and shared sort.
        </>
      ),
      duration: 3.6,
      Visual: S.Verdict,
    },
    {
      title: 'Prove it · 1 of 2',
      body: <>Is QUALIFY part of the ISO SQL standard?</>,
      duration: 1.2,
      predict: {
        options: [{ label: 'Yes' }, { label: 'No', correct: true }],
        explain: <>No. It originated in Teradata and several engines implement it, but PostgreSQL does not.</>,
      },
      Visual: S.ProveStandard,
    },
    {
      title: 'Prove it · 2 of 2',
      body: <>Scores 90, 80, 80, 70. What is the DENSE_RANK of the 70?</>,
      duration: 1.2,
      predict: {
        options: [{ label: '3', correct: true }, { label: '4' }, { label: '2' }],
        explain: <>Three. DENSE_RANK counts peer groups: 90, then the 80s, then 70. RANK would say 4.</>,
      },
      Visual: S.ProveDense,
    },
  ],
};

export default reel;
