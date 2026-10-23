import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real hands-on lab (lab/, examples.py): one metric declared once in MetricFlow, compiled to
// two different SQL queries, both cross-checked against an independent aggregate. No literal
// digits appear anywhere in this reel.
const reel: Reel = {
  steps: [
    {
      title: "The shop's two dashboards, two different numbers",
      body: (
        <>
          Finance's dashboard shows one revenue figure for the month. Marketing's dashboard, a
          different tool entirely, shows another. Same underlying data. Why do they disagree?
        </>
      ),
      duration: 4.8,
      fig: 'two dashboards, two tools, one month — two different revenue figures',
      Visual: S.Hook,
    },
    {
      title: "Reveal: what a semantic layer actually does, quoted directly",
      body: (
        <>
          A tool that generates SQL, compiling one metric's definition the same way across
          whatever different dimensions a question actually asks for.
        </>
      ),
      duration: 4.8,
      fig: 'one metric, compiled to SQL — the same way, across different dimensions',
      Visual: S.RevealPurposeQuote,
    },
    {
      title: 'Predict: does a metric defined once only ever compile to one fixed query?',
      body: (
        <>
          A metric gets declared a single time, in one place. Does that mean it only ever
          compiles down to one single, fixed SQL query?
        </>
      ),
      duration: 2.8,
      fig: 'one metric, declared once — only ever one fixed query?',
      predict: {
        options: [
          { label: 'Yes — one declaration means one fixed query, forever' },
          { label: "No — one declaration compiles to a different query for each question", correct: true },
        ],
        explain: (
          <>
            No. The whole point is compiling the same declaration differently depending on how
            it's asked for — grouped by month, or by day and category, or any other way.
          </>
        ),
      },
      Visual: S.PredictOneFixedQuery,
    },
    {
      title: 'Reveal: the lab — one metric, declared once',
      body: (
        <>
          A single `revenue` metric, declared once over one measure, sitting directly on top of
          the shop's own star schema — no second copy, anywhere.
        </>
      ),
      duration: 4.8,
      fig: 'revenue, declared once — one measure, the shop\'s own star schema underneath it',
      Visual: S.RevealLabOneMetric,
    },
    {
      title: 'Reveal: the lab — two compiled queries from one declaration',
      body: (
        <>
          That same declaration compiles to a plain monthly total with no join at all, and
          separately to a day-and-category breakdown with a join added automatically — both
          verified correct against an independent total.
        </>
      ),
      duration: 4.8,
      fig: 'same declaration — a plain monthly total, and a joined daily breakdown, both verified',
      takeaway: "A semantic layer's job is compiling one definition many correct ways, not picking a single fixed query.",
      Visual: S.RevealLabTwoQueries,
    },
    {
      title: 'Predict: does declaring the join key matter, or could it just guess from column names?',
      body: (
        <>
          A product column on one table, a matching id column on another. Does declaring that
          relationship actually matter, or could a tool just guess it from the column names?
        </>
      ),
      duration: 2.8,
      fig: 'matching column names — declare the relationship, or just guess it?',
      predict: {
        options: [
          { label: "It could probably guess — the column names obviously match" },
          { label: "Declaring it matters — the join only happens because it's declared", correct: true },
        ],
        explain: (
          <>
            Declaring it matters. The lab's own automatic join only worked because that
            relationship was explicitly declared ahead of time, not inferred from how two
            columns happened to be named.
          </>
        ),
      },
      Visual: S.PredictGuessJoin,
    },
    {
      title: 'Reveal: entities as declared join keys, quoted directly',
      body: (
        <>
          The declared join keys of a semantic model — the actual traversal paths between one
          table and another, stated explicitly rather than inferred.
        </>
      ),
      duration: 4.8,
      fig: 'declared join keys — explicit traversal paths, never inferred from column names',
      Visual: S.RevealEntitiesQuote,
    },
    {
      title: 'Reveal: the DRY principle, quoted directly',
      body: (
        <>
          Minimize redundancy by making one metric definition work everywhere it possibly can
          — stated as the layer's own design principle, not a side benefit.
        </>
      ),
      duration: 4.8,
      fig: 'minimize redundancy — one definition, used everywhere it possibly can',
      takeaway: "The lab's two-queries-from-one-definition result isn't a convenience — it's the entire reason this layer exists.",
      Visual: S.RevealDryQuote,
    },
    {
      title: "Predict: does time-based grouping need a dedicated table, or can any date column work?",
      body: (
        <>
          A table has a date column on it already. Does grouping by month or by day need some
          separate, dedicated table, or can that one existing column just be used directly?
        </>
      ),
      duration: 2.8,
      fig: 'a date column, already there — a dedicated table needed, or does it just work?',
      predict: {
        options: [
          { label: "Any column with a date in it should work on its own" },
          { label: "A dedicated, declared time table is required first", correct: true },
        ],
        explain: (
          <>
            A dedicated, declared table is required. Building this lab hit exactly that wall —
            compilation refused to run at all until one was added.
          </>
        ),
      },
      Visual: S.PredictDedicatedTimeTable,
    },
    {
      title: 'Reveal: the time spine, quoted directly',
      body: (
        <>
          A dedicated base table built specifically for time-based joins and aggregations — not
          just any table that happens to have a date column somewhere on it.
        </>
      ),
      duration: 4.8,
      fig: 'a dedicated base table, built for time joins — not just any table with a date column',
      takeaway: 'A time-based metric depends on a declared structure, never an assumption about which column happens to hold a date.',
      Visual: S.RevealTimeSpineQuote,
    },
    {
      title: "Reveal: the other tools, named; this layer's own open-sourcing",
      body: (
        <>
          Other real tools answer this same problem too, named here without being built by
          hand; this one's own move to a fully open license happened at a real industry
          conference, aligned with a renamed, still-maturing open standard.
        </>
      ),
      duration: 4.8,
      fig: 'other tools, named; an open license, an industry conference, a standard still renaming itself',
      Visual: S.RevealOtherToolsQuote,
    },
    {
      title: 'Recap',
      body: (
        <>
          A semantic layer compiles one declaration to many correct queries. Entities are the
          declared join keys that make that compiling possible. A time spine is a required,
          declared structure, not an assumption. This is an industry-wide effort, not one
          vendor's trick.
        </>
      ),
      duration: 4.8,
      fig: 'one declaration, many correct queries; declared joins; a required time table; an industry effort',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Finance now wants that same average-order-value metric broken down by customer
          region instead of by month. Does that need a brand-new definition, written from
          scratch?
        </>
      ),
      duration: 2.8,
      fig: 'the same metric, a new breakdown by region — a brand-new definition needed?',
      predict: {
        options: [
          { label: "Yes — a different breakdown needs its own new metric definition" },
          { label: "No — the existing declaration already covers it", correct: true },
        ],
        explain: (
          <>
            No. The exact same declaration, asked for a different group-by, compiles to a
            correctly joined query against the customer dimension instead — no redefinition
            needed at all.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
