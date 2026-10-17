import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// What the engine does to answer a window function for every row. Running example: a moving average over 1,000 readings
// with a frame of 5 rows each side (11 rows), and a four-way parallel run over uneven partitions. Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'Defining a window is one job; delivering it is another',
      body: (
        <>
          Topic 10 said which rows a function sees. The engine still has to do it for every row of the table, and the obvious ways of doing that are
          quadratic. How a window operator avoids that is this topic.
        </>
      ),
      duration: 3.2,
      Visual: S.TwoJobs,
    },
    {
      title: 'The self-join rescans for every row',
      body: (
        <>
          Without windows, a moving average is a correlated subquery: for each of <b>1,000</b> rows, find the neighbours and average them. Each subquery
          starts from scratch, with no memory of the row before. That is quadratic.
        </>
      ),
      duration: 4,
      Visual: S.Rescan,
    },
    {
      title: 'Predict: how much work for 1,000 rows?',
      body: (
        <>
          The correlated version scans the whole table for each of the 1,000 rows to find its neighbours. How many row comparisons is that?
        </>
      ),
      duration: 1.6,
      predict: {
        options: [{ label: '1,000' }, { label: '11,000' }, { label: '1,000,000', correct: true }, { label: '10,000' }],
        explain: (
          <>
            One million: 1,000 rows times 1,000 comparisons each. Double the table and the work quadruples. A sorted pass that reuses work between
            adjacent rows stays close to linear.
          </>
        ),
      },
      Visual: S.RescanPredict,
    },
    {
      title: 'Sort once, then slide',
      body: (
        <>
          A window operator partitions and sorts the data once, then walks it in order. Neighbouring rows have nearly the same frame, so the answer for
          one row is mostly the answer for the row before. The four strategies differ in how much of that they reuse.
        </>
      ),
      duration: 3.8,
      Visual: S.SortOnce,
    },
    {
      title: 'Four ways to aggregate a frame',
      body: (
        <>
          <b>Naive</b> recomputes the frame every time. <b>Cumulative</b> adds only new rows. <b>Removable cumulative</b> also takes rows out. A{' '}
          <b>segment tree</b> answers any frame in logarithmic time. Each handles a wider family of frame shapes.
        </>
      ),
      duration: 4.2,
      Visual: S.FourWays,
    },
    {
      title: 'Cumulative: frames that only grow',
      body: (
        <>
          The default frame, start of the partition up to the current row, only ever grows. Keep the previous total and add the new rows: <b>1,000</b>{' '}
          additions for 1,000 rows, not half a million. It breaks the moment the frame must also shrink.
        </>
      ),
      duration: 4,
      Visual: S.Cumulative,
    },
    {
      title: 'Removable: sliding frames',
      body: (
        <>
          For a sliding frame, <code>sum</code> and <code>count</code> can subtract the row that left: constant work per row. <code>min</code> and{' '}
          <code>max</code> cannot subtract, and need an ordered structure over the frame. Wildly varying bounds can defeat even this.
        </>
      ),
      duration: 4.2,
      Visual: S.Removable,
    },
    {
      title: 'Predict: bounds that jump around',
      body: (
        <>
          A frame whose start and end come from columns of the row, so neighbouring rows have very different frames. Which strategy still keeps the cost
          down?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'Cumulative' },
          { label: 'Removable cumulative' },
          { label: 'A segment tree', correct: true },
          { label: 'Naive recomputation' },
        ],
        explain: (
          <>
            A segment tree. It stores aggregates of sub-ranges of the whole partition, so any frame is answered by combining a few nodes, in logarithmic
            time, however the bounds move. The cheaper strategies depend on neighbours having similar frames.
          </>
        ),
      },
      Visual: S.TreePredict,
    },
    {
      title: 'Segment tree: any frame in log time',
      body: (
        <>
          Each node holds the aggregate of a block of rows. A frame is covered by a few nodes whose values are combined, so a partition of 1,000 rows needs
          about 10 node visits per frame, wherever the frame sits.
        </>
      ),
      duration: 4.2,
      Visual: S.SegmentTree,
    },
    {
      title: 'Several windows, one sort',
      body: (
        <>
          Sorting is the expensive phase. If two windows share a partition and order, one sort feeds both, even with different frames. If one window&rsquo;s
          sort is a prefix of another&rsquo;s, sort once for the stronger and reuse it for the weaker.
        </>
      ),
      duration: 4,
      Visual: S.SortReuse,
    },
    {
      title: 'Parallel by partition, until one is huge',
      body: (
        <>
          A partition must stay together, so the natural parallel unit is a whole partition. With partitions of 100, 100, 100 and 700 rows on 4 workers,
          the finish time is set by the 700. A skew-resistant operator splits the big partition across workers.
        </>
      ),
      duration: 4.4,
      Visual: S.Skew,
    },
    {
      title: 'Back to the moving average',
      body: (
        <>
          Prefer a window to a correlated subquery. Write shared windows identically so the sort is reused. Fixed offsets keep cheap algorithms in play;
          wild frame bounds do not. And expect one oversized partition to dominate.
        </>
      ),
      duration: 3.8,
      Visual: S.Verdict,
    },
    {
      title: 'Prove it · 1 of 2',
      body: <>Which strategy suits the default frame, from the start of the partition up to the current row?</>,
      duration: 1.2,
      predict: {
        options: [{ label: 'Naive' }, { label: 'Cumulative', correct: true }, { label: 'Segment tree' }],
        explain: <>Cumulative. The frame only grows, so adding the new rows to the previous total is enough.</>,
      },
      Visual: S.ProveCumulative,
    },
    {
      title: 'Prove it · 2 of 2',
      body: <>Two window functions share the same PARTITION BY and ORDER BY but have different frames. How many sorts does the plan need?</>,
      duration: 1.2,
      predict: {
        options: [{ label: '2' }, { label: '1', correct: true }, { label: '0' }],
        explain: <>One. Sorting depends on partition and order only; the frames differ but the sorted input is the same.</>,
      },
      Visual: S.ProveSorts,
    },
  ],
};

export default reel;
