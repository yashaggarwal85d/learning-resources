Last verified against these sources: 31 October 2026. Real measurements run in this sandbox
(`examples.py`): the delete-after-write race reproduced with and without a lease; single-flight
coalescing measured against an unprotected baseline under many concurrent readers; probabilistic
early expiration's refresh chance measured rising as a key nears its TTL.

- Nishtala, R. et al., "Scaling Memcache at Facebook": [usenix.org](https://www.usenix.org/system/files/conference/nsdi13/nsdi13-final170.pdf). Delete-not-update, leases, and CDC-driven invalidation (mcsqueal), in the engine's own words.
- Bronson, N. et al., "TAO: Facebook's Distributed Data Store for the Social Graph": [usenix.org](https://www.usenix.org/system/files/conference/atc13/atc13-bronson.pdf). The per-field "critical read" staleness case study.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=cache-consistency-invalidation:%20).
