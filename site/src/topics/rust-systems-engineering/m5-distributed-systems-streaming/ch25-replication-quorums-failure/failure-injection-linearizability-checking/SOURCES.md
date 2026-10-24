# Sources — Failure injection and linearizability checking

## Jepsen Docs: Linearizability
URL: https://jepsen.io/consistency/models/linearizable
Fetched: 2026-10-24, cached at `sources/jepsen-linearizable.txt`.
> Linearizability is one of the strongest single-object consistency models, and implies that every operation appears to take place atomically, in some order, consistent with the real-time ordering of those operations

> if operation A completes before operation B begins, then B should logically take effect after A

> a linearizable history H is one in which there is an equivalent sequential (e.g. non-concurrent) history S, and the partial real-time order of operations in H is consistent with the total order of S

## Jepsen README (jepsen-io/jepsen)
URL: https://raw.githubusercontent.com/jepsen-io/jepsen/main/README.md
Fetched: 2026-10-24, cached at `sources/jepsen-readme.txt`.
> A *generator* generates new operations for each process to perform. Processes then apply those operations to the system using their clients. The start and end of each operation is recorded in a *history*.

> a special *nemesis* process introduces faults into the system

> Jepsen uses a *checker* to analyze the test's history for correctness
