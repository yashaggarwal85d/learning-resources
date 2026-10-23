import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Last topic's fanout formula rewards whoever spends a page's bytes well. This topic is
// entirely about that spending: what actually lives in a routing key, in a compared key, and
// in a repeated key. Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: "Last topic's fanout formula only pays off if a page's bytes are actually spent on keys, not wasted on more than a routing entry ever needs.",
      body: (
        <>
          Nothing about the split or the search changes here. Everything changes about what one
          page can actually hold.
        </>
      ),
      duration: 4,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: "A real page: a header tracking how many slots are used, a slot array of fixed-size offsets, and a growing area of the actual, variable-length keys.",
      body: (
        <>
          Nothing ever shifts to make room. A new tuple just claims the next slot and the next
          free bytes.
        </>
      ),
      duration: 4,
      fig: 'SlottedLayout',
      Visual: S.SlottedLayout,
    },
    {
      title: 'A leaf just split. What key bytes actually get copied into the new routing entry above it?',
      body: <>What actually gets copied into the new routing entry above this split?</>,
      duration: 2,
      fig: 'PrefixSuffixPredict',
      predict: {
        options: [
          { label: 'The full key, unchanged' },
          { label: 'Only the bytes that still tell the two new halves apart', correct: true },
          { label: 'Nothing — routing entries never store a key at all' },
          { label: 'A hash of the key' },
        ],
        explain: (
          <>
            A routing entry only has to pick a side. It never has to answer whether the exact key
            is present — that question belongs to a leaf.
          </>
        ),
      },
      Visual: S.PrefixSuffixPredict,
    },
    {
      title: "Keep only the attributes that distinguish the last key on one side from the first key on the other. Everything after that point is dropped, at no storage cost at all.",
      body: (
        <>
          A leaf still needs the whole key, because a leaf has to answer whether the exact key is
          there. A routing entry never does.
        </>
      ),
      duration: 4.2,
      fig: 'PrefixSuffixReveal',
      takeaway: 'A routing key only needs to pick a side — it never needs the full key a leaf stores.',
      Visual: S.PrefixSuffixReveal,
    },
    {
      title: "A typed key — an integer, a string, a float — gets converted once into a fixed, byte-comparable form, so every comparison anywhere in the tree is a plain byte-for-byte check, never a type-aware parse.",
      body: (
        <>
          The sign bit flips, the bytes reorder, and the comparison that used to need type
          knowledge no longer does.
        </>
      ),
      duration: 4,
      fig: 'KeyNormalization',
      Visual: S.KeyNormalization,
    },
    {
      title: 'A million keys, already sorted, need to become one B+Tree. Insert them one at a time, or something else entirely?',
      body: <>Insert a million already-sorted keys one at a time, or something else?</>,
      duration: 2,
      fig: 'BulkLoadPredict',
      predict: {
        options: [
          { label: 'Insert one at a time, same as any other insert' },
          { label: 'Sort once, build the leaf level directly, and link upward', correct: true },
          { label: 'Build every level at once, in parallel' },
          { label: "It can't be done any faster than one key at a time" },
        ],
        explain: (
          <>
            The keys are already sorted. Nothing about descending from the root to find where
            each one belongs is still necessary.
          </>
        ),
      },
      Visual: S.BulkLoadPredict,
    },
    {
      title: "Fill leaf pages left to right, keep the growing root only in memory, and only ever split the single page furthest to the right — because a sorted build never comes back to a page that's already full.",
      body: (
        <>
          Every other kind of insert touches the whole path from the root down. This one never
          revisits anything behind it.
        </>
      ),
      duration: 4.5,
      fig: 'BulkLoadReveal',
      takeaway: "A bulk load's only splits happen on the tree's own right-most path — nowhere else ever overflows.",
      Visual: S.BulkLoadReveal,
    },
    {
      title: "Fill factor is the percentage a page is packed to on a build or a right-edge append. Packing it completely full wastes nothing today, but risks a flood of splits on the very next write.",
      body: (
        <>
          A table that will never change again wants it full. A table under constant writes wants
          room left on purpose.
        </>
      ),
      duration: 3.8,
      fig: 'FillFactor',
      Visual: S.FillFactor,
    },
    {
      title: "Repeated keys merge into one stored key plus a list of pointers to every row that shares it — and that merge only ever happens at the one moment a page was about to split anyway.",
      body: (
        <>
          A background pass would spend I/O on pages that were never going to split in the first
          place. Waiting for the one moment that matters spends none of it.
        </>
      ),
      duration: 4,
      fig: 'Deduplication',
      takeaway: "Deduplication only ever runs at the one moment a split was about to happen — never as a background pass.",
      Visual: S.Deduplication,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Measured, not assumed: the byte savings from truncation and normalization on a real key
          set, a bulk load's page-write count against one-at-a-time insertion on the identical
          sorted input, and a deduplication savings ratio on a genuinely repeated-key set.
        </>
      ),
      duration: 4,
      fig: 'ProveIt',
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
