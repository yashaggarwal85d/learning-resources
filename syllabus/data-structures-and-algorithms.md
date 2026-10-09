# Data Structures & Algorithms — Syllabus

> Moved out of the Data Engineering syllabus as its own domain. Being restructured into Milestones → Chapters → Topics.

# MILESTONE 10 — Data Structures & Algorithms (Interview & Engineering Reference)
A comprehensive DSA reference: the structures and algorithms every engineer should know cold, with their data-engineering relevance called out. This milestone is **foundational and can be worked alongside Milestone 1** — it is placed last only to avoid renumbering the syllabus. It is also the explicit answer to the coding/DSA rounds interview loops open with (cross-ref Ch.1.2, which carries the curated DE-relevant subset, and Ch.20's applied warm-ups).

*Numbering note:* the syllabus's own chapters run Ch.1–Ch.28; Milestone 9's Rust track uses that book's internal 1–43 numbering, a separate space — references to "Ch.26/27" inside Milestone 9 mean the Rust book's chapters, not these.

**Approach (consistent with Ch.24):** learn **patterns, not problem counts** — implement each structure/algorithm once from scratch, know its complexity, and recognize which real data-system mechanism it powers.

## Chapter 26 — Data Structures
### 26.1 Linear structures
- Arrays and dynamic arrays (amortized growth, cache locality)
- Linked lists: singly, doubly, circular; when they beat arrays (and why cache behavior means rarely)
- Stacks, queues, deques; monotonic stack/queue
- Ring/circular buffers (bounded queues, backpressure — cross-ref Ch.25 SPSC ring buffer)
- Strings, string builders; immutability, rope/gap buffers

### 26.2 Hashing
- Hash tables / maps / sets; the hash function's role
- Collision resolution: separate chaining, open addressing (linear/quadratic probing, double hashing), Robin Hood, cuckoo
- Load factor, resizing/rehashing, amortized cost
- Perfect hashing; cryptographic vs non-cryptographic hashes
- **Consistent hashing** and rendezvous hashing (sharding, caches, partition assignment — cross-ref Ch.5.3)

### 26.3 Trees and hierarchical structures
- Binary trees; binary search trees (BST)
- Self-balancing: AVL, red-black, splay, treap
- **B-tree / B+-tree** (database/filesystem indexes — cross-ref Ch.5.1, Ch.25-D)
- **Heaps / priority queues:** binary, d-ary, binomial, Fibonacci (top-N, k-way merge, Dijkstra)
- **Tries / prefix trees,** radix/Patricia trees (autocomplete, routing, IP lookup)
- Segment trees, Fenwick / binary-indexed trees (range query + update)
- Suffix trees / suffix arrays (string indexing)
- Spatial: k-d trees, R-trees, quadtrees (geo / time-series indexing)
- **LSM-tree** (write-optimized storage — cross-ref Ch.5.1, Ch.25-D)

### 26.4 Graphs
- Representations: adjacency list, adjacency matrix, edge list; CSR for large sparse graphs
- Directed/undirected, weighted/unweighted, cyclic/acyclic (DAGs), multigraphs
- Property graphs (cross-ref Ch.17.3 / 17.4)

### 26.5 Disjoint sets and probabilistic/streaming structures
- **Union-Find / disjoint-set** (path compression, union by rank — connected components, dedup clustering)
- Skip lists (probabilistic balanced search; used in some LSM memtables)
- **Bloom / cuckoo filters, HyperLogLog, Count-Min Sketch, t-digest / DDSketch, MinHash / LSH** — approximate membership/cardinality/frequency/quantiles/similarity (full treatment in Ch.5.6)
- LRU / LFU cache structures (hashmap + doubly-linked list / frequency buckets — cross-ref Ch.5.5)

## Chapter 27 — Algorithms
### 27.1 Sorting
- Comparison sorts: quicksort (randomized pivot, quickselect), merge sort, heapsort, insertion/selection/bubble (why they still matter for small/nearly-sorted inputs), Timsort/introsort (real stdlib hybrids)
- Non-comparison: counting, radix, bucket
- **External merge sort** (sorting beyond memory — basis of large joins/aggregations that spill; cross-ref Ch.1.2, Ch.7)
- Stability, in-place vs out-of-place, the Ω(n log n) comparison lower bound

### 27.2 Searching and selection
- Linear search; **binary search** and boundary variants (lower/upper bound, first/last occurrence)
- Binary search on the answer (parametric search); search in rotated / 2D-sorted arrays; exponential/interpolation search
- Quickselect / median-of-medians (k-th smallest in expected O(n))

### 27.3 Graph algorithms
- Traversal: **BFS, DFS** (iterative + recursive), connected components
- **Topological sort** (Kahn's + DFS) — DAG scheduling (cross-ref Ch.11)
- Shortest paths: **Dijkstra**, Bellman-Ford (negative edges), Floyd-Warshall (all-pairs), A* (heuristic)
- Minimum spanning tree: **Kruskal** (with union-find), **Prim**
- Strongly connected components (Tarjan, Kosaraju); articulation points/bridges
- Cycle detection (directed/undirected); bipartite check / 2-coloring
- Max-flow / min-cut (Ford-Fulkerson, Edmonds-Karp, Dinic); bipartite matching
- Euler/Hamiltonian path awareness

### 27.4 Algorithm design paradigms
- **Divide and conquer** (recurrences, Master theorem)
- **Greedy** (interval scheduling, Huffman coding, when greedy is provably optimal)
- **Dynamic programming:** memoization vs tabulation; classic forms — knapsack (0/1, unbounded), LCS/LIS, edit distance, coin change, matrix-chain, interval DP, bitmask DP, DP on trees/DAGs, digit DP
- **Backtracking** (permutations/combinations/subsets, N-queens, Sudoku, constraint search) and **branch-and-bound**

### 27.5 Array/sequence techniques
- Two pointers; **sliding window** (fixed/variable); prefix sums and difference arrays; Kadane's (max subarray); cyclic sort / in-place index tricks

### 27.6 Bit manipulation
- Masks (set/clear/toggle/test); XOR tricks (single number, swap); counting bits; power-of-two checks; subset enumeration

### 27.7 Math and number theory
- GCD/LCM (Euclid), modular arithmetic and modular inverse, fast/modular exponentiation, sieve of Eratosthenes, primality (trial division, Miller-Rabin), combinatorics (nCr, Pascal), basic probability

### 27.8 String algorithms
- Pattern matching: **KMP**, Rabin-Karp (rolling hash), Z-algorithm, Boyer-Moore; Aho-Corasick (multi-pattern)
- Tries for matching/autocomplete; edit distance (DP); longest palindrome (Manacher's); suffix array/automaton applications

### 27.9 Intervals, geometry, and scheduling
- Interval merging/insertion/scheduling; sweep-line; meeting-rooms (heap); basic computational geometry (orientation test, convex-hull awareness)

### 27.10 Randomized, online, and parallel
- **Reservoir sampling** (uniform sample from a stream — cross-ref Ch.5.6), randomized quickselect, Monte Carlo vs Las Vegas
- Online/streaming algorithms (one pass, bounded memory — cross-ref Ch.5.6)
- Parallel/distributed primitives: map-reduce as an algorithmic pattern, parallel scan/prefix-sum, k-way merge (cross-ref Ch.3, Ch.7)

## Chapter 28 — Complexity, Patterns and Interview Technique
### 28.1 Complexity analysis
- Big-O / Θ / Ω; best/average/worst; time vs space trade-offs
- **Amortized analysis** (aggregate, accounting, potential — dynamic arrays, hash resizing)
- Recurrence relations and the Master theorem
- P / NP / NP-complete / NP-hard awareness; recognizing intractability and when to use approximation/heuristics
- The I/O and network complexity lens: for data systems, bytes moved and shuffled dominate CPU (cross-ref Ch.1.3)

### 28.2 Pattern recognition (the interview meta-skill)
- Recognize the pattern, not the problem: fast/slow pointers, top-K via heap, k-way merge, intervals, matrix traversal, DP state design, graph-modeling a word problem, binary-search-on-answer, monotonic stack
- Choosing the structure for a constraint: lookup → hash; ordered range → tree/B-tree; top-N → heap; membership-at-scale → Bloom; dedup groups → union-find

### 28.3 Data-engineering mapping (why this milestone isn't just LeetCode)
- Hash table → hash join / hash aggregation (Ch.2.3, Ch.7)
- External merge sort → spill-to-disk joins/aggregations (Ch.1.2, Ch.7)
- Heap / k-way merge → LSM compaction, shuffle merge, top-N (Ch.5.1, Ch.7)
- Topological sort → DAG / task scheduling (Ch.11)
- Union-find → connected components in lineage / entity-resolution graphs (Ch.8.3, Ch.17.3)
- B-tree / LSM-tree → storage-engine indexes (Ch.5, Ch.25-D)
- Consistent hashing → sharding and partition assignment (Ch.5.3)
- Sketches / reservoir sampling → approximate aggregation at scale (Ch.5.6)

### 28.4 Practice discipline
- Implement each core structure/algorithm once from scratch; then solve by pattern under a timer
- For every solution: state complexity, argue correctness informally, name an edge case and a failure mode (consistent with Ch.24)
- *Lab*: implement and unit-test from scratch — a hash map with resizing, a binary heap, a BST or B-tree, Dijkstra with a heap, an LRU cache, and quickselect; benchmark each against the language's standard library.
