# Outline: Buffer pool and page eviction (`rust.buffer-pool-page-eviction`)

Chapter 19, topic 51 (fourth and last of four, closes Chapter 19). Single `/make-topic` session, 2026-10-24.

## Learning outcomes

1. Build a real, minimal buffer pool: a frame table, a pin count per frame, a dirty bit per frame, and a real CLOCK eviction policy.
2. Measure that a fully pinned pool genuinely cannot evict anything, so loading one more page than the pool can hold, with every frame pinned, fails cleanly.
3. Measure that a dirty frame is genuinely written back before its own frame is reused for a new page.
4. Measure that CLOCK genuinely gives a page accessed since the last sweep a second chance, evicting the page left untouched since then instead.
5. State, from PostgreSQL's own pg_buffercache documentation, the real fields (dirty, clock-sweep usage count, pinning backends) a real buffer pool tracks, and from LeanStore's own documentation, why some modern designs avoid the frame table's own indirection entirely with pointer swizzling.
6. Contrast this chapter's own explicit buffer pool directly with Chapter 12's `mmap` approach: the real trade-off between deciding for yourself when a dirty page is written back, and letting the OS decide.

## Changes from the chapter plan

None. All three of this topic's own claims are measured directly against a real frame table, pin counts, dirty bits, and a real CLOCK sweep; nothing here needs root access or hardware the sandbox lacks.

## Reel steps (storyboard)

1. **"Build a real buffer pool: a frame table, a pin count per frame, a dirty bit per frame. Pin every single frame in the pool, then try to load one more page than the pool can hold. What happens?"** (predict, hook) — `fig`: a buffer pool, every frame pinned, one more page arriving. Options: the pool evicts whichever frame was loaded first, pinned or not / the pool genuinely refuses; there is nothing left that can be evicted (correct) / the pool silently grows past its own stated capacity.
2. **"Measured: with every frame genuinely pinned, loading one more page than the pool can hold was rejected outright; nothing was ever evicted"** — `fig`: the real, measured rejection. NO takeaway (the reel's swipe-test "from" step).
3. **"Unpin the frames, and load a new page. One of them gets evicted to make room. If the evicted frame happened to be dirty, does its own data get written back before the frame is handed to the new page?"** (predict) — `fig`: a dirty frame, about to be evicted and reused. Options: no, the old dirty bytes are simply discarded along with the frame / yes, the dirty page is genuinely written back first, before the frame is reused (correct) / only if the pool happens to be idle at that moment.
4. **"Measured: the dirty frame's own data was genuinely written back before that same frame was reused for the new page"** — `fig`: the real, measured write-back, then the real, measured reuse. Takeaway: "A dirty frame's own data is never simply discarded; it's written back first, every time, before its frame is reused."
5. **"Now give the eviction policy, real CLOCK, a real choice: two unpinned frames, one re-accessed since the last sweep, one genuinely untouched. Load one more page. Does CLOCK evict the one just re-accessed, or the one left alone?"** (predict) — `fig`: two unpinned frames, one just touched, one untouched. Options: it evicts whichever one happens to be first in the frame table / it genuinely evicts the untouched one, giving the re-accessed one a second chance (correct) / it evicts the re-accessed one, since access makes it a bigger target.
6. **"Measured: CLOCK genuinely evicted the untouched frame, not the one just re-accessed since the last sweep"** — `fig`: the real, measured eviction, naming which frame survived. Takeaway: "CLOCK's own reference bit gives a touched frame a real second chance; an untouched one doesn't get one."
7. **"PostgreSQL's own pg_buffercache names exactly these fields on a real shared buffer: whether it's dirty, its own clock-sweep count, and how many backends are pinning it right now. What's that third one actually for?"** (predict) — `fig`: the pg_buffercache field names, shown directly. Options: it's just a diagnostic count, with no effect on eviction / it's the same pin count this topic's own pool uses to protect a frame from eviction (correct) / it only matters once a frame's dirty bit is set.
8. **"PostgreSQL's own words: pinning_backends is the number of backends pinning this buffer, and pg_buffercache_evict_relation only ever evicts a buffer that isn't pinned by anyone"** — `fig`: the documentation's own words, shown directly. NO takeaway (a connecting step restating the real system's own field names, not a new kind of claim).
9. **"Chapter 12's own mmap approach hands the question of when a dirty page gets written back to the OS entirely. This chapter's own buffer pool never does: a real paper on mmap-based databases names the real difference directly"** — `fig`: this chapter's explicit dirty bit, next to the paper's own words on mmap's OS-controlled flush. NO new predict (continues directly from step seven's own question about what a pin count is actually for). Takeaway: "An explicit buffer pool decides for itself when a dirty page is written back; mmap hands that to the OS."
10. **Recap** — a pinned frame is never evicted, a dirty frame is always written back before its frame is reused, and a real CLOCK sweep genuinely favors the frame touched more recently. PostgreSQL's own pg_buffercache tracks exactly these three things on every real shared buffer. And unlike `mmap`, which hands control of when a dirty page is flushed to the OS, an explicit buffer pool like this one decides that for itself, which is exactly the trade-off Chapter 12 raised and this chapter closes on. Handoff: a page that can be evicted and later re-read needs a durability story for what happens if the process or machine dies with a dirty page still only in memory.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7 (about what a pin count is for; step 9 continues from it directly, with no new predict, to the mmap contrast).
- Surprising fact: step 9 (the direct mmap contrast, setting up the chapter's own close and the handoff to Chapter 20's durability story).
- Takeaways: steps 4, 6, 9 (three — step 2 deliberately has none, being the swipe test's "from" step; step 8 deliberately has none, a connecting step).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| a real shared buffer's own isdirty field asks whether the page is dirty; usagecount is its clock-sweep access count; pinning_backends is the number of backends pinning that buffer | PostgreSQL docs (quoted) |
| pg_buffercache_evict_relation only evicts unpinned shared buffers in a relation | PostgreSQL docs (quoted) |
| LeanStore is a high-performance OLTP storage engine with a lightweight buffer manager built on pointer swizzling | LeanStore docs (quoted) |
| a traditional buffer pool interacts with secondary storage using system calls, giving the DBMS complete control over how and when it transfers pages | CIDR 2022 paper (quoted) |
| with mmap, the OS can flush a dirty page to secondary storage at any time, irrespective of whether the writing transaction has committed | CIDR 2022 paper (quoted) |
| a fully pinned real buffer pool genuinely rejects loading one more page than it can hold, with no pinned frame ever evicted | `examples/runtime-demo/src/pin_dirty_and_clock_decide_eviction.rs` (executed, measured) |
| a real dirty frame is genuinely written back before that same frame is reused for a new page | `examples/runtime-demo/src/pin_dirty_and_clock_decide_eviction.rs` (executed, measured) |
| a real CLOCK sweep genuinely evicts the frame left untouched since the last sweep, not the one just re-accessed | `examples/runtime-demo/src/pin_dirty_and_clock_decide_eviction.rs` (executed, measured) |

## Concept ledger

- `introduces`: `buffer-pool-pin-evict-contract` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `update-strategy-fragmentation-tradeoff` (topic 50), `mmap-double-caching` (Chapter 12, for the direct contrast)
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "All three update strategies still produce pages that need to be cached in memory; the next question is which pages are resident at all, and who gets to decide which one is evicted."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "A page that can be evicted and later re-read needs a durability story for what happens if the process or machine dies with a dirty page still only in memory."
