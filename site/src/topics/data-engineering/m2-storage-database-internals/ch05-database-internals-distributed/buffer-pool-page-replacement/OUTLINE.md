# Outline — de.buffer-pool-page-replacement

## Learning outcomes

1. Explain pin/unpin, usage-count-based clock sweep, and dirty-page tracking as the buffer
   pool's own bookkeeping, backed by a real measurement against this sandbox's cluster.
2. State precisely why a plain, unbounded clock sweep would blow out the buffer pool for a big
   sequential scan or VACUUM, and how a bounded buffer ring fixes it — then confirm the ring's
   footprint directly.
3. Explain double caching (OS page cache plus the engine's own buffer pool) and what `O_DIRECT`
   trades away to avoid it, and name PostgreSQL 18's `io_method` options honestly — measured for
   real on this sandbox's second, PostgreSQL 18 cluster rather than merely sourced.

## Reel steps (storyboard)

1. **Hook: a page on disk is useless if every access has to go fetch it from disk. What's the
   cache in front of it, and what has to happen before a query is even allowed to read a page?**
   - `fig`: "a page sitting on disk is only useful if an engine doesn't have to read it from disk every time. What sits between a query and the disk?"
   - Visual: "every page, so far" / "assumed to just be there" vs. "the cache in front of it" / "not yet opened".
   - Narrator's line: names the real handoff (the last topic opened the page itself; this one opens the cache that keeps a query from touching disk at all).

2. **Reveal: the buffer pool's own clock sweep, read directly off a real cluster**
   - `fig`: "a buffer's own usage counter, read directly off this sandbox's cluster — what actually decides which buffer gets reused?"
   - Visual: "a clock hand" / "sweeps the buffer array" vs. "a usage counter" / "raised on every pin".
   - Takeaway: Postgres doesn't rank every buffer by recency; a circularly moving clock hand decrements each buffer's own usage counter until it finds one at zero.

3. **Reveal: repeated access raises a real buffer's usage count to its own cap**
   - `fig`: "the same small table, scanned six more times for real — does its usage count keep climbing, or does it stop?"
   - Visual: "scanned once" / "usage count 4" vs. "scanned six more times" / "usage count 5, capped".
   - Takeaway: a buffer's usage counter only climbs to a small fixed cap, measured here at 5, no matter how many more times the page is touched.

4. **Predict: a sequential scan over a table far bigger than the whole buffer pool touches
   thousands of pages, once each. Does the ordinary clock sweep evict most of the buffer pool to
   make room for the scan?** (within first four ✓)
   - `fig`: "a sequential scan bigger than the whole buffer pool touches thousands of pages, once each — does the ordinary clock sweep evict most of the pool to make room?"
   - Options: "Yes — every one of those pages still has to occupy a real buffer while it's read" / "No — a small, separate ring of buffers is reused for the whole scan instead" (correct).
   - Explain: no. A page touched only by a big scan is unlikely to be needed again soon, so instead of running the normal clock sweep and blowing out the entire cache, a small ring of buffers is allocated and reused for the whole scan.

5. **Reveal: a real, bigger-than-the-pool table's measured footprint, ring-bounded**
   - `fig`: "a table built and scanned for real, far bigger than the whole buffer pool — how much of it actually ends up resident?"
   - Visual: "the table" / "26,688 pages" vs. "resident after a full scan" / "2,144 buffers".
   - Takeaway: a real table over 26,000 pages left only about 2,144 buffers resident after a full scan — a small, bounded ring, not the whole pool.

6. **Reveal: a dirtied buffer, read directly, cleaned by a real checkpoint**
   - `fig`: "a page just updated for real — is it marked dirty, and does a real checkpoint actually clean it?"
   - Visual: "just updated" / "isdirty: true" vs. "after a checkpoint" / "isdirty: false".
   - Takeaway: a buffer's own dirty flag, read directly off this sandbox's cluster, flips from true to false the moment a real checkpoint writes it out.

7. **Reveal: double caching, and the flag that bypasses it**
   - `fig`: "the same page, cached twice — once by the OS, once by the engine — what does one Linux flag trade away to stop that?"
   - Visual: "shared_buffers" / "relies on the OS cache too" vs. "O_DIRECT" / "the OS cache effects, minimized".
   - Takeaway: an engine's own buffer pool normally sits on top of the OS's page cache, caching the same bytes twice; `O_DIRECT` is the flag that trades that convenience away.

8. **Reveal: a genuinely newer cluster's own async I/O, measured for real**
   - `fig`: "this sandbox's own second cluster, PostgreSQL 18 — is its io_method setting just a name in the docs, or does it show up as real, measured I/O?"
   - Visual: "io_method" / "worker, by default" vs. "a real scan, measured" / "real reads, real hits, bulkread".
   - Takeaway: this sandbox's own PostgreSQL 18 cluster really runs `io_method = worker`, and a real scan's reads and hits are measurably counted under that exact strategy, not just named in a doc.

9. **Recap**
10. **Prove it** — a production scenario: a dashboard query runs a sequential scan over a table
    much bigger than `shared_buffers`, right after a reporting job finished scanning a different,
    equally large table. Does the dashboard query's scan get slowed down by the reporting job
    having evicted the buffer pool, and why or why not?

## Engagement arc

- Hook names the real open question: the last topic opened the page; this one opens the cache
  that decides whether a query ever has to touch disk for it.
- Predict at step 4, within the first four, tests the tempting-but-wrong intuition that a big
  scan must occupy a real buffer per page it touches.
- Steps 2–3 build the clock-sweep/usage-count vocabulary the predict question needs.
- Steps 5–7 build the ring-bounded-footprint and double-caching claims with real, run evidence
  from this sandbox's own Postgres 16 cluster.
- Step 8 upgrades what could have been a sourced-only PostgreSQL 18 disclosure into a real
  measurement, since this sandbox also runs a genuine PostgreSQL 18 cluster.
- Recap ties every claim back to its own real evidence; Prove It extends the ring-bounded-scan
  claim to a concrete production scenario (two big scans in a row).

## Post-notes headings

- Outcomes
- Lab
- Production failures this topic warns about
- Frontier
- Where this goes next

## Claims (drawn from the five verified sources)

1. A buffer's usage counter is incremented, up to a small cap, whenever it is pinned; a
   circularly moving clock hand decrements each buffer's counter until it finds one at zero.
   (PostgreSQL buffer manager README)
2. A big, once-only scan (a large sequential scan, VACUUM) uses a small ring of buffers instead
   of the normal clock sweep, since a page touched only by such a scan is unlikely to be needed
   again soon. (PostgreSQL buffer manager README)
3. The sequential-scan ring is sized at 256KB; bulk writes (COPY, CREATE TABLE AS SELECT) use a
   16MB ring instead. (PostgreSQL buffer manager README)
4. `pg_buffercache`'s own usage-count column is literally named "Clock-sweep access count."
   (pg_buffercache)
5. `shared_buffers` relies on the operating system's own page cache too, which is why allocating
   more than about 40% of RAM to it rarely helps. (Resource Consumption)
6. The size of VACUUM's own ring is a documented, tunable setting (`vacuum_buffer_usage_limit`).
   (Resource Consumption)
7. `heap_blks_read`/`heap_blks_hit` are the real, queryable counters this topic measures a warm
   table's buffer hits with. (The Cumulative Statistics System)
8. PostgreSQL 18's `io_method` defaults to `worker`, with `io_uring` as the alternative.
   (Resource Consumption, PostgreSQL 18)
9. PostgreSQL 18 added a real asynchronous I/O subsystem improving sequential scans, bitmap heap
   scans, vacuums and other operations. (Release 18)
10. `O_DIRECT` tries to minimize cache effects of I/O to and from a file, useful when an
    application does its own caching. (open(2))

## Progress

Research done (SOURCES.md, 17/17 quotes), examples.py written and run repeatedly for stability:
a buffer's usage count measured rising to its cap of 5; a 26,688-page table's footprint measured
at 2,144 resident buffers after a full scan (ring-bounded); a dirtied buffer's flag measured
flipping true→false across a real checkpoint; a warm table's scan measured as 0 new disk reads
and new buffer hits; PostgreSQL 18's `io_method=worker` measured issuing real, counted I/O under
the `bulkread` context on this sandbox's own second cluster (port 5433). Next: FACT-CHECK.md,
coverage.json, reel.tsx/scenes.tsx, narration.json.
