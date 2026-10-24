import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A shrunk counterexample catches a real bug a hand-picked example
// test, checking only the cases its author thought of, would never
// have been written to find.
const reel: Reel = {
  steps: [
    {
      title: "A real allocator checks only that each new slot's own real length fits the page, never checking where that slot actually starts. A real property test throws a large, random space of real insert sequences at it. Does a hand-picked example test actually need to find this bug, or does the random search find it anyway?",
      body: (
        <>
          A real allocator, checked only one way.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'A hand-picked example would have found it just as easily' },
          { label: 'The random search finds it, without anyone thinking of the case', correct: true },
          { label: 'Only if the sequence is extremely long' },
        ],
        explain: (
          <>
            It finds it anyway, by trying many cases.
          </>
        ),
      },
      Visual: S.BugPredict,
    },
    {
      title: "Measured: the real property test, run against hundreds of real, randomly generated insert sequences, genuinely finds a sequence that violates the bounds invariant, and shrinks it down to a real, minimal failing case",
      body: (
        <>
          Hundreds of real sequences, one genuine failure.
        </>
      ),
      duration: 3.0,
      Visual: S.BugReveal,
    },
    {
      title: "The real, random search that found the bug started from sequences up to thirty inserts long. Does the real counterexample it actually reports stay that long, or does it get smaller?",
      body: (
        <>
          A long, random sequence that triggers the bug.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'It stays exactly as long as whatever triggered it' },
          { label: 'It genuinely shrinks down to a much smaller, minimal case', correct: true },
          { label: 'Only if the bug is triggered early in the sequence' },
        ],
        explain: (
          <>
            It shrinks, down to its own minimal cause.
          </>
        ),
      },
      Visual: S.ShrinkPredict,
    },
    {
      title: "Measured: the real, reported counterexample shrinks down to a handful of inserts whose real total lands just barely over the page's own real capacity, the smallest real overrun proptest could find",
      body: (
        <>
          The real failure, reduced to its own cause.
        </>
      ),
      duration: 3.0,
      takeaway: 'Shrinking turns a real, messy failure into its own smallest real cause, not a lucky guess closer to the bug.',
      Visual: S.ShrinkReveal,
    },
    {
      title: "The identical real property test, run against the checked, correct insert instead. Does it pass because this topic happened to pick easy random cases, or because the real invariant genuinely holds?",
      body: (
        <>
          The checked insert, the identical real test.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'It only passes by luck, on these particular cases' },
          { label: 'It genuinely holds across every one of the random cases', correct: true },
          { label: 'It depends on the capacity chosen' },
        ],
        explain: (
          <>
            It genuinely holds, across every case.
          </>
        ),
      },
      Visual: S.CheckedPredict,
    },
    {
      title: "Measured: the identical real bounds check, run against hundreds of real, randomly generated sequences, genuinely passes every single one against the checked insert, the same real invariant that found a bug moments earlier",
      body: (
        <>
          Every random case, checked the same way.
        </>
      ),
      duration: 3.0,
      takeaway: "A property test's own real confidence comes from how many cases it tried, not from any one case alone.",
      Visual: S.CheckedReveal,
    },
    {
      title: "The proptest crate's own README states this directly: it tests that real properties hold for arbitrary inputs and, on failure, automatically finds the real, minimal case that reproduces the problem. Does this topic's own two measured runs match exactly what that sentence describes?",
      body: (
        <>
          proptest, in its own words.
        </>
      ),
      duration: 2.8,
      takeaway: "A shrunk counterexample finds what one, hand-picked example genuinely cannot.",
      Visual: S.DocsReveal,
    },
    {
      title: 'Recap: trying a great many real cases',
      body: (
        <>
          A real property test tries far more cases than any one person would think to write by hand, and shrinks whatever it finds down to its own smallest real cause; a real, stateful comparison against a simpler reference model catches disagreement the identical way, across a real, random sequence of operations.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
