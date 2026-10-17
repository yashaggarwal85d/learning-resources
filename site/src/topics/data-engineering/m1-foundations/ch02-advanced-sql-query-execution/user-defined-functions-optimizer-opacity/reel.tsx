import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A function the planner cannot see into. Running example: a tax UDF applied to 1,000 order rows; the same call written
// opaquely, annotated, inlined, and as a batch. Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'A function the planner cannot see into',
      body: (
        <>
          Every operator so far was one the optimizer understands completely. A user-defined function is a black box: the planner knows its name, its
          argument types and its return type, and nothing about what happens inside.
        </>
      ),
      duration: 3.2,
      Visual: S.BlackBox,
    },
    {
      title: 'Three kinds of UDF',
      body: (
        <>
          A <b>scalar</b> UDF returns one value per call. A <b>table</b> function returns rows and can sit in <code>FROM</code>. An <b>aggregate</b> keeps a
          state, updated once per input row, and returns one result at the end.
        </>
      ),
      duration: 3.6,
      Visual: S.Kinds,
    },
    {
      title: 'VOLATILE by default: nothing may be folded',
      body: (
        <>
          Unless told otherwise, a function is assumed <code>VOLATILE</code>: its value may change within one scan. So a call with constant arguments is
          evaluated for all <b>1,000</b> rows. Declared <code>IMMUTABLE</code>, it is evaluated once and replaced by its value.
        </>
      ),
      duration: 4.4,
      Visual: S.Volatility,
    },
    {
      title: 'PARALLEL UNSAFE by default: one call serialises the plan',
      body: (
        <>
          A function that is not marked safe is <code>PARALLEL UNSAFE</code>, and a single call anywhere in a statement forces a serial plan for the whole
          statement. The penalty is not local to the call; it removes every parallel worker.
        </>
      ),
      duration: 4,
      Visual: S.ParallelGate,
    },
    {
      title: 'Predict: one unmarked UDF in a filter',
      body: (
        <>
          A large scan would normally get parallel workers. You add a filter that calls one un-annotated UDF. What happens to the plan?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'Only the filter runs serially' },
          { label: 'The whole statement loses its parallel workers', correct: true },
          { label: 'Nothing, the planner inspects the body' },
          { label: 'The query fails' },
        ],
        explain: (
          <>
            The whole statement goes serial. The planner cannot inspect the body to prove the call is safe, so the default is to refuse parallelism for
            everything. Marking the function <code>PARALLEL SAFE</code>, when it truly is, restores the workers.
          </>
        ),
      },
      Visual: S.WorkersPredict,
    },
    {
      title: 'An unknown cost schedules it too early',
      body: (
        <>
          With no <code>COST</code> declared the UDF is costed as if cheap, so the planner may run it before a cheap, selective condition. An expensive
          call then runs on every row instead of only the few that survive.
        </>
      ),
      duration: 3.8,
      Visual: S.FilterOrder,
    },
    {
      title: 'Three declarations lift three penalties',
      body: (
        <>
          <code>IMMUTABLE</code> or <code>STABLE</code> lets calls be folded, <code>PARALLEL SAFE</code> restores workers, and <code>COST</code> places the
          call after cheap filters. Each must be true: a false <code>IMMUTABLE</code> gives wrong answers, not just slow ones.
        </>
      ),
      duration: 4.2,
      Visual: S.Declarations,
    },
    {
      title: 'A SQL function can be spliced in',
      body: (
        <>
          A function written as a single expression in <code>LANGUAGE sql</code> is inlined: its body is pasted into the calling query, so the planner
          sees straight through it and can fold constants and push filters. The per-call overhead disappears.
        </>
      ),
      duration: 3.8,
      Visual: S.Inline,
    },
    {
      title: 'Predict: the same body in plpgsql',
      body: <>You rewrite the same one-line helper in <code>plpgsql</code>, with an identical body. Is it inlined?</>,
      duration: 1.6,
      predict: {
        options: [
          { label: 'Yes, the body is the same' },
          { label: 'No, only simple sql-language functions qualify', correct: true },
          { label: 'Only if marked IMMUTABLE' },
          { label: 'Only on version 18' },
        ],
        explain: (
          <>
            No. The planner inlines only <code>LANGUAGE sql</code> functions that are a plain expression, not <code>SECURITY DEFINER</code>, not
            set-returning. A <code>plpgsql</code> function stays opaque however trivial it is.
          </>
        ),
      },
      Visual: S.LanguagePredict,
    },
    {
      title: 'Froid inlines imperative UDFs',
      body: (
        <>
          Real UDFs have variables, <code>IF</code> and loops. Microsoft&rsquo;s Froid turns such a body into one relational expression built from{' '}
          <code>APPLY</code> and substitutes it for the call. It shipped in SQL Server <b>2019</b>; PostgreSQL has no equivalent for <code>plpgsql</code>.
        </>
      ),
      duration: 4.4,
      Visual: S.Froid,
    },
    {
      title: 'Python UDFs pay per row, or per batch',
      body: (
        <>
          A Python UDF called from Spark crosses a process boundary on every row. An Arrow-based vectorized UDF sends a batch instead: the same 1,000 rows
          cross in 10 trips. Databricks measured <b>3</b> to over <b>100</b> times faster.
        </>
      ),
      duration: 4.6,
      Visual: S.Batches,
    },
    {
      title: 'Back to the black box',
      body: (
        <>
          Annotate truthfully: volatility, parallel safety and cost. Write small helpers as single-expression <code>sql</code> functions. And before
          accepting that UDFs are slow, look for the engine&rsquo;s way to open the box.
        </>
      ),
      duration: 3.6,
      Visual: S.Verdict,
    },
    {
      title: 'Prove it · 1 of 2',
      body: <>What is the default parallel safety of a function created without any PARALLEL clause?</>,
      duration: 1.2,
      predict: {
        options: [{ label: 'PARALLEL SAFE' }, { label: 'PARALLEL RESTRICTED' }, { label: 'PARALLEL UNSAFE', correct: true }],
        explain: <>PARALLEL UNSAFE. The default is the cautious choice, which is why one forgotten annotation can serialise a whole plan.</>,
      },
      Visual: S.ProveDefault,
    },
    {
      title: 'Prove it · 2 of 2',
      body: <>Which function language does PostgreSQL consider for inlining?</>,
      duration: 1.2,
      predict: {
        options: [{ label: 'plpgsql' }, { label: 'sql', correct: true }, { label: 'any language' }],
        explain: <>sql, for single-expression functions only.</>,
      },
      Visual: S.ProveLanguage,
    },
  ],
};

export default reel;
