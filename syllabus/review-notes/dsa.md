# Change log — slice `dsa` (original.md lines 1258–1376 → Data Structures & Algorithms domain)

Old Milestone 10 / Chapters 26–28 became the domain *Data Structures & Algorithms*: Ch.26 → Milestone 1 (Ch.1–14), Ch.27 → Milestone 2 (Ch.15–32), Ch.28 → Milestone 3 (Ch.33–38). Old sections became chapters numbered across the domain. I added a domain front matter (title, intro aimed at senior engineers, structure line, canonical references with verified editions) and a Systems in Production section for each milestone. The original had none.

## Corrections
- Old 27.2 "Quickselect / median-of-medians (k-th smallest in expected O(n))": expected O(n) applies only to quickselect. Median-of-medians (BFPRT) is worst-case O(n). Rewritten in Ch.16.
- Old 27.3 "Euler/Hamiltonian path awareness": the two problems were bundled as if comparable. Eulerian paths are linear-time (Hierholzer) and Hamiltonian path is NP-complete. Ch.17 now says so and points to Ch.33.
- Old 26.5 "Skip lists (used in some LSM memtables)": now names the actual users (the default memtable in LevelDB and RocksDB, and Redis sorted sets).
- Old 27.1 "Timsort/introsort (real stdlib hybrids)" is out of date. Current standard libraries use pdqsort (Go), ipnsort/driftsort (Rust) and the Powersort merge policy (CPython). See Currency.
- Old 28.1 placed P/NP alongside basic Big-O. Intractability is now its own chapter (Ch.33), which separates the decision/search/optimization versions and covers pseudo-polynomial vs strong NP-hardness. This fixes the old implication that knapsack's DP contradicts NP-hardness.
- Old 26.3 heap list "binary, d-ary, binomial, Fibonacci": now notes that Fibonacci heaps lose in practice, and that pairing heaps' exact decrease-key bound is still open.

## Currency updates (with source URLs)
- Go 1.24 replaced the built-in map with a Swiss Table implementation (Ch.3, M1 Systems in Production). https://go.dev/doc/go1.24
- Go 1.19 rewrote `sort` to use pattern-defeating quicksort (Ch.15). https://go.dev/doc/go1.19
- Rust 1.81 (Sept 2024) replaced `slice::sort` with driftsort and `slice::sort_unstable` with ipnsort (Ch.15, M2 SiP). https://github.com/rust-lang/rust/pull/124032
- CPython 3.11 switched list.sort's merge policy to Munro & Wild's Powersort, bpo-34561 (Ch.15, M2 SiP). https://en.wikipedia.org/wiki/Powersort ; https://android.googlesource.com/platform/external/python/cpython3/+/5cb4c672d8
- In Linux 6.1 the maple tree replaced the VMA rbtree, linked list and cache. StackRot (CVE-2023-3269) followed (Ch.5, M1 SiP). https://blogs.oracle.com/linux/the-maple-tree ; https://lkml.iu.edu/hypermail/linux/kernel/2202.2/09535.html
- C++26 accepted `<hazard_pointer>` and `<rcu>` (P2530R3, P2545R4) (Ch.14). https://en.wikipedia.org/wiki/C%2B%2B26 ; https://releases.llvm.org/20.1.0/projects/libcxx/docs/Status/Cxx2c.html
- Delta Lake liquid clustering uses Hilbert curves, while `OPTIMIZE ZORDER BY` uses Z-order (Ch.9). https://delta.io/blog/delta-lake-3-2/
- ExaLogLog (Ertl, EDBT 2025) reaches HLL's error in about 43% less space (Ch.30). https://arxiv.org/abs/2402.13726v2
- Duan et al., deterministic O(m log^{2/3} n) directed SSSP, STOC 2025 best paper (Ch.18). https://arxiv.org/abs/2504.17033 ; https://www.mpi-inf.mpg.de/news/detail/stoc-best-paper-award-how-to-find-the-shortest-path-faster
- Haeupler, Hladík, Rozhoň, Tarjan, Tětek, universal optimality of Dijkstra, FOCS 2024 best paper (Ch.18). https://arxiv.org/abs/2311.11793v1 ; https://barc.ku.dk/news/jakub-ttek-awarded-best-paper-distinction-at-focs-2024/
- Bernstein, Nanongkai, Wulff-Nilsen, near-linear negative-weight SSSP (Ch.18). https://arxiv.org/abs/2203.03456
- Chen, Kyng, Liu, Peng, Probst Gutenberg, Sachdeva, almost-linear max flow and min-cost flow, FOCS 2022 best paper (Ch.20). https://arxiv.org/abs/2203.00671v2 ; https://uwaterloo.ca/computer-science/node/1413
- Reference editions verified: CLRS 4th ed. (MIT Press, 2022) https://en.wikipedia.org/wiki/Introduction_to_Algorithms ; Skiena 3rd ed. (Springer, 2020) https://link.springer.com/978-3-030-54255-9
- Cache eviction: S3-FIFO (SOSP 2023), SIEVE (NSDI 2024) and W-TinyLFU (Caffeine) were added as the current state of the art beyond LRU/LFU (Ch.11). These are well-known venues and were not re-fetched; see Unverified.

## Added topics
Expert gaps the brief asked for, after checking that none were already in the slice:
- **Analysis (Ch.1):** word-RAM model; Akra–Bazzi; lower bounds and adversary arguments; potential method; deamortization and global rebuilding; external-memory model; cache-oblivious model; measuring the memory hierarchy.
- **Linear (Ch.2):** intrusive lists; ropes, gap buffers and piece tables.
- **Hashing (Ch.3):** universal and k-independent hashing; practical hashes and HashDoS; Swiss Tables; incremental rehashing; modern MPHFs; rendezvous, jump and Maglev hashing; Merkle trees.
- **Trees (Ch.4–5):** order-statistic trees; interval trees; B-tree node engineering; copy-on-write B-trees; maple trees; LSM compaction and amplification (RUM, Monkey, Dostoevsky); Bε-trees; learned indexes.
- **Heaps (Ch.6):** monotone integer priority queues; pairing heaps; loser trees.
- **Tries (Ch.7):** longest-prefix match; adaptive radix trees; finite-state transducers.
- **Range queries (Ch.8):** sparse tables/RMQ; square-root decomposition and Mo's algorithm.
- **Spatial (Ch.9):** space-filling curves and cell indexes (S2, H3); HNSW/Vamana; IVF/PQ.
- **Graphs (Ch.10):** CSR and reordering; GraphBLAS.
- **Caches (Ch.11):** scan-resistant policies (ARC, LIRS); TinyLFU, S3-FIFO and SIEVE.
- **Filters (Ch.12, new chapter):** blocked Bloom; quotient filters; xor, binary fuse and ribbon filters; range filters.
- **Persistent and succinct (Ch.13, new chapter):** path copying; fat nodes; HAMT/CHAMP; RRB vectors; amortization under persistence; rank/select; Elias–Fano; wavelet trees; LOUDS; Roaring; integer compression.
- **Concurrent (Ch.14, new chapter):** linearizability; Treiber/ABA; safe memory reclamation; Michael–Scott queue; MPMC ring queues; concurrent hash maps; concurrent skip lists; B-link and optimistic lock coupling; Bw-tree; testing concurrent structures.
- **Sorting and search (Ch.15–16):** SIMD/parallel sorting (vqsort, IPS⁴o); key normalization; cache-friendly branchless/Eytzinger search; Floyd–Rivest.
- **Graphs (Ch.17–19):** direction-optimizing BFS; LCA; DAG shortest paths; Johnson's algorithm; contraction hierarchies; the 2022–2025 SSSP frontier; Borůvka.
- **Flows and matching (Ch.20):** push–relabel; global min cut; almost-linear flows; Hungarian algorithm; min-cost flow; blossom; stable matching.
- **Paradigms (Ch.21–23):** closest pair; Karatsuba and Strassen; FFT/NTT; exchange arguments and matroids; ANS; Myers/patience diff; DP speed-ups; Dancing Links; meet in the middle; CDCL SAT.
- **Bits and numbers (Ch.25–26):** bit-parallel algorithms (Shift-Or, simdjson); Gray codes; Montgomery/Barrett reduction; Pollard's rho; CRT; Lucas; matrix exponentiation.
- **Strings (Ch.27):** content-defined chunking; Two-Way; regex engines and ReDoS; SA-IS; BWT/FM-index.
- **Geometry (Ch.28):** robust predicates; Voronoi and Delaunay.
- **Randomized (Ch.29, new chapter):** concentration bounds; balls-into-bins and two choices; fingerprinting and Schwartz–Zippel; Karger min cut; weighted and skip-based reservoir sampling; Fisher–Yates.
- **Streaming (Ch.30, new chapter):** streaming lower bounds; Misra–Gries/SpaceSaving; CountSketch; mergeable summaries; HLL lineage plus ExaLogLog; KLL/GK; SimHash; exponential histograms.
- **External memory (Ch.31, new chapter):** permuting bound; Grace and hybrid hash joins; radix-partitioned joins; vEB layout; cache-oblivious matrix algorithms; funnelsort.
- **Parallel (Ch.32):** work–span model and work stealing; parallel merge; Pregel and the COST argument.
- **Complexity (Ch.33–35):** fine-grained complexity (SETH); LP rounding; PTAS/FPTAS; metric TSP; bin packing and LPT; local search; ski rental; online paging; FPT and kernels; treewidth; Yannakakis; worst-case optimal joins and the AGM bound.
- **Patterns and practice (Ch.36, 38):** complexity budgeting; graph modelling; recognizing reductions; testing algorithms with properties and oracles.
- **Systems in Production (new, all three milestones):** Swiss Tables, LevelDB/RocksDB, the Linux maple tree, Lucene; Timsort and its verification bug, OSRM contraction hierarchies, Maglev, Zstandard/ANS, RE2/Rust regex; join-order optimizers, Quincy/Firmament, SAT/PubGrub in package managers.

## Removed or merged
- Removed the old "Numbering note" about the Rust track's 1–43 numbering, which is no longer needed (as instructed).
- Removed the milestone preamble's "placed last only to avoid renumbering" and "cross-ref Ch.1.2 / Ch.20" framing. This is now its own domain, and the intro covers the interview purpose.
- Two copies of recurrences and the Master theorem (old 27.4 "Divide and conquer (recurrences, Master theorem)" and old 28.1 "Recurrence relations and the Master theorem") were merged into one topic in Ch.1. The Ch.21 divide-and-conquer refresher points to it.
- Suffix structures appeared twice (old 26.3 "Suffix trees / suffix arrays" and old 27.8 "suffix array/automaton applications"). They now live only in Ch.27 §27.2.
- Two copies of tries (old 26.3 tries and old 27.8 "Tries for matching/autocomplete") were merged into Ch.7. Edit distance (old 27.8) has one home in Ch.22.
- Two copies of union–find (old 26.5, and Kruskal's mention in 27.3) now live in Ch.11. Ch.19 and Ch.37 reference it.
- Duplicates of the sketches in old 26.5 and of the online/streaming/reservoir bullets in old 27.10 were merged into Ch.29–30. These cover theory and error bounds; *Data Engineering* §5.6 remains the home for production usage and its lab, and is cross-referenced.
- Old 27.3 "Cycle detection; bipartite check / 2-coloring" was too small to stand alone. Directed and undirected cycle detection were merged into the DFS reel, and bipartiteness into the BFS reel.
- Old 28.2's pattern list was merged into the "Recognizing reductions to known problems" topic, and its structure-for-constraint bullet into "Choosing the structure for the operation mix".
- Old 28.4's two practice bullets became four method topics. The original lab was kept and strengthened with property-based tests.
- Old 26.4 "Directed/undirected... multigraphs" (terminology only) was merged into the adjacency-representations refresher.

## Split topics
- Old 26.1: one bullet each became: dynamic arrays; linked/intrusive lists; stacks/queues/deques; monotonic stacks; ring buffers; strings; ropes/gap buffers/piece tables.
- Old 26.2 collision resolution → separate chaining, linear probing/open addressing, Robin Hood, cuckoo (+ Swiss Tables). Old "perfect hashing; crypto vs non-crypto" → perfect hashing and practical hash functions. Old consistent/rendezvous bullet → consistent hashing rings, and rendezvous/jump/Maglev.
- Old 26.3 (one section) was split into six chapters (Ch.4 BSTs, Ch.5 B-trees/LSM, Ch.6 heaps, Ch.7 tries, Ch.8 range queries, Ch.9 spatial), and each bullet into reels:
  - AVL, red-black, splay and treap;
  - binary/d-ary, binomial/pairing and Fibonacci heaps;
  - Fenwick and segment trees;
  - k-d trees, quadtrees and R-trees;
  - LSM into write/read path and compaction/amplification.
- Old 26.5 → union–find, skip lists and LRU caches (Ch.11). Filters became their own chapter (Ch.12), and sketches moved to Ch.30.
- Old 27.1 comparison-sorts bullet became: elementary sorts, merge sort, quicksort/partitioning, heapsort, introsort/pdqsort, and Timsort/Powersort/driftsort. Non-comparison and external merge sort stayed separate.
- Old 27.2 → binary-search invariants, binary search on the answer, exponential/interpolation search, rotated/matrix search, and quickselect/median-of-medians.
- Old 27.3 (one section) → Ch.17 traversal/connectivity, Ch.18 shortest paths (Dijkstra, Bellman–Ford, Floyd–Warshall/Johnson, A\* each their own reel), Ch.19 MST (Kruskal, Prim) and Ch.20 flows/matching (Ford–Fulkerson, Edmonds–Karp/Dinic, Hopcroft–Karp).
- Old 27.4 → Ch.21 (divide and conquer, greedy, Huffman), Ch.22 (one DP bullet became nine reels: state design, knapsack/coin change, edit distance/LCS, LIS, interval/matrix-chain, trees/DAGs, bitmask, digit) and Ch.23 (backtracking; branch and bound).
- Old 27.5 one bullet → two pointers, fast/slow pointers, sliding windows, prefix sums/difference arrays, Kadane, cyclic sort.
- Old 27.6 one bullet → masks, XOR tricks, popcount, subset enumeration.
- Old 27.7 one bullet → Euclid/CRT, modular exponentiation, sieves, Miller–Rabin, combinatorics. Basic probability moved to Ch.29.
- Old 27.8 → KMP, Z, Rabin–Karp, Boyer–Moore, Aho–Corasick, Manacher, suffix arrays, suffix automata.
- Old 27.9 one bullet → interval merging/scheduling, sweep line, orientation tests, convex hull.
- Old 27.10 → Ch.29 (Las Vegas vs Monte Carlo, reservoir sampling), Ch.30 (streaming) and Ch.32 (MapReduce pattern, parallel scan, parallel merge).
- Old 28.1 → asymptotics, amortized methods and potential method (Ch.1); P/NP (Ch.33); I/O lens → external-memory model (Ch.1).
- Old 28.3 one section of mapping lines → eight bridge reels in Ch.37.

## Moved
- Old 28.1 Complexity analysis (asymptotics, amortized analysis, recurrences, I/O lens) → **Ch.1, the first chapter of Milestone 1**, because dynamic arrays, hash resizing, splay trees, union–find and Fibonacci heaps all need amortized/potential analysis first. P/NP stayed in Milestone 3 (Ch.33).
- Old 26.3 suffix trees/arrays → Ch.27 §27.2 (string algorithms), next to their construction algorithms.
- Old 26.5 probabilistic structures → filters in Ch.12 (M1) and sketches in Ch.30 (M2).
- Old 27.3 max-flow/bipartite matching → its own chapter, Ch.20.
- Old 27.3 Kruskal/Prim → Ch.19.
- Old 27.10 "online algorithms" → competitive analysis in Ch.34 §34.2. Streaming algorithms → Ch.30.
- Old 27.9 interval scheduling's greedy proof → exchange-argument reel in Ch.21. Mechanics stay in Ch.28.

## Refresher-tagged
The 12 refresher-tagged topics:
- Asymptotic notation and case analysis (Ch.1)
- Stacks, queues and deques (Ch.2)
- Strings and string builders (Ch.2)
- Separate chaining (Ch.3)
- BST operations and rotations (Ch.4)
- Binary heaps and heapify (Ch.6)
- Adjacency lists, matrices and edge lists (Ch.10)
- Elementary sorts and sorting networks (Ch.15)
- Heapsort (Ch.15)
- Divide-and-conquer design (Ch.21)
- Masks and two's-complement tricks (Ch.25)
- Expectation and indicator variables (Ch.29)

## Unverified
These were stated from memory (well-known facts or venues) and not fetched this session, because the web-search budget ran out. They are worth a spot-check:
- S3-FIFO (SOSP 2023), SIEVE (NSDI 2024), W-TinyLFU in Caffeine.
- VS Code's piece-table switch in 2018.
- PostgreSQL 13 B-tree deduplication.
- RocksDB's cache-local Bloom format.
- Ribbon "~30% smaller than Bloom", from the RocksDB wiki.
- Binary fuse "~1.13× the minimum".
- Suffix trees "~10–20 bytes per character".
- Roaring users (Lucene, Druid, Pinot, Spark).
- NGINX `random two` and Envoy least-request (power of two choices).
- DuckDB key normalization in sort.
- Firmament (OSDI 2016) and Quincy (SOSP 2009).
- PubGrub used by Dart pub and uv.
- PostgreSQL `geqo_threshold` default 12.
- The Timsort bug (de Gouw et al., CAV 2015).
- Karlin–Klein–Oveis Gharan (STOC 2021).
- The paper venues cited inline in Ch.3–14 (e.g. Mirrokni et al. SODA 2018, Monkey SIGMOD 2017, Dostoevsky SIGMOD 2018, RUM EDBT 2016, PGM VLDB 2020, Poptrie SIGCOMM 2015, OLC DaMoN 2016, Bw-tree ICDE 2013 / SIGMOD 2018).
- Editions of Sedgewick & Wayne (4th, 2011), Erickson (2019), Herlihy et al. (2nd, 2020), Mitzenmacher & Upfal (2nd, 2017), Cormode & Yi (2020), Mehlhorn et al. (2019).

Cross-reference choice: section-level links to the Data Engineering domain use `→ *Data Engineering* §N.M` (or `Ch.N` where a whole chapter is meant). Data Engineering keeps Ch.1–24 numbering, so these stay valid as long as that slice keeps its section numbers. Old Ch.25-x references were mapped to Rust chapters: 25-A SPSC ring buffer → Ch.7; 25-D → Ch.19/21/22/24; hazard pointers/epochs → Ch.7/Ch.30; false sharing → Ch.29; loom → Ch.42; Tokio work stealing → Ch.9.

Topics: before 71 → after 260
