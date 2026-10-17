import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Existence questions: which rows have at least one match, or none. Running example: five customers and the
// orders that reference them (c1 three orders, c3 one). Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'The question is only: does a match exist?',
      body: (
        <>
          Which customers have ordered? Which have never? Neither question wants the matching order&rsquo;s columns, only whether a match exists. SQL
          gives such questions their own operators, and four spellings that look interchangeable but are not.
        </>
      ),
      duration: 3.2,
      Visual: S.Question,
    },
    {
      title: 'A semi-join keeps each row once',
      body: (
        <>
          A plain join returns a customer once per matching order: <b>4</b> rows for five customers. A <b>semi-join</b> keeps each customer that has at
          least one match, exactly once: <b>2</b> rows, however many orders each has.
        </>
      ),
      duration: 4.4,
      Visual: S.SemiJoin,
    },
    {
      title: 'An anti-join keeps the unmatched',
      body: (
        <>
          The complement, an <b>anti-join</b>, keeps the customers with no match at all: <b>3</b> of the five. Neither operator can duplicate a row,
          because neither returns anything from the right-hand side.
        </>
      ),
      duration: 3.6,
      Visual: S.AntiJoin,
    },
    {
      title: 'Predict: which is less work for "who ordered"?',
      body: (
        <>
          Two queries answer &ldquo;which customers have ordered?&rdquo;: <code>EXISTS</code>, or a join followed by <code>DISTINCT</code>. Which does
          less work?
        </>
      ),
      duration: 1.6,
      predict: {
        options: [
          { label: 'The join and DISTINCT, joins are fastest' },
          { label: 'EXISTS, it never produces the duplicates', correct: true },
          { label: 'Exactly the same work' },
          { label: 'It depends only on indexes' },
        ],
        explain: (
          <>
            <code>EXISTS</code> is a semi-join: each customer is emitted once, so there is nothing to remove. The join produces one row per order
            first, then pays a dedup pass to throw most of them away.
          </>
        ),
      },
      Visual: S.WorkPredict,
    },
    {
      title: 'Five spellings, two safety classes',
      body: (
        <>
          <code>EXISTS</code>, <code>NOT EXISTS</code> and <code>IN</code> test a row&rsquo;s existence or equal-to-some. <code>LEFT JOIN … IS NULL</code>{' '}
          is safe if the tested column is never NULL on a real match. <code>NOT IN</code> is the odd one out: it is safe only when no NULL can appear.
        </>
      ),
      duration: 4.6,
      Visual: S.Spellings,
    },
    {
      title: 'EXISTS goes through the planner gate unchecked',
      body: (
        <>
          PostgreSQL rewrites <code>EXISTS</code> and <code>NOT EXISTS</code> into a semi- or anti-join unconditionally, because &ldquo;a row exists&rdquo;
          is a plain true-or-false fact. There is no three-valued case to protect.
        </>
      ),
      duration: 3.4,
      Visual: S.GateExists,
    },
    {
      title: 'NOT IN must show a NOT NULL certificate',
      body: (
        <>
          <code>NOT IN</code> is an anti-join only if the planner can <i>prove</i>, from declared <code>NOT NULL</code> constraints, that neither side
          can be NULL. With the proof it takes the fast anti-join path; without it, it falls back to a slower subplan that keeps the real semantics.
        </>
      ),
      duration: 4.4,
      Visual: S.GateNotIn,
    },
    {
      title: 'Predict: drop NOT NULL, keep the data',
      body: (
        <>
          A <code>NOT IN</code> query shows an anti-join. You drop the <code>NOT NULL</code> constraint on the subquery column, but no NULL is stored.
          The data is unchanged. What happens to the plan?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'Nothing, the data decides' },
          { label: 'It changes to a subplan; the schema decides', correct: true },
          { label: 'The query returns different rows' },
          { label: 'The query now errors' },
        ],
        explain: (
          <>
            The plan changes, the result does not. The planner cannot look at today&rsquo;s data, because tomorrow a NULL could arrive; it trusts only
            declared constraints. That is why the safety of <code>NOT IN</code> belongs to the schema.
          </>
        ),
      },
      Visual: S.SchemaPredict,
    },
    {
      title: 'Reading it in EXPLAIN',
      body: (
        <>
          A <code>Semi</code> or <code>Anti</code> join type in the plan means the planner found the fast path; PostgreSQL 18 also adds{' '}
          <code>Right Semi</code>. A <code>SubPlan</code> under a <code>NOT IN</code> is the signature of the fallback.
        </>
      ),
      duration: 3.8,
      Visual: S.ExplainRead,
    },
    {
      title: 'Back to the question',
      body: (
        <>
          For existence questions default to <code>EXISTS</code> and <code>NOT EXISTS</code>. They need no certificate, never duplicate rows, and always
          have a fast path. Treat <code>NOT IN</code> as safe only with a declared <code>NOT NULL</code>.
        </>
      ),
      duration: 3.4,
      Visual: S.Verdict,
    },
    {
      title: 'Prove it · 1 of 2',
      body: <>Which spelling can silently return nothing when the subquery column contains a NULL?</>,
      duration: 1.2,
      predict: {
        options: [{ label: 'EXISTS' }, { label: 'NOT EXISTS' }, { label: 'NOT IN', correct: true }, { label: 'LEFT JOIN … IS NULL' }],
        explain: <>NOT IN. It is a chain of not-equal comparisons, and one NULL link makes the whole chain UNKNOWN.</>,
      },
      Visual: S.ProveSpelling,
    },
    {
      title: 'Prove it · 2 of 2',
      body: <>A customer has three matching orders. How many rows does a semi-join return for that customer?</>,
      duration: 1.2,
      predict: {
        options: [{ label: 'Three' }, { label: 'One', correct: true }, { label: 'Zero' }],
        explain: <>One. A semi-join asks only whether a match exists, so the number of matches never multiplies the row.</>,
      },
      Visual: S.ProveOnce,
    },
  ],
};

export default reel;
