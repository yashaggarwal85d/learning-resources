Last verified: 2026-10-23. Expert sign-off: pending.

- Ralph C. Merkle, "A Certified Digital Signature" (submitted to CACM 1979, published Crypto '89, p.218) — the original "tree authentication" mechanism: a hash built recursively from two halves of a vector, up to one root, authenticating any one leaf from only the path to the root. [source](https://www.ralphmerkle.com/papers/Certified1979.pdf)
- Apache Cassandra, "Repair" documentation (4.1 stable docs) — anti-entropy repair comparing two replicas' Merkle trees over a shared token range to find exactly the out-of-sync sections. [source](https://cassandra.apache.org/doc/4.1/cassandra/operating/repair.html)
- Scott Chacon and Ben Straub, "Git Internals — Git Objects" (Pro Git, current edition) — Git's own object model (commit, tree, blob, each referenced by hash) as a real, everyday Merkle structure. [source](https://git-scm.com/book/en/v2/Git-Internals-Git-Objects)
- IETF RFC 6962, "Certificate Transparency" — a public, append-only Merkle tree of certificates, with audit and consistency proofs that catch a log showing different histories to different people. [source](https://datatracker.ietf.org/doc/html/rfc6962)
- Dolt documentation, "Prolly Tree" — content-defined chunking: chunk boundaries set by a rolling hash crossing a threshold, rather than a fixed byte offset. [source](https://www.dolthub.com/docs/architecture/storage-engine/prolly-tree/)

Canonical numbers (hashes checked to find one changed leaf by a root-to-leaf walk versus a full
scan, and how many chunks change their hash after one small edit under fixed-offset versus
content-defined chunking) are computed and asserted directly in this topic's `examples.py`, on this
machine, in one run.

Related tracks (see Prerequisites): topic 16 (Practical hash functions and HashDoS) for the
cryptographic hash this topic's root-hash guarantee depends on; topic 21 (Consistent hashing
rings) for the contrast this topic opens with, locating data versus verifying it.

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=merkle-trees:%20).
