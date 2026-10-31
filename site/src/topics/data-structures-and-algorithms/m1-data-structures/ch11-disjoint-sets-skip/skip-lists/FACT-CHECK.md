# FACT-CHECK: Skip lists (`dsa.skip-lists`)

## Claims

| # | Claim | Status | Note |
|---|---|---|---|
| 1 | A node's height comes from repeated coin flips with promotion probability p | Verified | Pugh's Figure 5 algorithm; `examples.py::_random_level` implements it literally |
| 2 | The fraction of nodes promoted from level i to i+1 is p, at every level | Measured | `examples.py`: 0.2509 at p=1/4 (target 0.25), 0.4990 at p=1/2 (target 0.5), n=200,000 |
| 3 | Expected pointers per node is 1/(1-p) | Measured | 1.3358 at p=1/4 (target 1.3333), 1.9971 at p=1/2 (target 2.0) |
| 4 | Expected search cost is bounded by L(n)/p + 1/(1-p) (Pugh's own derivation) | Measured | n=20,000: 26.29 steps vs. bound 29.91 (p=1/4); 28.76 vs. 30.58 (p=1/2) |
| 5 | p=1/4's bound is smaller than p=1/2's, which is why Pugh recommends it | Measured | 29.91 < 30.58, asserted directly in `examples.py` |
| 6 | For > 250 elements, P(search > 3x expected) < 1 in a million | Verified (quoted, not re-derived) | Pugh's own stated result; re-deriving a one-in-a-million tail empirically is not practical at script scale, so this is cited, not measured |
| 7 | An insert writes exactly one forward pointer per level the new node occupies, never more | Measured | `examples.py`: every (height, writes) pair equal across 20,000 inserts; max 11 writes, well under the level cap of 24 |
| 8 | LevelDB's reads need no lock; writes need external synchronization; Insert uses release-stores, Next uses acquire-loads | Verified | Direct quotes from `db/skiplist.h`, word-for-word checked |
| 9 | LevelDB's `Prev()` has no explicit backward pointer; it re-searches for the last key less than the current one | Verified + measured | Direct quote from `skiplist.h`; `examples.py::find_less_than` reproduces it and matches the real predecessor on every probe |
| 10 | RocksDB's default memtable is skiplist-based and supports concurrent insert; `write_buffer_size` defaults to 64MB | Verified, with one correction | `memtablerep.h`/`options.h`, direct quotes. Correction: `VectorRepFactory` *also* reports `IsInsertConcurrentlySupported() == true`, so skiplist is not the *only* memtable type that does — see red team #1 below |
| 11 | Redis sorted sets pair a skip list with a hash table | Verified | Direct quote from Redis docs |
| 12 | Redis's skip list carries a `span` per link so rank can be computed in the same walk as a search | Verified + measured | `t_zset.c`'s rank-tracking code (quoted); `examples.py::rank_via_span` matches a direct count on every probe, n=2,000 |
| 13 | `ZSKIPLIST_MAXLEVEL` is 32 and `ZSKIPLIST_P` is 0.25 in current Redis | Verified, not quote-checked | Confirmed via `mcp__github__search_code` raw match on `redis/redis`'s `server.h`; this project's fetch tool corrupts this specific file (see `SOURCES.md`) |

## Currency check

All four live GitHub sources (`leveldb/db/skiplist.h`, `redis/src/t_zset.c`, `rocksdb/memtablerep.h`,
`rocksdb/options.h`) were fetched 2026-10-31 from each project's default/`main`/`unstable` branch —
current as of research time, not a pinned historical version. Pugh's 1990 paper and its results are
foundational and unchanged by nature. Redis's sorted-set documentation page was fetched the same
day. No claim here depends on a version-specific API that could have changed since a cited release
(all three systems' skip-list cores — search/insert/iterate — have been stable for well over a
decade; `span`-based rank and release/acquire-ordered inserts are both original design choices, not
recent additions).

## Red team

1. **"Only the skiplist memtable supports concurrent insert" is not quite what the source says.**
   `memtablerep.h` shows both `SkipListFactory` and `VectorRepFactory` overriding
   `IsInsertConcurrentlySupported()` to return `true` (the base class default is `false`). The topic
   avoids the word "only" and says "the default, skiplist-based memtable" — true, sourced, and not
   overclaiming uniqueness it can't back.
2. **Pugh's tail-probability claim ("1 in a million") is quoted, not re-derived.** `examples.py`
   measures the *bound* (L(n)/p + 1/(1-p)) against real average search cost, which is a different
   (and reproducible) claim from the tail probability of a rare bad case. Re-running enough
   seeded trials to empirically observe a one-in-a-million event is impractical at this scale; the
   topic cites Pugh's own number rather than asserting a number this script computed, and
   `post-notes.md`'s Internals section makes that distinction explicit for a reader who goes
   looking.
3. **p = 1/4 vs. p = 1/2's search-cost gap is real but small at n = 20,000** (26.29 vs. 28.76 steps,
   about nine percent). The reel's step 7 claims the *bound* is smaller at p=1/4 (true, and a bigger
   relative gap, 29.91 vs. 30.58, about two percent — actually a smaller gap than the measured
   average). Re-read on this: the measured averages differ by more than the bounds do, because the
   bound's L(n)/p term grows with 1/p while its 1/(1-p) term shrinks as p grows — the two don't move
   in lockstep, and a learner should not expect the measured gap and the bound gap to match exactly.
   The reel states both numbers, measured, rather than claiming one predicts the other.
4. **The splice-write-count measurement doesn't prove lock-freedom, only one necessary condition
   for it.** "One pointer write per level" is necessary for LevelDB's no-lock-reads claim but not
   sufficient by itself — the claim also depends on each individual store being atomic with the
   right memory ordering (the release-store/acquire-load pairing), which is a property of the
   *hardware and language memory model*, not something a pure-Python count can measure. The topic
   states both pieces (the pointer-count property, measured; the atomicity/ordering property,
   quoted from LevelDB's own comments) rather than implying the count alone proves safety.
5. **Scope boundary: no concurrent-write algorithm is built here.** Chapter 14 (skipped topics on
   lock-free skip lists) is where multiple *writers* racing is handled; this topic's claim is
   narrower — one writer, any number of concurrent readers — and `OUTLINE.md`/`post-notes.md` both
   say so explicitly so a viewer doesn't walk away thinking this topic covers concurrent writers.

## Corrections applied to OUTLINE.md

- Softened "only the skiplist memtable supports concurrent insert" to "the default, skiplist-based
  memtable" after finding `VectorRepFactory` also reports support (red team #1).
- Kept the tail-probability claim ("1 in a million") as a quoted fact from Pugh, not an
  `examples.py`-measured one, and said so in the reveal step's narration so it isn't presented as
  something this topic's own script computed (red team #2).
