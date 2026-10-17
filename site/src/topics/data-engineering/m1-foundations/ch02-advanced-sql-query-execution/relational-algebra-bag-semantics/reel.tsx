import type { Reel, StepCtx } from '../../../../../reels/types';
import * as S from './scenes';

const Q1 = (c: StepCtx) => <S.Quiz {...c} chips={['A customer placed 7 orders', 'SELECT customer_id FROM orders', 'No GROUP BY, no DISTINCT']} work={['Every order is its own fact', '→ 7 rows']} />;
const Q2 = (c: StepCtx) => (
  <S.Quiz {...c} chips={['P = {3, 3, 3, 5}', 'Q = {3, 5, 5}', 'P EXCEPT ALL Q = ?']} work={['count of 3 in P minus in Q: 3 − 1 = 2', 'count of 5 in P minus in Q: 1 − 2 → 0', '→ 2 rows, both copies of 3']} />
);
const Q3 = (c: StepCtx) => (
  <S.Quiz {...c} chips={['Branch A: 50,000 rows', 'Branch B: 50,000 rows, no overlap', 'UNION vs UNION ALL']} work={['Both return 100,000 rows', 'UNION still hashes or sorts all 100,000', 'the planner cannot know they are disjoint for free']} />
);

const reel: Reel = {
  steps: [
    {
      title: 'A query is secretly a tree',
      body: (
        <>
          You write <code>SELECT</code>, <code>WHERE</code>, <code>JOIN</code>, <code>GROUP BY</code> left to right, but the engine never sees your
          words. It sees a small set of operators, chained into a tree with tables as leaves. Everything in this chapter — rewrites, costs, join
          algorithms — only makes sense once that tree is pinned down.
        </>
      ),
      duration: 3.6,
      Visual: S.QueryTree,
    },
    {
      title: 'The six operators',
      body: (
        <>
          Selection keeps some rows. Projection keeps some columns. Join and product combine two relations, row by row or every pairing. The set
          operators stack two results together or keep what they share. Aggregation collapses rows into groups. That is the whole language.
        </>
      ),
      duration: 3.6,
      Visual: S.OperatorTable,
    },
    {
      title: 'Predict: how many rows',
      body: <>One customer has placed 5 separate orders. You run a plain select on their customer id — no grouping, no filtering it away. How many rows come back?</>,
      duration: 1.6,
      predict: {
        options: [{ label: 'One' }, { label: 'Five', correct: true }, { label: 'It depends on indexing' }, { label: 'Zero, duplicates are removed automatically' }],
        explain: <>Five. Each row is its own fact — an order happened — and nothing merges them unless you ask it to with DISTINCT or GROUP BY.</>,
      },
      Visual: S.RowsPredict,
    },
    {
      title: 'A bag, not a set',
      body: (
        <>
          A mathematical <em>set</em> cannot hold the same value twice. SQL chose a <em>bag</em>: a collection that can hold a value again and
          again, and remembers how many times. Every table and every query result in SQL is a bag, not a set, by design.
        </>
      ),
      duration: 3.6,
      Visual: S.BagVsSet,
    },
    {
      title: 'Collapsing by accident',
      body: (
        <>
          <code>SUM(amount) GROUP BY customer_id</code> needs every order row to survive to be counted once each. Run <code>DISTINCT</code> on the
          customer id first and four of those five rows vanish before the sum ever sees them — a silently wrong total, not an error.
        </>
      ),
      duration: 3.8,
      Visual: S.CollapseByAccident,
    },
    {
      title: 'Two ways to stack results',
      body: (
        <>
          An order gets flagged twice: once by an automated check, once by a reviewer. Stack the two flagged lists keeping every row and it appears
          twice. Stack them the other way, throwing out repeats, and it appears once. Neither is wrong — picking the wrong one for the question is.
        </>
      ),
      duration: 4,
      Visual: S.UnionStack,
    },
    {
      title: 'INTERSECT and EXCEPT, with or without ALL',
      body: (
        <>
          Bag <b>A</b> is one, one, two; bag <b>B</b> is one, two, two. <code>INTERSECT ALL</code> keeps the smaller count of each shared value.
          <code>EXCEPT ALL</code> keeps the leftover after subtracting counts — and without <code>ALL</code>, <code>EXCEPT</code> can drop to
          nothing even when the <code>ALL</code> version keeps a row.
        </>
      ),
      duration: 4.2,
      Visual: S.IntersectExcept,
    },
    {
      title: 'Predict: combine a list with itself',
      body: <>For an ordinary set, combining a list with itself changes nothing — it was already everything it could be. Does that still hold for a bag-shaped stack that keeps every row?</>,
      duration: 1.8,
      predict: {
        options: [{ label: 'Yes, nothing changes' }, { label: 'No, every row doubles', correct: true }, { label: 'Only duplicate rows double' }, { label: 'It depends on column order' }],
        explain: <>No — it doubles every row. The version that keeps everything has no idea the two sides are identical; only the version that throws out repeats comes back to where it started.</>,
      },
      Visual: S.IdempotencePredict,
    },
    {
      title: 'Selection pushdown',
      body: (
        <>
          <code>products</code> has 50,000 rows; about 2.5% are electronics. Filter before joining to <code>order_items</code> and the join only
          ever sees 1,250 rows, 48,750 pruned away first. Filter after joining and the engine has already paid to build every pairing.
        </>
      ),
      duration: 4,
      Visual: S.PushdownSelection,
    },
    {
      title: 'Projection pushdown',
      body: (
        <>
          <code>order_items</code> has 300,000,000 rows at 220 bytes each if every column rides along: 66 GB moved. Keep only the 3 columns a
          query actually needs, 24 bytes each, and 7.2 GB moves instead — dropped before the rest of the tree ever runs.
        </>
      ),
      duration: 4,
      Visual: S.PushdownProjection,
    },
    {
      title: 'Join order does not change the answer',
      body: (
        <>
          <code>R ⋈ S</code> and <code>S ⋈ R</code> return the same bag; so does any regrouping of a three-way join. This single fact is the whole
          reason a cost-based optimizer can search join orders at all — every tree it tries is proven equal, not a different answer.
        </>
      ),
      duration: 4,
      Visual: S.JoinCommute,
    },
    {
      title: 'Why UNION pays for a dedup',
      body: (
        <>
          <code>UNION ALL</code> compiles to one append pass: 215,000 row touches, nothing compared. <code>UNION</code> compiles to that same
          append, then a second pass that hashes or sorts every row hunting for duplicates: 430,000 row touches, paid even if nothing overlaps.
        </>
      ),
      duration: 4.4,
      Visual: S.PlannerPaths,
    },
    {
      title: 'Back to the problem',
      body: (
        <>
          Flagged orders, stacked two ways: keeping every row costs 215,000 row touches, one pass; deduplicating costs 430,000, two passes over
          the same rows. Either way the distinct order ids land at 173,000 — the extra pass changes the cost, not which orders are flagged.
        </>
      ),
      duration: 3.8,
      Visual: S.Verdict,
    },
    {
      title: 'Prove it · 1 of 3',
      body: <>A customer placed 7 orders. You select just their customer id, no GROUP BY, no DISTINCT. How many rows come back?</>,
      duration: 1.4,
      predict: {
        options: [{ label: 'One' }, { label: 'Seven', correct: true }, { label: 'It depends on the index' }],
        explain: <>Seven. Every order row is its own fact, and a plain select never merges facts on its own.</>,
      },
      Visual: Q1,
    },
    {
      title: 'Prove it · 2 of 3',
      body: <>Bag P is three, three, three, five. Bag Q is three, five, five. How many rows does P EXCEPT ALL Q return?</>,
      duration: 1.6,
      predict: {
        options: [{ label: 'Zero' }, { label: 'One' }, { label: 'Two', correct: true }, { label: 'Four' }],
        explain: <>Two. P has three copies of the value three, Q has one, leaving two; P has one copy of five, Q has two, leaving none.</>,
      },
      Visual: Q2,
    },
    {
      title: 'Prove it · 3 of 3',
      body: <>Two branches of 50,000 rows each, known to share nothing. Does UNION skip its duplicate-elimination pass since there is nothing to remove?</>,
      duration: 1.6,
      predict: {
        options: [{ label: 'Yes, the planner detects no overlap' }, { label: 'No, it still hashes or sorts every row', correct: true }, { label: 'Only if the columns are indexed' }],
        explain: <>No. The planner cannot know the branches are disjoint without doing the work, so UNION still pays for the pass even when it finds nothing to remove.</>,
      },
      Visual: Q3,
    },
  ],
};

export default reel;
