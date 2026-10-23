# Sources — Merkle trees

## Ralph C. Merkle, "A Certified Digital Signature" (submitted to CACM 1979, published Crypto '89, p.218)

URL: https://www.ralphmerkle.com/papers/Certified1979.pdf
Version: the paper's own PDF, hosted on the author's own site, fetched 2026-10-23

> Unfortunately, such a protocol would not work.

> The method is called tree authentication

> Authenticating a particular leaf Yi in the tree

> forms a binary tree of recursive calls.

> the root of the authentication tree, or R.

Contents:
- Merkle's own original description of "tree authentication": a function `H(i,j,Y)` built by recursively combining two halves of a vector of values, whose computation forms a binary tree, with a single top value (the root) authenticating every value beneath it.
- The original statement that authenticating one leaf requires only the values on the path from that leaf up to the root, not the whole tree — the exact O(log n) proof property this topic teaches.
- This PDF's text extraction is heavily garbled in its two-column, decades-old typeset sections (word order and hyphenation break across lines); quotes above are chosen as single, intact lines that survive that garbling cleanly, per the same practice used for topic 18's Knuth paper and topic 21's Karger paper in this chapter.

## Apache Cassandra, "Repair" operations documentation (4.1 stable docs)

URL: https://cassandra.apache.org/doc/4.1/cassandra/operating/repair.html
Version: Cassandra 4.1 stable documentation, fetched 2026-10-23

> Repair synchronizes the data between nodes by comparing their respective datasets for their common token ranges, and streaming the differences for any out of sync sections between the nodes. It compares the data with merkle trees, which are a hierarchy of hashes.

Contents:
- A real, current, production system's own description of anti-entropy repair: comparing two replicas' Merkle trees over their shared token range finds exactly the out-of-sync sections, which are then streamed, without comparing or exchanging every key.

## Scott Chacon and Ben Straub, "Git Internals — Git Objects" (Pro Git, current Git Book)

URL: https://git-scm.com/book/en/v2/Git-Internals-Git-Objects
Version: Git's own official book, current edition, fetched 2026-10-23

> A single tree object contains one or more entries, each of which is the SHA-1 hash of a blob or subtree with its associated mode, type, and filename.

> To create a commit object, you call commit-tree and specify a single tree SHA-1 and which commit objects, if any, directly preceded it.

Contents:
- Git's own documentation of its object model: a tree object's entries are each a hash of a blob or another tree, and a commit object stores a single tree hash plus its parent commit hashes — the hash-tree (commit → tree → blob) structure this topic cites as a real, everyday Merkle structure.

## IETF RFC 6962, "Certificate Transparency"

URL: https://datatracker.ietf.org/doc/html/rfc6962
Version: RFC 6962, fetched 2026-10-23

> The append-only property of each log is technically achieved using Merkle Trees, which can be used to show that any particular version of the log is a superset of any particular previous version. Likewise, Merkle Trees avoid the need to blindly trust logs: if a log attempts to show different things to different people, this can be efficiently detected by comparing tree roots and consistency proofs.

> Logs use a binary Merkle Hash Tree for efficient auditing.

Contents:
- The real, standardized use of a Merkle tree as a public, append-only, untrusted log of issued certificates: anyone can verify a certificate was logged, and a log that tries to show different histories to different people can be caught by comparing root hashes and consistency proofs, without downloading the whole log.

## Dolt documentation, "Prolly Tree"

URL: https://www.dolthub.com/docs/architecture/storage-engine/prolly-tree/
Version: Dolt's current documentation, fetched 2026-10-23

> Determine Chunk Boundaries: Use a seed, the size of the current chunk, the key value and a strong hash function to calculate whether this current entry represents a new chunk boundary. Any time the hash value is below a target value, form a chunk boundary and start a new block.

> If the computed hash values for the keys, combined with the size of chunk at those keys, happens to choose a different chunk boundary, the chunk will be split at the new boundary. Finally, we walk up the tree recalculating each content address up to the root of the tree.

Contents:
- A real, current production system's own description of a content-defined-chunking variant of a Merkle tree: chunk boundaries are set by a rolling hash crossing a threshold, based on the data's own content, rather than a fixed byte offset — so an edit near the start of the data only reshapes the one chunk boundary near it and the path to the root, not every later chunk's hash the way fixed-offset chunking would.
