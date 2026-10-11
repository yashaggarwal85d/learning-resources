## MIT 6.851 Advanced Data Structures, Lecture 11 scribe notes (integer data structures, models, van Emde Boas and y-fast trees)
URL: https://courses.csail.mit.edu/6.851/spring21/scribe/lec11.pdf
Version: 6.851: Advanced Data Structures, Fall 2017; Lecture 11 — March 22, 2012; Prof. Erik Demaine; scribes Stef Ren, Brian Shimanuki, Ray Hua Wu (2017), Sam Fingeret (2012), Shravas Rao (2012), Paul Christiano (2010)

> In this lecture, we will be discussing integer data structures that can be used to solve the predecessor problem.

> In each model, memory is arranged as a collection of words of some size (and potentially a small amount of working memory), and a fixed cost is charged for each operation.

> We also always make the fixed universe assumption.

> We assume that each data structure needs to answer queries with respect to a fixed set of w-bit integers U = {0, 1, 2, . . . , u − 1}.

> Memory is divided into an array of size S made up of cells of size w.

> It is practical to require w to be greater than log(S), as otherwise, you won’t be able to access the whole array.

> If we let n be the problem size, then this also implies that w ≥ log(n).

> There is some fixed set of operations, each of which modifies O(1) memory cells.

> Words serve as pointers, so cells can be addressed arbitrarily.

> you would expect as primitives in a high-level language such as C.

> Reading to or writing from a memory cell costs 1 unit.

> This model does not realistically reflect a modern processor, but its simplicity and generality make it appropriate for proving lower bounds.

> These models vary in how powerful they are.

> We are interested in data structures which maintain a set of integers S and which are able to insert an integer into S, delete an integer from S, report the smallest element of S greater than some query x, or report the largest element of S less than some query x.

> In the BST model, this problem is known to require Θ(log(n)) time per query.

> Using the Van Emde Boas data structure, we can achieve O(log(w)) time per query, and Θ(u) space.

> The goal of this data structure is to

> Because the binary tree has height w and the query time is dominated by the binary search on the path, this gives us an O(lg w) or O(lg lg u) query time bound.

> Theorem 1. A vEB tree preforms the operations sucessor, predecessor, insertion and deletion in O(log log u) time.

> Note that specifically, we only recurse once.

> All structures given so far require Ω(u) space, but we wish to achieve the optimal Θ(n) space bound.

> Suppose in our original van Emde Boas structure, we do not store empty clusters and replace child arrays by dynamic perfect hash tables.

> thus we obtain the optimal space bound of Θ(n).

> However, to perform an update, we still need to update all nodes along the path from the root, thus we have an O(w) update bound.

> The O(lg w) query bound is maintained, but the top-level update can now be charged to the Θ(w) bottom-level updates, thus the update time is dominated by the O(lg w) time for the bottom-level BST structures.

> Using van Emde Boas we can use O(log(log(u))) time per operation, and Θ(u) space.

> However, we can decrease the amount
> of space using modified version of the Van Emde Boas data structure, O(log(w)) time per query
> with high probability, and Θ(n) space. Y-fast trees also achieve the same bounds.

> Note that the query time of a fusion tree may or may not be better than that of a Y-fast tree,
> depending on our values of w and n.

> Given an integer x, it is stored in block V.cluster[c] and within that block it is at
> position i.

> which contains all integers c such that V.cluster[c] is not empty. Finally,
> each structure contains the minimum element, V.min (or None if it is empty), and a copy of the
> maximum element, V.max.

Added by the fact-check (2026-10-11). Section notes: "However, to perform an update ... O(w) update bound" above is in §6.2 X-fast trees, and "The O(lg w) query bound is maintained ..." is in §6.3 Y-fast trees; neither is about the hashed vEB of §6.1, whose bounds are the third quote below.

> In particular, the cell probe model is stronger than
> the trandichotomous RAM model which is in turn stronger than the word RAM model, followed
> by the pointer machine and the BST.

> Note that at each level,
> the minimum is stored directly, and not recursively.

> In addition, if we use a
> hash table with O(1) query and update with high probability, this allows us to obtain query and
> update bounds of O(lg lg u) with high probability.

> information for all w prefixes of every integer in the structure, for a worst case O(nw) space bound.


Contents:
1 Overview
2 Integer Data Structures: 2.1 Transdichotomous RAM; 2.2 word-RAM; 2.3 The Cell-Probe Model
3 Successor / Predecessor Queries: 3.1 BST Model; 3.2 Word RAM model; 3.3 Cell Probe Model; 3.4 Pointer machine model
4 Van Emde Boas Trees: 4.1 Successor; 4.2 Insert; 4.3 Delete; Theorem 1
5 Binary tree view: 5.1 Analysis; 5.2 Indirection
6 Reducing space: 6.1 Hash tables in vEB; 6.2 X-fast trees; 6.3 Y-fast trees
References
## MIT 6.851 Advanced Data Structures, Lecture 12: Fusion Trees (scribe notes)
URL: https://courses.csail.mit.edu/6.851/spring21/scribe/lec12.pdf
Version: Spring 2012, Lecture 12, April 3, 2012 (Prof. Erik Demaine; scribes Kent Huynh, Shoshana Klerman, Eric Shyu); file hosted under the spring21 course site

Model and main result.

> we will be working under the word RAM model (transdichotomous RAM with C-style operations)
> and we are looking to store n w-bit integers statically. Under these assumptions, the fusion tree
> covered here and detailed by Fredman & Willard in their original papers ([1], [2]) performs predecessor/successor operations in O(logw n) time, and require O(n) space, cf. the van Emde Boas
> trees which run in O(log w) time and require O(n) space.

Variants and the role of multiplication.

> • AC0 RAM version [3]: the model is restricted to operations with constant-depth (but unbounded fan-in and fan-out) circuits. In particular, multiplication is not permitted, since it
> requires a circuit of logarithmic depth in the number of bits (this model was more relevant in
> the past when multiplication was very costly relative to other operations like additions; this
> is no longer the case due to optimizations such as pipelining);

> • Dynamic version via exponential trees [4]: this version achieves O(logw n + lg lg n) deterministic update time, i.e. a lg lg n overhead over the static version;

> • Dynamic version via hashing [5]: this version achieves O(logw n) expected update time.

What a node holds.

> The underlying structure of a fusion tree is a B-tree, with branching factor w1/5 ; actually, any small
> constant power suffices, since the height of the tree will be Θ(logw n).

> we would like to achieve
> O(1) time for this operation, which appears impossible since it seems to require at least reading in
> O(w1/5 · w) = O(w6/5 ) bits.

> The main idea is to distinguish the set of keys in a
> node with less than w bits

Sketching.

> In essence, at most k − 1 = w1/5 − 1
> bits matter in ordering the xi .

> Clearly, the sketch operation preserves order among the xi , since each sketch
> keeps the bits that distinguish all the xi in the right order.

> Sketching also allows all keys to
> be read in constant time, since each sketch has O(w1/5 ) bits so the total size of all sketches is
> O(kw1/5 ) = O(w2/5 ) = o(w) bits.

> In fact, the location of sketch(q) can be completely different from the location of q.

Approximate sketch.

> Although a perfect sketch is computable in O(1) time as an AC 0 operation, we want a way to
> compute an approximate sketch on a Word RAM using just multiplication and other standard
> operations.

> So this approximate sketch will have all the important bits, spread out in some
> predictable pattern (independent of the word x we are sketching) of length O(w4/5 ), with some additional garbage between them.

Parallel comparison in one word.

> We store all the sketches of the xi ’s at a node in a single word by prepending a 1
> to each and concatenating them.

> Then we subtract this value from the node sketch. This lets us subtract 0sketch(q) from each
> 1sketch(xi ) with a single operation: since 1sketch(xi ) is always bigger than 0sketch(q), carrying
> will not cause the subtractions to interfere with each other.

> In fact, the first bit of each block will be
> 1 if and only if sketch(q) ≤ sketch(xi ).

> To do this, we can multiply by 000001. . . 000001: all the
> bits which were set to 1 will collide in the first block of the result, so we can find their sum by

Most significant set bit.

> We conclude with the computation of the index of the most significant set bit of a w-bit word in
> O(1) time, under the word RAM model.

> The solution is particularily messy, but it will use all
> the techniques that we have just seen for fusion trees.

Practicality: the only remark is the historical note on multiplication cost in the AC0 bullet above; the notes make no claim that fusion trees are practical.

Added by the fact-check (2026-10-11): the AC0 RAM bullet is a fusion-tree *version* without multiplication; its reference [3] is the paper that shows it.

> Under some models, such as the AC0 model, the perfect sketch
> operation is a single operation [3].

> [3] A. Andersson, P. B. Miltersen, and M. Thorup. Fusion trees can be implemented with AC0
> instructions only.

> Here, the sketch neighbours of q are x0 and x1 , but x0 is neither
> a predecessor nor successor of q.

Contents:
- 1 Introduction (sketching, parallel comparison, most significant set bit in constant time)
- 2 Overview of Fusion Trees (word RAM model, O(log_w n) static predecessor, AC0 / exponential-tree / hashing variants)
- 3 The General Idea (B-tree with branching w^(1/5), O(1) node search goal)
- 4 Sketching (perfect sketch, order preserved, total size o(w) bits)
- 5 Desketchifying (handling queries not among the keys)
- 6 Approximating Sketch (multiplication by a mask, Claim 1 with proof)
- 7 Parallel Comparison (node sketch, subtraction, counting 1 bits by multiplication)
- 8 Most Significant Set Bit (sqrt(w) clusters, constant-time procedure)
- References (Fredman-Willard 1990 and 1993, Andersson-Miltersen-Thorup 1999, Andersson-Thorup 2007, Raman 1996)
## 6.851 Advanced Data Structures, Lecture 14: Integer Sorting (scribe notes)
URL: https://courses.csail.mit.edu/6.851/spring21/scribe/lec14.pdf
Version: Lecture 14, April 10, 2012 (Prof. Erik Demaine; scribe notes posted with the Spring 2021 course materials)

> Today we are going to cover integer sorting.


> Thorup [7] showed that if we can sort n w-bit integers in O(nS(n, w)), then we have a priority queue

> We can sort in linear time if w = O(lg n) using radix sort.

> OPEN: O(n) time sort for all w

> The signature sort was developed in 1998 by Andersson, Hagerup, Nilsson, and Raman [2]. It sorts
> n w-bit integers in O(n) time when w = Ω(log2+ε n) for some ε > 0.

Contents:
1 Overview
2 Priority Queues
3 Survey of Integer Sorting
4 Sorting for w = Ω(log2+ε n)
4.1 Bitonic Sequences
4.2 Logarithmic Merge Operation
4.3 Packed Sorting
4.4 Signature Sort Algorithm
References

## MIT 6.006 Introduction to Algorithms (Spring 2020), Lecture 5: Linear Sorting
URL: https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/78a3c3444de1ff837f81e52991c24a86_MIT6_006S20_lec5.pdf
Version: Spring 2020 lecture slides (MIT OpenCourseWare)

> Running time is Θ(u), which is Θ(n) if u = Θ(n). Yay!

> Idea! Represent each key k by tuple (a, b) where k = an + b and 0 ≤ b < n

> Want sort to be stable: repeated keys appear in output in same order as input

> Stability ensures previous sorts stay sorted

> If every key < nc for some positive c = logn (u), every key has at most c digits base n

> We sort each of the c base-n digits in O(n) time

> So tuple sort with auxiliary counting sort runs in O(cn) time in total

> If c is constant, so each key is ≤ nc , this sort is linear O(n)!

Added by the fact-check (2026-10-11):

> Comparison model implies that algorithm decision tree is binary (constant branching factor)

> Thus height lower bounded by log(n!) ≥ log((n/2)n/2 ) = Ω(n log n)

> Hash tables give expected O(1) time operations, amortized if dynamic

Contents:
Direct access array sort
Tuple sort
Counting sort
Radix sort
Summary table of sorting algorithms
## The microarchitecture of Intel, AMD and VIA CPUs
URL: https://www.agner.org/optimize/microarchitecture.pdf
Version: Agner Fog, copyright 1996 - 2026, last updated 2026-05-23
> In the PPro, P2 and P3, the misprediction penalty is higher due to the long pipeline. A misprediction usually costs between 10 and 20 clock cycles.

> The misprediction penalty is approximately 13 clock cycles in the PM and 15 clock cycles in the Core2, corresponding to the length of the pipeline.

> The misprediction penalty is longer than on Core2 due to a longer pipeline. The measured misprediction penalty is at least 17 clock cycles.

> The misprediction penalty was measured to 15 clock cycles or more for branches inside the µop cache and slightly more for branches in the level-1 code cache.

> The branch misprediction penalty varies a lot. It was measured to 15 - 20 clock cycles.

> The misprediction penalty is typically 16 clock cycles, max. 20.

> AMD manuals say that the branch misprediction penalty is 10 clock cycles if the code segment base is zero and 12 clocks if the code segment base is nonzero.

> The misprediction penalty corresponds to the length of the pipeline.

> The misprediction penalty is specified as minimum 20 clock cycles for conditional and indirect branches and 15 clock cycles for unconditional jumps and returns.

> The average misprediction penalty was measured to approximately 18 clock cycles for Zen 1-3. The misprediction penalty varies from 15 - 18 in Zen 4 and 15 - 25 in Zen 5.

> The total length of the pipeline can be estimated from the branch misprediction penalty

> In the PMMX, the penalty for misprediction of a conditional jump is 4 clocks in the U-pipe, and 5 clocks if it is executed in the V-pipe.

> If the program is accessing large amounts of data, or if the data are scattered around everywhere in the memory, then we will have many data cache misses. Accessing uncached data is so time consuming that all other optimization considerations are unimportant.

> If you expect many data cache misses, then forget about everything else and concentrate on how to restructure the data to reduce the number of cache misses

> In order execution. The processor can do nothing while it is waiting for a cache miss or a long-latency instruction

> it turns out that the guess was wrong and the wrong branch was executed speculatively,
> then the pipeline is flushed, the results of the speculative execution are discarded and the
> other branch is fed into the pipeline. This is called a branch misprediction, and the result is
> that several clock cycles are wasted. The number of wasted clock cycles is approximately
> equal to the length of the pipeline.

> Speculative execution means that the
> instructions are decoded and executed, but the results are not retired into the permanent
> register file, and memory writes are pending until the branch instruction is finally resolved.

Added by the fact-check (2026-10-11). Which processor each penalty quote above belongs to (section of the manual): 10–20 = §3.3 PPro/P2/P3; ~13 / 15 = §3.5 PM and Core2; ≥ 17 = §3.6 Nehalem; 15 or more = §3.7 Sandy Bridge/Ivy Bridge; 15–20 = §3.8 Haswell to the Lakes; 16 typical / 20 max = §3.10 VIA Nano; 10 or 12 (AMD manuals) and "corresponds to the length of the pipeline" = §3.11 AMD K8/K10; minimum 20 / 15 (specified) = §3.12 AMD Bulldozer family; ~18 / 15–18 / 15–25 = §3.13 AMD Zen; 4 / 5 clocks = §3.3 PMMX. The "uncached data" and "forget about everything else" quotes sit in the bottleneck sections for the P4 (§5.13), PM (§7.15) and PPro/P2/P3 (§6.10). Current cache figures for Zen 5:

> In my
> measurements, I have found a minimum branch misprediction penalty of 12 and 13 clock
> cycles, respectively.

> Level 1 data
> 48 kB, 12 way, 64 sets, 64 B line size, per core. Latency 4 clocks
> Level 2
> 1 MB, 16 way, 64 B line size, per core. Latency 14 clocks

> Table 25.1. Cache sizes on AMD Zen 5

Contents:
1 Introduction
2 Out-of-order execution (All processors except P1, PMMX)
3 Branch prediction (all processors)
4 Intel Pentium 1 and Pentium MMX pipeline
5 Intel Pentium 4 (NetBurst) pipeline
6 Intel Pentium Pro, II, and III pipeline

## What Every Programmer Should Know About Memory
URL: https://people.freebsd.org/~lstewart/articles/cpumemory.pdf
Version: Ulrich Drepper, Red Hat, Inc., November 21, 2007
> As CPU cores become both faster and more numerous, the limiting factor for most programs is now, and will be for some time, memory access.

> Finally, we should at least give an impression of the costs associated with cache hits and misses. These are the numbers Intel lists for a Pentium M:

> Assume access to main memory takes 200 cycles and access to the cache memory take 15 cycles. Then code using 100 data elements 100 times each will spend 2,000,000 cycles on memory operations if there is no cache and only 168,500 cycles if all data can be cached. That is an improvement of 91.5%.

> If the entire working set fits into the L1d the cycles per operation on each element is below 10. Once the L1d size is exceeded the processor has to load data from L2 and the average time springs up to around 28. Once the L2 is not sufficient anymore the times jump to 480 cycles and more.

> Before we said that a main memory access takes 200+ cycles.

> The machine makes it possible to access the main memory in 200-300 cycles but here we reach 450 cycles and more.

> Given the low latency of L1i and L1d caches (∼ 3 cycles)

> The times for the L1d hits are expected: load times after an L1d hit are around 4 cycles on the P4.

> Unlike storage subsystems, removing the main memory as a bottleneck has proven much more difficult and almost all solutions require changes to the hardware.

> So the entries stored in the caches are
> not single words but, instead, “lines” of several contiguous words. In early caches these lines were 32 bytes
> long; nowadays the norm is 64 bytes.

Added by the fact-check (2026-10-11). The "below 10 … 28 … 480" staircase is the random-write test of Figure 3.4; the "450 cycles and more" is the random-read test of Figure 3.15, whose rise Drepper attributes to TLB misses:

> Figure 3.4: Access Times for Random Writes

> If the access pattern is unpredictable or random the situation is quite different.

> The reason behind this is a rising rate of TLB misses.
Contents:
1 Introduction
2 Commodity hardware today
3 CPU caches
4 Virtual memory
5 NUMA support
6 What programmers can do
7 Memory performance tools
8 Upcoming technology
## Time-Space Trade-Offs for Predecessor Search
URL: https://arxiv.org/pdf/cs/0603043
Version: arXiv:cs/0603043v1 [cs.CC], 10 Mar 2006 (extended abstract in STOC 2006)

> Given a set Y of n integers of ℓ bits each, the goal is to efficiently find predecessor(x) = max {y ∈ Y | y ≤ x}. For this purpose, we represent Y on a RAM with word length w using S words of space. Defining a = lg Sn + lg w, we show that the optimal search time is, up to constant factors:

> More formally, we will represent Y on a unit-cost word RAM with a given word length w. We assume each integers in Y has ℓ bits, and that lg n ≤ ℓ ≤ w. On the RAM, the most natural assumption is ℓ = w.

> In keeping with the standard assumptions on the upper bound side, we only consider w = Ω(lg n).

> Thus, the model is stronger than the word RAM or its variants, which are used for upper bounds, implementable in a programming language like C.

> We can then use all the instructions on integers available in a standard programming language such as C, and we are no longer limited by the Ω(lg n) comparison based lower bound for searching.

> Using the classic data structure of van Emde Boas [19] from 1975, we can represent our integers so that predecessors can be searched in O(lg ℓ) time. The space is linear if we use hashing [20].

> In the 1990, Fredman and Willard [10] introduced fusion trees, which requires linear space and can answer queries in O(logℓ n) time.

> In the important case of w = ℓ = γ lg n, for γ > 1 (i.e. polynomial universes), and near linear space (such as S = n·lgO(1) n), the optimal search time is Θ(lg ℓ). Thus, our lower bound implies the surprising conclusion that van Emde Boas’ classic data structure from [FOCS’75] is optimal in this case.

> To understand the first branch of the trade-off, first consider the typical case on a RAM, when a word fits exactly one integer, i.e. w = ℓ. In this case, the bound is logℓ n, which describes the performance of fusion trees [10].

> The first term describes the performance of fusion trees on a RAM with ℓbit words, as noted above.

> Thus, we show that it is always optimal to either use a standard B-tree, or the best RAM algorithm which completely ignores the benefits of external memory.

> Quite surprisingly, our lower bound shows that van Emde Boas’ classic data structure, with these trivial tweaks, is optimal.

> We are working on a RAM with word length w ≥ ℓ.

> This can be done by clever use of multiplication as described in [10].

Added by the fact-check (2026-10-11). The multiplication quote above is about computing the length of a common prefix in the paper's own construction, citing Fredman–Willard [10]; it is not about the sketch.

> Note that for space n1+ε , a
> running time of O(lg ℓ/ lg lg ℓ) was given by Beame and Fich [STOC’99].

> The fastest deployed software solutions use non-comparison-based
> RAM tricks [6].


Note: pdftotext garbles the displayed min{...} formula (log_w n, lg((ℓ-lg n)/lg a), lg(ℓ/a)/lg(lg(ℓ/a)/lg(lg n/lg a)), ...); only the surrounding sentences are quoted. The paper does not state multiplication as unit cost in its model sentence; it says "unit-cost word RAM" and uses multiplication in fusion-tree citations.

Contents:
1. Abstract: cell-probe lower-bound technique, tight predecessor bound
2. 1.1 The Complexity-Theoretic View (cell-probe vs word RAM)
3. 1.2 The Data-Structural View: upper-bound story (van Emde Boas, fusion trees, Beame-Fich) and lower-bound story
4. 1.3 Our results: the branches of the trade-off, external memory
5. Upper-bound constructions (fusion or B-trees, tuned van Emde Boas)
6. Lower-bound proof via cell-probe elimination

## Surpassing the Information Theoretic Bound with Fusion Trees
URL: https://users.cs.utah.edu/~pandey/courses/cs6968/spring23/papers/fusiontree.pdf
Version: Journal of Computer and System Sciences 41, 424-436 (1993); received October 23, 1990; revised September 2, 1991 (course-hosted copy; scanned text has OCR errors)

> This paper introduces a new sublogarithmic data structure for searching, the fusion tree. These trees lead to improved worst-case algorithms for sorting and searching, surpassing the limitations of the information theoretic lower bound.

> Paul and Simon [4] have established that any unit cost random access machine algorithm whose operations include addition, subtraction, multiplication, and comparison with zero (but not division or bit-wise Boolean operations) requires SZ(Nlog N) time to sort N numbers in the worst case.

> On the other hand, with the inclusion of division and Boolean operations, they obtain a linear time algorithm. This linear time algorithm, however, suffers from an abuse of the unit cost assumption.

> In particular, the algorithm generates operands during the course of its computation whose individual lengths are N* times the length of the largest of the N numbers to be sorted.

> What seems to be needed is a computational model that avoids the potential abuses of the unit cost random access machine, but allows for unit cost operations among operands of “reasonable” size, i.e., operands of size commensurate with the sizes of the numbers to be sorted.

> Accordingly, we consider a reformulation of the sorting problem wherein our machine has a b-bit word size, and each of the N input numbers is assumed to be a non-negative integer less than 2’ (and hence each tits into one word).

> Moreover, it is desirable that a sorting algorithm use only O(N) words of memory.

> there is the priority queue of Van Emde Boas et al [5] which accommodates priority queue operations in time log log U per operation, where U = 2’ is the universe size. This structure requires U words of memory, however.

> Fusion trees accommodate dynamic search operations in amortized time O(log N/log log N) per operation on a random access machine with b-bit word size, whose instruction set includes addition, subtraction, multiplication, comparison, and bit-wise AND operations.

> We emphasize that the implicit constant inside the O-notation is independent of b.

> Moreover, if we allow randomization and integer division, we show that dynamic searching and sorting can be accomplished in times, respectively, O(m) and O(Nm).

> Our algorithms have theoretical interest only; the constant factors involved in the execution times preclude practicality.

> We observe that the bitwise Boolean operations, OR and XOR (exclusive OR), can be implemented on our machine by making use of the constant 2’- 1 = bin(O, 1, .... b - l), subtraction (so that we can complement a word), along with the AND operation.

> The fusion tree can be roughly regarded as an implementation of a B-tree [2] such that (a) the approximate degree B of an internal node is an increasing, unbounded function of N, and (b) when performing a key search, the correct child of each node along the search path can be determined in constant time, independently of B.


Added by the fact-check (2026-10-11):

> The information theoretic bound asserts that sorting N numbers requires N log N
> comparisons in the worst case.

> these approaches improve upon conventional sorting only for
> sufticiently large values of N

> We assume that the multipliction instruction produces a two-word product, one
> consisting of the most significant b bits, the other containing the least significant b
> bits.

> algorithms use multiplication, which does not belong to AC’. Thus, it would be
> interesting to know if there exist fast sorting and searching algorithms that can
> be implemented with AC0 instructions.

> The beguiling successes of this
> appealing model of computation have led to many claims that various Nlog N
> algorithms are optimal, conclusions that should not be taken too seriously.

Note: the word "transdichotomous" does not appear in this copy's extracted text; the coinage is attested only via Wikipedia (pointer, not quoted), which cites this paper and Fredman and Willard's name choice.

Contents:
1. Introduction: information-theoretic bound, Paul-Simon unit-cost caveat, the word-size model
2. Notation and other preliminaries (bin(), multiplication as two-word product, Boolean operations)
3. Overview of fusion trees
4. Fusion tree construction, search, updates
5. Sorting application and randomized/division variant

## Algorithms and Data Structures: The Basic Toolbox, Chapter 2 "Introduction" (the RAM model)
URL: https://people.mpi-inf.mpg.de/~mehlhorn/ftp/Toolbox/Introduction.pdf
Version: K. Mehlhorn and P. Sanders, Springer 2008; the authors' free chapter PDF (chapter 2, "Introduction"), as served on 2026-10-11. A book: framing beside the opened course notes and papers, and beside examples.py.

> there is a single processing unit,
> and all memory accesses take the same amount of
> time.

> Our default assumption is that integers bounded by a polynomial
> in the size of the data being processed can be stored in a single cell. Such integers
> can be represented by a number of bits that is logarithmic in the size of the input.

> This assumption is reasonable because we could always spread out the contents of a
> single cell over logarithmically many cells with a logarithmic overhead in time and
> space and obtain constant-size cells. The assumption is convenient because we want
> to be able to store array indices in a single cell. The assumption is necessary because
> allowing cells to store arbitrary numbers would lead to absurdly overoptimistic algorithms.

> Our model supports a limited form of parallelism. We can perform simple operations
> on a logarithmic number of bits in constant time.

> The arithmetic operations are the usual +, −, and ∗ but also
> the bitwise operations | (OR), & (AND), >> (shift right), << (shift left), and ⊕
> (exclusive OR, XOR). The operations div and mod stand for integer division and
> the remainder, respectively.

> It is important to remember that the RAM model is an abstraction. One should
> not confuse it with physically existing machines. In particular, real machines have
> a finite memory and a fixed number of bits per register (e.g., 32 or 64). In contrast,
> the word size and memory of a RAM scale with input size.

> The RAM model restricts cells to holding a logarithmic number of bits.

Added by the fact-check (2026-10-11). The squaring sentence's exponents are lost in extraction ("2n" is 2ⁿ in the book):

> For example, by repeated squaring, we could generate a number with 2n
> bits in n steps.

> Ri := S[R j ] loads the contents of the memory cell indexed by the contents of R j
> into register Ri .

> S[R j ] := Ri stores register Ri into the memory cell indexed by the contents of R j .

> Each instruction takes one time step to execute.

> The worst-case time for a memory access to the main memory
> can be hundreds of times higher than the best-case time.

> Many processors have 128–512-bit-wide SIMD registers that allow the parallel execution of a single instruction on multiple data objects.

Contents:
2.1 Asymptotic Notation
2.2 The Machine Model (the RAM: uniform memory, words of logarithmic size, the instruction set, why the word size is tied to the input, the RAM as an abstraction of real machines, external memory, parallel processing)
2.3 Pseudocode
2.4 Designing Correct Algorithms and Programs
2.5 An Example — Binary Search
2.6 Basic Algorithm Analysis
2.7 Average-Case Analysis
2.8 Randomized Algorithms
2.9 Graphs
2.10 P and NP
2.11 Implementation Notes
2.12 Historical Notes and Further Findings (Sheperdson and Sturgis define the RAM; cells hold a logarithmic number of bits)
