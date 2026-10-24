Last verified: 24 October 2026. Real measurements run in this sandbox (`examples.py`): an
identical insert-then-update-then-read workload against a real Postgres cluster and a real
RocksDB instance via `rocksdict`, measuring write, space and read-latency amplification directly;
the identical shuffled 20,000-key write pattern settled under RocksDB's level and universal
compaction styles; a FIFO-style store written well past a configured size cap; and RocksDB's own
L0 file count read directly against a configured write-stall trigger. The RUM conjecture's
canonical publication page (Harvard STRATOS) could not be fetched (403) and is replaced below by
a course mirror of the same PDF, found via search and verified to carry the identical paper text.

- Athanassoulis, Kester, Maas, Stoica, Idreos, Ailamaki, Callaghan, "Designing Access Methods: The RUM Conjecture" (EDBT 2016): [users.cs.utah.edu](https://users.cs.utah.edu/~pandey/courses/cs6530/fall22/papers/indexdesign/rum.pdf). The precise read/update/memory overhead definitions, their theoretical minimum, and the conjecture itself.
- RocksDB wiki, "RocksDB Compaction": [github.com/facebook/rocksdb/wiki/Compaction](https://github.com/facebook/rocksdb/wiki/Compaction). Classic leveled, tiered (Universal) and FIFO compaction, and L0 as the newest-data level, in the engine's own words.
- RocksDB wiki, "RocksDB Write Stalls": [github.com/facebook/rocksdb/wiki/Write-Stalls](https://github.com/facebook/rocksdb/wiki/Write-Stalls). The two real triggers and RocksDB's own throttled response, measured directly in this topic.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=lsm-compaction-rum-trade:%20).
