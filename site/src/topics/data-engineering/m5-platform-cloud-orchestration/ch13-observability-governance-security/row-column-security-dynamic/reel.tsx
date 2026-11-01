import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Measured directly against a real local PostgreSQL (examples.py): a restricted role sees all
// 3,000 rows before any row-security policy exists, exactly 1,000 after a policy restricting to
// one region is applied, EXPLAIN shows no Filter node before the policy and an explicit one
// after it, and a superuser (standing in for a direct file read) bypasses the policy entirely,
// still seeing all 3,000 rows.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          The shop masks the customer email column for the analyst role, and an analyst still
          recovers addresses. They ran a query that filters on the masked column, a query on a
          derived table nobody masked, and read a file straight from the bucket. Which of the
          three did the policy fail to cover, and which did it cover but leak through anyway?
        </>
      ),
      duration: 5,
      fig: 'email masked for analysts. An analyst still recovers addresses. Which path leaked?',
      Visual: S.Hook,
    },
    {
      title: "Reveal: a policy enforced in the engine applies to every query; an application filter only applies to requests that go through that application",
      body: (
        <>
          An application-side filter only protects whoever's request goes through that
          application. A policy enforced inside the query engine applies to every query against
          that table, no matter who sends it or through what tool.
        </>
      ),
      duration: 4.8,
      fig: 'application filter: one path. Engine policy: every query, whoever sends it.',
      Visual: S.RevealEngineVsApp,
    },
    {
      title: 'Predict: query as the restricted role before any row policy exists. How many rows come back?',
      body: (
        <>
          A table of three thousand customer rows has no row-security policy on it yet. Query
          it as the role that will eventually be restricted. How many rows come back?
        </>
      ),
      duration: 2.8,
      fig: 'restricted role, no policy yet, 3,000 rows exist. How many come back?',
      predict: {
        options: [
          { label: 'Fewer than 3,000 -- the role name alone already implies some restriction' },
          { label: 'All 3,000 -- nothing has told the engine to restrict anything yet', correct: true },
        ],
        explain: (
          <>
            All three thousand. A role's name carries no restriction on its own; until a policy
            actually exists on the table, every grant that role holds applies without limit.
          </>
        ),
      },
      Visual: S.PredictBeforePolicy,
    },
    {
      title: 'Reveal: all 3,000 rows, measured directly -- nothing stops the query yet',
      body: (
        <>
          Measured directly: with no policy in place, the restricted role's query returns the
          entire table, all three thousand rows.
        </>
      ),
      duration: 4.8,
      fig: 'no policy: all 3,000 rows returned, measured.',
      Visual: S.RevealBeforePolicy,
    },
    {
      title: "Elaborate: a row-security policy is an expression evaluated before the user's own query conditions",
      body: (
        <>
          A row-security policy is a Boolean expression the engine evaluates for every row,
          ahead of whatever conditions the user's own query added -- with one exception, a
          leakproof function the optimiser may run early precisely because it is proven not to
          leak anything.
        </>
      ),
      duration: 5,
      fig: "a policy expression runs before the user's own WHERE, row by row.",
      takeaway: 'An engine-enforced policy evaluates before the query itself, which is why it applies no matter what the query asks.',
      Visual: S.ElaboratePolicyExpression,
    },
    {
      title: 'Predict: the same query, same role, after the policy is applied. How many rows now?',
      body: (
        <>
          Apply a row policy limiting that role to one region, which matches a third of the
          table. Run the exact same query again, same role, nothing else changed. How many rows
          come back this time?
        </>
      ),
      duration: 2.8,
      fig: 'same query, same role, policy now limits to one region. Rows now?',
      predict: {
        options: [
          { label: "Still all 3,000 -- a policy only matters if the query's own WHERE clause asks for it" },
          { label: 'Exactly the rows the policy allows, regardless of what the query asked for', correct: true },
        ],
        explain: (
          <>
            Exactly what the policy allows. The policy is evaluated whether or not the query's
            own WHERE clause mentions it at all -- the query never had to ask.
          </>
        ),
      },
      Visual: S.PredictAfterPolicy,
    },
    {
      title: 'Reveal: exactly 1,000 rows, measured directly -- the policy, not the query, decided',
      body: (
        <>
          Measured directly: the identical query, unchanged, now returns exactly one thousand
          rows -- the ones the policy's region condition allows, out of three thousand total.
        </>
      ),
      duration: 4.8,
      fig: 'same query: 1,000 rows now, measured. The policy decided, not the query.',
      Visual: S.RevealAfterPolicy,
    },
    {
      title: 'Elaborate: the plan itself changes -- EXPLAIN shows no Filter node before the policy, one after it',
      body: (
        <>
          Reading the query plan directly: before the policy, there is no Filter node at all.
          After it, an explicit Filter node appears. When a query engine has to choose between
          an optimisation and protecting against a leak, it always makes the secure choice, even
          when that choice costs more to run.
        </>
      ),
      duration: 5,
      fig: 'before: no Filter node. After: one appears, measured on EXPLAIN.',
      takeaway: 'A policy is not free: it adds a step to the plan, and secure sometimes just means slower.',
      Visual: S.ElaboratePlanChanges,
    },
    {
      title: "Reveal: a superuser bypasses the policy entirely, and so does anyone with the file's path",
      body: (
        <>
          Measured directly: a superuser role, which bypasses row security by design, still
          sees every one of the three thousand rows -- the policy never touched that path at
          all. Anyone who can read the underlying file directly, or an extract already copied
          out, or an unprotected view built on top of the table, gets the same result: none of
          them ever asked the engine's policy anything.
        </>
      ),
      duration: 5,
      fig: 'superuser, direct file, raw extract: all 3,000, measured. The policy never ran.',
      Visual: S.RevealBypassPaths,
    },
    {
      title: 'Recap',
      body: (
        <>
          A row policy runs before the query, applies to every caller, and can change the plan
          itself, measured directly. None of that reaches a bypass that never asks the engine at
          all.
        </>
      ),
      duration: 5,
      fig: 'engine policy: every query, real cost. Bypass paths: untouched, by design.',
      takeaway: 'An engine-enforced policy is stronger than an application filter, but it only ever covers requests that actually reach the engine.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
