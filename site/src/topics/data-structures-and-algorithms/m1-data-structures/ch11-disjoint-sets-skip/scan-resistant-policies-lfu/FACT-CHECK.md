# FACT-CHECK: Scan-resistant policies: LFU, 2Q, ARC, LIRS (`dsa.scan-resistant-policies-lfu`)

## Claims

| # | Claim | Status | Note |
|---|---|---|---|
| 1 | LFU (evict the least frequently used) survives a scan because a page touched once can never outrank a page touched many times | Measured | `examples.py`: LFU-decay's hit rate right after the scan equals its hit rate with no scan (no drop) |
| 2 | A plain frequency count never forgets: a once-hot page stays "hot" by the count forever | Verified (design argument, not a system quote) | Direct consequence of `LFUDecay`'s own counter semantics without the decay step; this is the predict's own answer, argued from the mechanism, not sourced to a specific system |
| 3 | Redis's LFU implementation (since 4.0) uses a probabilistic, logarithmic counter in a few bits per key, with a default decay tick | Verified | Direct quotes from `redis.conf`: an 8-bit counter maxing at 255, the three-step probabilistic increment rule, default `lfu-log-factor` of ten, default `lfu-decay-time` of one minute |
| 4 | 2Q (Johnson and Shasha, VLDB 1994): a short FIFO for first-time keys, a ghost list holding only identifiers of keys recently pushed out, and an LRU list for keys seen again while ghosted | Verified + measured | Direct quotes from the VLDB paper (sizing recommendation of 25%/50%); `examples.py::TwoQ` implements the three-queue structure |
| 5 | A ghost entry costs only an identifier, never the page's data | Verified | The VLDB paper's own framing ("Remembering a page address requires only a few bytes"); `examples.py::TwoQ`'s `a1out` list holds bare keys |
| 6 | 2Q's own measured scan-resistance: a scan's hit rate suffers less than LRU's under the same scan | Verified (quoted) + measured independently | The paper's own experiment (2Q retains about seventy percent of its no-scan hit rate vs. LRU's about sixty percent, quoted in `SOURCES.md`); `examples.py`'s own measurement on a different synthetic trace shows 2Q's hit rate essentially unchanged by the scan, a stronger result on this particular trace, not a contradiction of the paper's own number |
| 7 | ARC (Megiddo and Modha, FAST 2003) needs no offline-tuned parameters and keeps no frequency counts | Verified | Direct quote from the paper's own summary |
| 8 | ARC's directory remembers twice as many pages as fit in the cache | Verified | Direct quote from the paper |
| 9 | A hit on an identifier in ARC's ghost list B1 grows the target size of T1 (and symmetrically for B2/T2) | Measured | `examples.py`'s hand trace: `p` rises from zero to one after an engineered B1 hit, matching the paper's own adaptation rule (paraphrased from its prose, since the paper's subscript notation didn't survive this PDF's extraction — see `SOURCES.md`) |
| 10 | PostgreSQL shipped ARC in 8.0, replaced it with 2Q in 8.0.2 "to avoid a pending US patent on ARC," then moved to a clock-sweep policy in 8.1 | Verified | Direct quotes from PostgreSQL's own 8.0.2 and 8.1 release notes |
| 11 | LIRS ranks pages by reuse distance (distinct pages touched since a page's own last use) rather than recency, keeping a small low-reuse-distance set resident | Verified, secondary source | Quoted from Wikipedia's "LIRS caching algorithm" article, not the original paper (unreachable — see `SOURCES.md`'s "Secondary source" section) |
| 12 | LIRS is deployed in real systems, including MySQL since version 5.1 | Verified, secondary source | Same Wikipedia article; not independently confirmed against MySQL's own documentation this session |
| 13 | SIEVE (NSDI 2024) needs under twenty lines of code change on average across five production cache libraries and reports up to 63.2% lower miss ratio than ARC on 1559 traces | Verified (quoted) | Direct quote from the paper's own abstract; used only for the skipped-topic pointer in `post-notes.md`, not built |

## Currency check

The 2Q and ARC papers (1994, 2003) and the LIRS secondary description describe algorithms whose
core mechanics are decades old and unchanged by nature; a live-branch fetch carries no version
risk for them. Redis's `redis.conf` and eviction documentation were fetched 2026-10-31 from the
`unstable` branch and the current docs site, current as of research time. PostgreSQL's release
notes for 8.0.2 (2005) and 8.1 (2005) are historical, dated documents, not subject to drift. The
SIEVE paper (2024) is the most recent source; its abstract's own numbers are quoted directly
rather than paraphrased, to avoid misstating a result this session didn't reproduce.

## Red team

1. **The first draft of `examples.py`'s `ARC` class had a real bug, caught on its own hand
   trace.** An ad-hoc (not paper-faithful) eviction rule created a ghost entry on a cold miss even
   when T1 was already exactly at the cache's own capacity with no ghosts at all — contradicting
   the paper's own Case IV, whose first branch evicts directly from T1 with no ghost bookkeeping
   in exactly that situation. Fixed by implementing the paper's published four-case pseudocode
   directly (Case I hit, Case II/III ghost hits, Case IV cold miss with its own two-way split) in
   place of the simplified version. See `OUTLINE.md`'s "Changes from the chapter plan" for the
   full trace of what the bug produced and how the fix was verified.
2. **LIRS's claims here are not independently verified against the primary paper**, because the
   paper is unreachable from this sandbox (ACM paywall; TLS failure on the author's own mirror).
   `FACT-CHECK.md` claims 11–12 are marked "secondary source" rather than "verified" outright, and
   `post-notes.md` says so explicitly rather than implying the original paper was read.
3. **LFU-decay's own measured miss ratio (about sixteen point six percent) is the worst of the
   four policies on the ordinary hot-set replay**, nearly double exact LRU's (measured at about
   seven and a half percent in `dsa.lru-caches`). This is a real, reproducible result of this
   topic's own chosen decay tick (every thousand operations) relative to this trace's length, not
   a claim this topic hides: `post-notes.md`'s Internals section states it plainly as the cost of
   the decay step's chosen cadence, rather than presenting LFU-with-decay as uniformly competitive
   with the other three.
4. **2Q's measured scan-resistance on this topic's own synthetic trace (essentially no drop) is
   stronger than the VLDB paper's own quoted number (2Q retains about seventy percent of its
   no-scan hit rate, i.e., some drop).** These are two different traces measuring two different
   things — this topic's probe measures hit rate immediately after a single large scan on a
   locality-based trace, the paper's own experiment used a different workload and reporting
   convention — and the reel and `post-notes.md` both present the measured number as this topic's
   own result on its own trace, not as a reproduction of the paper's experiment.
5. **The ARC implementation is complex enough that only one hand-traceable scenario was checked
   by assertion, not an exhaustive test of every branch of the paper's four-case pseudocode.** The
   hot-set replay and scan-probe measurements exercise the implementation at scale (fifty thousand
   and several thousand operations respectively) and produce sane, bounded miss ratios, which is
   evidence the common paths are correct, but a case this topic's own traces never happen to
   trigger (e.g., the `2 * self.c` directory-eviction branch) is covered by code reading, not by
   an explicit assertion. Noted here rather than claimed as exhaustively tested.
