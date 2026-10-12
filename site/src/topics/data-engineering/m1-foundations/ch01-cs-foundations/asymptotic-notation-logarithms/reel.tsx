import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A refresher: how costs grow, and the logarithms the rest of the chapter counts with.
// Every number on screen is computed or asserted in examples.py.
const reel: Reel = {
  steps: [
    {
      title: 'Counting cost, in five minutes',
      body: (
        <>
          Five minutes on how costs grow, and the logarithms the rest of the chapter counts with: the last of the five refreshers. All familiar? Swipe on to
          the memory hierarchy.
        </>
      ),
      duration: 2,
      Visual: S.Opening,
    },
    {
      title: 'O ceiling, Ω floor, Θ both',
      body: (
        <>
          O(f) is a ceiling: cost ≤ c·f(n) for some constant c {'>'} 0, for every n from some n₀ on. Ω(f) is a floor: cost ≥ c·f(n). Θ is both. This job takes
          3n·log₂n + 8n steps, where log₂n is the number of halvings from n down to 1. Divided by n·log₂n, it stays between 3 and 4 from n₀ = 256 on: Θ(n log n). The constants and the 8n drop out.
        </>
      ),
      duration: 3.6,
      Visual: S.RatioBand,
    },
    {
      title: 'Is it also O(n²)?',
      body: (
        <>
          You've just shown this job is Θ(n log n). A reviewer writes "it's O(n²)". Is that also true?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: 'No: only n log n' },
          { label: 'Yes: a ceiling', correct: true },
          { label: 'Only below n₀' },
          { label: 'No: worst case' },
        ],
        explain: (
          <>
            Yes. log₂n ≤ n, so the cost is at most 11·n² for every n ≥ 1: n² is a ceiling, just a loose one, over a million times above the job at 100
            million rows. O alone never says "slow", and it isn't a case either: this job has one cost, and any cost, best or worst, can have an O, an Ω and
            a Θ. Knuth's 1976 letter complains about people rejecting a sorting method "because its running time is O(n²)". Say Θ when you mean the growth
            rate.
          </>
        ),
      },
      Visual: S.LooseCeiling,
    },
    {
      title: 'Double the data',
      body: (
        <>
          At a thousand rows everything is instant. At the shop's 100 million orders, assuming a billion steps a second: n takes 0.1 s, n log₂n 2.7 s, n² 116
          days, on a log scale: each tick is a thousand times longer. Double the data and n doubles, n log₂n a bit more (×2.08), n² quadruples (×4).
        </>
      ),
      duration: 3.4,
      Visual: S.Race,
    },
    {
      title: 'Bisect, at a billion',
      body: (
        <>
          A logarithm counts divisions: log<sub>b</sub> x is how many times you divide x by b to get down to 1. Bisect needed about 10 tests for 1,000 commits.
          How many halvings take a billion down to one?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [{ label: 'About 20' }, { label: 'About 30', correct: true }, { label: 'About 1,000' }, { label: 'About 10 million' }],
        explain: (
          <>
            About 30. 2³⁰ = 1,073,741,824 is the first power of two past a billion, so log₂ of a billion ≈ 29.9. Every 10 halvings divide by 1,024, about a thousand. A
            billion is a thousand cubed, so it takes 3 × 10. A million times more data than bisect's 1,000 commits costs only 20 more halvings. Binary search
            over a billion sorted keys needs at most 30 comparisons the same way.
          </>
        ),
      },
      Visual: S.Halvings,
    },
    {
      title: 'Any base, one formula',
      body: (
        <>
          Any base converts to any other: log<sub>b</sub> x = ln x / ln b. One length, three rulers. In your head: log₂ x ≈ 3.32 × log₁₀ x, so a billion (9
          zeros) is about 30 halvings. Fixed bases differ only by a constant factor, so O(log n) needs no base. Counts of levels or passes do, and so does a
          base that is itself a parameter, like a page's fan-out.
        </>
      ),
      duration: 3.2,
      Visual: S.Rulers,
    },
    {
      title: 'A large base flattens the tower',
      body: (
        <>
          The bigger the base, the fewer the divisions: a billion is 29.9 halvings, 3 divisions by 1,000, just over 2 by 16,384. log<sub>16,384</sub> of a million is
          1.42, under 1.5. Indexes and sorts divide by hundreds or thousands at a time, so their logarithms are tiny.
        </>
      ),
      duration: 3.2,
      Visual: S.Towers,
    },
    {
      title: 'How tall is the orders index?',
      body: (
        <>
          100 million orders, a PostgreSQL B-tree index on <code>order_id</code>. An 8 KB index page holds about 400 entries (an 8-byte key, a 6-byte row
          pointer, small headers: about 20 bytes each). On an inner page each entry points to a page below, so every level multiplies the reach by about
          400. How many levels from root to leaf?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [{ label: '3' }, { label: '4', correct: true }, { label: '8' }, { label: '27' }],
        explain: (
          <>
            4. Each level multiplies the reach by 400: three levels reach only 400³ = 64 million keys, and the fourth reaches 25.6 billion. log₄₀₀ of 100 million = 3.07,
            rounded up to 4. Any fan-out from 100 to 464 gives 4 levels, so the estimate is robust. A binary tree would need 27. The next topics show what each of
            those page reads costs.
          </>
        ),
      },
      Visual: S.IndexLevels,
    },
    {
      title: 'Sort passes are a logarithm too',
      body: (
        <>
          The nightly job sorts 1 TiB in 1 MiB blocks with 16 GiB of memory: 1,048,576 blocks, 16,384 in memory. Pass one writes 64 memory-sized runs. The merge
          can take up to 16,383 runs at once (one block per run, one for the output), so pass two merges all 64. In powers of two the log is 20/14 = 1 for the
          runs + 0.43, because 64 runs need only a sliver of that fan-in; but a pass can't be partial. 2 passes, each reading and writing the whole 1 TiB: 4 TiB
          of I/O. Two at a time: 7.
        </>
      ),
      duration: 3.6,
      Visual: S.SortPasses,
    },
    {
      title: 'Big-O is not a stopwatch',
      body: (
        <>
          Big-O drops constants and lower terms on purpose, to compare growth whatever the hardware. So it can't give you seconds. Two Θ(n) scans of the same 100
          million rows can differ by orders of magnitude, depending on where each step's data lives: in a cache, in RAM, on disk, across the network.
        </>
      ),
      duration: 2.8,
      Visual: S.SameSteps,
    },
    {
      title: 'In one breath',
      body: (
        <>
          Five things to keep. For the full treatment (cases, little-o, proofs) see the algorithms track in the Prerequisites panel. Big-O counts steps as if
          each cost the same.
        </>
      ),
      duration: 2,
      Visual: S.Recap,
    },
  ],
};

export default reel;
