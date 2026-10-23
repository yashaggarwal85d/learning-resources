# Fact-check — Linear probing and open addressing

Adversarial pass, re-deriving every claim in `OUTLINE.md`'s claims list from the fetched source
texts in `sources/`, never from memory of writing the outline.

## Claims table

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | Linear probing's mechanism: h(k,i) = (h′(k) + i) mod m. | Confirmed | `sources/mit-6046-lec7.txt`: "Given an ordinary hash function h′(k), linear probing uses the hash function h(k,i) = (h′(k) + i) mod m." |
| 2 | Primary clustering: runs of occupied slots build up and tend to get longer. | Confirmed | `sources/mit-6046-lec7.txt`: "This method, though simple, suffers from primary clustering, where long runs of occupied slots build up, increasing the average search time. Moreover, the long runs of occupied slots tend to get longer." |
| 3 | Double hashing's mechanism: h(k,i) = (h1(k) + i·h2(k)) mod m; h2(k) must be relatively prime to m. | Confirmed | `sources/mit-6046-lec7.txt`: "Given two ordinary hash functions h1(k) and h2(k), double hashing uses the hash function h(k,i) = (h1(k) + i⋅ h2(k)) mod m." / "This method generally produces excellent results, but h2(k) must be relatively prime to m." |
| 4 | A uniform-hashing-assumption bound on expected probes, Θ(1/(1-α)), kept distinct from Knuth's own analysis. | Confirmed, and the distinction is the point | `sources/mit-6046-lec7.txt`: "Theorem. Given an open-addressed hash table with load factor α = n/m < 1, the expected number of probes in an unsuccessful search is at most 1/(1–α)." This is the lecture's own derivation under its own stated "assumption of uniform hashing" (each key equally likely to have any of the m! permutations as its probe sequence) — a different, simpler assumption from Knuth's exact combinatorial model in claim 5. Conflating the two into one "Knuth's result" citation would misattribute a result Knuth's cited paper doesn't contain in this form. |
| 5 | Knuth's own expected-probe analysis: total displacement d determines average successful-search cost as 1 + d/n. | Confirmed | `sources/knuth-linear-probing.txt`: "The average number of probes needed in a successful search is then 1 + d/n." (d is defined earlier in the paper as the total displacement of items from their hash addresses.) |
| 6 | Quadratic probing's one real guarantee: a prime table size and α < 0.5 guarantees the first TableSize/2 probes land on distinct slots. | Confirmed | `sources/uw-cse332-lec10.txt`: "That is, if TableSize is prime, the first TableSize/2 quadratic probes map to different locations (and one of those will be empty if the table is < half full)." |
| 7 | Quadratic probing's one real weakness: secondary clustering — two keys starting at the same slot follow the identical probe sequence. | Confirmed | `sources/uw-cse332-lec10.txt`: "Any 2 keys that initially hash to the same index will have the same series of moves after that looking for any empty spot" / "Called secondary clustering". |
| 8 | Tombstones: a lazy-deletion marker that says "no data here, but don't stop probing." | Confirmed | `sources/uw-cse332-lec10.txt`: "Must use "lazy" deletion. Why?" / "Marker indicates "no data here, but don't stop probing"". |
| 9 | Backward-shift-equivalent deletion: a real, documented production implementation rehashes every entry in the same cluster on delete, rather than leaving a tombstone. | Confirmed | `sources/algs4-linearprobinghashst.txt`: the `delete` method's own comments, "rehash all keys in same cluster" and "delete keys[i] and vals[i] and reinsert", immediately followed by a real `put(keyToRehash, valToRehash)` call in the fetched source. |
| 10 | Every number put on screen (steps 6, 8) is measured directly in `examples.py`. | Confirmed by construction | `examples.py` builds real linear-probing and double-hashing tables, inserts real random keys at three real load factors, and measures the real average probe count per strategy — see `examples.py` itself. |

## Red team: the predict question

**Step 3 (ClusterPredict).** Distractors tested against the real mechanism:
- "It lands in whichever run is shorter, since that's faster to search" — wrong, and tests whether a learner imagines linear probing has any lookahead or choice at all; it doesn't — the probe sequence is fixed by the hash and the slot, not chosen for speed.
- "It very likely lands at the end of one of the runs, making that run longer" (correct) — directly what the MIT lecture's primary-clustering claim states, and what step 4 shows happening.
- "It's equally likely to land anywhere in the empty slots, regardless of the runs" — wrong, and tests the single most common misconception about linear probing: that because the *hash* is uniform, the *landing slot after probing* stays uniform too. It doesn't, once runs exist — a key hashing anywhere inside a run is funneled to the run's end.
- "It always starts a new run of its own, one slot away from both existing ones" — wrong, and tests whether a learner conflates linear probing's deterministic +1 step with some kind of spacing-out behavior; nothing about the mechanism spaces anything out, which is exactly the problem quadratic probing and double hashing exist to fix.

## Currency notes

- Knuth's "Linear Probing and Graphs" (1998) is dedicated to Philippe Flajolet and explicitly responds to an open exercise in Sedgewick and Flajolet's 1996 book — this topic cites only the paper's own opening characterization (d, and 1 + d/n), not its generating-function solution to the harder open problem, which is out of this topic's scope.
- The UW CSE 332 lecture (Summer 2025) is a current, dated course offering, not an archived historical source — its quadratic-probing guarantee and secondary-clustering naming match the same claims found in older, more widely cited lecture notes (MIT, Princeton), so this isn't a claim resting on one recent, unreviewed source alone.
- Sedgewick's `algs4.LinearProbingHashST` is a real, currently published, widely taught implementation (companion code to *Algorithms, 4th Edition*) — not a toy or a paraphrase of how cluster-rehash deletion works.

## Claims not made

- No claim that this topic's from-scratch linear-probing/double-hashing tables match any real production table's exact benchmarked performance — the measured probe-count comparison is this topic's own honest measurement under Python's real `hash()`, not a claim about a specific production system's numbers.
- No claim that quadratic probing or double hashing is universally "better" — `post-notes.md` and step 5's framing present both as real fixes for primary clustering with their own trade-offs (quadratic probing's table-size/load-factor conditions and secondary clustering; double hashing's extra hash-function cost), matching the chapter's own no-ranking stance used in topics 16 and 17.
- No claim that tombstones and backward-shift (cluster-rehash) deletion are equivalent in cost — `OUTLINE.md`'s claims list and step 7's takeaway name the real difference: a tombstone keeps a slot occupied forever until a rehash; cluster-rehash pays a bounded extra scan immediately instead.
- No claim about Robin Hood hashing's or cuckoo hashing's own probe-sequence designs beyond naming them in `post-notes.md`'s frontier section — both are marked *(skipped)* in the syllabus for this chapter.
