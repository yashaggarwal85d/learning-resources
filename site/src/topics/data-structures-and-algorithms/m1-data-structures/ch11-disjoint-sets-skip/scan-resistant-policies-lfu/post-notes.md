<section data-section="outcomes">

## Outcomes

- Show, on a measured trace, why one scan flushes exact LRU and CLOCK, and which extra signal
  each of LFU-with-decay, 2Q, ARC and LIRS keeps that recency alone discards.
- Walk ARC's own adaptation rule by hand on a short trace: a hit on an identifier in a ghost list
  grows the target size of that list's live partner.
- State what each of the four policies costs in extra bookkeeping per entry or per access, as a
  basis for choosing one for a given workload.

</section>

<section data-section="internals">

## Internals

Frequency counting fixes the scan problem directly: a page touched once during a scan can never
outrank a page touched hundreds of times, so the hot set survives untouched (measured: zero drop
in `examples.py`'s scan probe, against the roughly nine-point drop measured for LRU and CLOCK in
`dsa.lru-caches`). But a raw count never forgets — a page that was genuinely hot last week stays
privileged by the count today even if nothing has touched it since. Decay fixes that by
periodically shrinking every count; Redis's real implementation (since version 4.0) makes this
cheap by using a probabilistic, logarithmic 8-bit counter rather than an exact one — quoted
directly from `redis.conf`: a random draw decides whether an increment happens at all, with the
probability shrinking as the counter grows, so the counter approximates a much larger true count
in a fraction of the space, saturating near its 255 maximum by around a million hits at the
default log factor of ten, and losing one unit of "heat" for every default decay tick of one
minute that passes with no touch.

2Q and ARC both exploit the same cheap trick: remembering that a key was recently evicted costs
only its identifier, a few bytes, versus the full entry a resident cache would spend. 2Q's three
queues (a short first-time FIFO, a ghost FIFO holding only identifiers, and a real LRU list for
keys seen twice) mean a scan's pages — each touched exactly once — pass straight through the
first-time queue and into the ghost list without ever earning a seat in the protected LRU list
(measured: 2Q's hit rate on `examples.py`'s own trace shows no meaningful drop after the scan, a
stronger result on this trace than the VLDB paper's own quoted experiment, which measured 2Q
retaining about seventy percent of its no-scan hit rate against LRU's roughly sixty percent — two
different traces, not a contradiction). ARC generalizes the idea: two resident lists (recent,
frequent) and two ghost lists, with one adapted parameter, the target size of the recent list,
that rises on a ghost hit in the recent list's own ghost partner and falls on a ghost hit in the
frequent list's — exactly the hand trace `examples.py` walks through, where a single engineered
ghost hit raises the target from zero to one. The paper's own words, quoted in `SOURCES.md`, state
what this buys: no offline-tuned parameter, no frequency counts to rescale, and a directory that
remembers exactly twice as many pages as fit in the cache.

LIRS takes a different measure of locality entirely: instead of asking how long ago a page was
touched, it asks how many *distinct* other pages were touched in between its last two uses — its
reuse distance. A loop that revisits the same set of pages, slightly larger than the cache, gives
every page inside it a small, bounded reuse distance no matter how large the loop's own elapsed
time grows; LRU, which only sees elapsed time, gets zero hits on such a loop once it's larger than
the cache, while a low-reuse-distance-sized resident set under LIRS keeps hitting. (This topic's
LIRS claims trace to a secondary description, not the original paper — see `SOURCES.md` and
`FACT-CHECK.md` for why, and what that means for how much weight to put on them.)

</section>

<section data-section="lab">

## Lab

`examples.py` replays all four policies on the same two traces `dsa.lru-caches` used: the hot-set
trace with real temporal locality (fifty thousand accesses, two hundred hot keys, capacity one
hundred) and the scan-probe harness (a short post-scan window compared against the same window
with no scan). A real implementation bug surfaced on the very first hand-traceable scenario for
ARC: an earlier, simplified eviction rule created a ghost entry on a cold miss in a situation the
paper's own pseudocode handles by evicting directly with no ghost at all — fixed by implementing
the paper's published four-case branching exactly, rather than an approximation of it (see
`FACT-CHECK.md`'s red team #1 and `OUTLINE.md`'s "Changes from the chapter plan" for the full
trace of the bug and the fix). The syllabus's own lab bullet (LRU, ARC and SIEVE on a public cache
trace) is split across this topic and the previous one, per `CHAPTER.md`: no small, freely
licensed public trace was found that this sandbox could download and replay (same finding as
`dsa.lru-caches`'s own Lab section), so this topic's harness runs on the same seeded synthetic
trace instead, and SIEVE itself is named, not built (it belongs to a syllabus-skipped topic).

</section>

<section data-section="production">

## Production failures this topic warns about

Reaching for plain LFU without a decay step is the specific trap this topic's own predict names:
a page that was genuinely popular during a seasonal spike, a launch, or a one-time migration stays
"hot" by the raw count long after real traffic has moved on, quietly squatting on cache space a
currently-hot page needs. Redis's own decayed, probabilistic counter is the production answer, not
a plain incrementing count. A second, separate failure: assuming a policy's published performance
transfers unchanged to your own workload and cache size — ARC's own patent history is a reminder
that even a policy proven to need no tuning can still be pulled from production for a reason that
has nothing to do with its measured performance (PostgreSQL shipped it, then replaced it in a
patch release specifically to avoid a pending patent, not because it measured worse).

</section>

<section data-section="frontier">

## Frontier

Admission-and-FIFO-based eviction (Caffeine's W-TinyLFU sketch-based admission; S3-FIFO, SOSP
2023; SIEVE, NSDI 2024, whose own abstract claims under twenty lines of code change across five
production libraries and up to sixty-three point two percent lower miss ratio than ARC on 1559
traces) stays in the curriculum with no reel of its own (`syllabus/review-notes/dsa-cuts.md`) —
each is a newer design friendlier to lock-free implementation than this chapter's ghost-list and
reuse-distance structures. LIRS has shipped in MySQL (since 5.1) and other real systems per the
secondary source this topic cites; a reader who wants the original paper's own experimental
results, not this topic's secondary description of its mechanism, should go to the SIGMETRICS '02
paper directly rather than relying on this topic alone.

</section>

<section data-section="where-next">

## Where this goes next

Scan resistance came from remembering something LRU forgets, and the cheapest thing to remember
turned out to be the identity of a page that was just evicted: a ghost list holds only keys, and
its one job is to answer "have I seen this before?" Exactly that question, at billions of keys, in
a few bits each, and with a wrong answer allowed in one direction only, is its own data structure.
Bloom filters, next.

</section>
