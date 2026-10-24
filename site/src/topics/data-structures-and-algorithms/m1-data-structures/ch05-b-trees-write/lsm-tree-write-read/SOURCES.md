## CMU 15-445/645 Database Systems (Fall 2024), Lecture 4: Database Storage II

URL: https://15445.courses.cs.cmu.edu/fall2024/slides/04-storage2.pdf
Version: Fall 2024 offering, fetched 2026-10-23

> Instead of storing tuples in pages and updating the
in-place, the DBMS maintains a log that records
changes to tuples.

> Each log entry represents a tuple PUT/DELETE operation.

> Originally proposed as log-structure merge trees (LSM
Trees) in 1996.

> The DBMS applies changes to an in-memory data
structure (MemTable) and then writes out the
changes sequentially to disk (SSTable).

> Each log record must contain the tuple's
unique identifier.

> Put records contain the tuple contents.

> Deletes marks the tuple as deleted.

> As the application makes changes to
the database, the DBMS appends log
records to the end of the file without
checking previous log records.

> SummaryTable
• Min/Max Key
Per SSTable

> • Key Filter
Per Level

Contents (item by item, this topic's scope):
1. The core LSM write path: a log of PUT/DELETE operations, applied to an in-memory MemTable, flushed sequentially to an on-disk SSTable.
2. A delete is recorded as its own kind of log entry (marking the tuple deleted), not an in-place removal.
3. A WAL-style append-only write discipline: records are appended without checking previous records.
4. Two distinct per-SSTable/per-level structures that let a read skip work: a min/max key range per SSTable (a fence pointer) and a key filter per level (a Bloom filter).

## CMU 15-445/645 Database Systems (Fall 2024), Lecture 8: Indexes & Filters I

URL: https://15445.courses.cs.cmu.edu/fall2024/slides/08-indexes1.pdf
Version: Fall 2024 offering, fetched 2026-10-23

> A filter is a data structure that answers set
membership queries; it tells you whether a record
(likely) exists for a key but not where it is located.

Contents (item by item, this topic's scope):
1. The precise distinction this topic needs between an index (locates a record) and a filter (only answers whether a record might exist) — exactly the role split between a fence pointer and a Bloom filter.

## LevelDB Implementation Notes

URL: https://raw.githubusercontent.com/google/leveldb/main/doc/impl.md
Version: `main` branch, fetched 2026-10-23

> A log file (*.log) stores a sequence of recent updates. Each update is appended
to the current log file. When the log file reaches a pre-determined size
(approximately 4MB by default), it is converted to a sorted table (see below)
and a new log file is created for future updates.

> A copy of the current log file is kept in an in-memory structure (the
`memtable`). This copy is consulted on every read so that read operations
reflect all logged updates.

> A sorted table (*.ldb) stores a sequence of entries sorted by key. Each entry is
either a value for the key, or a deletion marker for the key. (Deletion markers
are kept around to hide obsolete values present in older sorted tables).

> When the log file grows above a certain size (4MB by default):
Create a brand new memtable and log file and direct future updates here.

Contents (item by item, this topic's scope):
1. The WAL (log file) + memtable write path in a real, current production LSM engine, including the size threshold that triggers a flush.
2. The memtable's role on reads: consulted on every read so that reads reflect every logged update not yet flushed.
3. A flushed run (sorted table) stores either a value or a deletion marker per key — the production name for a tombstone.

## LevelDB File Format

URL: https://raw.githubusercontent.com/google/leveldb/main/doc/table_format.md
Version: `main` branch, fetched 2026-10-23

> An "index" block. This block contains one entry per data block,
where the key is a string >= last key in that data block and before
the first key in the successive data block. The value is the
BlockHandle for the data block.

> If a `FilterPolicy` was specified when the database was opened, a
filter block is stored in each table.

> The filter block stores a sequence of filters, where filter i contains
the output of `FilterPolicy::CreateFilter()` on all keys that are stored
in a block whose file offset falls within the range

Contents (item by item, this topic's scope):
1. The literal on-disk form of a fence pointer in a production SSTable: an index block with one entry per data block, each a boundary key pointing to that block.
2. The literal on-disk form of a Bloom filter in a production SSTable: a filter block, one filter per range of blocks.

## RocksDB Terminology (wiki)

URL: https://raw.githubusercontent.com/wiki/facebook/rocksdb/Terminology.md
Version: fetched 2026-10-23

> **Write-Ahead-Log (WAL)** or **log**: A log file used to recover data that is not yet flushed to SST files, during DB recovery.

> **Immutable memtable**: A closed **memtable** that is waiting to be flushed.

> **SST File** (**Data file** / **SST table**): SST stands for Sorted Sequence Table. They are persistent files storing data. In the file keys are usually organized in sorted order so that a key or iterating position can be identified through a binary search.

> **Index** The index on the data blocks in a SST file. It is persisted as an index block in the SST file. The default index format is the binary search index.

> **Sequence number (SeqNum / Seqno)**: each write to the database will be assigned an auto-incremented ID number. The number is attached with the key-value pair in WAL file, memtable, and SST files.

Contents (item by item, this topic's scope):
1. A second, current production engine's own definition of the WAL, confirming its recovery role.
2. The memtable-switch step (closing a full memtable before flush) named explicitly as an "immutable memtable."
3. SST file defined by name, and its index block (fence pointer) named explicitly.
4. The sequence number mechanism that lets a read across multiple runs resolve which write is newest.

## RocksDB Write-Ahead-Log File Format (wiki)

URL: https://raw.githubusercontent.com/wiki/facebook/rocksdb/Write-Ahead-Log-File-Format.md
Version: fetched 2026-10-23

> Write ahead log (WAL) serializes memtable operations to persistent medium as log files. In the event of a failure, WAL files can be used to recover the database to its consistent state, by reconstructing the memtable from the logs.

> When a memtable is flushed out to persistent medium safely, the corresponding WAL log(s) become obsolete and are archived.

Contents (item by item, this topic's scope):
1. The exact crash-recovery mechanism a WAL provides: reconstructing the memtable from the log after a failure.
2. Why a WAL can be discarded once its memtable is safely flushed: the data it protected now lives in a durable SSTable.

## RocksDB Bloom Filter (wiki)

URL: https://raw.githubusercontent.com/wiki/facebook/rocksdb/RocksDB-Bloom-Filter.md
Version: fetched 2026-10-23

> 1.5 bits per key (50% false positive rate) is 50% as effective as 100 bits per key

> 4.9 bits per key (10% false positive rate) is 90% as effective as 100 bits per key

> 9.9 bits per key (1% false positive rate) is 99% as effective as 100 bits per key

> When configured in RocksDB, each SST file is created with a Bloom filter, embedded in the SST file itself.

Contents (item by item, this topic's scope):
1. A real, current production engine's own bits-per-key-to-false-positive-rate table, usable directly as measured numbers.
2. Confirmation that the Bloom filter lives embedded in the SST file itself, one per run, matching the per-SSTable filter this topic teaches.
