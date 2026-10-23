# Fact-check — Separate chaining

Adversarial pass, re-deriving every claim in `OUTLINE.md`'s claims list from the fetched source
texts in `sources/`, never from memory of writing the outline.

## Claims table

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | Chaining links records in the same slot into a list. | Confirmed | `sources/mit-6046-lec7.txt`: "Link records in the same slot into a list." |
| 2 | Worst case: every key hashes to the same slot, access time Θ(n). | Confirmed | `sources/mit-6046-lec7.txt`: "Every key... hashes to the... same slot." / "Access time = Θ(n) if \|S\| = n". |
| 3 | Load factor α = n/m, the average number of keys per slot, under simple uniform hashing. | Confirmed | `sources/mit-6046-lec7.txt`: "We make the assumption of simple uniform hashing: Each key k ∈ S is equally likely to be hashed to any slot of table T, independent of where other keys are hashed." / "Define the load factor of T to be α = n/m = average number of keys per slot." |
| 4 | Expected time for an unsuccessful search under chaining is Θ(1 + α); Θ(1) when α = O(1). | Confirmed | `sources/mit-6046-lec7.txt`: "The expected time for an unsuccessful search for a record with a given key is = Θ(1 + α)." / "Expected search time = Θ(1) if α = O(1), or equivalently, if n = O(m)." |
| 5 | A successful search has the same asymptotic bound, but a more complicated proof, cited not re-derived. | Confirmed, scope matches the lecture's own hedge | `sources/mit-6046-lec7.txt`: "A successful search has same asymptotic bound, but a rigorous argument is a little more complicated. (See textbook.)" — this topic's own `post-notes.md` makes the same hedge, not a stronger claim. |
| 6 | Java's `HashMap` is a real, chaining-based standard-library hash table; default load factor 0.75, rehashing at load-factor·capacity. | Confirmed | `sources/java-hashmap-src.txt`: "This map usually acts as a binned (bucketed) hash table" / "the default load factor (.75) offers a good tradeoff" / "When the number of entries in the hash table exceeds the product of the load factor and the current capacity, the hash table is rehashed." |
| 7 | **Honest scope flag:** Java's `HashMap` is not pure chaining — an overgrown bin becomes a balanced tree bin. | Confirmed, and deliberately surfaced rather than smoothed over | `sources/java-hashmap-src.txt`: "when bins get too large, they are transformed into bins of TreeNodes, each structured similarly to those in java.util.TreeMap." / "since the vast majority of bins in normal use are not overpopulated, checking for existence of tree bins may be delayed." Step 3's visual names this directly as a footnote rather than presenting Java's `HashMap` as pure, unrefined chaining — the same honesty pattern as topic 16's PEP 456 correction. |
| 8 | Every number put on screen (steps 5, 6, 8) is measured directly in `examples.py`. | Confirmed by construction | `examples.py` builds a real chained table, inserts real random keys at three real load factors, and measures the real average and longest chain length — see `examples.py` itself. |
| 9 | **The correction:** the average chain length over all buckets equals α exactly, for any hash function whatsoever, by simple counting — not evidence a hash is well-behaved. The real, hash-dependent claim is that the longest chain stays close to that average. | Confirmed — a real measurement mistake caught before shipping, not before | An early draft of `examples.py` asserted only `abs(avg - alpha) < TOLERANCE` and called that "proof" chaining depends on a good hash. Re-deriving the claim: n keys inserted into m buckets always sum to n total chain nodes, so the average is n/m = α by arithmetic alone, regardless of which bucket any key lands in — even `constant_hash` from the worst-case section produces the same average. Fixed by instead measuring the longest chain's share of n (asserted under 5% at every tested α under Python's real `hash()`) and contrasting it directly against the worst case's longest chain (100% of n, the same n) — see `examples.py`'s own comment and `OUTLINE.md` claim 9. |

## Red team: the predict question

**Step 5 (ChainPredict).** Distractors tested against the real mechanism:
- "0 — most buckets are probably still empty" — tempting at low α (true-ish around α ≈ 0.5, where many buckets genuinely are empty under a Poisson-like spread), but wrong as a general answer: the question is about the *expected* length for a random key's own bucket, not the typical bucket's occupancy, and at α ≈ 1.5 (the step's own stated load factor) most buckets are not empty. Kept as a distractor because it's the kind of reasoning a learner anchored on α ≈ 0.5's picture might over-generalize.
- "Always exactly 1, however many keys there are" — wrong, but tests whether a learner conflates "a bucket holds a list" (the mechanism) with "a bucket holds exactly one entry" (open addressing's actual promise, not chaining's) — the exact distinction topic 18 will make explicit.
- "It grows without bound as more keys are added, regardless of table size" — wrong, and tests the single most common misreading of the worst case (step 4): the worst case is about an adversarial or degenerate hash, not the typical case under simple uniform hashing. If the table grows (m grows with n, which is topic 20's resizing, out of scope here but named in `CHAPTER.md`), α and thus expected chain length stays bounded.
- "About α — the load factor itself" (correct) — directly what the cited result states, and what `examples.py` measures.

## Currency notes

- Java's `HashMap` javadoc states its default load factor "offers a good tradeoff between time and space costs" as "a general rule," not a universal optimum — this topic's claim 6 matches that hedge, not a stronger "0.75 is always right" claim.
- The MIT lecture's own successful-search hedge ("a rigorous argument is a little more complicated") is carried into `post-notes.md` rather than smoothed into a claim this topic didn't verify.

## Claims not made

- No claim that `examples.py`'s from-scratch chained table matches Java's or any real production table's exact performance — the measured average-chain-length-tracks-α result is this topic's own, honest measurement, not a claim about any specific real system's benchmarked numbers.
- No claim about universal hashing's formal guarantee beyond naming it in `post-notes.md`'s frontier section — the chapter plan already marks "Universal and k-independent hashing" *(skipped)* for this chapter.
- No claim that chaining is "better" or "worse" than open addressing in the abstract — `post-notes.md` and step 7's takeaway frame it as a trade-off (flexibility and no hard ceiling, vs. a pointer per entry), matching the chapter's own no-ranking stance used in topic 16.
