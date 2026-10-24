# Sources — Bloom filters and their successors

## RocksDB Wiki: RocksDB Bloom Filter
URL: https://raw.githubusercontent.com/wiki/facebook/rocksdb/RocksDB-Bloom-Filter.md
Fetched: 2026-10-24, cached at `sources/wiki-bloom.txt`.
> This generates filters using about 10 bits of space per key, which works well for many workloads, though the bits per key is continuously configurable from 1 to 20 or more.

> 9.9 bits per key (1% false positive rate) is 99% as effective as 100 bits per key

## RocksDB Wiki: Basic Operations
URL: https://raw.githubusercontent.com/wiki/facebook/rocksdb/Basic-Operations.md
Fetched: 2026-10-24, cached at `sources/wiki-basic-operations.txt`.
> The optional FilterPolicy mechanism can be used to reduce the number of disk reads substantially.

> This filter will reduce the number of unnecessary disk reads needed for Get() calls by a factor of approximately a 100.
