# Sources — Linear probing and open addressing

## MIT 6.046J/18.410J Introduction to Algorithms, Fall 2005, Lecture 7 (Demaine & Leiserson)

URL: https://www.ocw.mit.edu/courses/6-046j-introduction-to-algorithms-sma-5503-fall-2005/ce6ea57dd298c8e64609802daf2eaaec_lec7.pdf
Version: Fall 2005 lecture slides (MIT OpenCourseWare), fetched 2026-10-23

> Given an ordinary hash function h′(k), linear
probing uses the hash function
h(k,i) = (h′(k) + i) mod m.

> This method, though simple, suffers from primary
clustering, where long runs of occupied slots build
up, increasing the average search time. Moreover,
the long runs of occupied slots tend to get longer.

> Given two ordinary hash functions h1(k) and h2(k),
double hashing uses the hash function
h(k,i) = (h1(k) + i⋅ h2(k)) mod m.

> This method generally produces excellent results,
but h2(k) must be relatively prime to m.

> Theorem. Given an open-addressed hash
table with load factor α = n/m < 1, the
expected number of probes in an unsuccessful
search is at most 1/(1–α).

Contents:
- Linear probing's own mechanism, h(k,i) = (h′(k) + i) mod m, and its named failure mode, primary clustering, stated in the lecture's own words — runs build up and tend to get longer, exactly the mechanism this topic's step 2 teaches.
- Double hashing's own mechanism, h(k,i) = (h1(k) + i·h2(k)) mod m, and its one real caveat (h2(k) must be relatively prime to m) — this topic contrasts it against linear probing on the same picture.
- A rigorous bound on the expected number of probes under open addressing, Θ(1/(1-α)), cited as a comparable uniform-hashing analysis to Knuth's own (see below) rather than Knuth's own result itself.

## Donald E. Knuth, "Linear Probing and Graphs" (Algorithmica 22, 1998)

URL: https://arxiv.org/pdf/cs/9801103
Version: arXiv:cs/9801103v1, submitted 1998-01-15, fetched 2026-10-23

> The well-known algorithm of linear probing for n items in m > n cells can be described as
follows: Begin with all cells (0, 1, . . . , m − 1) empty; then for 1 ≤ k ≤ n, insert the kth item into the

> The average number of probes needed in a
successful search is then 1 + d/n.

> Our goal in the following is to study the probability distribution
of d as a function of the table size m and the number of items n.

Contents:
- Knuth's own description of linear probing, and his own characterization of the quantity this topic names: total displacement d (how far, in total, items land from their hash addresses) determines the average successful-search cost directly, as 1 + d/n — Knuth's own expected-probe analysis, named in the syllabus, cited from his own paper rather than a secondary summary.
- This paper's goal (studying the distribution of d) is honestly scoped in `FACT-CHECK.md` as deeper probability theory this topic doesn't re-derive — this topic cites the d = 1 + d/n relationship, not the paper's generating-function machinery.

## CSE 332: Data Structures & Parallelism, Lecture 10 "More Hashing" (University of Washington, Summer 2025)

URL: https://courses.cs.washington.edu/courses/cse332/25su/lecture/10_Hashing_2.pdf
Version: Summer 2025 lecture slides, fetched 2026-10-23

> It turns out linear probing is a bad idea, even though the probe
function is quick to compute (a good thing)

> Must use “lazy” deletion. Why?

> Marker indicates “no data here, but don’t stop probing”

> That is, if TableSize is prime, the first TableSize/2 quadratic probes
map to different locations (and one of those will be empty if the table
is < half full).

> Any 2 keys that initially hash to the same index will have the
same series of moves after that looking for any empty spot

> Called secondary clustering

> Idea: Given two good hash functions h and g, and two different keys k1
and k2, it is very unlikely that: h(k1)==h(k2) and g(k1)==g(k2)

Contents:
- The tombstone mechanism's own rationale, in the lecture's own words: a lazy-deletion marker that says "no data here, but don't stop probing" — one of this topic's two named deletion answers.
- Quadratic probing's one real correctness caveat: a prime table size and load factor under one half guarantees the first TableSize/2 probes land on distinct slots, so an empty one is always found — the exact caveat `CHAPTER.md` names for this topic.
- Secondary clustering, named directly: two keys that start probing at the same slot follow the identical probe sequence after that under quadratic probing — the one weakness quadratic probing doesn't fix, which double hashing's key-dependent step does.

## Robert Sedgewick, `LinearProbingHashST.java` (Princeton `algs4` library)

URL: https://algs4.cs.princeton.edu/code/edu/princeton/cs/algs4/LinearProbingHashST.java
Version: `algs4.cs.princeton.edu` source, fetched 2026-10-23

> The expected time per put, contains, or remove
operation is constant, subject to the uniform hashing assumption.

> rehash all keys in same cluster

> delete keys[i] and vals[i] and reinsert

Contents:
- A real, documented, widely-taught production implementation of open addressing's other deletion answer: rather than a tombstone, `delete` shifts the correctness burden onto a full rehash of every entry in the same cluster, removing and reinserting each one — the mechanism this topic's backward-shift-deletion claim is grounded in, verified against real source rather than described from memory.
- The class's own stated time bound (constant, "subject to the uniform hashing assumption") matches the same assumption this topic's other two sources make explicit.
