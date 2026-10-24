# Sources: LSM trees: write and read paths (`de.lsm-trees-write-read`)

The original LSM-tree paper (O'Neil, Cheng, Gawlick, O'Neil, 1996) could not be fetched: the only free copies found (UMass Boston, UC Berkeley course mirror) either serve a broken TLS certificate chain or 404. Per the research rule, it is replaced here by the Wikipedia article on the structure, which states the same mechanism (memtable, immutable component, merge, tombstone, Bloom filter, amortized cost) and cites the original paper directly, plus RocksDB's own architecture-guide documentation for the concrete, real engine this topic measures.

## Log-structured merge-tree (Wikipedia)

URL: https://en.wikipedia.org/wiki/Log-structured_merge-tree
Version: retrieved 2026-10-24

> In LSM-trees, write operations are designed to optimize performance by reducing random I/O and leveraging sequential disk writes. When a write operation is initiated, the data is first buffered in an in-memory component, often implemented using a sorted data structure such as a Skip list or B+ tree.

> Once the in-memory buffer becomes full, it is flushed to the disk as an immutable sorted component at the first level (C1). This flush is performed sequentially, ensuring high I/O efficiency by avoiding the costly random writes typical of traditional indexing methods. To maintain durability, the system may use a write-ahead log (WAL) that records all incoming writes before they are added to the memory buffer. This ensures that no data is lost in the event of a crash during a write.

> As data accumulates across levels on the disk, LSM trees employ a merge process similar to merge sort to consolidate entries and maintain a consistent sorted order across levels. This process also handles updates and deletes, removing redundant or obsolete entries. Updates are treated as new writes, while deletes are marked with a tombstone entry, which is a placeholder indicating that the key has been deleted. These tombstones are later removed during the merging process.

> The process begins with a search in the in-memory component (C0), which holds the latest data. Since this component is organized as a sorted structure, the search is efficient. If the key is found here, its value is returned right away.

> If the key isn't found in memory, the search moves to the disk components, starting with the first level (C1) and continuing through deeper levels (C2, C3, etc.). Each disk level is also sorted, allowing for efficient searches using methods like binary search or tree search. Newer levels are checked first because they contain the most recent updates and deletions for the key.

> To make the search faster, LSM trees often use a bloom filter for each on-disk component. These filters are probabilistic structures that help quickly determine whether a key is definitely absent from a component. Before accessing any disk component, the system checks the Bloom filter. If the filter indicates the key is not present, the component is skipped, saving time. If the filter suggests the key might be there, the system proceeds to search for the component.

> The lookup operation stops as soon as the key is found, ensuring the most recent version is returned. If the search reaches the final level without finding the key, the system concludes that the key doesn't exist.

> A range query begins by searching the in-memory component (C0). Since this component is typically a sorted data structure, range queries can be done efficiently. Once the in-memory component is finished, the query proceeds to the disk components, starting from the first level (C1) and continuing to deeper levels.

> The results from each component are then merged into a priority queue to reconcile duplicates, updates, and deletes, ensuring the final result only includes the latest version of each key.

Contents: the write path (buffer in memory, flush as an immutable sorted component, WAL for crash durability); the merge process handling updates (new writes) and deletes (tombstones); the point-read path (newest component first, in-memory then disk level by level); Bloom filters as the per-component skip check before a disk read; the range-read path (scan each component from newest to oldest, merge via a priority queue to keep only the latest version of each key).

## RocksDB Overview (RocksDB wiki)

URL: https://raw.githubusercontent.com/wiki/facebook/rocksdb/RocksDB-Overview.md
Version: retrieved 2026-10-24 (GitHub wiki, facebook/rocksdb)

> The three basic constructs of RocksDB are **memtable**, **sstfile** and **logfile**. The [**memtable**](https://github.com/facebook/rocksdb/wiki/MemTable) is an in-memory data structure - new writes are inserted into the _memtable_ and are optionally written to the [**logfile** (aka. Write Ahead Log(WAL))](https://github.com/facebook/rocksdb/wiki/Write-Ahead-Log-%28WAL%29). The logfile is a sequentially-written file on storage. When the memtable fills up, it is flushed to a [**sstfile**](https://github.com/facebook/rocksdb/wiki/Rocksdb-BlockBasedTable-Format) on storage and the corresponding logfile can be safely deleted. The data in an sstfile is sorted to facilitate easy lookup of keys.

> The entire database is stored in a set of _sstfiles_. When a _memtable_ is full, its content is written out to a file in Level-0 (L0) of the LSM tree. RocksDB removes duplicate and overwritten keys in the memtable when it is flushed to a file in L0. In _compaction_, some files are periodically read in and merged to form larger files, often going into the next LSM level (such as L1, up to Lmax).

> RocksDB supports configuring an arbitrary number of memtables for a database. When a memtable is full, it becomes an immutable memtable and a background thread starts flushing its contents to storage. Meanwhile, new writes continue to accumulate to a newly allocated memtable. If the newly allocated memtable is filled up to its limit, it is also converted to an immutable memtable and is inserted into the flush pipeline. The background thread continues to flush all the pipelined immutable memtables to storage. This pipelining increases write throughput of RocksDB, especially when it is operating on slow storage devices.

> When a memtable is being flushed to storage, an inline-compaction process is executed. Garbages are removed in the same way as compactions. Duplicate updates for the same key are removed from the output stream. Similarly, if an earlier put is hidden by a later delete, then the put is not written to the output file at all. This feature reduces the size of data on storage and write amplification greatly, for some workloads.

> The default implementation of the memtable for RocksDB is a skiplist. The skiplist is a sorted set, which is a necessary construct when the workload interleaves writes with range-scans.

Contents: the three on-disk constructs (memtable, sstfile, logfile/WAL) and the write path through them; memtable-full → flush to a new L0 sstfile; the memtable pipeline (full memtable → immutable memtable → background flush, while new writes go to a fresh memtable); the default skiplist memtable implementation.

## RocksDB Bloom Filter (RocksDB wiki)

URL: https://raw.githubusercontent.com/wiki/facebook/rocksdb/RocksDB-Bloom-Filter.md
Version: retrieved 2026-10-24 (GitHub wiki, facebook/rocksdb)

> In RocksDB, when the filter policy is set, every newly created SST file will contain a Bloom filter, which is used to determine if the file may contain the key we're looking for. The filter is essentially a bit array. Multiple hash functions are applied to the given key, each specifying a bit in the array that will be set to 1. At read time also the same hash functions are applied on the search key, the bits are checked, i.e., probe, and the key definitely does not exist if at least one of the probes return 0.

> When configured in RocksDB, each SST file is created with a Bloom filter, embedded in the SST file itself.

> - `rocksdb.bloom.filter.useful`: [true] negatives
> - `rocksdb.bloom.filter.full.positive`: positives
> - `rocksdb.bloom.filter.full.true.positive`: true positives

Contents: a Bloom filter is a per-key bit array checked by hashing the search key and probing those bits, with a zero probe meaning the key definitely does not exist; every SST file gets its own embedded filter; the real statistics counters (`useful`, `full.positive`, `full.true.positive`) this topic's example reads directly to show how many lookups the filter correctly rejected versus wasted on a false positive.

## RocksDB BlockBasedTable Format (RocksDB wiki)

URL: https://raw.githubusercontent.com/wiki/facebook/rocksdb/Rocksdb-BlockBasedTable-Format.md
Version: retrieved 2026-10-24 (GitHub wiki, facebook/rocksdb)

> BlockBasedTable is the default SST table format in RocksDB.

> The sequence of key/value pairs in the file are stored in sorted order and partitioned into a sequence of data blocks. These blocks come one after another at the beginning of the file.

> Index blocks are used to look up a data block containing the range including a lookup key. It is a binary search data structure. A file may contain one index block, or a list of partitioned index blocks (see [[Partitioned Index Filters]]).

Contents: the default SST layout (sorted key/value pairs in data blocks, plus meta blocks including the filter and index); the block index's job, which is the "block indexes" half of the syllabus clause this topic must cover, a binary-search structure a read uses, after the Bloom filter passes, to find the one data block that might hold the key without scanning the whole file.
