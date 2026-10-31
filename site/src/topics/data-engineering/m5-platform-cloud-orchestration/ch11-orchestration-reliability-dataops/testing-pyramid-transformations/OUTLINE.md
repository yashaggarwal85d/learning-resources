# Outline: Testing pyramid for transformations

## Engagement arc

1. **Hook** — a dbt model's unit test passes every time in CI and fails one time in twenty on a colleague's machine, and the cause is a GROUP BY whose row order the test's own assertion silently depended on.
2. **Predict: is a passing test proof the transform is correct?** — before the reveal, ask whether passing once, on one machine, is the same claim as being correct.
3. **Reveal: the pyramid's bottom rung, unit tests on transforms** — a static mocked input, a static expected output, no materialized model: the same shape dbt's own unit tests and a pytest test against a real local Spark session both take.
4. **Reveal: the next rung, a property stated once** — an invariant like "a merge never decreases a total" checked against many generated inputs instead of one example, catching a bug no single example would have caught.
5. **Predict: does a unit test that passes on today's example also catch tomorrow's regression?** — before the reveal, ask what a narrow assertion on one input actually proves about everything else.
6. **Reveal: the next rung, a golden-dataset snapshot** — a known-good output frozen whole and diffed on every change, catching a regression a narrow unit test's one assertion walked right past.
7. **Reveal: the top rung, named** — an in-pipeline expectation test that runs inside the live pipeline itself, catching a violation in production data no pre-merge test ever saw.
8. **Reveal: three real causes of flakiness** — ordering, time and floating point, each shown genuinely failing under a naive assertion and passing once the assertion is written correctly.
9. **Recap** — four rungs, fast and narrow at the bottom, slow and broad at the top, and the three concrete ways a test goes flaky regardless of which rung it sits on.
10. **Prove it** — this topic's own real tests: a property-based search across many generated inputs for a merge bug, and a floating-point sum that genuinely changes value depending on the order it's added in.

## Deep dives

- **Internals**: why fast-and-narrow belongs at the bottom and slow-and-broad at the top is a cost argument, not a correctness argument -- a unit test that ran as slowly as an in-pipeline check would still be correct, just too expensive to run on every change; the decision rule is about where a check can afford to live, given how often it runs.
- **Frontier**: in-pipeline expectation tests get their full treatment, with real tooling, in Chapter 13; this topic's planted bugs and pyramid become the baseline a later chapter-lab scorecard measures against, reusing the exact same bugs rather than inventing new ones.
