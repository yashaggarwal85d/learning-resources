import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Reading the cost of a recursive algorithm off its recurrence: recursion trees, the Master theorem, Akra–Bazzi, substitution.
// Every number shown is computed or asserted in examples.py. The driving function is f throughout (Leighton and Akra–Bazzi write g).
const reel: Reel = {
  steps: [
    {
      title: 'Three procedures, three recurrences',
      body: (
        <>
          The last reel’s machine counts word operations one at a time. A loop’s count is a sum; a recursive procedure’s count is a <b>recurrence</b>, an
          equation that defines T(n) through T at smaller sizes. Here are three on the vector of a million keys. Two of them recurse twice; one of those
          two is linear and the other is not. By the end you will read all three off their trees.
        </>
      ),
      duration: 3.2,
      Visual: S.Opening,
    },
    {
      title: 'Unroll it: the recursion tree',
      body: (
        <>
          Draw the recurrence as what it is: a tree of calls. Each node does f(size) work (the merge: as many word operations as keys, constants dropped),
          then calls itself twice on halves. Level i has aⁱ nodes of size n/bⁱ, so its total is aⁱ·f(n/bⁱ), and T(n) is the sum of the column. At n = 64
          (a power of two, so the halves are exact) every level totals 64, there are log₂ 64 + 1 = 7 levels, and the sum is 448.
        </>
      ),
      duration: 4.6,
      Visual: S.MergeTree,
    },
    {
      title: 'Predict: eight calls on each half',
      body: (
        <>
          Same tree shape, new recurrence: T(n) = 8T(n/2) + n². The root level costs 64² = 4,096. Every call makes 8 calls on half the keys, down to calls on
          1 key that cost 1 each. What does that bottom level total?
        </>
      ),
      duration: 1.6,
      predict: {
        options: [{ label: '4,096' }, { label: '64' }, { label: '262,144', correct: true }, { label: '32,768' }],
        explain: (
          <>
            8 calls per node, 6 levels down: 8⁶ = 262,144 leaves, each doing Θ(1) work. The column doubles every level (8 nodes, each doing a quarter of
            the work: 8 × ¼ = 2), so the bottom row is 64 times the root and the total, 520,192, is under 2 × 262,144. The leaf count a^(log_b n) = n^(log_b a) is
            64³ here: the <b>watershed</b> function. When the leaves win, T(n) = Θ(n^(log_b a)) = Θ(n³).
          </>
        ),
      },
      Visual: S.LeafPredict,
    },
    {
      title: 'Three shapes of the column',
      body: (
        <>
          The Master theorem is the three shapes a column can take. Compare one level with the next: a·f(n/b) against f(n). Smaller by a constant factor
          below 1: a shrinking geometric series, the root’s f(n) is the answer. Equal: every level is f(n), and there are log_b n + 1 of them, so
          Θ(f(n)·log n). Larger by a constant factor: the leaves’ n^(log_b a) wins. A geometric series is a constant times its largest term; that is the
          whole proof.
        </>
      ),
      duration: 3.6,
      Visual: S.ThreeShapes,
    },
    {
      title: 'The statement: f against the watershed',
      body: (
        <>
          For T(n) = a·T(n/b) + f(n), with constants a ≥ 1 and b &gt; 1, compare f(n) with the watershed n^(log_b a). <b>Case 1:</b> f(n) = O(n^(log_b a − ε))
          for some ε &gt; 0 (polynomially smaller), so T(n) = Θ(n^(log_b a)). <b>Case 2:</b> f(n) = Θ(n^(log_b a)·logᵏ n) for some k ≥ 0, so
          T(n) = Θ(n^(log_b a)·logᵏ⁺¹ n). <b>Case 3:</b> f(n) = Ω(n^(log_b a + ε)) <em>and</em> a·f(n/b) ≤ c·f(n) for some c &lt; 1 and all large n, so
          T(n) = Θ(f(n)). That regularity condition makes the column shrink geometrically; for f = n^d it holds automatically, with c = a/b^d, here 2/4 = ½.
          The CLRS 4th edition (2022) relaxes a ≥ 1 to a &gt; 0 and builds floors and ceilings into the statement.
        </>
      ),
      duration: 4,
      Visual: S.Watershed,
    },
    {
      title: 'The gaps between the cases',
      body: (
        <>
          Here f = n log n sits above the watershed n, but not by any n^ε, and it is not Θ(n) either, so the basic cases are silent. The column shrinks, but the
          ratio between neighbouring levels drifts towards 1 at the top, so no constant below 1 fits. (The extended case 2 with k = 1 gives Θ(n log² n), and
          the column’s sum, 64 × 21, shows it.) The same silence falls on n/log n from below, on a non-constant number of subproblems such as √n·T(√n) + n, and on
          full-history recurrences like the quicksort recurrence of the first reel. Akra–Bazzi, next, covers the gaps; recursion trees cover the rest.
        </>
      ),
      duration: 4,
      Visual: S.Gap,
    },
    {
      title: 'An unequal split: the lopsided tree',
      body: (
        <>
          Median of medians recurses on two different sizes, n/5 and 7n/10, so the Master theorem, which has one b, cannot take it. The tree still can: 1/5 + 7/10 =
          9/10, so each level’s sizes add up to 9/10 of the level above, and the work (f(n) = n) shrinks geometrically. The root dominates, T(n) = Θ(n). Where the
          fractions come from: the median of the group medians is larger than at least about 3/10 of the keys, so the call after partitioning gets at most about
          7n/10. Ch.16 teaches the algorithm.
        </>
      ),
      duration: 4.8,
      Visual: S.SelectionTree,
    },
    {
      title: 'Predict: groups of 3',
      body: <>Groups of 3 instead of 5 give T(n) = T(n/3) + T(2n/3) + n. Still linear?</>,
      duration: 1.6,
      predict: {
        options: [
          { label: 'Yes: both subproblems still shrink' },
          { label: 'No: every full level sums to n, so Θ(n log n)', correct: true },
          { label: 'No: the tree is lopsided, so Θ(n²)' },
          { label: 'Yes, but with a larger constant' },
        ],
        explain: (
          <>
            1/3 + 2/3 = 1, so every complete level’s sizes add back up to n and its work is n; the leaves lie between depth log<sub>3</sub> n and depth log<sub>3/2</sub> n, both
            Θ(log n). So T(n) = Θ(n log n): with groups of 3 this analysis can no longer show linear time. That is a statement about the recurrence, not a proven
            worst case of every groups-of-3 algorithm (Chen and Dumitrescu give groups-of-3 variants that stay linear; Ch.16). The sum of the fractions decides:
            below 1 the column shrinks, exactly 1 it ties.
          </>
        ),
      },
      Visual: S.ThirdsPredict,
    },
    {
      title: 'Akra–Bazzi: the exponent p',
      body: (
        <>
          Akra and Bazzi (1998; Leighton’s notes give the inductive proof and write g where this course writes f): for T(n) = f(n) + Σ aᵢ·T(bᵢn + hᵢ(n)) with a constant
          number of terms, aᵢ &gt; 0, 0 &lt; bᵢ &lt; 1, and f nonnegative and growing smoothly (f(u) stays within constant factors of f(n) for u between bᵢn and n),
          let p be the unique number with Σ aᵢ·bᵢᵖ = 1. Then T(n) = Θ(nᵖ·(1 + ∫₁ⁿ f(u)/u^(p+1) du)). The curve is decreasing, so p is unique; for selection it
          crosses 1 at p ≈ 0.84, and for f(u) = u the integral is Θ(n^(1−p)), so T(n) = Θ(n). The Master theorem is the one-term case, p = log_b a. The hᵢ(n) absorb
          floors, ceilings and the “+ 6” of the exact selection recurrence.
        </>
      ),
      duration: 4.6,
      Visual: S.ExponentP,
    },
    {
      title: 'Predict: the proof that proves nothing',
      body: (
        <>
          Merge sort, guess T(n) ≤ c·n. The induction step gives T(n) ≤ 2·c·(n/2) + n = c·n + n. What has this proved?
        </>
      ),
      duration: 1.6,
      predict: {
        options: [
          { label: 'T(n) = O(n)' },
          { label: 'Nothing: the step had to come back to c·n, and c·n + n is larger', correct: true },
          { label: 'T(n) = O(n log n)' },
          { label: 'T(n) ≤ (c + 1)·n, which is still O(n)' },
        ],
        explain: (
          <>
            The hypothesis is “≤ c·n for the <em>same</em> c”; the step must end at exactly c·n, and c·n + n never does, for any c. The constant may not grow
            with n: you cannot induct over big-O. The guess was simply wrong: for powers of two T(n) = n·log₂ n + n exactly, so T(n)/n = log₂ n + 1 climbs by 3
            every ×8. Substitution confirms or refutes a guess; the tree is where the guess comes from.
          </>
        ),
      },
      Visual: S.FalseProof,
    },
    {
      title: 'The right guess that fails, and the fix',
      body: (
        <>
          A second trap. The Master theorem (case 1) says C(n) = 2C(n/2) + 1 is Θ(n), and the counts say 2n − 1, so c·n is the right guess; the induction still fails
          by the “+ 1”. Subtract a lower-order term: with c·n − d the step comes back with room to spare when d ≥ 1. A stronger hypothesis is easier to prove. Base
          cases are checked separately, with constants large enough to cover them. The same move proves the selection bound: (9/10)·k·n + n ≤ k·n when k ≥ 10, which is
          the 10n of the tree (with floors the small n are base cases, checked directly).
        </>
      ),
      duration: 4.4,
      Visual: S.StrengthenGuess,
    },
    {
      title: 'Back to the problem',
      body: (
        <>
          Read the shape of the column, then confirm by substitution. The first recursion doubles but every level costs n: a tie, n log n. The third doubles but each
          level costs 9/10 of the last: the root wins, linear. The second never doubles and costs 1 per level: log n. The counts are exact word operations at a
          million keys, constants dropped; the next reel asks what <em>every</em> algorithm must pay.
        </>
      ),
      duration: 3.8,
      Visual: S.Closing,
    },
    {
      title: 'Prove it · 1 of 3',
      body: (
        <>
          T(n) = 7T(n/2) + n² (a 7-way split with n² of combining work; Ch.21 has the algorithm). Which end of the column wins?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [
          { label: 'Root: Θ(n²)' },
          { label: 'Tie: Θ(n² log n)' },
          { label: 'Leaves: Θ(n^(log₂ 7)) ≈ Θ(n^2.81)', correct: true },
          { label: 'Leaves: Θ(n³)' },
        ],
        explain: (
          <>
            The watershed is n^(log₂ 7) = n^2.81 and f = n² is polynomially smaller (ε ≈ 0.8): case 1. At n = 64 the column grows ×7/4 per level, from 4,096 to 117,649 = 7⁶
            leaves. Cutting a from 8 to 7 moved the exponent from 3 to 2.81; cutting f would have changed nothing.
          </>
        ),
      },
      Visual: S.Q1,
    },
    {
      title: 'Prove it · 2 of 3',
      body: (
        <>
          T(n) = 2T(n/2) + n/log n. A colleague applies case 2 and writes Θ(n log n). Right?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [
          { label: 'Yes: case 2' },
          { label: 'No: case 1, Θ(n)' },
          { label: 'No case applies: f sits below the watershed n by only a log factor; Akra–Bazzi (p = 1) gives Θ(n log log n)', correct: true },
          { label: 'No: case 3, Θ(n/log n)' },
        ],
        explain: (
          <>
            f = n/log n is not Θ(n·logᵏ n) for any k ≥ 0 (case 2 fails) and not O(n^(1−ε)) for any ε &gt; 0 (case 1 fails): the gap, from below. With p = 1 the integral
            of (u/log u)/u² is ln ln n − ln ln 2, started at 2 because f is undefined at 1, so T(n) = Θ(n log log n). The tree agrees: level i sums to n/(lg n − i), a
            harmonic series (64/6, 64/5, … 64/1 at n = 64), so T(n) = n·H = Θ(n lg lg n).
          </>
        ),
      },
      Visual: S.Q2,
    },
    {
      title: 'Prove it · 3 of 3',
      body: (
        <>
          T(n) = 4T(n/2) + n. The Master theorem says case 1, Θ(n²). Your induction with T(n) ≤ c·n² ends at c·n² + n. What now?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [
          { label: 'The theorem was wrong: it is Θ(n² log n)' },
          { label: 'Keep the guess, strengthen it to c₁·n² − c₂·n', correct: true },
          { label: 'Choose a larger c' },
          { label: 'Give up on substitution and cite Akra–Bazzi' },
        ],
        explain: (
          <>
            A larger c never helps: the “+ n” is outside the c. Try c₁·n² − c₂·n: 4·(c₁·n²/4 − c₂·n/2) + n = c₁·n² − 2c₂·n + n ≤ c₁·n² − c₂·n as soon as c₂ ≥ 1. The
            theorem was right: for powers of two T(n) = 2n² − n exactly (6, 28, 120, 8,128, 2,096,128), so the subtracted term is really there.
          </>
        ),
      },
      Visual: S.Q3,
    },
  ],
};

export default reel;
