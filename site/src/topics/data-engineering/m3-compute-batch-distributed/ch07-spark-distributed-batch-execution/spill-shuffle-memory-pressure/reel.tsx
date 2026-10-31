import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Measured against real PySpark 4.0.1 (local[2]) sessions (examples.py): a skewed sort (one
// partition holding the overwhelming majority of rows, the other three thinly spread) spills
// for real, with the memory figure larger than the disk figure for the identical event --
// UnsafeExternalSorter's own spill path counts page-rounding and pointer-array overhead as
// "memory spilled" that is never actually written to disk. Of the four tasks doing the sort,
// exactly one carries the entire spill; the other three report zero, at a 512MB driver heap
// and again at 2GB. Quadrupling the memory leaves the skewed task's own spill essentially
// where it started (observed anywhere from no visible change to a modest reduction across
// runs) -- nowhere near proportional to the 4x increase -- while the three already-fine tasks
// stay at zero regardless.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Four workers are about to sort pieces of the same kind of data. One of them is
          holding onto far more of it than the rest. Which one runs out of room first?
        </>
      ),
      duration: 4.5,
      fig: 'four workers, uneven pieces of the same kind of data. Who runs out of room first?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: the baseline -- a genuine spill, two numbers',
      body: (
        <>
          Measured: a real spill happens, and it's reported as two separate numbers for the
          same event — one for memory, one for disk — and they aren't the same number.
        </>
      ),
      duration: 4.8,
      fig: 'a real spill, reported as two different numbers for the same event.',
      Visual: S.RevealBaselineTwoNumbers,
    },
    {
      title: 'Predict: of four workers, how many actually spill?',
      body: (
        <>
          All four workers are sorting pieces of the same kind of data, but one piece is far
          bigger than the rest. Out of the four, how many actually end up spilling to disk?
        </>
      ),
      duration: 2.8,
      fig: 'four workers, one bigger piece. How many of them actually spill?',
      predict: {
        options: [
          { label: 'All four — the same operation, the same pressure, applies to each one' },
          { label: 'Just the one holding the oversized piece', correct: true },
        ],
        explain: (
          <>
            Spill is a response to one worker's own data outgrowing its own share of memory,
            not a property of the operation itself. The other three never come close.
          </>
        ),
      },
      Visual: S.PredictHowManySpill,
    },
    {
      title: 'Reveal: exactly one -- the other three never touch disk at all',
      body: (
        <>
          Measured: exactly one of the four workers carries the entire spill. The other three
          report nothing at all — not a reduced amount, genuinely zero.
        </>
      ),
      duration: 4.8,
      fig: 'exactly one worker spills; the other three report zero, not just less.',
      Visual: S.RevealOnlyOneSpills,
    },
    {
      title: 'Elaborate: the memory figure counts more than the disk figure',
      body: (
        <>
          The memory number for that one spill includes rounding to fixed-size pages and the
          space for the sorter's own bookkeeping — overhead the disk write never has to carry
          at all.
        </>
      ),
      duration: 4.8,
      fig: 'the memory figure counts page-rounding and bookkeeping the disk write skips.',
      takeaway: "A spill's memory figure is larger than its disk figure for the same event; it counts overhead disk writes skip.",
      Visual: S.ElaborateMemoryCountsMore,
    },
    {
      title: 'Predict: does four times the memory shrink the spill by that much?',
      body: (
        <>
          Give the entire job four times as much memory to work with. Does the one spilling
          worker's own spill shrink by anywhere close to that same amount?
        </>
      ),
      duration: 2.8,
      fig: 'the whole job gets four times the memory. Does the spill shrink that much?',
      predict: {
        options: [
          { label: "Yes — four times the memory should mean roughly a quarter of the spill" },
          { label: "No — it barely changes at all", correct: true },
        ],
        explain: (
          <>
            The extra memory gets split evenly across every worker, not handed entirely to the
            one that's actually short. Its own fair share barely grew at all.
          </>
        ),
      },
      Visual: S.PredictFourTimesMemory,
    },
    {
      title: 'Reveal: no -- it barely moves, the other three stay put',
      body: (
        <>
          Measured: the skewed worker's own spill barely changes at all. The three workers
          that never needed help in the first place stay exactly where they were, still at
          zero.
        </>
      ),
      duration: 4.8,
      fig: 'four times the memory: the skewed worker barely moves; the other three stay at zero.',
      Visual: S.RevealBarelyMoves,
    },
    {
      title: 'Elaborate: why -- memory handed out evenly helps only one worker',
      body: (
        <>
          That extra memory went to every worker equally. Only one of them actually needed
          any of it, and even its own larger share still fell far short of what it would take
          to stop spilling altogether.
        </>
      ),
      duration: 5,
      fig: 'extra memory split evenly; only the one worker needed it, and still came up short.',
      takeaway: 'Extra memory is handed out evenly; a skewed worker needing far more than its share barely benefits.',
      Visual: S.ElaborateEvenSplitWastesIt,
    },
    {
      title: 'Reveal: both runs, memory small and memory quadrupled, side by side',
      body: (
        <>
          Measured together: the small-memory run and the quadrupled-memory run end up almost
          identical for the worker that matters, while the other three stay unaffected either
          way.
        </>
      ),
      duration: 5,
      fig: 'small memory and quadrupled memory: nearly the same result for the worker that spills.',
      Visual: S.RevealSideBySide,
    },
    {
      title: 'Recap',
      body: (
        <>
          One spill produces two different numbers worth reading separately, and the fix for
          a worker that holds far more than its share is almost never simply handing out more
          memory to everyone.
        </>
      ),
      duration: 5,
      fig: 'one metric, two numbers; more memory spread evenly is a weak fix for one worker\'s skew.',
      takeaway: "A skewed task's spill barely shrinks with much more memory, since the increase is shared evenly, not aimed at it.",
      Visual: S.Recap,
    },
  ],
};

export default reel;
