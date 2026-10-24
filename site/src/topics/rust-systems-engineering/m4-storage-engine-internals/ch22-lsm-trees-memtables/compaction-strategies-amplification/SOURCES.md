# Sources — Compaction strategies and amplification

## RocksDB Wiki: Leveled Compaction
URL: https://raw.githubusercontent.com/wiki/facebook/rocksdb/Leveled-Compaction.md
Fetched: 2026-10-24, cached at `sources/wiki-leveled.txt`.
> This sacrifices write amplification by one but may significantly improve read amplification in L0 and in turn increase the capability RocksDB can hold data in L0.

## RocksDB Wiki: Universal Compaction
URL: https://raw.githubusercontent.com/wiki/facebook/rocksdb/Universal-Compaction.md
Fetched: 2026-10-24, cached at `sources/wiki-universal.txt`.
> Universal Compaction Style is a compaction style, targeting the use cases requiring lower write amplification, trading off read amplification and space amplification.

> It is generally regarded that the second strategy provides far better write amplification with worse read amplification

## RocksDB Wiki: Write Stalls
URL: https://raw.githubusercontent.com/wiki/facebook/rocksdb/Write-Stalls.md
Fetched: 2026-10-24, cached at `sources/wiki-write-stalls.txt`.
> RocksDB has extensive system to slow down writes when flush or compaction can't keep up with the incoming write rate.
