<section data-section="outcomes">

## Outcomes

- Build an O(1) LRU cache from a hash map and a doubly linked list, and show the pointer-work per
  get/put is bounded by a small constant at both a small and a very large capacity.
- Explain why a hit is also a write (it reorders the recency list), and why that makes an exact
  LRU cache's hit path contend for a lock that a pure lookup "shouldn't" need.
- Compare exact LRU against CLOCK and Redis's sampled approximation on the same replayed trace,
  with a measured miss ratio for each, and show that a single scan larger than the cache flushes
  the hot set under both of the recency-based policies.

</section>

<section data-section="internals">

## Internals

The hash map and the doubly linked list solve two different problems, and neither one alone is
enough. The map finds a key's node in O(1), but a map carries no usable order — it can't answer
"which entry is oldest" without inspecting everything. The list keeps an exact recency order, head
to tail, but finding *which* node belongs to a given key by walking it is O(n). Paired, the map
hands the list a node directly, and the list's own `_unlink`/`_push_front` operations in
`examples.py::LRUCache` touch only that node's immediate neighbours — never a scan — which is
exactly the O(1) splice the linked-list topic names. `pointer_ops_are_constant` in `examples.py`
measures this directly: the maximum pointer writes per get or put is six, identical at capacity one
hundred and at capacity fifty thousand.

CLOCK keeps the same intuition — recency — but drops the ordered structure entirely. A reference
bit per slot, set on every touch, and a hand that sweeps a fixed circular order on eviction,
clearing bits as it goes and stopping at the first zero: that is the entire mechanism, quoted word
for word from OSTEP's description of Corbato's 1969 algorithm and reproduced in
`examples.py::ClockCache`. A hit costs exactly one bit set — no reorder, nothing that needs
exclusive access to shared state — which is the whole reason CLOCK exists: at scale, the list
reorder that exact LRU needs on every hit becomes the actual bottleneck under many threads, not the
lookup itself. Measured on this topic's hot-set replay (a trace with real temporal locality, not
i.i.d. randomness — see `FACT-CHECK.md`'s red team #3), CLOCK's miss ratio (0.0752) lands within
three ten-thousandths of exact LRU's (0.0749): close enough that the cheaper hit looks like it comes
at almost no accuracy cost, on this workload.

Neither policy survives a scan. A single pass through something larger than the cache — every page
touched exactly once — looks, to a purely recency-based rule, identical to "used constantly": each
touch is the most recent thing that happened, and a recency-only rule has no way to distinguish a
page that will never be asked for again from one in the middle of being reused. Measured directly
(`probe_hit_rate` in `examples.py`): a short probe immediately after a five-hundred-page scan hits
substantially less often than the same probe with no scan in between, under both LRU (0.4667 down
to 0.3767) and CLOCK (0.4767 down to 0.3733). Redis's sampled approximation gives up the ordered
structure altogether — no list, no reference bits, just a last-access timestamp per key and a
random sample of a few candidates (around five, per its own source comment) at eviction time — and
measurably does a little worse than exact LRU on the same hot-set replay (0.0761 vs. 0.0749), the
price of zero per-access bookkeeping.

</section>

<section data-section="lab">

## Lab

`examples.py` builds the chapter's replay harness (shared in shape with topic 41's, per
`CHAPTER.md`'s own seam note) and runs it against exact LRU, CLOCK, and Redis's sampled
approximation on a seeded synthetic trace with real temporal locality (a two-hundred-key hot set,
recency bias of 0.85 over an eighty-key window, fifty thousand accesses). No small, freely licensed
public cache trace (CDN or block-I/O) was found that this sandbox's fetcher could download and
replay inside a reasonable time budget this session — the UMass and SNIA trace repositories both
require registration or forms outside this sandbox's reach — so this topic names the public-trace
approach `CHAPTER.md` describes without replaying one; an interested reader can point the same
harness at a downloaded trace with no changes beyond swapping the key sequence. A real, caught bug
belongs here too: the first version of the scan-effect measurement never reinserted a page into the
CLOCK cache after a miss during cooldown, pinning its post-scan hit rate at exactly zero regardless
of input; fixed, then rebuilt around a short post-scan probe once a full-cooldown measurement
turned out to self-warm away the effect entirely (`FACT-CHECK.md`'s red team #1–2).

</section>

<section data-section="production">

## Production failures this topic warns about

Reaching for an exact, globally-locked LRU cache in a hot path that many threads touch concurrently
is the single most common version of this topic's own lesson: every hit becomes a write to shared
list state, so the lock meant to protect a rare eviction ends up serializing the common case, the
read. CLOCK (or a sharded/striped LRU, which trades exactness for partitioned locks instead of
approximated recency) exists specifically to avoid that. A second, separate failure: relying on any
purely recency-based cache — exact or approximate — to survive a maintenance job, backup, or report
query that scans a large table once. That one query, smaller in total time than the cache's normal
traffic, can still evict every genuinely hot entry, because recency alone cannot tell "about to be
reused" from "touched once and done." Databases that expect this (PostgreSQL's small scan ring,
named in this topic) give such scans their own small, separate space instead of letting them compete
for the shared cache at all.

</section>

<section data-section="frontier">

## Frontier

Admission-and-FIFO-based eviction (Caffeine's W-TinyLFU sketch-based admission; S3-FIFO, SOSP 2023;
SIEVE, NSDI 2024) is named in the syllabus but stays in the curriculum with no reel of its own
(`syllabus/review-notes/dsa-cuts.md`) — each beats plain LRU on hit ratio with designs friendlier to
lock-free implementation than an ordered list, and is worth a look for anyone who wants to go past
what this chapter builds. The theory side of this topic — that LRU and FIFO are k-competitive
against an optimal offline policy (Sleator and Tarjan, 1985) — belongs to Chapter 34's "Online
paging," not here; this topic shows the mechanism and the measured failure, not the competitive
bound. Redis's own approximation, and the production buffer-pool and page-replacement mechanics
this topic only names, are built in full on the Data Engineering track (§5.1's buffer pool, §5.5's
cache patterns and eviction policies) — this topic points there rather than repeating it.

</section>

<section data-section="where-next">

## Where this goes next

Every variant in this topic answers the same question the same way: the entry used longest ago
goes. That's right when yesterday predicts tomorrow, and it fails in a way a single query can
trigger — one table scan, larger than the whole cache, touches every page exactly once and pushes
out every page that was ever reused. The next topic is about what recency forgets. Scan-resistant
policies, next.

</section>
