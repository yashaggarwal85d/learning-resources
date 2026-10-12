import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Aggregate and accounting methods: the vector's growth rule, the binary counter and the multipop stack, each bounded two ways.
// One unit of cost is one element write. Every number shown is computed or asserted in examples.py.
const reel: Reel = {
  steps: [
    {
      title: 'One append copied half a million keys',
      body: (
        <>
          The lower-bounds reel priced one run on its worst input. A data structure lives through a <em>sequence</em>. Of a million appends to the vector, one
          copies 524,288 keys, yet everyone says append is O(1). Both are true. From here on, one unit of cost is one element write.
        </>
      ),
      duration: 3.8,
      Visual: S.Opening,
    },
    {
      title: 'What do a million appends cost?',
      body: (
        <>
          When the vector is full, an append doubles its capacity and copies every key across. Count one write per key appended and one per key copied. What do
          all 1,000,000 appends cost together?
        </>
      ),
      duration: 1.5,
      predict: {
        options: [{ label: 'About 1 million' }, { label: 'About 2 million', correct: true }, { label: 'About 20 million' }, { label: 'About 524 billion' }],
        explain: (
          <>
            About 2 million: 2,048,575. That is 1,000,000 new keys plus 1,048,575 copies (1 + 2 + 4 + … + 524,288), under 3n. Pricing every append at the worst
            one’s 524,289 writes would say 524 billion: true as an upper bound, and useless.
          </>
        ),
      },
      Visual: S.MillionTotal,
    },
    {
      title: 'Sixteen appends, counted in writes',
      body: (
        <>
          The rule: an empty vector has capacity 0; the first append allocates 1; an append to a full vector allocates twice the capacity, copies every key, then
          writes the new one. Sixteen appends cost 1, 2, 3, 1, 5, 1, 1, 1, 9, then seven 1s. Total 31, under the dashed 3 per append (48).
        </>
      ),
      duration: 5.2,
      Visual: S.SmallTrace,
    },
    {
      title: 'Add up the whole sequence',
      body: (
        <>
          The <b>aggregate method</b>: bound the total cost of any n operations, then divide by n. Writes: n. Copies: the last resize copied fewer than n keys, and
          each earlier one half as many as the one after it, so 1 + 2 + 4 + … sums to fewer than 2n. Total under 3n: O(1) amortized per append.
        </>
      ),
      duration: 4.6,
      Visual: S.Aggregate,
    },
    {
      title: 'A third kind of promise',
      body: (
        <>
          The notation refresher separated average case (over inputs) from expected (over coins). <b>Amortized</b> is neither: nothing is random. It is a worst-case bound on the
          total of a whole sequence, divided by its length. Every n appends from empty cost less than 3n, and one of them can still cost n.
        </>
      ),
      duration: 3.6,
      Visual: S.Promise_,
    },
    {
      title: 'Coins on cells: the accounting method',
      body: (
        <>
          The <b>accounting method</b>: charge each append 3. One pays its write, one stays on the new key as a coin, one goes on a key in the old half, which has
          none. When the row fills, every key holds a coin: exactly what its copy will cost.
        </>
      ),
      duration: 5.2,
      Visual: S.Coins,
    },
    {
      title: 'The bank never goes negative',
      body: (
        <>
          Write cᵢ for the actual cost of operation i and ĉᵢ for its charge. The proof needs Σĉᵢ ≥ Σcᵢ after <em>every</em> operation, not just at the end: the
          bank, charges minus costs, never below zero. Then n appends cost at most 3n. A bank that can drift negative proves nothing.
        </>
      ),
      duration: 4.8,
      Visual: S.Bank,
    },
    {
      title: 'Grow by a fixed amount and it is quadratic',
      body: (
        <>
          Why multiply? Grow by one slot and append i copies i − 1 keys: n appends cost n(n + 1)/2, half a trillion writes at a million. A step of 1,000 slots
          divides that by about 1,000 and stays quadratic. Growing by a constant factor makes the copies a geometric series that sums to O(n).
        </>
      ),
      duration: 3.8,
      Visual: S.Additive,
    },
    {
      title: 'A growth factor of 1.5',
      body: (
        <>
          Doubling copies at most about 2 keys per append. A growth factor g of 1.5 leaves less empty space after each resize. At most how many copies per append
          does it cost?
        </>
      ),
      duration: 1.6,
      predict: {
        options: [{ label: 'About 1.5' }, { label: 'About 2' }, { label: 'About 3', correct: true }, { label: 'About 4' }],
        explain: (
          <>
            About 3. Just after a resize that copied c keys, all copies so far are c + c/g + c/g² + … ≈ c · g/(g − 1), and n is about c. For g = 2 that is 2, for
            g = 1.5 it is 3. Add the write: an accounting charge of 1 + g/(g − 1), 3 for doubling, 4 for g = 1.5. The space saved: right after a resize a third of
            the capacity is empty, not half.
          </>
        ),
      },
      Visual: S.Factor,
    },
    {
      title: 'Where n falls between resizes',
      body: (
        <>
          “About g/(g − 1)” is a peak, approached just after each resize, never reached; just before the next it falls to about 1/(g − 1). At a million
          appends doubling has copied 1.05 keys per append, not 2; g = 1.5, 2.10. The chapter lab measures this sawtooth: compare against the curve, not one
          number.
        </>
      ),
      duration: 4.6,
      Visual: S.Sawtooth,
    },
    {
      title: 'A binary counter, by the total',
      body: (
        <>
          A binary counter from 0. An increment turns trailing 1s into 0s and the next 0 into a 1, so one increment can flip every bit: the 16th flips 5. How many
          bits do 16 increments flip in total?
        </>
      ),
      duration: 1.6,
      predict: {
        options: [{ label: '80' }, { label: '64' }, { label: '31', correct: true }, { label: '16' }],
        explain: (
          <>
            31. Bit 0 flips on every increment, bit 1 on every second, bit i on every 2ⁱ-th: 16 + 8 + 4 + 2 + 1. For any n the total is under 2n, exactly 2n minus
            the number of 1 bits in n, so O(1) amortized against Θ(log n) for the worst single increment. The vector’s 16 appends also cost 31: at a power of two both
            are 2n − 1.
          </>
        ),
      },
      Visual: S.Counter,
    },
    {
      title: 'One coin on every 1 bit',
      body: (
        <>
          Accounting: charge 2 per increment. Every increment sets exactly one bit from 0 to 1: one unit pays for that, the other stays on the bit as a coin. A
          carry resets 1 bits, each with its own coin. The coins always equal the number of 1 bits, so the bank never goes negative.
        </>
      ),
      duration: 4.4,
      Visual: S.CounterCoins,
    },
    {
      title: 'Multipop: each key leaves once',
      body: (
        <>
          A stack with push, pop and multipop(k), which pops min(k, size) keys; one unit is one key in or out. One multipop can cost almost n, so n
          operations look like n². But each key is
          popped at most once after its push: the total is at most twice the pushes. Accounting: charge push 2, pop and multipop 0; each key carries the coin for
          its own pop.
        </>
      ),
      duration: 5,
      Visual: S.Multipop,
    },
    {
      title: 'Cheap operations pay for expensive ones',
      body: (
        <>
          The same move three times: an expensive operation can only follow cheap ones that set it up, so each cheap one pays a little extra in advance.
          Aggregate when one total covers every sequence; charge per operation when operations differ, like push and multipop. The charges are a choice: any
          that keep the bank at zero or above prove a bound.
        </>
      ),
      duration: 4,
      Visual: S.Setup,
    },
    {
      title: 'When the bound breaks',
      body: (
        <>
          The bound rests on two facts: expensive operations come only after cheap ones set them up, in one history from the start state. Add decrement: a
          counter at 01111 flips 5 bits every operation. Append again and again to one saved snapshot of a full 16-key vector: each append copies all 16 keys.
          Chapter 13 returns to this.
        </>
      ),
      duration: 3.8,
      Visual: S.Breaks,
    },
    {
      title: 'Back to the problem',
      body: (
        <>
          A million appends wrote 2,048,575 elements, under 3n. When append 524,289 arrived, the bank held 524,289 coins for its 524,288 copies. The spike is still one
          operation: a request waiting on it waits, which is deamortization’s problem. A vector that also shrinks has no key left to keep its shrink coins on.
        </>
      ),
      duration: 4.2,
      Visual: S.Back,
    },
    {
      title: 'Prove it · 1 of 3',
      body: (
        <>
          A teammate charges 2 per append, not 3: one for the write, one coin on the new key. With doubling from empty, at which append does the bank first go
          negative?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [{ label: 'Never: 2 is enough' }, { label: 'The 3rd' }, { label: 'The 5th', correct: true }, { label: 'The 9th' }],
        explain: (
          <>
            The 5th: costs 1 + 2 + 3 + 1 + 5 = 12 against 10 charged. The coin on each new key pays its own copy, but every resize also copies the old half, which
            holds no coins. At each power of two the bank is back to +1, so checking only at the end hides the failure; its lowest within a million appends is
            −524,286.
          </>
        ),
      },
      Visual: S.Q1,
    },
    {
      title: 'Prove it · 2 of 3',
      body: (
        <>
          With g = 1.5, the last resize before the millionth append comes at append 699,913 and copies 699,912 keys. Estimate the total copies after 1,000,000
          appends.
        </>
      ),
      duration: 1.6,
      predict: {
        options: [{ label: 'About 1.05 million' }, { label: 'About 2.1 million', correct: true }, { label: 'About 3 million' }, { label: 'About 20 million' }],
        explain: (
          <>
            About 2.1 million (2,099,719). The copies made up to that resize tile to about 3 × 699,912 ≈ 2.1 million, and none follow it before the millionth
            append. Per append that is 2.10: between the trough of 2 and the peak of 3, as the sawtooth showed.
          </>
        ),
      },
      Visual: S.Q2,
    },
    {
      title: 'Prove it · 3 of 3',
      body: (
        <>
          Someone adds multipush(k), which pushes k keys in one operation. Is every stack operation still O(1) amortized?
        </>
      ),
      duration: 1.6,
      predict: {
        options: [{ label: 'Yes: charge 2 per key pushed' }, { label: 'No: alternate multipush(k) and multipop(k)', correct: true }, { label: 'Yes, if the stack is a doubling vector' }, { label: 'No: multipop becomes Θ(n²)' }],
        explain: (
          <>
            No. 1,000 operations alternating multipush(1,000) and multipop(1,000) cost 1,000,000: 1,000 each. Charging 2 per key pushed still covers every pop, but
            then multipush is charged 2k, so its amortized cost is Θ(k). The bound was per key, and an operation that creates k keys at once breaks it per operation.
          </>
        ),
      },
      Visual: S.Q3,
    },
  ],
};

export default reel;
