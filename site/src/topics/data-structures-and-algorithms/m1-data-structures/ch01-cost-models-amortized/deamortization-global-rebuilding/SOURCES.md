# Sources

## Data Structures, chapter "Dynamization" (Mares et al., lecture text, LaTeX source)
URL: https://gitlab.kam.mff.cuni.cz/datovky/dsbook/-/raw/04bd1ec6c83d9dd651ca58197c83a4e44255de14/51-dynamize/dynamize.tex
Version: dsbook repository, commit 04bd1ec6c83d9dd651ca58197c83a4e44255de14, file 51-dynamize/dynamize.tex

> fixing it and rebuild it completely anew.

> If initializing the structure with $n$ elements takes $f(n)$ time steps and

> we perform the rebuild after $\Theta(n)$ modifying operations, we can amortize

> the cost of rebuild into the operations. This adds an amortized factor

> Once we run out of space, we build a new structure with capacity

> we just replace them with ``tombstones''. When we run a query later, we just ignore tombstones.

> Once again, the idea is simple -- once at least $n/2$ of elements are tombstones, we rebuild

> changes by a constant factor (then $\log n$ changes by a constant additively).

> In many cases, it is enough to rebuild just a part of the structure to fix

> However, if we wish to insert a new element to an already existing sorted array,

> An insertion of $x$ will act like an addition of 1 to a binary number. Let $i$

> So far we have created a data structure that acts well in the long run, but one

> insertion can take a long time. This may be unsuitable for applications where we

> Our construction can be deamortized for the price that the resulting

> constructing the block at once, but decomposing the construction such that on

> each operation we do a small amount of work on it until eventually the whole

> However, insertion is not the only operation, we can also ask queries even

> during the construction process. Thus we must keep the old structures until the

> three finished blocks and at most one block in construction.

> Each insertion builds a block of size 1 and then runs up to $\log n$

> block and crosses it out. We also keep the count of crossed out elements. If

> Before having to rebuild the whole structure, we cross-out at least $\Theta(n)$

Added by the fact-check (D23, D24): the condition of the O(f(n)/n) bound, and the rest of D13's sentence.

> $\O(f(n)/n)$ to their time complexity, given that $n$ does not change

> require low latency. In such cases, we would like that each insertion is fast


Contents:
- Static, semi-dynamic and fully dynamic structures; sorted array vs BST trade-off.
- Global rebuilding: rebuild after Theta(n) updates, amortized O(f(n)/n) overhead; examples: array doubling, y-fast trie, tombstones.
- Local rebuilding of parts of a structure (weight-balanced trees).
- General semi-dynamization via decomposable search problems and binary-counter blocks; query, space and amortized insertion bounds.
- Worst-case semi-dynamization: build blocks incrementally, a few steps per operation, keeping old blocks for queries; at most three finished blocks and one under construction per rank.
- Full dynamization: crossing out deleted elements, a BST mapping elements to blocks, global rebuild when enough are crossed out.

## Algorithms, Lecture 9: Amortized Analysis (Jeff Erickson)
URL: https://jeffe.cs.illinois.edu/teaching/algorithms/notes/09-amortize.pdf
Version: Lecture 9 [Fa'13], copyright 2018 Jeff Erickson, CC BY-NC-SA 4.0

> Thus, if B represents an integer between 0 and n, Increment takes Θ(log n) time in the worst case.

> If we only use the worst-case running time for each Increment, we get an upper bound of O(n log n) on the total running time.

> Although this bound is correct, we can do better; in fact, the total running time is only Θ(n).

> Many (perhaps even all) of these methods are logically equivalent, but different formulations are more natural for different problems.

> There is no probability involved; we are averaging over a sequence of operations, not the possible running times of a single operation.

> Thus, the worst-case cost of Increment is O(log n), but the amortized cost is only O(1).

> but these are just fancy names for computing the total cost of all operations and then dividing by the number of operations.

> Let T (n) be the worst-case running time for a sequence of n operations. The amortized time for each operation is T (n)/n.

> One of those dollars is spent changing the bit from zero to one; the other is stored away as credit until we need to reset the same bit to zero.

> The tightest bounds are obtained from tax schedules that just barely stay in the black.

> we are overestimating the total cost of any sequence of operations, since we pay for some charges from future operations that may never actually occur.

> we represent prepaid work as potential that can be spent on later operations. The potential is a function of the entire data structure.

> A potential function is valid if Φi − Φ0 ≥ 0 for all i.

> Define a potential function for the data structure that is initially equal to zero and is always non-negative. The amortized cost of an operation is its actual cost plus the change in potential.

> A good potential function goes up a little during any cheap/fast operation, and goes down a lot during any expensive/slow operation.

> Unfortunately, there is no general technique for finding good potential functions, except to play around with the data structure and try lots of possibilities (most of which won't work).

> A standard binary counter won't work, even in an amortized sense; if we alternate between 2k and 2k − 1, every operation costs Θ(k) time.

> because we don't know what the sequence of operations looks like.

> maintains a Gray code counter in constant worst-case time per increment!

> It's also important to remember that amortized time bounds are not unique.

> there is no general reason to prefer one of these sets of amortized time bounds over the other; our preference may depend on the context in which the data structure is used.

> we will use the following global rebuilding rules:

> Show that for any sequence of insertions and deletions, the amortized time per operation is still O(1).

Added by the fact-check (E24–E27): the two rules of exercise 9 (the table grows at more than 3/4 full, not at full), and Ehrlich's year and worst case.

> After an insertion, if the table is more than 3/4 full, we allocate a new table twice as

> After a deletion, if the table is less than 1/4 full, we allocate a new table half as big as

> discovered by Gideon Ehrlich1 in 1973

> The EhrlichGrayIncrement algorithm obviously runs in O(1) time, even in the worst case.


Contents:
- 9.1 Incrementing a binary counter: the Increment algorithm and its Θ(log n) worst case.
- 9.2 Counting from 0 to n: Θ(n) total, via summation (aggregate), taxation (accounting, two schedules), charging, and potential methods.
- 9.3 Incrementing and decrementing: the double (P, N) binary counter, amortized cost at most 2 by potential.
- 9.4 Gray codes: Ehrlich's focus-array algorithm giving constant worst-case time per increment (a deamortized counter).
- 9.5 Generalities and warnings: amortization applies to any sequence; amortized bounds are not unique.
- Exercises: extendable array, ordered stack, multistack, queues with MultiPush/MultiPull, hash-table global rebuilding with 3/4 and 1/4 thresholds, queue from two stacks, Nudge counters, Fibonacci and doubly lazy counters.

## Scapegoat Trees (Igal Galperin and Ronald L. Rivest)
URL: https://people.csail.mit.edu/rivest/pubs/GR93.pdf
Version: SODA 1993 proceedings paper, Chapter 19, pp. 165-174 (author PDF, MIT LCS)

> The amortized complexity per INSERT or DELETE is O(log n) while the worst-case cost of a SEARCH is O(log n).

> Each node in the tree contains only a key value and pointers. to its two children.

> the number of nodes in the whole tree, and the maximum number of nodes in the tree since the tree was last completely rebuilt.

> is found that is so unbalanced that the entire subtree rooted at the scapegoat can be rebuilt at zero cost, in an amortized sense.

> achieves optimal amortized costs for update operations (INSERT and DELETE)

> However, splay trees do not guarantee a logarithmic worst-case bound on the cost of a SEARCH, and require restructuring even during searches

> SEARCH, INSERT and DELETE operations on scapegoat trees are performed in the usual way for binary search trees, except that, occasionally, after an update operation (INSERT or DELETE) the tree is restructured

> balanced if its height is not greater than that of the heighest a-weight-balanced tree of the same size.

> Although scapegoat trees are not guaranteed to be a-weight-balanced at all times

> In a scapegoat tree, SEARCH operations proceed as in an ordinary binary search tree. No restructuring is performed.

> To insert a node into a scapegoat tree, we insert it as we would into an ordinary binary search tree, increment size[T],

> We climb the tree, examining x0, x1, 22, and so on, until we find a node xi that is not o-weight-balanced.

> To rebuild a subtree is to replace it with a l/a-weight-balanced subtree containing the same nodes.

> Deletions are carried out by first deleting the node as we would from an ordinary binary search tree, and decrementing size[T].

> If x is a node at depth greater than h,(T) then there is an cY-weight-unbalanced ancestor of 2.

> Since a scapegoat tree is loosely a-height-balanced and o is fixed, a SEARCH operation takes worsl-case time

> The time to find the scapegoat node xi iS O(Si%e(Xi)).

> this potential is sufficient to pay for finding the scapegoat node and rebuilding its subtree.

> A scapegoat tree can handle a sequence of n INSERT and m SEARCH operations, beginning with an empty tree, with O(logn) amortized cost per INSERT

> Since we perform Q(n) operations between two successive rebuilds due to delete operations we can

> with O(logn) amortized cost per INSERT or DELETE and O(logk) worstcase time per SEARCH, where k is the size of the tree

> A straightforward way of rebuilding a tree is to use a stack of logarithmic size to traverse the tree in-order in linear time and copy its nodes to an auxiliary array.

> The procedure runs in time proportional to the number of nodes in the subtree, and in space proportional to its height

> The ideas underlying scapegoat trees are that of finding and rebuilding a subtree whose root is not weightbalanced when the tree gets too deep, and periodically rebuilding the root after enough DELETES occurred.

> Unsurprisingly, as the value of cr is increased the SEARCH and DELETE operations perform faster, while the INSERTS become slower.

> that achieves a worst-case SEARCHtime of O(logn), with reasonable amortized update costs.

Added by the fact-check (G27–G41). The PDF is a scan with an OCR text layer; the displayed formulas are garbled or missing there, so these were read from the page images (pdftoppm, pages 166–174) and cannot be quote-checked: h_α(n) = ⌊log_(1/α) n⌋ (p. 166, the display under "We denote"); "We assume from now on that a fixed α, 1/2 < α < 1, has been chosen" (p. 166, strict, while the weight-balance definition allows 1/2 ≤ α < 1); (4.7) size[T] < α · max_size[T] (p. 167, strict); "To rebuild a subtree is to replace it with a 1/2-weight-balanced subtree" (p. 167; G13's "l/a" is OCR for "1/2"); Lemma 5.1's proof ends "the depth d(x) of a node x is at most log_(1/α) size[T]" (p. 167); Theorem 5.1, "If a scapegoat tree T was created from a 1/2-weight-balanced tree by a sequence of INSERT operations, then T is α-height-balanced" (p. 168); BUILD-TREE's first recursive call builds the left subtree of ⌈(n − 1)/2⌉ nodes, so the root is the upper middle (p. 170); Figure 4 and Figure 5 (pp. 173–174, timing tables, not in the text layer): inserts get faster as α grows from 0.55 to 0.75 (uniform, 1K: 9.46 to 3.83 s per 128K operations; sorted, 1K: 21.25 to 13.94 s), and on uniform inputs searches and deletes get slower (1K: 1.65 to 1.87 s and 3.49 to 6.88 s). The sentence G25 states the reverse of the tables; do not cite it.

> each node only stores three values: key, left, and right.

> The rebuilt subtree is 1/2weight-balanced.

> and define the potential of node x to be 0 if A(x) < 2, and A(x) otherwise.

> it is just an accounting fiction representing the amount of “prepaid work” available at node x.

> Since this ancestor will often be higher in the tree than the first weight-unbalanced ancestor, it may tend to yield more balanced trees on the average.

> our experiments this heuristic performed better than choosing the first weight-unbalanced ancestor to be the scapegoat.

> Our experiments suggest that checking for condition (4.6) yields a better overall performance.

> proved to work faster than the method described in section 6.1 by 25% - 30%.

> However, for the insertion of sorted sequences scapegoat trees are noticeably slower than the other two data structures.

> Red-black trees implement the basic dictionary operations with a worst-case cost of O(logn) per operation, at the cost of storing one extra bit

> We leave as an open problem the average-case analysis of scapegoat trees

> In Section 7 we show how our techniques can be used in k - d trees

> technique can be applied to other tree-like data

> Every time the whole tree is rebuilt

> Therefore, the depth d(x) of a node x is at most


Contents:
- Abstract: amortized O(log n) INSERT/DELETE, worst-case O(log n) SEARCH, no per-node extra data, only size and max-size at the root, scapegoat idea
- 1 Introduction: comparison with red-black, AVL, weight-balanced (Nievergelt-Reingold, Varghese) and splay trees
- 2 Notations: node fields key/left/right, size(x) computed not stored, tree attributes size[T] and max-size[T]
- 3 Preliminary discussion: alpha-weight-balanced, alpha-height-balanced (h <= h_alpha(n)), loose alpha-height-balance (+1), deep nodes
- 4 Operations: search, insert with scapegoat search (size formula 4.5, rebuild to 1/2-weight-balanced), delete with max-size test (4.7) and full rebuild, alternative scapegoat criterion (4.6)
- 5 Correctness and complexity: Lemmas 5.1-5.10, search bound, potential-function amortized insert (Theorem 5.2), delete (Theorem 5.3)
- 6 Rebuilding in place: FLATTEN / BUILD-TREE / REBUILD-TREE in O(n) time and O(log n) space, non-recursive variant
- 7 More applications: general scheme (Theorem 7.1), scapegoat k-d trees, orthogonal range trees, quad trees
- 8 Experimental results: versus red-black and splay trees, effect of alpha, rebuild variants
- 9 Discussion and conclusions: open problem of average-case analysis
- References

## The Tail at Scale (Jeffrey Dean and Luiz André Barroso, Communications of the ACM 56(2), February 2013)
URL: https://www.barroso.org/publications/TheTailAtScale.pdf
Version: CACM vol. 56, no. 2, February 2013, pp. 74-80, doi:10.1145/2408776.2408794 (author PDF)

> Systems that respond to user actions quickly (within 100ms) feel more fluid and natural to users than those that take longer.

> It is challenging for service providers to keep the tail of latency distribution short for interactive services as the size and complexity of the system scales up

> Temporary high-latency episodes (unimportant in moderate-size systems) may come to dominate overall service performance at large scale.

> tail-tolerant software techniques form a predictable whole out of less-predictable parts.

> the scale and complexity of modern Web services make it infeasible to eliminate all latency variability.

> Background daemons may use only limited resources on average but when scheduled can generate multi-millisecond hiccups

> and periodic garbage collection in garbage-collected languages) can cause periodic spikes in latency

> Multiple layers of queueing in intermediate servers and network switches amplify this variability.

> the need to periodically garbage collect a large number of data blocks can increase read latency by a factor of 100 with even a modest level of write activity

> Parallelization happens by fanning out a request from a root to a large number of leaf servers and merging responses via a request-distribution tree.

> Variability in the latency distribution of individual components is magnified at the service level

> consider a system where each server typically responds in 10ms but with a 99th-percentile latency of one second.

> If a user request is handled on just one such server, one user request in 100 will be slow (one second).

> If a user request must collect responses from 100 such servers in parallel, then 63% of user requests will take more than one second

> a service with 2,000 such servers will see almost one in five user requests taking more than one second

> The 99th-percentile latency for a single random request to finish, measured at the root, is 10ms. However, the 99th-percentile latency for all requests to finish is 140ms

> A combination of throttling, breaking down heavyweight operations into smaller operations, and triggering such operations at times of lower overall load is often able to reduce the effect of background activities on interactive request latency.

> without synchronization, a few machines are always doing some background activity, pushing out the latency tail on all requests.

> It is sometimes useful for the system to break long-running requests into a sequence of smaller requests to allow interleaving of the execution of other short-running requests

> sending a hedging request after a 10ms delay reduces the 99.9th-percentile latency for retrieving all 1,000 values from 1,800ms to 74ms while sending just 2% more requests.

> Google has therefore found it advantageous to develop tail-tolerant techniques that mask or work around temporary latency pathologies, instead of trying to eliminate them altogether.

> simply stamping out all sources of performance variability will not achieve such responsiveness.

Added by the fact-check (TS23–TS26): the per-server rate of the 2,000-server case, the scenario's status (hypothetical), log compaction, and time-slicing.

> Even for services with only one in 10,000 requests experiencing more than onesecond latencies at the single-server level

> outlines how service-level latency in this hypothetical scenario is affected by very

> data reconstruction in distributed file systems, periodic log compactions in storage systems like

> Google’s Web search system uses such time-slicing to prevent a small number of very computationally expensive queries from adding substantial latency to a large number of concurrent cheaper queries.


Contents:
- Introduction: sub-100ms responsiveness feels fluid; the tail of the latency distribution is hard to keep short as systems scale; "tail-tolerant" systems by analogy with fault tolerance; key insights box.
- Why Variability Exists: shared resources, daemons, global resource sharing, maintenance activities (compaction, GC, reconstruction), queueing; hardware trends (power limits, SSD garbage collection, energy management).
- Component-Level Variability Amplified By Scale: fan-out from root to leaves; 1-in-100 slow servers x 100 servers gives 63% slow requests; 1-in-10,000 x 2,000 servers gives about 18%; Figure (probability of >1s response vs. number of servers); Table 1 (leaf finishing times: 99th percentile 10ms for one leaf vs. 140ms for all leaves).
- Reducing Component Variability: service classes and higher-level queueing; reducing head-of-line blocking by time-slicing; managing background activities and synchronized disruption (throttling, splitting heavy work into smaller operations, running at low load); note that caching does not directly address tail latency.
- Living with Latency Variability: within-request short-term adaptations (hedged requests, with the 1,000-key BigTable benchmark 1,800ms to 74ms at 2% extra load; tied requests, with Table 2 of read latencies at 50/90/99/99.9 percentile) and cross-request long-term adaptations (micro-partitions, selective replication, latency-induced probation).
- Large Information Retrieval Systems: "good enough" results; canary requests.
- Mutations: why tolerating variability for state-changing operations is easier (small scale, off the critical path, relaxed consistency, quorum algorithms).
- Hardware Trends and Their Effects: variability likely to grow; RDMA and faster networks reduce cost of tied requests.
- Conclusion: tail-tolerant techniques let designers optimize the common case while resilient to uncommon cases; higher utilization without losing responsiveness.
- Acknowledgments and References (12 items).

## Optimal resizable arrays (Tarjan and Zwick)
URL: https://arxiv.org/pdf/2211.11009
Version: arXiv:2211.11009v2 [cs.DS], 29 May 2023

> A standard doubling technique allows the maintenance of an array of size N using only O(N )

> Decreasing the size of an array is easy. We simply do not use some of the memory

> If the array is full, allocate a new array of, say, twice the size and copy all the items into

> it. When the array is, say, less than a quarter full, allocate a new array of, say, half the size and

> Furthermore, the time for an increase or decrease operation can be made O(1) worst-case by

> a standard background-rebuilding technique.

> 50% of the memory allocated for an array is not used, even if only grow operations are considered.

> The most space-efficient basic data structure keeps a fixed-size array whose size is exactly equal to

> structure temporarily needs 2N + O(1) space, since two arrays need to stored together. Such a data

> The data structure uses only N + 3B + 2 = N + O( N ) words of memory. (The 3B term accounts

> When the data structure is full, i.e., N = B 2 , the data structure is rebuilt with B doubled. If B

> The amortized cost of grow and shrink operations is still O(1), since at least

> Ω(N ) operations must occur between two rebuild operations.

> storage. The new and old data blocks are allocated and deallocated one by one.

> It is possible to deamortize the HAT data structure by keeping data blocks of two possible sizes

> and doing a background rebuilding, but the resulting data structure becomes more complicated. A

> Appealing features of the data structure are that no rebuild operations are necessary and data

> To obtain an O(1) worst-case time bound, this copying should be done ‘in the background’. A shrink operation is

> rebuilding cannot be used, the O(r) amortized time for resizing, which we show is optimal, cannot

Added by the fact-check (TZ20–TZ25): the allocation assumption, the abstract's result with its temporary-space condition, and the worst-case sentence. The paper states "cannot be made worst-case, unless r = 2" with the reason "Since background rebuilding cannot be used"; it proves the Ω(r) amortized lower bound, not a worst-case impossibility theorem.

> We assume, for simplicity, that each such call takes only constant time. All our amortized bounds hold, however, if allocating or deallocating a fixed-length array of size N requires O(N ) time.

> (assuming that memory allocation takes O(1) worst-case time).

> items are never moved.

> we show that N + O(N 1/r ) space is sufficient for storing and accessing an array of size N

> if N + O(N 1−1/r ) space can be used briefly during grow and shrink operations.

> The time for grow and shrink operations cannot be made worst-case, unless r = 2.


Contents:
- Abstract and introduction: resizable arrays, doubling gives O(1) amortized or worst-case per operation, N + O(sqrt N) space by Sitarski and Brodnik et al., new N + O(N^(1/r)) results.
- Section 2: the resizable array ADT (Get, Set, Grow, Shrink) and the block-based memory model.
- Section 3: previous work: basic (single-array) structures and geometric growth, Sitarski hashed array tree with rebuild and background deamortization, Brodnik et al. worst-case structure with incremental index-block copying.
- Sections 4-10: lower bound, r = 3 solution, general r, growth game and amortized lower bound (not quoted).

## Purely Functional Data Structures, PhD thesis (Chris Okasaki), Chapter 5 "Lazy Rebuilding"
URL: https://www.cs.cmu.edu/~rwh/students/okasaki.pdf
Version: CMU-CS-96-177, September 1996 (thesis PDF); sections 5.1 Batched Rebuilding, 5.2 Global Rebuilding, 5.3 Lazy Rebuilding, 5.5 Related Work
Added by the fact-check (OK1–OK13). Opened source for Overmars's attribution (his 1983 book itself was not opened) and for the buffered-updates pattern. Okasaki's terms: rebuilding all at once after many updates is "batched rebuilding"; Overmars's "global rebuilding" is the incremental, worst-case version. dsbook and Erickson use "global rebuilding" for the all-at-once version.

> We call this approach batched rebuilding.

> Then, whenever half the nodes in the tree have been deleted, make a global pass removing the deleted nodes and restoring the tree to perfect balance.

> Overmars [Ove83] developed a technique for eliminating the amortization from batched rebuilding. He called this technique global rebuilding.

> The basic idea is to execute the rebuilding transformation incrementally, performing a few steps per normal operation.

> The tricky part of global rebuilding is that the coroutine must be started early enough that it can finish by the time the rebuilt structure is needed.

> Concretely, global rebuilding is accomplished by maintaining two copies of each object.

> All queries and updates operate on the working copy. When the secondary copy is completed, it becomes the new working copy and the old working copy is discarded.

> Thus, these updates to the secondary copy are buffered and executed, a few at a time, after the secondary copy has been rebuilt, but before it takes over as the working copy.

> Unfortunately, global rebuilding is often quite complicated.

> Global rebuilding has two advantages over batched rebuilding: it is suitable for implementing persistent data structures and it yields worst-case bounds rather than amortized bounds.

> However, if desired, worst-case bounds can often be recovered using the scheduling techniques of Chapter 4.

> Overmars introduced global rebuilding in [Ove83].

> Mark H. Overmars. The Design of Dynamic Data Structures, volume 156 of LNCS.

Contents (chapter 5 only):
- 5.1 Batched rebuilding: rebuild the whole structure after a sequence of updates; conditions (1) not too often, (2) weak updates; the mark-deleted BST example; batched queues.
- 5.2 Global rebuilding (Overmars): run the rebuild incrementally, a few steps per operation, started early enough; two copies (working, secondary); updates buffered and replayed before the swap; worst-case bounds; often complicated.
- 5.3 Lazy rebuilding: pay for the rebuild concurrently, execute it lazily; amortized, worst-case again with scheduling.
- 5.4 Double-ended queues; 5.5 Related work (global rebuilding's uses: real-time queues and deques, catenable deques, order maintenance).

## Algorithms, Lecture 10: Scapegoat and Splay Trees (Jeff Erickson)
URL: https://jeffe.cs.illinois.edu/teaching/algorithms/notes/10-scapegoat-splay.pdf
Version: Lecture 10 [Fa'13], copyright 2018 Jeff Erickson, CC BY-NC-SA 4.0
Added by the fact-check (L1–L9). Opened source for the history (Overmars's lazy balanced trees; Andersson 1989 before Galperin and Rivest 1993) and for "global rebuilding" in the all-at-once sense inside a BST. Erickson's partial-rebuilding rule uses a different parameter (height(v) > α · lg size(v) with α > 1) and is "closer to Andersson's"; it is not Galperin and Rivest's rule.

> lazy weight-balanced trees, developed by Mark Overmars* in the early 1980s, [14] and scapegoat trees, discovered by Arne Andersson* in 1989 [1, 2] and independently2 by Igal Galperin* and Ron Rivest in 1993 [11].

> The claim of independence is Andersson’s [2]. The two papers actually describe very slightly different rebalancing algorithms.

> Global Rebuilding Rule. As soon as half the nodes in the tree have been marked, rebuild a new perfectly balanced tree containing only the unmarked nodes.

> We spend O(n) time rebuilding, but only after Ω(n) deletions, so the amortized cost of rebuilding the tree is O(1) per deletion.

> We use partial rebuilding to re-balance the tree after insertions, and global rebuilding to re-balance the tree after deletions.

> Thus, unlike almost every other kind of balanced trees, scapegoat trees require only O(1) extra space.

> [1] Arne Andersson*. Improving partial rebuilding by using simple balance criteria.

> [2] Arne Andersson. General balanced trees. J. Algorithms 30:1–28, 1999.

> [14] Mark H. Overmars*. The Design of Dynamic Data Structures. Lecture Notes Comput. Sci. 156.

Contents:
- 10.1 Binary search trees: balanced-tree families and their worst-case, amortized and expected bounds; lazy balanced trees (Overmars), scapegoat trees (Andersson; Galperin and Rivest), splay trees.
- 10.2 Lazy deletions, global rebuilding: mark deleted nodes, rebuild when half are marked; O(1) amortized rebuilding per deletion.
- 10.3 Insertions, partial rebuilding: rebuild a subtree when height(v) > α lg size(v); imbalance |size(left) − size(right)|; O(log n) amortized.
- 10.4 Scapegoat (lazy height-balanced) trees: both techniques; only O(1) extra integers.
- 10.5–10.8 Rotations and splay trees (not used here); references; exercises.

## Scapegoat tree (Wikipedia)
URL: https://en.wikipedia.org/wiki/Scapegoat_tree
Version: revision oldid 1378893949 (fetched 2026-10-12)
Added by the fact-check (W1–W5) as a lead and a clean-text check only; every claim it supports is verified against Galperin and Rivest's page images. Note: W3 writes the delete trigger with ≤; the paper's (4.7) is strict (<), and the topic follows the paper.

> height(tree) ≤ floor(log1/α(size(tree)))

> height(scapegoat tree) ≤ floor(log1/α(size(tree))) + 1.

> NodeCount ≤ α*MaxNodeCount

> A high α value results in fewer balances, making insertion quicker but lookups and deletions slower, and vice versa for a low α.

> invented by Arne Andersson in 1989[2] and rediscovered by Igal Galperin and Ronald L. Rivest in 1993.[1]

## The Java Language Specification, Java SE 26 Edition, Chapter 15 "Expressions"
URL: https://docs.oracle.com/javase/specs/jls/se26/html/jls-15.html
Version: Java SE 26 Edition, §15.10.2 Run-Time Evaluation of Array Creation Expressions
Added by the fact-check (J1): one language that requires every slot of a new array to be initialized. It states the semantics, not a cost; no claim about what any runtime or allocator does.

> one-dimensional array is created of the specified length, and each component of the array is initialized to its default value
