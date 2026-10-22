import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: the monotonic structures amortized a bound by never growing past what an
// invariant allowed. A ring buffer takes that further: it never grows at all, by design, and that
// refusal is itself the feature. Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'Opening',
      body: (
        <>
          The monotonic structures amortized a bound by never growing past what an invariant allowed. A ring buffer takes that further: it
          never grows at all, by design &mdash; and that refusal is itself the feature.
        </>
      ),
      duration: 3.4,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: 'The mechanism',
      body: <>A fixed-size array with head and tail indices that advance by wrapping around, instead of a dynamic array's reallocation.</>,
      duration: 3,
      fig: 'Mechanism',
      Visual: S.Mechanism,
    },
    {
      title: 'The real cost of wrap-around',
      body: (
        <>
          Modulo by a capacity that isn't a power of two is a division. A power-of-two capacity turns the same wrap into a bitwise AND against
          capacity minus one &mdash; measurably cheaper, not just notationally different.
        </>
      ),
      duration: 4,
      fig: 'RealCost',
      takeaway: 'A power-of-two capacity turns wrap-around from a division into a bitwise AND — measurably, not just notationally.',
      Visual: S.RealCost,
    },
    {
      title: 'Predict: the next index',
      body: <>Capacity sixteen, current tail index eleven, five pushes land. What's the new tail index, and how is it actually computed?</>,
      duration: 1.8,
      fig: 'IndexPredict',
      predict: {
        options: [
          { label: 'Sixteen, via (eleven plus five) modulo sixteen, a division' },
          { label: 'Zero, via (eleven plus five) AND fifteen, a mask', correct: true },
          { label: 'Eleven, unchanged, since the buffer never wraps' },
          { label: 'Five, since the tail resets to the push count' },
        ],
        explain: (
          <>
            Eleven plus five is sixteen. With capacity sixteen as a power of two, the real implementation computes sixteen AND fifteen &mdash;
            zero &mdash; a single bitwise op, not a division.
          </>
        ),
      },
      Visual: S.IndexPredictViz,
    },
    {
      title: 'The ambiguity',
      body: (
        <>
          Head equals tail when both have wrapped exactly as far as each other &mdash; and that can mean empty, or it can mean completely
          full. Masked indices alone can't tell the two apart.
        </>
      ),
      duration: 3.6,
      fig: 'Ambiguity',
      Visual: S.Ambiguity,
    },
    {
      title: 'The fix this topic builds',
      body: (
        <>
          Keep the indices unmasked and always increasing; mask only at the moment of array access. Length is tail minus head; empty is tail
          equals head; full is length past the mask. Two other real fixes: sacrifice one slot, or keep an explicit count.
        </>
      ),
      duration: 4.4,
      fig: 'TheFix',
      takeaway: 'Unmasked, always-increasing indices resolve the ambiguity; masking only happens at the moment of array access.',
      Visual: S.TheFix,
    },
    {
      title: "What happens when it's full",
      body: (
        <>
          Two real policies, orthogonal to the mechanism above: overwrite the oldest entry and keep going, or block the write until a slot
          opens up.
        </>
      ),
      duration: 3,
      fig: 'FullPolicy',
      Visual: S.FullPolicy,
    },
    {
      title: 'Predict: overwrite or block?',
      body: <>A metrics ring at capacity, overwrite policy, one more push arrives. What happens, and would a block-policy ring do the same?</>,
      duration: 1.8,
      fig: 'PolicyPredict',
      takeaway: 'Overwrite and block are a policy choice about a full write, independent of which full/empty mechanism sits underneath it.',
      predict: {
        options: [
          { label: 'The oldest entry is dropped; a block-policy ring would instead make the push wait', correct: true },
          { label: 'The push is silently ignored either way' },
          { label: 'The ring grows by one slot to fit it' },
          { label: 'Both policies drop the oldest entry identically' },
        ],
        explain: (
          <>
            Under overwrite, the newest value replaces the oldest, exactly as a bounded deque's own documentation describes. Under block, the
            same push would instead wait for a slot to open &mdash; a different outcome from the same full state.
          </>
        ),
      },
      Visual: S.PolicyPredictViz,
    },
    {
      title: 'Boundedness as backpressure',
      body: (
        <>
          A full bounded channel's send blocks until the receiver catches up &mdash; forcing a slow producer to synchronize with its consumer,
          instead of racing ahead the way topic one's growing array would.
        </>
      ),
      duration: 4,
      fig: 'Backpressure',
      takeaway: 'A bounded structure forces a producer to slow down; an unbounded one defers that choice by growing instead.',
      Visual: S.Backpressure,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A real C microbenchmark: masking against modulo, at several capacities, with the capacity passed in at run time so the compiler can't
          quietly do the masking for you. Modulo costs measurably more, every time.
        </>
      ),
      duration: 4,
      fig: 'ProveIt',
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
