# Outline — de.cache-consistency-invalidation

## Outcomes (from CHAPTER.md)

Reproduce the real delete-after-write race against this course's own cache-aside layer and
explain precisely why "update the cache" (rather than invalidate it) is the wrong fix; explain
versioned keys and leases against stale sets, per Facebook's own Memcache design; explain
CDC-driven invalidation from the database log; explain, per the TAO case study, why how-stale-is-
acceptable is a per-field decision, not a single global rule.

## 9-step storyboard (full, ~15 min)

1. **Hook.** A reader misses the cache, starts reading the old value from the database, and a
   writer updates the database and deletes the cache key — all before the reader's own stale read
   finishes. The reader then writes that stale value into the cache. The cache is now wrong, and
   nothing will ever correct it on its own.
2. **Predict: would updating the cache instead of deleting it have prevented this.** (Correct:
   no — the race is about timing, not which operation the writer used; "update the cache" is
   actually worse, since an update can also silently overwrite a newer value with an older one,
   and updates aren't idempotent the way deletes are.)
3. **Reveal: why delete, not update.** Memcache's own reasoning: deletes are idempotent (running
   one twice is harmless); an update is not, and can itself race with another update. No
   takeaway (reel test's reference step).
4. **Reveal: the race, reproduced for real.** This course's own cache-aside layer, run with the
   exact interleaving the hook described, measurably ends up holding the stale value — proving
   delete-on-write alone does not close the gap. Takeaway.
5. **Reveal: leases close it.** A lease token, handed out on a cache miss and invalidated by a
   later delete for that key, lets the cache reject the reader's own stale write-back. Reproduced
   for real: the same interleaving, now correct. Takeaway.
6. **Reveal: CDC-driven invalidation.** Instead of application code remembering to send a delete
   on every write path, a daemon reads the database's own commit log and extracts the deletes
   directly — covering every writer, including ones that forgot. Takeaway.
7. **Reveal: per-field staleness (the TAO case study).** Not every field needs the same
   consistency. A social app can tolerate a stale comment count but not a stale authentication
   credential; TAO's own "critical" read marks the one field that can't wait. Takeaway.
8. **Recap.**
9. **Prove it.** A team adds a brand-new write path that updates the database directly but never
   calls the existing cache-invalidation code, because nobody remembered to wire it in. Which of
   this topic's own fixes would have caught this automatically, and why?
   (Correct: CDC-driven invalidation — since it reads the database's own commit log rather than
   trusting every application code path to remember to call it, a forgotten call to an explicit
   delete function can't slip past it.)

## Engagement arc

- Predicts: step 2 and the closing "Prove it" step.
- No takeaway on step 3 (reel test's reference "from" step).
- Takeaways on steps 4, 5, 6, 7 (four takeaways).

## Post-notes headings

Outcomes; Internals (Memcache's own delete-not-update reasoning and lease design; mcsqueal's
CDC-driven invalidation; TAO's own critical-read, per-field staleness decision); Lab (the
delete-after-write race reproduced for real, with and without leases, plus this chapter's own
single-flight-coalescing and early-expiration legs); Production (the race this topic's hook
names, and the forgotten-invalidation-path failure the "Prove it" step names); Frontier (why
leases alone don't solve thundering herds without the rate-limiting half of the same mechanism);
Where this goes next (every pattern so far described abstractly, independent of one real engine).

## Bridge / handoff

Bridge (answers topic 25's handoff verbatim): "An eviction policy alone says nothing about
whether a cached value is still correct. This topic is the harder problem: the delete-after-write
race reproduced directly, and the real fixes (versioned keys, leases, CDC-driven invalidation)
production systems actually use."

Handoff: "Every pattern in this section so far has been described abstractly, independent of any
one real cache engine. The next topic is one real engine's actual internals: Redis and Valkey."

## Concept ledger

Introduces: `cache-consistency-invalidation`. Uses: `cache-patterns-eviction`,
`physical-vs-logical-replication`. Declared: none beyond topic 25.

## Claims list (for FACT-CHECK.md)

1. Memcache's own documentation: deletes, not updates, are the correct write-path operation,
   because deletes are idempotent and updates are not.
2. Memcache's own documentation: a lease token, handed to a client on a cache miss and
   invalidated by a later delete for that key, lets the cache arbitrate and reject a stale
   concurrent write.
3. Memcache's own documentation: CDC-driven invalidation (mcsqueal) reads the database's own
   commit log directly, rather than relying on application code to remember to send a delete.
4. TAO's own documentation: not every field needs the same consistency; a "critical" read can be
   routed to the consistent source for the one field (e.g. authentication) that can't tolerate
   staleness, while everything else stays eventually consistent.
5. (This course) the delete-after-write race, and the lease fix, both reproduced for real against
   this course's own cache-aside layer, computed directly in examples.py.
