import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// What happens between typing a query and getting rows. Running example: SELECT … FROM orders WHERE status = 'paid' ORDER BY
// event_time LIMIT 100, and a view over paid orders. Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'Typing a query is not running it',
      body: (
        <>
          Between the text you type and the rows you get back, the database passes your query through a pipeline. Every later topic in this section is a
          closer look at one stage of it, so this step lays out the whole route.
        </>
      ),
      duration: 3.2,
      Visual: S.Route,
    },
    {
      title: 'Five stages',
      body: (
        <>
          <b>Parse</b> checks the grammar. <b>Bind</b> looks names up in the catalog. <b>Rewrite</b> applies rules such as views. <b>Plan</b> picks the
          cheapest way to compute it. <b>Execute</b> runs the chosen plan and returns rows.
        </>
      ),
      duration: 4.4,
      Visual: S.FiveStages,
    },
    {
      title: 'Predict: a query on a table that does not exist',
      body: (
        <>
          <code>SELECT * FROM no_such_table WHERE x = 1</code> is perfectly good grammar. At which stage does it fail?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'Parse' },
          { label: 'Bind, when the catalog is consulted', correct: true },
          { label: 'Plan' },
          { label: 'Execute' },
        ],
        explain: (
          <>
            Bind. The parser only checks grammar and never looks in the catalog, so it cannot know the table is missing. The semantic stage, which resolves
            names against the catalog, is the first to find out.
          </>
        ),
      },
      Visual: S.FailPredict,
    },
    {
      title: 'Bind turns names into meaning',
      body: (
        <>
          The parser sees a call named <code>count</code>. Bind asks the catalog what that name is: an aggregate, not an ordinary function. The same tree
          shape becomes a different node depending on the answer, so only now does the query have a meaning.
        </>
      ),
      duration: 4,
      Visual: S.Bind,
    },
    {
      title: 'Rewrite erases views',
      body: (
        <>
          A view is a stored query. The rewrite stage replaces a reference to it by its definition, so what reaches the planner reads the base tables
          directly. By then the planner does not know a view was ever involved.
        </>
      ),
      duration: 3.8,
      Visual: S.ViewErased,
    },
    {
      title: 'Logical plan: what; physical plan: how',
      body: (
        <>
          After rewrite the query is an algebra tree of selections, projections, joins and groupings: <i>what</i> to compute. The planner turns each
          operator into a concrete algorithm: <i>how</i>. Because many physical plans give the same result, there is something to choose between.
        </>
      ),
      duration: 4.2,
      Visual: S.LogicalPhysical,
    },
    {
      title: 'Paths: candidates, then the cheapest',
      body: (
        <>
          Each candidate implementation is a <b>path</b>. A scan has at least <b>2</b>: sequential, or through an index. A join has at least <b>3</b>: nested
          loop, merge or hash. The planner costs the paths and expands the cheapest into the plan.
        </>
      ),
      duration: 4.2,
      Visual: S.Paths,
    },
    {
      title: 'Physical properties: provided and required',
      body: (
        <>
          A path can <i>provide</i> a property for free: an index scan on <code>event_time</code> delivers rows already in that order. An{' '}
          <code>ORDER BY</code> or a merge join <i>requires</i> an order. When a provided order meets a required one, no separate sort is needed. How rows are partitioned across workers is a property too.
        </>
      ),
      duration: 4.2,
      Visual: S.Properties,
    },
    {
      title: 'Predict: ORDER BY with a matching index',
      body: (
        <>
          There is an index on <code>event_time</code>. You run <code>SELECT * FROM orders ORDER BY event_time LIMIT 100</code>. Does the plan contain a
          separate <code>Sort</code> node?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'Yes, ORDER BY always sorts' },
          { label: 'No, the index scan provides the order', correct: true },
          { label: 'Only if the table is small' },
          { label: 'Only with LIMIT removed' },
        ],
        explain: (
          <>
            No separate sort. The index scan reads in <code>event_time</code> order as a side effect, which meets the requirement, so the sort step is
            deleted from the plan.
          </>
        ),
      },
      Visual: S.SortPredict,
    },
    {
      title: 'Read the plan from the leaves up',
      body: (
        <>
          A plan has the shape of the algebra tree: scans at the leaves, joins and aggregates above them, the result at the root. Read it bottom-up, because
          the leaves depend on nothing and every cost above is built from what they produce.
        </>
      ),
      duration: 4,
      Visual: S.ReadTree,
    },
    {
      title: 'Back to the query',
      body: (
        <>
          Parse, bind, rewrite, plan, execute: the meaning is fixed by the third stage, and the choices are made in the fourth. Check whether an index can delete
          a sort, remember a view is invisible to the planner, and read plans bottom-up.
        </>
      ),
      duration: 3.8,
      Visual: S.Verdict,
    },
    {
      title: 'Prove it · 1 of 2',
      body: <>Which stage replaces a view by its definition?</>,
      duration: 1.2,
      predict: {
        options: [{ label: 'Parse' }, { label: 'Rewrite', correct: true }, { label: 'Execute' }],
        explain: <>Rewrite. After it, the planner sees only base tables.</>,
      },
      Visual: S.ProveRewrite,
    },
    {
      title: 'Prove it · 2 of 2',
      body: <>What does PostgreSQL call a candidate physical implementation of an operator?</>,
      duration: 1.2,
      predict: {
        options: [{ label: 'A path', correct: true }, { label: 'A rule' }, { label: 'A view' }],
        explain: <>A path: a cut-down plan holding only what the planner needs to compare costs.</>,
      },
      Visual: S.ProvePath,
    },
  ],
};

export default reel;
