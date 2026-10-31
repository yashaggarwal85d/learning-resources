# Sources: Bloom, cuckoo and xor filters (`de.bloom-cuckoo-xor-filters`)

The original Bloom filter paper (Bloom, 1970, "Space/Time Trade-offs in Hash Coding with Allowable Errors," Communications of the ACM 13(7)) could not be fetched: the ACM Digital Library copy is paywalled (DOI 10.1145/362686.362692), and the USPTO scan hosted as a patent-petition exhibit returns a blocked request from this sandbox. Per the research rule (and the precedent already set by `de.lsm-trees-write-read`, topic 8, substituting Wikipedia for its own unfetchable original paper), it is replaced here by the Wikipedia article on the structure, which states the same no-false-negatives/space-time mechanism and cites the original paper directly. The cuckoo filter paper (Fan, Andersen, Kaminsky, Mitzenmacher, CoNEXT '14) and the xor filter paper (Graf & Lemire, J. Exp. Algorithmics 2020) are both fetched directly from their author-hosted PDFs, and RocksDB's own wiki documents the ribbon-filter trade-off it ships.

## Bloom filter (Wikipedia)

URL: https://en.wikipedia.org/wiki/Bloom_filter
Version: retrieved 2026-10-31

> In computing, a Bloom filter is a space-efficient probabilistic data structure, conceived by Burton Howard Bloom in 1970, that is used to test whether an element is a member of a set. False positive matches are possible, but false negatives are not – in other words, a query returns either "possibly in set" or "definitely not in set".

> More generally, fewer than 10 bits per element are required for a 1% false positive probability, independent of the size or number of elements in the set.

Contents: the core guarantee (approximate membership, false positives possible, false negatives never) and the real sizing relationship between bits-per-key and target false-positive rate this topic's own example measures a real instance of.

## Xor Filters: Faster and Smaller Than Bloom and Cuckoo Filters (Graf & Lemire)

URL: https://arxiv.org/pdf/1912.08258
Version: v3, 27 Jan 2020 (Journal of Experimental Algorithmics 25(1), DOI 10.1145/3376122)

> can be faster than Bloom and cuckoo filters while using less memory. We further show that a more compact

> If we use k = 8 bits, the regular xor filter needs 8 × 1.23 = 9.84 bits
per entry, which we can compress in this way to 8 + 1.23 = 9.23 bits per entry.

> While an xor filter is immutable, we believe that it is not a limitation for many important
applications; competitive alternatives all have limited mutability in any case.

Contents: xor filters trade a one-time, more expensive construction (the whole set must be known up front, and the filter cannot be modified afterward) for both speed and a smaller footprint than a Bloom or cuckoo filter at the same false-positive rate — the build-cost-for-space trade-off this topic's own scope line names.

## Cuckoo Filter: Practically Better Than Bloom (Fan, Andersen, Kaminsky, Mitzenmacher)

URL: https://www.cs.cmu.edu/~dga/papers/cuckoo-conext2014.pdf
Version: CoNEXT '14

> However, they do not permit deletion of items from the set,

> Standard Bloom filters cannot delete, thus removing a single item requires rebuilding the entire filter, while counting

> are like counting Bloom filters that can delete inserted items

Contents: the one capability a standard Bloom filter structurally cannot offer (deleting a single inserted item without rebuilding the whole filter) and the one a cuckoo filter adds (deleting a fingerprint directly) — the cuckoo-adds-deletes half of this topic's own scope line.

## RocksDB Bloom Filter (RocksDB wiki)

URL: https://raw.githubusercontent.com/wiki/facebook/rocksdb/RocksDB-Bloom-Filter.md
Version: retrieved 2026-10-31 (GitHub wiki, facebook/rocksdb)

> 9.9 bits per key (1% false positive rate) is 99% as effective as 100 bits per key

> A new Bloom filter alternative is available as a drop-in replacement (since version 6.15.0), saving about 30% of Bloom filter space (most importantly, memory) but using about 3-4x as much CPU on filters.

> There is higher temporary (untracked) memory use during construction of each Ribbon filter compared to Bloom filters (~231 bits per key vs. ~74 bits per key), but only ~50 filters (SST files or partitions) are needed to recoup this extra memory with savings from constructed filters. Ribbon filter construction could also slow peak write rates in some cases.

Contents: the diminishing-returns shape of bits-per-key sizing (most of the benefit of a much larger filter is already captured near 10 bits per key), and a real engine's own documented ribbon-filter trade-off (less space, more construction CPU and temporary memory) — the "ribbon filters (RocksDB) trading build cost for space" half of this topic's own scope line.
