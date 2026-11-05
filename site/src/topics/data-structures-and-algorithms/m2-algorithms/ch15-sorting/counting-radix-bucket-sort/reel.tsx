import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Counting, radix and bucket sort. A full topic: counting sort's stability proof, LSD and
// MSD radix sort, American flag sort (the in-place MSD variant, reproduced from McIlroy,
// Bostic and McIlroy 1993's own description, since the paper's own PDF code listings are
// OCR-damaged), DuckDB's own multi-column byte encoding (its 2021 post and 2023 paper), the
// IEEE 754 float bit-flip transform, the Theta(n w / log n) crossover, and bucket sort.
// Every count is exact and asserted in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'Heapsort, merge sort and quicksort all pay for every comparison between two whole keys. A database sorting ten million rows by country descending, then birth year ascending, calls a comparator that loops over the columns on roughly two hundred million of those comparisons. DuckDB answers by encoding each row into one string of bytes whose plain byte order is already the right order, and then never comparing at all.',
      body: <>A comparator loop costs this much. DuckDB's answer: never call it.</>,
      duration: 4.5,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: 'Sorting a million 32-bit keys, a radix sort with 8-bit digits makes how many passes over the data?',
      body: <>How many passes does an 8-bit-digit radix sort make over a million 32-bit keys?</>,
      duration: 2.5,
      fig: 'PredictPasses',
      predict: {
        options: [
          { label: 'About 20, the same as a comparison sort' },
          { label: 'Exactly 4: 32 bits split into 8-bit digits', correct: true },
          { label: '32, one pass per bit' },
          { label: 'It depends on how sorted the input already is' },
        ],
        explain: (
          <>
            32 bits split into 8-bit digits is 32 / 8 = 4 passes, fixed, no matter what the
            keys look like — a comparison sort goes about twenty levels deep instead,
            ceil(lg 1,000,000) = 20.
          </>
        ),
      },
      Visual: S.PredictPasses,
    },
    {
      title: 'Counting sort: count how many keys have each value, turn the counts into starting positions by a running sum, then scatter each key into its slot by walking the input in order. Measured directly: 12 keys, 12 moves. The scatter walks the input in order, so three keys tied at value 5 come out in their original order — the stability the next step depends on.',
      body: <>Count each value, turn counts into start positions, scatter in input order.</>,
      duration: 4.5,
      fig: 'CountingSort',
      Visual: S.CountingSort,
    },
    {
      title: "LSD radix sort: counting-sort by the last digit, then the next, and so on. Each pass's own stability is exactly why the composed result ends up sorted. Measured directly: 3 passes on 3-digit keys, 24 total moves. At a million 32-bit keys with 8-bit digits: 4 passes, against roughly 20 comparison levels.",
      body: <>Counting-sort by one digit, then the next. Each pass's stability sorts the whole key.</>,
      duration: 4.5,
      fig: 'LSDRadix',
      Visual: S.LSDRadix,
    },
    {
      title: "MSD radix sort: partition by the first digit into buckets, then recurse on each bucket by the next digit, falling back to insertion sort once a bucket is small. It touches only distinguishing prefixes, but its memory access is irregular and it recurses into many small buckets.",
      body: <>Partition by the first digit, recurse on each bucket by the next.</>,
      duration: 4,
      fig: 'MSDRadix',
      Visual: S.MSDRadix,
    },
    {
      title: "American flag sort, named by McIlroy, Bostic and McIlroy in 1993, by analogy with the Dutch national flag problem scaled from three piles to as many as there are digit values: count the digit values, turn the counts into each bucket's own slot range, then permute in place by following cycle-leader swaps. Measured directly: 6 swaps on an 8-key deck.",
      body: <>In-place MSD radix sort: cycle-leader swaps instead of a second array.</>,
      duration: 5,
      fig: 'AmericanFlag',
      takeaway: 'American flag sort is in-place MSD radix sort, at the cost of the one property the two-array version kept: stability.',
      Visual: S.AmericanFlag,
    },
    {
      title: 'Instability, shown: two keys sharing a digit value, tagged h and i on entry, come out as i then h. Nothing in the in-place permutation preserves which displaced key arrived first.',
      body: <>Tagged h then i go in. They come out i then h. Order among equal keys is gone.</>,
      duration: 3.5,
      fig: 'Instability',
      Visual: S.Instability,
    },
    {
      title: "DuckDB's own three-row worked example, encoded by hand: a descending string's bits all inverted, a signed year's sign bit flipped and bytes swapped to big-endian, a shorter string padded with zero bytes that the descending inversion turns to all-ones. Comparing the three encoded byte strings reproduces the post's own row order with one comparison, no per-column loop.",
      body: <>Flip bits, swap bytes, pad short strings. One memcmp replaces the whole loop.</>,
      duration: 5,
      fig: 'ByteEncoding',
      Visual: S.ByteEncoding,
    },
    {
      title: "Binary strings that give the right order under byte comparison give the right order under a byte-by-byte radix sort too, DuckDB's own stated connection: the encoding bought a cheap comparator, and then a comparator-free sort for free. IEEE 754 floats get the identical treatment: always flip the sign bit, and if it was set, flip every other bit too.",
      body: <>The same encoding that cheapens comparison also enables radix sort.</>,
      duration: 4.5,
      fig: 'FloatFlip',
      takeaway: "An encoding built to cheapen one comparator can also be the thing that makes a comparator-free sort possible.",
      Visual: S.FloatFlip,
    },
    {
      title: 'Does Theta(n w / log n) ever lose to Theta(n log n)?',
      body: <>Is reading digits instead of comparing keys always a win?</>,
      duration: 2.5,
      fig: 'PredictCrossover',
      predict: {
        options: [
          { label: 'No, radix sort always wins for fixed-width keys' },
          { label: 'Yes, when keys are long or the digit-count array thrashes the cache', correct: true },
          { label: 'No, the two are always asymptotically equal' },
          { label: 'Yes, but only for floating-point keys' },
        ],
        explain: (
          <>
            The bound only favors radix sort while w stays small against log squared n; once
            keys are long (w much larger than log squared n) or the count array's own cache
            misses dominate, the comparison sort can win. It is a real escape from the
            comparison model, not a free lunch.
          </>
        ),
      },
      Visual: S.PredictCrossover,
    },
    {
      title: 'The crossover, measured: at 50,000 random 32-bit keys with 8-bit digits, LSD radix sort makes exactly 4 times n, 200,000, key moves in total; a comparison sort makes exactly 718,346 comparisons on the same keys. Radix sort is also not adaptive: an already-sorted array still costs all 4 passes and n moves per pass.',
      body: <>200,000 radix moves against 718,346 comparison-sort comparisons, same keys.</>,
      duration: 4.5,
      fig: 'CrossoverMeasured',
      Visual: S.CrossoverMeasured,
    },
    {
      title: "Bucket sort: n keys drawn uniformly from the unit interval into n buckets, each sorted by insertion sort. Measured directly at 100,000 keys: the largest bucket held 8 keys, and 36.7% of buckets were empty, against the predicted e to the minus one, 36.8%. On a clustered, non-uniform input, nearly every key lands in the same handful of buckets, and the cost collapses to the inner sort's own cost on a near-full-size array.",
      body: <>Uniform input: 36.7% of buckets empty, matching e to the minus one. Clustered input: one giant bucket.</>,
      duration: 5,
      fig: 'BucketSort',
      takeaway: "Bucket sort's O(n) promise assumes uniform input; a clustered input collapses it to its inner sort's own cost.",
      Visual: S.BucketSort,
    },
    {
      title: "Radix sort never compares a key as a whole: it reads one digit at a time, the door out of the comparison-sort floor this chapter has otherwise lived under. Every sort so far has also assumed the data fits in memory, and the data a database sorts often does not: when it is ten times the size of memory, the cost is how many times each byte travels to disk and back. External merge sort, next.",
      body: <>Reading digits escapes the comparison floor. But what if the data doesn't fit in memory?</>,
      duration: 4,
      fig: 'Handoff',
      Visual: S.Handoff,
    },
  ],
};

export default reel;
