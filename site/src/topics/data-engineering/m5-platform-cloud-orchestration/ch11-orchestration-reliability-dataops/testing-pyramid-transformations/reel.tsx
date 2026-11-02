import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Four pyramid rungs, demonstrated on real tests (examples.py): a dbt-unit-test-style mocked
// input/output, a real pytest test against a real local Spark session, a real `hypothesis`
// property search that finds a genuine counterexample in a buggy merge, a golden-dataset
// snapshot that catches a regression a narrow unit test misses, and three real flaky-test causes
// (ordering, time, floating point) each shown failing and then fixed. Sourced: dbt's and Apache
// Spark's own testing documentation.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A model's unit test passes every time in CI and fails one time in twenty on a
          colleague's machine. The cause: a GROUP BY whose row order the assertion silently
          depended on.
        </>
      ),
      duration: 4.8,
      fig: "passed in CI. failed on a colleague's machine.",
      Visual: S.Hook,
    },
    {
      title: 'Predict: does a passing test prove the transform is correct?',
      body: (
        <>
          That same test passed, repeatedly, before anyone noticed the failures elsewhere. Does
          passing prove the transform is actually correct?
        </>
      ),
      duration: 2.8,
      fig: 'does a passing test prove correctness?',
      predict: {
        options: [
          { label: 'Yes -- a passing test is proof enough' },
          { label: 'No -- it only proves the test and the machine agreed', correct: true },
        ],
        explain: (
          <>
            A test can pass for the wrong reason just as easily as for the right one. The GROUP
            BY bug was there the whole time, hiding behind an assertion that happened to match.
          </>
        ),
      },
      Visual: S.PredictPassingProves,
    },
    {
      title: 'Reveal: the bottom rung, unit tests on transforms',
      body: (
        <>
          A static mocked input, a static expected output, no materialized model -- the same
          shape a dbt unit test and a pytest test against a real local Spark session both take.
        </>
      ),
      duration: 4.8,
      fig: 'mocked input. expected output. nothing materialized.',
      Visual: S.RevealUnitTests,
    },
    {
      title: 'Reveal: the next rung, a property stated once',
      body: (
        <>
          An invariant like "a merge never decreases a total" gets checked against many
          generated inputs instead of one example, and a property search finds the exact case
          where a buggy merge actually violates it.
        </>
      ),
      duration: 4.8,
      fig: 'one rule. many generated inputs. a real counterexample.',
      takeaway: 'One example only proves a transform survived that one example.',
      Visual: S.RevealPropertyBased,
    },
    {
      title: "Predict: does a passing unit test also catch tomorrow's regression?",
      body: (
        <>
          A narrow unit test on today's input keeps passing. Does that mean it would also catch
          a regression introduced tomorrow?
        </>
      ),
      duration: 2.8,
      fig: "does today's passing test catch tomorrow's regression?",
      predict: {
        options: [
          { label: 'Yes -- if the logic is right once, it stays right' },
          { label: "No -- a narrow assertion can miss a change it never checks", correct: true },
        ],
        explain: (
          <>
            A unit test only checks what its own assertion names. A regression that lands
            outside that one checked value walks straight past it, untouched.
          </>
        ),
      },
      Visual: S.PredictTomorrowRegression,
    },
    {
      title: 'Reveal: the next rung, a golden-dataset snapshot',
      body: (
        <>
          A known-good output, frozen whole and diffed on every change, catches a regression that
          a narrow unit test's single assertion walks right past.
        </>
      ),
      duration: 4.8,
      fig: 'the whole known-good output, diffed every time.',
      Visual: S.RevealGoldenSnapshot,
    },
    {
      title: 'Reveal: the top rung, named',
      body: (
        <>
          An in-pipeline expectation test runs inside the live pipeline itself, catching a
          violation in real production data that no pre-merge test ever saw.
        </>
      ),
      duration: 4.8,
      fig: 'inside the live pipeline, not before it.',
      takeaway: 'The top rung exists because production data finds violations a pre-merge test never gets to see.',
      Visual: S.RevealTopRung,
    },
    {
      title: 'Reveal: three real causes of flakiness',
      body: (
        <>
          Ordering, time, and floating point -- each one shown genuinely failing under a naive
          assertion, and passing once the assertion is written to actually match the claim.
        </>
      ),
      duration: 4.8,
      fig: 'ordering. time. floating point.',
      Visual: S.RevealFlakiness,
    },
    {
      title: 'Recap',
      body: (
        <>
          Four rungs, fast and narrow at the bottom, slow and broad at the top, and the three
          concrete ways a test goes flaky no matter which rung it sits on.
        </>
      ),
      duration: 4.8,
      fig: 'four rungs. three real causes of flakiness.',
      takeaway: 'A flaky test is not random -- it is always one of a short, nameable list of causes.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          This topic's own real tests: a property search across many generated merges, and a
          plain running total that genuinely changes value depending on the order it is added in.
        </>
      ),
      duration: 2.8,
      fig: 'same three numbers. does the order change the total?',
      predict: {
        options: [
          { label: 'No -- addition is addition, order never matters' },
          { label: 'Yes -- the exact same numbers sum to two different floats', correct: true },
        ],
        explain: (
          <>
            Floating-point addition is not associative. The same three numbers, added in a
            different order, land on a measurably different total.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
