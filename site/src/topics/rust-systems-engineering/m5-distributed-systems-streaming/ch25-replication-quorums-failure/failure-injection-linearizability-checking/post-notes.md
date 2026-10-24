---
title: "Failure injection and linearizability checking"
---

## Outcomes

- Build directly on the previous topic's toy cluster, injecting two real, independent failures together (a delayed acknowledgement and a duplicated message) into a tiny replicated register.
- Record the resulting real history of reads and writes, and build a real linearizability checker over it, by brute-force enumeration over every candidate total order.
- Measure that the history gathered under both injected failures genuinely fails the linearizability check, and that the checker correctly attributes the failure to the delayed-acknowledgement read rather than the idempotent duplicated-message read.
- Measure that a read genuinely concurrent with a write is still genuinely linearizable, and that the checker's own brute-force count of real-time-respecting total orders matches the real order structure of each history exactly.
- State, from a widely used testing methodology's own documentation, the real definition of linearizability and the real generator/nemesis/checker structure this topic's own code mirrors.

## Internals

The checker here works by genuine brute-force permutation: it enumerates every possible total order of the recorded operations, keeps only the orders consistent with the history's own real-time precedence (an operation that finished before another began must still come first), and checks each surviving order against the register's own single-threaded read/write semantics, starting from its real initial value. A history is linearizable exactly when at least one such order is found; this is the real, formal test, not a hand-waved approximation. The two failures injected together in this topic's own scenario are deliberately of different real character: the delayed acknowledgement is observable (a read can see it), while the duplicated message is idempotent (no read can ever distinguish its effect from a single application), and the measured results show the checker correctly separating the two.

## In production

A widely used testing methodology's own documentation states this exact structure directly: a generator produces operations for a set of processes to perform, their start and end are recorded in a history, a nemesis injects real faults into the system while this happens, and a checker then decides whether the resulting history is correct. Real production linearizability and isolation checkers built on this same idea include Knossos, Porcupine, and Elle, each scaling the same brute-force intuition measured here to much larger, real histories using smarter algorithms than naive permutation.

## The frontier

This topic measures the foundational brute-force version of the idea; the real checkers named above use far more efficient algorithms (Porcupine's own partition-based search, Elle's own cycle detection over a dependency graph) to check histories far too large for naive enumeration, and a later chapter turns to deterministic simulation, testing a system against every possible interleaving of a fixed random seed rather than sampling real injected failures. All of this topic's own measured claims run entirely on plain in-memory Rust structs and a real recursive permutation generator, with no file, network, or root access needed.

## Where this goes next

This chapter measured what one acknowledgement is allowed to promise, and how to check a whole recorded history against that promise under real injected failure; the next chapter turns to how a cluster of nodes, with no leader assumed in advance, actually agrees on which one gets to make that promise at all, and proves it stays correct.
