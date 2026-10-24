# Sources — LSM write and read paths

## RocksDB Wiki: MemTable
URL: https://raw.githubusercontent.com/wiki/facebook/rocksdb/MemTable.md
Fetched: 2026-10-24, cached at `sources/wiki-memtable.txt`.
> new writes always insert data to memtable, and reads has to query memtable before reading from SST files, because data in memtable is newer.

> Once a memtable is full, it becomes immutable and replaced by a new memtable.

## RocksDB Wiki: Terminology
URL: https://raw.githubusercontent.com/wiki/facebook/rocksdb/Terminology.md
Fetched: 2026-10-24, cached at `sources/wiki-terminology.txt`.
> A closed **memtable** that is waiting to be flushed.

> During this process, the current **active memtable** (the one current writes go to) is closed and turned into an **Immutable memtable**.
