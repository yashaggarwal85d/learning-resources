import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A neighbourhood for every row. Running example: one customer's four orders, two of them at the same timestamp:
// amounts 100, 50, 25 and 10; the middle pair are peers. Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'A window looks at neighbours, keeps every row',
      body: (
        <>
          An aggregate collapses rows. A window function looks at a group of nearby rows and still gives every row its own answer, so a running total
          sits beside each order instead of replacing them. This topic is about exactly which neighbours it sees.
        </>
      ),
      duration: 3.4,
      Visual: S.Filmstrip,
    },
    {
      title: 'Partition, order, frame',
      body: (
        <>
          <code>PARTITION BY</code> splits rows into independent groups. <code>ORDER BY</code> fixes the order inside each. The <b>frame</b> is the slice of
          the partition that a function sees for one current row, set by a <code>ROWS</code>, <code>RANGE</code> or <code>GROUPS</code> clause.
        </>
      ),
      duration: 4,
      Visual: S.ThreeParts,
    },
    {
      title: 'ROWS counts rows, RANGE counts peers',
      body: (
        <>
          <code>ROWS</code> counts physical rows and ignores ties. <code>RANGE</code> works by value: rows tied on the <code>ORDER BY</code> key are{' '}
          <b>peers</b>, and a frame that reaches the current row reaches all its peers together.
        </>
      ),
      duration: 4,
      Visual: S.RowsVsRange,
    },
    {
      title: 'Predict: the running total with a tie',
      body: (
        <>
          Amounts 100, 50, 25, 10; the 50 and the 25 share a timestamp. You write <code>SUM(amount) OVER (ORDER BY event_time)</code> with no frame.
          What running totals do the two tied rows show?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: '150 and 175' },
          { label: '175 and 175', correct: true },
          { label: '50 and 25' },
          { label: '125 and 175' },
        ],
        explain: (
          <>
            Both 175. With no frame given, the default is <code>RANGE UNBOUNDED PRECEDING</code>, which runs through the current row&rsquo;s{' '}
            <i>last peer</i>. Each tied row is a peer of the other, so both include both amounts.
          </>
        ),
      },
      Visual: S.TiePredict,
    },
    {
      title: 'The default frame ends at the last peer',
      body: (
        <>
          With an <code>ORDER BY</code>, the default frame is all rows from the partition start up to the current row&rsquo;s last peer. The total steps
          once per distinct timestamp, not once per row: 100, then 175 twice, then 185.
        </>
      ),
      duration: 4,
      Visual: S.PeerFrame,
    },
    {
      title: 'Say what you meant: ROWS and a tie-break',
      body: (
        <>
          Add a unique second key to <code>ORDER BY</code> and ask for <code>ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</code>. Now every row
          advances the total by itself: 100, 150, 175, 185.
        </>
      ),
      duration: 4,
      Visual: S.RowsFix,
    },
    {
      title: 'GROUPS counts whole peer groups',
      body: (
        <>
          <code>GROUPS</code> measures offsets in peer groups: &ldquo;1 PRECEDING&rdquo; means one tie-group back, however many rows it holds. Here the
          four orders form <b>3</b> peer groups.
        </>
      ),
      duration: 3.8,
      Visual: S.Groups,
    },
    {
      title: 'EXCLUDE drops the row, or its peers',
      body: (
        <>
          <code>EXCLUDE CURRENT ROW</code> leaves the current row out; <code>EXCLUDE GROUP</code> also drops its peers; <code>EXCLUDE TIES</code> drops the
          peers but keeps the row. Use it for &ldquo;the average of the others&rdquo;.
        </>
      ),
      duration: 3.8,
      Visual: S.Exclude,
    },
    {
      title: 'Name a window once',
      body: (
        <>
          Repeating one definition across several calls invites a copy-paste drift. <code>WINDOW w AS (…)</code> names it once. <code>OVER w</code> reuses
          it exactly; <code>OVER (w …)</code> extends it, and is refused if <code>w</code> already has a frame.
        </>
      ),
      duration: 3.6,
      Visual: S.Named,
    },
    {
      title: 'Window calls cannot nest',
      body: (
        <>
          A window function may not contain another one. To rank the running totals, compute them in an inner query and rank the result outside: a CTE
          between the two layers is what &ldquo;nesting&rdquo; looks like in SQL.
        </>
      ),
      duration: 4,
      Visual: S.NoNesting,
    },
    {
      title: 'Predict: ranking a running total',
      body: <>You want to rank customers by a running total that is itself a window function. How do you write it?</>,
      duration: 1.6,
      predict: {
        options: [
          { label: 'Put the running total inside RANK()' },
          { label: 'Compute it in a CTE, then rank in the outer query', correct: true },
          { label: 'Use two OVER clauses on one call' },
          { label: 'It cannot be done' },
        ],
        explain: (
          <>
            Stage it. The inner query makes the running total a plain column; the outer query ranks that column. Putting one window inside another is
            rejected with &ldquo;window function calls cannot be nested&rdquo;.
          </>
        ),
      },
      Visual: S.StagePredict,
    },
    {
      title: 'Back to the running total',
      body: (
        <>
          Never leave the frame on its default when ties are possible. Break ties with a unique key and say <code>ROWS</code>. Name shared windows, and
          stage window-of-window with a CTE.
        </>
      ),
      duration: 3.6,
      Visual: S.Verdict,
    },
    {
      title: 'Prove it · 1 of 2',
      body: <>Which frame mode ignores ties on the ORDER BY key?</>,
      duration: 1.2,
      predict: {
        options: [{ label: 'ROWS', correct: true }, { label: 'RANGE' }, { label: 'GROUPS' }],
        explain: <>ROWS. It counts physical rows, so peers make no difference.</>,
      },
      Visual: S.ProveRows,
    },
    {
      title: 'Prove it · 2 of 2',
      body: <>With ORDER BY and no frame clause, which rows does the frame include?</>,
      duration: 1.2,
      predict: {
        options: [
          { label: 'Only the current row' },
          { label: 'From the partition start through the current row’s last peer', correct: true },
          { label: 'The whole partition' },
        ],
        explain: <>From the partition start through the current row&rsquo;s last peer: the default RANGE frame.</>,
      },
      Visual: S.ProveDefault,
    },
  ],
};

export default reel;
