import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: Fisher-Yates by counting outcomes, three classic biased shuffles (naive swap,
// random-comparator sort, a generator too small to reach every permutation), Sattolo's cyclic
// variant, and three honest options when the data does not fit in memory. Every number is in
// examples.py: an exact twenty-seven-choice enumeration, a sixty-thousand-run chi-squared test,
// a factorial-versus-generator-period crossing, and an exactly enumerated buffered-shuffle
// emission table.

const reel: Reel = {
  steps: [
    {
      title: 'The obvious shuffle — for each position, swap with a random position — looks right, and is provably wrong without ever running it.',
      body: <>Three cards, twenty-seven equally likely choices, six orderings.</>,
      duration: 4,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: 'Out of sixty thousand shuffles of three cards with that rule, how do the six orderings come out?',
      body: <>About ten thousand each, three high and three low, exactly even, or it depends on the seed.</>,
      duration: 2.5,
      fig: 'PredictNaiveOutcome',
      predict: {
        options: [
          { label: 'About ten thousand each, uniform' },
          { label: 'Three orderings high, three low', correct: true },
          { label: 'Exactly ten thousand each, always' },
          { label: 'It depends only on the seed' },
        ],
        explain: (
          <>
            Twenty-seven choices cannot split evenly across six outcomes, so the shuffle is biased in a fixed shape
            that repeats run after run, not something a different seed washes out.
          </>
        ),
      },
      Visual: S.PredictNaiveOutcome,
    },
    {
      title: 'Fisher-Yates: for each position from the last down to the second, draw a position uniformly from everything not yet placed, and swap.',
      body: <>One draw per position, from everything still unplaced.</>,
      duration: 4.5,
      fig: 'FisherYatesReveal',
      Visual: S.FisherYatesReveal,
    },
    {
      title: 'The algorithm makes a chain of shrinking random choices, one per position, and every distinct chain lands on a different ordering — so each ordering is reached by exactly one chain, out of all of them.',
      body: <>Every ordering is reached by exactly one choice chain.</>,
      duration: 5,
      fig: 'CorrectnessByCounting',
      Visual: S.CorrectnessByCounting,
    },
    {
      title: 'Swap each position with any position at all, not just the unplaced ones: that is far more choice chains than orderings, and the extra chains cannot divide evenly across them.',
      body: <>More choice chains than orderings, and they never divide evenly.</>,
      duration: 4.5,
      fig: 'NaiveShuffleCounted',
      takeaway: 'More equally likely choices than outcomes always means some outcomes are favored.',
      Visual: S.NaiveShuffleCounted,
    },
    {
      title: 'Sorting with a comparator that returns a random value is not a consistent ordering, so the result leans on the sorting algorithm’s own internals. A real browser-choice ballot shipped exactly this comparator.',
      body: <>A random comparator is not an ordering; the sort’s own internals leak through.</>,
      duration: 4.5,
      fig: 'RandomComparatorSort',
      Visual: S.RandomComparatorSort,
    },
    {
      title: 'A pseudo-random generator has a fixed number of internal states. How many orderings of a full deck can it ever reach?',
      body: <>All of them eventually, at most as many as it has states, it depends on the shuffle, or half on average.</>,
      duration: 2.5,
      fig: 'PredictGeneratorReach',
      predict: {
        options: [
          { label: 'All of them, given enough time' },
          { label: 'At most as many as the generator has states', correct: true },
          { label: 'It depends only on the shuffle algorithm' },
          { label: 'Half of them, on average' },
        ],
        explain: (
          <>
            A deterministic generator can never produce more distinct outputs than it has internal states to be
            in — no shuffle algorithm on top of it can get past that ceiling.
          </>
        ),
      },
      Visual: S.PredictGeneratorReach,
    },
    {
      title: 'A generator cannot produce more outcomes than it has internal states, however the shuffle uses its numbers — and taking a draw by remainder is biased whenever the generator’s own range does not split evenly by the size wanted.',
      body: <>A state ceiling on the generator, and a remainder that is rarely even.</>,
      duration: 4.5,
      fig: 'SeedModuloLimits',
      Visual: S.SeedModuloLimits,
    },
    {
      title: 'A full deck’s orderings need far more bits than a common generator’s period can offer: past a certain length, almost every ordering of the deck is one that generator could never have produced, no matter how it looked in testing.',
      body: <>A deck’s orderings outrun a common generator’s own period.</>,
      duration: 4.5,
      fig: 'DeckTooLarge',
      takeaway: 'Looking random on a handful of tests is not evidence of reaching every ordering.',
      Visual: S.DeckTooLarge,
    },
    {
      title: 'Sattolo’s algorithm: the same loop, but the draw is strictly below the current position instead of at or below it. That one change forces a single cycle through every item, never the starting arrangement.',
      body: <>Draw strictly below the current position; the result is one full cycle.</>,
      duration: 4.5,
      fig: 'SattoloReveal',
      Visual: S.SattoloReveal,
    },
    {
      title: 'Write that same stricter draw where an ordinary shuffle was meant, and the bug hides in plain sight: the result is never the starting arrangement and never leaves anything in its own place, which a true shuffle would do once in a while.',
      body: <>The accidental version never leaves an item where it started.</>,
      duration: 4.5,
      fig: 'AccidentalBug',
      Visual: S.AccidentalBug,
    },
    {
      title: 'The data no longer fits in memory for swapping. What is the honest way to put it in a random order?',
      body: <>Key and sort it externally, there is no uniform way, always a small buffer, or skip shuffling.</>,
      duration: 2.5,
      fig: 'PredictTooLargeForMemory',
      predict: {
        options: [
          { label: 'Give each record an independent random key, then sort by it', correct: true },
          { label: 'There is no way to shuffle it uniformly' },
          { label: 'Always use a small fixed-size buffer' },
          { label: 'Skip shuffling and keep the original order' },
        ],
        explain: (
          <>
            An independent key per record, broken into order by an external sort, reaches the same uniform
            distribution as swapping in place — it just pays for a sort instead of random access.
          </>
        ),
      },
      Visual: S.PredictTooLargeForMemory,
    },
    {
      title: 'Three honest options once memory runs out: key every record and sort externally; split into buckets at random and shuffle each bucket in memory; or stream through a buffer, trading uniformity for a bounded window.',
      body: <>Key and sort, bucket and shuffle, or a bounded buffer that gives up full uniformity.</>,
      duration: 5,
      fig: 'ThreeMemoryOptions',
      Visual: S.ThreeMemoryOptions,
    },
    {
      title: 'A buffer of a few slots, holding the stream and swapping a random slot each step: an item can leave only a little earlier than it arrived, but it can leave much later than it arrived, with shrinking odds the longer it waits.',
      body: <>Early departure is tightly capped; late departure trails off slowly.</>,
      duration: 5,
      fig: 'BufferedShuffleMeasured',
      takeaway: 'A small buffer bounds how early an item can leave, but not how late, and that asymmetry is the bias.',
      Visual: S.BufferedShuffleMeasured,
    },
    {
      title: 'A permutation of everything, one item and one draw at a time, provably uniform by counting the choice chains themselves. Next: what happens when even a single pass is too much to hold.',
      body: <>One proof, over arrangements this time — next, a pass that cannot look back at all.</>,
      duration: 4.5,
      fig: 'Recap',
      Visual: S.Recap,
    },
  ],
};

export default reel;
