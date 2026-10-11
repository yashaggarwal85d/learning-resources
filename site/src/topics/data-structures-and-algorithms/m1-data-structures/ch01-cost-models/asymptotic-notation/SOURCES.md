# Sources: Asymptotic notation and case analysis

Checked 2026-10-11 (fact-check pass added quotes for Rutanen's bibliography, the shadow-vertex method, CPython's comparison costs, Roughgarden's two criticisms and the Wikipedia pseudo-polynomial article). Every source below was fetched raw with scripts/sources.mjs and every quote is proven word for word by `sources.mjs check`. Textbooks (CLRS 4th ed. ch. 2, 3, 7; Mitzenmacher and Upfal, Probability and Computing; Garey and Johnson) could not be opened online and are cited only for framing next to the opened sources, never for a quoted claim.

## Donald E. Knuth, "Big Omicron and Big Omega and Big Theta" (SIGACT News, 1976)
URL: https://danluu.com/knuth-big-o.pdf
Version: SIGACT News, Apr.-June 1976, pp. 18-24 (scan hosted at danluu.com)

> Most of us have gotten accustomed to the idea of using the notation
> O(f(n))
> to stand for any function whose magnitude is upper-bounded by a
> constant times
> f(n) , for all large
> n .

> Sometimes we also need a
> corresponding notation for lower-bounded functions,

> for example when they reject a particular sorting method
> "because its running time is
> O(n 2)

> The classical literature does have a notation for functions that are
> bounded below, namely

> denotes the set of all
> constants

> The definitions above refer to "the set of all

> can be read as "order at most

> "order at least

> as "order exactly

> a stronger requirement
> (replacing "infinitely
> n") is much more appropriate.

> their definition was a negation of

> for infinitely many
> n , when
> C
> is a

> we are actually speaking about sets of functions rather
> than single functions.

> The equal sign here really means

> My feeling is that we should continue
> to use one-way equality together with

Contents:
- Complaint that O-notation is misused for lower bounds (e.g. rejecting a sorting method "because its running time is O(n^2)"), and the need for a lower-bound notation.
- History: Omega in Titchmarsh and Prachar; searching for O and o in Bachmann (1894) and Landau; Hardy and Littlewood's 1914 introduction of Omega.
- Hardy-Littlewood's Omega (negation of o, "infinitely many n") versus Knuth's stronger "all large n" version.
- Knuth's proposed definitions of O, Omega, Theta as sets of functions with positive constants C, C', n0 and "for all n >= n0".
- Verbal readings: order at most / at least / exactly f(n); applies to n -> infinity, with a neighbourhood of zero substitute.
- Credit for Theta to Tarjan and Paterson; set-based definition from Rivest.
- Formulas as sets (A+B, 1 + O(n^-1)), one-way equality as set inclusion, and Knuth's defence of keeping it.
- little-omega, asymmetry of absolute values, Hardy-Littlewood Omega_L/Omega_R, and notations for oscillating functions.
- Competing relational notations (du Bois-Reymond, Hardy, Vinogradov) and why O inside formulas is handier.
- Proposal that SIGACT members and editors adopt O, Omega, Theta; reference list; unrelated letter from Dana Angluin on the Four Russians' algorithm.

## Randomized Algorithms II, Chapter 9 (Har-Peled, UIUC CS 473)
URL: https://courses.grainger.illinois.edu/cs473/fa2023/lec/notes/09_rand_II.pdf
Version: Version 0.2, September 26, 2023
> Thus, to show that QuickSort takes O(n log n) time, it is enough to show, that every element in the input,
> participates in at most 32 ln n rounds with high enough probability.

> Namely, QuickSort performs at most 32n ln n comparisons with high probability.

> Theorem 9.1.2. With high probability (i.e., 1 − 1/n2 ) the depth of the recursion of QuickSort is ≤ 32 ln n. Thus,
> with high probability, the running time of QuickSort is O(n log n).

> More generally, for any constant c, there exist a constant d, such that the probability that QuickSort recursion depth for any element exceeds d ln n is smaller than 1/nc .

> Theorem 9.2.1 (Markov’s Inequality.). For a non-negative variable X, and t > 0, we have:

> Theorem 9.2.3 (Chernoff inequality). Let X1 , . . . , Xn be n independent random variables, such that P[Xi = 1] =

> Lemma 9.3.1. Given n elements, the expected depth of a treap T defined over those elements is O(log(n)).

Contents:
- 9.1 QuickSort and Treaps with High Probability: QuickSort as a game in rounds, with each comparison charged to an element; the union bound; "with high probability" meaning failure probability polynomially small in n (here 1/n^2).
- 9.1.1 Bounding the rounds an element participates in: lucky rounds (both parts at most 3/4), rho = log_{4/3} n <= 3.5 ln n, coin-flip lemma 9.1.1, Theorem 9.1.2 with the "for any constant c there is a constant d" generalisation.
- 9.1.2 Alternative proof via expected subproblem size, shrinking by a factor 7/8 per level in expectation, finished with Markov's inequality.
- 9.2 Chernoff inequality: Markov's inequality (9.2.1), the +-1 Chernoff bound (9.2.3), the general case (9.2.7).
- 9.3 Treaps: construction, operations, and depth O(log n) in expectation and with high probability (Lemma 9.3.1).
- 9.4 Bibliographical notes; 9.5 recap from earlier lectures (conditional expectation).
- Note: the notes do not derive the expected comparison count of QuickSort; they go straight to high-probability bounds.

## O-notation in Algorithm Analysis
URL: https://arxiv.org/pdf/1309.3210
Version: arXiv:1309.3210v32 [cs.DS], 29 Oct 2016 (PDF compiled 27 Nov 2024)
> is to define the O-notation only in N,
> and then silently continue using the notation over multiple variables too. That
> is, with no definition.

> Among all the books we have looked at, [1] and [2] were the only ones to provide
> a definition for N2 — although different ones. The former provided asymptotic
> linear dominance, while the latter provided coasymptotic linear dominance.

> The first documented symptom of a non-trivial generalization to N2 was
> given by Howell [11], who demonstrated a flaw4 in asymptotic linear dominance
> on N2 .

> [1] Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, and Clifford
> Stein. Introduction to Algorithms. MIT Press, Cambridge, MA, USA, 2nd
> edition, 2001.

> [2] Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, and Clifford
> Stein. Introduction to Algorithms. The MIT Press, 3rd edition, 2009.

> [11] Rodney R. Howell. On Asymptotic Notation with Multiple Variables, 2008.

Note: so the two books with a multivariable definition are the 2nd and 3rd editions of CLRS; the title of arXiv 1309.3210 (v32) is "O-notation in Algorithm Analysis", and Howell's paper is the one titled "On Asymptotic Notation with Multiple Variables".

Contents:
- Abstract and introduction: cost functions, the order relation, and O(f) as the set of g with g ≤ f.
- Problem 3: how the multivariate O-notation should be defined, with a survey of how textbooks treat N2.
- 8 intuitive properties of the order relation, and a proof that linear dominance is the only definition satisfying them.
- Master theorems, O-mappings and O-equalities.
- Local linear dominance and limit theorems.
- Appendix B: Howell's counterexample to asymptotic linear dominance on N2.
- Appendix G: comparison of definitions (trivial, asymptotic, co-asymptotic, cofinite linear dominance).

## OEIS A013603: difference between 2^n and the nearest prime less than or equal to 2^n
URL: https://oeis.org/A013603
Version: OEIS entry A013603 as shown on 2026-10-11 (page footer: "Last modified October 11 13:27 EDT 2026"); status approved

> Difference between 2^n and the nearest prime less than or equal to 2^n.

> 0, 1, 1, 3, 1, 3, 1, 5, 3, 3, 9, 3, 1, 3, 19, 15, 1, 5, 1, 3, 9, 3, 15, 3, 39, 5, 39, 57, 3, 35, 1, 5, 9, 41, 31, 5, 25, 45, 7, 87, 21, 11, 57, 17, 55, 21, 115, 59, 81, 27, 129, 47, 111, 33, 55, 5, 13, 27, 55, 93, 1, 57, 25, 59, 49, 5, 19, 23, 19, 35, 231, 93, 69, 35, 97, 15

> a(n) = 2^n - prevprime(2^n) = 2^n - prime(primepi(2^n)). - Alonso del Arte, Dec 10 2016

The data line starts at OFFSET 1, so its 32nd term is 5 and its 64th term is 59 (counting the comma-separated terms). By the formula, the largest prime below 2^32 is 2^32 - 5 and the largest prime below 2^64 is 2^64 - 59.

Contents:
- Title line and definition of the sequence (2^n minus the largest prime not above 2^n).
- The first 76 terms (data line), OFFSET 1,4.
- Comments: a(n) = 1 means 2^n - 1 is a Mersenne prime; a(1) = 0 convention; Mathematica NextPrime caveat for n = 1.
- Links: T. D. Noe's table for n = 1..5000, V. Danilov's table for large n, a video on 2^255 - 19.
- Formula: a(n) = A049711(2^n); a(n) = 2^n - prevprime(2^n).
- Maple, Mathematica and PARI programs.
- Cross references (A013597, A014234, A049711, A007917, A151799, A092131), keyword nonn, author, extensions, status.

## Pseudo-polynomial time (Wikipedia)
URL: https://en.wikipedia.org/wiki/Pseudo-polynomial_time
Version: English Wikipedia article as fetched 2026-10-11 (cites Garey and Johnson, Computers and Intractability, 1979, for the definition)

> a numeric algorithm runs in pseudo-polynomial time if its running time is bounded from above by a polynomial function of the two variables: the numeric value of the input (the largest integer present in the input) and the length of the input (the number of bits required to represent it).

> divisions, which is sub-linear in the value of n but exponential in the length of n

> Since computational complexity measures difficulty with respect to the length of the (encoded) input, this naive algorithm is actually exponential. It is, however, pseudo-polynomial time.

> Michael R. Garey and David S. Johnson. Computers and Intractability: A Guide to the Theory of NP-Completeness. W.H. Freeman and Company, 1979.

Note: used as opened corroboration of the Garey and Johnson definition (the book itself was not opened) and of trial division as the standard pseudo-polynomial example.

Contents:
- Definition (polynomial in the numeric value and the length of the input), why value is exponential in length under positional encoding, unary encoding, weak and strong NP-completeness.
- Examples: primality by trial division (up to about sqrt(n) - 1 divisions, exponential in the length), contrast with addition and long division, a polynomial-time primality test found in 2002; the knapsack problem and its O(nW) dynamic program.
- Strong and weak NP-hardness against strong and weak polynomial-time algorithms (partition, 3-partition); see also; references.

## libstdc++ bits/stl_algo.h (GCC mirror, master)
URL: https://raw.githubusercontent.com/gcc-mirror/gcc/master/libstdc++-v3/include/bits/stl_algo.h
Version: gcc-mirror/gcc branch master, fetched 2026-10-11 (header: "Copyright (C) 2001-2026 Free Software Foundation, Inc.")

> enum { _S_threshold = 16 };

> if (__last - __first > __threshold)
> {
> std::__insertion_sort(__first, __first + __threshold, __comp);
> std::__unguarded_insertion_sort(__first + __threshold, __last,
> __comp);
> }
> else
> std::__insertion_sort(__first, __last, __comp);

> while (__last - __first > int(_S_threshold))

> std::__introsort_loop(__first, __last,
> std::__lg(__last - __first) * 2,
> __comp);
> std::__final_insertion_sort(__first, __last, __comp);

Contents:
- Copyright and licence header, file overview of the bits/stl_algo.h algorithm implementations.
- __insertion_sort and __unguarded_insertion_sort, helpers for the sort routine.
- The constant _S_threshold = 16, which controls some aspect of the sort routines.
- __final_insertion_sort: insertion sort for the first 16 elements, unguarded insertion sort for the rest.
- __introsort_loop: partitions while the range is longer than _S_threshold, falls back to partial sort (heap) when the depth limit reaches 0.
- __sort: introsort loop with depth limit 2 * lg(n), then final insertion sort.
- Other algorithms in the header (partial sort, nth_element, merge, inplace merge, stable sort with __chunk_insertion_sort, and so on).

## CPython Objects/listsort.txt (timsort description)
URL: https://raw.githubusercontent.com/python/cpython/3.12/Objects/listsort.txt
Version: python/cpython branch 3.12

> This describes an adaptive, stable, natural mergesort, modestly called
> timsort

> If a natural
> run contains less than minrun elements (see next section), the main loop
> artificially boosts it to minrun elements, via a stable binary insertion sort
> applied to the right number of array elements following the short natural
> run. In a random array, *all* runs are likely to be minrun long as a
> result.

> A "binary insertion sort" is just like a textbook insertion sort, but instead
> of locating the correct position of the next item via linear (one at a time)
> search, an equivalent to Python's bisect.bisect_right is used to find the
> correct position in logarithmic time.

> insertion
> sort remains quadratic (expected and worst cases) either way. Speeding the
> search doesn't reduce the quadratic data movement costs.

> If we take minrun=33 in this case, then we're very likely to end up with 64
> runs each of length 33, and then all merges are perfectly balanced. Better!

> But in CPython's case, comparisons are extraordinarily expensive compared to
> moving data, and the details matter. Moving objects is just copying
> pointers.

> So cutting the number of compares is almost always measurably helpful in
> CPython, and the savings swamp the quadratic-time data movement costs for
> reasonable minrun values.

Note: the main branch (https://raw.githubusercontent.com/python/cpython/main/Objects/listsort.txt, fetched 2026-10-11) keeps the BINSORT note and the "extraordinarily expensive" paragraph but replaces the minrun computation (a 2025 change credited to Stefan Pochmann), so minrun values are not quoted from 3.12. The cached plain text of that file is partly garbled: the fetch's HTML stripping removes text between "<" and ">" in a plain-text file.

Contents:
- Intro: timsort as an adaptive, stable, natural mergesort.
- Comparison with Python's samplesort hybrid, with comparison counts and temp-memory tables from sortperf.py.
- Runs: count_run(), ascending and strictly descending runs, boosting short runs to minrun by binary insertion sort.
- Computing minrun: choosing minrun so the number of runs is a power of 2 or slightly less (worked example with N = 2112).
- Merge pattern, merge memory, merge_lo and merge_hi, MIN_GALLOP and galloping mode.
- Notes: BINSORT, LEFT OR RIGHT (gallop_left and gallop_right), REGION OF UNCERTAINTY, optimisation of individual comparisons.

## Sedgewick and Wayne, Algorithms 4th edition, section 1.4 Analysis of Algorithms (booksite)
URL: https://algs4.cs.princeton.edu/14analysis/
Version: Algorithms, 4th edition booksite page "1.4 Analysis of Algorithms" (no date shown; fetched 2026-10-11)
> We write g(N) ~ f(N) to indicate that
> g(N) / f(N) approaches 1 as N grows.

> Most often, we work with tilde approximations of the form
> g(N) ~ a f(N) where f(N) = N^b log^c N
> and refer to f(N) as the The order of growth
> of g(N).

> the cost of executing each statement and
> the frequency of execution of each statement.

> Amortized analysis provides a worst-case performance guarantee
> on a sequence of operations.

> To determine the memory usage of an object, we add the amount of
> memory used by each instance variable to the overhead associated
> with each object, typically 16 bytes.

Note: the fetched plain text keeps the prose but drops the page's tables and figures, so the doubling-hypothesis table values are not in the cached text; the doubling programs (DoublingTest.java, DoublingRatio.java) are named in the prose.

Contents:
- Scientific method: observe, hypothesize, predict, verify, validate; experiments reproducible, hypotheses falsifiable.
- Observations: Stopwatch.java, ThreeSum.java, DoublingTest.java (doubling the input size and timing) and DoublingRatio.java (running-time ratios).
- Mathematical models: running time = cost per statement times frequency; tilde approximations; order-of-growth classifications of the form N^b log^c N.
- Cost model: counting array accesses for 3-sum; property that 3-sum is order N^3; proposition of ~N^3/2 array accesses.
- Designing faster algorithms: 2-sum in N^2 (brute force) and N log N (TwoSumFast); 3-sum in N^2 log N (ThreeSumFast).
- Coping with dependence on inputs: input models, worst-case guarantees, randomized algorithms, amortized analysis (linked-list and resizing-array propositions for Bag, Stack, Queue).
- Memory usage: primitive types, objects (16-byte overhead, 8-byte padding), references (8 bytes), linked-list nodes, arrays (24-byte header), strings (56 + 2N bytes).
- Q and A (JVM memory flags, padding, timing advice, system effects such as caching and garbage collection), exercises (orders of growth of loops), creative problems (4-sum, local minimum, bitonic search, Fibonacci binary search).

## Spielman and Teng, Smoothed Analysis of Algorithms: Why the Simplex Algorithm Usually Takes Polynomial Time
URL: https://arxiv.org/pdf/cs/0111050
Version: arXiv:cs/0111050v7, last revised 9 Oct 2003 (first submitted 19 Nov 2001); abstract page https://arxiv.org/abs/cs/0111050
> We introduce the smoothed analysis of algorithms, which continuously interpolates between the worst-case and average-case analyses of algorithms.

> In smoothed analysis, we measure the maximum over inputs of the expected
> performance of an algorithm under small random perturbations of that input.

> We show that the simplex algorithm has
> smoothed complexity polynomial in the input size and the standard deviation
> of Gaussian perturbations.

> time taken by a two-phase shadow-vertex simplex method to solve such a linear program is
> polynomial in 1/σ and the dimensions of A.

Note: the arXiv abstract page (v7) words the first sentence as "a hybrid of the worst-case and average-case analysis of algorithms"; the PDF text above says "continuously interpolates between".

Contents:
- Abstract: definition of smoothed analysis (maximum over inputs of expected performance under small random perturbations), measured in input size and perturbation magnitude.
- Main result: the simplex algorithm has smoothed complexity polynomial in input size and the standard deviation of Gaussian perturbations.
- Full paper (about 160k characters of text): motivation contrasting worst-case and average-case analysis, definitions of smoothed complexity, the simplex method with the shadow-vertex pivot rule, and the probabilistic proofs.
- Authors: Daniel A. Spielman (MIT) and Shang-Hua Teng (Boston University and Akamai); extended abstract in STOC 2001.

## Roughgarden (ed.), Beyond the Worst-Case Analysis of Algorithms, Chapter 1 (Introduction)
URL: https://arxiv.org/pdf/2007.13241
Version: arXiv:2007.13241v1, 26 Jul 2020; Chapter 1 of the book published by Cambridge University Press (2020); abstract page https://arxiv.org/abs/2007.13241
> Worst-case analysis summarizes the performance profile of an algorithm by its worst performance on any input of a given size

> Theorem 3.1 is an example of a “parameterized analysis” of an algorithm, where the performance
> guarantee is expressed as a function of parameters of the input other than its size.

> Chapter 3, by Barbay, searches for instance-optimal algorithms—algorithms that for every input
> perform better than every other algorithm (up to a constant factor).

> A resource augmentation guarantee then states that the performance of an algorithm of
> interest is always close to that achieved by an all-powerful algorithm that is handicapped by slightly
> less resources.

> Part III of the book is about semi-random models—hybrids of worst- and average-case analysis in
> which nature and an adversary collaborate to produce an instance of a problem.

> 1. Overly pessimistic performance predictions. By design, worst-case analysis gives a pessimistic
> estimate of an algorithm’s empirical performance.

> One key
> drawback of distributional analysis is that it can encourage the design of algorithms that are brittle
> and overly tailored to the assumed input distribution.

Contents:
- Why worst-case analysis: goals of performance prediction and identifying optimal algorithms, with its strengths and shortcomings.
- Motivating mysteries (for example over-parameterized neural networks) and the limits of worst-case guarantees.
- Worked example: parameterized bounds in online paging (locality of reference, working-set function f, LRU versus FIFO, Theorem 3.1).
- Reasons to prefer parameterized guarantees (five listed).
- Roadmap by part: Part I (parameterized algorithms, instance optimality, resource augmentation), Part II (deterministic data models such as perturbation stability), Part III (semi-random models, planted models, random-order models, self-improving algorithms), Part IV (smoothed analysis), Part V (applications to machine learning and beyond).

## Mitzenmacher and Vassilvitskii, Algorithms with Predictions
URL: https://arxiv.org/abs/2006.09123
Version: arXiv:2006.09123v1, submitted 16 Jun 2020 (abstract page)
> We introduce algorithms that use predictions from machine learning applied to the input to circumvent worst-case analysis.

> We aim for algorithms that have near optimal performance when these predictions are good, but recover the prediction-less worst case behavior when the predictions have large errors.

> survey is to appear as a chapter in Beyond the Worst-Case Analysis of Algorithms, a collection edited by Tim Roughgarden.

Contents:
- Abstract: algorithms that take machine-learned predictions about the input, aiming at near-optimal performance when predictions are good and worst-case behaviour when they are badly wrong.
- Metadata: authors Michael Mitzenmacher and Sergei Vassilvitskii; subject cs.DS; a survey chapter for the Roughgarden volume, to be updated on arXiv.
- Links to the full text (PDF, HTML) not quoted here.

