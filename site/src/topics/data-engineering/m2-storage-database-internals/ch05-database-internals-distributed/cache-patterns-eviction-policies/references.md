Last verified against these sources: 31 October 2026. Real measurements run in this sandbox
(`examples.py`): a write-behind cache's own loss reproduced by a simulated crash before its queue
drains; a plain LRU cache and a frequency-gated admission policy measured against an identical,
heavily skewed request stream, with their hit rates compared directly.

- Amazon Web Services, "Caching strategies for Memcached": [docs.aws.amazon.com](https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/Strategies.html). Cache-aside's own name and mechanics, and its own stated staleness risk.
- Oracle, Coherence Documentation, "Caching Data Sources": [docs.oracle.com](https://docs.oracle.com/en/middleware/standalone/coherence/14.1.1.2206/develop-applications/caching-data-sources.html). Read-through, write-through and write-behind, defined by a real cache product, including write-behind's own named system-of-record risk.
- Caffeine project wiki, "Efficiency": [raw.githubusercontent.com](https://raw.githubusercontent.com/wiki/ben-manes/caffeine/Efficiency.md). W-TinyLFU as a combined admission-plus-eviction policy, the real-product precedent for this topic's own measured comparison.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=cache-patterns-eviction-policies:%20).
