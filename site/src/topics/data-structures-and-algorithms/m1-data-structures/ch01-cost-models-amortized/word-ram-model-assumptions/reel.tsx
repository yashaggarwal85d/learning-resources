import type { Reel, StepCtx } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: the machine behind every step count, what it hides, and how integer keys escape the comparison model.
// The running example is the chapter's vector: a million sorted 64-bit keys. Every number shown is computed or asserted in examples.py.
const Q1 = (c: StepCtx) => <S.Quiz1 {...c} />;
const Q2 = (c: StepCtx) => <S.Quiz2 {...c} />;
const Q3 = (c: StepCtx) => <S.Quiz3 {...c} />;

const reel: Reel = {
  steps: [
    {
      title: 'A million keys, twenty probes',
      body: (
        <>
          The vector holds 1,000,000 sorted 64-bit keys, and a request wants the <em>predecessor</em> of x: the largest stored key that is at most x.
          Binary search halves the range, and 20 comparisons finish it. Two questions for this reel: is 20 a floor, and what does one of those steps
          cost on a real core?
        </>
      ),
      duration: 6,
      Visual: S.TwentyProbes,
    },
    {
      title: 'The machine behind the count',
      body: (
        <>
          The <em>word-RAM</em> is the machine step counts assume: memory is an array of cells of <b>w</b> bits, addressed by integers (here w = 64).
          The operations C gives you on an integer, plus a load or store at a computed address, each cost <b>one unit</b>. That is the unit of this
          reel: one word operation.
        </>
      ),
      duration: 5,
      Visual: S.WordRam,
    },
    {
      title: 'Predict: can anything beat twenty?',
      body: (
        <>
          A million sorted 64-bit keys. Binary search needs 20 comparisons for a predecessor. On the word-RAM, is there a structure whose worst-case
          query does not grow with n at all?
        </>
      ),
      duration: 1.5,
      predict: {
        options: [
          { label: 'No: log₂ n is a law for search' },
          { label: 'Yes: about 6 halvings of the key, 64 → 32 → … → 1', correct: true },
          { label: 'Yes, in 1 step: hash the key' },
          { label: 'Only if the keys are small' },
        ],
        explain: (
          <>
            Yes. A van Emde Boas tree halves the key&rsquo;s <em>bits</em>, not the range of keys: six halvings for 64-bit keys, whatever n is. Each
            halving is a few word operations, not one, so the win is in how the count grows. The 20 was never a law of the problem, only of a model where
            keys can only be compared.
          </>
        ),
      },
      Visual: S.BeatTwenty,
    },
    {
      title: 'A word must hold a pointer: w ≥ log₂ n',
      body: (
        <>
          The machine must be able to address its own memory, so a word must hold an index: <b>w ≥ log₂ n</b>. For a million keys, 20 bits address
          1,048,576 cells, and a 64-bit word has 44 bits to spare. An 8-bit word would reach only 256 cells. Words cannot be unbounded either, or one
          unit operation could do the whole input&rsquo;s work.
        </>
      ),
      duration: 4.5,
      Visual: S.PointerFits,
    },
    {
      title: 'Big numbers pay by the word',
      body: (
        <>
          Unit cost is per word. A b-bit number is b/w words, so adding two costs Θ(b/w) word operations: 4,096 bits is 64 words, 64 additions.
          Schoolbook multiplication costs Θ((b/w)²). Topic 1&rsquo;s Θ(b) is this count with w = 1.
        </>
      ),
      duration: 5,
      Visual: S.BigNumber,
    },
    {
      title: 'One load, two prices',
      body: (
        <>
          The model charges one unit for a load. A real core pays a few cycles for a hit in the first-level cache and a couple of hundred for a trip to
          main memory: Intel&rsquo;s Pentium M figures, listed by Drepper in 2007, are about 3 against about 240, an <b>80×</b> gap. Binary search
          makes 20 probes that land far apart: with 64-byte cache lines, 17 distinct lines. This is the <em>cache miss</em>.
        </>
      ),
      duration: 6,
      Visual: S.OneLoad,
    },
    {
      title: 'A wrong guess flushes the pipeline',
      body: (
        <>
          A pipelined core guesses which way a branch goes and runs ahead. A wrong guess throws that work away: Agner Fog&rsquo;s manual puts the
          penalty at 15 to 20 cycles on recent Intel cores and 15 to 25 on AMD&rsquo;s Zen 5, about the length of the pipeline. The model charges 1
          for the comparison. This is the <em>branch misprediction</em>.
        </>
      ),
      duration: 5,
      Visual: S.Flush,
    },
    {
      title: 'The comparison model: one bit per question',
      body: (
        <>
          In the <em>comparison model</em> keys are opaque: the only operation on them is a comparison, and one comparison is one yes/no answer.
          Telling 9 places apart takes 4 answers; telling 1,000,001 places apart takes 20. That is why binary search stops at 20 here, and topic 4
          proves no comparison algorithm can do better.
        </>
      ),
      duration: 5,
      Visual: S.OneBit,
    },
    {
      title: 'On the word-RAM, a key is a number',
      body: (
        <>
          A key can be an address, cut into bit fields, or subtracted from another key: exactly what the comparison model forbids. Three escapes
          follow, one each: digits as addresses (radix sort), halving the bits (van Emde Boas), and many keys in one word (fusion trees).
        </>
      ),
      duration: 4.5,
      Visual: S.KeyIsNumber,
    },
    {
      title: 'Radix sort: digits as addresses',
      body: (
        <>
          A digit of 16 bits is an array index. A stable counting sort places a million keys by one digit in one pass, so a 64-bit key needs 4 passes:
          4,000,000 moves, against about 20,000,000 for n log₂ n comparisons. The units differ and each move is a scattered write, but 4 passes stay 4
          as n grows. Linear when w = O(log n).
        </>
      ),
      duration: 7,
      Visual: S.RadixPasses,
    },
    {
      title: 'van Emde Boas: halve the bits, not the keys',
      body: (
        <>
          A van Emde Boas tree splits a key into its high half, which picks a cluster, and its low half, the position inside it. It stores each
          level&rsquo;s minimum and maximum, so a query recurses once, and every level halves the bits: T(u) ≤ T(√u) + O(1), which is O(log w).
          For 64-bit keys that is 6 halvings, whether n is a thousand or a billion.
        </>
      ),
      duration: 7,
      Visual: S.HalveBits,
    },
    {
      title: 'The price: Θ(U) space, unless you hash',
      body: (
        <>
          The plain structure needs Θ(U) words, impossible for U = 2⁶⁴. Storing only the non-empty clusters in hash tables brings the space to Θ(n),
          and the O(log w) bound then holds with high probability. Time is bought with space or with randomness: topic 1&rsquo;s trade-off again.
        </>
      ),
      duration: 4.5,
      Visual: S.SpacePrice,
    },
    {
      title: 'Fusion trees: four comparisons in one subtraction',
      body: (
        <>
          At most k − 1 bit positions tell k keys apart, so each key shrinks to a tiny <em>sketch</em> and a node&rsquo;s sketches fit in one word. Put
          a 1 before each, subtract the query&rsquo;s sketch from every block at once, and the leading bits show where it sits: word-level
          parallelism. Careful: the sketch rank is right for 25 but not for 22, which one more step repairs. Height Θ(log n / log w), theory only.
        </>
      ),
      duration: 7,
      Visual: S.Sketch,
    },
    {
      title: 'Back to the problem',
      body: (
        <>
          Binary search&rsquo;s 20 is a law of the comparison model only. The word-RAM allows 6 halvings, at the price of space or hashing, and on
          paper O(log n / log w). And each unit step hides a load that hits or misses and a compare the pipeline predicted or paid for. From here, say
          of every bound: which model, and what does its unit hide?
        </>
      ),
      duration: 4,
      Visual: S.BackToProblem,
    },
    {
      title: 'Prove it · 1 of 3',
      body: <>The vector grows to a billion sorted 64-bit keys. How many halvings does a van Emde Boas predecessor query take?</>,
      duration: 1.2,
      predict: {
        options: [{ label: 'About 30 (log₂ of a billion)' }, { label: '6', correct: true }, { label: 'About 9' }, { label: 'It depends on n' }],
        explain: (
          <>
            Six. The bound is log₂ w, and w is still 64. The 30 is what a comparison search needs: log₂ of a billion is about 29.9.
          </>
        ),
      },
      Visual: Q1,
    },
    {
      title: 'Prove it · 2 of 3',
      body: <>A design doc says: &ldquo;finding the predecessor in our sorted index is O(log n) and cannot be beaten.&rdquo; In which model is that true, and does it hold on the word-RAM?</>,
      duration: 1.2,
      predict: {
        options: [
          { label: 'True in the comparison model; beaten on the word-RAM', correct: true },
          { label: 'True in both models' },
          { label: 'False in both: hashing beats it' },
          { label: 'True on the word-RAM only' },
        ],
        explain: (
          <>
            With comparisons only, log₂ n questions are needed, and topic 4 proves it. On the word-RAM the key&rsquo;s bits can be halved or packed,
            and the bound falls. Hashing finds equal keys, not predecessors.
          </>
        ),
      },
      Visual: Q2,
    },
    {
      title: 'Prove it · 3 of 3',
      body: <>Add two 4,096-bit integers on a word-RAM with w = 64, one word at a time with a carry. How many word additions?</>,
      duration: 1.2,
      predict: {
        options: [{ label: '1: addition is unit cost' }, { label: '64', correct: true }, { label: '4,096' }, { label: '12' }],
        explain: (
          <>
            4,096 / 64 = 64 words, one addition with carry each. Unit cost is per word, not per number. Schoolbook multiplication would be 64 × 64 =
            4,096 word multiplies.
          </>
        ),
      },
      Visual: Q3,
    },
  ],
};

export default reel;
