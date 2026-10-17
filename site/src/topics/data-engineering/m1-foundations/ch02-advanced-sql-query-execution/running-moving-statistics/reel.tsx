import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Statistics over ordered numbers. Running example: orders on uneven days (7 orders in 2 busy days, 7 over 12 quiet days),
// and the values 10, 20, 30, 40 for percentiles. Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'Smoother numbers over an ordered set',
      body: (
        <>
          Topic 13 marked where one episode ends. Now the question is about the numbers themselves: a running total, a moving average, the median, the
          slowest 1%. Some need only a running tally. Others need the whole ordered set at once.
        </>
      ),
      duration: 3.4,
      Visual: S.Overview,
    },
    {
      title: 'Cumulative grows; moving slides',
      body: (
        <>
          A <b>cumulative</b> aggregate only ever gains rows: cheap, because it adds what is new. A <b>moving</b> one gains at one end and loses at the
          other, so it needs the removable strategy from topic 11 or a segment tree, because old rows must be subtracted out.
        </>
      ),
      duration: 4.2,
      Visual: S.GrowSlide,
    },
    {
      title: 'Predict: do 7 rows equal 7 days?',
      body: (
        <>
          You write <code>ROWS BETWEEN 6 PRECEDING AND CURRENT ROW</code> to get the last 7 days of revenue. On a very busy week and on a very quiet one,
          is the frame the same span of time?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'Yes, 7 rows is a week' },
          { label: 'No, it is 7 rows however long that takes', correct: true },
          { label: 'Yes, if the table is sorted' },
          { label: 'Only on PostgreSQL' },
        ],
        explain: (
          <>
            No. <code>ROWS</code> counts positions and has no idea what time it is. Seven busy orders can fall in 2 days; seven quiet ones can stretch over 12.
            A calendar window has to be measured in time.
          </>
        ),
      },
      Visual: S.RowsLie,
    },
    {
      title: 'RANGE with INTERVAL measures time',
      body: (
        <>
          <code>RANGE BETWEEN INTERVAL &apos;7 days&apos; PRECEDING AND CURRENT ROW</code> includes every row whose timestamp is within 7 days of the current
          one, however many that is. It needs exactly one ordering column, because it subtracts values.
        </>
      ),
      duration: 4.2,
      Visual: S.RangeInterval,
    },
    {
      title: 'Percentiles need the whole ordered set',
      body: (
        <>
          A median or a p99 has no running tally: it depends on every value. So they are <b>ordered-set aggregates</b>, written{' '}
          <code>percentile_cont(0.5) WITHIN GROUP (ORDER BY amount)</code>, and the engine must sort first.
        </>
      ),
      duration: 3.8,
      Visual: S.OrderedSet,
    },
    {
      title: 'Predict: the median of 10, 20, 30, 40',
      body: (
        <>
          Four values: 10, 20, 30, 40. <code>percentile_cont(0.5)</code> and <code>percentile_disc(0.5)</code> are both asked for the median. What does the
          continuous one return?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [{ label: '20' }, { label: '25', correct: true }, { label: '30' }, { label: '35' }],
        explain: (
          <>
            25: it interpolates between the two middle values. The discrete version returns 20, the first value whose position reaches the fraction, which is a
            real value from the data.
          </>
        ),
      },
      Visual: S.MedianPredict,
    },
    {
      title: 'CONT interpolates; DISC picks a real value',
      body: (
        <>
          <code>percentile_cont</code> may return a number that is not in the data (25, or 37 for the ninetieth percentile). <code>percentile_disc</code> always
          returns an actual value (20, or 40). Choose DISC when you need a row you can trace.
        </>
      ),
      duration: 4,
      Visual: S.ContDisc,
    },
    {
      title: 'Many percentiles, one sort',
      body: (
        <>
          Pass an array of fractions, <code>percentile_cont(ARRAY[0.5, 0.9, 0.99])</code>, and the engine sorts once and answers all three. Three separate
          calls would each sort again.
        </>
      ),
      duration: 3.4,
      Visual: S.ArrayForm,
    },
    {
      title: 'NTILE and CUME_DIST',
      body: (
        <>
          <code>NTILE(4)</code> splits 10 rows into 4 buckets as evenly as it can: sizes 3, 3, 2, 2. <code>CUME_DIST</code> gives the fraction of rows at or
          below the current one, counting peers.
        </>
      ),
      duration: 4,
      Visual: S.Buckets,
    },
    {
      title: 'Exact percentiles do not scale for free',
      body: (
        <>
          There is no cumulative shortcut: the p99 so far changes with every value seen. On a 100,000,000-row partition, recomputing it on every dashboard
          load means a full sort each time. Approximate sketches trade exactness for one pass and bounded memory.
        </>
      ),
      duration: 4,
      Visual: S.Scale,
    },
    {
      title: 'Back to the dashboard',
      body: (
        <>
          Use <code>RANGE</code> with an interval for calendar windows and <code>ROWS</code> only for positions. State whether a percentile is continuous or
          discrete, take several in one call, and measure before shipping an exact one at scale.
        </>
      ),
      duration: 3.6,
      Visual: S.Verdict,
    },
    {
      title: 'Prove it · 1 of 2',
      body: <>Which percentile function always returns a value that actually occurs in the data?</>,
      duration: 1.2,
      predict: {
        options: [{ label: 'percentile_cont' }, { label: 'percentile_disc', correct: true }, { label: 'Both' }],
        explain: <>percentile_disc. percentile_cont interpolates and may return a number that is not in the data.</>,
      },
      Visual: S.ProveDisc,
    },
    {
      title: 'Prove it · 2 of 2',
      body: <>NTILE(4) splits 10 rows. How many rows are in the first bucket?</>,
      duration: 1.2,
      predict: {
        options: [{ label: '2' }, { label: '3', correct: true }, { label: '4' }],
        explain: <>Three. The remainder rows go to the first buckets, so the sizes are 3, 3, 2, 2.</>,
      },
      Visual: S.ProveNtile,
    },
  ],
};

export default reel;
