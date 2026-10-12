# Sources: The potential method

Checked 2026-10-12. Every source was fetched raw with scripts/sources.mjs; quotes are proven by `sources.mjs check`. CLRS (4th ed.) is a book and could not be opened: it is cited for framing only. Fibonacci heaps: only Kleinberg-Tardos lecture slides were opened (not the Fredman-Tarjan paper).

## R. E. Tarjan, Amortized computational complexity (SIAM J. Algebraic Discrete Methods 6(2), 1985)
URL: https://courses.cs.duke.edu/fall11/cps234/reading/Tarjan85_AmortizedComplexity.pdf
Version: SIAM J. Alg. Disc. Meth., Vol. 6, No. 2, April 1985, pp. 306-318 (Section 2 "Two views of amortization"; fetched text of the Duke course-reading copy; formulas are partly garbled by PDF text extraction, so only prose lines are quoted)

Meaning of "amortize": averaging the running times of operations over a sequence.
> Webster’s [34] defines "amortize" as "to put money aside at
> intervals, as in a sinking fund, for gradual payment of (a debt, etc.)." We shall adapt
> this term to computational complexity, meaning by it "to average over time" or, more
> precisely, "to average the running times of operations in a sequence over the sequence."

Motivation: worst-case per-operation sums are too pessimistic, average-case assumptions may be false.
> A worst-case analysis, in which we sum the worst-case times
> of the individual operations, may be unduly pessimistic, because it ignores correlated
> effects of the operations on the data structure. On the other hand, an average-case
> analysis may be inaccurate, since the probabilistic assumptions needed to carry out
> the analysis may be false.

The stack example (pops then a push): one operation can be expensive, the total is at most 2m.
> However, altogether the m operations
> can perform at most 2m pushes and pops, since there are only m pushes altogether
> and each pop must correspond to an earlier push.

The banker's view: coins (credits) buy a fixed amount of time; amortized time = credits allocated.
> The first is the banker’s view of amortization. We assume that our computer is
> coin-operated; inserting a single coin, which we call a credit, causes the machine to
> run for a fixed constant amount of time. To each operation we allocate a certain
> number of credits, defined to be the amortized time of the operation.

Banker's view: borrowing allowed if repaid; no borrowing gives prefix bounds.
> If we can prove that we never need to borrow credits to complete the
> operations, then the actual time of any initial part of a sequence of operations is
> bounded by the sum of the corresponding amortized times.

Credits and debits are stored in the data structure but are only an accounting device.
> In order to keep track of saved or borrowed credits, it is generally convenient to
> store them in the data structure. Regions of the structure containing credits are
> unusually hard to access or update (the credits saved are there to pay for extra work);
> regions containing "debits" are unusually easy to access or update. It is important to
> realize that this is only an accounting device; the programs that actually manipulate
> the data structure contain no mention of credits or debits.

Stack in the banker's framework: two credits per operation, invariant credits = stacked items.
> We can
> cast our analysis of a stack in the banker’s framework by allocating two credits per
> operation. The stack manipulation maintains the invariant that the number of saved
> credits equals the number of stacked items.

The physicist's view: definition of potential function and of amortized time (symbols are lost in the extracted text; the paper's formula is t + Phi(D') - Phi(D) with t the actual time).
> Our second view of amortization is that of the physicist. We define a potential
> function d that maps any configuration D of the data structure into a real number
> (D) called the potential of D. We define the amortized time of an operation to be
> +(D’)-(D), where is the actual time of the operation and D and D’ are the
> configurations of the data structure before and after the operation, respectively.

Telescoping result: total actual time = total amortized time plus net decrease in potential.
> That is, the total time of the operations equals the sum of their amortized
> times plus the net decrease in potential from the initial to the final configuration.

Freedom to choose Phi; when it starts at zero and stays nonnegative, total amortized time bounds total time; this is the banker's view with no borrowing (the stated relation between credits and potential).
> We are free to choose the potential function in any way we wish; the more astute
> the choice, the more informative the amortized times will be. In most cases of interest,
> the initial potential is zero and the potential is always nonnegative. In such a situation
> the total amortized time is an upper bound on the total time. (This corresponds to
> the banker’s view of amortization with no borrowing.)

Attribution of the physicist's view to Sleator, and the stack potential = number of items.
> The physicist’s view of amortization was proposed by D. Sleator (private communication).

Stack potential in the physicist's view (the amortized-time formula is garbled in the extraction).
> the potential of a stack to be the number of items it contains. Then a stack operation

Stack conclusion: Phi_0 = 0 and Phi >= 0 give at most 2m pushes and pops.
> always nonnegative, so rn operations take at most 2m pushes and pops.

The two views are equivalent; the physicist's handles fractions, the banker's is concrete.
> The banker’s and physicist’s views of amortization are entirely equivalent; we can
> choose whichever view gives us more intuition about the problem at hand. It is perhaps
> more natural to deal with fractional amounts of time using the physicist’s view, whereas
> the banker’s view is more concrete, but both will yield the same bounds.

Move-to-front list: potential = number of inversions relative to another algorithm (physicist's view).
> Define the potential of MTF’s list to be the number of inversions in MTF’s
> list with respect to A’s list, where an inversion is a pair of items whose order is different
> in the two lists. The potential is initially zero and always nonnegative.

Red-black (balanced binary) tree insertion analysed with credits stored at black nodes (banker's view).
> We maintain the invariant that every black node contains either 0, 1, or 2 credits,
> depending on whether it has one red child, no red children, or two red children,
> respectively.

Union-find with union by size and path compression: bound uses debits as well as credits.
> Tarjan [29] derived an O(ma(m, n)) bound for m operations starting
> with n singletons, assuming m =12(n). Here a is a functional inverse of Ackermann’s
> function. Tarjan’s proof is a complicated amortized analysis that uses debits as well
> as credits.

Union-find proof is available in the banker's framework elsewhere.
> For a version of the proof in the banker’s framework see [32].

Skew heap analysis: credit invariant on heavy right children.
> We maintain the invariant that every heavy right child
> has a credit.

Splay tree potential: sum over nodes of log of subtree weight; amortized access O(log n).
> The amortized time of an access in an n-node splay tree is O(log n). To prove
> this, we define the potential of a splay tree to be the sum over all internal nodes x of
> log w(x), where w(x) is the weight of x, defined to be the number of (internal node)
> descendants of x, including x itself.

Contents:
- Section 1 (Introduction): defines "amortize" by analogy with a sinking fund; motivates amortization by sequences of operations; gives the push/pop stack example (m operations, at most 2m primitive steps although one operation may cost m).
- Section 2, banker's view: credits as coins, allocated credits = amortized time; start with no credits, carry over unused ones; optional borrowing (debits) repaid by the end; credits stored in the structure as an accounting device only; stack analysis with two credits per operation and invariant "saved credits = stacked items".
- Section 2, physicist's view: potential function Phi on configurations; amortized time = actual time + Phi(D') - Phi(D); the sum identity (sum of t_i = sum of a_i + Phi_0 - Phi_m), i.e. telescoping, given in display form (garbled in the extracted text, so not quoted); if Phi_0 = 0 and Phi >= 0 the total amortized time bounds the total time; stated to correspond to the banker's view without borrowing; the two views are "entirely equivalent". Stack potential = number of items, amortized time 2 per operation.
- The words "banker's" and "physicist's" both appear in the paper (the physicist's view is credited to D. Sleator, private communication). The paper does not use the words "accounting method" or "aggregate".
- Section 3 examples: move-to-front list update (potential = inversions vs. an arbitrary algorithm, amortized MTF time at most four times A's actual time); red-black / balanced binary tree insertion (banker's view, credits on black nodes, O(n + m) total); union-find with union by size and path compression (O(m alpha(m,n)), proof uses debits as well as credits, only mentioned, not given).
- Section 4 self-adjusting structures: skew heaps (amortized O(log n), invariant that heavy right children have a credit); splay trees (potential = sum over internal nodes of log w(x), amortized access O(log n)).
- Not present: no dynamic table / array-doubling example (the paper's "dynamic table" means a table kept as a balanced search tree under insertions and deletions); no queue example; no binary counter example; no formal proof for splay or union-find, only statement of potential or the fact that debits and credits are used.

## Jeff Erickson, Algorithms, Lecture 9: Amortized Analysis
URL: https://jeffe.cs.illinois.edu/teaching/algorithms/notes/09-amortize.pdf
Version: Lecture 9: Amortized Analysis [Fa'13], copyright 2018 Jeff Erickson, CC BY-NC-SA 4.0 (fetched text)

Potential method as a physics metaphor: prepaid work stored as a function of the whole data structure.
> The most powerful method (and the hardest to use) builds on a physics metaphor of ‘potential
> energy’. Instead of associating costs or taxes with particular operations or pieces of the data
> structure, we represent prepaid work as potential that can be spent on later operations. The
> potential is a function of the entire data structure.

Definition of the potential method: amortized cost = actual cost plus the increase in potential (Erickson writes a_i for the topic's c-hat_i).
> Let Di denote our data structure after i operations have been performed, and let Φi denote
> its potential. Let ci denote the actual cost of the ith operation (which changes Di−1 into Di ).
> Then the amortized cost of the ith operation, denoted ai , is defined to be the actual cost plus the
> increase in potential:
> ai = ci + Φi − Φi−1

Validity condition on the potential function and why total actual cost is bounded by total amortized cost.
> A potential function is valid if Φi − Φ0 ≥ 0 for all i. If the potential function is valid, then the
> total actual cost of any sequence of operations is always less than the total amortized cost:

Binary counter example: Phi_i = number of 1 bits, validity check, and amortized cost of Increment.
> For our binary counter example, we can define the potential Φi after the ith Increment to
> be the number of bits with value 1. Initially, all bits are equal to zero, so Φ0 = 0, and clearly
> Φi > 0 for all i > 0, so this is a valid potential function. We can describe both the actual cost of
> an Increment and the change in potential in terms of the number of bits set to 1 and reset to 0.
> ci = #bits changed from 0 to 1 + #bits changed from 1 to 0
> Φi − Φi−1 = #bits changed from 0 to 1 − #bits changed from 1 to 0
> Thus, the amortized cost of the ith Increment is
> ai = ci + Φi − Φi−1 = 2 × #bits changed from 0 to 1
> Since Increment changes only one bit from 0 to 1, the amortized cost Increment is 2.

One-line summary of the method with the requirements on Phi (starts at zero, never negative).
> The Potential Method. Define a potential function for the data structure that is
> initially equal to zero and is always non-negative. The amortized cost of an operation
> is its actual cost plus the change in potential.

Potential versus taxation (accounting) method: potential argues globally.
> For this particular example, the potential is precisely the total unspent taxes paid using the
> taxation method, so it should be no surprise that we obtain precisely the same amortized cost.
> In general, however, there may be no natural way to interpret change in potential as “taxes” or
> “charges”. Taxation and charging are useful when there is a convenient way to distribute costs to
> specific steps in the algorithm or components of the data structure. Potential arguments allow us
> to argue more globally when a local distribution is difficult or impossible.

How to choose a potential function: rises a little on cheap operations, falls a lot on expensive ones; no general technique.
> Different potential functions can lead to different amortized time bounds. The trick to using
> the potential method is to come up with the best possible potential function. A good potential
> function goes up a little during any cheap/fast operation, and goes down a lot during any
> expensive/slow operation. Unfortunately, there is no general technique for finding good potential
> functions, except to play around with the data structure and try lots of possibilities (most of
> which won’t work).

Why a plain counter fails under both increment and decrement (the thrashing analogue).
> A standard binary counter won’t work, even in an amortized sense; if we alternate between 2k
> and 2k − 1, every operation costs Θ(k) time.

Increment/decrement counter with potential equal to the number of 1 bits in P and N.
> We can get even better amortized time bounds using the potential method. Define the
> potential Φi to be the number of 1-bits in both P and N after i operations. Just as before, we have
> ci = #bits changed from 0 to 1 + #bits changed from 1 to 0
> Φi − Φi−1 = #bits changed from 0 to 1 − #bits changed from 1 to 0
> =⇒
> ai = 2 × #bits changed from 0 to 1
> Since each operation changes at most one bit to 1, the ith operation has amortized cost ai ≤ 2.

Exercise 9: hash table with grow at 3/4 full (double) and shrink at under 1/4 full (halve).
> 9. Suppose we can insert or delete an element into a hash table in O(1) time. In order to
> ensure that our hash table is always big enough, without wasting a lot of memory, we will
> use the following global rebuilding rules:
> • After an insertion, if the table is more than 3/4 full, we allocate a new table twice as
> big as our current table, insert everything into the new table, and then free the old
> table.
> • After a deletion, if the table is less than 1/4 full, we allocate a new table half as big as
> our current table, insert everything into the new table, and then free the old table.
> Show that for any sequence of insertions and deletions, the amortized time per operation
> is still O(1). [Hint: Do not use potential functions.]

Note: the lecture has no multipop-stack example and says nothing on splay trees, union-find, Fibonacci heaps or the term "banker's method"; it names the accounting method "taxation" and the potential method a "physics metaphor". Exercise 9 gives the 3/4 and 1/4 thresholds but hints not to use potentials.

Contents:
- 9.1 Incrementing a Binary Counter (Increment algorithm, Theta(log n) worst case)
- 9.2 Counting from 0 to n
  - 9.2.1 Summation
  - 9.2.2 Taxation (accounting method)
  - 9.2.3 Charging
  - 9.2.4 Potential (potential method, validity, counter potential)
- 9.3 Incrementing and Decrementing (pair (P, N) counter, taxation and potential bounds)
- 9.4 Gray Codes
- 9.5 Generalities and Warnings
- Exercises 1-14 (incl. 9: hash table 3/4 grow, 1/4 shrink; 10: Fibonacci-size table; 11: queue from two stacks)

## Lecture 7: Amortized Analysis (CMU 15-451, Avrim Blum)
URL: https://www.cs.cmu.edu/~avrim/451f11/lectures/lect0922.pdf
Version: CMU 15-451 Fall 2011 lecture notes (file lect0922.pdf), Lecture 7, sections 7.1-7.7, pp. 35-40

Supports: definition of amortized cost as total cost divided by n.

> Definition 7.1 The amortized cost per operation for a sequence of n operations is the total
> cost of the operations divided by n.

Supports: the cost model for the array stack and the doubling bound (resize cost 1+2+4+..., total < 3n, amortized < 3).

> Answer 2: This is much better. Now, in any sequence of n operations, the total cost for resizing
> is 1 + 2 + 4 + 8 + . . . + 2i for some 2i < n (if all operations are pushes then 2i will be the largest
> power of 2 less than n). This sum is at most 2n − 1. Adding in the additional cost of n for
> inserting/removing, we get a total cost < 3n, and so our amortized cost per operation is < 3.

Supports: the bank/piggy-bank view of table doubling (charge $3 per push, $L available when growing from L to 2L).

> Here is another way to analyze the process of doubling the array in the above example. Say that
> every time we perform a push operation, we pay $1 to perform it, and we put $2 into a piggy bank.
> So, our out-of-pocket cost per push is $3. Any time we need to double the array, from size L to 2L,
> we pay for it using money in the bank.

Supports: the potential as a guarantee on the bank, its value for the doubling table, and the need to show it never goes negative.

> The piggy bank is also called a potential function, since it is like potential energy that you can use later. The
> potential function is a guarantee on the amount of money in the bank. In the case above, the
> potential is twice the number of elements in the array after the midpoint. Note that it is very
> important in this analysis to prove that the bank account doesn’t go negative.

Supports: the formal definition of a potential function and its conditions (function of state, non-negative, starts at 0).

> Definition 7.2 A potential function is a function of the state of a system, that generally should
> be non-negative and start at 0, and is used to smooth out analysis of some algorithm or process.

Supports: the telescoping argument (actual cost plus change in potential at most c gives total at most cn).

> Observation: If the potential is non-negative and starts at 0, and at each step the actual cost
> of our algorithm plus the change in potential is at most c, then after n steps our total cost is at
> most cn. That is just the same thing we were saying about the piggy bank: our total cost for the
> n operations is just our total out of pocket cost minus the amount in the bank at the end.

Supports: nonzero starting potential (seeding the bank).

> Sometimes one may need in an analysis to “seed” the bank account with some initial positive
> amount for everything to go through. In that case, the kind of statement one would show is that
> the total cost for n operations is at most cn plus the initial seed amount.

Supports: example of choosing Phi for the binary counter (number of 1-bits).

> Equivalently, what we are doing in this proof is using a potential function that is equal to the
> number of 1-bits in the current count. Notice how the bank-account/potential-function allows us
> to smooth out our payments, making the cost easier to analyze.

Supports: refined amortized costs for push and pop on the stack table (pop is negative).

> In fact, if you think about it, we can pay for pop operations using money from the bank too, and even have $1
> left over. So as a more refined analysis, our amortized cost is $3 per push and $−1 per successful pop (a pop from a
> nonempty stack).

Supports: amortized analysis is not average-case analysis.

> Note that this is different from our usual notion of “average case analysis”: we
> are not making any assumptions about the inputs being chosen at random, we are just averaging
> over time.

Contents:
- 7.1-7.2: motivation (expensive operations only after many cheap ones), Definition 7.1 amortized cost = total/n, example 200/101 < 2.
- 7.3: array stack with a cost model (insert 1, remove 1, resize = elements moved); grow-by-1 costs n(n+1)/2 total; doubling gives total < 3n, amortized < 3.
- 7.4: piggy bank = potential function; Definition 7.2; the observation that cost + change in potential <= c gives total <= cn; seeding; footnote on pop (-$1 amortized). Potential for the doubling table described as twice the number of elements past the midpoint. No coverage of shrinking/contracting the table, no 1/2 vs 1/4 thresholds, no explicit load factor or formula c-hat = c + Delta Phi in this text.
- 7.5: binary counter, amortized cost at most 2, proof 1 (bank) equals potential = number of 1-bits, proof 2 (aggregate count of flips per bit).
- 7.6: counter where flipping bit k costs 2^k, amortized O(log n).
- 7.7: array-of-sorted-arrays dictionary (insert cost 1+2+4..., same as 2^k counter), amortized O(log n) insert, O(log^2 n) search.

## Amortized Analysis, Part 2: Union-Find (Waterloo CS466)
URL: https://student.cs.uwaterloo.ca/~cs466/Old_courses/F14/4-AmortizedAnalysis-part2.pdf
Version: University of Waterloo CS466, Fall 2014 offering (Old_courses/F14), file 4-AmortizedAnalysis-part2.pdf, pp. 1-7

Supports: the two Union-Find operations.

> UnionFind Data Structure: Maintains a collection of disjoint sets subject to the following two
> operations:
> 1. Union(𝐴, 𝐵): Replace two sets 𝐴 and 𝐵 with one new set 𝐴 ∪ 𝐵.
> 2. Find(𝑒): Return the subset that contains 𝑒.

Supports: attribution of the first precise analysis of union by rank with path compression to Tarjan 1975.

> Note that this data structure is very easy to implement. But the analysis of its performance is
> exceedingly difficult. The data structure was first described in (Galler, Bernard A.; Fischer,
> Michael J., An improved equivalence algorithm, Communications of the ACM 7 (5): 301–303,
> 1964). But the proof of the first precise analysis appeared in (Tarjan, Robert Endre. Efficiency of
> a Good But Not Linear Set Union Algorithm. Journal of the ACM 22 (2): 215–225. 1975). Here we
> give the main theorem without proof.

Supports: the Ackermann function definition.

> The Ackermann function is defined on 𝑚 ≥ 0 and 𝑛 ≥ 1.

Supports: the inverse-Ackermann bound statement and the definition of alpha.

> Theorem: Using the disjoint-set forest with union by rank and path compression heuristics, 𝑚
> operations on 𝑛 elements takes 𝑂(𝑚 ⋅ 𝛼 (𝑚, 𝑛)) time. Here
> 𝑚
> 𝛼 (𝑚, 𝑛) = min {𝑘: 𝐴 (𝑘, ⌊ ⌋) ≥ log 2 𝑛}
> 𝑛
> is the inverse Ackermann function.

Supports: alpha is nearly constant in practice.

> Essentially, 𝛼(𝑚, 𝑛) ≤ 4 for most practical cases (when 𝑛 ≤ 265533 ). So, 𝛼 (𝑚, 𝑛) is almost a
> constant.

Supports: the weaker O(m log* n) theorem proved in the notes.

> Theorem: Using the disjoint-set forest with union by rank and path compression heuristics, 𝑚
> operations on 𝑛 elements takes 𝑂(𝑚 ⋅ log ∗ 𝑛 ) time.

Supports: the charging (accounting-style) argument used in the proof.

> For each 𝑣 on this path, we charge the cost 𝑂(1) in two different ways:

Supports: smaller-into-larger union (data structure II) amortized O(log n) union.

> Examine the 𝑁 − 1 union operations that are responsible to a set with size 𝑁. Whenever an
> element’s set ID is rewritten, its set’s size is at least doubled. So, an element’s set ID is rewritten
> by at most log 2 𝑁 times.

Contents:
- Motivation and the Union-Find interface (Union, Find), applications (networks, pixels, MST), MST cost O(m log m) + 2m Finds + n Unions.
- Data structures I-V: array ids (Find O(1), Union O(|A|), O(n^2) worst case); size-array smaller-into-larger (amortized O(log n) union); disjoint-set forest (Union O(1), Find O(n)); union by rank (rank r node has >= 2^r descendants, Find O(log n)); union by rank plus path compression.
- Attribution: Galler and Fischer 1964 first described it; Tarjan 1975 gave the first precise analysis.
- Ackermann function A(m,n) (three cases), theorem O(m alpha(m,n)) with alpha(m,n) = min{k : A(k, floor(m/n)) >= log2 n}, alpha <= 4 for practical n.
- Weaker proof of O(m log* n): tower function t(k), log*, Claims 1-2 (rank increases up the tree; at most n/2^r nodes of rank r), grouping by log*(rank), charging cases, lemma sum t(g(v)) <= n log* n.
- Nothing on dynamic tables, doubling/halving, load factor, or the potential function formalism; this source is used only for the union-find bound.

## Self-Adjusting Binary Search Trees
URL: https://www.cs.cmu.edu/~sleator/papers/self-adjusting.pdf
Version: Sleator and Tarjan, JACM 32(3), 1985 (pp. 652-686); text extracted from the author-hosted PDF (OCR artifacts such as "d’" for the potential symbol are preserved in the quotes)

Names the technique: a potential function is used to carry out the amortization.

> We shall analyze the amortized complexity of splaying by using a potential
> function [3 1,351 to carry out the amortization. The idea is to assign to each possible
> configuration of the data structure a real number called its potential and to define

Total actual time equals total amortized time plus the net potential decrease; the amortized total bounds the actual total if the final potential is at least the initial one.

> That is, the total actual
> time equals the total amortized time plus the net decrease in potential from the
> initial to the final configuration. If the final potential is no less than the initial
> potential, then the total amortized time is an upper bound on the total actual time.

Splay-tree potential: weights, size, rank (binary log), and potential as the sum of ranks.

> To define the potential of a splay tree, we assume that each item i has a positive
> weight w(i), whose value is arbitrary but fixed. We define the size s(x) of a node x
> in the tree to be the sum of the individual weights of all items in the subtree rooted
> at x. We define the rank r(x) of node x to be log s(x).’ Finally, we define the
> potential of the tree to be the sum of the ranks of all its nodes.

Access Lemma statement, with the 3(r(t) - r(x)) + 1 bound.

> LEMMA1 (ACCESSLEMMA). The amortized time to splay a tree with root t at a
> node x is at most 3( r(t) - r(x)) + 1 = O(log($(t)/s(x))).

The proof sums per-step amortized costs, which telescope.

> The lemma follows by summing the amortized time estimates for all the splaying
> steps, since the sum telescopes to yield an estimate of at most 3(r’(x)- r(x))+ 1

Contents:
- Defines amortized time as actual time plus the change in potential, and shows the sum over m operations telescopes to actual total = amortized total + net potential drop.
- Splay-tree potential: item weights w(i), node size s(x), rank r(x) = log s(x), tree potential = sum of ranks of all nodes.
- Access Lemma: amortized time to splay at x in a tree with root t is at most 3(r(t) - r(x)) + 1; proof by cases (zig, zig-zig, zig-zag), each step costing at most 3(r'(x) - r(x)) (plus 1 for the single-rotation case), then telescoping.
- Uses the lemma with different weight choices to get the balance, static optimality and other theorems.

## Fibonacci Heaps (Kleinberg-Tardos lecture slides by Kevin Wayne)
URL: https://www.cs.princeton.edu/~wayne/kleinberg-tardos/pdf/FibonacciHeaps.pdf
Version: Lecture slides, last updated 7/25/17 (secondary source on Fredman and Tarjan's Fibonacci heaps, not the original paper)

Potential function: trees in the root list plus twice the marked nodes.

> Potential function.
> Φ(H) = trees(H) + 2 ⋅ marks(H)

Insert costs O(1) amortized because it adds one tree and marks nothing.

> Actual cost. ci = O(1).
> Change in potential. ∆Φ = Φ(Hi) – Φ(Hi–1) = +1.

Extract-min is O(log n) amortized because the potential drop pays for consolidation.

> Change in potential. ∆Φ ≤ rank(Hʹ) + 1 – trees(H).

Decrease-key is O(1) amortized because each cut unmarks a node.

> Change in potential. ∆Φ = O(1) – c.

Meld leaves the potential unchanged.

> Change in potential. ∆Φ = 0.
> Amortized cost. ĉi = ci + ∆Φ = O(1).

Summary of amortized bounds.

> Delete-min.
> O(rank(H)) amortized.
> Decrease-key. O(1) amortized.

Contents:
- Amortized cost of operation i defined as ĉi = ci + ∆Φ.
- Potential Φ(H) = trees(H) + 2·marks(H); example heap with 5 trees and 3 marks has Φ = 11.
- Insert: actual O(1), ∆Φ = +1, amortized O(1).
- Extract-min: actual O(rank(H) + trees(H)); ∆Φ ≤ rank(H') + 1 - trees(H); amortized O(log n) using rank(H) = O(log n).
- Decrease-key: c cuts, ∆Φ ≤ 4 - c (each cut except the first unmarks a node; the last may mark one), amortized O(1).
- Meld: ∆Φ = 0, amortized O(1). Delete = decrease-key to -∞ then extract-min, amortized O(rank(H)) = O(log n).

## Purely Functional Data Structures (Okasaki, PhD thesis)
URL: https://www.cs.cmu.edu/~rwh/students/okasaki.pdf
Version: Chris Okasaki, Carnegie Mellon University technical report CMU-CS-96-177, September 1996 (PhD thesis); Chapter 3, "Amortization and Persistence via Lazy Evaluation".

Supports: the physicist's and banker's methods are the two traditional amortization techniques, and the text cites Tarjan 1985 as describing them (it says "describes", not "introduced").

> Tarjan [Tar85] describes two techniques for analyzing ephemeral amortized data structures:
> the banker’s method and the physicist’s method.

Supports: the physicist's method works with a potential that is initially zero, non-negative, and a lower bound on accumulated savings.

> is typically chosen so that the potential is initially zero and is always non-negative. Then, the potential represents a lower bound on the accumulated savings.

Supports: the two methods are interconvertible (credits summed to a potential; potential placed on the root) and equivalent, citing Tarjan 1985 and Schoenmakers 1992.

> Similarly, we can convert the physicist’s method
> to the banker’s method by converting potential to credits, and placing all credits on the root.

Supports: equivalence of the methods and the practical preference for the physicist's method.

> but the two methods are in fact equivalent [Tar85, Sch92]. The physicist’s method is
> usually simpler, but it is occasionally convenient to take locations into account.

Supports: the potential-vs-persistence caveat (the potential argument needs each output used as the next input only once).

> The banker’s method requires that no credit be spent more than once, while the physicist’s method requires that the output of one operation be the input of the next operation (or,
> more generally, that no output be used as input more than once).

Supports: the root cause of the failure under persistence (savings can be spent only once).

> Both these failures reflect the inherent weakness of any accounting system based on accumulated savings — that savings can only be spent once.

Supports: the chapter's framing that standard amortization is for ephemeral structures.

> Unfortunately, standard techniques
> for amortization apply only to ephemeral data structures, and so are unsuitable for designing
> or analyzing functional data structures, which are automatically persistent.

Supports: the lazy variant of the physicist's method (potential bounds accumulated debt rather than savings).

> Like the banker’s method, the physicist’s method can also be adapted to work with accumulated
> debt rather than accumulated savings.

Contents (amortization chapter only):
- Chapter 3, Amortization and Persistence via Lazy Evaluation: motivates amortization for functional data structures and reviews the two traditional techniques.
- 3.1 Traditional Amortization: accumulated amortized vs actual cost, "savings", expensive/cheap operations; banker's method (credits on locations, credit invariant); physicist's method (potential function, telescoping sum); conversion between the two.
- 3.1.1 Example: Queues: front/rear list queue analysed with both methods, giving O(1) amortized.
- 3.2 Persistence: The Problem of Multiple Futures: the same queue used persistently costs n^2 + n for n tails, so both proofs break; 3.2.1 Execution Traces and Logical Time.
- 3.3 Reconciling Amortization and Persistence: 3.3.1 The Role of Lazy Evaluation; 3.3.2 A Framework for Analyzing Lazy Data Structures.
- 3.4 The Banker's Method (debits instead of credits): 3.4.1 Justifying the Banker's Method; 3.4.2 Example: Queues.
- 3.5 The Physicist's Method (potential as upper bound on accumulated debt): 3.5.1 Example: Queues; 3.5.2 Example: Bottom-Up Mergesort with Sharing.
- 3.6 Related Work: attributions (Tarjan, Schoenmakers) and history.

## Simpler Analyses of Union-Find (Lambert, Huang, Nie, Peng)
URL: https://arxiv.org/pdf/2308.09021
Version: arXiv:2308.09021v1 [cs.DS], 17 August 2023 (dated 21 August 2023).

Supports: the paper's goal, proving the union-find amortized bounds (log log n, log* n, log** n, inverse Ackermann) with potential functions.

> We analyze union-find using potential functions motivated by continuous algorithms, and
> give alternate proofs of the O(log log n), O(log∗ n), O(log∗∗ n), and O(α(n)) amortized cost
> upper bounds.

Supports: the potential used for the O(log log n) bound (square root of subtree size, summed over nodes).

> Let each node’s
> potential be the square root of its size, i.e., the size of the subtree rooted from it.

Supports: why total potential growth is bounded by O(n) over the unions.

> The overall
> potential increase is O(n) because the node sizes increase geometrically along any tree path.

Supports: the log(Size(p)) potential that precedes this work in analyses of tree-based structures (self-adjusting trees and heaps).

> the log(Size(p)) potential function (where Size(p) is the size of the subtree rooted at p) that’s present in analyses
> of many tree-based data structures [ST85, FSST86, ST86]

Supports: attribution of the first study of the path-compression version to Tarjan 1975.

> The most efficient version of union-find, first studied by Tarjan [Tar75], rely on two manipulations of parent pointers: path compression

Supports: the claim about prior proofs (they define the Ackermann function explicitly; the new proofs do not).

> These proofs differ
> from existing proofs in that they no longer require explicit definitions of the Ackermann function.

Supports: the authors' own assessment of which new proofs are simpler than the Ackermann-based ones.

> only the O(log log n) and O(log∗ n)
> proofs (Sections 3 and 4 respectively) are significantly simpler than proofs via the Ackermann
> function.

Contents:
- Abstract: potential-function proofs for O(log log n), O(log* n), O(log** n), O(alpha(n)); sketch of the sqrt(Size) argument.
- 1 Introduction: union-find background, why the log* and alpha bounds are hard to teach, the Size(p)-based potentials, roadmap. (No mention of CLRS or any textbook in the text.)
- 2 Preliminaries: 2.1 Union-Find (rooted forest, union-by-size, path compression); potential function analysis framework (Lemmas 4 and 5: potential nonnegative, monotone in Size, increases only in unions).
- 3 O(log log n) analysis: potential sqrt(Size(p)).
- 4 O(log* n) analysis: potential Size(p)/(3 + log Size(p))^2.
- 5 O(log** n) bound and beyond, using the iterated-log characterization of inverse Ackermann (level-2 potential, higher levels).
- 6 O(alpha(n)) proofs from the classical recursive Ackermann definition (potential sum over levels, using rank).
- 7 Conclusion and open question (potentials depending only on Size(p) for log** n or better).
- References and Appendix A (Ackermann function and its alternate characterizations; Lemma 6).

