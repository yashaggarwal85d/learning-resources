## PostgreSQL nbtree/README

URL: https://raw.githubusercontent.com/postgres/postgres/master/src/backend/access/nbtree/README
Version: `master`, fetched 2026-11-07

> The requirement that all btree keys be unique is satisfied by treating heap
> TID as a tiebreaker attribute. Logical duplicates are sorted in heap TID
> order.

> the fallback strategy assumes that duplicates are mostly inserted in
> ascending heap TID order. The page is split in a way that leaves the left
> half of the page mostly full, and the right half of the page mostly empty.

Notes: a B+-tree index entry is a `(key, heap tuple identifier)` pair, with the TID breaking
ties among equal keys so every entry is unique; the file also gives the split heuristic for a
leaf page packed with duplicates, which only matters once an index has logical duplicates at
all (a point this topic's drawing uses to show why the TID is really part of the key, not an
afterthought payload).

## RocksDB db/dbformat.h

URL: https://raw.githubusercontent.com/facebook/rocksdb/main/db/dbformat.h
Version: `main`, fetched 2026-11-07

> the user key portion and breaks ties by decreasing sequence number.

Notes: the internal key RocksDB actually stores and compares is the user key followed by a
sequence number, ordered by user key ascending and then sequence number **descending**, so the
newest write of a key sorts first; Topic 119's merging iterator reads this same comparator.

## RocksDB wiki: Partitioned Index/Filters

URL: https://github.com/facebook/rocksdb/wiki/Partitioned-Index-Filters
Version: wiki, fetched 2026-11-07 (via raw.githubusercontent.com/wiki mirror)

> RocksDB has by default one index/filter block per SST file. The size of the index/filter block
> varies based on the configuration but for an SST of size 256MB the index/filter block of size
> 0.5/5MB is typical, which is much larger than the typical data block size of 4-32KB.

> A filter of size 5MB is occupying the space that could otherwise be used to cache 1000s of
> data blocks (of size 4KB).

> With partitioning, the index/filter block of an SST file is partitioned into smaller blocks
> with an additional top-level index on them. When reading an index/filter, only top-level index
> is loaded into memory.

> Additional space for the top-level index: its quite small 0.1-1% of index/filter size.

Notes: a single filter block can be a thousand times the size of a data block it is meant to
protect; partitioning turns the filter itself into a two-level structure (a tiny always-resident
top-level index over many small filter partitions loaded on demand), which is the B-tree idea
applied one layer up, to a Bloom filter rather than to data.

## RocksDB wiki: RocksDB Bloom Filter

URL: https://github.com/facebook/rocksdb/wiki/RocksDB-Bloom-Filter
Version: wiki, fetched 2026-11-07 (via raw.githubusercontent.com/wiki mirror)

Notes: fetched to check the current default filter construction (`BloomFilterPolicy` /
`ribbon filter`); read in full for research but no sentence from it is quoted here, since this
topic does not assert a specific default without a version-pinned source. See FACT-CHECK.md for
what the page does and does not let us claim.

## RocksDB wiki: A Tutorial of RocksDB SST formats

URL: https://github.com/facebook/rocksdb/wiki/A-Tutorial-of-RocksDB-SST-formats
Version: wiki, fetched 2026-11-07 (via raw.githubusercontent.com/wiki mirror)

Notes: background on the block-based table layout (data blocks, index block, filter block,
footer) that the partitioned-filter page assumes; used only for orientation, not quoted.

## Chapter 5 (B+-trees and LSM trees) and Chapter 12 (Bloom filters), this repo

URL: (internal) site/src/topics/registry.ts — Chapter 5 and Chapter 12 entries
Version: as live on `main`, read 2026-11-07

Notes: the textbook B+-tree node-split/merge, sibling links and bulk loading; the textbook LSM
tree's memtable, SSTable, write-ahead log, compaction policy and per-level filter sizing; and
the Bloom filter's false-positive-rate formula, are all assumed taught already and only named,
never re-derived, per CHAPTER.md's scope line for this topic.
