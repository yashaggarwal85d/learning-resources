# Sources

## Lecture 12: Lower Bounds (Jeff Erickson, Algorithms lecture notes)
URL: http://jeffe.cs.illinois.edu/teaching/algorithms/notes/12-lowerbounds.pdf
Version: Lecture 12 [Fa'13], copyright 2018 Jeff Erickson, CC BY-NC-SA 4.0

> Most lower bounds for decision trees are based on the following simple observation: The answers
> to the queries must give you enough information to specify any possible output. If a problem
> has N different outputs, then obviously any decision tree must have at least N leaves. (It’s

> This matches the O(n log n) upper bound that we get from mergesort, heapsort, or quicksort,

> and so forth—but not radix sort or bucket sort.

> We can solve the membership problem in O(1) expected time using hashing. Isn’t this inconsistent

> No, it isn’t. The reason is that hashing involves a query with more than a constant number of

> This example illustrates a common theme in proving lower bounds: choosing the right model

> The adversary argument we described has two very important properties. First, no algorithm

Added by the content plan (2026-10-12):

> those algorithms are optimal. The decision-tree complexity of sorting is Θ(n log n).

> values don’t matter, only their order. Comparison trees describe almost all well-known sorting

> only dlog2 ne. And in fact, this bound is tight! We can locate the maximum element by asking

> In fact, the n − 1 lower bound for finding the maximum holds in a more powerful model called algebraic decision

Contents:
- 12.1 What a lower bound is: worst-case complexity of a problem as min over algorithms of max over inputs; upper vs lower bounds.
- 12.2 Decision trees: queries at internal nodes, outputs at leaves, running time is depth; k-ary trees; dictionary problem example.
- 12.3 Information theory: N outputs need N leaves, depth at least log_k N; Omega(log n) for the dictionary problem.
- 12.4 Why hashing does not contradict it: queries with non-constant number of outcomes; choosing the right model is crucial.
- 12.5 Sorting: n! leaves, Stirling, Omega(n log n); comparison trees cover most sorts but not radix or bucket sort.
- 12.6 Maximum: n-1 comparisons via an adversary argument; information-theoretic bound is only ceil(log2 n); algebraic decision trees footnote.
- Exercises: k-sorting, nuts and bolts lower bounds, pinning intervals.

## Lecture 13: Adversary Arguments (Jeff Erickson, Algorithms lecture notes)
URL: http://jeffe.cs.illinois.edu/teaching/algorithms/notes/13-adversary.pdf
Version: Lecture 13 [Fa'13], copyright 2018 Jeff Erickson, CC BY-NC-SA 4.0

> The simplest proof technique is called an adversary argument. The idea is that an all-powerful

> One absolutely crucial feature of this argument is that the adversary makes absolutely no
> assumptions about the algorithm. The adversary strategy can’t depend on some predetermined
> order of examining bits, and it doesn’t care about anything the algorithm might or might not do

> Last time, we saw an adversary argument that finding the largest element of an unsorted set of n

> We can improve both the upper and the lower bound to d3n/2e − 2. The upper bound is

> For the lower bound, we use an adversary argument. The adversary marks each element

> Initially, there are 2n marks. At the end, in order to be correct, exactly one item must

> At most bn/2c comparisons remove two marks; every other comparison

> 2n − 2 − bn/2c = d3n/2e − 2 comparisons.

Added by the content plan (2026-10-12), for the "adjacent in sorted order" move that the element-distinctness adversary reuses:

> How many comparisons do we need to solve this problem? An upper bound of 2n − 3 is easy:

> there must be an input that is consistent with the comparisons we’ve performed, in which x i and
> x m are adjacent in sorted order. But then we can swap x i and x m , without changing the result of

Contents:
- 13.1 Three-Card Monte: the dealer cheats, motivating the adversary idea.
- 13.2 n-Card Monte: any algorithm that skips a bit loses to an adversary answering all zeros.
- 13.3 Finding patterns in bit strings: pattern 01 is evasive iff n is even (Hide01 strategy).
- 13.4 Evasive graph properties: emptiness via adjacency-matrix queries.
- 13.5 Connectedness is evasive (graphs Y and M).
- 13.6 Aanderraa-Karp-Rosenberg conjecture on monotone properties.
- 13.7 Min and max together: ceil(3n/2) - 2 upper bound by pairing and lower bound by the +/- marks adversary.
- 13.8 Median: information theory plus two adversary arguments (lemma that a median tree identifies smaller and larger elements).

## Lecture #10: Sorting and Decision Trees (David Mix Barrington, CMPSCI 575/MATH 513)
URL: https://people.cs.umass.edu/~barrington/cs575f16/lecture/10.pdf
Version: 28 September 2016 (Tucker Section 3.4)

> Any sorting algorithm yields a decision tree.

> In general, you need ceiling(log(n+1)) guesses
> for n items. By creating an adversary that can

> An adversary argument gives an Ω(n) bound.

> We first pair up the items and make n/2

> We then find the max of the winners and the
> min of the losers (n/2 - 1 each) for a total of

> This is actually optimal, as we can show with

Contents:
- Review of sorting algorithms: insertion/selection n(n-1)/2, mergesort, heapsort at O(n log n).
- Decision trees for sorting: any comparison algorithm gives a tree, a non-uniform lower bound, n! leaves.
- The sorting lower bound: height at least log(n!) = Theta(n log n), Stirling.
- Adversary arguments: the guessing game, ceil(log(n+1)) guesses, sorting bound restated as an adversary that keeps the larger half of consistent orderings.
- Lower bound for max or min (n-1 via undefeated items).
- Lower bound for max and min together: 3n/2 - 2 by pairing, adversary with categories A, B, C, D.
- The median problem: Omega(log n) from decision trees, Omega(n) by adversary, O(n) algorithms.

## Lecture 5: Comparison-based Lower Bounds for Sorting (Northeastern University, Algorithms course notes)
URL: https://khoury.northeastern.edu/home/vip/teach/Algorithms/4_sortingB/lecture_notes/lect0913.pdf
Version: undated lecture notes (file lect0913.pdf), Lecture 5, chapter 5

> Often, we will prove lower bounds in restricted models of computation, that specify what types of

> Theorem 5.1 Any deterministic comparison-based sorting algorithm must perform Ω(n log n) comparisons to sort n elements in the worst case.

> Notice that our proof is like a game of 20 Questions in which the responder (the adversary) doesn’t

> Theorem 5.2 For any deterministic comparison-based sorting algorithm A, the average-case number of comparisons

> Theorem 5.3 The above bound holds for randomized algorithms too.

> Answer: No, the proof does not still hold. It breaks down because any given input can have multiple correct answers.

> To prove the theorem, we just need to show that out of all binary trees on a given number

Added by the content plan (2026-10-12):

> Let’s do an example with n = 3, and S as initially consisting of the 6 possible orderings of {1, 2, 3}:

Contents:
- 5.1 Overview: worst case, average case, randomized, 2-player game view.
- 5.2 Sorting lower bounds: definition of comparison-based sorting, Theorem 5.1 (log2(n!) comparisons), adversary keeping the larger set of consistent inputs, n = 3 example, counting argument (2^k < n! outputs), question on partitioning around the median.
- 5.3 Average-case lower bounds: Theorem 5.2, average leaf depth minimised by a balanced tree.
- 5.4 Randomized algorithms: Theorem 5.3, randomized algorithm as a distribution over deterministic ones, row/column matrix and game view.

## Lower Bounds For Algebraic Computation Trees (Preliminary Report) (Michael Ben-Or, STOC 1983)
URL: https://ibr.cs.tu-bs.de/courses/ws2223/ag/papers/Ch3/BenOr.pdf
Version: Proc. ACM STOC 1983, pp. 80-86 (text extracted from a scan; OCR errors such as "complezity" and "fl(n log n)" for Omega(n log n) are in the source text)

> Lower Bounds For Algebraic Computation Trees

> Example 1. Element Distinctness. Given x l , . . . , x n E R,

> help of any efficient sorting algorithm using O(n log n) comparisons, or by computing the product

> Theorem 1. Any algebraic computation tree that solves

> the n-element distinctness problem must have complezity of

> This result extends the lower bounds of Dobkin and

> Lipton [5] for the linear decision tree model, and the lower

> Formally, an algebraic computation tree is a binary tree

Added by the content plan (2026-10-12): the n! components (one per sorted order), the average-case version, and the citation of Dobkin and Lipton exactly as Ben-Or gives it (reference [5]; their paper itself was not fetched, so the topic cites it only through Ben-Or).

> is a maximal connected component of W for each permutation a. Thus by theorems 4, 5 and 8 we have that C(W),

> Theorem 11. Let x l , . . . , xn be independent random variables uniformly distributed in the interval [0, 1], then the expected complexity for solving the element distinctness problem for the xi by any algebraic computation tree is at least

> computations under varying sets of primitives. JCSS
> 18, (1979) 86-91.

Contents:
- Abstract and 1. Introduction: topological method for algebraic computation trees; element distinctness as Example 1; Theorem 1 (Omega(n log n)).
- 2. The algebraic computation tree model: membership problem for W, arithmetic operations and tests, complexity as maximum path length.
- 3. Counting connected components: Theorem 2 (Milnor-Thom bound on components of V).
- 4. Main theorem: Theorem 3 (2^h 3^(n+h) >= N) and Theorem 4 (C(W) >= log N / (1 + log 3)); extensions to k-th roots.
- 5. Bounded degree algebraic decision trees; 6. applications including element distinctness; 7. ruler and compass constructions.

## Discussion 2: Proving Lower Bounds (Nina Amenta, ECS 222A, UC Davis)
URL: https://www.cs.ucdavis.edu/~amenta/w04/dis2
Version: ECS 222A, Winter 2005, Discussion 2 (Thursday, January 20). Added by the content plan (2026-10-12) as the opened source for the merging bound 2n − 1 and for the "make two neighbours equal" adversary on duplicates.

> the second considers merging two sorted lists of size n (lower bound of 2n − 1)

> Give a (2n − 1) lower bound on the number of comparisons to merge two sorted lists A1 < A2 < . . . < An

> Solution: It is useful to notice that with (2n − 1) comparisons, every element in the final merged list
> of 2n elements has been compared to its next element (except the last element).

> 2. Let X be a list such that xi = 2i − 1 for i = 1 to n. Let Y be a list such that yi = 2i for i = 1 to n.

> 4. Find that element xi = 2i and set xi+1 = 2i. Remember that previously, xi+1 = 2(i + 1).

> Thus, there cannot exist any correct comparison-based algorithm that finds duplicates in a sorted list in less
> than (n − 1) comparisons.

Note: step 3 of the merging solution names the neighbours of xi as yi and yi+1; in the interleaved order 1 < 2 < … < 2n they are yi−1 and yi. The argument (every pair adjacent in the merged order, which always comes from different lists, must be compared directly) is unaffected; the topic states it in that form.

Contents:
- Example 1: duplicates in a sorted list need n − 1 comparisons (adversary sets one unchecked neighbour equal).
- Example 2: merging two sorted lists of n needs 2n − 1 comparisons (adversary swaps an uncompared adjacent pair from the interleaved input 1, 3, 5, … and 2, 4, 6, …).
- Example 3: searching a sorted array needs log(n + 1) comparisons with three-way compares (decision tree).
- Example 4: a 7-outcome query gives log(n + 1)/2 (k-ary decision tree).

## Algorithms Qual Exam, Fall 2016, with answers (New Mexico State University, Computer Science)
URL: https://www.cs.nmsu.edu/~gradrep/qualifying_exam/fall_2016/Fall2016QualsAlgorithmSol.pdf
Version: Fall 2016 qualifying exam, Question 1 with its model answer. Added by the content plan (2026-10-12) as the opened source for the counting bound for merging: C(2n, n) leaves.

> lower bound for the worst case number of comparisons for merging of two sorted

> sequences. (Note: You are not required to draw the decision tree. Hint: there are
> 20 leaves.)

> (c) The number of leaves is

> = log2 √π1 n 22n = 2n − 0.5 log2 n − 0.5 log2 π.

Note: the PDF's text layer garbles the binomial; the answer's displayed formula is "the number of leaves is (2n choose n)" and the depth bound is log₂ C(2n, n) ≈ 2n − ½ log₂ n − ½ log₂ π (Stirling). `examples.py` recomputes C(6, 3) = 20 and the bound.

Contents:
- Question 1(a): decision tree of the textbook merge for 2 + 2 elements.
- 1(b): the 20 leaves for merging 3 + 3 elements, listed.
- 1(c): any comparison merge of n + n elements has C(2n, n) leaves, so depth at least log₂ C(2n, n) ≈ 2n − 0.5 log₂ n − 0.5 log₂ π.
- Question 2: repeated squaring (not used).

## CS 466/666: The Complexity of Comparison Based Problems (University of Waterloo course notes)
URL: https://student.cs.uwaterloo.ca/~cs466/Old_courses/S14/Notes2013/Comparisons.pdf
Version: CS 466/666 notes, "Lectures: July 11 - 25" (2013 notes, Spring 2014 course archive). Added by the content plan (2026-10-12): the four-state adversary table for min and max, and lg(n!) ≈ n lg n − 1.44n.

> method, but also averaging over all possible input sequences. Using Stirlings

> n lg e + (1 + lg n+ lg π )/2, or about n lg n – 1.44.. n comparisons. The gap between the

> (in the worst case) dates back to 1959. It is the method generally referred to as FordJohnson Merge insertion

> Theorem: n-1 comparisons are necessary and sufficient to find the maximum of n values.

> We have to disqualify n-1 elements from being the maximum, and n-1 from being the
> minimum. The first “win” an element has disqualifies it from being the minimum and the
> first loss disqualifies it from being the maximum. This is a total of 2n – 2
> disqualifications.

> VV comparisons (as an element loses its V status in
> its first comparison).

> comparisons are necessary and sufficient to find the maximum and
> minimum in a set of n elements.

Note: in the PDF the bounds around these lines are ⌊n/2⌋ VV comparisons and ⌈3n/2⌉ − 2 comparisons, typeset with private-use floor and ceiling glyphs that the text layer keeps as unprintable characters, so the quotes stop short of them. The notes' Stirling line prints "+ n lg e" where the sign is minus (the next clause, "about n lg n – 1.44.. n", has it right). The table of adversary answers (V untested, W only won, L only lost, O both) is in the text but its layout does not survive extraction well enough to quote line by line; the topic uses the categories and the rule that only a V–V comparison removes two units.

Contents:
- Sorting: lg(n!) lower bound in the worst case and on average; Stirling; Ford–Johnson merge insertion (1959) as the fewest-comparison method.
- Maximum: n − 1 by disqualification.
- Max and min: pairing, 3n/2 − 2; adversary with states V, W, L, O and the answer table; 2n − 2 disqualifications.
- Selection: quickselect expected cost, Floyd–Rivest, BFPRT with groups of 15; a 1¾n lower bound for the median by an adversary.

## Lecture 6: Concrete models and tight upper/lower bounds (Avrim Blum, CMU 15-451, Fall 2011)
URL: https://www.cs.cmu.edu/~avrim/451f11/lectures/lect0915.pdf
Version: 15-451 Fall 2011 lecture notes, Lecture 6 (file lect0915.pdf). Added by the content plan (2026-10-12): the general lg M bound, tight bounds on lg(n!), merging's n − 1 upper bound, second-largest, evasiveness of connectivity (blind expert list items).

> produce; e.g., for sorting, M = n!. Then, we have a worst-case lower bound of lg M . The reason is

> n lg n − 1.443n < lg(n!) < n lg n.

> Mergesort Merging two lists of n/2 elements each requires at most n − 1 comparisons. So,

> Claim 6.7 (Upper bound #2) n + lg n − 2 comparisons are sufficient to find the second-largest
> of n elements.

> First shown by Kislitsyn (1964).

> Theorem 6.9 (Lower bound) n(n − 1)/2 queries are necessary to determine connectivity in the
> worst case.

Contents:
- 6.2 Upper and lower bounds in a concrete model (what costs 1, what is free).
- 6.3 Sorting in the exchange model: n − 1 swaps necessary and sufficient (cycle argument).
- 6.4 Comparison model: lg M for M outputs; lg(n!) between n lg n − 1.443n and n lg n; binary insertion sort and mergesort within n lg n; maximum n − 1 (component argument); second-largest n − 1 lower, 2n − 3 and n + lg n − 2 upper, tight (Kislitsyn 1964).
- 6.5 Query model: connectivity is evasive, n(n − 1)/2 probes (adversary answers 0 unless that disconnects).
