import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// What did the reference table say at that moment? Running example: one product whose price changed on day 1 (10), day 10 (12)
// and day 20 (11); four orders on days 5, 9, 12 and 25. Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'What price was in effect when the order was placed?',
      body: (
        <>
          The price table has one row per <i>change</i>: 10 from day 1, 12 from day 10, 11 from day 20. An order on day 12 must be matched to the 12, not to
          today&rsquo;s 11 and not to the first 10. That is a question about a moment.
        </>
      ),
      duration: 3.6,
      Visual: S.Problem,
    },
    {
      title: 'Equality alone matches every price',
      body: (
        <>
          Join on product only and each of the <b>4</b> orders pairs with all <b>3</b> historical prices: <b>12</b> rows, mostly wrong. An equi-join cannot
          express &ldquo;the price at that time&rdquo;.
        </>
      ),
      duration: 4,
      Visual: S.AllPairs,
    },
    {
      title: 'Predict: add the inequality',
      body: (
        <>
          Now require <code>valid_from &lt;= event_time</code> as well. Orders on days 5, 9, 12 and 25 against prices from days 1, 10 and 20. How many rows
          come back?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [{ label: '4' }, { label: '7', correct: true }, { label: '12' }, { label: '3' }],
        explain: (
          <>
            Seven: day 5 and day 9 match one price each, day 12 matches two, day 25 matches three. The inequality prunes, but several old prices still
            satisfy it. The rule needs a second part: keep only the closest.
          </>
        ),
      },
      Visual: S.CountPredict,
    },
    {
      title: 'Keep only the closest one',
      body: (
        <>
          Of the prices that started on or before the order, keep the one with the latest start. That is an equality on the product, an inequality on time,
          and a closest-wins tiebreak: an <b>as-of join</b>. Exactly <b>4</b> rows come back, one per order.
        </>
      ),
      duration: 4.2,
      Visual: S.Closest,
    },
    {
      title: 'Two hand-built versions',
      body: (
        <>
          A correlated subquery with <code>ORDER BY valid_from DESC LIMIT 1</code> does it, and so does <code>LATERAL</code> with the same ending. Both are
          cheap only with an index on (product, valid_from); without it each order rescans the history.
        </>
      ),
      duration: 4,
      Visual: S.HandBuilt,
    },
    {
      title: 'A native ASOF JOIN says it directly',
      body: (
        <>
          DuckDB, ClickHouse and Snowflake have the operator built in, each with its own spelling: an inequality condition and, for Snowflake, a named{' '}
          <code>MATCH_CONDITION</code>. Each left row joins at most one right row, chosen by closeness.
        </>
      ),
      duration: 4.2,
      Visual: S.Spellings,
    },
    {
      title: 'Predict: an order before the first price',
      body: (
        <>
          An order is placed on day 0, before the product&rsquo;s first price change. With <code>ASOF LEFT JOIN</code>, what does that order return?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'The first price anyway' },
          { label: 'The order, with a NULL price', correct: true },
          { label: 'The order is dropped' },
          { label: 'An error' },
        ],
        explain: (
          <>
            The order with a NULL price. Nothing was in effect yet, so there is no match, and a left join keeps the left row with NULLs on the right. An
            inner as-of join would drop it.
          </>
        ),
      },
      Visual: S.UnmatchedPredict,
    },
    {
      title: 'A native plan walks both sides once',
      body: (
        <>
          Both inputs are naturally in time order, so an engine can merge them in one pass instead of seeking an index once per order. ClickHouse supports
          the operator only in its hash and full sorting merge algorithms: a dedicated path.
        </>
      ),
      duration: 4,
      Visual: S.MergeWalk,
    },
    {
      title: 'Joining to "now" leaks the future',
      body: (
        <>
          A training example from day 5 joined to today&rsquo;s price, 11, uses information that did not exist yet. The as-of value is 10. That is{' '}
          <b>temporal leakage</b>: it inflates offline accuracy and fails in production, and an as-of join prevents it by construction.
        </>
      ),
      duration: 4.4,
      Visual: S.Leakage,
    },
    {
      title: 'Bitemporal: a second time axis',
      body: (
        <>
          Everything so far used one axis, when a fact was true. A bitemporal system adds when the database <i>learned</i> it, so a late correction does
          not rewrite what an earlier report would have shown. That is a harder problem with its own chapter.
        </>
      ),
      duration: 4,
      Visual: S.Bitemporal,
    },
    {
      title: 'Back to the order price',
      body: (
        <>
          Use a native <code>ASOF JOIN</code> where you have one, an indexed <code>LATERAL</code> where you do not, and audit every join to a
          &ldquo;current&rdquo; value in a feature pipeline.
        </>
      ),
      duration: 3.6,
      Visual: S.Verdict,
    },
    {
      title: 'Prove it · 1 of 2',
      body: <>Is an as-of join an equi-join?</>,
      duration: 1.2,
      predict: {
        options: [{ label: 'Yes' }, { label: 'No, it needs an inequality', correct: true }],
        explain: <>No. It uses equality to narrow candidates and an inequality with closest-wins to choose one.</>,
      },
      Visual: S.ProveInequality,
    },
    {
      title: 'Prove it · 2 of 2',
      body: <>Which Snowflake clause names the as-of comparison?</>,
      duration: 1.2,
      predict: {
        options: [{ label: 'MATCH_CONDITION', correct: true }, { label: 'USING' }, { label: 'LATERAL' }],
        explain: <>MATCH_CONDITION, separate from the ordinary equality ON clause.</>,
      },
      Visual: S.ProveClause,
    },
  ],
};

export default reel;
