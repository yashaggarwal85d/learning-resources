# Sources — dsa.pseudo-polynomial-time-strong

## 1. Wikipedia, "Strong NP-completeness"

URL: https://en.wikipedia.org/wiki/Strong_NP-completeness
Local copy: `sources/wiki-strong-npc.txt`

> A problem is said to be strongly NP-complete (NP-complete in the strong sense), if it remains
> NP-complete even when all of its numerical parameters are bounded by a polynomial in the
> length of the input.

> For example, bin packing is strongly NP-complete while the 0-1 Knapsack problem is only weakly
> NP-complete. Thus the version of bin packing where the object and bin sizes are integers
> bounded by a polynomial remains NP-complete, while the corresponding version of the Knapsack
> problem can be solved in pseudo-polynomial time by dynamic programming.

> If a problem is weakly NP-hard, then it does not have a weakly polynomial time algorithm
> (polynomial in the number of integers and the number of bits in the largest integer), but it
> may have a pseudopolynomial time algorithm (polynomial in the number of integers and the
> magnitude of the largest integer). An example is the partition problem.

> If a problem is strongly NP-hard, then it does not even have a pseudo-polynomial time
> algorithm. It also does not have a fully-polynomial time approximation scheme. An example is
> the 3-partition problem.

## 2. Wikipedia, "Knapsack problem"

URL: https://en.wikipedia.org/wiki/Knapsack_problem
Local copy: `sources/wiki-knapsack.txt`

> The decision problem form of the knapsack problem (Can a value of at least V be achieved
> without exceeding the weight W?) is NP-complete, thus there is no known algorithm that is both
> correct and fast (polynomial-time) in all cases.

> There is a pseudo-polynomial time algorithm using dynamic programming.

> complexity does not contradict the fact that the knapsack problem is NP-complete, since

> is not polynomial in the length of the input to the problem.

> itself. However, since this runtime is pseudopolynomial, this makes the (decision version of
> the) knapsack problem a weakly NP-complete problem.

## 3. Wikipedia, "Bin packing problem"

URL: https://en.wikipedia.org/wiki/Bin_packing_problem
Local copy: `sources/wiki-binpacking.txt`

> The bin packing problem is strongly NP-complete. This can be proven by reducing the strongly
> NP-complete 3-partition problem to bin packing.

> On the other hand, bin packing is solvable in pseudo-polynomial time for any fixed number of
> bins K, and solvable in polynomial time for any fixed bin capacity B.

## 4. Wikipedia, "3-partition problem"

URL: https://en.wikipedia.org/wiki/3-partition_problem
Local copy: `sources/wiki-3partition.txt`

> The 3-partition problem is a strongly NP-complete problem in computer science. The problem is
> to decide whether a given multiset of integers can be partitioned into triplets that all have
> the same sum.

> The 3-partition problem remains NP-complete even when the integers in S are bounded above by a
> polynomial in n. In other words, the problem remains NP-complete even when representing the
> numbers in the input instance in unary. i.e., 3-partition is NP-complete in the strong sense or
> strongly NP-complete.

## 5. Wikipedia, "Pseudo-polynomial time"

URL: https://en.wikipedia.org/wiki/Pseudo-polynomial_time
Local copy: `sources/wiki-pseudopoly.txt`

(Named for cross-reference only: this page's definition is the one Chapter 1 topic 1 already
introduced and quoted; this topic uses the live concept id `pseudo-polynomial` and does not
re-quote or re-introduce it, per CHAPTER.md's instruction.)

**Named, not read:**

Garey and Johnson, "'Strong' NP-completeness results: motivation, examples, and implications"
(J. ACM 25(3), 1978) and *Computers and Intractability* (1979): cited by the Wikipedia pages
above as the source of the strong/weak NP-hardness distinction; the original papers are not
opened, and no claim beyond what the Wikipedia pages themselves state is attributed to them.
Backurs and Indyk, "Edit distance cannot be computed in strongly subquadratic time (unless SETH
is false)" (STOC 2015): title and venue as given in the chapter plan and the syllabus line,
named once in post-notes as what to read after this topic, not independently verified against
the paper itself and not used for any claim beyond its own title.

**Read directly, not fetched:**

Topic 107's own handoff (quoted word for word in this topic's `OUTLINE.md` bridge) and Chapter 1
topic 1's live `pseudo-polynomial` concept definition are read directly from the repository, not
fetched as a web source.
