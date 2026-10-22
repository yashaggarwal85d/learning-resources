---
id: dsa.monotonic-stacks-queues
title: Monotonic stacks and queues
---

<section data-section="outcomes">

## After this topic you can

- Compute next-greater-element with a monotonic stack, and explain why it's O(n) rather than O(n&sup2;).
- Compute a sliding-window maximum with a monotonic deque.
- State the "enters and leaves once" invariant argument, and tell it apart from Chapter 1's resize-schedule amortization.

</section>

<section data-section="internals">

## Into the internals

### The invariant, both ways

A monotonic stack enforces one rule on every push: before adding the current element, pop everything already on the stack that's smaller than it. Each pop has, at that exact moment, found its next-greater element — the element about to be pushed. What's left on the stack at any point is always a subsequence of the input seen so far, kept in strictly decreasing order, bottom to top.

A monotonic deque applies the same rule at the back (pop anything smaller than the element just added, since it can never be the window's maximum while the new one stays in range) and adds a second rule at the front: pop any index that has aged out of the window's left edge. The front of the deque is therefore always the current window's maximum, with no rescanning at all.

### Why the bound is O(n), not O(n&middot;something)

The source this topic verifies states the complexity argument directly: "each element is enqueued once and dequeued at most once. Thus, the computational complexity of maintaining a monotonic queue is O(n)." The same argument applies to the stack. The amortized bound doesn't say any single operation is cheap — one push can still trigger a long cascade of pops — it says the *total* number of pushes and pops across the whole run can't exceed 2n, because nothing can be popped more times than it was pushed, and everything is pushed exactly once.

</section>

<section data-section="production">

## In production

This is the same aggregate-method machinery as Chapter 1's doubling array, applied to a different thing. Chapter 1 bounded a resize schedule known in advance (grow by a fixed factor, so the total cost of all resizes is geometric and sums to O(n)). This chapter bounds a structural invariant enforced on every single operation, with no schedule at all — "stay decreasing" is checked and re-established before every push, and the same proof technique (sum the total work, divide by n) applies regardless.

</section>

<section data-section="frontier">

## The frontier

Monotonic structures generalize to a whole family of problems (largest rectangle in a histogram, trapping rain water, stock span) that share the same shape: some property is monotone over a stack or window, and an invariant collapses what would otherwise be a nested scan into a single linear pass. The general sliding-window and two-pointer technique family, of which this is one instance, is this syllabus's own Chapter 19.

</section>

<section data-section="questions">

## More questions

- Why does the monotonic-stack invariant need to be *strict* (pop while smaller, not while smaller-or-equal) to get a clean next-*strictly*-greater-element answer — what would equal elements do to the result otherwise?
- The sliding-window-maximum deque drops smaller elements from the back forever once a bigger one arrives. Could a *minimum*-tracking version of the same deque reuse that same step, or does it need to flip which comparison triggers a pop?

</section>

<section data-section="next">

## Where this goes next

An invariant on the data gave a bound with no resizing at all. The next topic builds a queue that never resizes in the first place, because its capacity is fixed on purpose.

</section>
