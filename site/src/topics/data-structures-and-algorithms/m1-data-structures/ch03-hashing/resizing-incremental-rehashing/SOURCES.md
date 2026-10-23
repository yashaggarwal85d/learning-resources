# Sources — Resizing and incremental rehashing

## Redis, `dict.c` (`redis/redis`, `unstable` branch)

URL: https://raw.githubusercontent.com/redis/redis/unstable/src/dict.c
Version: `unstable` branch, fetched 2026-10-23

> Using dictSetResizeEnabled() we make possible to disable
resizing and rehashing of the hash table as needed. This is very important
for Redis, as we use copy-on-write and don't want to move too much memory
around when there is a child performing saving operations.

> Prepare a second hash table for incremental rehashing.

> Performs N steps of incremental rehashing. Returns 1 if there are still
keys to move from the old to the new hash table, otherwise 0 is returned.

> Note that a rehashing step consists in moving a bucket (that may have more
than one key as we use chaining) from the old to the new hash table, however
since part of the hash table may be composed of empty spaces, it is not
guaranteed that this function will rehash even a single bucket, since it
will visit at max N*10 empty buckets in total, otherwise the amount of
work it does would be unbound and the function may block for a long time.

> If dict_can_resize is DICT_RESIZE_AVOID, we want to avoid rehashing.
- If expanding, the threshold is dict_force_resize_ratio which is 4.

> This function is called by common lookup or update operations in the
dictionary so that the hash table automatically migrates from H1 to H2
while it is actively used.

> Our hash table capability is a power of two

Contents:
- The two-tables-at-once design: a second hash table is prepared and `rehashidx` tracks progress, confirming "incremental migration across two tables" is Redis `dict`'s own literal mechanism, not a paraphrase.
- The bounded-work guarantee: `dictRehash(d, n)` moves at most n buckets per call and caps empty-bucket scanning, so no single call can block unboundedly — this topic's "bounded per-operation latency" claim, grounded in the implementation's own comment.
- The automatic-migration hook: `_dictRehashStep` is called from the dictionary's own ordinary lookup/insert paths whenever a rehash is in progress, confirming migration happens piggybacked on real operations, not a separate background thread.
- The table grows (and the force-resize threshold is checked) as a power of two, the same growth shape as a doubling dynamic array.

## Redis, `dict.h` (`redis/redis`, `unstable` branch)

URL: https://raw.githubusercontent.com/redis/redis/unstable/src/dict.h
Version: `unstable` branch, fetched 2026-10-23

> #define HASHTABLE_MIN_FILL 8 /* Minimal hash table fill 12.5%(100/8) */

Contents:
- The real, named minimum-fill threshold (an occupancy of 1/8, or 12.5%) below which Redis's own `dict` is willing to shrink — a concrete, cited number for "hash tables under memory pressure" rather than an invented one.

## Amortized doubling: already proved, not re-derived here

Per `CHAPTER.md`, the amortized argument for doubling (why repeated doubling gives O(1) amortized
cost per insert, by the aggregate method) is the same one this curriculum already proved for a
growable array, in Chapter 1 (`dsa.aggregate-accounting-methods`) and Chapter 2
(`dsa.dynamic-arrays-growth-policy`). This topic states the result and cites those topics by name
rather than re-deriving the proof; `examples.py` measures doubling's amortized cost on a hash table
specifically (rehashing, not copying) to make the number concrete for this topic's own structure.
