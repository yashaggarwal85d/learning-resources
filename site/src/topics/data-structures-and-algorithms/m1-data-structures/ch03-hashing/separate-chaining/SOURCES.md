# Sources — Separate chaining

## MIT 6.046J/18.410J Introduction to Algorithms, Fall 2005, Lecture 7 (Demaine & Leiserson)

URL: https://www.ocw.mit.edu/courses/6-046j-introduction-to-algorithms-sma-5503-fall-2005/ce6ea57dd298c8e64609802daf2eaaec_lec7.pdf
Version: Fall 2005 lecture slides (MIT OpenCourseWare), fetched 2026-10-23

> Link records in the same slot into a list.

> Every
key
i
hashes to the
49
49 86
86 52
52
same slot.

> Access time =
Θ(n) if |S| = n

> We make the assumption of simple uniform
hashing:

> Each key k ∈ S is equally likely to be hashed
to any slot of table T, independent of where
other keys are hashed.

> Define the load factor of T to be
α = n/m
= average number of keys per slot.

> The expected time for an unsuccessful
search for a record with a given key is
= Θ(1 + α).

> Expected search time = Θ(1) if α = O(1),
or equivalently, if n = O(m).

> A successful search has same asymptotic
bound, but a rigorous argument is a little
more complicated. (See textbook.)

Contents:
- Chaining's own mechanism, stated directly: "link records in the same slot into a list" — the one new idea this topic adds beyond topic 16's hash function.
- The real worst case, named honestly: every key hashing to the same slot degrades access to Θ(n) — chaining never fails, it just degrades, exactly this topic's "why chaining tolerates α > 1" claim.
- The load factor's own definition, α = n/m, "average number of keys per slot" — the same quantity this topic's `examples.py` measures directly.
- The expected-chain-length/search-cost result, Θ(1 + α) for an unsuccessful search, Θ(1) when α is O(1) — the central claim this topic teaches, cited from a primary academic source rather than re-derived from scratch.
- The lecture's own honest scope note: a successful search has the same asymptotic bound, but a more complicated proof it defers to the textbook (CLRS) — this topic follows the same honest scoping, citing the result rather than re-deriving the harder successful-search case.

## OpenJDK `java.util.HashMap` (a real standard library's own chaining-based implementation)

URL: https://raw.githubusercontent.com/openjdk/jdk/master/src/java.base/share/classes/java/util/HashMap.java
Version: `master` branch source, fetched 2026-10-23

> This implementation provides constant-time performance for the basic
operations ({@code get} and {@code put}), assuming the hash function
disperses the elements properly among the buckets.

> The
load factor is a measure of how full the hash table is allowed to
get before its capacity is automatically increased. When the number of
entries in the hash table exceeds the product of the load factor and the
current capacity, the hash table is rehashed (that is, internal data
structures are rebuilt) so that the hash table has approximately twice the
number of buckets.

> As a general rule, the default load factor (.75) offers a good
tradeoff between time and space costs.

> This map usually acts as a binned (bucketed) hash table, but
when bins get too large, they are transformed into bins of
TreeNodes, each structured similarly to those in
java.util.TreeMap.

> However, since the vast majority of bins in
normal use are not overpopulated, checking for existence of
tree bins may be delayed in the course of table methods.

Contents:
- Confirms a real, current, widely-used standard library (`java.util.HashMap`) is chaining-based ("binned (bucketed) hash table"), naming the mechanism this topic teaches as a real production choice, not a toy.
- The load factor's own operational definition and the default value (0.75) a real system actually ships, and the rehash-at-threshold trigger this topic's §3.1→§3.2 handoff distinguishes from this topic's own subject (resizing itself is topic 20's).
- An honest scope flag for `FACT-CHECK.md`: Java's `HashMap` is not *pure* chaining — a bin that grows past a threshold (8 entries, named elsewhere in the source) is transformed into a balanced tree bin for a worst-case O(log n) guarantee, a refinement beyond this topic's own scope that `FACT-CHECK.md` and `post-notes.md`'s frontier section name rather than silently omit.
