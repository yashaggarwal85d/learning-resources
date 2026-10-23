---
id: dsa.linear-probing-open-addressing
title: Linear probing and open addressing
---

<section data-section="outcomes">

## After this topic you can

- Explain primary clustering and state the shape of Knuth's expected-probe result as α rises, without re-deriving it.
- Contrast quadratic probing and double hashing against plain linear probing as two real fixes for clustering, each with its own trade-off.
- Explain tombstones and backward-shift (cluster-rehash) deletion as two different correct answers to "can you delete from an open-addressed table," and name the cost each one pays.

</section>

<section data-section="internals">

## Into the internals

### Two related, but distinct, expected-probe results

The syllabus names "Knuth's expected-probe analysis" specifically. Knuth's own paper, "Linear Probing and Graphs," characterizes the cost through total displacement: if item k lands q<sub>k</sub> slots from its hash address h<sub>k</sub>, the total displacement d = Σ(q<sub>k</sub> − h<sub>k</sub>) mod m determines the average successful-search cost directly, as 1 + d/n, in the paper's own words. This topic's `examples.py` measures a related but separate quantity instead: the average number of probes per successful search under a uniform-hashing assumption, the same assumption the MIT lecture's own Θ(1/(1-α)) bound rests on. The two results come from different models (Knuth's exact combinatorics of displacement vs. the lecture's simpler uniform-hashing argument) and are kept honestly distinct in `FACT-CHECK.md` rather than treated as one citation.

### Why quadratic probing's guarantee has fine print

Quadratic probing's own guarantee — the first m/2 probes land on distinct slots, so an empty one is always found under half load — only holds when the table size m is prime. The cited source's own proof uses the fact that, for a prime m, (c + i²) mod m and (c + j²) mod m differ whenever 0 ≤ i, j ≤ m/2 and i ≠ j; that property breaks down for a non-prime m, where quadratic probing can cycle through far fewer than m distinct slots.

### Why a tombstone and cluster-rehash deletion cost different things

A tombstone never shrinks: every delete leaves one more slot permanently unavailable for a fresh insert's early probes (though it can still be overwritten by a new insert that reaches it), until a rehash reclaims the table. Cluster-rehash deletion (the real, production shape this topic grounds in Sedgewick's own `algs4` source) pays instead with a bounded extra scan at delete time — walking the rest of the run and reinserting each entry — but the table's true occupied-slot count drops immediately, with no permanent loss.

</section>

<section data-section="lab">

## In the lab

The syllabus's §3.3 *Lab* bullet ("implement linear-probing… tables; measure probe-length distributions and throughput vs load factor") is kept in reduced form here, per `CHAPTER.md`: this topic's `examples.py` measures linear probing's and double hashing's average probe counts head to head at three load factors, on the same keys and the same table.

</section>

<section data-section="production">

## In production

Sedgewick's own `algs4.LinearProbingHashST` — companion code to *Algorithms, 4th Edition*, still published and taught — is the real production example this topic leans on for deletion: no tombstone at all, just an immediate rehash of the rest of the cluster on every delete. Treat the choice between a tombstone and cluster-rehash deletion as a real trade-off a real system has to make, not an academic footnote: a table that deletes rarely can afford a tombstone's permanent cost; a table that deletes often cannot.

</section>

<section data-section="frontier">

## The frontier

Robin Hood hashing and cuckoo hashing are more elaborate probe-sequence designs that trade extra bookkeeping (tracking how far an entry has been displaced, or maintaining two possible slots per key) for tighter worst-case guarantees than plain linear probing, quadratic probing, or double hashing offer on their own. This syllabus's own Chapter 3 plan marks both *(skipped)* for this run; they are named here with no mechanism taught.

</section>

<section data-section="questions">

## More questions

- Why does a tombstone-heavy table eventually need a full rehash, even though no single delete forces one?
- Quadratic probing's guarantee needs TableSize prime. What goes wrong if TableSize is a power of two instead?

</section>

<section data-section="next">

## Where this goes next

Open addressing keeps every entry in the array itself, one cache line at a time — but still walks a probe sequence one slot at a go. The next scheme tests many candidate slots in a single instruction.

</section>
