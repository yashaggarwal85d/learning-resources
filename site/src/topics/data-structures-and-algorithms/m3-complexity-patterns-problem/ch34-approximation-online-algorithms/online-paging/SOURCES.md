# Sources

## Page replacement algorithm (Wikipedia)

URL: https://en.wikipedia.org/wiki/Page_replacement_algorithm
Version: fetched 2026-11-05

> In a computer operating system that uses paging for virtual memory management, page replacement algorithms decide which memory pages to page out, sometimes called swap out, or write to disk, when a page of memory needs to be allocated.

> Page replacement happens when a requested page is not in memory (page fault) and a free page cannot be used to satisfy the allocation, either because there are none, or because the number of free pages is lower than some threshold.

> The page replacing problem is a typical online problem from the competitive analysis perspective in the sense that the optimal deterministic algorithm is known.

> The theoretically optimal page replacement algorithm

> is an algorithm that works as follows: when a page needs to be swapped in, the operating system swaps out the page whose next use will occur farthest in the future.

> This algorithm cannot be implemented in a general purpose operating system because it is impossible to compute reliably how long it will be before a page is going to be used

> The first-in, first-out (FIFO) page replacement algorithm is a low-overhead algorithm that requires little bookkeeping on the part of the operating system.

> This algorithm experiences Bélády's anomaly.

> Marking algorithms is a general class of paging algorithms. For each page, we associate it with a bit called its mark. Initially, we set all pages as unmarked. During a stage (a period of operation or a sequence of requests) of page requests, we mark a page when it is first requested in this stage. A marking algorithm is such an algorithm that never pages out a marked page.

> LRU is a marking algorithm while FIFO is not a marking algorithm.

> LRU, FIFO and CLOCK are conservative algorithms.

## Bélády's anomaly (Wikipedia)

URL: https://en.wikipedia.org/wiki/Bélády's_anomaly
Version: fetched 2026-11-05

> Bélády's anomaly is the phenomenon in which increasing the number of page frames results in an increase in the number of page faults for certain memory access patterns.

> This phenomenon is commonly experienced when using the first-in first-out (FIFO) page replacement algorithm.

> in optimal and stack-based algorithms like Least Recently Used (LRU), as the page frames increase, the page fault decreases.

> László Bélády demonstrated this in 1969.

> An example of Bélády's anomaly. Using three page frames, nine page faults occur. Increasing to four page frames causes ten page faults to occur.

> Bélády, Nelson and Shedler constructed reference strings for which the FIFO page replacement algorithm produced nearly twice as many page faults in a larger memory than in a smaller one and they conjectured that 2 is a general bound.

> In 2010, Fornai and Iványi showed that the anomaly is in fact unbounded

## Cache replacement policies (Wikipedia)

URL: https://en.wikipedia.org/wiki/Cache_replacement_policies
Version: fetched 2026-11-05

> Discards least recently used items first.

> With this algorithm, the cache behaves like a FIFO queue; it evicts blocks in the order in which they were added, regardless of how often or how many times they were accessed before.

> The most efficient caching algorithm would be to discard information which would not be needed for the longest time; this is known as Bélády's optimal algorithm, optimal replacement policy, or the clairvoyant algorithm.

> Since it is generally impossible to predict how far in the future information will be needed, this is unfeasible in practice.

## Online algorithm (Wikipedia)

URL: https://en.wikipedia.org/wiki/Online_algorithm
Version: fetched 2026-11-05

> In computer science, an online algorithm

> is one that can process its input piece-by-piece in a serial fashion, i.e., in the order that the input is fed to the algorithm, without having the entire input available from the start.

> In contrast, an offline algorithm is given the whole problem data set from the beginning and is required to output an answer which solves the problem at hand.

> If the ratio between the performance of an online algorithm and an optimal offline algorithm is bounded, the online algorithm is called competitive.

## Competitive analysis (online algorithm) (Wikipedia)

URL: https://en.wikipedia.org/wiki/Competitive_analysis_(online_algorithm)
Version: fetched 2026-11-05

> Competitive analysis is a method invented for analyzing online algorithms, in which the performance of an online algorithm (which must satisfy an unpredictable sequence of requests, completing each request without being able to see the future) is compared to the performance of an optimal offline algorithm that can view the sequence of requests in advance.

> An algorithm is competitive if its competitive ratio—the ratio between its performance and the offline algorithm's performance—is bounded.

> In competitive analysis, one imagines an "adversary" which deliberately chooses difficult data, to maximize the ratio of the cost of the algorithm being studied and some optimal algorithm.

> The classic on-line problem first analysed with competitive analysis (Sleator & Tarjan 1985) is the list update problem

## Adversary model (Wikipedia)

URL: https://en.wikipedia.org/wiki/Adversary_model
Version: fetched 2026-11-05

> The oblivious adversary is sometimes referred to as the weak adversary. This adversary knows the algorithm's code, but does not get to know the randomized results of the algorithm.

> For deterministic algorithms, the adversary is the same as the adaptive offline adversary.

## K-server problem (Wikipedia)

URL: https://en.wikipedia.org/wiki/K-server_problem
Version: fetched 2026-11-05

> The special case of metrics in which all distances are equal is called the paging problem because it models the problem of page replacement algorithms in memory caches, and was also already known to have a k-competitive algorithm (Sleator and Tarjan 1985).

## Fiat, Karp, Luby, McGeoch, Sleator, Young — "Competitive Paging Algorithms" (Journal of Algorithms 12(4), 1991; arXiv cs/0205038)

URL: https://arxiv.org/pdf/cs/0205038
Version: arXiv cs/0205038v1 (posted 18 May 2002 by the authors; the journal version is Journal of Algorithms 12(4):685–699, 1991, DOI 10.1016/0196-6774(91)90041-V), fetched 2026-11-08

The PDF's text flattens the subscript: "2Hk" is 2H_k, "Hk" is H_k, the k-th harmonic number.

> We develop the marking algorithm, a randomized on-line algorithm for the paging problem. We prove that its expected cost on any sequence of requests is within a factor of 2Hk of optimum.

> (Where Hk is the kth harmonic number, which is roughly ln k.) The best such factor that can be achieved is Hk.

> This is in contrast to deterministic algorithms, which cannot be guaranteed to be within a factor smaller than k of optimum.

> If the requested vertex is not covered, then a server is chosen uniformly at random from among the unmarked vertices, and this server is moved to cover the requested vertex.

> We also show that no randomized paging algorithm can have a competitive factor less than Hk.

> Since A is randomized, the adversary constructing the sequence is not allowed to see where the servers are.

> The paging problem is isomorphic to the uniform k-server problem.

Contents: the randomized marking algorithm (on a fault, evict a page chosen uniformly at random among the unmarked ones; the paper states it in k-server terms, where a page in the cache is a vertex covered by a server); its bound, 2H_k-competitive, H_k being roughly ln k, so O(log k); the matching lower bound, no randomized paging algorithm below H_k; the adversary in the lower bound does not see the algorithm's random choices, which is the oblivious adversary the reel's prediction step describes; the contrast with the deterministic bound of k.
