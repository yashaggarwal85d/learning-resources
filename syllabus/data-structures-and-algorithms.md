# Data Structures & Algorithms — Syllabus

The deep, engineering-grade treatment of data structures and algorithms for senior engineers. Every structure and algorithm is taught as a mechanism you can step through: the invariant it maintains, the cost model it is optimal under, the hardware it actually runs on, and the production system it powers (hash joins, LSM compaction, schedulers, routers, vector search). Interview fluency comes out of this as a by-product: you recognize the pattern because you have built the mechanism. Basics an expert already knows are tagged *(refresher)* and become short refresher reels for quick revision; everything else assumes you can already code and reason about Big-O.

**Approach:** patterns, not problem counts. Implement each structure or algorithm once from scratch, state its complexity under the right cost model (RAM, external-memory, cache-oblivious, work–span), argue its correctness by invariant, and name the real system mechanism it powers. Cross-references point to the other two domains: `→ *Data Engineering* §N.M` and `→ *Rust Systems Engineering* Ch.N`.

## Structure: Milestones → Chapters → Topics
- **Milestone 1 — Data Structures** (Ch.1–14): cost models and amortization first, then linear, hashed, tree, heap, trie, range-query, spatial, graph, set/cache, filter, persistent/succinct and concurrent structures.
- **Milestone 2 — Algorithms** (Ch.15–32): sorting, searching, graph algorithms, flows and matching, design paradigms, sequence and bit techniques, number theory, strings, geometry, randomized, streaming, external-memory and parallel algorithms.
- **Milestone 3 — Complexity, Patterns and Problem-Solving** (Ch.33–38): intractability, approximation and online algorithms, parameterized and structural complexity, pattern recognition, the data-system mapping, and practice discipline.
- Every topic is one reel; every milestone closes with a **Systems in Production** section.

## Canonical references
- Cormen, Leiserson, Rivest, Stein — *Introduction to Algorithms*, 4th ed. (MIT Press, 2022): the reference text for Ch.1–35 (adds bipartite matching and online algorithms in this edition).
- Sedgewick & Wayne — *Algorithms*, 4th ed. (Addison-Wesley, 2011) and its online booksite: implementation-first treatment of sorting, searching, graphs and strings (Ch.2–7, 15–18, 27).
- Skiena — *The Algorithm Design Manual*, 3rd ed. (Springer, 2020): the problem catalogue and "war stories" for modelling (Ch.20–23, 33–36).
- Erickson — *Algorithms*, 1st ed. (2019, free online): recursion, DP, graph and lower-bound reasoning (Ch.1, 17–23, 33).
- Kleinberg & Tardos — *Algorithm Design* (Pearson, 2005): greedy, flows, intractability, approximation (Ch.20–21, 33–34).
- Knuth — *The Art of Computer Programming*, Vols 1–3 and 4A/4B (4B: 2022): sorting, searching, hashing, combinatorial search and Dancing Links (Ch.3, 15–16, 23).
- Mehlhorn, Sanders, Dietzfelbinger, Dementiev — *Sequential and Parallel Algorithms and Data Structures: The Basic Toolbox* (Springer, 2019): engineering-minded and parallel versions (Ch.15, 31–32).
- Okasaki — *Purely Functional Data Structures* (CUP, 1998); Navarro — *Compact Data Structures* (CUP, 2016): Ch.13.
- Herlihy, Shavit, Luchangco, Spear — *The Art of Multiprocessor Programming*, 2nd ed. (Morgan Kaufmann, 2020): Ch.14.
- Mitzenmacher & Upfal — *Probability and Computing*, 2nd ed. (CUP, 2017); Cormode & Yi — *Small Summaries for Big Data* (CUP, 2020): Ch.12, 29–30.
- Vitter — *Algorithms and Data Structures for External Memory* (Now, 2008): Ch.1, 5, 31.
- Gusfield — *Algorithms on Strings, Trees, and Sequences* (CUP, 1997): Ch.27.
- Williamson & Shmoys — *The Design of Approximation Algorithms* (CUP, 2011); Cygan et al. — *Parameterized Algorithms* (Springer, 2015): Ch.34–35.
- Papers are named inline on the topic they ground (author, year, venue).

---

# Milestone 1 — Data Structures
The structures every serious system is built from, analysed under the cost model that actually decides their performance.

## Chapter 1 — Cost Models and Amortized Analysis
The machine models and analysis tools every later chapter uses to argue that a structure is fast, and on what hardware.

### 1.1 Asymptotics, recurrences and lower bounds
- **Asymptotic notation and case analysis** *(refresher)* — O/Θ/Ω/o/ω; best, average, worst, expected and with-high-probability bounds; time vs space trade-offs.
- **The word-RAM model and its assumptions** — unit-cost operations on w ≥ log n-bit words, what that hides (cache misses, branch mispredicts), and why integer-key structures (radix sort, van Emde Boas trees, fusion trees) beat comparison-model bounds.
- **Recurrences: Master theorem and Akra–Bazzi** — recursion-tree animation for the three Master cases, Akra–Bazzi for unequal splits (median-of-medians, Ch.16), and the substitution method for checking guesses.
- **Lower bounds and adversary arguments** — decision-tree Ω(n log n) for comparison sorting, element distinctness, 3n/2 − 2 comparisons for simultaneous min/max, information-theoretic bounds, and what a lower bound does (and does not) rule out.

### 1.2 Amortized analysis
- **Aggregate and accounting methods** — dynamic-array doubling, binary counter and multipop stack: charging cheap operations to pay for expensive ones.
- **The potential method** — choosing Φ, proving table expand/contract bounds, and why shrinking at ½ occupancy thrashes while shrinking at ¼ does not; the tool behind splay trees, union–find and Fibonacci heaps.
- **Deamortization and global rebuilding** — turning amortized bounds into worst-case ones (incremental copying, scapegoat-style partial rebuilds) because p99 latency, not average cost, is what a service is judged on.

### 1.3 Memory-hierarchy cost models
- **External-memory (I/O) model** — Aggarwal & Vitter (CACM 1988): parameters N, M, B; scan(N) = Θ(N/B), sort(N) = Θ((N/B) log_{M/B}(N/B)); why bytes moved, not comparisons, dominate data systems → *Data Engineering* §1.2, §1.3.
- **Cache-oblivious model** — Frigo, Leiserson, Prokop & Ramachandran (FOCS 1999): algorithms optimal for every unknown B and M under the tall-cache assumption; ideal-cache and LRU simulation arguments; the algorithms themselves are in Ch.31.
- **Measuring the memory hierarchy** — pointer-chasing and strided-access microbenchmarks that expose cache-line size, TLB reach and prefetcher behaviour; reading the latency staircase → *Rust Systems Engineering* Ch.29.
- *Lab:* plot latency vs working-set size with a pointer-chasing benchmark; then measure a doubling vs 1.5× dynamic array and a shrink-at-½ vs shrink-at-¼ policy under an adversarial push/pop sequence, and reconcile the measurements with the potential-function proof.

## Chapter 2 — Linear Structures
Sequential containers, judged by cache behaviour as much as by asymptotics.

### 2.1 Arrays, lists and queues
- **Dynamic arrays and growth policy** — amortized O(1) append, growth factor 2 vs 1.5 (memory-reuse argument), reserve/shrink, pointer invalidation on reallocation, and why contiguous storage wins on cache locality.
- **Linked and intrusive lists** — singly, doubly, circular; why pointer chasing usually loses to arrays; where lists still win: O(1) splice, stable addresses, intrusive lists in kernels and allocators (Linux `list_head`).
- **Stacks, queues and deques** *(refresher)* — LIFO/FIFO semantics; array-backed circular deque vs chunked block deque (C++ `std::deque`) and their iterator-stability trade-offs.
- **Monotonic stacks and queues** — next-greater-element and sliding-window maximum in O(n) amortized; the invariant that makes each element enter and leave once.
- **Ring buffers and bounded queues** — power-of-two index masking, full/empty disambiguation, overwrite vs block policies, and boundedness as backpressure → *Rust Systems Engineering* Ch.7, Ch.10.

### 2.2 Sequences of text
- **Strings and string builders** *(refresher)* — immutability, quadratic repeated concatenation, UTF-8 byte vs code-point indexing costs.
- **Ropes, gap buffers and piece tables** — the editor-buffer structures: gap buffer (cheap local edits), rope (balanced tree, O(log n) split/concat), piece table (append-only original + add buffers, used by VS Code since 2018), and which edit pattern each favours.
- *Lab:* build an SPSC ring buffer and a monotonic deque; benchmark a linked list vs a dynamic array for iterate/insert-middle at 10³–10⁷ elements and locate the crossover (if any) with hardware cache-miss counters.

## Chapter 3 — Hashing
Hash functions and hash tables from the probability guarantee down to SIMD probing, plus the hashing schemes that place data across machines.

### 3.1 Hash functions
- **Universal and k-independent hashing** — Carter–Wegman universality, multiply-shift, tabulation hashing, and why linear probing needs (roughly) 5-independence for its expected O(1) bound.
- **Practical hash functions and HashDoS** — fast non-cryptographic hashes (xxHash3, wyhash, FxHash) vs keyed hashes (SipHash, Rust's default `HashMap` hasher) vs cryptographic hashes (SHA-256, BLAKE3); collision-flooding attacks and per-process random seeds.

### 3.2 Hash tables
- **Separate chaining** *(refresher)* — load factor α, expected chain length, why chaining tolerates α > 1 and pays a pointer per entry.
- **Linear probing and open addressing** — primary clustering and Knuth's expected-probe analysis, quadratic probing and double hashing, tombstones vs backward-shift deletion.
- **Robin Hood hashing** — displacing "richer" entries to cut probe-length variance, early termination on lookup misses, backward-shift deletion.
- **Cuckoo hashing** — two choices and worst-case O(1) lookup, insertion eviction chains, cycles and rehash, bucketized and stashed variants (the basis of cuckoo filters, Ch.12).
- **SIMD group-probing tables (Swiss Tables)** — Abseil's `flat_hash_map` design (2017): H1/H2 hash split, one control byte per slot, matching 16 slots per SIMD instruction; adopted by Rust's `hashbrown` (std `HashMap`) and Go's built-in map since Go 1.24.
- **Resizing and incremental rehashing** — doubling with amortized cost vs incremental migration across two tables (Redis `dict`) to bound per-operation latency; hash tables under memory pressure.
- **Perfect and minimal perfect hashing** — FKS two-level static hashing; modern MPHFs (RecSplit, PTHash/PtrHash, BBHash) at ~1.5–4 bits per key for static key sets.

### 3.3 Distributed and authenticated hashing
- **Consistent hashing rings** — ring placement, virtual nodes for balance, minimal remapping on join/leave, and consistent hashing with bounded loads (Mirrokni, Thorup, Zadimoghaddam, SODA 2018) → *Data Engineering* §5.3.
- **Rendezvous, jump and Maglev hashing** — highest-random-weight hashing (Thaler & Ravishankar), jump consistent hash (Lamping & Veach, 2014) for numbered shards, Maglev's lookup-table hashing (NSDI 2016) for load balancers; disruption vs balance vs memory.
- **Merkle trees** — hash trees for verifying and diffing large datasets in O(log n): anti-entropy repair in Dynamo/Cassandra, Git objects, certificate transparency; content-defined variants (prolly trees) for diffable indexes.
- *Lab:* implement linear-probing, Robin Hood and SIMD-group tables; measure probe-length distributions and throughput vs load factor, then flood each with adversarial keys under a weak hash and a keyed hash; separately measure key movement for ring vs jump vs rendezvous hashing when growing 10 → 11 nodes.

## Chapter 4 — Binary Search Trees and Balancing
Ordered in-memory dictionaries: how each balancing scheme buys O(log n) and what it costs on real workloads.

### 4.1 Balanced binary search trees
- **BST operations and rotations** *(refresher)* — search, insert, delete (successor swap), in-order traversal; the rotation as the one primitive all balancing schemes share.
- **AVL trees** — height-balance invariant, the four rotation cases, height ≤ ~1.44 log₂ n; why the tighter bound favours read-heavy workloads.
- **Red-black trees** — colour invariants as an encoding of 2-3-4 trees, at most three rotations per update and O(1) amortized recolourings; the default ordered map in `std::map`, Java `TreeMap` and many Linux kernel subsystems.
- **Splay trees** — self-adjusting by splaying to the root; amortized O(log n) via the access lemma; working-set and static-optimality properties; the open dynamic-optimality conjecture.
- **Treaps and split/merge trees** — random priorities giving expected O(log n) depth; split and merge as primitives; implicit treaps as sequences with O(log n) insert-anywhere, reverse and concatenate.

### 4.2 Augmented trees
- **Order-statistic trees** — subtree-size augmentation for rank and select in O(log n); the general rule for which augmentations survive rotations.
- **Interval trees** — max-endpoint augmentation for overlap and stabbing queries; centred interval trees for static sets → Ch.8 for array-based range structures.
- *Lab:* implement AVL, red-black and a treap with split/merge; replay sequential, random and Zipfian traces and compare height, rotations per op and throughput; add rank/select to one of them.

## Chapter 5 — B-Trees and Write-Optimized Trees
Search trees designed for blocks, not nodes: the indexes inside every database and filesystem.

### 5.1 B-trees
- **B-tree and B+-tree mechanics** — fanout B, splits and merges, all keys in leaves with sibling links for range scans, height 3–4 for billions of keys; Θ(log_B N) I/Os per search → *Data Engineering* §5.1, *Rust Systems Engineering* Ch.21.
- **B-tree node engineering** — prefix and suffix truncation, key normalization, slotted node layout, fill factor, bulk loading from sorted input, and deduplication of duplicate keys (PostgreSQL 13+) → *Rust Systems Engineering* Ch.19.
- **Copy-on-write B-trees** — path copying to the root instead of in-place update (LMDB, Btrfs): crash safety and snapshots without a WAL, at the cost of write amplification and free-space management.
- **Maple trees and range-based B-trees** — B-trees keyed by ranges with gap tracking and RCU-safe readers; the Linux maple tree that replaced the VMA red-black tree, linked list and cache in Linux 6.1 (and the StackRot CVE-2023-3269 bug that followed).

### 5.2 Write-optimized structures
- **LSM-tree write and read paths** — WAL + memtable, flush to immutable sorted runs (SSTables), newest-first reads with Bloom filters and fence pointers, tombstones → *Data Engineering* §5.1, *Rust Systems Engineering* Ch.22.
- **LSM compaction and amplification** — leveled vs tiered vs hybrid compaction; read, write and space amplification and the RUM trade-off (Athanassoulis et al., EDBT 2016); Monkey (SIGMOD 2017) per-level filter sizing and Dostoevsky (SIGMOD 2018) lazy leveling.
- **Bε-trees and fractal trees** — buffered messages in internal nodes; the optimal insert/query trade-off curve (Brodal & Fagerberg, SODA 2003); TokuDB/PerconaFT and BetrFS.
- **Learned indexes** — replacing tree search with a model of the key CDF (Kraska et al., SIGMOD 2018 RMI; PGM-index, VLDB 2020; ALEX); error bounds, update handling, and where they beat B-trees in practice and where they do not.
- *Lab:* build a disk-backed B+-tree and a two-level LSM over the same page store; drive both with insert-heavy, read-heavy and range-scan workloads and report write amplification, read amplification and space amplification against the RUM triangle.

## Chapter 6 — Heaps and Priority Queues
The structures behind top-N, k-way merges, schedulers and shortest paths, and why the asymptotically best one is rarely the fastest.

### 6.1 Array heaps
- **Binary heaps and heapify** *(refresher)* — sift-up/sift-down, O(n) bottom-up build (sum-of-heights argument), heap as an implicit tree in an array.
- **d-ary heaps** — fewer levels, cheaper decrease-key, costlier extract-min; why 4-ary heaps are the practical default for Dijkstra; cache-line-aligned children.
- **Monotone integer priority queues** — bucket queues (Dial's algorithm) and radix heaps for integer keys that never go below the last extracted minimum; O(m + n log C) shortest paths.

### 6.2 Mergeable and amortized heaps
- **Binomial and pairing heaps** — binomial forests with O(log n) meld; pairing heaps' simple two-pass merge and strong practical performance; the still-open exact decrease-key bound for pairing heaps.
- **Fibonacci heaps** — lazy consolidation, cascading cuts, O(1) amortized decrease-key via the potential method; why they yield O(m + n log n) Dijkstra yet lose in practice to constants and pointer chasing.
- **Tournament and loser trees** — k-way merge with ⌈log₂ k⌉ comparisons per output and one root-to-leaf replay; the merge kernel of external sorting and LSM compaction (Ch.15).
- *Lab:* implement binary, 4-ary, pairing and radix heaps; run Dijkstra on a road graph and a random graph with each, then a 256-way merge with a heap vs a loser tree; report comparisons, cache misses and wall time.

## Chapter 7 — Tries and Ordered String Dictionaries
Structures keyed by the bits or characters of the key rather than by comparisons.

### 7.1 Tries
- **Tries and node representations** — array, hash, sorted-list and ternary-search-tree children; O(key length) lookup independent of n; the memory blow-up that drives every later design.
- **Radix and Patricia trees** — path compression of unary chains; crit-bit trees; the Linux radix tree and its successor XArray.
- **Longest-prefix-match lookup** — IP routing tables as tries; multibit and level-compressed tries, DIR-24-8 style tables and Poptrie (SIGCOMM 2015); lookups per second vs memory.
- **Adaptive radix trees (ART)** — Leis, Kemper & Neumann (ICDE 2013): Node4/16/48/256 adapting to fanout, SIMD search in Node16, path compression and lazy expansion; the in-memory index in HyPer and DuckDB.

### 7.2 Automata as dictionaries
- **Finite-state transducers** — minimal acyclic automata sharing prefixes and suffixes, mapping keys to outputs; Lucene's term dictionary and the Rust `fst` crate; fuzzy and regex search by intersecting automata.
- *Lab:* build a plain trie, a Patricia trie and an ART over 10M URLs or IP prefixes; compare memory per key, lookup latency and range-scan speed against a sorted array with binary search.

## Chapter 8 — Range-Query Structures
Answering aggregate queries over ranges of an array while it changes.

### 8.1 Static and dynamic range queries
- **Sparse tables and RMQ** — O(n log n) preprocessing for O(1) idempotent range-min queries; the Euler-tour reduction from LCA to RMQ (Ch.17).
- **Fenwick trees** — lowest-set-bit indexing for prefix sums with point updates in O(log n); range-update/range-query with two trees; 2D Fenwick trees.
- **Segment trees and lazy propagation** — recursive and iterative (bottom-up) layouts, arbitrary associative combine functions, lazy tags for range assignment and range add, and what makes a tag composable.
- **Square-root decomposition and Mo's algorithm** — block decomposition for awkward updates; offline query reordering for O((n + q)√n) range queries.
- *Lab:* implement a Fenwick tree, a lazy segment tree and a sparse table; benchmark range-sum and range-min workloads at varying update/query ratios and explain the winners per ratio.

## Chapter 9 — Spatial and High-Dimensional Indexes
Indexing points and shapes in 2–3 dimensions, and approximate search in hundreds.

### 9.1 Low-dimensional spatial indexes
- **k-d trees** — median splits by cycling dimension, nearest-neighbour search with branch pruning, and the curse of dimensionality that makes them degrade to a scan beyond ~20 dimensions.
- **Quadtrees and octrees** — region and point quadtrees, adaptive subdivision, collision and level-of-detail uses; why depth depends on point spacing, not n.
- **Space-filling curves and cell indexes** — Z-order (Morton) and Hilbert curves linearising multi-dimensional keys; geohash, S2 cells and H3 hexagons; Z-order in Delta Lake `ZORDER BY` and Hilbert curves in Delta liquid clustering → *Data Engineering* §6.3.
- **R-trees** — minimum bounding rectangles, quadratic and R* split heuristics, Sort-Tile-Recursive bulk loading; spatial indexes in PostGIS (GiST) and SQLite.

### 9.2 Approximate nearest-neighbour search
- **Graph-based ANN: HNSW and Vamana** — navigable small-world graphs, greedy search with a beam (ef), layer hierarchy (Malkov & Yashunin, TPAMI 2020); Vamana/DiskANN (NeurIPS 2019) for SSD-resident indexes; recall vs latency vs memory → *Data Engineering* §17.1.1.
- **Quantization-based ANN: IVF and PQ** — inverted-file coarse clustering plus product quantization (Jégou et al., TPAMI 2011) with asymmetric distance tables; scalar and binary quantization; re-ranking with exact vectors.
- *Lab:* build a k-d tree and an HNSW index over 1M vectors at d = 2, 16 and 128; plot recall@10 vs queries/second and show where the k-d tree collapses.

## Chapter 10 — Graph Representations
How a graph is laid out in memory decides which algorithms are fast on it.

### 10.1 Representations
- **Adjacency lists, matrices and edge lists** *(refresher)* — space and query costs, directed/undirected, weighted, multigraph and DAG terminology; which representation each later algorithm assumes.
- **Compressed sparse row (CSR) and reordering** — offsets + targets arrays, CSC for reverse edges, building CSR from an edge list in two passes; vertex reordering (degree sort, BFS/RCM, community order) to improve locality on billion-edge graphs.
- **Graphs as sparse matrices** — BFS as sparse matrix–vector multiplication over a semiring; the GraphBLAS API and when linear-algebra formulations beat vertex-centric code.
- **Property-graph storage** — index-free adjacency vs relational edge tables vs CSR snapshots; labels and properties as columns → *Data Engineering* §17.3, §17.4.
- *Lab:* load a 100M-edge graph into adjacency lists of vectors and into CSR; time BFS on both before and after degree-based reordering and attribute the gap with cache-miss counters.

## Chapter 11 — Disjoint Sets, Skip Lists and Cache Structures
Three workhorse structures that sit inside clustering, memtables and caches.

### 11.1 Disjoint sets and skip lists
- **Union–find** — union by rank/size plus path compression (or halving/splitting), the O(α(n)) amortized bound (Tarjan 1975), and uses: Kruskal, connected components, entity-resolution clusters → *Data Engineering* §8.3.
- **Skip lists** — geometric tower heights, expected O(log n) search, simple ordered iteration; why they are easy to make concurrent; the memtable in LevelDB/RocksDB and Redis sorted sets (skip list + hash table) → Ch.14.

### 11.2 Cache structures and eviction
- **LRU caches** — hash map + doubly linked list for O(1) get/put; CLOCK as the lock-friendly approximation; Redis's sampled approximate LRU → *Data Engineering* §5.5.
- **Scan-resistant policies: LFU, 2Q, ARC, LIRS** — why plain LRU is flushed by one large scan; frequency counting and decay, ghost lists and adaptive partitioning in ARC (Megiddo & Modha, FAST 2003), reuse distance in LIRS.
- **Admission and FIFO-based eviction** — W-TinyLFU's sketch-based admission (Caffeine), and the FIFO-queue designs S3-FIFO (SOSP 2023) and SIEVE (NSDI 2024) that beat LRU on hit ratio with lock-free-friendly operations.
- *Lab:* implement union–find with and without path compression and time 10⁷ operations; then implement LRU, ARC and SIEVE and replay a public cache trace (e.g. a CDN or block-I/O trace) to compare miss ratios and throughput.

## Chapter 12 — Filters and Approximate Membership
Answering "is x in the set?" in a few bits per key, with one-sided error.

### 12.1 Dynamic filters
- **Bloom filters and false-positive math** — k hash functions over m bits, FPR ≈ (1 − e^{−kn/m})^k, optimal k = (m/n) ln 2, ~1.44 log₂(1/ε) bits per key; double hashing to derive k probes; no deletes → *Data Engineering* §5.6.
- **Blocked and partitioned Bloom filters** — confining all probes to one cache line (Putze, Sanders & Singler, 2007) for one miss per query at a small FPR cost; the cache-local Bloom format in RocksDB.
- **Cuckoo filters** — fingerprints in bucketized cuckoo tables with partial-key cuckoo hashing (Fan et al., CoNEXT 2014); deletes, better space than Bloom below ~3% FPR, and insertion failure near capacity.
- **Quotient filters** — quotienting fingerprints into a compact linear-probed table with metadata bits; counting and resizable variants (counting quotient filter, SIGMOD 2017); merges and range-friendly locality.

### 12.2 Static and range filters
- **Xor, binary fuse and ribbon filters** — static filters built by solving a linear system / peeling a hypergraph: xor filters (Graf & Lemire, 2020), binary fuse filters (2022) at ~1.13× the information-theoretic minimum, ribbon filters (Dillinger & Walzer, 2021; available in RocksDB, ~30% smaller than Bloom at equal FPR); build cost vs query cost vs space.
- **Range filters** — answering "any key in [a, b]?" for LSM range scans: SuRF (SIGMOD 2018) on succinct tries, Rosetta, and newer designs; why point filters cannot do this.
- *Lab:* implement a standard and a blocked Bloom filter and a cuckoo filter; at 8, 12 and 16 bits/key measure FPR, queries/second and cache misses, then compare against a ribbon or binary fuse filter library.

## Chapter 13 — Persistent, Succinct and Compressed Structures
Keeping every version cheaply, and storing structures in close to the information-theoretic minimum while still querying them.

### 13.1 Persistent structures
- **Path copying** — partial vs full vs confluent persistence; copying the root-to-leaf path of a balanced tree for O(log n) space per update; versions as roots (MVCC snapshots, undo, time travel).
- **Fat nodes and node copying** — Driscoll, Sarnak, Sleator & Tarjan (JCSS 1989): O(1) amortized extra space per update for bounded in-degree structures; the persistent segment tree as an application.
- **Hash array mapped tries (HAMT)** — Bagwell (2001): bitmap-indexed 32-way tries giving near-O(1) persistent maps; CHAMP's canonical compact layout (OOPSLA 2015); Clojure and Scala collections.
- **Persistent vectors and RRB trees** — 32-way radix-balanced trees with tail buffers; relaxed radix-balanced trees for O(log n) concat and split.
- **Amortization under persistence** — why amortized bounds break when an old version is reused; Okasaki's banker's and physicist's methods with lazy evaluation; real-time queues.

### 13.2 Succinct and compressed structures
- **Rank and select on bitvectors** — o(n) extra bits for O(1) rank/select (Jacobson 1989); practical layouts (rank9, poppy) and their cache behaviour; the primitive under every structure below.
- **Elias–Fano encoding** — monotone sequences in ~2 + log(U/n) bits per element with O(1) access and fast successor; quasi-succinct posting lists (Vigna, WSDM 2013) and partitioned Elias–Fano.
- **Wavelet trees** — rank/select/access over arbitrary alphabets in n log σ bits; range quantile and range counting queries; the engine of the FM-index (Ch.27).
- **Succinct trees: LOUDS and balanced parentheses** — ordinal trees in 2n + o(n) bits with navigation by rank/select; the representation behind SuRF and Marisa tries.
- **Compressed bitmaps: Roaring** — 2¹⁶-value chunks stored as array, bitmap or run containers chosen per chunk (Chambi, Lemire et al., 2016); fast AND/OR; used for bitmap indexes and posting lists in Lucene, Druid, Pinot and Spark.
- **Integer compression** — varint/LEB128, frame-of-reference, PFOR, SIMD bit-packing and Stream VByte; decode speed vs ratio for posting lists and columnar pages → *Data Engineering* §5.1, *Rust Systems Engineering* Ch.24.
- *Lab:* build a persistent map by path copying and measure space per version; then encode a 100M-entry posting list with varint, Elias–Fano and Roaring, and compare bits per element, intersection speed and random access.

## Chapter 14 — Concurrent and Lock-Free Structures
Structures that stay correct and scalable when many threads touch them at once; the memory-model details live in the Rust domain.

### 14.1 Foundations
- **Progress guarantees and linearizability** — blocking vs obstruction-, lock- and wait-free progress; linearizability as the correctness criterion (Herlihy & Wing, TOPLAS 1990) and why it composes → *Rust Systems Engineering* Ch.7.
- **Treiber stacks and the ABA problem** — the CAS-loop stack, how ABA corrupts it, and tagged pointers as the first fix → *Rust Systems Engineering* Ch.7.
- **Safe memory reclamation** — hazard pointers (Michael, 2004), epoch-based reclamation (crossbeam-epoch), RCU and quiescent-state reclamation; bounded garbage vs read-side cost; hazard pointers and RCU in the C++26 standard library → *Rust Systems Engineering* Ch.30.

### 14.2 Concurrent structures
- **Michael–Scott queues** — the two-pointer lock-free linked queue (PODC 1996) with helping on a lagging tail.
- **Bounded MPMC ring queues** — per-slot sequence numbers (Vyukov's bounded queue), the LMAX Disruptor's sequence barriers, and false-sharing-aware padding → *Rust Systems Engineering* Ch.7, Ch.29.
- **Concurrent hash maps** — lock striping, Java `ConcurrentHashMap` (CAS on bins, treeified bins), split-ordered lists (Shalev & Shavit, JACM 2006) for lock-free resizing; sharded maps (`dashmap`).
- **Concurrent skip lists** — lock-free insertion bottom-up with marked deletion pointers; Java `ConcurrentSkipListMap` and RocksDB's concurrent memtable inserts.
- **B-link trees and optimistic lock coupling** — Lehman & Yao (TODS 1981) right-links that let readers skip latches; optimistic lock coupling with version counters (Leis et al., DaMoN 2016) for B-trees and ART.
- **Latch-free Bw-trees** — delta records and a mapping table updated by CAS (Levandoski et al., ICDE 2013, Hekaton); and the later finding that a well-built latch-based B+-tree often wins (Wang et al., SIGMOD 2018).
- **Testing concurrent structures** — linearizability checkers (Knossos, Porcupine), systematic schedule exploration with loom, and stress tests that actually expose weak-memory bugs → *Rust Systems Engineering* Ch.42.
- *Lab:* implement a Treiber stack with hazard-pointer or epoch reclamation and a bounded MPMC queue; verify both with loom or a linearizability checker, then benchmark against a `Mutex<VecDeque>` at 1–32 threads and explain the curve.

## Systems in Production — Milestone 1: structures inside real engines
- **Abseil Swiss Tables (Google, 2017; Kulukundis, CppCon) — a hash table designed around the SIMD unit.** Forcing problem: `std::unordered_map`'s node-per-entry chaining wasted memory and missed cache on every probe across Google's fleet. Mechanism: open addressing with a control-byte array matched 16 at a time by SIMD, H1/H2 split, tombstone-aware probing. Trade-offs: no pointer stability, iteration order is random by design. What it proves: constant factors from memory layout beat asymptotic tweaks; the design spread to Rust (`hashbrown`) and Go (1.24).
- **LevelDB and RocksDB (Google 2011; Meta 2012–) — skip lists, filters and compaction as one system.** Forcing problem: write-heavy workloads on flash where B-tree random writes were too slow. Mechanism: skip-list memtable, sorted immutable SSTables, per-file Bloom (optionally ribbon) filters, leveled/universal compaction, block cache. Trade-offs: read and space amplification and compaction debt in exchange for sequential writes. What it proves: Chapters 5, 11 and 12 compose into a production storage engine.
- **Linux maple tree (Howlett & Wilcox, merged 6.1, 2022) — replacing three structures with one B-tree.** Forcing problem: VMAs were tracked by an augmented red-black tree, a linked list and a cache, all under `mmap_lock`. Mechanism: a range-keyed, RCU-safe B-tree with gap tracking. Trade-offs: new complexity that shipped a use-after-free (StackRot, CVE-2023-3269). What it proves: cache-friendly B-trees and RCU beat pointer trees in the kernel too, and concurrent structures need concurrent proofs.
- **Lucene term dictionaries and postings (Apache Lucene) — automata and compressed integers as a search engine.** Forcing problem: billions of terms and postings must be searchable from memory-mapped files. Mechanism: FST term index, block-encoded postings with skip data, Roaring-style bitsets for filters. Trade-offs: immutable segments plus merge cost for updates. What it proves: succinct and automaton structures (Ch.7, Ch.13) are mainstream infrastructure.

---

# Milestone 2 — Algorithms
The algorithm families an expert reaches for, each stepped through until its invariant and its cost on real hardware are obvious.

## Chapter 15 — Sorting
From comparison sorting theory to the hybrid, SIMD, parallel and external sorts that production libraries and engines actually run.

### 15.1 In-memory comparison sorts
- **Elementary sorts and sorting networks** *(refresher)* — insertion, selection and bubble sort; stability and in-place vocabulary; why insertion sort and small sorting networks still finish every hybrid sort on tiny or nearly sorted ranges; the Ω(n log n) bound from Ch.1.
- **Merge sort** — top-down vs bottom-up, stability, O(n) buffer, natural (run-adaptive) merging.
- **Quicksort and partitioning schemes** — Lomuto vs Hoare partitioning, randomized and median-of-three pivots, three-way (Dutch national flag) partitioning for duplicates, dual-pivot quicksort (Java primitives), branchless block partitioning (BlockQuicksort, ESA 2016).
- **Heapsort** *(refresher)* — in-place, worst-case O(n log n), poor locality; its role as the fallback in introsort.
- **Introsort and pdqsort** — depth-limited quicksort falling back to heapsort; pattern-defeating quicksort's pattern detection and adversary resistance; pdqsort in Go's `sort` since Go 1.19 and its successor ipnsort as Rust's `sort_unstable` since Rust 1.81.
- **Timsort, Powersort and driftsort** — run detection, galloping merges and merge-policy invariants; the 2015 Timsort invariant bug found by formal verification; CPython 3.11's switch to the Powersort merge policy; driftsort as Rust's stable `sort` since Rust 1.81.

### 15.2 Integer, parallel and external sorts
- **Counting, radix and bucket sort** — LSD vs MSD radix sort, American-flag in-place MSD, key normalization of multi-column keys to byte strings (as in DuckDB's sort), and when O(n·w/log n) beats O(n log n).
- **SIMD and parallel sorting** — vectorized quicksort (Google Highway vqsort; x86-simd-sort in NumPy), sample sort and IPS⁴o (in-place parallel super-scalar samplesort), and their scaling limits from memory bandwidth.
- **External merge sort** — run generation (replacement selection gives runs ~2M long), multi-way merging with loser trees (Ch.6), number of passes log_{M/B}(N/M), and the spill path of large sorts, joins and aggregations → *Data Engineering* §1.3, Ch.7.
- *Lab:* implement quicksort with Lomuto, Hoare and three-way partitioning plus LSD radix sort; benchmark against your stdlib's stable and unstable sorts on random, sorted, reverse, few-unique and Zipfian inputs; then sort a file 10× larger than RAM with an external merge sort and count passes and bytes moved.

## Chapter 16 — Searching and Selection
Finding positions, boundaries and order statistics, and making search cache-friendly.

### 16.1 Binary search
- **Binary search invariants and boundaries** — half-open intervals, lower/upper bound, first/last occurrence, the overflow-safe midpoint (the bug found in many libraries in 2006), and proving termination by invariant.
- **Binary search on the answer** — searching a monotone predicate over the answer space (capacity, rate, threshold); real-valued bisection and its iteration count; parametric search.
- **Cache-friendly and branchless search** — branchless binary search with conditional moves, the Eytzinger (BFS) layout with prefetching (Khuong & Morin, 2017), and static B-tree (S-tree) layouts with SIMD node search.
- **Exponential and interpolation search** — galloping to bound an unbounded range (used in Timsort merges and posting-list intersection); interpolation search's O(log log n) expected time on uniform keys and its failure on skew.
- **Search in rotated and sorted matrices** — locating the pivot of a rotated array and staircase search over a row- and column-sorted matrix; the interview variants and their invariants.

### 16.2 Selection
- **Quickselect and median-of-medians** — expected O(n) quickselect, deterministic BFPRT with groups of five, introselect, and Floyd–Rivest sampling for fewer comparisons in practice; `nth_element`-style top-k.
- *Lab:* implement standard, branchless and Eytzinger binary search over arrays from 1 KB to 1 GB and plot ns/lookup against cache levels; implement quickselect and median-of-medians and compare them on adversarial inputs.

## Chapter 17 — Graph Traversal and Connectivity
Systematic exploration of graphs and the structure it reveals.

### 17.1 Traversal
- **Breadth-first search** — level-by-level frontier, unweighted shortest paths, multi-source BFS, 0-1 BFS with a deque, bipartiteness and odd-cycle detection by 2-colouring, and direction-optimizing BFS (Beamer et al., SC 2012) for low-diameter graphs.
- **Depth-first search and edge classification** — discovery/finish times, tree/back/forward/cross edges, three-colour cycle detection in directed graphs and parent-check in undirected graphs, iterative DFS with an explicit stack to avoid recursion-depth limits.
- **Topological sort** — Kahn's in-degree queue vs reverse DFS finish order, cycle detection as a by-product, lexicographically smallest order with a heap, and critical-path scheduling on DAGs → *Data Engineering* Ch.11.

### 17.2 Connectivity and tree structure
- **Strongly connected components** — Tarjan's low-link single pass vs Kosaraju's two passes, the condensation DAG, and 2-SAT solved via SCCs.
- **Articulation points, bridges and biconnectivity** — low-link values in undirected DFS, biconnected components, and what they say about single points of failure in a network.
- **Eulerian paths and circuits** — degree conditions, Hierholzer's linear-time algorithm, de Bruijn sequences; contrasted with the NP-complete Hamiltonian path (Ch.33).
- **Lowest common ancestor** — binary lifting, Euler tour + RMQ for O(1) queries (Ch.8), Tarjan's offline LCA with union–find; tree path queries.
- *Lab:* implement iterative DFS, Tarjan's SCC and Kahn's topological sort on a 10M-node dependency graph (e.g. a package or DAG-scheduler graph); find cycles, report the condensation DAG and the critical path.

## Chapter 18 — Shortest Paths
Single-source, all-pairs and goal-directed shortest paths, from the textbook to road-network routing.

### 18.1 Classic algorithms
- **Dijkstra's algorithm** — label-setting with a priority queue, why non-negative weights are required, lazy deletion vs decrease-key, O((m + n) log n) with a binary heap.
- **Bellman–Ford and negative cycles** — |V| − 1 relaxation rounds, negative-cycle detection and extraction (currency arbitrage), the queue-based SPFA variant and its worst case.
- **Floyd–Warshall and Johnson's algorithm** — O(n³) DP over intermediate vertices, transitive closure, path reconstruction; Johnson's potential reweighting for all-pairs on sparse graphs with negative edges.
- **DAG shortest and longest paths** — relaxation in topological order in O(n + m); longest path and critical path in schedules.

### 18.2 Goal-directed and frontier algorithms
- **A\* search and admissible heuristics** — f = g + h, admissibility vs consistency, A\* as Dijkstra with reduced costs; landmark (ALT) heuristics.
- **Bidirectional search and contraction hierarchies** — meeting in the middle, node contraction with shortcut edges (Geisberger et al., 2008), and the upward/downward query that answers continental road queries in about a millisecond (OSRM, GraphHopper); hub labelling.
- **Frontier: beyond Dijkstra's bounds** — Dijkstra's universal optimality with a working-set heap (Haeupler et al., FOCS 2024 best paper), deterministic O(m log^{2/3} n) directed SSSP breaking the sorting barrier (Duan et al., STOC 2025 best paper), and near-linear negative-weight SSSP (Bernstein, Nanongkai & Wulff-Nilsen, 2022); what each means and does not mean in practice.
- *Lab:* implement Dijkstra (binary and 4-ary heap), A\* with a geometric heuristic and bidirectional Dijkstra on an OpenStreetMap extract; compare nodes settled and latency, then run a contraction-hierarchy router (e.g. OSRM) on the same queries.

## Chapter 19 — Minimum Spanning Trees
Greedy optimal trees and the cut property behind them.

### 19.1 Algorithms
- **Cut property and Kruskal's algorithm** — cut and cycle properties as the correctness proof; sorting edges plus union–find (Ch.11).
- **Prim's algorithm** — growing one tree with a priority queue; O(n²) array version for dense graphs vs heap version for sparse ones.
- **Borůvka and parallel MST** — simultaneous cheapest-edge contraction in O(log n) rounds, its fit for parallel and distributed settings, and the randomized linear-time Karger–Klein–Tarjan algorithm; single-linkage clustering as an MST cut.
- *Lab:* implement Kruskal, Prim and Borůvka; compare them on sparse and dense graphs, then parallelize Borůvka and measure speed-up.

## Chapter 20 — Network Flows and Matching
Flows, cuts and matchings: the most general polynomial-time modelling tools.

### 20.1 Maximum flow
- **Max-flow min-cut and Ford–Fulkerson** — residual graphs, augmenting paths, the max-flow min-cut theorem, integrality, and non-termination with irrational capacities.
- **Edmonds–Karp and Dinic's algorithm** — shortest augmenting paths in O(VE²); level graphs and blocking flows in O(V²E), O(E√V) on unit networks such as bipartite matching.
- **Push–relabel** — preflows, height labels, highest-label selection with gap and global-relabel heuristics; the practical choice for large dense instances.
- **Global minimum cut** — Stoer–Wagner's deterministic algorithm vs Karger's randomized contraction (Ch.29).
- **Frontier: almost-linear-time flows** — max flow and min-cost flow in m^{1+o(1)} time via interior-point methods and dynamic data structures (Chen, Kyng, Liu, Peng, Probst Gutenberg & Sachdeva, FOCS 2022 best paper) and why practical solvers still use push–relabel and network simplex.

### 20.2 Matching and assignment
- **Bipartite matching and Hopcroft–Karp** — matching as unit flow, augmenting paths, O(E√V) phases, König's theorem relating matchings and vertex covers.
- **Hungarian algorithm** — weighted bipartite assignment in O(n³) via dual potentials; the assignment problem in task and resource allocation.
- **Min-cost flow** — successive shortest paths with Johnson potentials, cycle cancelling, network simplex; modelling transport and scheduling problems.
- **General matching and Edmonds' blossoms** — why odd cycles break bipartite augmenting-path search and how blossom contraction repairs it.
- **Stable matching** — Gale–Shapley deferred acceptance, proposer-optimality, and its use in residency and school-choice markets.
- *Lab:* model a cluster-scheduling problem (tasks × machines with locality costs) as min-cost flow; solve it with your own successive-shortest-paths code and with a library solver, and compare against a greedy scheduler on cost and runtime.

## Chapter 21 — Divide and Conquer and Greedy Algorithms
Two design paradigms, each with a proof technique that tells you when it works.

### 21.1 Divide and conquer
- **Divide-and-conquer design** *(refresher)* — split, solve, combine; merge sort and binary search as the template; reading the cost off the recurrence (Ch.1).
- **Closest pair of points** — the O(n log n) strip argument and why only a constant number of neighbours must be checked.
- **Karatsuba and Strassen** — trading multiplications for additions: O(n^1.585) integer multiplication and O(n^2.81) matrix multiplication; cross-over points and numerical stability.
- **Fast Fourier transform for convolution** — Cooley–Tukey radix-2 recursion, polynomial multiplication in O(n log n), the number-theoretic transform for exact modular convolution, and big-integer multiplication.

### 21.2 Greedy algorithms
- **Exchange arguments and matroids** — proving a greedy choice safe by exchange; matroids as exactly the structures where greedy is optimal; counter-examples where greedy fails (coin systems, 0/1 knapsack).
- **Huffman coding** — optimal prefix codes by repeated merging of the two lightest trees; canonical Huffman codes as used in DEFLATE and zstd literals.
- **Asymmetric numeral systems** — Duda's ANS: arithmetic-coding compression at Huffman-like speed via a single integer state; table-based tANS (FSE) in zstd and range ANS in modern codecs → *Data Engineering* §6.1.
- *Lab:* implement FFT-based polynomial multiplication and compare with schoolbook and Karatsuba to find the cross-overs; implement Huffman and tANS coders and compare compressed size and throughput on text and on skewed column data.

## Chapter 22 — Dynamic Programming
Designing states and transitions, then making them fast.

### 22.1 Foundations and classic forms
- **DP state design** — optimal substructure and overlapping subproblems; state, transition, base case and evaluation order; memoization vs tabulation; rolling arrays for space; reconstructing the argmax path.
- **Knapsack and coin change** — 0/1, unbounded and bounded knapsack; coin change count vs minimum; pseudo-polynomial time and why it does not contradict NP-hardness (Ch.33).
- **Edit distance and LCS** — Wagner–Fischer tables, Hirschberg's linear-space reconstruction, banded DP for bounded distance, Myers' bit-parallel algorithm.
- **Diff algorithms: Myers and patience** — Myers' O(ND) greedy diff as a shortest path in the edit graph (Git's default), patience and histogram diffs for human-readable output.
- **Longest increasing subsequence** — O(n log n) via patience piles and binary search; reconstruction; LIS as the core of patience diff.
- **Interval DP and matrix-chain order** — DP over increasing interval length; optimal parenthesization, optimal BSTs, and Knuth's O(n²) speed-up.
- **DP on trees and DAGs** — post-order subtree DP, rerooting for all-roots answers, DAG DP as shortest/longest path in the state graph.
- **Bitmask DP** — subsets as states: Held–Karp TSP in O(2ⁿn²), assignment problems, sum-over-subsets transforms.
- **Digit DP** — counting integers in [L, R] with digit properties via (position, tight, state) DP.

### 22.2 Speed-ups
- **DP speed-ups: convex hull trick and friends** — convex hull trick / Li Chao trees for linear transitions, divide-and-conquer optimization and Knuth–Yao for monotone optimal split points, monotone-queue optimization.
- *Lab:* implement edit distance three ways (full table, Hirschberg, bit-parallel Myers) and time them on 10⁴–10⁶-character strings; implement Myers diff and compare its output and speed with `git diff`.

## Chapter 23 — Backtracking, Search and SAT
Exhaustive search made tractable by pruning, clever representation and learning.

### 23.1 Backtracking
- **Backtracking with pruning** — subsets, permutations and combinations; N-queens; constraint propagation (Sudoku) and variable-ordering heuristics as the difference between seconds and years.
- **Exact cover and Dancing Links** — Knuth's Algorithm X with doubly linked "dancing" removal and restoration; polyomino and Sudoku as exact cover.
- **Meet in the middle** — splitting a 2ⁿ search into two 2^{n/2} halves joined by sorting or hashing; subset sum and 4-SUM.
- **Branch and bound** — best-first search with bounds from relaxations (fractional knapsack, LP relaxation), incumbent pruning; the engine of MILP solvers.

### 23.2 SAT solving
- **DPLL and CDCL SAT solvers** — unit propagation with watched literals, conflict analysis and clause learning, non-chronological backjumping, VSIDS and restarts; why industrial SAT solves million-variable instances despite NP-completeness; SAT in package resolution and verification.
- *Lab:* solve Sudoku by plain backtracking, by Dancing Links and by encoding to CNF for a CDCL solver; compare nodes explored and time on the hardest published puzzles.

## Chapter 24 — Array and Sequence Techniques
Linear-time idioms over arrays and lists that recur in both interviews and engines.

### 24.1 Pointer and window techniques
- **Two pointers** — opposite-end scans on sorted data (pair sums, container problems), same-direction partitioning and in-place deduplication; the invariant each pointer maintains.
- **Fast and slow pointers** — Floyd's tortoise-and-hare cycle detection and cycle start, Brent's variant, middle-of-list; the same idea in Pollard's rho (Ch.26) and duplicate-number detection.
- **Sliding windows** — fixed and variable windows with an incremental invariant (counts, distinct elements), and window maxima via the monotonic deque (Ch.2).

### 24.2 Prefix and in-place techniques
- **Prefix sums and difference arrays** — 1D and 2D prefix sums, prefix XOR, subarray-sum-equals-k with a hash map, difference arrays for batched range updates.
- **Kadane's maximum subarray** — the DP view, circular and 2D variants, and segment-tree generalization for dynamic arrays.
- **Cyclic sort and in-place index tricks** — placing value v at index v for 1..n inputs, sign marking and modular encoding to find missing and duplicate numbers in O(1) extra space.
- *Lab:* solve one problem per pattern from scratch under a timer, then rewrite each with an explicit loop invariant and a property-based test against a brute-force oracle.

## Chapter 25 — Bit Manipulation
Words as small parallel computers.

### 25.1 Bit tricks
- **Masks and two's-complement tricks** *(refresher)* — set/clear/toggle/test, power-of-two checks, isolating the lowest set bit with x & −x, sign extension and shifts.
- **XOR tricks and Gray codes** — single-number problems, XOR swap and its aliasing trap, Gray codes and their single-bit transitions.
- **Population count and bit scanning** — hardware POPCNT/TZCNT/LZCNT, SWAR popcount, and their role in rank/select (Ch.13) and Swiss-table matching (Ch.3).
- **Subset and submask enumeration** — iterating all submasks in O(3ⁿ) total, Gosper's hack for fixed-size subsets, sum-over-subsets DP.
- **Bit-parallel algorithms** — SWAR, Shift-Or (Bitap) string matching, and simdjson's structural indexing with SIMD and carry-less multiplication (Langdale & Lemire, VLDB Journal 2019).
- *Lab:* implement popcount four ways (loop, Kernighan, SWAR, intrinsic) and Shift-Or matching; benchmark them and inspect the generated assembly.

## Chapter 26 — Number Theory and Algebraic Algorithms
The arithmetic under hashing, cryptography, randomized algorithms and fast recurrences.

### 26.1 Modular arithmetic
- **Euclid, extended Euclid and CRT** — gcd/lcm, Bézout coefficients, modular inverses, and the Chinese remainder theorem for reconstructing values from residues.
- **Modular exponentiation and reduction** — square-and-multiply, Montgomery and Barrett reduction for division-free modular arithmetic in hashing and cryptography.
- **Prime sieves** — Eratosthenes, the linear sieve with smallest prime factors, segmented sieves for large ranges.
- **Miller–Rabin and Pollard's rho** — probabilistic primality with deterministic base sets for 64-bit integers; Pollard's rho factorization via cycle detection.

### 26.2 Combinatorics and recurrences
- **Combinatorics modulo p** — nCr with factorial tables and inverses, Pascal's triangle, Lucas' theorem, inclusion–exclusion, Catalan numbers.
- **Matrix exponentiation for linear recurrences** — computing the n-th term of a linear recurrence (Fibonacci, path counts) in O(k³ log n).
- *Lab:* implement Miller–Rabin and Pollard's rho with Montgomery multiplication; factor random 64-bit semiprimes and compare against a naive trial-division baseline.

## Chapter 27 — String Algorithms
Matching, indexing and searching text, from one pattern to whole genomes.

### 27.1 Pattern matching
- **KMP and the prefix function** — failure links that never move the text pointer backwards; the prefix function as a reusable primitive (periods, borders).
- **Z-algorithm** — the Z-box invariant giving all longest-common-prefix-with-pattern values in O(n); matching via pattern$text.
- **Rabin–Karp and rolling hashes** — polynomial rolling hashes, collision probability with a random base modulo a prime, multi-pattern and 2D matching, and double hashing against adversarial inputs.
- **Content-defined chunking** — rolling-hash boundaries (Rabin fingerprints, Gear hash, FastCDC) that survive insertions, for deduplicating backup and sync systems (restic, Borg) and delta transfer.
- **Boyer–Moore, Horspool and Two-Way** — bad-character and good-suffix shifts for sublinear average time; Crochemore–Perrin Two-Way for O(1)-space linear worst case (glibc `memmem`); SIMD prefiltering in modern `memchr`/`memmem`.
- **Aho–Corasick automata** — trie plus failure and output links for simultaneous multi-pattern matching; dense vs sparse automata; intrusion detection and log scanning.
- **Regular expressions: automata vs backtracking** — Thompson NFA simulation, lazy DFA construction, and linear-time engines (RE2, Rust `regex`) vs backtracking engines and catastrophic backtracking (ReDoS).

### 27.2 Suffix structures
- **Suffix arrays and LCP arrays** — prefix-doubling construction in O(n log n), linear-time SA-IS (Nong, Zhang & Chan, 2009), Kasai's LCP algorithm, and pattern search by binary search over the SA.
- **Suffix trees** — compressed tries of all suffixes, Ukkonen's online construction, generalized suffix trees, and why their ~10–20 bytes per character pushes practice toward suffix arrays.
- **Suffix automata** — the minimal DFA of all substrings, linear online construction, counting distinct substrings and longest common substrings.
- **BWT and the FM-index** — the Burrows–Wheeler transform, LF-mapping and backward search via rank (Ch.13); compressed full-text indexes in bzip2-style compression and read aligners (BWA, Bowtie).
- **Manacher's algorithm** — all maximal palindromes in O(n) by mirroring inside the rightmost palindrome.
- *Lab:* implement KMP, Z and Rabin–Karp and benchmark against your platform's `memmem`; build a suffix array with SA-IS plus LCP for a 100 MB corpus and answer substring and longest-repeat queries; craft a ReDoS input for a backtracking engine and show a linear engine is immune.

## Chapter 28 — Intervals, Geometry and Scheduling
Sweeps and orientation tests: the toolkit for intervals, time ranges and planar geometry.

### 28.1 Intervals and sweeps
- **Interval merging and scheduling** — sort-by-start merging and insertion; earliest-finish-time greedy for maximum non-overlapping intervals; minimum rooms via a min-heap of end times; weighted interval scheduling by DP.
- **Sweep-line algorithms** — event queues and active-set structures; skyline, rectangle union area, and Bentley–Ottmann segment intersection in O((n + k) log n).

### 28.2 Computational geometry
- **Orientation tests and robust predicates** — the cross-product sign as the primitive of planar geometry, collinearity, and floating-point failure; exact and adaptive predicates (Shewchuk, 1997).
- **Convex hulls** — Graham scan and Andrew's monotone chain in O(n log n), output-sensitive Chan's algorithm, rotating calipers for diameter and width.
- **Voronoi diagrams and Delaunay triangulation** — Fortune's sweep, Delaunay as the dual, incremental Bowyer–Watson; nearest-facility and mesh uses.
- *Lab:* implement monotone-chain convex hull with naive and robust orientation tests; generate near-degenerate inputs that break the naive version, then implement the meeting-rooms and skyline sweeps.

## Chapter 29 — Randomized Algorithms and Concentration
Using randomness for speed and simplicity, and proving the results hold with high probability.

### 29.1 Tools
- **Expectation and indicator variables** *(refresher)* — linearity of expectation, indicators, expected comparisons in randomized quicksort, the coupon collector.
- **Las Vegas vs Monte Carlo** — always-correct-maybe-slow vs always-fast-maybe-wrong; amplification by repetition; randomized quickselect and Miller–Rabin as the two archetypes.
- **Concentration bounds: Markov to Chernoff** — Markov, Chebyshev, Chernoff–Hoeffding and the union bound; the median-of-means trick that turns a constant-probability estimator into an (ε, δ) guarantee for sketches (Ch.30).

### 29.2 Algorithms
- **Balls into bins and two choices** — max load Θ(log n / log log n) with one random choice vs log log n / log 2 + O(1) with the better of two (Azar et al., 1994); power-of-two-choices load balancing (e.g. NGINX `random two`, Envoy least-request).
- **Fingerprinting and identity testing** — Freivalds' matrix-product verification, Schwartz–Zippel polynomial identity testing, string equality by fingerprints.
- **Karger's randomized min cut** — random edge contraction, the success-probability bound, and Karger–Stein recursion.
- **Reservoir sampling** — Algorithm R, the skip-based Algorithm L, weighted sampling (Efraimidis–Spirakis) and distributed merging of reservoirs → *Data Engineering* §5.6.
- **Random shuffling** — Fisher–Yates and the classic biased implementations, Sattolo's cyclic variant, and shuffling data too large for memory.
- *Lab:* simulate one vs two choices for 10⁶ balls and plot max load; implement Karger and measure empirical success probability; test a "shuffle" implementation for bias with a chi-squared test.

## Chapter 30 — Streaming and Sketching Algorithms
One pass, sublinear memory, provable error: the theory under the approximate operators in every data platform (production usage and labs → *Data Engineering* §5.6).

### 30.1 Models and frequency problems
- **The streaming model and its lower bounds** — cash-register vs turnstile streams, space as the resource, and why exact distinct counting or exact heavy hitters need Ω(n) space (communication-complexity arguments).
- **Heavy hitters: Misra–Gries and SpaceSaving** — deterministic counter-based summaries with εn error, and mergeable summaries (Agarwal et al., PODS 2012) for distributed aggregation.
- **Count-Min and CountSketch** — linear hash-counter sketches; Count-Min's one-sided εN error vs CountSketch's ℓ₂ guarantee; conservative update; linearity enabling turnstile streams and subtraction.

### 30.2 Distinct counts, quantiles and similarity
- **From Flajolet–Martin to HyperLogLog** — probabilistic counting via leading zeros, LogLog, HyperLogLog's harmonic mean (2007), HLL++ bias correction and sparse mode (Google, EDBT 2013), and newer sketches such as ExaLogLog (Ertl, EDBT 2025) using ~43% less space at equal error.
- **Quantile sketches: GK, KLL, t-digest, DDSketch** — rank-error guarantees (Greenwald–Khanna, KLL with optimal space, Karnin, Lang & Liberty, FOCS 2016) vs relative-value-error guarantees (DDSketch, VLDB 2019) vs t-digest's tail-accurate heuristic; mergeability of each.
- **MinHash, SimHash and LSH** — Jaccard estimation with min-wise hashing, b-bit MinHash, cosine similarity with SimHash, and banding for locality-sensitive candidate generation in near-duplicate detection.
- **Sliding-window streams** — exponential histograms (Datar, Gionis, Indyk & Motwani, 2002) for counts over the last W items, and why windows cost a log factor.
- *Lab:* on a Zipfian stream of 10⁸ items, compare Misra–Gries, Count-Min and CountSketch against exact counts for top-100 recall and error per memory byte; then derive the theoretical bound for each and check the measured error sits inside it.

## Chapter 31 — External-Memory and Cache-Oblivious Algorithms
Algorithms designed for the I/O and cache models of Ch.1, where block transfers are the cost.

### 31.1 External memory
- **Scanning, permuting and sorting bounds** — why permuting N items costs as much as sorting them in the I/O model, and how that bound shapes joins and shuffles.
- **Partitioned hash joins: Grace and hybrid** — recursive partitioning until each build side fits in memory, hybrid hash join keeping one partition resident, and skew handling → *Data Engineering* §2.3, Ch.7.
- **Radix-partitioned in-memory joins** — multi-pass radix clustering sized to TLB and cache (Boncz, Manegold & Kersten, VLDB 1999) and the partitioned vs non-partitioned hash join debate.

### 31.2 Cache-oblivious algorithms
- **The van Emde Boas layout** — recursively laying out a static search tree so any block size gives O(log_B N) transfers; comparison with B-trees and Eytzinger (Ch.16).
- **Cache-oblivious matrix algorithms** — recursive transpose and multiplication, Z-order (Morton) matrix layouts, and why naive loops thrash.
- **Funnelsort** — k-funnels merging recursively for optimal cache-oblivious sorting (Frigo et al., 1999; lazy funnelsort, Brodal & Fagerberg, 2002), and why tuned cache-aware sorts still win in practice.
- *Lab:* compare naive vs recursive matrix transpose and vEB vs sorted-array vs Eytzinger search across sizes from L1 to 4× RAM; then implement a Grace hash join and measure I/O volume as the build side outgrows memory.

## Chapter 32 — Parallel and Distributed Algorithm Primitives
Analysing and building algorithms that run on many cores or many machines.

### 32.1 Shared-memory parallelism
- **Work–span model and work stealing** — work T₁, span T∞, parallelism T₁/T∞, Brent's bound, and randomized work stealing (Blumofe & Leiserson, JACM 1999) as in Cilk, Rayon and Tokio → *Rust Systems Engineering* Ch.9.
- **Parallel prefix sum (scan)** — Hillis–Steele vs Blelloch's work-efficient up-sweep/down-sweep; scan as the building block of parallel radix sort, stream compaction and filtering.
- **Parallel merge** — merge path / co-ranking to split two sorted inputs into equal independent merges; parallel multiway merge.

### 32.2 Distributed patterns
- **MapReduce as an algorithmic pattern** — map, shuffle and reduce; combiners and the associativity/commutativity they require; round complexity in the MPC model; mapping back to joins and aggregations → *Data Engineering* Ch.7.
- **Vertex-centric graph processing** — bulk-synchronous Pregel supersteps (SIGMOD 2010), label-propagation connected components and PageRank, and when a single-machine CSR beats a cluster (the "COST" argument, McSherry et al., HotOS 2015) → *Data Engineering* §17.3.
- *Lab:* implement Blelloch scan and a parallel radix sort with a work-stealing pool; measure speed-up from 1 to all cores, then compute connected components on a large graph both single-threaded on CSR and with a Pregel-style framework and compare cost.

## Systems in Production — Milestone 2: algorithms that run the world's infrastructure
- **Timsort and its successors (Peters 2002; de Gouw et al., CAV 2015) — a real-data sort, and the bug that formal methods found.** Forcing problem: real inputs are partially sorted, and textbook merge sort ignores that. Mechanism: run detection, galloping merges and a merge-stack invariant. Trade-offs: complexity that hid a broken invariant for over a decade until verification with KeY exposed it; CPython later replaced the merge policy with Powersort (3.11) and Rust replaced its sorts with driftsort/ipnsort (1.81). What it proves: adaptive algorithms win on real data, and their invariants deserve proofs.
- **Contraction hierarchies in OSRM (Geisberger et al., 2008; OSRM) — continental routing in milliseconds.** Forcing problem: Dijkstra on a continental road graph settles millions of nodes per query. Mechanism: offline node contraction with shortcut edges, then bidirectional upward search. Trade-offs: long preprocessing and costly updates for traffic changes (answered by customizable variants). What it proves: preprocessing plus graph structure beats worst-case theory by orders of magnitude.
- **Google Maglev (Eisenbud et al., NSDI 2016) — consistent hashing for a software load balancer.** Forcing problem: spreading packets over backends evenly while keeping connections sticky as backends change. Mechanism: a permutation-filled lookup table with near-perfect balance plus a connection tracking table. Trade-offs: slightly more disruption than ring hashing in exchange for balance and O(1) lookup. What it proves: the hashing chapter's balance vs disruption trade-off is a real design knob.
- **Zstandard (Collet, Meta, 2016; RFC 8878) — entropy coding with ANS at memory speed.** Forcing problem: zlib-level ratios were too slow for logs, databases and network traffic. Mechanism: LZ77 matching with large windows plus Huffman-coded literals and tANS/FSE-coded sequences. Trade-offs: memory for windows and dictionaries vs speed and ratio. What it proves: a 2009–2014 theory result (ANS) reached the default compression layer of storage engines and file formats within years.
- **RE2 and Rust `regex` (Cox, 2007–2010; Gallant) — regex without catastrophic backtracking.** Forcing problem: backtracking engines take exponential time on crafted inputs (ReDoS). Mechanism: Thompson NFA simulation and lazily built DFAs, with literal prefilters (SIMD, Aho–Corasick). Trade-offs: no backreferences or arbitrary lookaround. What it proves: picking the automaton algorithm is a security decision.

---

# Milestone 3 — Complexity, Patterns and Problem-Solving
Knowing when a problem is hard, what to do about it, and how to map any new problem onto the toolkit quickly and correctly.

## Chapter 33 — Intractability and Reductions
Recognizing hard problems, including the ones hiding inside data systems.

### 33.1 NP-completeness
- **P, NP and polynomial reductions** — decision vs search vs optimization, certificates and verifiers, Karp reductions and their direction (reduce *from* the known-hard problem).
- **NP-completeness and reduction gadgets** — Cook–Levin, then SAT → 3-SAT → independent set / vertex cover / clique, Hamiltonian cycle, subset sum; NP-hard problems in disguise (join ordering, scheduling, bin packing, register allocation).
- **Pseudo-polynomial time and strong NP-hardness** — why knapsack has an O(nW) DP while bin packing has no pseudo-polynomial algorithm unless P = NP; reading input encodings carefully.

### 33.2 Beyond NP-completeness
- **Fine-grained complexity** — SETH, 3SUM and APSP conjectures; conditional lower bounds such as no strongly subquadratic edit distance under SETH (Backurs & Indyk, STOC 2015); using them to stop searching for impossible speed-ups.
- *Lab:* write a reduction from 3-SAT to independent set as code, verify it on random formulas against a SAT solver, and time exact solutions as instance size grows.

## Chapter 34 — Approximation and Online Algorithms
Provable guarantees when exact optimality is too expensive or the future is unknown.

### 34.1 Approximation
- **Approximation ratios and greedy set cover** — the ln n-approximation for set cover and why it is essentially optimal; 2-approximate vertex cover via maximal matching.
- **LP relaxation and rounding** — vertex cover by threshold rounding, randomized rounding for set cover, integrality gaps; LP duality as the certificate of quality.
- **PTAS and FPTAS** — knapsack's FPTAS by profit scaling; the boundary between approximation schemes and APX-hardness.
- **Metric TSP approximation** — the MST double-tree 2-approximation, Christofides' 3/2, and the first improvement below 3/2 (Karlin, Klein & Oveis Gharan, STOC 2021).
- **Bin packing and makespan scheduling** — First-Fit Decreasing (≤ 11/9·OPT + 6/9), LPT's 4/3 bound for identical machines; packing files into splits and tasks onto executors → *Data Engineering* Ch.7.
- **Local search and metaheuristics** — 2-opt and k-opt, simulated annealing and genetic search; when heuristics without guarantees are the right engineering call (PostgreSQL's GEQO for many-way joins).

### 34.2 Online algorithms
- **Competitive analysis and ski rental** — the adversary model, the deterministic 2-competitive break-even strategy and the e/(e − 1) randomized one; rent-vs-buy decisions in autoscaling and caching.
- **Online paging** — LRU and FIFO are k-competitive (Sleator & Tarjan, 1985), Bélády's offline optimum, randomized marking at O(log k); connecting the theory to the policies in Ch.11.
- *Lab:* implement FFD and LPT and compare with an exact ILP/brute-force solution on small instances and with each other at scale; simulate LRU, FIFO and Bélády on a real trace and compare against the competitive bounds.

## Chapter 35 — Parameterized and Structural Complexity
When the hard part of an instance is small or its structure is simple, exponential cost can be confined.

### 35.1 Parameterized algorithms
- **Fixed-parameter tractability and kernels** — O(f(k)·poly(n)) algorithms; bounded search trees for k-vertex cover in O(2ᵏn), Buss kernelization, and the W[1]-hardness that marks the limit.
- **Treewidth and tree-decomposition DP** — tree decompositions, DP over bags for independent set and colouring, Courcelle's theorem; why many NP-hard problems are easy on tree-like graphs.

### 35.2 Joins as structural complexity
- **Acyclic joins and Yannakakis' algorithm** — α-acyclic (join-tree) queries evaluated in time linear in input + output via semi-join reduction (VLDB 1981); hypertree width as the generalization.
- **Worst-case optimal joins and the AGM bound** — the fractional-edge-cover bound on join output size (Atserias, Grohe & Marx, FOCS 2008), why any binary join plan is suboptimal on triangle queries, and Generic Join / Leapfrog Triejoin (ICDT 2014) as used in graph and Datalog engines → *Data Engineering* §2.3.
- *Lab:* count triangles in a skewed social graph with a binary hash-join plan and with Generic Join; compare intermediate result sizes against the AGM bound.

## Chapter 36 — Pattern Recognition
The meta-skill: getting from an unfamiliar problem statement to the right structure and algorithm, fast.

### 36.1 From constraints to algorithms
- **Complexity budgeting from constraints** — reading n, value ranges and time limits as a budget (n ≤ 20 → 2ⁿ; n ≤ 10⁵ → n log n; n ≤ 10⁸ → linear, cache-friendly); signals like "sorted", "k-th", "all pairs", "minimum maximum".
- **Choosing the structure for the operation mix** — lookup → hash; ordered/range → balanced tree or B-tree; top-k → heap or quickselect; membership at scale → filter; grouping → union–find; prefixes → trie; range aggregates → Fenwick/segment tree.
- **Modelling problems as graphs** — states as vertices and moves as edges (word ladders, puzzles, lock combinations), implicit graphs, layered graphs for constraints such as "at most k discounts".
- **Recognizing reductions to known problems** — spotting flow, matching, 2-SAT, shortest path, interval scheduling or DP on a DAG inside a word problem; the catalogue of recurring patterns (fast/slow pointers, top-K via heap, k-way merge, intervals, matrix traversal, binary search on the answer, monotonic stack).
- *Lab:* take 30 unseen problems, and for each write only the recognized pattern, the target complexity and the key invariant within five minutes; then solve and score your recognition accuracy.

## Chapter 37 — From Structures to Data Systems
Bridge reels: how each textbook structure is modified when it becomes a mechanism inside a production data system.

### 37.1 The mapping
- **Hash tables inside hash joins** — build/probe phases, partitioning for cache and memory (Ch.31), Bloom-filter pushdown, and spilling when the build side outgrows memory → *Data Engineering* §2.3, Ch.7.
- **Sorting inside spilling operators** — external merge sort (Ch.15) as the spill path of sorts, sort-merge joins and aggregations → *Data Engineering* §1.3, Ch.7.
- **Heaps inside compaction, shuffle and top-N** — k-way merges with heaps or loser trees in LSM compaction and shuffle reads; bounded heaps for `ORDER BY … LIMIT` → *Data Engineering* §5.1, Ch.7.
- **Topological sort inside schedulers** — DAG orchestration, ready queues, critical-path prioritization and cycle rejection → *Data Engineering* Ch.11.
- **Union–find inside entity resolution** — clustering matched record pairs into entities and connected components in lineage graphs → *Data Engineering* §8.3, §17.3.
- **Search trees inside storage engines** — B+-trees, LSM-trees and their filters as the index layer → *Data Engineering* §5.1, *Rust Systems Engineering* Ch.21–22.
- **Consistent hashing inside sharded stores** — partition assignment, rebalancing and hot-key handling → *Data Engineering* §5.3.
- **Sketches inside approximate aggregation** — HLL, KLL/t-digest and reservoir samples as mergeable partial aggregates in warehouses and stream processors → *Data Engineering* §5.6.

## Chapter 38 — Practice Discipline
Turning knowledge into reliable, fast, correct implementation under pressure.

### 38.1 Method
- **Implement once from scratch** — building each core structure and algorithm by hand once, then benchmarking it against the standard library to learn what the library does better.
- **Correctness arguments and edge cases** — loop invariants, termination arguments, explicit edge-case lists (empty, one element, duplicates, overflow, maximal input) and named failure modes for every solution.
- **Testing algorithms: properties and oracles** — property-based tests against brute-force oracles, differential testing against the standard library, fuzzing for crashes and pathological inputs → *Rust Systems Engineering* Ch.42.
- **Timed problem-solving and interview communication** — clarify, state brute force, optimize by pattern, code, test aloud; timed sets with spaced repetition of missed patterns.
- *Lab:* implement and unit-test from scratch a hash map with resizing, a binary heap, a B-tree, Dijkstra with a heap, an LRU cache and quickselect; add property-based tests against brute-force oracles; benchmark each against the standard library and explain every gap.

## Systems in Production — Milestone 3: hard problems solved anyway
- **Query optimizers and join ordering (Selinger et al., SIGMOD 1979; Moerkotte & Neumann, VLDB 2006) — an NP-hard problem solved every millisecond.** Forcing problem: the best join order for n relations is NP-hard in general, yet every query needs one. Mechanism: dynamic programming over connected subgraphs (DPccp) for moderate n, with greedy or randomized search (PostgreSQL's GEQO beyond `geqo_threshold`, default 12) for larger ones. Trade-offs: plan quality bounded by cardinality-estimate errors rather than search. What it proves: exponential DP plus heuristics is a sound engineering answer to NP-hardness.
- **Quincy and Firmament (Isard et al., SOSP 2009; Gog et al., OSDI 2016) — cluster scheduling as min-cost flow.** Forcing problem: placing tasks for data locality and fairness across thousands of machines. Mechanism: encode tasks, machines and costs as a flow network and solve min-cost max-flow, with incremental solvers to reach sub-second decisions at scale. Trade-offs: modelling effort and solver latency vs placement quality. What it proves: Chapter 20's flow algorithms are practical schedulers.
- **SAT and PubGrub in package managers (libsolv; PubGrub, Weizenbaum 2018; Dart pub, uv) — NP-complete dependency resolution in seconds.** Forcing problem: version resolution with constraints is NP-complete, and users need an answer and an explanation on failure. Mechanism: CDCL-style unit propagation and conflict learning over version incompatibilities, with human-readable derivations of conflicts. Trade-offs: worst-case exponential time accepted for typical-case speed and good error messages. What it proves: Chapter 23's CDCL ideas are everyday infrastructure.
