import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The potential method: one number for the whole structure, a table that grows and shrinks, and why shrinking at one half thrashes.
// One unit of cost is one element write. Every number shown is computed or asserted in examples.py.
const reel: Reel = {
  steps: [
    {
      title: 'Halve when half empty',
      body: (
        <>
          The last reel’s vector only grew. This one gives memory back: a pop that leaves it less than half full halves its capacity, copying every key. Start full
          at 16 keys, push once, then repeat pop, pop, push, push. One unit is one element write, and a pop counts 1, like a deletion.
        </>
      ),
      duration: 3.8,
      Visual: S.Opening,
    },
    {
      title: 'What does one round cost?',
      body: (
        <>
          The rules again: a full vector doubles on a push; a pop that leaves it less than half full halves it. Both copy every key. From n = 17 in capacity 32,
          how many element writes does one round of pop, pop, push, push cost?
        </>
      ),
      duration: 1.5,
      predict: {
        options: [{ label: '4' }, { label: '19' }, { label: '35', correct: true }, { label: '64' }],
        explain: (
          <>
            35 = 1 + 16 + 1 + 17. The second pop leaves 15 keys in 32, under half, so it halves to 16 and copies 15. Now 15 of 16 slots are full: the first push fills it, and the
            second finds it full and doubles, copying 16. The round ends where it began, so every round costs the same.
          </>
        ),
      },
      Visual: S.Round,
    },
    {
      title: 'Every second operation copies the vector',
      body: (
        <>
          After the fill, every round repeats: 8 rounds cost 280 writes, 328 in all, each round copying nearly the whole vector twice. Write C for the size it was
          full at (16 here). Per operation the rounds cost (2C + 3)/4, which grows with C: no fixed charge can pay for it. An adversary only has to choose the
          sequence. Fill with about m/2 pushes first, and m operations cost Θ(m²).
        </>
      ),
      duration: 4.6,
      Visual: S.Thrash,
    },
    {
      title: 'One number for the whole structure',
      body: (
        <>
          Keep the savings as one number Φ of the whole state; Φ lives in the proof, the vector never stores it. An operation’s amortized cost is its actual cost plus the change in Φ: ĉᵢ = cᵢ + Φ(Dᵢ) − Φ(Dᵢ₋₁).
          For the counter, Φ = number of 1 bits. Increment 8 flips 4 bits, Φ falls from 3 to 1: amortized 2, like every increment.
        </>
      ),
      duration: 4.6,
      Visual: S.Potential,
    },
    {
      title: 'The middle terms cancel',
      body: (
        <>
          Sum the amortized costs and every Φ in the middle cancels: Σĉ = Σc + Φ(Dₘ) − Φ(D₀). Start at Φ = 0, never go negative, and the amortized total bounds the
          actual total after every operation. Tarjan (1985) calls this the physicist’s view, credits it to Sleator, and calls it entirely equivalent to the banker’s credits, the last reel’s coins.
        </>
      ),
      duration: 4.4,
      Visual: S.Telescope,
    },
    {
      title: 'The stack: Φ is the number of keys',
      body: (
        <>
          The stack’s coins sat on its keys, so Φ = the number of keys. A push costs 1 and raises Φ by 1: amortized 2. A multipop of k keys costs k and lowers Φ by
          k: amortized 0. Tarjan’s paper opens with a stack whose every operation pops some keys, then pushes one; the same Φ gives at most 2m.
        </>
      ),
      duration: 4.6,
      Visual: S.StackPhi,
    },
    {
      title: 'Which Φ pays for doubling?',
      body: (
        <>
          Which potential makes every append O(1) amortized? It must drop on append 9, which copies 8 keys, and rise only a little on the cheap appends.
        </>
      ),
      duration: 2.2,
      predict: {
        options: [{ label: 'Φ = n' }, { label: 'Φ = cap − n, the empty slots' }, { label: 'Φ = 2n − cap', correct: true }, { label: 'Φ = cap' }],
        explain: (
          <>
            Φ = 2n − cap: twice the keys past the midpoint, Blum’s piggy bank. Each cheap append raises it by 2. Just before a resize it equals n, exactly the keys
            to copy; just after, it is 2. So append 9 costs 9 − 6 = 3, and so does every append but the first. The others don’t drop when the copy comes.
          </>
        ),
      },
      Visual: S.WhichPhi,
    },
    {
      title: 'The gauge on the vector',
      body: (
        <>
          Φ = 2n − cap measures how far past half full the vector is: 2 just after a grow (the new key counts twice), n when full, exactly the keys the next grow copies. The
          actual costs spike; the amortized costs are flat at 3 (the first append, 2). It is the last reel’s bank without its spare coin.
        </>
      ),
      duration: 5.4,
      Visual: S.VectorGauge,
    },
    {
      title: 'Pops drive 2n − cap negative',
      body: (
        <>
          From here on the vector shrinks only when a pop leaves it under a quarter full (shrink-at-¼); a later step shows why ½ cannot be saved. Keep Φ = 2n − cap
          and pop: after two pops it is −2, and the amortized total, 48, is less than the actual 50. A potential that can go negative proves nothing. Below half the
          vector is saving for the shrink, so its potential must grow again there.
        </>
      ),
      duration: 4.4,
      Visual: S.Negative,
    },
    {
      title: 'A second piece for pops',
      body: (
        <>
          Write α = n/cap, the load factor. Below half, a popped key is gone, so its coin cannot stay on it: cap/2 − n counts coins on the empty slots. Charge for distance from half full in either direction: Φ = 2n − cap when α ≥ ½, cap/2 − n when α &lt; ½. Φ is never
          negative, 0 at half full, cap when full (the next grow’s copies), cap/4 at a quarter (the next shrink’s).
        </>
      ),
      duration: 4.4,
      Visual: S.TwoPiece,
    },
    {
      title: 'Price the shrinking pop',
      body: (
        <>
          Under shrink-at-¼, a pop takes the vector from 8 keys in capacity 32 to 7, under a quarter: it halves to 16 and copies 7, actual cost 8. With the
          two-piece Φ, what is its amortized cost?
        </>
      ),
      duration: 2.2,
      predict: {
        options: [{ label: '8' }, { label: '1', correct: true }, { label: '0' }, { label: '15' }],
        explain: (
          <>
            1. Before: α = ¼, Φ = 16 − 8 = 8. After: 7 keys in 16, α just under ½, Φ = 8 − 7 = 1. ĉ = 8 + 1 − 8 = 1. The pops from half full down to a quarter each
            paid 2 (1 for the pop, 1 into Φ), and the shrink spends what they saved.
          </>
        ),
      },
      Visual: S.ShrinkPop,
    },
    {
      title: 'Every case, at most 3',
      body: (
        <>
          Every case, checked: a push costs at most 3 amortized, a pop at most 2, including the ones that resize. So any m pushes and pops from empty cost at most
          3m: amortized O(1) for both, for every sequence. examples.py checks every reachable state up to capacity 4,096.
        </>
      ),
      duration: 4.2,
      Visual: S.Cases,
    },
    {
      title: 'Shrink-at-½ climbs the V',
      body: (
        <>
          A resize is paid for only if Φ falls by about what it copies. Under shrink-at-¼ the pops down to a quarter fill the gauge, and the shrink spends it.
          Under shrink-at-½ the shrink fires at half full, where Φ = 0, and lands at 15 of 16, nearly full: Φ jumps to 14, and that pop costs 30 amortized,
          growing with the vector.
        </>
      ),
      duration: 4.6,
      Visual: S.Climb,
    },
    {
      title: 'Resize hysteresis',
      body: (
        <>
          Resize hysteresis: the grow and shrink thresholds must leave a gap proportional to the capacity, so that after any resize Ω(cap) operations pass before
          the next one, enough to refill the gauge. Halving at ¼ lands the vector near half full; halving at ½ lands it one push from full. Any fixed shrink
          fraction below ½ works.
        </>
      ),
      duration: 4.4,
      Visual: S.Hysteresis,
    },
    {
      title: 'The tool behind three later structures',
      body: (
        <>
          The same move proves bounds you will meet later. Splay trees: Φ is the sum of log₂ of every subtree’s size (Sleator and Tarjan). Fibonacci heaps: trees in
          the root list plus twice the marked nodes. Union–find: Tarjan analysed it in 1975; Lambert et al. (2023) reach O(α(n)), the inverse Ackermann function, with a potential on node ranks summed over Ackermann levels, while Σ√size alone proves only O(log log n).
        </>
      ),
      duration: 4.2,
      Visual: S.Later,
    },
    {
      title: 'Back to the problem',
      body: (
        <>
          Under shrink-at-¼ the same 49 operations cost 80 writes, not 328: after the push that grows to 32, nothing resizes, and the bound now covers pops too: at most 3 per push and 2
          per pop for every sequence. The push that copied 16 keys is still one push of 17.
        </>
      ),
      duration: 4.8,
      Visual: S.Back,
    },
    {
      title: 'Prove it · 1 of 3',
      body: (
        <>
          A teammate reuses Φ = 2n − cap for a vector that grows by 1.5. Append 13 finds 12 keys in capacity 12, grows to 18 and copies 12: actual cost 13. What
          is its amortized cost under that Φ?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [{ label: '3' }, { label: '4' }, { label: '9', correct: true }, { label: '13' }],
        explain: (
          <>
            9. Before, Φ = 24 − 12 = 12; after, 26 − 18 = 8: the gauge drops only 4, because growing by 1.5 leaves the vector two-thirds full, not half. ĉ = 13 − 4 = 9,
            and it keeps growing with the vector (about c/2 + 3 for a copy of c). Use Φ = 3n − 2cap, zero at two-thirds: every append costs at most 4.
          </>
        ),
      },
      Visual: S.Q1,
    },
    {
      title: 'Prove it · 2 of 3',
      body: (
        <>
          Fill the vector to C = 1,048,576 keys, push once, then run 1,000 rounds of pop, pop, push, push under shrink-at-½. About how many element writes do the
          1,000 rounds cost?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [{ label: '4,000' }, { label: 'About 2.1 million' }, { label: 'About 2.1 billion', correct: true }, { label: 'About 1.1 trillion' }],
        explain: (
          <>
            About 2.1 billion: 1,000 × (2C + 3) = 2,097,155,000, of which 2,097,151,000 are copies. Shrink-at-¼: 4,000, one per operation. With C fixed the thrash
            costs Θ(C) per operation; Θ(m²) for m operations needs C to grow with m.
          </>
        ),
      },
      Visual: S.Q2,
    },
    {
      title: 'Prove it · 3 of 3',
      body: (
        <>
          Start full at 16 keys and strictly alternate push, pop. Rule A halves when a pop leaves the vector less than half full; rule B, when it leaves it at most
          half full. Which rules thrash?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [{ label: 'Both' }, { label: 'Neither' }, { label: 'Only B (at most half)', correct: true }, { label: 'Only A (less than half)' }],
        explain: (
          <>
            Only B. After the first push, n = 17 in 32; a pop leaves 16, exactly half: A doesn’t shrink and the next push fits, so alternation costs 1 per operation
            after the grow. B shrinks to 16, full, and the next push doubles again: 17 writes every operation. A still thrashes on pop, pop, push, push: the gap must
            be a fraction of the capacity, not one key.
          </>
        ),
      },
      Visual: S.Q3,
    },
  ],
};

export default reel;
