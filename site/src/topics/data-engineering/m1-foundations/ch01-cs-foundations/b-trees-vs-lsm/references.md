Last verified: 2026-10-13.

- R. Bayer and E. McCreight, "Organization and Maintenance of Large Ordered Indexes", *Acta Informatica* 1(3), 1972. [doi:10.1007/BF00288683](https://doi.org/10.1007/BF00288683)
- D. Comer, "The Ubiquitous B-Tree", *ACM Computing Surveys* 11(2), 1979. [doi:10.1145/356770.356776](https://doi.org/10.1145/356770.356776)
- P. O'Neil, E. Cheng, D. Gawlick and E. O'Neil, "The Log-Structured Merge-Tree (LSM-Tree)", *Acta Informatica* 33(4), 1996. [doi:10.1007/s002360050048](https://doi.org/10.1007/s002360050048)
- M. Athanassoulis, M. S. Kester, L. M. Maas, R. Stoica, S. Idreos, A. Ailamaki and M. Callaghan, "Designing Access Methods: The RUM Conjecture", EDBT 2016. [doi:10.5441/002/edbt.2016.42](https://doi.org/10.5441/002/edbt.2016.42)
- P. Lehman and S. B. Yao, "Efficient Locking for Concurrent Operations on B-Trees", *ACM TODS* 6(4), 1981. [doi:10.1145/319628.319663](https://doi.org/10.1145/319628.319663)
- PostgreSQL 18 documentation, "B-Tree Indexes" (implementation, deduplication, bottom-up deletion). [postgresql.org/docs/18/btree.html](https://www.postgresql.org/docs/18/btree.html)
- PostgreSQL source (REL_18_STABLE), `src/backend/access/nbtree/README` (the Lehman–Yao right-link and high-key design). [GitHub](https://github.com/postgres/postgres/blob/REL_18_STABLE/src/backend/access/nbtree/README)
- PostgreSQL 18 documentation, `pageinspect` (`bt_metap`). [postgresql.org/docs/18/pageinspect.html](https://www.postgresql.org/docs/18/pageinspect.html)
- RocksDB wiki, "Leveled Compaction" (levels as sorted runs, L0 overlap, `max_bytes_for_level_multiplier` = 10). [github.com/facebook/rocksdb/wiki/Leveled-Compaction](https://github.com/facebook/rocksdb/wiki/Leveled-Compaction)
- RocksDB wiki, "RocksDB Tuning Guide" (definitions of write/read/space amplification; the leveled ≈ 1 + 2 + 10 + 10 + 10 ≈ 33 and ≈ 1.14 space-amplification worked examples; Bloom filter default 10 bits/key ≈ 1% false positive; universal compaction's temporary space doubling). [github.com/facebook/rocksdb/wiki/RocksDB-Tuning-Guide](https://github.com/facebook/rocksdb/wiki/RocksDB-Tuning-Guide)

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=btree-vs-lsm-at-a-glance:%20).
