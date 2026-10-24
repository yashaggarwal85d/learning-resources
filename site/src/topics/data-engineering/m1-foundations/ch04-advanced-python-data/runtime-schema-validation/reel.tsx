import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real results on this sandbox's own validation layers (examples.py): a real Pydantic v2
// BaseModel coercing a record and raising a structured error on a bad one; a real
// doubled-input timing run confirming validation cost scales linearly with record count;
// the identical pandera schema field declarations, differing only in base class, validating
// a real pandas DataFrame and a real Polars LazyFrame, and a real SchemaError raised on a
// genuine out-of-range value; a real row-level Python loop measured against a real
// vectorized pandas check on the identical condition. Great Expectations and Soda are named
// and sourced but not run (no production deployment in this sandbox). The real, disclosed
// one-time Pydantic v1-vs-v2 cross-venv benchmark lives in FACT-CHECK.md, not here. No
// literal digits anywhere.
const reel: Reel = {
  steps: [
    {
      title: 'Hook: tests proved the client correct on inputs someone thought to generate — what about everything else?',
      body: (
        <>
          The last topic proved a client correct against every input someone thought to
          generate, including a hundred Hypothesis found on its own. None of that checks a
          real input arriving live, that nobody wrote a test for at all. What does?
        </>
      ),
      duration: 4.8,
      fig: 'tests prove a client correct on the inputs it was given — what checks every input nobody thought to write?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: a record validated against a shape, and the error it raises',
      body: (
        <>
          One declared shape, checked against a real record. A well-formed one is coerced
          cleanly into the right types. A record with one bad field is rejected outright, and
          the error names that exact field — not a generic failure.
        </>
      ),
      duration: 4.8,
      fig: "one record, one declared shape — does it coerce cleanly, or fail with exactly where it's wrong?",
      Visual: S.RevealRecordValidation,
    },
    {
      title: 'Reveal: the same record check, run at scale',
      body: (
        <>
          The identical record check, run first against one batch, then against twice as
          many records. The time roughly doubles too — the cost tracks the record count
          directly, not some steeper curve hiding underneath.
        </>
      ),
      duration: 4.8,
      fig: 'twice as many records through the same record check — does the cost grow in proportion, or worse?',
      takeaway: "A record validator's cost tracks the record count directly, confirmed by doubling the input and measuring the ratio.",
      Visual: S.RevealScale,
    },
    {
      title: 'Predict: does the same schema shape work against two different DataFrame libraries?',
      body: (
        <>
          One set of column checks, written once. Does validating a DataFrame library built
          entirely differently underneath actually need its own separately written schema, or
          does the same one already cover it?
        </>
      ),
      duration: 2.8,
      fig: 'the same column checks, written once — does validating a different DataFrame library need a second schema?',
      predict: {
        options: [
          { label: 'Yes — a pandas DataFrame and a Polars DataFrame need two separately written schemas' },
          { label: 'No — the same schema shape validates both', correct: true },
        ],
        explain: (
          <>
            No. The identical declared column checks, differing only in which base class they
            inherit from, validate a real pandas DataFrame and a real Polars frame without
            being rewritten for either.
          </>
        ),
      },
      Visual: S.PredictTwoBackends,
    },
    {
      title: 'Reveal: one schema, two real DataFrame backends',
      body: (
        <>
          The same declared fields and the same range check, checked against a real pandas
          DataFrame and, separately, a real Polars frame. Neither needs its own version of the
          schema — both validate cleanly against the one that's already there.
        </>
      ),
      duration: 4.8,
      fig: 'one schema definition, checked against a real pandas DataFrame and a real Polars frame — does either reject it?',
      takeaway: 'One declared schema shape validates a real pandas DataFrame and a real Polars frame unchanged.',
      Visual: S.RevealTwoBackends,
    },
    {
      title: 'Reveal: the same schema catches a real out-of-range value',
      body: (
        <>
          The identical schema, now checked against data with one column value pushed outside
          its declared range. It doesn't quietly let it through — it rejects the row and names
          the exact column that failed.
        </>
      ),
      duration: 4.8,
      fig: 'one column value outside the declared range — does the schema catch it, or quietly let it through?',
      takeaway: "A DataFrame schema's check genuinely rejects a real violation, confirmed by the raised error naming the column.",
      Visual: S.RevealCatchesViolation,
    },
    {
      title: 'Reveal: row-level vs. batch-level cost, measured directly',
      body: (
        <>
          The identical range check, run two ways: once per value inside a plain loop, and
          once as a single vectorized operation across the whole column. Measured directly,
          the loop costs several times more than the one vectorized pass.
        </>
      ),
      duration: 4.8,
      fig: 'the same range check, once per value in a loop vs. once across the whole column — how much does that cost, measured?',
      takeaway: 'The identical check costs measurably more run row by row than run once, vectorized, across the column.',
      Visual: S.RevealRowVsBatch,
    },
    {
      title: "Reveal: what this sandbox names but doesn't run, and why the two differ",
      body: (
        <>
          A framework built around declared checks and a production Checkpoint, and a
          separate one built around a YAML-defined scan against a real data source — both
          real, sourced mechanisms for checking data once it's already landed, named directly
          rather than run, since neither needs a production deployment to describe honestly.
        </>
      ),
      duration: 4.8,
      fig: "a framework built around checks and a Checkpoint vs. one built around a YAML scan — which actually runs here?",
      Visual: S.RevealNamedNotRun,
    },
    {
      title: 'Recap',
      body: (
        <>
          A record validator coerces what it safely can and names exactly what it can't,
          scaling with record count directly. A DataFrame schema checks a whole table at once,
          the identical declared shape working across two real backends and genuinely
          rejecting a real violation. Row by row costs measurably more than vectorized, once.
          And a production-scale scan checks data that's already landed — named honestly here,
          not run, same as the previous topic's one disclosed gap.
        </>
      ),
      duration: 4.8,
      fig: 'a coerced record, a scaled check, one schema on two backends, a measured cost gap, and a named production scan',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A pipeline validates every record one at a time with a record validator, inside a
          loop running over an entire batch, and a separate governance tool re-checks that
          same batch again downstream. What's misplaced here, and where should each check
          actually sit?
        </>
      ),
      duration: 2.8,
      fig: "a record-by-record loop over a whole batch, plus a downstream governance re-check — what's misplaced, and where should each check sit?",
      predict: {
        options: [
          { label: "Nothing is misplaced — more checks at more layers is always safer" },
          { label: 'The per-record loop should be a batch-level schema check instead; governance tooling belongs downstream of validation, not duplicating it', correct: true },
        ],
        explain: (
          <>
            The per-record loop is exactly the row-level cost this topic measured directly —
            a batch-level schema check does the identical job for less. Governance tooling
            belongs downstream, auditing data that's already validated, not re-running the
            same boundary check a schema already made.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
