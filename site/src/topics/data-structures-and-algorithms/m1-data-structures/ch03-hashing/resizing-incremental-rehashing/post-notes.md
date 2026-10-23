---
id: dsa.resizing-incremental-rehashing
title: Resizing and incremental rehashing
---

<section data-section="outcomes">

## After this topic you can

- State that a hash table's resize is the same amortized argument as a growable array's, applied to rehashing instead of copying.
- Explain Redis `dict`'s incremental-migration design and why it trades peak memory for a smoother per-operation latency than doubling-and-rehash-all-at-once.
- Say what changes about a hash table's behaviour under sustained memory pressure.

</section>

<section data-section="internals">

## Into the internals

### The same proof, a different cost being amortized

Doubling a hash table's capacity is the same aggregate-method argument this curriculum already proved for a growable array (Ch.1 `dsa.aggregate-accounting-methods`, Ch.2 `dsa.dynamic-arrays-growth-policy`): each doubling costs proportional to the table's current size, but doubling happens exponentially less often, so the total cost over n inserts stays O(n), giving O(1) amortized per insert. The real difference here isn't the proof — it's what gets paid for. A growable array's resize pays for copying; a hash table's resize pays for rehashing, because a key's slot depends on the table's own capacity, and that changes.

### The real growth shape

Redis's own `dict.c` grows capacity as a power of two (`_dictNextExp`), the same shape a doubling array uses, and the source's own comment states its real expansion threshold explicitly: "If dict_can_resize is DICT_RESIZE_AVOID... if expanding, the threshold is dict_force_resize_ratio which is 4." The incremental-migration mechanism this topic focuses on is a separate design decision from the growth factor itself — Redis could in principle migrate incrementally at a different growth factor, or double all at once at the same one.

</section>

<section data-section="lab">

## In the lab

No syllabus §3.3 Lab bullet names this topic specifically (it names topics 17–19's own implementations). `examples.py` still measures the real numbers this topic claims: the worst single-operation cost under each strategy, the total work each one does, and how many operations incremental migration holds both tables live for.

</section>

<section data-section="production">

## In production

Redis's own `dict` structure, the backing store for Redis's hash type and much of its own internal bookkeeping, is the real, current, production example this topic is built around: a second table prepared on resize, a bounded number of buckets migrated per call, and that call triggered from inside ordinary lookup and insert operations rather than a background thread — confirmed directly from Redis's own current source, not a secondary description of it.

</section>

<section data-section="frontier">

## The frontier

Redis's own `dict.h` names a concrete minimum-fill threshold (`HASHTABLE_MIN_FILL`, 1/8 occupancy) below which the table becomes willing to shrink — a real, cited number for "hash tables under memory pressure," rather than an invented one. Concurrent or lock-free resizing — migrating a table that multiple threads touch at once, without a single coordinating lock — is a real, harder version of this same problem, named here with no mechanism taught, since the syllabus doesn't name it for this topic.

</section>

<section data-section="questions">

## More questions

- Why does Redis migrate on ordinary lookups too, not just inserts?
- What would happen to incremental migration's bound if a key's own chain in one bucket were unusually long?

</section>

<section data-section="next">

## Where this goes next

A single machine's table can always grow to fit more keys. The next topics ask the same question one level up: what happens when the keys don't fit on one machine at all, or when you need to know two copies agree without comparing them whole.

</section>
