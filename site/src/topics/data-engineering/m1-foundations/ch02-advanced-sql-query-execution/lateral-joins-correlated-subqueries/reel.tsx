import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A subquery that runs once per outer row. Running example: four customers (c1 has 5 orders, c2 has 2, c3 has 0, c4 has 4)
// and "each customer's 3 most recent orders". Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'Some questions need the outer row first',
      body: (
        <>
          &ldquo;Each customer&rsquo;s <b>3</b> most recent orders&rdquo; cannot be asked of the orders table alone. Whether an order qualifies depends on the
          other orders of its own customer, so the customer has to come first, and the question is asked again for each one.
        </>
      ),
      duration: 3.4,
      Visual: S.Question,
    },
    {
      title: 'Plain subqueries cannot see their neighbours',
      body: (
        <>
          A subquery in <code>FROM</code> is evaluated on its own, so it cannot mention a column of an earlier <code>FROM</code> item. Put the keyword{' '}
          <code>LATERAL</code> in front and the wall comes down: the subquery may use the current outer row.
        </>
      ),
      duration: 3.8,
      Visual: S.Wall,
    },
    {
      title: 'LATERAL runs once per outer row',
      body: (
        <>
          For each customer the subquery reruns with that customer substituted in, sorts only their orders, keeps the newest <b>3</b>, and the picks are
          joined back to the customer. Then the spotlight moves to the next row.
        </>
      ),
      duration: 5.2,
      Visual: S.Spotlight,
    },
    {
      title: 'Predict: how many rows come back?',
      body: (
        <>
          c1 has 5 orders, c2 has 2, c3 has none and c4 has 4. Joined with <code>CROSS JOIN LATERAL</code> and a cap of 3 each, how many rows come back?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [{ label: '11' }, { label: '8', correct: true }, { label: '9' }, { label: '12' }],
        explain: (
          <>
            Eight: 3 for c1, 2 for c2, 0 for c3, 3 for c4. A cross join keeps only outer rows whose subquery returned something, so c3 vanishes, and no
            customer can return more than the cap.
          </>
        ),
      },
      Visual: S.CountPredict,
    },
    {
      title: 'LEFT JOIN LATERAL keeps the empty ones',
      body: (
        <>
          Write <code>LEFT JOIN LATERAL (…) ON true</code> and a customer whose subquery returns nothing still appears once, with NULLs in the
          subquery&rsquo;s columns. The same query now returns <b>9</b> rows, c3 included.
        </>
      ),
      duration: 4,
      Visual: S.LeftKeep,
    },
    {
      title: 'More than an anti-join can give',
      body: (
        <>
          An anti-join says only that c3 has no orders. A lateral subquery with <code>LEFT JOIN</code> answers that too, and for everyone else it also
          brings back the matched rows&rsquo; columns: the best match, not just a yes or no.
        </>
      ),
      duration: 3.6,
      Visual: S.NotAntiJoin,
    },
    {
      title: 'CROSS APPLY is the same idea',
      body: (
        <>
          SQL Server spells it <code>APPLY</code>. <code>CROSS APPLY</code> keeps outer rows that produced a result, like <code>JOIN LATERAL</code>;{' '}
          <code>OUTER APPLY</code> keeps the rest too, like <code>LEFT JOIN LATERAL … ON true</code>. The translation is mechanical.
        </>
      ),
      duration: 3.6,
      Visual: S.Dialects,
    },
    {
      title: 'A simple LATERAL is just a join',
      body: (
        <>
          If the subquery only restates an equality, the planner pulls it up into an ordinary join, which it may then reorder like any other. The keyword
          buys nothing there. It earns its place when the per-row work has its own sort and cap.
        </>
      ),
      duration: 3.8,
      Visual: S.PullUp,
    },
    {
      title: 'Predict: add LIMIT, can it still be flattened?',
      body: (
        <>
          The equality-only subquery was pulled up into a join. You add <code>ORDER BY … LIMIT 1</code> inside it. Can the planner still flatten it?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'Yes, any subquery can be flattened' },
          { label: 'No, sorting and limiting block the pull-up', correct: true },
          { label: 'Only if there is an index' },
          { label: 'Only on SQL Server' },
        ],
        explain: (
          <>
            No. The planner will not pull up a subquery that sorts or limits, because a cap per outer row cannot be turned into one big join without
            changing the answer. It stays a per-row nested loop, and an index on the correlated columns is what makes each run cheap.
          </>
        ),
      },
      Visual: S.LimitPredict,
    },
    {
      title: 'The index decides the price',
      body: (
        <>
          Per customer, the plan either sorts that customer&rsquo;s orders, or walks an index on (customer, time) and stops after the cap. The window
          function alternative sorts everything once. Which wins depends on the data and the index.
        </>
      ),
      duration: 4,
      Visual: S.IndexPrice,
    },
    {
      title: 'Back to the question',
      body: (
        <>
          Reach for <code>LATERAL</code> when the per-row work cannot be a join predicate: its own <code>ORDER BY</code> and <code>LIMIT</code>, or a function
          of the outer row. Use <code>LEFT JOIN LATERAL … ON true</code> to keep every outer row, and index the correlated columns.
        </>
      ),
      duration: 3.6,
      Visual: S.Verdict,
    },
    {
      title: 'Prove it · 1 of 2',
      body: <>Which LATERAL form corresponds to SQL Server&rsquo;s OUTER APPLY?</>,
      duration: 1.2,
      predict: {
        options: [{ label: 'CROSS JOIN LATERAL' }, { label: 'LEFT JOIN LATERAL … ON true', correct: true }, { label: 'NOT EXISTS' }],
        explain: <>LEFT JOIN LATERAL … ON true. Both keep the outer row when the subquery returns nothing.</>,
      },
      Visual: S.ProveApply,
    },
    {
      title: 'Prove it · 2 of 2',
      body: <>A customer has 2 orders. A top-3 lateral subquery runs for them. How many rows does that customer contribute?</>,
      duration: 1.2,
      predict: {
        options: [{ label: '3' }, { label: '2', correct: true }, { label: '1' }],
        explain: <>Two. A cap is a ceiling, not a quota: the subquery returns what exists, up to 3.</>,
      },
      Visual: S.ProveCap,
    },
  ],
};

export default reel;
