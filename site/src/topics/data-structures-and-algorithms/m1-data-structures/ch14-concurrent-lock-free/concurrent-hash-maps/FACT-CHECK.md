# FACT-CHECK: Concurrent hash maps

## Claims table

| # | Claim | Source | Verified how |
|---|---|---|---|
| 1 | Inserting the first node of an empty bin is a single CAS, "by far the most common case" | `ConcurrentHashMap.java` comment, quoted in SOURCES.md | Word-for-word quote; mechanism replayed in `examples.py` (`"cas-empty-bin"`) |
| 2 | Other updates lock the bin's own first node (no separate lock object), via `synchronized` | Same source | Word-for-word quote; mechanism replayed (`"lock-first-node"`) |
| 3 | Reads generally do not block | Same source | Word-for-word quote; `examples.py` `read()` is lock-free |
| 4 | Poisson bin-length table, parameter ~0.5, bins 0–8 | Same source (comment, nine lines) | Each of the 9 figures recomputed with `math.factorial`/`math.exp` in `examples.py` and checked within 5e-7 of the source's own printed value |
| 5 | `TREEIFY_THRESHOLD = 8`, `UNTREEIFY_THRESHOLD = 6`, `MIN_TREEIFY_CAPACITY = 64` | Same source (constants) | Quoted exactly (`MIN_TREEIFY_CAPACITY` has no `private` modifier in the actual source — corrected from an earlier draft that wrongly added one, confirmed by `grep`); replayed in `examples.py` |
| 6 | Treeify tests `binCount >= TREEIFY_THRESHOLD` after the inserted node is already counted, and only acts if the table has at least `MIN_TREEIFY_CAPACITY` bins, else resizes | Same source | Replayed node-by-node in `examples.py` (`insert_and_check_treeify`): the 8th node trips it in a 64-bin table, the 7th does not, and a 32-bin table resizes instead |
| 7 | A tree bin's root lock is "parasitic on the main bin-synchronization strategy", and readers "need never block" (fall back to the slow `next`-pointer traversal) | Same source | Word-for-word quotes |
| 8 | `DEFAULT_CONCURRENCY_LEVEL = 16`, the `Segment` class is unused and kept for compatibility | Same source | Word-for-word quotes |
| 9 | ForwardingNodes mark migrated bins; a thread finding one restarts/follows it; other threads can help resize | Same source (comments) | Word-for-word quotes; replayed in `examples.py` (`ResizingTable.read`, `migrate_bin`) |
| 10 | Split-ordered lists: bit-reversal of the hash key orders the list, dummy nodes mark bucket starts, doubling adds dummy nodes without moving items, bucket array starts at size 2 and doubles by load factor | Shalev & Shavit, JACM 2006 | Word-for-word quotes for the mechanism and the doubling rule; the no-items-move claim independently checked by computation in `examples.py` (every real key's sort key and relative order compared across table sizes 4 and 8) |
| 11 | Split-ordered lists build on Michael's lock-free list, which builds on Harris | Same paper | Word-for-word quote; Michael 2002 and Harris 2001 cited only, not read (per `CHAPTER.md`) |
| 12 | dashmap: an array of cache-padded read-write-locked `hashbrown` shards, shard count `(available_parallelism * 4).next_power_of_two()` on `master` | dashmap `README.md`, `src/lib.rs` | Word-for-word quotes for README; formula read directly from `lib.rs` source line; computed for 6 core counts in `examples.py`, matching `next_power_of_two` by hand |
| 13 | dashmap: "May deadlock if called when holding any sort of reference into the map" | dashmap `src/lib.rs` | Word-for-word quote |

## Currency check

- `ConcurrentHashMap.java` read from `jdk21u`'s `master` branch, fetched 2026-11-01, not the exact `jdk-21-ga` tag `CHAPTER.md` named (see Red team below).
- Shalev & Shavit's PDF is the published *JACM* 53(3) 2006 version; no newer version exists.
- dashmap's README and `lib.rs` read from `master`, fetched 2026-11-01; the released crates.io version (6.2.1 at planning time) was not re-checked (crates.io was unreachable; see SOURCES.md).

## Red team

1. **The `jdk-21-ga` tag was not independently checked out** — `jdk21u`'s `master` branch was read instead. The quoted constants and comments were spot-checked and match what `CHAPTER.md` expected to find; these are long-stable design comments, but a reader diffing against the exact tag should know this wasn't re-verified against it.
2. **The pre-Java-8 segment design is deliberately not described** beyond the current source's own backward-reference comment (`DEFAULT_CONCURRENCY_LEVEL`, the unused `Segment` class), per `CHAPTER.md`'s own instruction that it requires a JDK 7 source before any further detail is stated. None was read this session.
3. **dashmap's currently released shard-count formula was not independently confirmed** — only `master`'s pre-release formula was read and is labeled as `master`'s throughout, per `CHAPTER.md`'s own flag that this formula belongs to an unreleased 7.0.0 line.
4. **The Shalev & Shavit NUMA/UltraSPARC II performance claim is quoted with its hardware named**, and no claim is made about how widely split-ordered lists are used in production — not checked, and left out per `CHAPTER.md`.
5. **Michael 2002 and Harris 2001 are named only** as the split-ordered-list paper's own stated ancestry; neither was opened this session, per `CHAPTER.md`'s instruction.
6. **The angle-bracket source-mangling workaround** (documented fully in SOURCES.md) means this topic's Java quotes came from a manually seeded cache file, not the ordinary fetch pipeline; the seeding was double-checked against a direct `grep` of the raw curl'd source for every quoted constant and comment.

## Corrections applied

- `MIN_TREEIFY_CAPACITY`'s `SOURCES.md` quote originally included an incorrect `private` modifier not present in the actual source; removed after a direct `grep` comparison against the other three constants (only `DEFAULT_CONCURRENCY_LEVEL` is actually `private`).
- An `EXPECTED`-style off-by-one was checked explicitly in `examples.py` (`insert_and_check_treeify`) rather than assumed: the test confirms the *8th* node (not the 7th, not the 9th) is what trips `TREEIFY_THRESHOLD`, matching the source's own order of operations (count after the new node is appended, then compare).
