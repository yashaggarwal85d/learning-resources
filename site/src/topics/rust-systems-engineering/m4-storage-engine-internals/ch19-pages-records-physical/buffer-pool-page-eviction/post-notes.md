---
title: "Buffer pool and page eviction"
---

## Outcomes

- Build a real, minimal buffer pool: a frame table, a pin count per frame, a dirty bit per frame, and a real CLOCK eviction policy.
- Measure that a fully pinned pool genuinely cannot evict anything, so loading one more page than the pool can hold, with every frame pinned, fails cleanly.
- Measure that a dirty frame is genuinely written back before its own frame is reused for a new page.
- Measure that CLOCK genuinely gives a page accessed since the last sweep a second chance, evicting the page left untouched since then instead.
- State, from PostgreSQL's own pg_buffercache documentation, the real fields a real buffer pool tracks, and from LeanStore's own documentation, why some modern designs avoid the frame table's own indirection entirely with pointer swizzling.
- Contrast this chapter's own explicit buffer pool directly with the mmap approach: the real trade-off between deciding for yourself when a dirty page is written back, and letting the OS decide.

## Internals

The CLOCK demonstration deliberately re-accesses one specific frame between two separate eviction-triggering loads, rather than relying on initial load order alone. A naive design that set the reference bit on every unpin, regardless of whether the frame was genuinely re-accessed, would make "hot vs cold" indistinguishable from an artifact of sweep order; this topic's own implementation sets the reference bit only on `pin()`, so the measured second-chance effect is real, not a side effect of which frame the clock hand happens to reach first.

## In production

PostgreSQL's own pg_buffercache names exactly three fields on a real shared buffer: whether it's dirty, its own clock-sweep usage count, and how many backends are pinning it right now. That pinning count is the same pin count this topic's own pool uses, and `pg_buffercache_evict_relation()` only ever touches a buffer nobody is pinning, the same constraint this topic's own pool enforces.

## The frontier

LeanStore's own pointer-swizzling design and vmcache's own virtual-memory-assisted redesign both avoid a real frame table's own lookup indirection entirely, by letting a page's own in-memory pointer stand in for its frame once it's resident. Reproducing that needs a real virtual-memory-backed implementation beyond this topic's own minimal frame table, so this topic discusses it from LeanStore's own documentation rather than measuring it. The mmap contrast reuses the earlier chapter's own CIDR 2022 paper, independently re-fetched and re-verified for this topic, per this chapter's own convention that every topic re-fetches and verifies its own sources. All three of this topic's own measured claims run entirely on in-memory Rust structures, with no file, network, or root access needed.

## Where this goes next

A page that can be evicted and later re-read needs a durability story for what happens if the process or machine dies with a dirty page still only in memory.
