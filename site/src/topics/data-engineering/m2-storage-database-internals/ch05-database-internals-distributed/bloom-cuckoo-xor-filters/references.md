Last verified against these sources: 31 October 2026. Real measurements run in this sandbox
(`examples.py`): a Bloom filter built from scratch and sized from a target false-positive rate,
queried against a large batch of genuinely held-out keys, with its measured false-positive rate
checked directly against the sizing formula's own predicted rate.

- Wikipedia, "Bloom filter": [en.wikipedia.org](https://en.wikipedia.org/wiki/Bloom_filter). Substitutes for the unfetchable original 1970 paper; the no-false-negatives guarantee and the real bits-per-key sizing relationship.
- Graf & Lemire, "Xor Filters: Faster and Smaller Than Bloom and Cuckoo Filters": [arxiv.org](https://arxiv.org/pdf/1912.08258). What an xor filter trades (immutability, a known set up front) for being smaller and faster.
- Fan, Andersen, Kaminsky, Mitzenmacher, "Cuckoo Filter: Practically Better Than Bloom": [cs.cmu.edu](https://www.cs.cmu.edu/~dga/papers/cuckoo-conext2014.pdf). What a cuckoo filter adds over a standard filter: real deletes.
- RocksDB wiki, "RocksDB Bloom Filter": [raw.githubusercontent.com](https://raw.githubusercontent.com/wiki/facebook/rocksdb/RocksDB-Bloom-Filter.md). A real, shipped engine's own ribbon-filter build-cost-for-space trade.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=bloom-cuckoo-xor-filters:%20).
