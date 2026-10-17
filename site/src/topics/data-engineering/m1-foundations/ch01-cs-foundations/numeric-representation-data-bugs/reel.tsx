import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// What the bytes storage handed back actually mean. Running example: the shop's orders table,
// 100,000,000 rows, with an integer id, a status, a decimal amount and a microsecond timestamp.
// Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'Four numbers, four ways to lie',
      body: (
        <>
          <code>orders</code> has <b>100,000,000</b> rows: an integer <code>order_id</code>, a <code>status</code>, an <code>amount</code>, and a
          microsecond <code>event_time</code>. Each is a fixed-width box standing in for an idea with no limit, and each box leaks in its own way.
        </>
      ),
      duration: 3.6,
      Visual: S.Problem,
    },
    {
      title: 'A thirty-two-bit box runs out fast',
      body: (
        <>
          A signed 32-bit <code>order_id</code> tops out at <b>2,147,483,647</b>. At a few thousand events a second, that box fills in under two
          weeks — the question is never whether it overflows, only what happens when it does.
        </>
      ),
      duration: 3.6,
      Visual: S.IntBox,
    },
    {
      title: 'Predict: one past the limit',
      body: <>You add one to the largest value a 32-bit integer can hold. What does the engine running the arithmetic do?</>,
      duration: 1.6,
      predict: {
        options: [
          { label: 'Always raises an error' },
          { label: 'Depends entirely on the engine', correct: true },
          { label: 'Always wraps to a negative number' },
          { label: 'Always rounds down to the maximum' },
        ],
        explain: (
          <>
            PostgreSQL raises; Spark raises too, by default, since version 4. A fixed-width array library wraps silently to a large negative number.
            Python&rsquo;s own <code>int</code> never overflows at all. The same bug is invisible in a notebook and roars back in the cluster.
          </>
        ),
      },
      Visual: S.OverflowPredict,
    },
    {
      title: 'A number line with uneven spacing',
      body: (
        <>
          A <code>double</code> has a <b>53</b>-bit significand. Near one, the ticks are impossibly fine; they spread apart as numbers grow. Past{' '}
          <b>9,007,199,254,740,992</b>, the gap between ticks is <b>2</b>, so odd whole numbers no longer exist there: add one, and you land back on
          the same tick.
        </>
      ),
      duration: 4,
      Visual: S.UlpLine,
    },
    {
      title: 'Predict: does grouping change the sum?',
      body: <>0.1, 0.2 and 0.3, parenthesized two different ways before adding. Does the parenthesization change which answer comes out?</>,
      duration: 1.8,
      predict: {
        options: [{ label: 'Always the same' }, { label: 'Different, in the last place', correct: true }, { label: 'Different by a whole unit' }, { label: 'Only differs for negative numbers' }],
        explain: (
          <>
            Different, only in the last decimal place: floating-point addition is commutative but not associative. Each step rounds to the nearest
            tick, and which tick depends on what was added first.
          </>
        ),
      },
      Visual: S.AssocPredict,
    },
    {
      title: 'A shuffle scrambles the order',
      body: (
        <>
          Scale that to <b>1,000,000</b> amounts in one column. Sum one order, then another: the totals disagree, worst when a large running total
          swallows a tiny amount whole. In a distributed job the rows for one group arrive from many machines in no fixed order, so the same query
          can return a different total on every run.
        </>
      ),
      duration: 4.2,
      Visual: S.ShuffleSum,
    },
    {
      title: 'Lanes and cores reorder it again',
      body: (
        <>
          Two more culprits beyond the network. SIMD registers process a batch of values per instruction, so a column engine's addition tree is
          wider and shallower than a scalar loop's. Splitting the same aggregate across cores adds a second, independent reorder, keyed to
          whichever thread's partial result lands first.
        </>
      ),
      duration: 3.6,
      Visual: S.SimdCores,
    },
    {
      title: 'A careful sum stops depending on order',
      body: (
        <>
          A compensated summation routine tracks the bits that would otherwise fall off the end, which shrinks the error a lot; an exactly rounded sum, like Python&rsquo;s <code>math.fsum</code>, returns the same answer whatever the order.
          Better still, for money: skip the binary float entirely.
        </>
      ),
      duration: 3.4,
      Visual: S.Compensated,
    },
    {
      title: 'Multiply two decimals, precision grows',
      body: (
        <>
          <code>DECIMAL(12, 2)</code> times <code>DECIMAL(5, 4)</code>: no rounding error, but the result&rsquo;s scale is the sum of the inputs&rsquo;,{' '}
          <b>6</b>. Chain a few more multiplications and the precision climbs until it hits the engine&rsquo;s ceiling, where it overflows or quietly
          drops digits.
        </>
      ),
      duration: 3.8,
      Visual: S.DecimalPrecision,
    },
    {
      title: 'Predict: how far can nanoseconds reach?',
      body: <>A count of nanoseconds, in a 64-bit integer, counting from 1970. How many years of range does that give, in either direction?</>,
      duration: 1.8,
      predict: {
        options: [{ label: 'About 50 years' }, { label: 'About 292 years', correct: true }, { label: 'About 1,000 years' }, { label: 'Unlimited' }],
        explain: <>About 292 years either way: roughly 1677 to 2262. Step outside that window and the counter overflows.</>,
      },
      Visual: S.TimestampRangePredict,
    },
    {
      title: 'Two clocks, two tick sizes, a silent miss',
      body: (
        <>
          Write microsecond times to a file; read them back somewhere that rounds to milliseconds. The two integers no longer match, even though they
          name the same instant, and an equi-join on that column silently drops rows. A join key needs the same tick size pinned on both sides,
          never left to a default.
        </>
      ),
      duration: 4,
      Visual: S.TimestampMismatch,
    },
    {
      title: 'Back to the shop: one rule for money',
      body: (
        <>
          A binary float cannot hold most cents exactly, its sums depend on arrival order, and its errors grow with magnitude. Store currency as a{' '}
          <code>DECIMAL</code> or as whole minor units, and keep the float for quantities where a tiny relative error is harmless.
        </>
      ),
      duration: 3.4,
      Visual: S.Verdict,
    },
  ],
};

export default reel;
