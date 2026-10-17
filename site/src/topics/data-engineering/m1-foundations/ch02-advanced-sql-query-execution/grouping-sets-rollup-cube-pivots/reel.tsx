import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// One pass, several levels of aggregation. Running example: orders by status (paid, refunded) and month
// (Oct, Nov): 4 detail groups, 2 status subtotals, 1 grand total. Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'One GROUP BY is one level',
      body: (
        <>
          A report wants orders by status and month, then by status alone, then the grand total. Three queries glued with <code>UNION ALL</code> scan
          the table three times. Grouping sets compute every level in one pass.
        </>
      ),
      duration: 3.4,
      Visual: S.ThreeScans,
    },
    {
      title: 'GROUPING SETS lists the levels',
      body: (
        <>
          Each sublist is aggregated as if it were its own <code>GROUP BY</code>, and the results are returned together. A column left out of a
          sublist comes back as NULL in that sublist&rsquo;s rows.
        </>
      ),
      duration: 4,
      Visual: S.SetsTable,
    },
    {
      title: 'ROLLUP and CUBE are shorthands',
      body: (
        <>
          <code>ROLLUP(a, b)</code> keeps every prefix: <b>3</b> sets, down to the grand total. <code>CUBE(a, b)</code> keeps every subset:{' '}
          <b>4</b> sets. Over our data that is <b>7</b> rows for the rollup and 9 for the cube.
        </>
      ),
      duration: 4.4,
      Visual: S.RollupCube,
    },
    {
      title: 'Predict: how many sets in CUBE of three columns?',
      body: <>ROLLUP of two columns gives 3 sets and CUBE of two gives 4. How many grouping sets does CUBE over three columns expand to?</>,
      duration: 1.6,
      predict: {
        options: [{ label: '6' }, { label: '7' }, { label: '8', correct: true }, { label: '9' }],
        explain: (
          <>
            Eight. A cube is every subset of the columns, so n columns give 2 to the power n sets. Two columns give 4, three give 8. A rollup over three
            columns gives only 4, one per prefix.
          </>
        ),
      },
      Visual: S.PowerSet,
    },
    {
      title: 'A rolled-up column reads as NULL',
      body: (
        <>
          In a subtotal row the ignored column is NULL; in the grand total, every grouping column is. The report now has three kinds of row, and the
          NULLs mean &ldquo;not part of this grouping&rdquo;.
        </>
      ),
      duration: 3.6,
      Visual: S.Ladder,
    },
    {
      title: 'A real NULL looks identical',
      body: (
        <>
          Group by a nullable column such as <code>referred_by_customer_id</code> and the detail row for orders with no referrer also shows NULL.
          Nothing in the value distinguishes it from the grand total&rsquo;s NULL.
        </>
      ),
      duration: 4,
      Visual: S.Collision,
    },
    {
      title: 'Predict: which rows does IS NULL keep?',
      body: <>After the rollup you filter with <code>WHERE referred_by_customer_id IS NULL</code>. Which rows survive?</>,
      duration: 1.6,
      predict: {
        options: [
          { label: 'Only the real no-referrer detail rows' },
          { label: 'Only the grand total' },
          { label: 'Both kinds, so a count is off by one', correct: true },
          { label: 'Neither, NULL never matches' },
        ],
        explain: (
          <>
            Both. <code>IS NULL</code> is a plain two-valued test and cannot tell a data NULL from a rollup NULL, so the grand total is counted as one
            more order with no referrer.
          </>
        ),
      },
      Visual: S.IsNullPredict,
    },
    {
      title: 'GROUPING() is a bitmask',
      body: (
        <>
          <code>GROUPING(col)</code> is 0 when the column was grouped on and 1 when the row ignored it. With two columns the bits combine: detail rows give
          0, a status subtotal gives 1, and the grand total gives <b>3</b>. Test <code>GROUPING(col) = 0</code> together with <code>IS NULL</code>.
        </>
      ),
      duration: 4.6,
      Visual: S.GroupingBits,
    },
    {
      title: 'Combined rollups repeat sets',
      body: (
        <>
          Several <code>ROLLUP</code> or <code>CUBE</code> items in one <code>GROUP BY</code> multiply together and can list the same set twice.{' '}
          <code>GROUP BY DISTINCT</code> removes the repeated sets, which is not the same as <code>SELECT DISTINCT</code>.
        </>
      ),
      duration: 3.8,
      Visual: S.Duplicates,
    },
    {
      title: 'A pivot folds a tall strip into a wide one',
      body: (
        <>
          A pivot turns one row per status into one column per status. Conditional aggregation does it with{' '}
          <code>SUM(amount) FILTER (WHERE status = &hellip;)</code>, one per column, inside an ordinary <code>GROUP BY</code>.
        </>
      ),
      duration: 4.4,
      Visual: S.PivotFold,
    },
    {
      title: 'FILTER, CASE and native PIVOT',
      body: (
        <>
          <code>FILTER</code> is standard SQL; <code>SUM(CASE WHEN …)</code> is the same thing for older engines. Snowflake, BigQuery and SQL Server add a
          native <code>PIVOT</code> and its reverse <code>UNPIVOT</code>; PostgreSQL has neither. Default to the portable form.
        </>
      ),
      duration: 3.8,
      Visual: S.Dialects,
    },
    {
      title: 'Back to the report',
      body: (
        <>
          One scan, every level: <code>ROLLUP</code> for hierarchies, <code>CUBE</code> only when every combination is wanted. Always separate rollup
          NULLs from data NULLs with <code>GROUPING()</code>, and pivot with <code>FILTER</code>.
        </>
      ),
      duration: 3.6,
      Visual: S.Verdict,
    },
    {
      title: 'Prove it · 1 of 2',
      body: <>How many grouping sets does ROLLUP over three columns expand to?</>,
      duration: 1.2,
      predict: {
        options: [{ label: '3' }, { label: '4', correct: true }, { label: '8' }],
        explain: <>Four: all three columns, the first two, the first, and none. One set per prefix, including the empty one.</>,
      },
      Visual: S.ProveRollup,
    },
    {
      title: 'Prove it · 2 of 2',
      body: <>In a two-column rollup, what does GROUPING return for the two columns together on the grand total row?</>,
      duration: 1.2,
      predict: {
        options: [{ label: '0' }, { label: '1' }, { label: '3', correct: true }],
        explain: <>Three, binary 11: both bits set, because neither column was grouped on.</>,
      },
      Visual: S.ProveBits,
    },
  ],
};

export default reel;
