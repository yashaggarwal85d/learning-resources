---
id: dsa.work-span-model-work
title: Work–span model and work stealing
---

<section data-section="outcomes">

## After this topic you can

- Compute the work, the span and the parallelism of a small computation DAG and of a
  divide-and-conquer recurrence, and say which of two algorithms scales as the input grows.
- State and apply Brent's bound: given the work, the span and a worker count, give the
  guaranteed running time, and say when speed-up is linear.
- Describe work stealing in four sentences, state its expected-time bound and the class of
  computation it applies to, and place Cilk, Rayon and Tokio against it correctly.

</section>

<section data-section="internals">

## Into the internals

### Two floors, one ceiling

The work law and the span law are not design choices a scheduler can work around — they follow
directly from what a computation's dependency graph already is, before any worker is assigned.
Brent's bound is the tightest statement that holds for *every* greedy schedule without assuming
anything about how tasks happen to land on workers: it is provably within a factor of two of
whatever the best possible schedule could do, for any worker count. Work stealing's own
guarantee — expected time work divided by workers, plus a constant times the span, for a fully
strict computation — has exactly the same shape, reached with no central coordinator deciding
who runs what.

### Why "fully strict" is the actual scope of the guarantee

The bound this topic proves is not a claim about every parallel program — it is scoped to
computations where every dependency returns straight to its parent, the shape an ordinary
recursive fork-and-join program already has. That is also exactly why Tokio's own work-stealing
scheduler, real and documented, is named here in one sentence and not claimed under this bound:
it schedules tasks that wait on the network and disk, not a fork-and-join chain of pure
computation, and that is a genuinely different problem with its own engineering, owned by the
live Rust Systems Engineering topic on Tokio's scheduler.

### A bound proved without its own hardest mechanism

The race between a deque's owner and a thief reaching for the very last task at the same
instant is a real synchronization problem, and this topic deliberately does not build its
solution (compare-and-swap, in a later chapter). Stating a bound honestly does not require first
building every mechanism that makes implementing it safe — the two are separable, and the
separation is itself the point: an algorithm's guarantee and its low-level correctness are
different claims, checked differently.

</section>

<section data-section="lab">

## In the lab

`examples.py` runs every number in this topic directly: the sum DAG's work, span and
parallelism (a balanced tree against a left-to-right chain over the same additions), a greedy
schedule run on five worker counts against both forms of Brent's bound, the merge sort's span
and work read off their recurrences at every power of two up to sixty-five thousand five
hundred and thirty-six, and a discrete-event simulation of randomized work stealing on a bigger
tree reporting real steal fractions. Re-run the greedy-schedule table at a different leaf count
and confirm the same shape: the real step count between the two laws' floor and Brent's bound,
flattening at the span once worker count passes it. Re-run the work-stealing simulation with a
different seed and confirm the steal fractions move by single-digit percentages, not by orders
of magnitude.

</section>

<section data-section="production">

## In production

**OpenCilk**, the modern successor to the language this algorithm was designed for, states on
its own homepage that its "provably efficient scheduling tunes each execution of your OpenCilk
program to its host environment" — a research result shipping as an actual compiler's default
behavior. **Rayon's `join`**, a widely used Rust library function, documents this exact
protocol in its own words: a fixed worker pool, one closure run directly while the other is
"advertised" as stealable, and an explicit warning that blocking one closure on the other inside
`join` "could lead to a deadlock" — a real, live hazard in real Rust code built on this
algorithm. **Tokio's** own multi-thread scheduler steals from per-worker queues too, but for a
genuinely different kind of task: real, shipping, and real-world evidence that the same core
idea (steal from an idle peer, not a central queue) generalizes beyond the exact theorem this
topic proves.

</section>

<section data-section="frontier">

## The frontier

Parallel prefix sum (scan) and parallel merge are named once as the two algorithms whose spans
are usually taught first after this one — both *(skipped)* in this chapter's own plan, read
only as far as confirming they exist and are the standard next examples. NUMA effects, false
sharing between workers, and memory bandwidth as the true ceiling on many real parallel
algorithms (something the span law, by design, ignores entirely) are named only in passing, with
no source opened for them at research time.

</section>

<section data-section="next">

## Where this goes next

Work and span answer "how fast can one machine's many cores go" with two numbers and a
scheduler that reaches the bound those numbers set. The next question drops the assumption this
whole topic quietly made — that every core can still read the same memory for free — and asks
what changes when the data does not fit on one machine at all, and moving a record costs more
than computing with it. MapReduce, the pattern built around exactly that question, next.

</section>
