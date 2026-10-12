# Sources: Aggregate and accounting methods

Checked 2026-10-12. Every source was fetched raw with scripts/sources.mjs; quotes are proven by `sources.mjs check`. Gaps found: no opened source has a worked multipop stack (the stack cost model in CMU 15-451 and the MultiPull exercise in Erickson are the nearest). CLRS and Tarjan 1985 could not be opened and are not quoted. Added by the fact-check (2026-10-12): Okasaki's thesis, which credits the "banker's method" and "physicist's method" to Tarjan 1985 (no opened source uses "banker's view"), and further quotes from Erickson and CMU for claims the outline left to the fact-check.

## Jeff Erickson, Algorithms, Lecture 9: Amortized Analysis
URL: https://jeffe.cs.illinois.edu/teaching/algorithms/notes/09-amortize.pdf
Version: Lecture 9 [Fa'13] (PDF footer: (c) 2018 Jeff Erickson, CC BY-NC-SA 4.0)

Binary counter, aggregate (the author calls it "Summation"):

> B[0] does flip in every iteration, but
> B[1] only flips every other iteration, B[2] flips every 4th iteration, and in general, B[i] flips every
> 2i th iteration. Because we start with an array full of 0's, a sequence of n Increments flips each
> bit B[i] exactly bn/2i c times.

> (More precisely, the number of flips is exactly 2n − #1(n), where #1(n) is the number of 1 bits
> in the binary representation of n.) Thus, on average, each call to Increment flips just less than
> two bits, and therefore runs in constant time.

> If we only use the worst-case running time for each Increment, we get
> an upper bound of O(n log n) on the total running time.

> Although this bound is correct, we can
> do better; in fact, the total running time is only Θ(n).

> Many (perhaps even all) of
> these methods are logically equivalent, but different formulations are more natural for different
> problems.

No probability; definition of amortization:

> This sense of "on average" is quite different from the averaging we consider with randomized
> algorithms. There is no probability involved; we are averaging over a sequence of operations, not
> the possible running times of a single operation.

> This averaging idea is called amortization—the
> amortized time for each Increment is O(1).

> Thus, the worst-case cost of Increment is O(log n),
> but the amortized cost is only O(1).

> Amortization is a sleazy clever trick used by
> accountants to average large one-time costs over long periods of time

> Most textbooks call this particular technique "the aggregate method", or "aggregate analysis",
> but these are just fancy names for computing the total cost of all operations and then dividing by
> the number of operations.

> The Summation Method. Let T (n) be the worst-case running time for a sequence
> of n operations. The amortized time for each operation is T (n)/n.

Accounting / taxation method and credit:

> A second method we can use to derive amortized bounds is called either the accounting method
> or the taxation method.

> Instead of paying for each bit flip when it happens, the Increment Revenue Service charges a
> two-dollar increment tax whenever we want to set a bit from zero to one. One of those dollars is
> spent changing the bit from zero to one; the other is stored away as credit until we need to reset
> the same bit to zero.

> The key point here is that we always have enough credit saved up to pay for

> The amortized cost of an Increment is the total tax it incurs, which is
> exactly 2 dollars, since each Increment changes just one bit from 0 to 1.

> Taxation Method 1. Certain steps in the algorithm charge you taxes, so that the
> total cost incurred by the algorithm is never more than the total tax you pay.

> In both of the taxation methods, our task as algorithm analysts is to come up with an
> appropriate 'tax schedule'. Different 'schedules' can result in different amortized time bounds.
> The tightest bounds are obtained from tax schedules that just barely stay in the black.

Charging cheap vs expensive operations, valid for any sequence:

> By charging the cost of some operations
> to earlier operations, we are overestimating the total cost of any sequence of operations, since we
> pay for some charges from future operations that may never actually occur.

> So instead of paying for k bit-flips, we pay for at most two: one for
> actually setting a bit, plus at most one charge from the future for clearing that same bit.

Relation to potential (credit never negative):

> A potential function is valid if Φi − Φ0 ≥ 0 for all i. If the potential function is valid, then the
> total actual cost of any sequence of operations is always less than the total amortized cost

> For this particular example, the potential is precisely the total unspent taxes paid using the
> taxation method, so it should be no surprise that we obtain precisely the same amortized cost.

> Taxation and charging are useful when there is a convenient way to distribute costs to
> specific steps in the algorithm or components of the data structure.

Caveats:

> A standard binary counter won't work, even in an amortized sense; if we alternate between 2k

> It's also important to remember that amortized time bounds are not unique.

> you should remember that amortization can be applied
> to any sequence of numbers.

Added by the fact-check: Increment's cost, charging, increment and decrement, Gray codes:

> If the first k bits are all 1s, then
> Increment takes Θ(k) time.

> suppose we charge the cost of clearing a bit (changing
> its value from 1 to 0) to the previous operation that sets that bit

> A standard binary counter won’t work, even in an amortized sense; if we alternate between 2k
> and 2k − 1, every operation costs Θ(k) time.

> use the aggregate method here, because we don’t know what the sequence of operations looks
> like.

> Since each operation changes at most one bit to 1, the ith operation has amortized cost ai ≤ 2.

> Unfortunately, the naïve algorithm to
> find the single bit to flip still requires Θ(log n) time in the worst case.

> maintains a Gray code counter in constant worst-case time per
> increment!

> But wait — this algorithm only handles increments; what if we also want to decrement?

Added by the fact-check: exercises cited by number (1(c), 6, 11(a)):

> (c) f (k) = n if k is a power of 2, and f (k) = 1 otherwise.

> Prove that in any intermixed sequence of Push and MultiPull operations, the
> amortized cost of each operation is O(1)

> MultiPush(x, k): Insert k copies of x into the back of the queue.

> Such a sequence implies that the amortized cost of each operation
> is Ω(n).

> (c) Describe a data structure that supports arbitrary intermixed sequences of MultiPush
> and MultiPull operations in O(1) amortized cost per operation.

> (a) Describe how to implement a queue using two stacks and O(1) additional memory,
> so that the amortized time for any enqueue or dequeue operation is O(1).

Not covered by this source: dynamic-array doubling (only a hash-table rebuild exercise and an extendable-array exercise, no worked solution), multipop stack (only exercises: ordered stack, MultiPull queue, GoodView stack), the names "banker's view" / "physicist's view" (the notes use "taxation", "charging", "potential"; no attribution of names to people).

Contents:
- Epigraphs (Chaucer, Wimpy, Gasparini, Kintz) on paying later / averaging
- 9.1 Incrementing a binary counter: Increment algorithm, Theta(k) when first k bits are 1, Theta(log n) worst case
- 9.2 Counting from 0 to n: O(n log n) naive bound versus Theta(n) true total
- 9.2.1 Summation (aggregate) method: bit B[i] flips floor(n/2^i) times, total < 2n, exactly 2n - #1(n); definition of amortized time T(n)/n; no probability involved
- 9.2.2 Taxation (accounting) method: 2-dollar tax per 0-to-1 flip, credit stored on the bit; Taxation Method 1 (steps charge) and Method 2 (each bit B[i] charges 2^-i per increment, total 2); tax schedules and tight bounds
- 9.2.3 Charging method: charge clearing a bit to the earlier setting; amortized cost at most two flips; block-stack picture
- 9.2.4 Potential method: potential = number of 1 bits, a_i = c_i + Phi_i - Phi_{i-1}, valid potential, amortized cost 2; comparison with taxation
- 9.3 Incrementing and decrementing: double binary counter (P, N), taxation bound 4, potential bound 2; aggregate method not usable without knowing the sequence
- 9.4 Gray codes: Ehrlich's loopless Gray-code increment, O(1) worst case
- 9.5 Generalities and warnings: amortization applies to any sequence of numbers; bounds not unique (Fold, Spindle, Mutilate)
- Exercises 1-16: amortized costs of given f(k), SomethingElse counter, extendable array, ordered stack, multistack, MultiPull/MultiPush queues, Decimate, GoodView, hash-table rebuilding, queue from two stacks, quack, radmuque, Nudge counters, Fibonacci fitstrings, doubly lazy counter

## CMU 15-451 Lecture 7: Amortized Analysis (Avrim Blum)
URL: https://www.cs.cmu.edu/~avrim/451f11/lectures/lect0922.pdf
Version: CMU 15-451 Fall 2011 lecture notes (lect0922.pdf), Lecture 7

> looking at the worst-case time per operation can be too
> pessimistic if the only way to produce an expensive operation is to “set it up” with a large number
> of cheap operations beforehand.

> A potential function is much like a bank account: if we can take our cheap
> operations (those whose cost is less than our bound) and put our savings from them in a bank
> account, use our savings to pay for expensive operations (those whose cost is greater than our
> bound), and somehow guarantee that our account will never go negative, then we will have proven
> an amortized bound for our procedure.

> Definition 7.1 The amortized cost per operation for a sequence of n operations is the total
> cost of the operations divided by n.

> if we have 100 operations at cost 1, followed by one operation at cost 100, the

> amortized cost per operation is 200/101 < 2.

> amortized analysis can give a much tighter bound on the true cost of
> using the data structure than a standard worst-case-per-operation bound.

> Cost model: Let’s say that inserting into the array costs 1, taking an element out of the array
> costs 1, and the cost of resizing the array is the number of elements moved.

> What if when we resize we just increase the size by 1? Is that a good idea?

> If our n operations consist of n pushes then we will incur a total cost
> 1 + 2 + 3 + 4 + . . . + n = n(n + 1)/2. That’s an amortized cost of (n + 1)/2 per operation.

> This sum is at most 2n − 1. Adding in the additional cost of n for
> inserting/removing, we get a total cost < 3n, and so our amortized cost per operation is < 3.

> every time we perform a push operation, we pay $1 to perform it, and we put $2 into a piggy bank.
> So, our out-of-pocket cost per push is $3.

> The reason is that after the last resizing, there were only L/2 elements in the
> array and so there must have been at least L/2 new pushes since then contributing $2 each.

> by spending $3 per operation, we were able to pay for all the operations plus possibly
> still have money left over in the bank. This means our amortized cost is at most 3.

> The piggy bank
> is also called a potential function, since it is like potential energy that you can use later.

> Note that it is very
> important in this analysis to prove that the bank account doesn’t go negative.

> if the
> bank account can slowly drift off to negative infinity, the whole proof breaks down.

> If the potential is non-negative and starts at 0, and at each step the actual cost
> of our algorithm plus the change in potential is at most c, then after n steps our total cost is at
> most cn.

> Sometimes one may need in an analysis to “seed” the bank account with some initial positive
> amount

> we
> are not making any assumptions about the inputs being chosen at random, we are just averaging
> over time.

> we can pay for pop operations using money from the bank too, and even have $1
> left over. So as a more refined analysis, our amortized cost is $3 per push and $−1 per successful pop

> In a sequence of n increments, the worst-case cost per increment is O(log n), since at worst we flip
> lg(n) + 1 bits. But, what is our amortized cost per increment? The answer is it is at most 2.

> Every time you flip 0 → 1, pay the actual cost of $1, plus put $1 into a piggy bank. So
> the total amount spent is $2.

> each increment has exactly one 0 → 1 flip. So, we just pay $2
> (amortized) per increment.

> using a potential function that is equal to the
> number of 1-bits in the current count.

> So, the total cost spent on flipping A[0] is n, the total
> cost spent flipping A[1] is at most n/2, the total cost flipping A[2] is at most n/4, etc. Summing
> these up, the total cost spent flipping all the positions in our n increments is at most 2n.

Added by the fact-check: the bank as a potential, and section 7.6:

> In the case above, the
> potential is twice the number of elements in the array after the midpoint.

> a single increment could cost as much as n (actually 2n − 1)

> So, the total cost is at most n(lg n + 1), which is O(log n) amortized per
> increment.

Fact-check warning: the footnote quoted above ("$3 per push and $−1 per successful pop") is word for word but **false** under the source's own cost model: push, push, pop, pop costs 1 + 2 + 1 + 1 = 5 against 3 + 3 − 1 − 1 = 4 (keys below the midpoint carry no saved money when popped). The topic does not use it.

Contents:
- 7.1 Overview: motivation (worst case per operation too pessimistic); potential function as bank account; concrete cost models, no asymptotic notation.
- 7.2 Introduction: Definition 7.1 amortized cost = total cost / n; example 100 cheap ops plus one cost-100 op gives 200/101 < 2; contrast with worst-case bound.
- 7.3 Example 1, stack as array: push/pop code, cost model (insert 1, remove 1, resize = elements moved); Q1 grow by 1 costs n(n+1)/2 total, (n+1)/2 amortized; Q2 doubling gives resize total at most 2n-1, total < 3n, amortized < 3 (aggregate argument).
- 7.4 Piggy banks and potential functions: $1 + $2 in bank per push, out-of-pocket $3; resize L to 2L paid by bank ($L available since at least L/2 pushes since last resize); bank must not go negative; Definition 7.2 potential function; Observation (actual cost + change in potential <= c gives total <= cn); seeding the bank; recap vs average-case analysis (no randomness); footnote 1 on pop (amortized $3 push, $-1 successful pop).
- 7.5 Example 2, binary counter: cost $1 per bit flip; worst case O(log n) per increment, amortized at most 2; Proof 1 (accounting: $1 on each 0->1 flip, potential = number of 1-bits); Proof 2 (aggregate: A[i] flips every 2^i-th time, total at most 2n).
- 7.6 Example 3, bit k costs 2^k to flip: single increment up to 2n-1, amortized O(log n), total at most n(lg n + 1) by Proof 2 style counting.
- 7.7 Example 4, amortized dictionary (arrays of size 2^i, merge like mergesort): lookup O(log^2 n), insert amortized O(log n) (Claim 7.1, reduces to the 2^k counter).

## Bags, Queues, and Stacks (Sedgewick & Wayne, Algorithms 4th ed. booksite)
URL: https://algs4.cs.princeton.edu/13stacks/
Version: Algorithms, 4th Edition booksite page 1.3 (Robert Sedgewick and Kevin Wayne, Princeton), as fetched 2026-10-12

Note: this booksite page has no numbered proposition and no "~3N array accesses" count; those are in the textbook itself, not on this page. What the page gives is the resize rules, the shrink exercise and its "why not one-half" question, and uses of "constant amortized".

Resize-up and resize-down rules (ResizingArrayStack.java):
> With a resizing array, we dynamically adjust the size of the array
> so that it is both sufficiently large to hold all of the items and not
> so large as to waste an excessive amount of space.
> We double the size of the array in push() if it is full;
> we halve the size of the array in pop() if it is less than
> one-quarter full.

Initial array and generic-array cast:
> public class ResizingArrayStack<Item> {
> Item[] a = new Item[1];

Dynamic shrinking exercise (the one-quarter rule and "why not one-half"):
> With the array implementations of stack and queue, we doubled the size
> of the array when it wasn't big enough to store the next element.

> If we perform a number of doubling operations, and then delete a lot
> of elements, we might end up with an array that is much bigger than
> necessary.

> whenever the array is
> 1/4 full or less, shrink it to half the size.

> Explain why we don't shrink it to half the size when it is 1/2
> full or less.

Doubling and halving exercise (the test in the code):
> What is the effect of replacing the halving test in
> ResizingArrayStack.java
> from if (N > 0 && N == a.length/4) resize(a.length/2); to
> if (N == a.length/4) resize(2*N);?

Uses of "amortized" (only as a cost bound per operation, not defined on this page):
> Implement a queue with two stacks so that each queue operations takes
> a constant amortized number of stack operations.

> Implement a steque with two stacks so that each steque operation
> takes a constant amortized number of stack operations.

> Implement a deque with three stacks so that each deque operation
> takes a constant amortized number of stack operations.

> Each operation should take constant expected amortized time per operation

Contrast: worst-case constant bound and a deliberately inefficient one:
> Implement a queue with a constant number of stacks so that each queue operations
> takes a constant (worst-case) number of stack operations.

Contents:
- Stacks and queues: API and client examples (stack and queue basics, Dijkstra two-stack expression evaluation interpreter)
- Array and resizing array implementations of collections: fixed-capacity stack of strings, fixed-capacity generic stack, array resizing stack (double when full, halve when less than one-quarter full), array resizing queue
- Linked lists: building, insert at beginning, remove first, insert at end, traversal
- Linked-list implementations of collections: stack, queue, bag
- Q&A (including "can't create an array of generics")
- Stack and queue exercises, linked-list exercises, creative problems (includes Dynamic shrinking, Queue with two stacks, Steque with two stacks, Deque with a stack and a steque, Deque with three stacks)
- Web exercises (includes Doubling and halving, FIFO queue with random deletion)

## Chris Okasaki, Purely Functional Data Structures (PhD thesis)
URL: https://www.cs.cmu.edu/~rwh/students/okasaki.pdf
Version: Carnegie Mellon University, CMU-CS-96-177, September 1996 (the 1998 Cambridge University Press book grew from it; the thesis is what was opened)

Added by the fact-check, for the persistence remark and the names of the two methods.

> Traditional methods of amortization break down when
> old versions of a data structure, not just the most recent, are available for further
> processing.

> we show how lazy evaluation can be used to resolve this conflict,
> yielding amortized data structures that are efficient even when used persistently.

> Tarjan [Tar85] describes two techniques for analyzing ephemeral amortized data structures:
> the banker’s method and the physicist’s method. In the banker’s method, the accumulated savings are represented as credits that are associated with individual locations in the data structure.

> the two methods are in fact equivalent [Tar85, Sch92].

> Both these failures reflect the inherent weakness of any accounting system based on accumulated savings — that savings can only be spent once.

> Robert E. Tarjan. Amortized computational complexity. SIAM Journal on Algebraic and Discrete Methods, 6(2):306–318, April 1985.

Contents:
- Abstract: traditional amortization breaks under persistence; lazy evaluation reconciles them
- 1 Introduction; 2 Lazy evaluation and $-notation
- 3.1 Traditional amortization: accumulated savings; Tarjan's banker's method (credits on locations) and physicist's method (potential); equivalence; queue example
- 3.2 Persistence, the problem of multiple futures: the queue used persistently costs n² + n; savings spent once; execution traces and logical time
- 3.3 onwards: debits instead of credits, the banker's and physicist's methods for lazy structures; later chapters: scheduling, numerical representations, data-structural bootstrapping, implicit recursive slowdown
