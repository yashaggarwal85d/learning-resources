---
id: dsa.merkle-trees
title: Merkle trees
---

<section data-section="outcomes">

## After this topic you can

- Build a Merkle tree over a batch of data and explain why comparing root hashes answers "do these agree" in O(1).
- Find which leaf(ves) differ between two trees in O(log n) by walking down from a root mismatch.
- Name at least two real production uses (anti-entropy repair, Git, certificate transparency) and what each one proves without transferring the whole dataset.
- Explain why content-defined chunking (prolly trees) avoids invalidating every later chunk's hash on a small edit, where fixed-offset chunking would not.

</section>

<section data-section="internals">

## Into the internals

### Why a root hash is as strong as comparing every leaf

A Merkle tree's root is built by hashing pairs of child hashes, recursively, up to one top value — Merkle's own "tree authentication," `H(i,j,Y)` combining two halves of a leaf vector until one `H(1,n,Y)` remains. Because a cryptographic hash makes it practically impossible for two different inputs to produce the same output, any difference in any leaf anywhere must change that leaf's hash, which must change its parent's hash, and so on up to the root. A matching root is therefore not probabilistic evidence — it is the same guarantee as comparing every leaf, for the cost of comparing one number, exactly because the hash function (declared again from topic 16) makes collision-based false confidence impractical.

### Why only one branch is ever worth following down

The walk-down property is the same argument run in reverse: to authenticate one leaf, Merkle's paper shows you only need the hashes on the path from that leaf to the root, not the whole tree. Run that in the other direction — starting from a known root mismatch — and at each level exactly one of the two children's hashes can disagree with what the other tree has; the other child, and everything beneath it, is provably untouched and never worth checking. A tree of n leaves has about log2 n levels, so a mismatch is localized in about log2 n comparisons.

</section>

<section data-section="lab">

## In the lab

`examples.py` builds a real Merkle tree from scratch, changes one leaf, and measures how many hash comparisons a root-to-leaf walk-down takes to find it against a full leaf-by-leaf scan (12 vs. 64, for a 64-leaf tree — exactly 2·log2 64). It also measures how many chunks change their hash after one byte is inserted near the start of a 20,000-byte stream, under fixed-offset chunking versus content-defined chunking, on the identical data.

</section>

<section data-section="production">

## In production

Apache Cassandra's own current documentation names Merkle trees directly as the mechanism behind anti-entropy repair: comparing two replicas' trees over a shared token range finds exactly the out-of-sync sections to stream, without exchanging every key. Git's own object model is a Merkle structure in practice: a tree object's entries are each a hash of a blob or subtree, and a commit stores one tree hash plus its parents' — verified directly from Git's own documentation. RFC 6962 (Certificate Transparency) uses a public, append-only Merkle tree of issued certificates so that a log showing different histories to different people can be caught by comparing root hashes and consistency proofs — all three read from each system's own current, primary source.

</section>

<section data-section="frontier">

## The frontier

Merkle proofs are the same mechanism behind blockchains and other append-only ledgers, proving a transaction belongs to a block without revealing the whole block — named here with no mechanism taught, since the syllabus doesn't name it for this topic.

</section>

<section data-section="questions">

## More questions

- Why must a Merkle tree combine exactly two children per node, rather than, say, four?
- What happens to the walk-down guarantee if two completely different leaves happen to hash to the same value?

</section>

<section data-section="next">

## Where this goes next

Every structure in this chapter answered "where is the key" or "do these two copies agree" by turning data into a number. The next chapter asks a question hashing can't answer at all: keep the keys in order, so you can ask for the smallest, the largest, or everything between two bounds. Binary search trees, next, and the rotations that keep one balanced.

</section>
