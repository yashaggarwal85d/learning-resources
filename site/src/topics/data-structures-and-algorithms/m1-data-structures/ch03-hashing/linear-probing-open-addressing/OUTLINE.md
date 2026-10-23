# Outline — Linear probing and open addressing

## Learning outcomes

1. Explain primary clustering and state (not re-derive) the shape of Knuth's expected-probe result as α rises.
2. Contrast quadratic probing and double hashing against plain linear probing as two real fixes for clustering.
3. Explain tombstones and backward-shift deletion as two different correct answers to "can you delete from an open-addressed table," and name the cost each one pays.

## Engagement arc

- **Hook (step 1):** topic 17 ended on "chaining pays a pointer per entry" — open addressing gives that pointer up, by keeping every entry in the table itself.
- **Predict (step 3):** "After several insertions under plain linear probing, where does the next colliding key end up?"
- **Surprising number:** the measured probe-count blowup as α → 1 under plain linear probing, next to double hashing staying flat at the same α.
- **Takeaways:** steps 4, 6, 8 (three).
- **Recap (step 8, "Prove it"):** measured average probe counts for linear probing vs. double hashing at three load factors, side by side.

## Steps

### 1 — Opening
- **fig:** `Opening`
- **Visual idea:** the chain from topic 17, its pointers fading out, as every entry slides directly into the array itself — no node, no pointer, just the table.
- **Caption:** chaining pays a pointer per entry. Open addressing gives that up — every entry lives in the table itself.
- **Narrator's line of thought:** "last topic's one real cost was a pointer. This topic's mechanism exists entirely to avoid paying it."

### 2 — ProbeMechanism
- **fig:** `ProbeMechanism`
- **Visual idea:** a single key's insert walking a probe sequence, slot to slot, stopping at the first empty one — the general form h(k,i) = (h′(k) + i) mod m for linear probing specifically.
- **Caption:** "given an ordinary hash function h′(k), linear probing uses the hash function h(k,i) = (h′(k) + i) mod m" — one new idea: when a slot is full, probe the next one.
- **Narrator's line of thought:** names the mechanism directly from the lecture's own words before anything else happens to it.

### 3 — ClusterPredict (predict)
- **fig:** `ClusterPredict`
- **Visual idea:** a table with two short runs of occupied slots already formed under linear probing; a new key about to collide with one of them.
- **Predict options:**
  1. "It lands in whichever run is shorter, since that's faster to search"
  2. **"It very likely lands at the end of one of the runs, making that run longer"** (correct)
  3. "It's equally likely to land anywhere in the empty slots, regardless of the runs"
  4. "It always starts a new run of its own, one slot away from both existing ones"
- **Explain:** any key whose probe sequence enters a run must walk to the run's far end before finding an empty slot — so a collision with a run almost always extends it. Longer runs also catch more future keys, which is exactly how runs merge into longer runs over time.
- **Narrator's line of thought:** "this is primary clustering before I even give it the name — watch your own prediction, next."

### 4 — ClusteringReveal
- **fig:** `ClusteringReveal`
- **Visual idea:** the predicted run growing longer and merging with its neighbor, labelled "primary clustering" directly from the lecture's own words.
- **Caption:** "this method, though simple, suffers from primary clustering, where long runs of occupied slots build up... the long runs of occupied slots tend to get longer."
- **Takeaway:** "Linear probing's own collisions make its runs longer, and longer runs catch even more of the next collisions."
- **Narrator's line of thought:** "the mechanism that made linear probing simple is the same mechanism that makes it get slow — not a separate bug."

### 5 — TwoFixes
- **fig:** `TwoFixes`
- **Visual idea:** the same table under quadratic probing (offsets 1, 4, 9, …, scattering away from the run) beside double hashing (a second hash function sets the step itself, so two keys that start at the same slot diverge immediately) — both drawn against linear probing's merging runs for contrast.
- **Caption:** two real fixes: quadratic probing scatters a collision's probes instead of extending a run; double hashing makes the probe step itself depend on the key, so two colliding keys don't even follow the same path.
- **Narrator's line of thought:** "two different answers to the same problem — watch what each one actually changes about the probe sequence."

### 6 — QuadraticCaveat
- **fig:** `QuadraticCaveat`
- **Visual idea:** quadratic probing's one real caveat, drawn directly: with a prime table size and load factor under one half, the first TableSize/2 probes are guaranteed distinct; past that guarantee, the same cycling-through-the-same-indices failure the source names.
- **Caption:** quadratic probing's guarantee has conditions: a prime table size, and staying under half full. It also still has secondary clustering — two keys that start at the same slot follow the identical sequence after that.
- **Takeaway:** "Quadratic probing's guarantee needs a prime table size and α under one half — and it still clusters by starting slot."
- **Narrator's line of thought:** "I'm not going to let 'quadratic probing fixes clustering' stand without its fine print — this is exactly the honest-caveat pattern this whole project follows."

### 7 — DeletionTwoWays
- **fig:** `DeletionTwoWays`
- **Visual idea:** one deletion shown two ways on the same run: a tombstone left behind (marked, not emptied, probes still pass through it), versus Sedgewick's own `algs4` approach — the entry removed, then every later entry in the same cluster rehashed, one by one, back into place.
- **Caption:** you can't just empty a deleted slot — a later probe sequence passing through would stop early and miss entries placed beyond it. Two real answers: a tombstone that keeps the slot occupied forever until a rehash, or rehashing the rest of the cluster immediately.
- **Takeaway:** "A tombstone keeps a slot occupied forever; rehashing the cluster costs a scan now instead."
- **Narrator's line of thought:** "this is the one correctness subtlety that trips people up — removing an entry can silently break every search that used to pass through it."

### 8 — ProveIt
- **fig:** `ProveIt`
- **Visual idea:** measured average probe counts for linear probing vs. double hashing at three load factors (α ≈ 0.5, 0.75, 0.9), linear probing's bars rising sharply as α → 1, double hashing's staying close to flat.
- **Caption:** three load factors, two real probing strategies, one real measurement each time: linear probing's average probe count climbs fastest as the table fills; double hashing stays close to the uniform-hashing bound at every one.
- **Narrator's line of thought:** recap — "the same three load factors, the mechanism this topic actually built, side by side."

## Post-notes headings (Deep dive)

- `outcomes` — the three learning outcomes above.
- `internals` — Knuth's own displacement-based characterization (d = total displacement, average successful-search cost = 1 + d/n), and how it relates to (but isn't identical to) the uniform-hashing-assumption bound Θ(1/(1-α)) this topic measures directly; the honest distinction between the two sources' analyses.
- `lab` — the syllabus's §3.3 *Lab* bullet, kept in reduced form per `CHAPTER.md`: linear-probing-only probe-length measurement, built directly in `examples.py`.
- `production` — Sedgewick's own `algs4.LinearProbingHashST` as a real, documented, widely-taught production implementation of cluster-rehash deletion.
- `frontier` — Robin Hood hashing and cuckoo hashing, named with no mechanism, as more elaborate probe-sequence designs that trade extra bookkeeping for tighter guarantees — both skipped in the syllabus for this chapter.
- `questions` — "Why does a tombstone-heavy table eventually need a full rehash, even though no single delete forces one?"; "Quadratic probing's guarantee needs TableSize prime. What goes wrong if TableSize is a power of two instead?"
- `next` — the handoff below, word for word.

## Examples to execute (`examples.py`)

1. A from-scratch open-addressed table supporting linear probing and double hashing (shared insert/find API, different probe-step functions), reusing topic 16's real, well-spread hash (Python's `hash()`) as the base hash function(s).
2. At three load factors (α ≈ 0.5, 0.75, 0.9), insert enough random keys to hit that ratio exactly, and measure the average number of probes per successful search under each probing strategy — contrasted directly, same keys, same hash, same table size.
3. A tombstone-based deletion and a cluster-rehash (backward-shift-equivalent) deletion, both built on the same linear-probing table, each verified for correctness: delete an entry from the middle of a run, then confirm every other entry in that run is still findable afterward under each deletion strategy.
4. Every number shown on screen (steps 6, 8) is asserted directly from these runs.

## Bridge and handoff

- **Bridge** (word for word, matching `CHAPTER.md`): "Chaining never runs out of room in a bucket, at the cost of a pointer per entry. Open addressing gives that pointer up — every entry lives in the table itself — and pays for it with a longer search when two keys compete for the same slot."
- **Handoff** (word for word, matching `CHAPTER.md`): "Open addressing keeps every entry in the array itself, one cache line at a time — but still walks a probe sequence one slot at a go. The next scheme tests many candidate slots in a single instruction."

## Concept ledger

- **Introduces:** `open-addressing`, `probe-sequence`, `primary-clustering`, `quadratic-probing`, `double-hashing`, `tombstone`, `backward-shift-deletion`.
- **Uses:** `load-factor`, `collision`, `hash-function`.
- **Declared:** `collision` (topic 17 already introduces it; restated as the thing a probe sequence resolves instead of a chain).

## Claims list (claim → source)

1. Linear probing's mechanism: h(k,i) = (h′(k) + i) mod m. → `SOURCES.md` § MIT 6.046 lecture 7.
2. Primary clustering: runs of occupied slots build up and tend to get longer. → `SOURCES.md` § MIT 6.046 lecture 7.
3. Double hashing's mechanism: h(k,i) = (h1(k) + i·h2(k)) mod m; h2(k) must be relatively prime to m. → `SOURCES.md` § MIT 6.046 lecture 7.
4. A uniform-hashing-assumption bound on expected probes, Θ(1/(1-α)), distinguished honestly from Knuth's own analysis (claim 5) rather than conflated with it. → `SOURCES.md` § MIT 6.046 lecture 7; `FACT-CHECK.md`.
5. Knuth's own expected-probe analysis: total displacement d determines average successful-search cost as 1 + d/n. → `SOURCES.md` § Knuth, "Linear Probing and Graphs."
6. Quadratic probing's one real guarantee: a prime table size and α < 0.5 guarantees the first TableSize/2 probes land on distinct slots. → `SOURCES.md` § UW CSE 332 lecture 10.
7. Quadratic probing's one real weakness: secondary clustering — two keys starting at the same slot follow the identical probe sequence. → `SOURCES.md` § UW CSE 332 lecture 10.
8. Tombstones: a lazy-deletion marker that says "no data here, but don't stop probing." → `SOURCES.md` § UW CSE 332 lecture 10.
9. Backward-shift-equivalent deletion: a real, documented production implementation (Sedgewick's `algs4`) rehashes every entry in the same cluster on delete, rather than leaving a tombstone. → `SOURCES.md` § Sedgewick, `LinearProbingHashST.java`.
10. Every number put on screen (steps 6, 8) is measured directly in `examples.py`, not asserted from the citations alone. → `examples.py`.

## Changes from the chapter plan

The chapter plan's own visual idea (runs merging under linear probing vs. scattered slots under double hashing, a deletion shown both ways) is followed directly. One honest distinction made explicit during research, not smoothed over: the syllabus names "Knuth's expected-probe analysis," and this topic cites Knuth's own paper (displacement d, cost = 1 + d/n) for that attribution specifically, while using the MIT lecture's own, separate uniform-hashing-assumption bound (Θ(1/(1-α))) for the probe-count number `examples.py` actually measures against — the two are related results under different assumptions, not the same derivation, and `FACT-CHECK.md` records why they're kept distinct rather than merged into one citation.
