## Wikipedia — "Parametric search"

URL: https://en.wikipedia.org/wiki/Parametric_search
Version: fetched 2026-11-05, the page as currently published

> In the design and analysis of algorithms for combinatorial optimization, parametric search is a technique invented by Nimrod Megiddo in 1983 [1] for transforming a decision algorithm (does this optimization problem have a solution with quality better than some given threshold?) into an optimization algorithm (find the best solution). It is frequently used for solving optimization problems in computational geometry.

> Megiddo remarks that, for this specific problem, there exists a simple linear time algorithm that does not involve parametric search: just determine the time at which each particle crosses the origin and return the median of these times. However, he explains that parametric search often matches the best known running time or gives the fastest known algorithm for more advanced problems.[1]

> As Megiddo already observed, the parametric search technique can be substantially sped up by replacing the simulated test algorithm by an efficient parallel algorithm, for instance in the parallel random-access machine (PRAM) model of parallel computation, where a collection of processors operate in synchrony on a shared memory, all performing the same sequence of operations on different memory addresses.

### Contents (item by item, this topic's scope)

- Parametric search's own definition: a technique (Megiddo, 1983, cited as reference [1] in the article, the *Journal of the ACM* paper this topic names in `CHAPTER.md`) for turning a decision procedure ("does a solution at least this good exist?") into an optimisation procedure (find the best value), used here as the general pattern this topic's own worked examples are instances of. Used by the topic's closing frame naming the pattern.
- Megiddo's own caveat, read directly rather than assumed: parametric search is not always the fastest way to solve a given problem (his own named example has a simpler linear-time solution), but it "often matches the best known running time or gives the fastest known algorithm" for harder problems. Used so the topic does not overclaim parametric search as universally necessary.
- The advanced (parallel) refinement — simulating a parallel decision algorithm rather than a sequential one to cut the number of decision-algorithm calls — is named once as the direction Megiddo's own paper and Cole's 1987 refinement take the idea, not built in this topic (out of scope: the topic's own worked examples use a plain sequential decision procedure plus an outer binary search, the basic form).

### Red team note on this source

Wikipedia is used here only to locate and summarise Megiddo's own primary paper (*Journal of the ACM* 30(4), 852–865, 1983) and to state the technique's name and definition in neutral, checkable terms; no claim about the paper's internal proofs or exact running-time bounds is taken from this page — the topic states only what this quoted text itself says, and the paper's abstract/introduction (not opened directly this session; the ACM Digital Library's full text sits behind a paywall this session could not reach) is cited as the original source for the technique's name and year, consistent with the article's own citation [1].

## cp-algorithms.com — "Binary Search"

URL: https://cp-algorithms.com/num_methods/binary_search.html
Version: fetched 2026-11-05, the page as currently published

> Let $f : \{0,1,\dots, n-1\} \to \{0, 1\}$ be a boolean function defined on $0,1,\dots,n-1$ such that it is monotonously increasing, that is

> It is possible to use arbitrary monotonous predicate instead of $k < A_M$. It is particularly useful when the computation of $f(k)$ requires too much time to actually compute it for every possible value.

> Let $f : \mathbb R \to \mathbb R$ be a real-valued function that is continuous on a segment $[L, R]$.

### Contents (item by item, this topic's scope)

- The generalisation from an array-index predicate to an arbitrary monotone boolean predicate over a domain of candidates — exactly the reframing this topic's own "search the answer, not the array" step makes, independently confirming the idea is a recognised technique, not this topic's own invention. Used by the reframing step.
- The explicit statement that the technique is useful precisely when evaluating the predicate is itself expensive — a framing this topic's own iteration-count step echoes ("the formula never mentions what the predicate computes"). Used by the iteration-count step.
- The real-valued ("continuous search") case over $[L, R]$ for a continuous function, the same generalisation from integer to real-valued ranges this topic's own bisection step makes. Used by the real-valued bisection step.

