import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// This chapter's third topic: the one kernel both the hash path and the sort path before it
// share, the k-way merge, found inside an LSM compaction, two different Spark spill merges,
// and a sort's final merge — and the same heap turned upside down and capped for ORDER BY ...
// LIMIT. Every number is computed in examples.py; every system claim is a word-for-word quote
// in SOURCES.md, or stated as read-but-not-quotable where noted there.

const reel: Reel = {
  steps: [
    {
      title: 'A RocksDB compaction opens twenty sorted files holding four billion keys and writes one sorted, deduplicated output, never holding more than one key per file in memory. A dashboard asks for the ten most expensive orders of four hundred million. Both are a heap. Predict: for the top ten of four hundred million rows, about how many rows actually replace something in the heap, if the rows arrive in random order?',
      body: <>Twenty files merge into one. Four hundred million rows reduce to ten. Same heap.</>,
      duration: 6,
      fig: 'MergeHook',
      predict: {
        options: [
          { label: 'About a few hundred thousand rows replace something in the heap' },
          { label: 'About a few hundred rows replace something in the heap', correct: true },
          { label: 'Every one of the four hundred million rows replaces something' },
        ],
        explain: (
          <>
            About one hundred seventy-five rows, out of four hundred million. Once the heap holds
            the ten best rows seen so far, a new row only replaces the worst of them when it
            actually beats it, and that gets rarer the further into the stream you are.
          </>
        ),
      },
      Visual: S.MergeHook,
    },
    {
      title: "Chapter six's picture, in one frame: twenty file streams, a heap of cursors beside them, the smallest cursor popping off the heap and the heap re-sifting, once per output row. Nothing about that picture changes here. What changes is where it is found: real source code, not a lab.",
      body: <>The same heap merge Chapter six built, found inside real engines.</>,
      duration: 5,
      fig: 'Chapter6Recap',
      Visual: S.Chapter6Recap,
    },
    {
      title: "Pebble's mergingIter keeps one heap of child iterators, one per LSM level, table or memtable. The same heap runs forward as a min-heap and backward as a max-heap. Next or Prev pops the current winner, advances its iterator, and fixes the heap — pop, advance, sift, read word for word from the source.",
      body: <>One heap of iterators, switched between min-heap and max-heap by direction.</>,
      duration: 5.5,
      fig: 'PebbleHeap',
      Visual: S.PebbleHeap,
    },
    {
      title: 'RocksDB built the identical design independently: a min/max heap combining data from point iterators. What makes it a database merge and not a generic one is the comparator: ties on the user key are broken by decreasing sequence number, so the newest version of a key surfaces first out of the heap with no special case at all.',
      body: <>Decreasing sequence number on ties: newest version first, for free.</>,
      duration: 5.5,
      fig: 'RocksDBComparator',
      takeaway: 'A merging iterator over LSM levels needs no special case for "newest version": the comparator already puts it first.',
      Visual: S.RocksDBComparator,
    },
    {
      title: "A compaction's own input iterator is built the same way: VersionSet::MakeInputIterator opens one iterator per input file across every input level and merges them into a single merging iterator. CompactionIterator then walks that merge and drops every version a newer one has already shadowed, tombstones included.",
      body: <>One merging iterator over every input file; shadowed versions dropped as it walks.</>,
      duration: 6,
      fig: 'CompactionDrop',
      Visual: S.CompactionDrop,
    },
    {
      title: "Predict: twelve streams need to merge, and a tree of losers is a complete binary tree in spirit. Does Velox's TreeOfLosers lay out twelve streams as a tree where every level but the last is completely full, the textbook picture exactly?",
      body: <>Does a tree of losers for twelve streams come out perfectly balanced?</>,
      duration: 4.5,
      fig: 'PredictTreeShape',
      predict: {
        options: [
          { label: 'Yes, every level above the leaves is completely full' },
          { label: 'No, some streams become inner nodes instead of leaves, to keep it a complete tree', correct: true },
        ],
        explain: (
          <>
            No. With twelve streams, the last level holds eight of them; the remaining four do not
            get their own leaves on the level above, which only has room for four nodes — so four
            of the twelve streams move up to become inner nodes, their places on the last level
            taken by two more streams each. The source's own comment works through exactly this.
          </>
        ),
      },
      Visual: S.PredictTreeShape,
    },
    {
      title: "Spark's heap shows up through two different APIs, same kernel. UnsafeSorterSpillMerger's priority queue never enqueues an empty spill reader, so a drained reader can never produce a spurious record. ExternalSorter's mergeSort builds a max-heap-only priority queue with the comparator reversed, because dequeuing the maximum under a flipped order is dequeuing the minimum key.",
      body: <>One heap guards against an empty reader; the other inverts a max-heap into a min-heap.</>,
      duration: 6,
      fig: 'SparkTwoHeaps',
      Visual: S.SparkTwoHeaps,
    },
    {
      title: "Chapter six already measured the cost: at a fan-in of eight, a binary heap spends about 4.35 comparisons per output row; a tree of losers spends exactly log base two of eight, three, every time, a 1.45 times difference. And still, three of the four engines read here reach for the heap, not the loser tree, because it adapts to an uneven fan-in with no separate rebuild step.",
      body: <>A loser tree compares less per output. Most engines still reach for the heap.</>,
      duration: 6,
      fig: 'HeapVsLoserMeasured',
      takeaway: 'A tree of losers compares less per output than a heap; most merges still choose the heap anyway.',
      Visual: S.HeapVsLoserMeasured,
    },
    {
      title: "The same heap, turned upside down. PostgreSQL's make_bounded_heap keeps the largest entry at the root instead of the smallest, temporarily reversing the sort direction, because the root is what a bounded heap needs to discard cheaply. The switch itself fires once the input passes twice the bound, or once work memory fills with enough rows to meet it.",
      body: <>The worst kept row sits at the root, so discarding it costs one comparison.</>,
      duration: 6,
      fig: 'BoundedHeapRoot',
      takeaway: "A bounded top-N heap keeps its worst kept row at the root, so a losing row costs one comparison.",
      Visual: S.BoundedHeapRoot,
    },
    {
      title: "Spark's BoundedPriorityQueue is the same structure for ORDER BY ... LIMIT: capped at the limit, a new row only replaces the current worst kept row when it ranks higher. Utils.takeOrdered runs this per partition, shuffles only those small local winners to one partition, then runs the identical bounded heap once more over the merged result — RDD's own doc comment calls it the opposite of top.",
      body: <>A bounded top-K per partition, shuffled, then one more bounded top-K to finish.</>,
      duration: 6,
      fig: 'SparkBoundedTopN',
      Visual: S.SparkBoundedTopN,
    },
    {
      title: "The arithmetic: a full sort costs on the order of n log n comparisons; a bounded heap of size N costs at most n log N, cheaper whenever N is far smaller than n, exactly the ORDER BY ... LIMIT case. And the number of rows that actually replace something in the heap, derived from how a random arrival order ranks each row and checked by simulation before trusting it at scale, is about k times the gap between two harmonic numbers — for ten of four hundred million, about one hundred seventy-five.",
      body: <>n log N beats n log n; about one hundred seventy-five replacements out of four hundred million rows.</>,
      duration: 6.5,
      fig: 'ReplacementArithmetic',
      takeaway: 'Almost every row a bounded top-N heap sees is thrown away for one comparison; only a few reach the root.',
      Visual: S.ReplacementArithmetic,
    },
    {
      title: 'A heap or a tree of losers picks the next-ready element among several streams, by comparator, every time. Turn the streams into tasks whose readiness depends on what finished before them, and the sorted order the heap enforces becomes a dependency order instead. The same shape becomes a scheduler. Topological sort inside schedulers, next.',
      body: <>Next: the same shape, over tasks and dependencies instead of sorted streams.</>,
      duration: 5,
      fig: 'Recap',
      Visual: S.Recap,
    },
  ],
};

export default reel;
