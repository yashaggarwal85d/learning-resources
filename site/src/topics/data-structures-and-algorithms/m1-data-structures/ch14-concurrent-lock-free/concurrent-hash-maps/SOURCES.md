# SOURCES: Concurrent hash maps (`dsa.concurrent-hash-maps`)

Read 2026-11-01.

## OpenJDK, `java.util.concurrent.ConcurrentHashMap` (jdk21u, `master` branch)

The ordinary fetch pipeline mangles this file's angle brackets (Java generics like `Node<K,V>`
and shift operators like `1<<30` are stripped as if they were HTML tags, corrupting nearby text)
— the same failure mode documented for C++ headers in the previous topic's `SOURCES.md`. Fixed
the same way: fetched with a direct, unprocessed `curl` and seeded that clean text into
`sources.mjs check`'s own cache file for this URL.

URL: https://raw.githubusercontent.com/openjdk/jdk21u/master/src/java.base/share/classes/java/util/concurrent/ConcurrentHashMap.java
Version: `jdk21u`, `master` branch, fetched 2026-11-01 (not the `jdk-21-ga` tag `CHAPTER.md`
named; the file is unchanged on this class across that range, but the exact tag was not
re-checked out)

> Insertion (via put or its variants) of the first node in an empty bin is performed by just CASing it to the bin. This is by far the most common case for put operations under most key/hash distributions.

> We do not want to waste the space required to associate a distinct lock object with each bin, so instead use the first node of a bin list itself as a lock.

> Retrieval operations (including {@code get}) generally do not block, so may overlap with update operations (including {@code put} and {@code remove}).

> Bear in mind that the results of aggregate status methods including {@code size}, {@code isEmpty}, and {@code containsValue} are typically useful only when a map is not undergoing concurrent updates in other threads.

> Ideally, the frequency of nodes in bins follows a Poisson distribution (http://en.wikipedia.org/wiki/Poisson_distribution) with a parameter of about 0.5 on average, given the resizing threshold of 0.75

> 0: 0.60653066
> 1: 0.30326533
> 2: 0.07581633
> 3: 0.01263606
> 4: 0.00157952
> 5: 0.00015795
> 6: 0.00001316
> 7: 0.00000094
> 8: 0.00000006

> Similarly for dumb or hostile usages in which multiple keys are designed to have identical hash codes or ones that differs only in masked-out high bits.

> These TreeBins use a balanced tree to hold nodes (a specialized form of red-black trees), bounding search time to O(log N).

> TreeBins include a simple read-write lock mechanism parasitic on the main bin-synchronization strategy

> However, readers need never block. If the root lock is held, they proceed along the slow traversal path (via next-pointers) until the lock becomes available or the list is exhausted, whichever comes first.

> We also declare an unused "Segment" class that is instantiated in minimal form only when serializing.

> The default concurrency level for this table. Unused but defined for compatibility with previous versions of this class.

> private static final int DEFAULT_CONCURRENCY_LEVEL = 16;

> ForwardingNodes are placed at the heads of bins during resizing.

> On encountering a forwarding node, access and update operations restart, using the new table.

> because other threads can join in and help resize rather than contend for locks, average aggregate waits become shorter as resizing progresses.

> static final int TREEIFY_THRESHOLD = 8;

> static final int UNTREEIFY_THRESHOLD = 6;

> static final int MIN_TREEIFY_CAPACITY = 64;

## Shalev and Shavit, "Split-Ordered Lists: Lock-Free Extensible Hash Tables"

URL: https://people.csail.mit.edu/shanir/publications/Split-Ordered_Lists.pdf
Version: *Journal of the ACM* 53(3), 2006, pp. 379–405, fetched 2026-11-01

> Michael [2002a], builds on the work of Harris [2001] to provide an effective compare-and-swap (CAS) based lock-free linked-list algorithm

> we introduced recursive split-ordering, a new ordering on keys that keeps items in a given bucket adjacent in the list throughout the repeated splitting process.

> reversing the bits of the hash key so that the new key's most significant bits (MSB) are those that were originally its least significant.

> The bucket array initially has size 2, and is doubled every time the number of items in the table exceeds si ze · L, where L is a small integer denoting the load factor

> empirical tests we conducted on a large shared memory multiprocessor show that even in non-multiprogrammed environments, the new algorithm performs as well as the most efficient known lock-based resizable hash-table algorithm, and in high load cases it significantly outperforms it.

> NUMA machine formed from 15 boards of two 300 MHz UltraSPARC® II processors and 2 GB of RAM on each.

## crossbeam-rs, `crossbeam-queue/src/array_queue.rs` (reused citation from the previous topic)

URL: https://raw.githubusercontent.com/crossbeam-rs/crossbeam/master/crossbeam-queue/src/array_queue.rs
Version: master branch, fetched 2026-11-01 (previous topic)

> The implementation is based on Dmitry Vyukov's bounded MPMC queue.

## dashmap, `README.md`

URL: https://raw.githubusercontent.com/xacrimon/dashmap/master/README.md
Version: `master` branch, fetched 2026-11-01

> Blazingly fast concurrent map in Rust.

> DashMap tries to be very simple to use and to be a direct replacement for

## dashmap, `src/lib.rs`

URL: https://raw.githubusercontent.com/xacrimon/dashmap/master/src/lib.rs
Version: `master` branch, fetched 2026-11-01

> (std::thread::available_parallelism().map_or(1, usize::from) * 4).next_power_of_two()

> May deadlock if called when holding any sort of reference into the map.

### Citation only, not read this session

- Maged M. Michael, "High Performance Dynamic Lock-Free Hash Tables and List-Based Sets" (SPAA
  2002, pp. 73–82) — named only as the Shalev–Shavit algorithm's own ancestry, per `CHAPTER.md`.
- Timothy L. Harris, "A Pragmatic Implementation of Non-Blocking Linked-Lists" (DISC 2001) —
  same, one level further back.
- Herlihy, Shavit, Luchangco and Spear, *The Art of Multiprocessor Programming*, 2nd ed. — the
  syllabus's own reference for hash sets and split-ordered lists; not opened this session.
- A JDK 7 source or documentation for the pre-Java-8 segment design — not read this session, per
  `CHAPTER.md`'s own instruction not to state any detail of it without reading one first; this
  topic accordingly states nothing about the segment design beyond what the current source's own
  comment (quoted above) says about its stripped-down, compatibility-only remnant.
- Rust Systems Engineering Chapter 6, "Arc shares, Mutex synchronizes" — named by pointer only.
- The current stable `dashmap` release on crates.io: the crates.io API was unreachable from this
  environment this session (no response from a direct request); this topic cites `master`'s own
  shard-count formula explicitly as `master`'s, not as the released version's, per `CHAPTER.md`'s
  own flag that the formula shown there belongs to an unreleased 7.0.0 line.

### Red team

1. **The ConcurrentHashMap fetch required the same cache-seeding workaround** used for a PDF in
   the previous chapter and a C++ header in the previous topic: this environment's `sources.mjs`
   fetch pipeline corrupts Java generics and shift operators the same way it corrupts C++
   template angle brackets. Seeding the exact cache file with a clean `curl` fetch resolves it
   without changing the checker itself.
2. **The `jdk-21-ga` tag was not checked out specifically** — `jdk21u`'s `master` branch was read
   instead, and the quoted constants/comments were spot-checked against what `CHAPTER.md`
   expected to find (matching exactly). A reader comparing this topic against a different JDK
   21 point release should expect the same text, since these are long-stable design comments,
   but this was not independently re-verified against the exact tag.
3. **The segment (pre-Java-8) design is deliberately not described beyond the current source's
   own backward-reference comment**, per `CHAPTER.md`'s own instruction that it requires a JDK 7
   source before any detail is stated; none was read this session.
4. **dashmap's current released shard-count formula was not independently confirmed** — only
   `master`'s own (pre-release) formula was read, and is labeled as such throughout this topic.
