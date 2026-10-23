# Fact-check — Merkle trees

Adversarial pass, re-deriving every claim in `OUTLINE.md`'s claims list from the fetched source
texts in `sources/`, never from memory of writing the outline.

## Claims table

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | A Merkle tree's root hash is built by recursively hashing pairs of child hashes up to one top value. | Confirmed | `sources/merkle-certified-signature.txt`: "The method is called tree authentication" and "forms a binary tree of recursive calls," describing `H(i,j,Y)` built recursively from two halves of the leaf vector, up to one `H(1,n,Y)` — "the root of the authentication tree, or R." |
| 2 | A matching root hash guarantees every leaf beneath it matches; finding which leaf differs on a mismatch costs about log n comparisons, walking the one disagreeing path from the root. | Confirmed by construction | `sources/merkle-certified-signature.txt`: "Authenticating a particular leaf Yi in the tree" requires only the values on the path from that leaf to the root — the same property run in reverse (root to leaf) to localize a mismatch. `examples.py` builds a real tree, changes one leaf, and measures exactly how many hashes a root-to-leaf walk checks versus a full scan. |
| 3 | Anti-entropy repair (Cassandra) compares two replicas' Merkle trees over a shared key range to find exactly the out-of-sync sections, without exchanging every key. | Confirmed | `sources/cassandra-repair.txt`: "Repair synchronizes the data between nodes by comparing their respective datasets for their common token ranges, and streaming the differences for any out of sync sections between the nodes. It compares the data with merkle trees, which are a hierarchy of hashes." |
| 4 | Git's own object store is a real hash tree: a tree object's entries are each a hash of a blob or subtree, and a commit stores one tree hash plus its parents' hashes. | Confirmed | `sources/git-objects.txt`: "A single tree object contains one or more entries, each of which is the SHA-1 hash of a blob or subtree with its associated mode, type, and filename," and "To create a commit object, you call commit-tree and specify a single tree SHA-1 and which commit objects, if any, directly preceded it." |
| 5 | Certificate Transparency (RFC 6962) uses a public, append-only Merkle tree of certificates, with mismatches between what a log shows different parties detectable by comparing roots and consistency proofs. | Confirmed, read in full | `sources/rfc6962.txt`: "The append-only property of each log is technically achieved using Merkle Trees... if a log attempts to show different things to different people, this can be efficiently detected by comparing tree roots and consistency proofs," and "Logs use a binary Merkle Hash Tree for efficient auditing." |
| 6 | Content-defined chunking (prolly trees, e.g. Dolt) sets chunk boundaries by a rolling hash crossing a threshold, so a small edit reshapes only the nearby boundary and the path to the root, unlike fixed-offset chunking. | Confirmed | `sources/dolt-prolly-trees.txt`: "Determine Chunk Boundaries: Use a seed, the size of the current chunk, the key value and a strong hash function to calculate whether this current entry represents a new chunk boundary. Any time the hash value is below a target value, form a chunk boundary," and "we walk up the tree recalculating each content address up to the root of the tree." |
| 7 | Every number put on screen (step 9) is measured directly in `examples.py`. | Confirmed by construction | `examples.py` builds a real Merkle tree, measures hashes-checked for a root-to-leaf walk vs. a full scan after one leaf change, and measures chunks-reshaped under fixed-offset vs. content-defined chunking after one small edit — see `examples.py` itself. |

## Red team: the predict questions

**Step 3 (RootMatchPredict).** Distractors tested against the real mechanism:
- "Probably agree — but you'd still want to spot-check a few leaves" — wrong, and tests whether a learner treats a cryptographic hash match as merely probabilistic evidence rather than the real guarantee it is, given a strong hash function; the whole point of the tree is that one comparison is as strong as comparing every leaf.
- "Every single leaf underneath is identical, guaranteed" (correct) — directly what claim 1's propagation argument implies: any leaf difference changes its parent, and that change propagates to the root.
- "Only the top level of the tree agrees" — wrong, and tests whether a learner thinks a root hash only summarizes a shallow slice of the tree rather than every leaf transitively.
- "Nothing — root hashes can match by coincidence too often to trust" — wrong, and tests whether a learner conflates a weak, collision-prone hash with the cryptographic hash this topic assumes (declared from topic 16); with a strong hash, accidental collision is not a practical concern.

**Step 5 (WalkDownPredict).** Distractors tested against the real mechanism:
- "Every leaf — there's no way around checking them all" — wrong, and tests whether a learner forgets the tree structure entirely and falls back to the naive, no-tree comparison this topic replaces.
- "Half the leaves, on average" — wrong, and tests whether a learner assumes some vague large fraction rather than the much smaller, specific count (about log n) the tree's halving structure guarantees.
- "Only the one path from the root down to the differing leaf — about log n hashes" (correct) — directly what the tree's recursive halving structure implies, and what `examples.py` measures directly.
- "Just the one leaf itself, nothing else" — wrong, and tests whether a learner conflates "the leaf is where the difference physically is" with "you can find it by looking at only that leaf," ignoring that you must walk down from the root to locate which leaf that is in the first place.

## Currency notes

- Merkle's paper is read directly from his own personal site, the original 1979 submission, published at Crypto '89; its decades-old two-column PDF text extracts with garbled word order in several sections, so quotes are chosen only from the lines that survive intact (see `SOURCES.md`'s note and `OUTLINE.md`'s "Changes from the chapter plan").
- Cassandra's documentation is fetched from its 4.1 stable, version-pinned docs (the "latest"/"stable" aliased URLs on the docs site returned errors at fetch time; the pinned version is used instead, and is still current, maintained documentation).
- Git's documentation is fetched from the Pro Git book's current edition, Git's own official reference for its internals.
- RFC 6962 is read in full from the IETF datatracker's own hosted text.
- Dolt's documentation is fetched from its current, official docs site.

## Claims not made

- No claim that this topic's own from-scratch measurements (hashes checked, chunks reshaped) match any real production system's own benchmarked performance — they are this topic's own honest measurements of the same mechanisms' real shape.
- No claim about blockchain or other append-only-ledger uses of Merkle proofs beyond naming them in `post-notes.md`'s frontier section — no mechanism is taught, since the syllabus doesn't name this use for this topic.
- No claim about resizing, collisions, or location (topics 16–21's subject) — this topic says once, explicitly, that it leaves that thread behind and asks a different question (agreement, not location), per `CHAPTER.md`'s own instruction.
- No claim that Merkle's 1979 paper itself discusses production anti-entropy repair, Git, certificate transparency, or prolly trees — those are each independently sourced from their own current primary documentation, not attributed to Merkle's own paper.
