# Sources

## Associative array (Wikipedia)

URL: https://en.wikipedia.org/wiki/Associative_array
Version: fetched 2026-11-05

> The most common general-purpose implementation of an associative array is a hash table: an array combined with a hash function that separates each key into a separate "bucket" of the array. The basic idea behind a hash table is that accessing an element of an array via its index is a simple, constant-time operation. Therefore, the average overhead of an operation for a hash table is only the computation of the key's hash, combined with accessing the corresponding bucket within the array. As such, hash tables usually perform in O(1) time, and usually outperform alternative implementations.

> Compared to hash tables, these structures have both strengths and weaknesses. The worst-case performance of self-balancing binary search trees is significantly better than that of a hash table, with a time complexity in big O notation of O(log n). This is in contrast to hash tables, whose worst-case performance involves all elements sharing a single bucket, resulting in O(n) time complexity. In addition, and like all binary search trees, self-balancing binary search trees keep their elements in order. Thus, traversing its elements follows a least-to-greatest pattern, whereas traversing a hash table can result in elements being in seemingly random order. Because they are in order, tree-based maps can also satisfy range queries (find all values between two bounds) whereas a hashmap can only find exact values. However, hash tables have a much better average-case time complexity than self-balancing binary search trees of O(1), and their worst-case performance is highly unlikely when a good hash function is used.

## Redis sorted sets (Redis documentation)

URL: https://redis.io/docs/latest/develop/data-types/sorted-sets/
Version: fetched 2026-11-05

> Implementation note: Sorted sets are implemented via a dual-ported data structure containing both a skip list and a hash table, so every time we add an element Redis performs an O(log(N)) operation. That's good, so when we ask for sorted elements, Redis does not have to do any work at all, it's already sorted.

Notes: this is this topic's own example of "the mix needs two things, so the answer is two structures kept in sync" — Redis's sorted sets keep a hash table (for O(1) score lookup by member) and a skip list (for ordered and range operations by score) over the identical data, rather than picking one structure and accepting the other operation's worse cost. The page states the combined structure and the O(log N) insert cost; it does not itself spell out which structure answers which operation, so that attribution (hash table for lookup, skip list for order) is this topic's own reading of the combination's purpose, consistent with Chapter 11's own skip-list material.

**Bloom filter arithmetic: used, not re-derived**

The optimal-k formula (`k = bits_per_key * ln 2`) and the false-positive rate formula (`(1 - e^(-k/bits_per_key))^k`) are reused directly from Chapter 12's own `dsa.bloom-filters-false-positive` topic, which independently sources and verifies them (Broder and Mitzenmacher's survey, cited in that topic's own `SOURCES.md`). This topic does not re-quote that derivation; it only prices a Bloom filter's bits-per-key against an exact set's bytes-per-key for one representative key count, using the formula's own output.
