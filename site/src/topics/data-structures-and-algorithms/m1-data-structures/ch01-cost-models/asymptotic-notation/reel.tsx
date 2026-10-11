import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A refresher: the vocabulary every cost claim in this course is written in.
// Every number shown is computed or asserted in examples.py.
const reel: Reel = {
  steps: [
    {
      title: 'Every cost claim has three parts',
      body: (
        <>
          The course starts here: before any structure or algorithm, the language its costs are stated in. A claim like “quicksort is O(n log n)” hides
          three choices: which <em>bound</em>, which <em>case</em>, which <em>resource</em>. Most arguments about complexity are arguments about which choice
          was meant. If this is all familiar, swipe on.
        </>
      ),
      duration: 3,
      Visual: S.Opening,
    },
    {
      title: 'O, Ω, Θ are inequalities with witnesses',
      body: (
        <>
          <b>f is O(g)</b> if some constant <i>c</i> and threshold <i>n₀</i> exist with f(n) ≤ c·g(n) for <em>every</em> n ≥ n₀; Ω flips the inequality; Θ is
          both. Here 3n² + 10n sits between 3n² and 4n² from n₀ = 10 on (at n = 9 it is 333, above 4n² = 324). The constants may not depend on n.
        </>
      ),
      duration: 4.2,
      Visual: S.Sandwich,
    },
    {
      title: 'A constant factor is fine; an exponent is not',
      body: (
        <>
          2<sup>n+1</sup> is O(2<sup>n</sup>): double it and you are done. Is 2<sup>2n</sup> also O(2<sup>n</sup>)?
        </>
      ),
      duration: 1.5,
      predict: {
        options: [{ label: 'Yes, 2 is a constant' }, { label: 'No', correct: true }, { label: 'Only for large n' }, { label: 'Yes, it is Θ' }],
        explain: (
          <>
            No. 2<sup>2n</sup> = 4<sup>n</sup>, and 4<sup>n</sup> / 2<sup>n</sup> = 2<sup>n</sup> grows without bound, so no constant c works. The exponent
            multiplies the base; it is not a constant factor. Logarithm bases are different: log<sub>2</sub> n and log<sub>10</sub> n differ by a constant.
          </>
        ),
      },
      Visual: S.PowerRatios,
    },
    {
      title: 'o and ω are strict: read the ratio',
      body: (
        <>
          <b>o</b> means “grows strictly slower”: for <em>every</em> c &gt; 0, f &lt; c·g from some n₀ on (n₀ may depend on c). When the limit of f/g exists, 0 gives o, a positive
          constant gives Θ, infinity gives ω. Careful: the limit may not exist (n against n·(2 + sin n) is Θ with no limit), so the test is sufficient,
          not necessary.
        </>
      ),
      duration: 4.2,
      Visual: S.Ratios,
    },
    {
      title: 'Bound and case are different axes',
      body: (
        <>
          “O is worst case” is the most common slip. A <em>case</em> picks a function: insertion sort’s count of key-against-element comparisons is n − 1 sorted, about n²/4
          on average, n(n − 1)/2 reversed. A <em>bound</em> then relates that function to another. Best case Θ(n) and worst case Θ(n²) are both exact; “the
          worst case is O(n³)” is true but loose. Counts here are for 8 items, checked over all 40,320 orders.
        </>
      ),
      duration: 4.6,
      Visual: S.CaseGrid,
    },
    {
      title: 'Average over inputs, or expected over coins',
      body: (
        <>
          Quicksort that always pivots on the first key does 499,500 comparisons on 1,000 sorted keys. Pick the pivot at random instead: how many
          comparisons do you expect on that same sorted input?
        </>
      ),
      duration: 1.5,
      predict: {
        options: [{ label: 'About 499,500' }, { label: 'About 250,000' }, { label: 'About 10,986', correct: true }, { label: 'About 1,000' }],
        explain: (
          <>
            About 10,986, which is 2(n+1)Hₙ − 4n for distinct keys (Hₙ = 1 + 1/2 + … + 1/n ≈ ln n), the same for every input order. The first-pivot
            version averages that same count over random orders: same number, different promise. <b>Average case</b> assumes a distribution over inputs and
            breaks when real inputs aren’t like it (sorted data); <b>expected time</b> uses the algorithm’s own coins, so it holds for every fixed input.
          </>
        ),
      },
      Visual: S.PivotChoice,
    },
    {
      title: 'Expected is not a guarantee; w.h.p. is a tail',
      body: (
        <>
          2,000 runs of randomized quicksort on 1,000 keys: mean 10,991, slowest 15,583. An expectation allows rare slow runs. A{' '}
          <b>with-high-probability</b> bound limits them: for every constant c there is a constant a such that a run takes at most a·n·log n steps with
          probability at least 1 − 1/n<sup>c</sup>; a bigger c costs only a bigger a. Services are judged on tails, so ask which promise you are given.
        </>
      ),
      duration: 4.4,
      Visual: S.Spread,
    },
    {
      title: 'Time and space trade, so name both',
      body: (
        <>
          Does a list of 1,000 distinct numbers contain a duplicate? Comparing every pair costs 499,500 steps and no extra storage. Heapsort in place, then
          one scan: 17,830. A hash set: 1,000 lookups, each O(1) only in expectation, but 1,000 values stored. Say what you count: here, steps and extra values, not bytes.
        </>
      ),
      duration: 4.6,
      Visual: S.TimeSpace,
    },
    {
      title: 'The constant hides inside the O',
      body: (
        <>
          Asymptotics describe growth, not speed at a given size. 100n beats n² only above n = 100; below that the “worse” algorithm wins. The crossover is
          where constants, cache behaviour and the real input size decide, so measure when n is small or the constants differ a lot.
        </>
      ),
      duration: 4,
      Visual: S.Crossover,
    },
    {
      title: 'n is the size of the input, in bits',
      body: (
        <>
          Trial division is O(√v) in the <em>value</em> v: 65,534 steps for a 32-bit prime. Double the bits to 64 and it is over 4 billion steps. In the input’s <em>length</em> b that is 2<sup>b/2</sup>, exponential. A cost polynomial in the value but exponential in the bit length is called pseudo-polynomial.
        </>
      ),
      duration: 3.8,
      Visual: S.BitsNotValue,
    },
    {
      title: 'The ladder, at a million items',
      body: (
        <>
          At a million items and an assumed billion steps a second: log n is about 19.9 steps, n log n takes 0.02 seconds, n² takes 1000 seconds, about 16.7
          minutes. Exponential 2<sup>n</sup> is already hopeless at n = 64: 585 years. Every count here assumes each step costs the same; hold that thought.
        </>
      ),
      duration: 3.6,
      Visual: S.Ladder,
    },
    {
      title: 'In one breath',
      body: (
        <>
          Seven things to keep. The opening claim, decoded: “quicksort is O(n log n)” is an upper bound on <em>expected</em> time with random pivots; with a
          fixed pivot the worst case is Θ(n²). If a point felt rusty, the Deep dive has it in full; otherwise, on to the word-RAM model.
        </>
      ),
      duration: 2.6,
      Visual: S.Recap,
    },
  ],
};

export default reel;
