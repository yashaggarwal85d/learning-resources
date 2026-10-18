import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Rewrites the planner applies before it estimates any cost. Running example: orders and customers (customer_id is the
// customers primary key), and a correlated EXISTS over 1,000 outer rows. Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'Rewrites run before anything is costed',
      body: (
        <>
          Right now every plan has meant exactly what it said. The rewrite stage changes that: it turns one legal plan into a cheaper, equally legal one,
          using proofs rather than numbers. No row counts are consulted.
        </>
      ),
      duration: 3.4,
      Visual: S.BeforeCosts,
    },
    {
      title: 'The always-safe three',
      body: (
        <>
          <b>Predicate pushdown</b> filters early. <b>Projection pushdown</b> drops unused columns early. <b>Constant folding</b> evaluates an expression
          of literals once, so <code>2 + 3</code> becomes <b>5</b> before a single row is read. All are correct by construction, so no cost model is needed.
        </>
      ),
      duration: 4,
      Visual: S.Safe,
    },
    {
      title: 'Join elimination deletes a join',
      body: (
        <>
          A <code>LEFT JOIN</code> can be removed outright when it cannot match more than one inner row (a unique key) and no column of the inner side is
          used above it. The whole scan of the inner table goes with it.
        </>
      ),
      duration: 4,
      Visual: S.Eliminate,
    },
    {
      title: 'Predict: the unused LEFT JOIN',
      body: (
        <>
          <code>SELECT o.order_id FROM orders o LEFT JOIN customers c ON o.customer_id = c.customer_id</code>, where <code>customer_id</code> is the primary
          key of customers and nothing from <code>c</code> is read. What does the plan contain?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'A hash join of both tables' },
          { label: 'Only a scan of orders', correct: true },
          { label: 'A merge join' },
          { label: 'An error, since c is unused' },
        ],
        explain: (
          <>
            Only a scan of orders. The key guarantees at most one match per order, so the join cannot change the row count, and nothing from{' '}
            <code>c</code> is needed, so the join and the scan of customers are deleted.
          </>
        ),
      },
      Visual: S.EliminatePredict,
    },
    {
      title: 'A WHERE can make an outer join inner',
      body: (
        <>
          A <code>LEFT JOIN</code> promises every left row, with NULLs where nothing matched. If a strict filter such as <code>b.y = 42</code> then rejects
          those NULL rows, the outer join was never needed, and it becomes a plain join, which the optimizer can reorder far more freely.
        </>
      ),
      duration: 4.2,
      Visual: S.Strength,
    },
    {
      title: 'Or turn it into an anti-join',
      body: (
        <>
          <code>LEFT JOIN b … WHERE b.z IS NULL</code> keeps only the null-extended rows. The planner recognises that as an anti-join and changes the join
          type to Anti, the same operator <code>NOT EXISTS</code> produces directly.
        </>
      ),
      duration: 4,
      Visual: S.ToAnti,
    },
    {
      title: 'Predict: the join type of LEFT JOIN … IS NULL',
      body: (
        <>
          <code>a LEFT JOIN b ON a.x = b.y WHERE b.z IS NULL</code>, where <code>b.z</code> cannot be NULL on a real match. What join type does the plan
          show?
        </>
      ),
      duration: 1.6,
      predict: {
        options: [{ label: 'Left' }, { label: 'Inner' }, { label: 'Anti', correct: true }, { label: 'Full' }],
        explain: (
          <>
            Anti. Only null-extended rows can pass the filter, so the query asks for left rows with no match. Two different spellings, one operator.
          </>
        ),
      },
      Visual: S.AntiPredict,
    },
    {
      title: 'A correlated subquery is a dependent join',
      body: (
        <>
          A subquery that mentions an outer column is a <b>dependent join</b>: the right side is evaluated once for every left row. For <b>1,000</b> outer rows
          that is <b>1,000</b> evaluations, each starting from scratch. Unnesting rewrites it until the right side no longer depends on the left.
        </>
      ),
      duration: 4.4,
      Visual: S.Dependent,
    },
    {
      title: 'Simple unnesting: pull the predicate up',
      body: (
        <>
          For many <code>EXISTS</code> subqueries the correlation is only a convenience of syntax. Pull the dependent predicate up the tree and the
          dependent join becomes an ordinary semi-join: <b>1</b> pass instead of 1,000 evaluations.
        </>
      ),
      duration: 4,
      Visual: S.PullUp,
    },
    {
      title: 'General unnesting: push the dependency down',
      body: (
        <>
          When the subquery has its own aggregate, pulling up does not reach. The general method pushes the dependent join down through joins, group-bys and
          outer joins, each with its own rule, until the needed values are local and it reduces to a regular join.
        </>
      ),
      duration: 4.2,
      Visual: S.PushDown,
    },
    {
      title: 'Back to the plan',
      body: (
        <>
          Do not hand-optimise a join the planner already proves redundant. Pick the spelling your team reads best, because the rewrite makes them the same.
          A <code>SubPlan</code> that will not go away suggests a shape the heuristics do not cover.
        </>
      ),
      duration: 3.8,
      Visual: S.Verdict,
    },
    {
      title: 'Prove it · 1 of 2',
      body: <>Which two conditions together let a LEFT JOIN be removed entirely?</>,
      duration: 1.2,
      predict: {
        options: [
          { label: 'At most one inner match, and no inner column used above', correct: true },
          { label: 'The inner table is small, and indexed' },
          { label: 'The join is on an integer column' },
        ],
        explain: <>At most one inner match (so rows are not duplicated) and no inner column needed above the join (so nothing is lost).</>,
      },
      Visual: S.ProveRemove,
    },
    {
      title: 'Prove it · 2 of 2',
      body: <>What is the formal name for a subquery that needs a value from the outer row?</>,
      duration: 1.2,
      predict: {
        options: [{ label: 'A semi-join' }, { label: 'A dependent join', correct: true }, { label: 'A cross join' }],
        explain: <>A dependent join: the right side is evaluated for every tuple of the left.</>,
      },
      Visual: S.ProveDependent,
    },
  ],
};

export default reel;
