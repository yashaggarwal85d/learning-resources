## Gilbert and Lynch: Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services

URL: https://www.cs.princeton.edu/courses/archive/spr22/cos418/papers/cap.pdf
Version: SIGACT News 33, no. 2 (2002), fetched 2026-10-30

> For a distributed system to be continuously available, every request received
by a non-failing node in the system must result in a response.

> in all fair executions (including those in which messages are lost)

## Gilbert and Lynch: Perspectives on the CAP Theorem

URL: https://groups.csail.mit.edu/tds/papers/Gilbert/Brewer2.pdf
Version: IEEE Computer 45, no. 2 (February 2012), fetched 2026-10-30

> A web service is atomic if, for every operation, there is a single instant in between the request and the
response at which the operation appears to occur.

> Availability simply means that each request eventually receive a response.

> Availability is a classic liveness property: it states that eventually, every request receives a response.

> The CAP Theorem. Thus, for the purpose of this section, the CAP Theorem can be stated as follows: In a network
subject to communication failures, it is impossible for any web service to implement an atomic read/write shared
memory that guarantees a response to every request.

> Consider an execution in which the servers are partitioned into two disjoint sets: {p1 } and {p2 , . . . , pn }.
Some client sends a read request to server p2 . Since p1 is in a different component of the partition from p2 , every
message from p1 to p2 is lost. Thus, it is impossible for p2 to distinguish the following two cases:

## Brewer: CAP Twelve Years Later: How the "Rules" Have Changed

URL: https://sites.cs.ucsb.edu/~rich/class/cs293b-cloud/papers/brewer-cap.pdf
Version: IEEE Computer 45, no. 2 (February 2012), fetched 2026-10-30

> The "2 of 3"
formulation was always misleading because it tended to
oversimplify the tensions among properties.

## Abadi: Consistency Tradeoffs in Modern Distributed Database System Design (abstract, via Papers We Love)

URL: https://paperswelove.org/papers/consistency-tradeoffs-in-modern-distributed-databa-4a1ea3bd/
Version: IEEE Computer 45, no. 2 (2012), abstract fetched 2026-10-30 (the full paper's usual host, `cs.umd.edu`, returned a broken TLS certificate chain, domain-wide, at research time — see the note below)

> The CAP theorem's impact on modern distributed database system design is more limited than is often perceived. Another tradeoff—between consistency and latency—has had a more direct influence on several well-known DDBSs. A proposed new formulation, PACELC, unifies this tradeoff with CAP.

## Abadi: Problems with CAP, and Yahoo's little known NoSQL system (DBMS Musings, the original PACELC post)

URL: http://dbmsmusings.blogspot.com/2010/04/problems-with-cap-and-yahoos-little.html
Version: posted April 2010, fetched 2026-10-30

> To me, CAP should really be PACELC --- if there is a partition (P) how does the system tradeoff between availability and consistency (A and C); else (E) when the system is running as normal in the absence of partitions, how does the system tradeoff between latency (L) and consistency (C)?

> For example, Amazon's Dynamo (and related systems like Cassandra and SimpleDB) are PA/EL in PACELC --- upon a partition, they give up consistency for availability; and under normal operation they give up consistency for lower latency.

> Fully ACID systems are PC/EC in PACELC. They refuse to give up consistency, and will pay the availability and latency costs to achieve it.

> One such example is PNUTS, which is PC/EL in PACELC. In normal operation they give up consistency for latency; however, upon a partition they don't give up any additional consistency (rather they give up availability).

## Brewer: Inside Cloud Spanner and the CAP Theorem (Google Cloud blog)

URL: https://cloud.google.com/blog/products/databases/inside-cloud-spanner-and-the-cap-theorem
Version: 15 February 2017, fetched 2026-10-30

> Does this mean that Spanner is a CA system as defined by CAP? The short answer is "no" technically, but "yes" in effect and its users can and do assume CA.

> The purist answer is "no" because partitions can happen and in fact have happened at Google, and during some partitions, Spanner chooses C and forfeits A. It is technically a CP system.

On Abadi's 2012 IEEE Computer paper's usual host (not a documented source but a research-time note):

The paper's own PDF is normally hosted at `cs.umd.edu/~abadi/papers/abadi-pacelc.pdf`; that domain returned a broken TLS certificate chain, domain-wide, confirmed by testing its site root directly and not just this one path, consistent with the pattern already logged for `cs.utexas.edu` and `cs.cornell.edu` in topic 6's `SOURCES.md`. The paper's own abstract (via Papers We Love) and the author's own original blog post defining PACELC, both quoted above, cover the same content this topic needs without relying on that host.

## de.linearizability (internal cross-reference)

URL: internal-not-fetched-de.linearizability
Version: this topic's own commit history

No quotes; atomicity here is topic 5's linearizability, referenced here, not re-quoted.

## de.sequential-causal-consistency (internal cross-reference)

URL: internal-not-fetched-de.sequential-causal-consistency
Version: this topic's own commit history

No quotes; the causal-consistency relaxation this topic's lab uses is topic 6's, referenced here, not re-quoted.
