# Data Structures & Algorithms — shortlist of topics to cut (13 October 2026)

**Why.** The DSA syllabus has 257 topics and 12 cases. For the owner it serves two things: the coding round of a Data Engineer loop abroad (easy and medium Python and SQL, the syllabus's own words in Appendix B of the Data Engineering domain) and the structures behind the systems on the resume (hash tables, B-trees, LSM trees, filters, sketches, external sorting, consistent hashing, DAG scheduling). The cut removes the competitive-programming and research tail: persistent and succinct structures, flows and matching beyond bipartite, number theory, suffix structures, computational geometry, approximation schemes, parameterized complexity, vector-search indexes, editor buffers and a run of named structures nobody is asked about.

**Nothing is deleted by this file.** It is a proposal, in the form of `review-notes/de-cuts.md`: each line is a syllabus topic title, word for word, so the `*(skipped)*` mark can be added by title. Tier A: no bearing on the owner's goal. Tier B: real material, but deeper than any interview or job goes, or a sibling topic or another domain already teaches it.

**Already-made topics are excluded** (owner rule 2026-10-13): no title below has a registry entry, an open claim or a `topic/*` branch, checked against `main` on 13 October 2026. Apply the same check before marking anything: a topic with a reel stays.

**Totals.** 257 topics and 12 Systems-in-Production cases. Tier A: 73 topics + 5 cases. Tier B: 56 topics. Cutting A alone leaves 184 topics; A and B leaves 128.

---

## Tier A — cut (73 topics + 5 cases)

### Chapter 2 — Linear Structures (1 of 7)
- Ropes, gap buffers and piece tables (editor structures)

### Chapter 3 — Hashing (1 of 12)
- Perfect and minimal perfect hashing (static-dictionary research)

### Chapter 4 — Binary Search Trees and Balancing (1 of 7)
- Splay trees (never asked; red-black and treaps cover balancing)

### Chapter 5 — B-Trees and Write-Optimized Trees (3 of 8)
- Maple trees and range-based B-trees (Linux kernel internals)
- Bε-trees and fractal trees (research)
- Learned indexes (research)

### Chapter 6 — Heaps and Priority Queues (3 of 6)
- Monotone integer priority queues (competitive programming)
- Binomial and pairing heaps (trivia)
- Fibonacci heaps (trivia; the amortized decrease-key is never implemented)

### Chapter 7 — Tries and Ordered String Dictionaries (2 of 5)
- Longest-prefix-match lookup (IP routing)
- Finite-state transducers (Lucene internals)

### Chapter 8 — Range-Query Structures (1 of 4)
- Square-root decomposition and Mo's algorithm (competitive programming)

### Chapter 9 — Spatial and High-Dimensional Indexes (5 of 6)
- k-d trees
- Quadtrees and octrees
- R-trees
- Graph-based ANN: HNSW and Vamana (vector search, cut in Data Engineering too)
- Quantization-based ANN: IVF and PQ (same)

### Chapter 10 — Graph Representations (2 of 4)
- Graphs as sparse matrices (GraphBLAS)
- Property-graph storage (graph databases, cut in Data Engineering too)

### Chapter 12 — Filters and Approximate Membership (2 of 6)
- Quotient filters (research)
- Xor, binary fuse and ribbon filters (research; Bloom and cuckoo filters cover the idea)

### Chapter 13 — Persistent, Succinct and Compressed Structures (9 of 11)
- Path copying
- Fat nodes and node copying
- Hash array mapped tries (HAMT)
- Persistent vectors and RRB trees
- Amortization under persistence
- Rank and select on bitvectors
- Elias–Fano encoding
- Wavelet trees
- Succinct trees: LOUDS and balanced parentheses

### Chapter 14 — Concurrent and Lock-Free Structures (2 of 10)
- Concurrent skip lists (Java internals)
- Latch-free Bw-trees (research)

### Chapter 17 — Graph Traversal and Connectivity (1 of 7)
- Eulerian paths and circuits (puzzle algorithm)

### Chapter 18 — Shortest Paths (2 of 7)
- Bidirectional search and contraction hierarchies (routing engines)
- Frontier: beyond Dijkstra's bounds (research)

### Chapter 19 — Minimum Spanning Trees (1 of 3)
- Borůvka and parallel MST ()

### Chapter 20 — Network Flows and Matching (6 of 10)
- Push–relabel
- Global minimum cut
- Frontier: almost-linear-time flows
- Min-cost flow
- General matching and Edmonds' blossoms
- Stable matching

### Chapter 21 — Divide and Conquer and Greedy Algorithms (3 of 7)
- Karatsuba and Strassen
- Fast Fourier transform for convolution
- Asymmetric numeral systems

### Chapter 22 — Dynamic Programming (2 of 10)
- Digit DP (competitive programming)
- DP speed-ups: convex hull trick and friends (competitive programming)

### Chapter 23 — Backtracking, Search and SAT (2 of 5)
- Exact cover and Dancing Links ()
- DPLL and CDCL SAT solvers ()

### Chapter 26 — Number Theory and Algebraic Algorithms (4 of 6)
- Modular exponentiation and reduction
- Miller–Rabin and Pollard's rho
- Combinatorics modulo p
- Matrix exponentiation for linear recurrences

### Chapter 27 — String Algorithms (5 of 12)
- Z-algorithm
- Suffix trees
- Suffix automata
- BWT and the FM-index
- Manacher's algorithm

### Chapter 28 — Intervals, Geometry and Scheduling (3 of 5)
- Orientation tests and robust predicates
- Convex hulls
- Voronoi diagrams and Delaunay triangulation

### Chapter 29 — Randomized Algorithms and Concentration (2 of 8)
- Fingerprinting and identity testing
- Karger's randomized min cut

### Chapter 31 — External-Memory and Cache-Oblivious Algorithms (3 of 6)
- The van Emde Boas layout
- Cache-oblivious matrix algorithms
- Funnelsort

### Chapter 32 — Parallel and Distributed Algorithm Primitives (1 of 5)
- Vertex-centric graph processing (graph processing, cut in Data Engineering too)

### Chapter 33 — Intractability and Reductions (1 of 4)
- Fine-grained complexity (research)

### Chapter 34 — Approximation and Online Algorithms (3 of 8)
- LP relaxation and rounding
- PTAS and FPTAS
- Metric TSP approximation

### Chapter 35 — Parameterized and Structural Complexity (2 of 4)
- Fixed-parameter tractability and kernels
- Treewidth and tree-decomposition DP

### Systems in Production (5 of 12 cases)
- M1: Linux maple tree; Lucene term dictionaries and postings
- M2: Contraction hierarchies in OSRM
- M3: Quincy and Firmament; SAT and PubGrub in package managers

---

## Tier B — cut if the target is a smaller syllabus (56 topics)

### Chapter 1 — Cost Models and Amortized Analysis (1 of 10)
- Cache-oblivious model (Chapter 1 is in production: cut only if no run has claimed it)

### Chapter 3 — Hashing (4 of 12)
- Universal and k-independent hashing
- Robin Hood hashing
- Cuckoo hashing
- Rendezvous, jump and Maglev hashing

### Chapter 4 — Binary Search Trees and Balancing (3 of 7)
- AVL trees
- Treaps and split/merge trees
- Interval trees

### Chapter 5 — B-Trees and Write-Optimized Trees (1 of 8)
- Copy-on-write B-trees

### Chapter 6 — Heaps and Priority Queues (1 of 6)
- d-ary heaps

### Chapter 7 — Tries and Ordered String Dictionaries (2 of 5)
- Radix and Patricia trees
- Adaptive radix trees (ART)

### Chapter 8 — Range-Query Structures (1 of 4)
- Sparse tables and RMQ

### Chapter 11 — Disjoint Sets, Skip Lists and Cache Structures (1 of 5)
- Admission and FIFO-based eviction

### Chapter 12 — Filters and Approximate Membership (3 of 6)
- Blocked and partitioned Bloom filters
- Cuckoo filters
- Range filters

### Chapter 14 — Concurrent and Lock-Free Structures (5 of 10)
- Treiber stacks and the ABA problem
- Safe memory reclamation
- Michael–Scott queues
- B-link trees and optimistic lock coupling
- Testing concurrent structures

### Chapter 15 — Sorting (2 of 9)
- Introsort and pdqsort
- SIMD and parallel sorting

### Chapter 16 — Searching and Selection (2 of 6)
- Cache-friendly and branchless search
- Exponential and interpolation search

### Chapter 17 — Graph Traversal and Connectivity (2 of 7)
- Articulation points, bridges and biconnectivity
- Lowest common ancestor

### Chapter 18 — Shortest Paths (1 of 7)
- A\* search and admissible heuristics

### Chapter 20 — Network Flows and Matching (2 of 10)
- Edmonds–Karp and Dinic's algorithm
- Hungarian algorithm

### Chapter 21 — Divide and Conquer and Greedy Algorithms (1 of 7)
- Closest pair of points

### Chapter 22 — Dynamic Programming (2 of 10)
- DP on trees and DAGs
- Bitmask DP

### Chapter 23 — Backtracking, Search and SAT (2 of 5)
- Meet in the middle
- Branch and bound

### Chapter 25 — Bit Manipulation (2 of 5)
- Subset and submask enumeration
- Bit-parallel algorithms

### Chapter 26 — Number Theory and Algebraic Algorithms (2 of 6)
- Euclid, extended Euclid and CRT
- Prime sieves

### Chapter 27 — String Algorithms (4 of 12)
- Content-defined chunking
- Boyer–Moore, Horspool and Two-Way
- Aho–Corasick automata
- Suffix arrays and LCP arrays

### Chapter 29 — Randomized Algorithms and Concentration (3 of 8)
- Las Vegas vs Monte Carlo
- Concentration bounds: Markov to Chernoff
- Balls into bins and two choices

### Chapter 30 — Streaming and Sketching Algorithms (1 of 7)
- Sliding-window streams

### Chapter 31 — External-Memory and Cache-Oblivious Algorithms (2 of 6)
- Scanning, permuting and sorting bounds
- Radix-partitioned in-memory joins

### Chapter 32 — Parallel and Distributed Algorithm Primitives (2 of 5)
- Parallel prefix sum (scan)
- Parallel merge

### Chapter 33 — Intractability and Reductions (1 of 4)
- NP-completeness and reduction gadgets

### Chapter 34 — Approximation and Online Algorithms (1 of 8)
- Competitive analysis and ski rental

### Chapter 35 — Parameterized and Structural Complexity (2 of 4)
- Acyclic joins and Yannakakis' algorithm
- Worst-case optimal joins and the AGM bound

---

## What stays, and why

After Tier A, 184 topics: cost models and amortization (Ch.1, in production), linear structures, hashing with Swiss tables, consistent hashing and Merkle trees, BSTs, B-trees and LSM trees, heaps and loser trees, tries, Fenwick and segment trees, Z-order curves, graph representations, union-find, skip lists, caches and eviction, Bloom and cuckoo filters, Roaring bitmaps and integer compression, the concurrent structures a Rust developer meets (M1); sorting including Timsort, radix and external merge sort, binary search, graph traversal, shortest paths, MSTs, max-flow and bipartite matching, greedy and Huffman, the DP forms interviews use, backtracking, arrays and windows, bit tricks, KMP, Rabin–Karp and regex engines, intervals and sweeps, reservoir sampling and shuffling, every sketch, hash joins, work–span and MapReduce (M2); NP-completeness, set cover, bin packing and makespan (the owner's capacity-planning domain), online paging, pattern recognition, the whole mapping from structures to data systems, and practice discipline (M3). With Tier B as well, 128 topics.
