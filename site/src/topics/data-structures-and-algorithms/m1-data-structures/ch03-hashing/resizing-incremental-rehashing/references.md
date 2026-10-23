Last verified: 2026-10-23. Expert sign-off: pending.

- Redis, `dict.c` (`redis/redis`, `unstable` branch) — the incremental-rehashing mechanism itself: a second table prepared on resize, a bounded migration step (capped buckets moved and empty buckets scanned), called from inside ordinary lookup and insert operations rather than a background thread. [source](https://raw.githubusercontent.com/redis/redis/unstable/src/dict.c)
- Redis, `dict.h` (`redis/redis`, `unstable` branch) — the named minimum-fill threshold (`HASHTABLE_MIN_FILL`, 1/8 occupancy) below which the table becomes willing to shrink. [source](https://raw.githubusercontent.com/redis/redis/unstable/src/dict.h)
- This curriculum's own aggregate-method proof for doubling (`dsa.aggregate-accounting-methods`, Ch.1; `dsa.dynamic-arrays-growth-policy`, Ch.2) — cited, not re-derived, since the argument is identical; this topic applies it to rehashing specifically.

Canonical numbers (the worst single-operation cost under each resize strategy, the total work each
one does across the same insert sequence, and how many operations incremental migration holds both
tables live for) are computed and asserted directly in this topic's `examples.py`, on this machine,
in one run.

Related tracks (see Prerequisites): topic 19 (SIMD group-probing tables) for a table built so far
assuming it already has room; Ch.1/Ch.2's amortized-doubling topics for the proof this topic applies
rather than re-derives.

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=resizing-incremental-rehashing:%20).
