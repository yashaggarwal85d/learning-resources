import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A binary heap (previous topic) answers "what's smallest" for one stream. This topic asks
// the same question across k already-sorted streams at once, every single output. Every
// number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: "A binary heap answers what's smallest right now for one stream of insertions. A k-way merge asks the same question across several already-sorted streams at once, every time it produces one output — and a heap's own sift-down re-examines a full root-to-leaf path to answer it, which is more comparison work than the problem actually requires.",
      body: (
        <>
          Same question as the previous topic, asked across k runs at once: of k sorted
          runs' current heads, which is smallest, right now?
        </>
      ),
      duration: 4.5,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: 'The obvious approach: scan every run’s current head and pick the smallest. That costs one comparison per still-active run beyond the first, every single output.',
      body: <>No structure at all, just a fresh scan each time. It works. It's the first thing worth beating.</>,
      duration: 3.5,
      fig: 'NaiveReveal',
      Visual: S.NaiveReveal,
    },
    {
      title: 'Put the k heads in a binary heap instead, one pop-and-refill per output. What does that actually cost per output element?',
      body: <>What does a heap-based merge actually cost, per output element?</>,
      duration: 2,
      fig: 'HeapPredict',
      predict: {
        options: [
          { label: "The same cost as scanning every run — a heap doesn't help here" },
          { label: 'Exactly one comparison per level' },
          { label: 'Roughly two comparisons per level, because a sift-down compares both children', correct: true },
          { label: 'Zero — a heap always knows its minimum for free' },
        ],
        explain: (
          <>
            A sift-down has to find the smaller child before it can decide whether to swap —
            that's two comparisons at every level it touches, not one.
          </>
        ),
      },
      Visual: S.HeapPredict,
    },
    {
      title: "A heap-based merge costs roughly two comparisons per level: a sift-down walks from the root toward the bottom, and at every level it compares both children to find the smaller one before deciding whether to swap.",
      body: <>Better than scanning every run — but every level touched costs two comparisons, not one.</>,
      duration: 4,
      fig: 'HeapReveal',
      takeaway: 'A heap-based merge compares both children at every level a sift-down touches, not just one.',
      Visual: S.HeapReveal,
    },
    {
      title: 'A tournament tree turns this into a single-elimination bracket over the k runs’ current heads instead. Can a structure built this way beat a heap’s own cost per output?',
      body: <>Can a single-elimination bracket beat a heap's own cost here?</>,
      duration: 2,
      fig: 'TournamentPredict',
      predict: {
        options: [
          { label: 'No — the bracket has the same number of rounds as the heap has levels, so the cost is the same' },
          { label: "Yes — exactly one comparison per round, fewer than a heap's own cost", correct: true },
          { label: 'Yes, but only because it skips some comparisons unsafely' },
          { label: 'No — a bracket always needs more rounds than a heap has levels' },
        ],
        explain: (
          <>
            Same depth as the heap's own tree, but each round plays exactly one game — one
            comparison per layer, not two.
          </>
        ),
      },
      Visual: S.TournamentPredict,
    },
    {
      title: "A tournament tree is an elimination bracket: two elements compete each game, the smaller one is promoted, and the bracket is a binary tree of games. Because each round plays one game per pair, each layer costs exactly one comparison, not the heap's own two.",
      body: <>Same depth as the heap's own tree. Fewer comparisons per level, because only one pair competes at each node.</>,
      duration: 4.5,
      fig: 'TournamentReveal',
      Visual: S.TournamentReveal,
    },
    {
      title: "Store only each game's loser, and the overall winner floats above the root: that's a loser tree. When the winning run's head is consumed and refilled, only the single path from that leaf back up to the root needs replaying — every other node is untouched.",
      body: <>The rest of the bracket already reflects every game it isn't part of. Nothing else needs to move.</>,
      duration: 4,
      fig: 'LoserTreeReveal',
      takeaway: "A loser tree repairs one root-to-leaf path per output — the heap's own discipline, with fewer comparisons at every level.",
      Visual: S.LoserTreeReveal,
    },
    {
      title: "This is the real merge kernel behind two systems already in this course: external sorting's own second stage merges sorted runs this way, and an LSM-tree's own compaction step is exactly this same k-way merge of several runs into one.",
      body: <>A wider merge pass needs fewer passes: six runs merged two at a time takes three passes; merged six-way, it's one.</>,
      duration: 4.5,
      fig: 'ExternalSortReveal',
      Visual: S.ExternalSortReveal,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Measured, not assumed: real comparisons per output for a naive scan, a heap-based
          merge, and a loser tree, on the identical runs — including why the heap's own
          measured gap over the loser tree comes out smaller than a rough estimate suggests.
        </>
      ),
      duration: 4.5,
      fig: 'ProveIt',
      takeaway: 'A loser tree beats a heap-based merge every time measured — by a margin smaller than a rough estimate assumes.',
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
