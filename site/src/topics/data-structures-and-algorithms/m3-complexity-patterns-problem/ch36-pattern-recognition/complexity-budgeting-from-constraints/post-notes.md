---
id: dsa.complexity-budgeting-from-constraints
title: Complexity budgeting from constraints
---

<section data-section="outcomes">

## After this topic you can

- From a statement's n, value range and time limit, compute the budget and say which growth rates fit, without a memorized table.
- Say why a budget near a hundred million elements forces a sequential pass, and measure that claim directly.
- For each of four signal words ("sorted", "k-th", "all pairs", "minimum maximum"), name the technique it points at and one way the signal misleads.

</section>

<section data-section="internals">

## Into the internals

### Why the table is a division, not a list to memorize

Every row of the budget table is the same computation: take the rule-of-thumb rate (on the order of a hundred million operations a second), multiply by the time limit to get an operation budget, then ask at what n a given growth rate's cost crosses that budget. The table's rows are not independent facts; they are the same inequality solved for five different functions. That is also why the table is only as good as the rate: a slower machine, a tighter limit, or a bigger constant factor inside the algorithm all shift every row by the same multiplicative amount, without changing which function wins which row.

### Why meeting in the middle changes what "small n" means

The naive reading of "n is small" is "every algorithm is fine". The meet-in-the-middle exception shows that even inside "small", the *shape* of the algorithm still matters: trying every one of two-to-the-n subsets outright is a single pass over an exponential set, while splitting the n choices into two halves and combining the two halves' results separately turns one exponential count into two much smaller exponential counts plus a combining step. The saving is real and large (the square root of the brute-force cost, roughly) but it depends on the problem decomposing into two independent halves whose partial results can be combined cheaply — not every exponential problem offers that structure, which is exactly why this topic names the threshold without building the technique itself.

</section>

<section data-section="lab">

## In the lab

Take the sequential-versus-random measurement in `examples.py` and grow the element count by a factor of ten, then a factor of a hundred. Does the ratio between the random pass and the sequential pass grow, shrink, or stay roughly the same on this machine? Separately, pick a growth rate not in the table (say, n to the power of two and a half) and find, by the same division this topic uses, the largest n a one-second, hundred-million-operations-a-second budget allows it — then check your arithmetic against a short script.

</section>

<section data-section="production">

## In production

A contest judge's stated time limit and a production system's own latency budget are the same arithmetic wearing different clothes: a service with a hundred-millisecond budget per request, on a machine doing on the order of a hundred million operations a second, has roughly ten million operations to spend — and the same signal words apply to reading a production request's own shape (is the data sorted already, is this a top-k ranking, is a range query coming). The difference in production is that the "operations per second" rate is rarely a clean round number — it depends on what the operations actually are, including anything that touches the network or disk, which is why the cache-friendliness correction in this topic matters even more in production than in a contest: a cache miss is cheap compared to one disk seek or one network round trip hiding inside what looked like "one operation".

</section>

<section data-section="frontier">

## The frontier

The rule of thumb's own honesty about hiding constant factors has a sharper, named cousin: *amortized* analysis (already met in earlier chapters for a single structure's own operations) can make a worst-case-looking bound misleadingly pessimistic for a whole run, in the opposite direction from this topic's concern — a budget computed from a single operation's stated worst case can be far more pessimistic than the budget the algorithm actually needs over a full run, just as a budget computed from the stated rate can be far more optimistic than the real one once memory traffic is counted. Reading a statement's budget correctly sometimes means asking which of the two errors is more likely for the specific algorithm being considered, a judgment call this topic's own three-question routine does not automate.

</section>

<section data-section="questions">

## More questions

- The meet-in-the-middle threshold trades an exponential cost for two smaller exponential costs plus a combining step. For what shape of combining step does the saving stop being worth it — where does the combining step itself become the new bottleneck?
- The cache-friendliness measurement in this topic compares one sequential pass against one random-order pass of the identical size. What happens to that ratio once the element count is large enough that the sequential pass itself no longer fits in any level of cache either — does the gap between the two passes shrink, because both are now equally paying for memory traffic?

</section>

<section data-section="next">

## Where this goes next

The budget tells you how much work you may do, and it narrows the field: n squared is out, n log n is in. It says nothing about how to organise the data so that the work is that cheap. That depends on what you will do with the data, and how often: look one thing up, ask for a range, take the smallest, test membership, group. Each of those has a structure that is best at it, and the same data can need a different structure under a different mix of operations. Choosing the structure for the operation mix, next.

</section>
