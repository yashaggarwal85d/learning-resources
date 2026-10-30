import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number here is computed and asserted in examples.py: a row policy scoped to one region
// out of five rows returns two; a direct file read, a stale materialized view and an old export
// all still return every ssn unmasked, five for five.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          The shop masks `customers.email` for the analyst role. An analyst still recovers real
          addresses — through a query on a derived table nobody masked, and a direct read of the
          underlying file. Only one of three paths they tried actually went through the mask.
        </>
      ),
      duration: 5.6,
      fig: 'masked column, three paths tried. Which one actually leaked?',
      Visual: S.Hook,
    },
    {
      title: 'Predict: covered, or not?',
      body: (
        <>
          A query that reads the masked column directly. A query against a derived table built
          from it. A direct read of the file underneath. Which of the three does the mask cover?
        </>
      ),
      duration: 5.6,
      fig: 'masked query, derived table, direct file read. Covered, or not?',
      predict: {
        options: [
          { label: 'The mask covers all three — it is attached to the column itself' },
          { label: 'Only the direct masked-column query — the other two sit outside it entirely', correct: true },
        ],
        explain: (
          <>
            A mask attaches to the column on the live table, evaluated when the engine runs a
            query against that table. A derived table built earlier and a direct file read never
            go through that evaluation at all.
          </>
        ),
      },
      Visual: S.Predict,
    },
    {
      title: 'Reveal: the engine enforces it, not the application',
      body: (
        <>
          The policy lives inside the query engine, evaluated at every place the row or column is
          read. An application-side check only protects requests that happen to pass through that
          one application's own code.
        </>
      ),
      duration: 5.6,
      fig: 'enforced in the engine, at every read — not in one app.',
      Visual: S.RevealEngineVsApp,
    },
    {
      title: 'Reveal: a row policy, mechanically',
      body: (
        <>
          Postgres runs the policy's own expression against every row before the user's own
          conditions. The one exception is a function proven not to leak anything, which the
          planner may run earlier. A superuser, a `BYPASSRLS` role, or usually the table's owner,
          skips the policy altogether.
        </>
      ),
      duration: 6,
      fig: 'the policy runs first, row by row — with three named exceptions.',
      Visual: S.RevealRowPolicy,
    },
    {
      title: 'Reveal: five engines, one shared idea',
      body: (
        <>
          Snowflake's masking and row-access policies, Unity Catalog's row filters and column
          masks, BigQuery's row-level security, Lake Formation's data filters, Trino's OPA-backed
          filters and masks — five vocabularies for the exact same idea: a policy the engine
          evaluates at read time.
        </>
      ),
      duration: 6,
      fig: 'five engines, five names, one idea: evaluated where the data is read.',
      Visual: S.RevealFiveEngines,
    },
    {
      title: 'Reveal: what it costs the plan',
      body: (
        <>
          A row policy pushed down to the scan cuts the rows the engine ever has to touch. One
          that is not pushed down scans everything first and filters after. And a result cached
          before the mask is applied is a cache that just handed back unmasked values.
        </>
      ),
      duration: 6,
      fig: 'pushed down, fewer rows touched. Not pushed down, every row scanned.',
      Visual: S.RevealPlanCost,
    },
    {
      title: 'Reveal: the derived table nobody masked',
      body: (
        <>
          A materialized view built from the data before the mask existed keeps serving the
          values it was built with. To the engine it is just another table — nothing connects it
          back to the mask on the table it came from.
        </>
      ),
      duration: 6,
      fig: 'built before the mask, serving the values it was built with.',
      takeaway: 'A derived table keeps whatever values it was built with — a mask added to its source doesn’t reach it.',
      Visual: S.RevealDerivedTable,
    },
    {
      title: 'Reveal: the extract that already left',
      body: (
        <>
          An export taken before, or outside, the policy's reach carries the values the export
          query returned at the time. The policy only governs queries against the live table, not
          copies already taken off it.
        </>
      ),
      duration: 5.6,
      fig: 'exported once, carries what it carried then.',
      takeaway: 'The policy governs queries against the live table — not a copy already taken off it.',
      Visual: S.RevealExtract,
    },
    {
      title: 'Reveal: the direct file read',
      body: (
        <>
          Anyone with read access to the file path reads the raw data straight from storage,
          underneath the engine entirely — no policy evaluated, because no policy was ever asked.
          Encrypting the file itself is the only thing standing in the way of that specific path.
        </>
      ),
      duration: 6,
      fig: 'read the file directly, and no policy is ever asked at all.',
      takeaway: 'A row or column policy only runs when a query asks the engine — a direct file read never asks.',
      Visual: S.RevealDirectFile,
    },
    {
      title: 'Recap',
      body: (
        <>
          Engine-side enforcement beats an application check because it covers every caller. Five
          engines, one shared idea, with their own costs on the plan. And three paths — a stale
          derived table, an old export, a direct file read — sit entirely outside what any policy
          reaches.
        </>
      ),
      duration: 6,
      fig: 'enforced at every read; costs the plan; three paths outside it entirely.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A mask is added to `ssn` today. A CSV export was taken last month. A materialized view
          was last refreshed the day before today's mask went on. Right now, which of the two
          still carries unmasked values: just the export, or both?
        </>
      ),
      duration: 6,
      fig: 'mask added today. Export from last month; view refreshed yesterday. Which leaks?',
      predict: {
        options: [
          { label: 'Just the export — the view was refreshed recently enough to pick up the mask' },
          { label: 'Both — the view was last built before the mask existed, same as the export', correct: true },
        ],
        explain: (
          <>
            The view's last refresh happened before the mask was added, so it carries whatever the
            refresh query returned then — unmasked, exactly like the export. Only a refresh run
            after the mask exists would pick it up.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
