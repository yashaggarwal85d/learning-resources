# FACT-CHECK: LRU caches (`dsa.lru-caches`)

## Claims

| # | Claim | Status | Note |
|---|---|---|---|
| 1 | A hash map plus a doubly linked list in recency order gives O(1) get/put, because a node that knows its own neighbours can be unlinked and relinked without a scan | Verified + measured | `examples.py::LRUCache` implements it; every get/put touches a small, fixed number of pointer writes (measured, claim 2) |
| 2 | Pointer work per get/put is bounded by a small constant, independent of cache size | Measured | max 6 pointer ops per operation at capacity 100 and at capacity 50,000, same bound both sizes, n=5,000 ops each |
| 3 | A hit is also a write: it moves the touched entry to the front of the recency list | Verified | `LRUCache.get`'s `_unlink`/`_push_front` calls; this is the step-3 predict's answer |
| 4 | CPython's `functools.lru_cache` is a thread-safe decorator with a cache-statistics surface (`cache_info`, `cache_clear`, `__wrapped__`) | Verified | Direct quotes from `Lib/functools.py`'s docstring and thread-safety comment, word-for-word checked |
| 5 | Java's `LinkedHashMap` offers an access-order mode built for LRU caches, with a `removeEldestEntry` hook for eviction policy | Verified | Direct quotes from the Java SE 21 API docs |
| 6 | The CLOCK algorithm approximates LRU with a reference ("use") bit per entry and a hand sweeping a circular list; a hit costs a bit set, not a reorder | Verified + measured | OSTEP Ch.22 quote (Corbato 1969 attribution); `examples.py::ClockCache` implements it, cost is `bit_ops` only |
| 7 | CLOCK's miss ratio lands close to exact LRU's on the same workload | Measured | Hot-set replay (50,000 ops, capacity 100 of a 200-key hot set): LRU 0.0749, CLOCK 0.0752 — within 0.0003 |
| 8 | PostgreSQL's buffer manager uses a clock-sweep algorithm with a usage counter per buffer, and gives sequential scans a separate small ring buffer instead of flushing the whole cache | Verified | Direct quotes from `src/backend/storage/buffer/README`, including the 256KB sequential-scan ring size |
| 9 | Redis approximates LRU by sampling a small number of keys (around 5) per eviction rather than maintaining any ordered structure | Verified | Direct quotes from `src/evict.c`'s comment block and the Redis docs page; `examples.py::SampledLRU` implements the same sample-and-pick-oldest scheme |
| 10 | Redis's `maxmemory-samples` defaults to 5, and raising it to 10 brings the approximation closer to theoretical LRU | Verified | Direct quote from the Redis docs page |
| 11 | A scan larger than the cache, interleaved with a hot working set, measurably lowers the hit rate right after the scan compared to no scan, under both LRU and CLOCK | Measured | Probe (300 accesses) immediately after a 500-page scan vs. no scan: LRU 0.4667 → 0.3767 (gap 0.0900); CLOCK 0.4767 → 0.3733 (gap 0.1034); both exceed the 0.05 assertion threshold |
| 12 | Sampled LRU (no ordered structure) does measurably worse than exact LRU on a trace with real temporal locality | Measured | Hot-set replay: sampled miss ratio 0.0761 vs. LRU 0.0749 |

## Currency check

The CPython source was fetched from the `main` branch 2026-10-31 (the docstring/thread-safety
comment quoted are stable public-API text, unchanged across recent CPython versions). The Java
docs are pinned to Java SE 21 (current LTS at fetch time), not a floating "latest" link, so the
quoted behavior won't drift under this citation. OSTEP's PDF is a stable, versioned textbook
chapter with no live-update risk. PostgreSQL's buffer README and Redis's `evict.c` were fetched
from `master`/`unstable` 2026-10-31; both describe mechanisms (clock-sweep, sampled eviction) that
have been stable in each project for well over a decade, so a live-branch fetch carries low risk of
citing a since-changed detail. The Redis eviction docs page was fetched the same day and quotes a
specific historical comparison (Redis 2.8 vs. 3.0 sample sizes) that is itself a fixed, dated
observation in the docs, not a claim about current behavior.

## Red team

1. **The first version of the scan-effect measurement had a real bug, not just a design flaw.**
   The cooldown-measurement loop's CLOCK branch never called `cache.put()` on a miss, so CLOCK's
   "hit rate after a scan" was pinned at exactly 0.0 regardless of any real input — not a
   measurement, a bug. Found by noticing the number never moved across seed changes. Fixed by
   adding the missing `put()` call (see `examples.py::probe_hit_rate`'s `step` helper, which both
   policies now share correctly).
2. **Even after that fix, measuring the whole cooldown phase (thousands of accesses) hid the
   scan's effect entirely.** Repeated draws from a 200-key hot set self-warm the cache within a few
   hundred accesses regardless of what happened before, so LRU and CLOCK converged to about the
   same hit rate whether or not a scan had run — a true result, but one that doesn't demonstrate
   the claim the topic makes. Fixed by replacing the full-cooldown measurement with a short
   post-scan probe (300 accesses) compared against the identical probe with no scan, which isolates
   the window where the damage is still visible.
3. **The first version of the hot-set trace (`rng.choices`, i.i.d. uniform) carried no recency
   signal at all.** Every eviction policy converged to the same miss ratio on it — correct, but
   useless for showing a difference between LRU, CLOCK, and sampled LRU. Fixed by rewriting
   `make_trace` to revisit one of the last 80 distinct keys with probability 0.85, which gives a
   recency-aware policy something real to exploit. Documented in `OUTLINE.md`'s "Changes from the
   chapter plan."
4. **No public cache trace (CDN or block-I/O) is replayed in this reel.** `CHAPTER.md` allows
   naming such a trace without replaying it if none reachable by this sandbox is freely available;
   checked (UMass and SNIA trace repositories require registration/forms this sandbox's fetcher
   can't complete), and `post-notes.md`'s Lab section says so plainly rather than implying a real
   trace was replayed.
5. **"CLOCK lands close to LRU" is a claim about one workload, not a universal guarantee.** The
   measured gap (0.0003 miss-ratio difference) is specific to this topic's hot-set trace
   (recency_bias=0.85, window=80); a workload with a different locality shape could show a larger
   gap. The reel states the measured numbers rather than a general bound, and `post-notes.md`'s
   Frontier section notes that CLOCK's approximation quality is itself workload-dependent.
6. **CPython's actual `_lru_cache_wrapper` doubly-linked-list mechanics are not quoted**, because
   this project's `sources.mjs` fetch tool corrupts that function the same way it corrupted Redis's
   `server.h` and LevelDB-adjacent C headers in the prior two topics (an `if maxsize < 0` comparison
   pairs its `<` with an unrelated later `>`, deleting the function body between them — see
   `SOURCES.md`'s "Not fetched" section and project memory
   `learning-resources-sources-mjs-c-header-mangling`). The topic doesn't claim to quote CPython's
   implementation; `examples.py` builds and measures the same mechanism from scratch instead.

## Corrections applied

- Fixed the real `probe_hit_rate` bug (CLOCK branch never reinserting on miss) before any number
  from it was used anywhere in the topic's files.
- Replaced the whole-cooldown scan measurement with the short post-scan probe after confirming the
  whole-cooldown version didn't show a real, reliable gap.
- Rewrote `make_trace` from i.i.d. uniform to a recency-window model after confirming the uniform
  version gave no usable signal.
