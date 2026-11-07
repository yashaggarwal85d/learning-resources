import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// This chapter's sixth topic: the B+-tree and the LSM tree read as the index layer of a real
// storage engine, from PostgreSQL's nbtree/README and RocksDB's internal key format and
// partitioned-filter design. Every number is computed in examples.py; every system claim is a
// word-for-word quote in SOURCES.md.

const reel: Reel = {
  steps: [
    {
      title: "A lookup for a key that is not there should touch no data block at all. Yet one filter block alone can be over a thousand times the size of the data block it protects. Predict: what does the engine do with a filter bigger than the thing it is supposed to protect, and what does that remind you of?",
      body: <>A filter block can dwarf the data block it is meant to protect.</>,
      duration: 5.5,
      fig: 'FilterHook',
      predict: {
        options: [
          { label: 'It accepts the cost, since a filter is still cheaper than reading every data block' },
          { label: 'It pages the filter itself: a small top-level index over filter partitions, loaded on demand', correct: true },
          { label: 'It shrinks the filter until it is no larger than a single data block' },
        ],
        explain: (
          <>
            A storage engine pages the filter the same way it pages data: a tiny top-level index,
            loaded once, points at small filter partitions loaded only when a lookup needs them.
            A B-tree's own idea, applied to a Bloom filter.
          </>
        ),
      },
      Visual: S.FilterHook,
    },
    {
      title: "The textbook contract, and the system's addition, side by side: the Chapter 5 B+-tree exactly as drawn there, key only, on the left; a storage engine's leaf entry on the right, a second value riding beside the key.",
      body: <>The same tree, with a second value now riding beside every key.</>,
      duration: 5,
      fig: 'BTreeTwoColumn',
      Visual: S.BTreeTwoColumn,
    },
    {
      title: "PostgreSQL's requirement that every btree key be unique is met by treating the heap tuple identifier as a tiebreaker attribute: logical duplicates of the same key are sorted in heap TID order, so no two entries are ever truly identical.",
      body: <>The heap tuple identifier breaks every tie, so no two entries are ever equal.</>,
      duration: 5.5,
      fig: 'TidTiebreaker',
      Visual: S.TidTiebreaker,
    },
    {
      title: "Measured: five order rows for the same customer become five leaf entries. The key repeats five times, but each entry's tuple identifier is different, so every entry is unique and the tree's ordering still holds.",
      body: <>Five rows, one repeated key, five still-unique entries.</>,
      duration: 5,
      fig: 'DuplicateEntries',
      Visual: S.DuplicateEntries,
    },
    {
      title: "Predict: a leaf page fills up with entries that all share one key and must split. Does the split put half the duplicates on each side of the new boundary, the way a split of ordinary, distinct keys would?",
      body: <>Does a page full of duplicates split down the middle, like an ordinary page?</>,
      duration: 4.5,
      fig: 'PredictSplit',
      predict: {
        options: [
          { label: 'Yes, an even split either way, duplicates or not' },
          { label: 'No, the fallback assumes ascending-TID inserts and leaves one side almost full, the other almost empty', correct: true },
        ],
        explain: (
          <>
            No. PostgreSQL's fallback for a page packed with duplicates assumes they were mostly
            inserted in ascending heap-TID order, and splits so the left page stays mostly full
            and the right page stays mostly empty.
          </>
        ),
      },
      Visual: S.PredictSplit,
    },
    {
      title: "Measured on the shop's five duplicate rows at a small leaf capacity: the left page keeps every slot it had, full; the right page holds only the one row the split pushed out, almost empty.",
      body: <>The left page stays full; the right page holds almost nothing.</>,
      duration: 5,
      fig: 'LopsidedSplit',
      takeaway: 'A page full of duplicate keys splits lopsided, not down the middle, assuming ascending inserts.',
      Visual: S.LopsidedSplit,
    },
    {
      title: "The second structure, the same way: the Chapter 5 LSM tree exactly as drawn there on the left; RocksDB's stored key on the right, a sequence number now riding beside the user key.",
      body: <>A sequence number now rides beside the key, the LSM tree's own tiebreaker.</>,
      duration: 5,
      fig: 'LsmTwoColumn',
      Visual: S.LsmTwoColumn,
    },
    {
      title: "RocksDB's comparator orders by user key ascending, then by sequence number descending: among entries for the same key, the newest write sorts first, drawn as a stack with the newest version on top.",
      body: <>Same key, newest write on top: sequence number sorts in reverse.</>,
      duration: 5.5,
      fig: 'SequenceOrder',
      takeaway: 'Ordering by key, then by sequence number descending, puts the newest write of any key first.',
      Visual: S.SequenceOrder,
    },
    {
      title: "Measured: one key is written three times and then deleted. A snapshot taken right after the second write still reads the second write's value, untouched by everything that came later; a reader with no snapshot constraint sees the delete, ahead of every earlier version.",
      body: <>A snapshot reads the version current at the moment it was taken, nothing later.</>,
      duration: 6,
      fig: 'SnapshotRead',
      Visual: S.SnapshotRead,
    },
    {
      title: "Because the newest version already sorts first, a snapshot read is one seek to the first version at or before the snapshot, never a scan of every version a key ever had. The same ordering is what a later topic's merging iterator reads when it walks several files at once.",
      body: <>One seek finds the right version; nothing else needs to be read.</>,
      duration: 5.5,
      fig: 'SeekNotScan',
      Visual: S.SeekNotScan,
    },
    {
      title: "The filter problem, stated in full: one index or filter block is commonly far larger than a single data block, so when it is not cached it competes with the very data blocks it exists to protect, and kicks them out of the cache.",
      body: <>A filter many times the size of a data block pushes data blocks out of the cache.</>,
      duration: 5.5,
      fig: 'FilterCompetesWithData',
      Visual: S.FilterCompetesWithData,
    },
    {
      title: "The fix: the filter is split into small partitions, with a tiny top-level index over them, itself only a sliver of the filter's own size, loaded once; a lookup loads only the one partition it actually needs, on demand.",
      body: <>A tiny top-level index, loaded once, points at small filter partitions loaded on demand.</>,
      duration: 5.5,
      fig: 'PartitionedFilter',
      takeaway: 'A filter larger than a data block gets its own index, the same idea one layer up.',
      Visual: S.PartitionedFilter,
    },
    {
      title: "Predict, then measured: four point lookups, counted in block reads. A hit costs the same whether or not a filter exists, since the data still has to be fetched. A miss with no filter wastes exactly one data read. A miss against a whole filter already in the cache costs nothing extra. A miss whose one needed filter partition is not cached costs one more read: exactly as much as having no filter at all.",
      body: <>An uncached filter partition costs exactly what no filter costs at all.</>,
      duration: 6.5,
      fig: 'BlockReadCounts',
      predict: {
        options: [
          { label: 'A whole cached filter and a partitioned filter always cost the same' },
          { label: 'An uncached filter partition costs exactly as much as having no filter at all', correct: true },
          { label: 'Partitioning a filter never costs more than keeping it whole' },
        ],
        explain: (
          <>
            A whole, cached filter costs nothing extra on a miss. A partitioned filter whose one
            needed partition is not cached costs one more read to load it, landing at the same
            total as skipping the filter entirely.
          </>
        ),
      },
      takeaway: 'Partitioning a filter only pays off when the partition a lookup needs is already cached.',
      Visual: S.BlockReadCounts,
    },
    {
      title: "Three adaptations, one shape: a tiebreaker added so a key is never really alone, a sequence number added so the newest write always sorts first, a filter cut into pages so it never has to be read whole. Every one of them still assumes the data lives on one machine. The next question is which machine holds a key at all.",
      body: <>Next: which machine holds a key at all, once there is more than one.</>,
      duration: 5.5,
      fig: 'Recap',
      Visual: S.Recap,
    },
  ],
};

export default reel;
