# Sources: Monotonic stacks and queues

Checked 2026-10-22. Every source was fetched raw with `scripts/sources.mjs`; quotes are proven by
`sources.mjs check`.

## Sarah Zhang, "Monotonic Queues and Monotonic Optimization in Dynamic Programming" (TJHSST, Feb 2020)
URL: https://activities.tjhsst.edu/sct/lectures/1920/2020_2_21_Monotonic_Queues.pdf

What a monotonic queue (deque) is, and the amortized argument:

> A monotonic queue, also known as a double-ended queue, refers to a data structure in which each
> element monotonically increases or decreases with its subscript. The elements can be deleted at both
> the beginning and end of the queue, but they can only be inserted at the end.

> Since the elements are
> monotonic, the head element is either the maximum or minimum value depending on which monotonic
> queue you are constructing (decreasing or increasing order). Due to the nature of the double-ended
> queue, each element is enqueued once and dequeued at most once. Thus, the computational complexity
> of maintaining a monotonic queue is O(n).

The sliding-window maximum/minimum problem statement and baseline costs:

> Given an array A of size n, there is a sliding window of size k which is moving from the very left of the
> array to the very right. You can only see the k numbers in the window. Each time, the sliding window
> moves right by one position. Return the maximum and minimum sliding window, respectively.

> The basic method is to repeatedly scan each window to find the maximum or minimum value. We
> begin by looping through the array A of size n and then scanning the first k elements, the second k
> elements, the third k elements, and so forth. The time complexity for this method can be written as
> O(N ∗ k).

> Other methods such as segment trees can find the maximum/minimum more efficiently than the basic
> method, but it has a time complexity of O(N logN ) which is not linear.

The maintenance rule for a maximum monotonic queue:

> To solve the sliding window maximum/minimum problem in linear time, we can utilize monotonic
> queues. The steps for maintaining a maximum monotonic queue are shown below:
> 1. Determine if the head of the queue is within the sliding window range. If it no longer in the
> window range, increase the head of the queue.
> 2. Every time when an element is added, it is compared with the end of the queue. If the new
> element is greater than the tail of the queue, then reduce the tail because the tail element will
> be removed. Continue to do this until the nature and constraints of the monotonic queue are
> satisfied.
> 3. Now the monotonic queue is in decreasing order and the head will contain the maximum value
> we are looking for.

Not covered by this source: next-greater-element on a plain monotonic stack (it only treats the
two-ended, window-bounded case); named here only for the sliding-window-maximum clause.

## Jeff Erickson, Algorithms, Lecture 9: Amortized Analysis (reused from Chapter 1)
URL: https://jeffe.cs.illinois.edu/teaching/algorithms/notes/09-amortize.pdf
Version: Lecture 9 [Fa'13] (PDF footer: (c) 2018 Jeff Erickson, CC BY-NC-SA 4.0)

The aggregate-method framing this topic's "enters and leaves once" argument is an instance of
(same source Chapter 1's `aggregate-accounting-methods` topic already verifies in full):

> Most textbooks call this particular technique "the aggregate method", or "aggregate analysis",
> but these are just fancy names for computing the total cost of all operations and then dividing by
> the number of operations.

> The Summation Method. Let T (n) be the worst-case running time for a sequence
> of n operations. The amortized time for each operation is T (n)/n.

Not covered by this source: a worked monotonic-stack or monotonic-queue example specifically (it
covers a binary counter and a resizing array); reused only for the aggregate-method framing itself,
per the chapter plan's instruction to reuse Chapter 1's own amortized-analysis primary sources for
this argument's lineage.
