Last verified: 31 October 2026. Every number on screen is executed and asserted directly
(`examples.py`, pure Python, no external library installed in this sandbox): a 1000-row sorted and
shuffled dataset, hand-rolled row-group and page statistics, a real split-block Bloom filter built
to the specification's own pseudocode, and a reproduced truncated-statistics skipping bug.

- Apache Parquet Format, `parquet.thrift`: [github.com](https://github.com/apache/parquet-format/blob/master/src/main/thrift/parquet.thrift). `master` branch, fetched 2026-10-31. The `Statistics` struct (min/max/null_count), and the exact truncated-bound example this topic's own bug reproduces.
- Parquet Page Index (`PageIndex.md`): [github.com](https://github.com/apache/parquet-format/blob/master/PageIndex.md). `master` branch, fetched 2026-10-31. The ColumnIndex/OffsetIndex design and why sort order decides whether a page index can binary-search or only scan.
- Parquet Bloom Filter (`BloomFilter.md`): [github.com](https://github.com/apache/parquet-format/blob/master/BloomFilter.md). `master` branch, fetched 2026-10-31. The split-block Bloom filter's exact block/mask/filter_insert/filter_check algorithm and its own worked false-positive-rate example.

Expert sign-off: pending.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=data-skipping-statistics-page:%20).
