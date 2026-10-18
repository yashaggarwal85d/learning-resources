import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A CTE: look inside it, or compute it once and hand it up sealed. Running example: big_table with an index on key, queried
// through a CTE once and twice, and an expensive function evaluated per row. Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'Look inside the CTE, or seal it?',
      body: (
        <>
          A <code>WITH</code> clause names a query. The optimizer must decide: let the rest of the query see inside it, so filters and indexes can reach in,
          or compute it once, in isolation, and pass up a finished result. Each choice is right sometimes.
        </>
      ),
      duration: 3.4,
      Visual: S.Choice,
    },
    {
      title: 'The old fence: always materialised',
      body: (
        <>
          Before PostgreSQL <b>12</b>, a CTE was never inlined and always evaluated first. It was an <b>optimization fence</b>: even a one-line CTE was a
          sealed box, so a later <code>WHERE key = 123</code> could not use the index on <code>key</code>. The table was scanned, copied, then filtered.
        </>
      ),
      duration: 4.4,
      Visual: S.Fence,
    },
    {
      title: 'PostgreSQL 12 and later: inline when safe',
      body: (
        <>
          A CTE is inlined automatically if it is side-effect free, non-recursive and referenced <b>once</b>. The parent&rsquo;s filter is then pushed into its
          definition and the index is used. Referenced more than once, it is materialised.
        </>
      ),
      duration: 4.2,
      Visual: S.Default,
    },
    {
      title: 'Predict: one reference, then two',
      body: (
        <>
          The same CTE over a big table with an index on <code>key</code>. Used once with <code>WHERE key = 123</code>, then joined to itself with the filter on
          one side. Which uses the index by default?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'Both' },
          { label: 'Only the single-reference one', correct: true },
          { label: 'Only the self-join' },
          { label: 'Neither' },
        ],
        explain: (
          <>
            Only the single-reference one. The self-join references the CTE twice, so by default it is computed once as a temporary copy with no index, and
            both sides read that copy. <code>NOT MATERIALIZED</code> would recover the index.
          </>
        ),
      },
      Visual: S.RefPredict,
    },
    {
      title: 'NOT MATERIALIZED forces the inline',
      body: (
        <>
          Write <code>WITH w AS NOT MATERIALIZED (…)</code> and the parent&rsquo;s restrictions are applied straight to scans of the base table, using the
          index. The price: the base table is scanned once per reference. It wins when each use needs only a small part.
        </>
      ),
      duration: 4.2,
      Visual: S.NotMat,
    },
    {
      title: 'MATERIALIZED protects expensive work',
      body: (
        <>
          A CTE that calls an expensive function and is used twice should be computed once. Materialisation does exactly that: the function runs once per
          base row, not <b>2</b> times. Writing <code>MATERIALIZED</code> keeps that guarantee when the query is edited later.
        </>
      ),
      duration: 4.2,
      Visual: S.Expensive,
    },
    {
      title: 'Predict: an expensive function in a twice-used CTE',
      body: (
        <>
          A CTE calls an expensive function once per row and is referenced twice. You mark it <code>NOT MATERIALIZED</code>. How many times does the function
          run per base row?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [{ label: 'Once' }, { label: 'Twice', correct: true }, { label: 'Zero' }, { label: 'It depends on the index' }],
        explain: (
          <>
            Twice: once per reference, because each reference is inlined and evaluates it. That is the duplicated computation the documentation warns about.
          </>
        ),
      },
      Visual: S.CallsPredict,
    },
    {
      title: 'Some engines always recompute',
      body: (
        <>
          SQL Server does not materialise a CTE at all: every reference re-executes it. There is no keyword to reach for; the documented fix is to compute the
          result once into a temporary object and reference that.
        </>
      ),
      duration: 4,
      Visual: S.Recompute,
    },
    {
      title: 'When a fence is what you want',
      body: (
        <>
          Ask for the fence when recomputation duplicates real work, when the CTE wraps a function with side effects so that once is a correctness
          requirement, or when an isolated, named step reads better. Remove it when letting the optimizer reach inside saves more than the repeat costs.
        </>
      ),
      duration: 4.4,
      Visual: S.WantFence,
    },
    {
      title: 'Back to the CTE',
      body: (
        <>
          Know which regime your engine and version use. State <code>MATERIALIZED</code> or <code>NOT MATERIALIZED</code> where it matters, because a
          reference count can change in a later edit. Test single evaluation; do not just read the plan.
        </>
      ),
      duration: 3.6,
      Visual: S.Verdict,
    },
    {
      title: 'Prove it · 1 of 2',
      body: <>From which PostgreSQL release are single-reference, side-effect-free CTEs inlined by default?</>,
      duration: 1.2,
      predict: {
        options: [{ label: '10' }, { label: '12', correct: true }, { label: '14' }],
        explain: <>PostgreSQL 12. Before that every CTE was a fence.</>,
      },
      Visual: S.ProveRelease,
    },
    {
      title: 'Prove it · 2 of 2',
      body: <>On SQL Server, how many times does a CTE referenced twice execute?</>,
      duration: 1.2,
      predict: {
        options: [{ label: 'Once' }, { label: 'Twice', correct: true }, { label: 'It depends on a hint' }],
        explain: <>Twice. SQL Server re-executes the definition for each reference and offers no materialisation switch.</>,
      },
      Visual: S.ProveSqlServer,
    },
  ],
};

export default reel;
