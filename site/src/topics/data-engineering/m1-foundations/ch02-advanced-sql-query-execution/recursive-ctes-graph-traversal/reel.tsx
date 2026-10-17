import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A query that reads its own output. Running example: a mega-bundle (product 1) made of two kits (2 and 3) that
// share a microphone (4), plus a stand (5) and cables (6). Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'A hierarchy needs a query that reads itself',
      body: (
        <>
          A bundle contains kits, and kits contain parts. &ldquo;Everything inside this bundle&rdquo; has no fixed number of joins: the depth is in the
          data. <code>WITH RECURSIVE</code> lets a query refer to its own output until nothing new appears.
        </>
      ),
      duration: 3.4,
      Visual: S.Hierarchy,
    },
    {
      title: 'A loop over one working table',
      body: (
        <>
          Seed the working table with the bundle&rsquo;s direct components: <b>2</b> rows. Feed it through the recursive term to get the next level:{' '}
          <b>4</b> rows. Feed that in and <b>0</b> rows come out, so the loop stops. That is the fixpoint.
        </>
      ),
      duration: 5,
      Visual: S.Conveyor,
    },
    {
      title: 'Predict: how many rows does the explosion hold?',
      body: (
        <>
          Every row the loop produced is kept: <b>2</b> kits and <b>4</b> parts. How many rows are in the explosion before any grouping?
        </>
      ),
      duration: 1.6,
      predict: {
        options: [{ label: 'Four' }, { label: 'Five' }, { label: 'Six', correct: true }, { label: 'Three' }],
        explain: (
          <>
            Six. The microphone appears twice, once under each kit, because there are two separate reasons it is needed. The <code>GROUP BY</code>{' '}
            afterwards collapses them to five distinct components.
          </>
        ),
      },
      Visual: S.RowsPredict,
    },
    {
      title: 'Quantities multiply down the tree',
      body: (
        <>
          Two of a kit means two of everything inside it, so the recursive term multiplies quantity as it descends. The shared microphone arrives via
          two paths, 2 and 1, and the final <code>SUM</code> adds them to <b>3</b>.
        </>
      ),
      duration: 4.2,
      Visual: S.Quantities,
    },
    {
      title: 'A cycle never runs out of rows',
      body: (
        <>
          Bad data makes a kit a component of its own sub-component. Now every pass produces a new row from the last one, the working table is never
          empty, and the loop never stops.
        </>
      ),
      duration: 4,
      Visual: S.CycleLoop,
    },
    {
      title: 'Predict: does UNION fix it?',
      body: (
        <>
          The recursive query tracks a <code>depth</code> column. You change <code>UNION ALL</code> to <code>UNION</code>, which discards duplicate
          rows. Does the query now terminate on the cycle?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'Yes, repeated rows are dropped' },
          { label: 'No, depth keeps every row distinct', correct: true },
          { label: 'Yes, but only on PostgreSQL' },
          { label: 'It errors immediately' },
        ],
        explain: (
          <>
            No. A row that goes round the cycle again has a larger <code>depth</code>, so it is a different row and survives <code>UNION</code>. The
            loop must be broken by remembering where the path has been.
          </>
        ),
      },
      Visual: S.UnionPredict,
    },
    {
      title: 'Carry the path; refuse to revisit',
      body: (
        <>
          Each row carries the list of nodes on its own path. A step onto a node already on the list is flagged as a cycle and not expanded further.
          Every path then ends: it runs out of new nodes or hits one it has seen.
        </>
      ),
      duration: 4.4,
      Visual: S.PathGuard,
    },
    {
      title: 'SEARCH and CYCLE are sugar for that',
      body: (
        <>
          PostgreSQL <b>14</b> added the standard <code>CYCLE</code> clause, which writes the path bookkeeping for you, and <code>SEARCH</code>, which
          adds a depth-first or breadth-first sort column. DuckDB has neither, so the hand-written path form is the portable one.
        </>
      ),
      duration: 3.8,
      Visual: S.Sugar,
    },
    {
      title: 'Two failures need two fixes',
      body: (
        <>
          A <b>cycle</b> loops forever and needs a path guard. A <b>blow-up</b> has no cycle at all: heavily shared parts make the number of paths
          grow explosively with depth. Cycle detection does nothing for that; a depth cap or a shortest-path question does.
        </>
      ),
      duration: 4.2,
      Visual: S.TwoFailures,
    },
    {
      title: 'Back to the bundle',
      body: (
        <>
          Seed, iterate, stop when nothing is new. Multiply quantities down the tree, sum at the end. Never trust real data to be acyclic: carry a
          path or use <code>CYCLE</code>, and keep a depth cap for the blow-up.
        </>
      ),
      duration: 3.6,
      Visual: S.Verdict,
    },
    {
      title: 'Prove it · 1 of 2',
      body: <>Which standard clause, available from PostgreSQL 14, detects a cycle for you?</>,
      duration: 1.2,
      predict: {
        options: [{ label: 'SEARCH' }, { label: 'CYCLE', correct: true }, { label: 'LIMIT' }, { label: 'DISTINCT' }],
        explain: <>CYCLE. It marks a row whose key is already on its path. SEARCH only adds an ordering column.</>,
      },
      Visual: S.ProveCycle,
    },
    {
      title: 'Prove it · 2 of 2',
      body: <>A recursive term returns no new rows on its third evaluation. What happens to the loop?</>,
      duration: 1.2,
      predict: {
        options: [{ label: 'It loops again' }, { label: 'It stops', correct: true }, { label: 'It errors' }],
        explain: <>It stops. The loop ends exactly when a step adds nothing: that is the fixpoint.</>,
      },
      Visual: S.ProveStop,
    },
  ],
};

export default reel;
