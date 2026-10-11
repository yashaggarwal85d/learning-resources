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
          This chapter&rsquo;s running example is a <em>vector</em>: a growable array of 64-bit keys. Here it holds 1,000,000 of them, sorted, and a request wants the <em>predecessor</em> of x: the largest stored key that is at most x.
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
          A fixed set of operations like C&rsquo;s integer ones (arithmetic, comparisons, bit operations, shifts), each touching O(1) words, plus a
          load or store at a computed address, each cost <b>one unit</b>. That is the unit of this reel: one word operation.
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
          unit operation could do the whole input&rsquo;s work: 20 squarings make a million-bit number.
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
          Schoolbook multiplication costs Θ((b/w)²). Counted bit by bit, as topic 1&rsquo;s Deep dive did, that is Θ(b): the same count with w = 1.
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
          main memory: Intel&rsquo;s Pentium M figures, listed by Drepper in 2007, are about 3 against about 240, an <b>80×</b> gap. Memory
          arrives in 64-byte <em>cache lines</em>, 8 keys at a time, and binary search&rsquo;s 20 probes land far apart: on 17 different lines. On a
          cold cache that is up to 17 trips (hot queries share the first few). This is the <em>cache miss</em>.
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
          penalty at 15 to 20 cycles on Intel cores from Haswell to Tiger Lake (sometimes above 20 on Alder Lake) and 15 to 25 on AMD&rsquo;s Zen 5, about the length of the pipeline. The model charges 1
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
          A digit of about log₂ n bits (16 here, for a million keys) is an array index into at most about n buckets, so one pass is O(n). A stable
          counting sort places every key by its digit, lowest digit first, and because each pass is stable the order the earlier digits produced
          survives inside every bucket. A 64-bit key needs 64 / 16 = 4 passes, w / log₂ n in general: each key is placed 4 times, 4,000,000
          placements, against about 20,000,000 for n log₂ n comparisons. The units differ and each placement is a scattered write, but 4 passes stay 4
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
          A van Emde Boas tree splits a key into its high half, which picks a cluster, and its low half, the position inside it; our key is
          x = 3·2³² + 7, so its cluster is 3 and its position 7. Each level stores its minimum and maximum. The cluster&rsquo;s min says in O(1)
          whether the answer is inside the key&rsquo;s own cluster (recurse there) or before it (ask the summary for the previous cluster and take its
          max): one recursion either way. Every level halves the bits, so with U = 2ʷ the count is a recurrence, T(U) ≤ T(√U) + O(1), which topic 3
          solves: O(log w). For 64-bit keys that is 6 halvings, whether n is a thousand or a billion.
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
          parallelism. Careful: 22 has the same sketch as 21, so the subtraction says &ldquo;no predecessor&rdquo; though 21 is one; one more step (the Deep dive&rsquo;s
          desketchifying) repairs it. A node holds about w^(1/5) keys and is searched in O(1) this way, so the tree is a B-tree of height
          Θ(log n / log w): theory only (Fredman and Willard).
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
          of every bound: which model, and what does its unit hide? Counting a loop here is easy; a recursive algorithm hands you a recurrence
          instead. Next: how to read the answer off one.
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
