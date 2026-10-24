import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Profiling genuinely attributes the real majority of a program's own
// cost to one specific function, often several calls deep, not an even
// split; an allocator's own overhead is itself a real, measured cost.
const reel: Reel = {
  steps: [
    {
      title: "A flamegraph's own width shows how often a function was on the real call stack. Does that real cost spread evenly across every function a program calls, or does it pile up in one place?",
      body: (
        <>
          A real call tree, cost unlabelled.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'It genuinely spreads evenly across every function' },
          { label: 'No, genuinely; it piles up in one specific function', correct: true },
          { label: 'Only for a genuinely recursive function' },
        ],
        explain: (
          <>
            No. It genuinely piles up in one place.
          </>
        ),
      },
      Visual: S.SpreadPredict,
    },
    {
      title: "Measured: one specific function genuinely holds the real majority of the whole tree's total cost, far more than an even share across every function",
      body: (
        <>
          The real, measured cost per function.
        </>
      ),
      duration: 3.0,
      takeaway: "A cost spread evenly is the wrong default assumption; a program's own real cost piles up.",
      Visual: S.HotFunctionReveal,
    },
    {
      title: 'That one real hot function sits several calls deep in the tree, under two real ancestors. Does checking just the top of the real call stack find it?',
      body: (
        <>
          The tree, the hot function marked deep inside it.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, the top frame is always the real hot path' },
          { label: 'No, genuinely; the whole real tree must be walked to find it', correct: true },
          { label: 'Only if the real program recurses' },
        ],
        explain: (
          <>
            No. The whole real tree must genuinely be walked.
          </>
        ),
      },
      Visual: S.DepthPredict,
    },
    {
      title: "Measured: the real hot function is genuinely not a top-level function; attributing its real cost correctly means walking down through its real ancestors, not just reading the top frame",
      body: (
        <>
          The real, measured path from root to hot function.
        </>
      ),
      duration: 3.0,
      takeaway: "A profiler's own attribution must walk the whole tree; a glance at the top frame cannot.",
      Visual: S.DepthReveal,
    },
    {
      title: 'A specialized allocator claims a real, measured speedup over a generic one, at the identical allocation count. Is that real difference big enough to matter, or too small to bother measuring?',
      body: (
        <>
          Two allocators, the identical allocation count.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Too small to matter in practice' },
          { label: 'A real, measurable, majority-level cut in total cost', correct: true },
          { label: 'Only in a genuinely single-threaded program' },
        ],
        explain: (
          <>
            A real, measurable, majority-level cut.
          </>
        ),
      },
      Visual: S.AllocatorPredict,
    },
    {
      title: 'Measured: the specialized allocator genuinely cut total allocation cost by more than half, at the identical allocation count',
      body: (
        <>
          The real, measured allocator comparison.
        </>
      ),
      duration: 3.0,
      takeaway: 'Allocator choice is a real, measured decision, never a free abstraction to assume away.',
      Visual: S.AllocatorReveal,
    },
    {
      title: "Brendan Gregg's own flame-graphs page and mimalloc's own README both state this exact discipline directly: a frame's own real width shows how often it was on the real stack, and an allocator's own real overhead is a real, measured, sometimes decisive cost. Does this topic's own code measure the identical real rules those real tools exist to show?",
      body: (
        <>
          Both sources' own words on this exact discipline, shown directly.
        </>
      ),
      duration: 2.8,
      Visual: S.DocsReveal,
    },
    {
      title: "Recap: a real call tree and a real allocator comparison, measured directly",
      body: (
        <>
          One specific function, not an even split, holds the real majority of a program's own cost, often several calls deep; and an allocator's own overhead is itself a real, measured cost, not a free abstraction.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
