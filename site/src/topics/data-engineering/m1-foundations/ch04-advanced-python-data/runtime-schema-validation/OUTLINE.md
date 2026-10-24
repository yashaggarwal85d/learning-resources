# Outline — de.runtime-schema-validation

## Learning outcomes

1. Validate a record with Pydantic v2 and show the Rust-core speed difference it's built on.
2. Validate a pandas and a Polars DataFrame with the same Pandera schema.
3. Name what Great Expectations (GX Core 1.x) and Soda each check and how, honestly as
   sourced-only where the sandbox doesn't run them directly.
4. Contrast row-level and batch-level validation cost and say where validation belongs
   relative to the governance tooling the syllabus points to (§13.3).

## Reel steps (storyboard)

1. **Hook: tests proved the client correct on inputs someone thought to generate — what about everything else?**
   - `fig`: "tests prove a client correct on the inputs it was given — what checks every input nobody thought to write?"
   - Visual: "every test from last topic" / "checked, generated inputs" vs. "a real input, live" / "not yet checked".
   - Narrator's line: names the real handoff (testing proves correctness on inputs someone thought of; this topic checks the boundary itself).

2. **Reveal: a record validated against a shape, and the error it raises**
   - `fig`: "one record, one declared shape — does it coerce cleanly, or fail with exactly where it's wrong?"
   - Visual: "a good record" / "coerced and accepted" vs. "a bad record" / "rejected, exact field named".
   - Takeaway: a record validator doesn't just reject bad data — it coerces what it safely can and names exactly which field failed.

3. **Reveal: the same record check, run at scale**
   - `fig`: "twice as many records through the same record check — does the cost grow in proportion, or worse?"
   - Visual: "one batch of records" / "a measured time" vs. "twice as many" / "roughly twice the time".
   - Takeaway: the record validator's cost tracks the record count directly, not some worse curve.

4. **Predict: does the same schema shape work against two different DataFrame libraries?** (within first four ✓)
   - `fig`: "the same column checks, written once — does validating a different DataFrame library need a second schema?"
   - Options: "Yes — a pandas DataFrame and a Polars DataFrame need two separately written schemas" / "No — the same schema shape validates both" (correct).
   - Explain: the same declared column checks validate a real pandas DataFrame and a real Polars frame without being rewritten for each one.

5. **Reveal: one schema, two real DataFrame backends**
   - `fig`: "one schema definition, checked against a real pandas DataFrame and a real Polars frame — does either reject it?"
   - Visual: "a pandas DataFrame" / "validated, same schema" vs. "a Polars frame" / "validated, same schema".
   - Takeaway: one declared schema shape validates a real pandas DataFrame and a real Polars frame without being rewritten for either.

6. **Reveal: the same schema catches a real out-of-range value**
   - `fig`: "one column value outside the declared range — does the schema catch it, or quietly let it through?"
   - Visual: "every value in range" / "passes" vs. "one value out of range" / "rejected, column named".
   - Takeaway: a DataFrame schema's check isn't cosmetic — it genuinely rejects a real row that violates it, by column name.

7. **Reveal: row-level vs. batch-level cost, measured directly**
   - `fig`: "the same range check, once per value in a loop vs. once across the whole column — how much does that cost, measured?"
   - Visual: "row-level, one Python loop" / "a measured time" vs. "batch-level, one vectorized check" / "measurably faster".
   - Takeaway: the identical check costs measurably more run row by row in a loop than run once, vectorized, across the whole column.

8. **Reveal: what this sandbox names but doesn't run, and why the two differ**
   - `fig`: "a framework built around checks and a Checkpoint vs. one built around a YAML scan — which actually runs here?"
   - Visual: "an Expectation, a Checkpoint" / "named and sourced" vs. "a YAML check, a scan" / "named and sourced".
   - Takeaway: both name real, sourced mechanisms for checking data in production — neither needs its own full deployment to describe honestly what it checks and how.

9. **Recap**
10. **Prove it** — a production scenario: a pipeline validates every record one at a time with a record validator, inside a per-row loop over a whole batch, and a later governance tool re-checks the same batch again downstream. What's misplaced, and where should each check actually sit?

## Engagement arc

- Hook names the real question testing can't answer: inputs nobody thought to generate.
- Early predict (step 4) tests the intuition that two DataFrame libraries need two schemas — they don't, and the reveal shows why directly.
- Steps 2–3 establish the record layer (Pydantic) with a real pass/fail outcome and a real scaling measurement.
- Steps 5–7 build the DataFrame layer (Pandera) across two backends, then measure row-level vs. batch-level cost directly.
- Step 8 is the one layer this sandbox discloses as sourced-only rather than run — named honestly, same pattern as the previous topic's Testcontainers disclosure.
- Recap ties every layer back to what it checks; Prove It makes the cost of misplacing a check concrete.

## Post-notes headings

- Outcomes
- Lab
- Production failures this topic warns about
- Frontier
- Where this goes next

## Claims (drawn from the five verified sources)

1. Pydantic is the most widely used data validation library for Python. (Pydantic Validation)
2. Pydantic's core validation logic is written in Rust, named directly as the reason it's among the fastest Python validation libraries. (Pydantic Validation)
3. A required field is coerced where possible (e.g. a string to an int); otherwise Pydantic raises a structured error naming exactly which field and why. (Pydantic Validation)
4. `DataFrameSchema` verifies the columns and index of a pandas DataFrame; by default columns are non-nullable unless `nullable=True` is set. (DataFrame Schemas)
5. `coerce=True` on a column makes `schema.validate` coerce the column to the declared dtype before applying checks. (DataFrame Schemas)
6. Polars' own core is written in Rust; the same pandera schema syntax (the class-based `DataFrameModel`) validates a Polars DataFrame, not just a pandas one. (Data Validation with Polars)
7. Pandera ships an optional Narwhals-powered backend that keeps Polars validation fully lazy. (Data Validation with Polars)
8. GX Core workflows share one pattern: set up a Data Context, connect to data, define Expectations, run Validations; an Expectation is a verifiable, declarative assertion, grouped into an Expectation Suite. (GX Core overview)
9. A GX Checkpoint is the primary means of validating data in a production deployment, running a list of Validation Definitions and optionally triggering Actions; Data Docs are generated human-readable output. (GX Core overview)
10. SodaCL is a YAML-based, domain-specific language for data reliability; a Soda scan executes checks against a real data source and returns pass/fail/error per check, not a plain boolean. (Write SodaCL checks)
