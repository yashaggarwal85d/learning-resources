# Sources: Recurrences: Master theorem and Akra–Bazzi

Checked 2026-10-11.

## Notes on Better Master Theorems for Divide-and-Conquer Recurrences (T. Leighton)
URL: https://www.cs.miami.edu/home/burt/learning/Csc517.051/notes/akrabazzi.pdf
Version: Tom Leighton, MIT Mathematics Department and Laboratory for Computer Science, October 9, 1996 (course-notes copy hosted at the University of Miami)

Naming and history. The notes call the result the "Akra-Bazzi result"; Leighton writes g for the driving function. The Master Method is credited to Cormen, Leiserson and Rivest.

> Recently, Akra and Bazzi [1] discovered a surprisingly elegant

> In these notes, we provide a simple inductive proof of the Akra-Bazzi

> The Master Method is fairly powerful and results in a closed form solution for divide-and-conquer

> The Akra-Bazzi analysis is based

> on a special functional transform that they call the \order transform."

> [1] M. Akra and L. Bazzi. \On the solution of linear recurrence equations." To appear, 1996.

Conditions on the recurrence (Equation 1: T(x) = 1 for 1 <= x <= x0, and sum of a_i T(b_i x) + g(x) for x > x0):

> 6. g (x) is a nonnegative function that satis es the polynomial-growth condition speci ed below.

> These conditions are somewhat less restrictive than those of [1].

Items 1-5 (real x >= 1; x0 >= 1/b_i and >= 1/(1-b_i); a_i > 0; b_i in (0,1); k >= 1 constants) contain garbled symbols and are paraphrased only. The polynomial-growth condition: there exist positive constants c1, c2 with c1 g(x) <= g(u) <= c2 g(x) for all x >= 1, all i, all u in [b_i x, x].

Theorem 1 (Akra-Bazzi), definition of p. The conclusion is T(x) = Theta( x^p ( 1 + integral from 1 to x of g(u)/u^(p+1) du ) ).

> Theorem 1 ([1]).PGiven

> a recurrence of the form speci ed in Equation 1, let p be the unique real

> number for which ki=1 ai bpi = 1. Then

Examples as printed (formulas garbled in the text layer, paraphrased): 2T(x/4)+3T(x/6)+Theta(x log x) gives p=1, T=Theta(x log^2 x); 2T(x/2)+(8/9)T(3x/4)+Theta(x^2/log x) gives p=2, T=Theta(x^2/log log x); T(x/2)+Theta(log x) gives p=0, T=Theta(log^2 x); (1/2)T(x/2)+Theta(1/x) gives p=-1, T=Theta((log x)/x); 4T(x/2)+Theta(x) gives p=2, T=Theta(x^2).

> Examples.

> 1 These conditions are somewhat less restrictive than those of [1].

Beyond polynomial growth: if g grows faster than any polynomial then T(x) = Theta(g(x)).

> Remark. If g(x) grows faster than any polynomial in x, then T (x) =

Floors and ceilings (Section 3, Equation 2 with perturbations h_i(x), |h_i(x)| <= x/log^(1+eps) x; Theorem 2 gives the same solution):

> Generally speaking, the inclusion of oors and ceilings in a recurrence does not signi cantly change

> the nature of the solution (e.g., see [1, 2]), but the proofs of this fact tend to be fairly tedious and

> specialized in nature.

> In particular, we show that the solution of Theorem 1 holds

> hi (x) = dbi xe , bix;

> thereby extending Theorem 1 to handle ceiling functions.

Contents:
- Abstract and 1 Introduction: Master Method (CLR) versus the Akra-Bazzi generalisation; aim of an inductive proof for undergraduates.
- 2 The Akra-Bazzi Solution: Equation 1 with conditions on x, x0, a_i, b_i, k, g; the polynomial-growth condition and its remark; Theorem 1 (p defined by sum a_i b_i^p = 1; T(x) = Theta(x^p (1 + integral of g(u)/u^(p+1) du))); five worked examples; Lemma 1 and the inductive proof; remark on g faster than any polynomial.
- 3 Variations: recurrences with ceilings; Equation 2 with perturbations h_i(x); Lemma 2; Theorem 2 (same solution); proof with the stronger hypothesis; remark that the x/log^(1+eps) x limit is nearly tight.
- References: [1] Akra and Bazzi, [2] Cormen, Leiserson, Rivest.

## Jeff Erickson, Algorithms, Appendix II: Solving Recurrences
URL: https://jeffe.cs.illinois.edu/teaching/algorithms/notes/99-recurrences.pdf
Version: "Appendix II: Solving Recurrences [Fa'13]", page footer "(c) Copyright 2018 Jeff Erickson", CC BY-NC-SA 4.0 (22 pages).

Guess and confirm (substitution/induction), and refining a failed guess:

> Ultimately, there is only one fail-safe method to solve any recurrence:
> Guess the answer, and then prove it correct by induction.

> If you guess a closed-form solution and then try to verify your guess inductively, usually either the proof will succeed, in which case you’re done, or the proof will fail, in which case your failure will help you refine your guess.

> Where you get your initial guess is utterly irrelevant

Floors and ceilings, and simplifying the Theta terms (merge sort):

> For now, let’s consider the special case where n is a power of 2; this assumption allows us to take the floors and ceilings out of the recurrence. (We’ll see how to deal with the floors and ceilings later; the short version is that they don’t matter.)

> Because the recurrence itself is given only asymptotically—in terms of Θ( ) expressions—we can’t hope for anything but an asymptotic solution.

> I’ll also assume for simplicity that n is an integral power of b; we’ll see how to avoid this assumption later (but to summarize: it doesn’t matter).

> Unfortunately, for other values values of n, this simplified recurrence is incorrect. When n is odd, then the recurrence calls for us to sort a fractional number of elements!

> So T (n) = Θ(n log n) after all, just as though we had ignored the floors and ceilings from the beginning!

> Domain transformations are useful for removing floors, ceilings, and lower order terms from the arguments of any recurrence that otherwise looks like it ought to fit either the Master Theorem or the recursion tree method.

Strengthening or changing the guess when the induction does not go through (the sqrt(n) example, T(n) = sqrt(n) T(sqrt(n)) + n):

> The proof worked for any constant a, no matter how small. This strongly suggests that our upper bound T (n) = O(n log n) is not tight.

> Hey look at that! For once, our upper bound proof requires a constraint on the hidden constant a. This is an good indication that we’ve found the right answer.

> Technically, we’re still missing the base cases in both proofs, but we can be fairly confident at this point that T (n) = Θ(n log log n).

Fibonacci: the induction constant is fixed by the base cases, and lower bounds only need large n:

> So we have most of an inductive proof that Fn ≤ α · φ n for some constant α. All that we’re missing are the base cases, which (we can easily guess) must determine the value of the coefficient a.

> So let’s ignore the trivial base case F0 = 0 and assume that F2 = 1 is a base case instead.

Recursion trees and the level-by-level sum:

> There is a simple and general technique for solving many recurrences in this and similar forms, using a recursion tree. The root of the recursion tree is a box containing the value f (n); the root has a children, each of which is the root of a (recursively defined) recursion tree for the function T (n/b).

> Equivalently, a recursion tree is a complete a-ary tree where each node at depth i contains the value f (n/b i ).

> Because we’re only looking for asymptotic bounds, the exact base case doesn’t matter; we can safely assume that T (1) = Θ(1), or even that T (n) = Θ(1) for all n ≤ 10100 .

> Now T (n) is just the sum of all values stored in the recursion tree. For each i, the ith level of the tree contains a i nodes, each with value f (n/b i ).

> We easily see that L = log b n, because n/b L = 1. The base case f (1) = Θ(1) implies that the last non-zero term in the summation is Θ(a L ) = Θ(alog b n ) = Θ(nlog b a ).

> only the largest term in the geometric series matters; all of the other terms are swallowed up by the Θ(·) notation.

Examples (equal / decreasing / increasing level sums):

> There are 2i nodes at level i, each with value n/2i , so every term in the level-by-level sum (Σ) is the same:

> The recursion tree has L = log2 n levels, so T (n) = Θ(n log n).

> The recursion tree is a single path. The node at depth i has value (3/4)i n, so the level-by-level sum (Σ) is a decreasing geometric series:

> This geometric series is dominated by its initial term n, so T (n) = Θ(n).

> There are 3i nodes at depth i, each with value n/2i , so the level-by-level sum (Σ) is an increasing geometric series:

> This geometric series is dominated by its final term (3/2) L n. Each leaf contributes 1 to this term; thus, the final term is equal to the number of leaves in the tree!

> The level sums are neither constant nor a geometric series, so we just have to evaluate the overall sum directly.

Unbalanced splits (quicksort-, selection-type):

> However, the nodes in any complete level (that is, above any of the leaves) sum to n. Moreover, every leaf in the recursion tree has depth between log4 n and log4/3 n.

> Since these bounds differ by only a constant factor, we have T (n) = Θ(n log n).

> If we look only at complete levels of the tree, we find that the level sums form a descending geometric series T (n) = n + 9n/10 + 81n/100 + · · · . We can get an upper bound by ignoring the base cases entirely and growing the tree out to infinity, and we can get a lower bound by only counting nodes in complete levels.

> Unfortunately, the crude bounds

Master Theorem as given (three cases, "on your own" case) and its proof sketch:

> The following theorem completely describes the solution for any divide-and-conquer recurrence in the ‘standard form’ T (n) = aT (n/b) + f (n), where a and b are constants and f (n) is a polynomial.

> but many people (including Jeff) find it harder to even remember the statement of the theorem than to use the more powerful and general recursion-tree technique.

> The Master Theorem. The recurrence T (n) = aT (n/b) + f (n) can be solved as follows.

> If a f (n/b) = κ f (n) for some constant κ < 1, then T (n) = Θ( f (n)).

> If a f (n/b) = K f (n) for some constant K > 1, then T (n) = Θ(nlog b a ).

> If a f (n/b) = f (n), then T (n) = Θ( f (n) log b n).

> If none of these three cases apply, you’re on your own.

> If f (n) is a constant factor larger than a f (b/n), then by induction, the level sums define a descending geometric series. The sum of any geometric series is a constant times its largest term.

> If f (n) is a constant factor smaller than a f (b/n), then by induction, the level sums define an ascending geometric series.

> Finally, if a f (b/n) = f (n), then by induction, each of the L + 1 terms in the sum is equal to f (n), and the recursion tree has depth L = Θ(log b n).

Akra-Bazzi:

> Finally, let me describe without proof a powerful generalization of the recursion tree method, first published by Lebanese researchers Mohamad Akra and Louay Bazzi in 1998.

> where k is a constant, ai > 0 and bi > 1 are constants for all i, and f (n) = Ω(nc ) and f (n) = O(nd ) for some constants 0 < c ≤ d.

> Akra and Bazzi prove that this recurrence has the closed-form asymptotic solution

> where ρ is the unique real solution to the equation

> In particular, the Akra-Bazzi theorem immediately implies the following form of the Master Theorem:

> The Akra-Bazzi theorem does not require that the parameters ai and bi are integers, or even rationals;

> on the other hand, even when all parameters are integers, the characteristic equation

> Here are a few examples of recurrences that are difficult (or impossible) for recursion trees, but have easy solutions using the Akra-Bazzi theorem.

> The equation (3/4)ρ + (1/4)ρ = 1 has the unique solution ρ = 1, and therefore

> The equation (1/5)ρ + (7/10)ρ = 1 has no analytical solution. However, we easily observe that (1/5) x + (7/10) x is a decreasing function of x, and therefore 0 < ρ < 1.

> (A bit of numerical computation gives the approximate value ρ ≈ 0.83978, but why bother?)

> has the unique solution ρ = 0, and therefore

> The Akra-Bazzi method is that it can solve almost any divide-and-conquer recurrence with

> where we have to fall back on recursion trees.

> On the other hand, the steps appear to be magic, which makes the method hard to remember, and for most divide-and-conquer recurrences that arise in practice, there are much simpler solution techniques.

Where the Master Theorem does not apply (non-constant degree, ugly cases):

> Consider the divide-and-conquer recurrence T (n) = n · T ( n) + n. This doesn’t fit into the form required by the Master Theorem (which we’ll see below), but it still sort of resembles the Mergesort recurrence

> The degree of the nodes in the recursion tree is no longer constant, so we have to be a bit more careful, but the same basic technique still applies.

> This looks like a divide-and-conquer recurrence, but what does it mean to have a quarter of a child?

> and T (n) = Θ(n lg lg n).

Change of variables (domain/range transformations):

> Sometimes we encounter recurrences that don’t fit the structures required for recursion trees or annihilators. In many of those cases, we can transform the recurrence into a more familiar form, by defining a new function in terms of the one we want to solve.

> Domain transformation: Define a new function S(n) = T ( f (n)) with a simpler recurrence, for some simple function f .

> Range transformation: Define a new function S(n) = f (T (n)) with a simpler recurrence, for some simple function f .

> In fact, a simple domain transformation allows us to solve the recurrence in just a few lines. We define a new function t(k) = T (2k ), which satisfies the simpler linear recurrence t(k) = t(k − 1) + t(k − 2) + 1.

> We conclude that T (n) = t(lg n) = Θ(φ lg n ) = Θ(n lg φ ) ≈ Θ(n0.69424 ).

> Consider once more the simplified mergesort recurrence T (n) = 2T (n/2) + n. The function t(k) = T (2k ) satisfies the recurrence t(k) = 2t(k −1)+2k .

> which implies that T (n) = t(lg n) = Θ(n log n), just as we expected.

> The function U(n) = n · T (n) satisfies the more palatable recurrence U(n) = U(n/4) + U(3n/4) + n.

> On the other hand, for some recurrences like T (n) = T (n/3)+T (2n/3)+n, the recursion tree method gives an easy solution, but there’s no way to transform the recurrence into a form where we can apply the annihilator method directly.

Not in these notes: binary search is not worked as an example, and the notes contain no "false proof" that merge sort is O(n) (no off-by-constant induction fallacy); the nearest material is the sqrt(n) example above where inductive attempts fail.

Contents:
1. Introduction: recurrence = base cases + recursive cases; closed form vs asymptotic solution; tight solutions for inequalities.
2. The Ultimate Method: Guess and Confirm: Tower of Hanoi (guess, unroll, induct); Fibonacci (upper bound phi^n, lower bound via base case F2); Mergesort (floors/ceilings ignored, unroll, T(n) = Theta(n log n)); an uglier divide-and-conquer example T(n) = sqrt(n) T(sqrt(n)) + n (failed guesses n log n, n, n sqrt(lg n) before n lg lg n).
3. Divide and Conquer Recurrences (Recursion Trees): level sum (Sigma), depth L = log_b n, leaves n^(log_b a); examples: mergesort, randomized selection, Karatsuba, 2T(n/2)+n/lg n, 4T(n/2)+n lg n, sqrt(n) T(sqrt(n)) + n, randomized quicksort, deterministic selection, randomized search trees, ham-sandwich trees; The Master Theorem (three cases by a f(n/b) vs f(n)) with proof sketch.
4. The Nuclear Bomb: Akra-Bazzi statement, Master Theorem as corollary, non-integer parameters, examples (quicksort, deterministic selection rho ~ 0.83978, search trees rho = 0, ham-sandwich rho = lg phi), remarks on magic and exceptions.
5. Linear Recurrences (Annihilators): operators, annihilators, the five-step technique, examples (Fibonacci closed form, Hanoi, height-balanced trees, order-3 linear recurrence).
6. Transformations: domain, range, difference; unsimplified mergesort with floors/ceilings (S(n) = T(n + 2)); ham-sandwich trees via t(k) = T(2^k); random binary search trees via U(n) = n T(n); randomized quicksort full-history recurrence; footnote on T(n/3)+T(2n/3)+n.
7. Exercises (closed-form guessing, recursion trees/Akra-Bazzi, annihilators, tricks).

## Erickson, Algorithms, Chapter 1: Recursion
URL: https://jeffe.cs.illinois.edu/teaching/algorithms/book/01-recursion.pdf
Version: Jeff Erickson, Algorithms (1st edition, 2019), chapter 1 as posted on the book site
Note: the PDF text extraction drops the symbols for less-than-or-equal and some digits, so quotes keep the gaps as extracted.

Key lemma (median of medians is a good pivot):
> Thus, mom is bigger than at least 3n/10 elements in the input array; symmetrically, mom is smaller than at least 3n/10 elements. Thus, in the worst case, the second recursive call searches an array of size at most 7n/10.

> Thus, the input to the recursive subproblem contains at most 7n/10 elements.

Recurrence and its solution (recursion tree; the chapter does not mention Akra-Bazzi):
> The second key insight is that the total size of the two recursive subproblems is a constant factor smaller than the size of the original input array.

> If we draw out the recursion tree for this recurrence, we observe that the total work at each level of the recursion tree is at most 9/10 the total work at the previous level. Thus, the level sums decay exponentially, giving us the solution T (n) = O(n).

> Again, the fact that the recursion tree is unbalanced is completely immaterial.

Exact constants and additive terms:
> The answer is that 5 is the smallest odd block size that gives us exponential decay in the recursion-tree analysis!

> T (n)  T (n/3) + T (2n/3) + O(n).

> Median-of-medians selection using 3-element blocks is no faster than sorting.

> Selecting the median of 5 elements requires at most 6 comparisons, so we need at most 6n/5 comparisons to set up the recursive subproblem.

> actually requires only 2n/5 additional comparisons. Thus, a more precise recurrence for the worst-case number of comparisons is

> T (n)  T (n/5) + T (7n/10) + 8n/5.

> In fact, the right way to choose the pivot element in practice is to choose it uniformly at random. Then the expected number of comparisons required to find the median is at most 4n.

Recursion trees in general (merge sort and others):
> There are three common cases where the level-by-level series (⌃) is especially easy to evaluate:

> Decreasing: If the series decays exponentially

> Equal: If all terms in the series are equal, we immediately have T (n) = O( f (n)· L) = O( f (n) log n).

> Increasing: If the series grows exponentially

> then T (n) = O(nlogc r ).

> As an elementary example, if we draw out the first few levels of the recursion tree for the (simplified) mergesort recurrence T (n) = 2T (n/2) + O(n), we discover that all levels are equal, which immediately implies T (n) = O(n log n).

> It immediately follows that T (n) = O(n log n).

> gives us a completely unbalanced recursion tree, where one child of each internal node is a leaf.

> Fortunately, there is a simple technique for removing floors and ceilings from recurrences, called domain transformation.

> From now on, faced with any divide-and-conquer recurrence, I will silently brush floors and ceilings and lower-order terms under the rug

> T (n)  3T (dn/2e) + O(n)

> T (n) = O(nlog2 3 )

Contents:
- Reductions
- Simplify and Delegate
- Tower of Hanoi
- Mergesort (correctness, analysis)
- Quicksort (correctness, analysis)
- Recursion Trees (level-by-level sum; decreasing, equal, increasing cases; mergesort and T(n/3)+T(2n/3) examples)
- Ignoring Floors and Ceilings Is Okay, Honest (domain transformation)
- Linear-Time Selection: Quickselect, Good pivots, Median of medians (algorithm, Analysis), Sanity Checking
- Fast Multiplication (naive divide and conquer, Karatsuba)
- Exponentiation
- Exercises

## UIUC CS374 Fall 2020, 11.4.4 Median of medians is a good median
URL: https://courses.grainger.illinois.edu/cs374/fa2020/lec_prerec/11/11_4_4_0.pdf
Version: CS/ECE 374, Fall 2020, slides by Har-Peled
> There are at least 3n/10 − 6 elements smaller than the median of medians b.

> Hence number of elements smaller than b is:

> |Agreater | ≤ 7n/10 + 6.

Contents:
- Proposition: at least 3n/10 - 6 elements smaller than the median of medians
- Proof: at least half of the floor(n/5) groups have at least 3 elements smaller than b, except the group containing b
- Corollaries: |A_greater| and |A_less| are each at most 7n/10 + 6

## Improved Master Theorems for Divide-and-Conquer Recurrences (Roura)
URL: https://cs.auckland.ac.nz/~mcw/Teaching/320/refs/divide-conquer/recurrences.pdf
Version: S. Roura, Journal of the ACM, Vol. 48, No. 2, March 2001, pp. 170-205 (journal version; preliminary versions in ICALP 1997 are cited inside as Roura 1997a, 1997b)

The classic Master Theorem (three cases) as the paper recalls it. The case formulas are typeset with symbols that do not extract as plain text, so only the prose around them is quoted.
> Then, the MT states that the solution to the recurrence is

> Usually, a MT does not provide an explicit solution but partial information about the function under study, like bounds on its growing order.


Gaps and sublogarithmic factors: the classic theorem only handles toll functions n^a log^c n with c >= 0 in its middle case; the improved theorem covers the rest.
> The Discrete MT (Theorem 2.3) covers the presence of sublogarithmical factors in the toll function

> This allows us to deal with toll functions like


Effect of floors, ceilings and perturbations.
> The term

> in the definition of S n covers expressions with floors and ceilings in the argument of the recursive call.

> Hence, a direct application of the rules above yields

> free us almost completely from technicalities like floors and ceilings

> Since all the theorems in this work rely only upon the asymptotic properties of the toll function and the distribution of weights, we can avoid explicitly stating the initial values of the recurrence.

Statement of the improved (Discrete) theorem.
> THEOREM 2.3 (DISCRETE MASTER THEOREM).

> Let Fn be a function defined by a discrete recursive definition

> Then,

Contents:
- 1. Introduction: toll function, the classic MT (three cases), the smoothness caveat, examples (1)-(5) (mergesort, binary search, multi-fraction, quicksort, quad-tree recurrences)
- 2. The Discrete Master Theorem: Definition 2.1 (discrete recursive definition), Definition 2.2 (sublogarithmical function), Theorem 2.3, recurrences outside its scope
- 3. The Continuous Master Theorem (shape functions, stochastic recurrences)
- 4-5. Core theorems for general divide-and-conquer recurrences
- 6-7. Proofs of the Discrete and Continuous Master Theorems
- 8. Variance of the cost; 9. Open problems
- Appendix A: worked examples of the Discrete MT; Appendix B: examples of the Continuous MT

## CS161 Lecture 8: Divide-and-Conquer Algorithms, Part Four (Stanford)
URL: https://web.stanford.edu/class/archive/cs/cs161/cs161.1138/lectures/08/Small08.pdf
Version: Stanford CS161, Summer 2013 offering (archive id cs161.1138), lecture 8 slides ("Small08"); problem set 3 due July 22

This deck does not state the Master Theorem or a regularity condition; it applies the a, b, d form and then moves to the substitution method for recurrences the theorem cannot handle.
> Solving recurrences the Master Theorem can't handle.

> Can we apply the Master Theorem?

> What are a, b, and d?

> a = 2, b = 3 / 2, and d = 1.

Median-of-medians recurrence, and why floors and ceilings matter.
> Break the input apart into block of five elements each, putting leftover elements into their own block.

> Recursively determine the median of these medians.

> Make up to one recursive call on an input of size at most 7n / 10.

> Can we apply the Master Theorem here?

> We cannot easily use the iteration method because of the floors and ceilings.

> The recursion-tree method is unlikely to be helpful because the tree shape is lopsided.

> The most accurate recurrence relation for our algorithm is the following:

> This linear-time selection algorithm does run in time O(n), but there is a huge constant factor hidden here.

Contents:
- Order statistics and the selection problem; sort-then-index in O(n log n)
- Partition subroutine and quickselect; worst-case recurrence T(n) = T(n-1) + Theta(n)
- Recursive median of first two-thirds as pivot: T(n) <= 2T(2n/3) + Theta(n), a = 2, b = 3/2, d = 1
- Median-of-medians (Blum, Floyd, Pratt, Rivest, Tarjan): groups of five, 30%/70% split, T(n) <= T(floor(n/5)) + T(floor(7n/10)) + Theta(n)
- Fat base case fix (n <= 100), substitution method proof of O(n) with k = 10c, then the exact ceiling recurrence with k = 50c
- Remarks on the large constant factor; next time: randomized selection

## MIT 6.046 recitation handout, "Master Theorem: Practice Problems and Solutions"
URL: https://people.csail.mit.edu/thies/6.046-web/master.pdf
Version: undated course handout, MIT 6.046 (fetched 2026-10-11)

> The Master Theorem applies to recurrences of the following form:

> where a ≥ 1 and b > 1 are constants and f (n) is an asymptotically positive function.

> Regularity condition: af (n/b) ≤ cf (n) for some constant c < 1 and all sufficiently large n.

Contents: the statement of the three cases (with the log^k n form of case 2), the regularity condition, and 19 practice recurrences some of which the theorem does not cover.

