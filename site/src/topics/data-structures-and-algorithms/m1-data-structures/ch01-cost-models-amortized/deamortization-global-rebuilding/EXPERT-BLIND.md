# What an expert must know: Deamortization and global rebuilding

Syllabus line (Ch.1 §1.2): "turning amortized bounds into worst-case ones (incremental copying, scapegoat-style partial rebuilds) because p99 latency, not average cost, is what a service is judged on."

Written blind: only from sources fetched and read for this list (texts cached as /tmp/claude-0/blind-<n>.txt). Placement is one of: here, a named later topic, or out of scope.

1. **An amortized bound says nothing about any single operation, and some systems are judged per operation.** Real-time, parallel (one slow processor idles the rest) and interactive systems prefer predictability; users may prefer 100 one-second responses to 99 quarter-second ones plus one 25-second one, though the latter is twice as fast overall.
   Source: Okasaki, *Purely Functional Data Structures* (CMU-CS-96-177), ch.4 intro. https://www.cs.cmu.edu/~rwh/students/okasaki.pdf (blind-11).
   Placement: here.

2. **Tail latency compounds with fan-out.** If a server answers in 10 ms but has a 1 s 99th percentile, a request needing 100 such servers in parallel is slow 63% of the time; a rare per-node stall becomes a common service-level stall.
   Source: Dean & Barroso, "The Tail at Scale", CACM 2013. https://www.barroso.org/publications/TheTailAtScale.pdf (blind-14).
   Placement: here (the motivation for the whole topic).

3. **Global rebuilding (Overmars) runs the rebuild as a coroutine, a few steps per ordinary operation.** Two copies are kept: queries and updates use the working copy while a secondary copy is rebuilt, then it replaces the working copy. The hard part is starting early enough that it finishes before it is needed.
   Source: Okasaki ch.5.2 (blind-11).
   Placement: here.

4. **Updates arriving during a rebuild must be buffered and replayed.** The secondary copy is not in an updatable form, so updates are queued and applied a few at a time after the rebuild, before the swap. A deamortized design therefore needs a catch-up phase with its own bounded step cost.
   Source: Okasaki ch.5.2 (blind-11).
   Placement: here.

5. **Deamortizing costs complexity, not only constants.** Global rebuilding gives worst-case bounds and works with persistence, but is "often quite complicated"; capturing the half-finished rebuild is the mess. The practical recipe is to design the amortized structure first, then convert it.
   Source: Okasaki ch.4 intro and ch.5.2 (blind-11).
   Placement: here.

6. **Incremental is not enough: granularity and dependency chains matter.** Every unit of deferred work must have O(1) intrinsic cost, and a chain of suspensions that depend on each other can still cascade into one long operation. Scheduling forces them in an order that prevents this.
   Source: Okasaki ch.4.1 (blind-11).
   Placement: here (principle); mechanics in Ch.13 §13.1 "Amortization under persistence".

7. **Real-time queue: the textbook deamortization.** The banker's queue's monolithic `reverse` is replaced by `rotate`, which does one step of reverse per step of append, giving O(1) worst-case for every operation (the Hood–Melville result, via global rebuilding).
   Source: Okasaki ch.4.2 and ch.4.4 (blind-11).
   Placement: Ch.13 §13.1 "Amortization under persistence" (real-time queues).

8. **Amortization and persistence.** An amortized structure breaks when an old version is reused, because the same expensive step can be paid for repeatedly. Global rebuilding has no such problem because no single operation is expensive, so repeating one has no effect on the bounds.
   Source: Okasaki ch.5.2 (blind-11).
   Placement: Ch.13 §13.1 "Amortization under persistence".

9. **Scapegoat trees are not deamortized for updates.** The bound is O(log n) amortized per insert or delete and O(log n) worst-case search. One insert can still rebuild a large subtree, costing O(size) of the scapegoat, so p99 write latency is not bounded by the theorem. "Scapegoat-style" means partial rebuilds with amortized cost, not worst-case cost.
   Source: Galperin & Rivest, "Scapegoat Trees" (SODA 1993), abstract and Theorem 5.2. https://people.csail.mit.edu/rivest/pubs/GR93.pdf (blind-1).
   Placement: here.

10. **Scapegoat mechanism.** After an insert, walk up from the new leaf to the first ancestor that is not alpha-weight-balanced (the scapegoat) and rebuild that subtree into a 1/2-weight-balanced one. No colours or weights are stored, only the node count and the maximum count since the last full rebuild.
    Source: Galperin & Rivest, abstract and sections 3-5 (blind-1).
    Placement: here (Ch.4's balanced-BST list has no scapegoat entry).

11. **Deletes are handled by a global rebuild.** A full rebuild is triggered after Omega(n) deletions, and its cost is paid from those operations. This is amortized global rebuilding, not the incremental kind.
    Source: Galperin & Rivest, abstract and the proof of Theorem 5.3 (blind-1).
    Placement: here.

12. **A rebuild can be done in small extra space.** The paper states a subtree rebuild takes O(size) time and, per its Section 6, O(log n) extra space. This matters because a naive flatten allocates a copy of the subtree.
    Source: Galperin & Rivest, section 4 and 6 (blind-1).
    Placement: here.

13. **Redis `dict`: incremental rehash across two tables.** On resize a second table is prepared and `rehashidx` marks progress. Lookups and updates call a rehash step that moves one bucket, and the new table receives all inserts while rehashing.
    Source: Redis `src/dict.c` (7.2). https://raw.githubusercontent.com/redis/redis/7.2/src/dict.c (blind-2).
    Placement: Ch.3 §3.2 "Resizing and incremental rehashing" (here for the pattern).

14. **The per-step work itself must be bounded.** `dictRehash` visits at most N*10 empty buckets, because otherwise a sparse table makes a single "step" unbounded. A budget on buckets moved is not a budget on time.
    Source: Redis `dict.c`, comment above `dictRehash` (blind-2).
    Placement: here (lesson); Ch.3 §3.2 (code).

15. **Incremental rehash interacts with iterators and fork.** Rehash is paused while an iterator is mid-table (elements would be missed or duplicated), and resizing is suppressed to avoid copy-on-write memory churn during a save child, unless the load ratio exceeds `dict_force_resize_ratio` (5). The latency fix has memory and correctness side effects.
    Source: Redis `dict.c` (blind-2).
    Placement: Ch.3 §3.2.

16. **Go maps do the same with "evacuation".** When the table grows, a bucket array twice the size is allocated and buckets are incrementally copied from the old to the new one. Iterators stay on the old array and check the new one for moved buckets.
    Source: Go runtime `map.go` (go1.21.0 header comment). https://raw.githubusercontent.com/golang/go/go1.21.0/src/runtime/map.go (blind-6).
    Placement: Ch.3 §3.2.

17. **Not every production table deamortizes.** hashbrown's `resize` "allocates a new table of a different size and moves the contents of the current table into it", all at once, behind a `#[cold]` `reserve_rehash` path. It optimizes throughput and probe cost and accepts an O(n) insert at growth points; `reserve` ahead of time is the user's deamortization.
    Source: hashbrown `src/raw/mod.rs` v0.14.0. https://raw.githubusercontent.com/rust-lang/hashbrown/v0.14.0/src/raw/mod.rs (blind-31).
    Placement: Ch.3 §3.2 and Systems in Production (Swiss Tables).

18. **Concurrent resizing: Linux `rhashtable`.** Growth and shrink run in a deferred worker (`rht_deferred_worker`), grow above 75% load and shrink below 30%. A `future_tbl` pointer links the old table to the new one, and RCU-protected lookups continue during the rehash. Resizing is moved off the request path entirely.
    Source: Linux `lib/rhashtable.c` v6.6. https://raw.githubusercontent.com/torvalds/linux/v6.6/lib/rhashtable.c (blind-16).
    Placement: Ch.14 §14.2 "Concurrent hash maps".

19. **The pace rule: deferred work is proportional to the work that creates the debt.** Go's pacer makes an allocating goroutine do marking proportional to its allocation, so the collector finishes before the heap fills. This is the same "start early enough, progress with every operation" invariant as global rebuilding, and it slows the mutator to protect the cycle.
    Source: Hudson, "Getting to Go" (ISMM 2018 keynote). https://go.dev/blog/ismmkeynote (blind-7).
    Placement: here (the invariant); GC itself is out of scope.

20. **Latency work costs throughput.** The Go GC avoids pauses proportional to heap size by running concurrently, which "often leads to a design with lower throughput than an equivalent stop-the-world garbage collector". Deamortization is a trade, not a free win.
    Source: "A Guide to the Go Garbage Collector". https://go.dev/doc/gc-guide (blind-28).
    Placement: out of scope for garbage collectors; the trade-off statement is here.

21. **Deferred compaction becomes debt, and the system throttles or stalls writers.** RocksDB limits the write rate (`delayed_write_rate`) when pending compaction bytes or level-0 files pass thresholds, so background work can catch up; the alternative is a hard stall. A foreground `allow_write_stall` option shows the same choice.
    Source: RocksDB `include/rocksdb/options.h` v8.5.3. https://raw.githubusercontent.com/facebook/rocksdb/v8.5.3/include/rocksdb/options.h (blind-26).
    Placement: Ch.5 §5.2 "LSM compaction and amplification".

22. **A background budget that adapts upward can re-create the pause.** Redis's active expiry samples 20 keys ten times a second, but repeats if over 25% of the sample was expired, so if many keys expire in the same second Redis "can block". A hard per-slice time cap is what makes the worst case a worst case.
    Source: Redis docs, "Diagnosing latency issues", section on expires. https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/latency/ (blind-30).
    Placement: here (pitfall).

23. **Eliminating amortization is a research area with general frameworks.** Okasaki cites Dietz and Raman's pebble-game framework, with ad hoc scheduling for relaxed heaps and implicit binomial queues, and notes that global rebuilding is Overmars's technique (1983).
    Source: Okasaki ch.4.4 Related Work (blind-11).
    Placement: out of scope (pointer only).
