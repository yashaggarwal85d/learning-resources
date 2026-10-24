Last verified: 24 October 2026. Real measurements run in this sandbox (`examples.py`, against a
real RocksDB instance via `rocksdict`): a single write's path from memtable to a flushed file; a
point read answered by the memtable alone, with zero hits on an older file holding a stale value
for the same key; a merged range scan across a flushed file and an overlapping memtable; five
hundred lookups for keys that don't exist, checked against a real Bloom filter; and five hundred
keys flushed, then half of them deleted and flushed again, measured directly for the file count
and total bytes on disk before and after. The original LSM-tree paper (O'Neil et al., 1996) could
not be fetched — both free mirrors found are currently unreachable (a broken certificate chain on
one, a 404 on the other) — and is replaced below by the Wikipedia article on the structure, which
states the same mechanism and cites the paper directly.

- Wikipedia, "Log-structured merge-tree": [en.wikipedia.org](https://en.wikipedia.org/wiki/Log-structured_merge-tree). The write path, the point-read and range-read paths, tombstones, and the Bloom-filter gate, in the structure's own general terms.
- RocksDB wiki, "RocksDB Overview": [github.com/facebook/rocksdb/wiki/RocksDB-Overview](https://github.com/facebook/rocksdb/wiki/RocksDB-Overview). The memtable/sstfile/logfile constructs, memtable pipelining, and a flush's own inline compaction, in the engine's own words.
- RocksDB wiki, "RocksDB Bloom Filter": [github.com/facebook/rocksdb/wiki/RocksDB-Bloom-Filter](https://github.com/facebook/rocksdb/wiki/RocksDB-Bloom-Filter). The filter's own mechanism and the real statistics counters this topic reads directly.
- RocksDB wiki, "RocksDB BlockBasedTable Format": [github.com/facebook/rocksdb/wiki/Rocksdb-BlockBasedTable-Format](https://github.com/facebook/rocksdb/wiki/Rocksdb-BlockBasedTable-Format). The default SST layout and the index block's own job.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=lsm-trees-write-read:%20).
