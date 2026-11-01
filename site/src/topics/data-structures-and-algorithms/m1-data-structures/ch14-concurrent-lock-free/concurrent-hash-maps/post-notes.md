<section data-section="outcomes">

## Outcomes

- Explain, for lock striping, per-bin locking with compare and swap, split-ordered lists and
  shards, where each puts the contention, what each makes hard (size, resize, ordered
  iteration), and which of the previous topic's progress guarantees it gives readers and writers.
- Trace an insert into an empty bin (one compare and swap), an insert into an occupied bin (a
  lock on the first node) and a read during a resize (following a forwarding node), on the
  chapter's own small table.
- Say why treeified bins exist (hostile or colliding hashes), why they need a table of at least
  sixty-four bins, and what a reader does while a tree's root lock is held; and say why doubling
  a split-ordered table moves no items.

</section>

<section data-section="internals">

## Internals

Lock striping splits one table into several independently locked stripes (segments), so threads
on different stripes never contend; it buys S-fold less contention under a uniform key
distribution and costs a whole-table operation (size, a resize) every lock it holds. Java's
`ConcurrentHashMap` was built this way before Java 8; the current source (`jdk21u`, read on
`master`) still carries `DEFAULT_CONCURRENCY_LEVEL = 16` and an unused `Segment` class,
"instantiated in minimal form only when serializing," kept only for compatibility. The current
design replaces per-stripe locks with two finer mechanisms: inserting the first node of an empty
bin is a single CAS ("by far the most common case for put operations under most key/hash
distributions"), and inserting into an occupied bin takes a lock on that bin's own first node
("we do not want to waste the space required to associate a distinct lock object with each bin").
Reads never take either path: "Retrieval operations (including get) generally do not block."
Every one of these mechanisms is replayed in `examples.py` (`StripedModel.insert`, `read`), not
asserted from the source's prose alone.

The source's own Poisson table (parameter about zero point five, the chance of k items in one
bin under a uniform hash) is recomputed with `math.exp`/`math.factorial` in `examples.py` and
checked within a tight tolerance of its nine printed figures: a chain of eight nodes by chance
alone is roughly a one-in-sixteen-million event. That is exactly why a chain that does reach
`TREEIFY_THRESHOLD` (eight), in a table of at least `MIN_TREEIFY_CAPACITY` (sixty-four) bins,
is treated as a defence against a hostile or colliding key distribution rather than bad luck —
the same `hashdos` concern a separate-chaining table carries, now built into the structure
itself as a balanced tree ("a specialized form of red-black trees") bounding search to O(log N).
Below that capacity, the table resizes instead of treeifying — both branches replayed node-by-
node in `examples.py`'s `insert_and_check_treeify`, which confirms the *eighth* node specifically
trips the threshold (the source counts the newly inserted node before comparing). A treeified
bin keeps its own read-write lock, "parasitic on the main bin-synchronization strategy," so that
"readers need never block" — they fall back to the slower pointer-walk while the root lock is
held, rather than waiting on it.

The resize itself is the part that makes growth non-blocking for readers: a `ForwardingNode` is
placed at the head of each bin once it has been migrated, and a thread that meets one restarts
its operation on the new table; other threads can join the migration of the next range of bins
rather than wait for one thread to finish the whole move alone — this is Chapter 3's incremental
rehashing made concurrent, every thread paying a share instead of one thread amortizing it.
`examples.py`'s `ResizingTable` models exactly this: a reader for an already-migrated key follows
the forwarding marker, a reader for an unmigrated key reads the old table directly, and a second
thread can migrate an unrelated range of bins without disturbing either read.

Split-ordered lists (Shalev and Shavit, *JACM* 2006) take the opposite approach: a single
lock-free list holding every item, ordered by the bit-reversal of its hash key ("reversing the
bits of the hash key so that the new key's most significant bits are those that were originally
its least significant"), with dummy nodes marking where each bucket begins. Doubling the bucket
array only threads in new dummy nodes for the new buckets; no real item's position in the list
ever changes. `examples.py` checks this directly rather than quoting the paper's own claim: every
real key's sort key and the real keys' relative order are computed and compared across a table of
four buckets and a table of eight, and both are identical — the only difference is four new dummy
nodes. The underlying list builds on "the work of Harris [2001]" by way of "Michael [2002a]"
(both cited only, not read, per `CHAPTER.md`).

`dashmap`'s sharded design is lock striping's Rust shape: an array of cache-padded,
read-write-locked `hashbrown` tables ("a direct replacement for `RwLock<HashMap<K, V>>`"), the
shard chosen from the hash's own bits, with a shard count of
`(available_parallelism * 4).next_power_of_two()` on `master` — computed in `examples.py` for
several plausible core counts and for this sandbox's own four cores (sixteen shards). The
documented hazard — "may deadlock if called when holding any sort of reference into the map" —
is the price of handing out a reference into a locked shard rather than copying out of it.

</section>

<section data-section="frontier">

## Frontier

Concurrent skip lists (skipped) are the ordered counterpart to every unordered map in this
topic — `ConcurrentSkipListMap` against the Chapter 11 single-writer skip list's own
concurrency argument — named once here, per the skipped-topic rule, with nothing built. B-link
trees, optimistic lock coupling and Bw-trees (all skipped) are the ordered, disk-shaped
counterparts, named by pointer only. The pre-Java-8 segment design itself is deliberately not
described beyond what the current source's own backward-reference comment already says
(`DEFAULT_CONCURRENCY_LEVEL`, the unused `Segment` class): reading that design in full needs a
JDK 7 source, which was not opened this session, per `CHAPTER.md`'s own instruction.

</section>

<section data-section="where-next">

## Where this goes next

A map that stays correct while many threads read it, write it and grow it closes the milestone:
every structure in it has now been asked what it costs, what invariant it keeps, and what it
does when many hands touch it. All of them answer one kind of question, how to hold data so that
asking about it is cheap. The next milestone asks what to do with the data once you have it, and
begins with the computation every system runs most: putting things in order. Elementary sorts
and sorting networks, next.

</section>
