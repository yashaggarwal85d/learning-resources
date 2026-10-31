# Outline — de.cache-patterns-eviction-policies

## Outcomes (from CHAPTER.md)

Contrast cache-aside, read-through, write-through and write-behind, and name precisely what
failure each risks; explain a TTL; contrast LRU, LFU and W-TinyLFU (Caffeine's own
admission-plus-eviction policy) and explain why an admission policy matters as much as an
eviction policy, with a real measured hit-rate comparison.

## 9-step storyboard (full, ~15 min)

1. **Hook.** A write-behind cache acknowledges a write in under a millisecond, the application
   moves on, and three seconds later the whole cache node dies before the queued write ever
   reaches the database. The write the application was told succeeded is gone.
2. **Predict: which pattern would have prevented this.** (Correct: not a better cache node — a
   different pattern entirely. Write-through would have made the application wait for the
   database write to actually land, trading the speed write-behind was chosen for in the first
   place.)
3. **Reveal: cache-aside.** The application itself owns the miss path: check the cache, miss,
   read the database, write the result back. AWS's own "lazy loading" name for exactly this. No
   takeaway (reel test's reference step).
4. **Reveal: read-through.** The cache itself owns the miss path instead — the application never
   talks to the database directly. The same miss, moved one layer down. Takeaway.
5. **Reveal: write-through and write-behind.** Write-through doesn't return until the database
   write lands (the hook's own missing safeguard); write-behind returns immediately and queues
   the write, risking exactly the hook's own loss if the node dies before the queue drains.
   Takeaway.
6. **Reveal: the TTL.** A TTL doesn't fix staleness; it bounds how long a cache is allowed to stay
   wrong before it's forced to ask again. Takeaway.
7. **Reveal: LRU, LFU, and the measured gap.** Plain LRU evicts whatever's oldest, even if it's
   about to be requested again; a real, measured hit-rate comparison shows W-TinyLFU beating plain
   LRU on a realistic skewed access pattern. Takeaway.
8. **Recap.**
9. **Prove it.** A team swaps their cache's eviction policy from LRU to LFU and the hit rate
   barely moves. What's the likely reason admission, not eviction, is the actual bottleneck?
   (Correct: if every requested key is already being admitted to the cache regardless of how
   rarely it recurs, no eviction policy can fix a cache that's full of one-hit-wonders; W-TinyLFU's
   own admission filter is what Caffeine adds on top of eviction for exactly this case.)

## Engagement arc

- Predicts: step 2 and the closing "Prove it" step.
- No takeaway on step 3 (reel test's reference "from" step).
- Takeaways on steps 4, 5, 6, 7 (four takeaways).

## Post-notes headings

Outcomes; Internals (AWS's own lazy-loading/write-through/TTL mechanics; Coherence's own
read-through/write-through/write-behind definitions and write-behind's system-of-record risk;
Caffeine's own W-TinyLFU admission-plus-eviction design); Lab (a real, measured hit-rate
comparison between plain LRU and a frequency-aware policy on a skewed access pattern); Production
(the hook's lost-write failure, resolved); Frontier (why an admission filter matters even with a
perfect eviction policy); Where this goes next (an eviction policy alone says nothing about
whether a cached value is still correct).

## Bridge / handoff

Bridge (answers topic 24's handoff verbatim): "Every mechanism in this chapter so far protected a
write. This section turns to the read side most of that protection exists for in the first place:
caching, starting with the real patterns (cache-aside, read-through, write-through, write-behind)
and eviction policies every cache is built from — the same eviction problem §5.1's buffer pool
already solved once, now solved again at the application layer."

Handoff: "An eviction policy alone says nothing about whether a cached value is still correct. The
next topic is the harder problem: cache consistency and invalidation."

## Concept ledger

Introduces: `cache-patterns-eviction`. Uses: `buffer-pool-pin-unpin`. Declared: none beyond
§5.1–§5.3.

## Claims list (for FACT-CHECK.md)

1. AWS ElastiCache's own documentation: cache-aside ("lazy loading") has the application own the
   miss path, and can go stale because nothing updates the cache when the database changes.
2. Oracle Coherence's own documentation: read-through has the cache own the miss path;
   write-through doesn't return until the backing store is updated; write-behind returns
   immediately and queues the write, making the cache the system-of-record until that queue
   drains — the real loss risk this topic's hook demonstrates.
3. Caffeine's own project wiki: Caffeine uses Window TinyLFU, combining a small admission LRU
   gated by a frequency-sketch admission filter with a larger Segmented LRU for retention.
4. (This course) a real, measured hit-rate comparison on a skewed (Zipfian) access pattern shows
   a frequency-aware admission policy beating plain LRU, computed directly in examples.py.
