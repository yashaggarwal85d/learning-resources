# Fact-check — de.cap-pacelc-practice

Role: adversarial fact-checker, not the author. Every claim re-derived from the fetched source
text in `sources-tmp/`, not from memory of writing `OUTLINE.md`.

## Claims

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | The CAP theorem states that any networked shared-data system can have at most two of three desirable properties: consistency, availability, tolerance to partitions. | Confirmed | Brewer, quoted verbatim. |
| 2 | Allowing at least one node to update state during a partition forfeits consistency; preserving consistency means one side must act as if unavailable. | Confirmed | Brewer, quoted verbatim. |
| 3 | Because partitions are rare, there is little reason to forfeit consistency or availability when the system is not partitioned. | Confirmed | Brewer, quoted verbatim (full sentence begins "First, because..."). |
| 4 | Partition handling should detect partitions, enter an explicit partition mode, and initiate a recovery process. | Confirmed | Brewer, quoted verbatim. |
| 5 | In Google, the primary partition usually resides within one datacenter, with Paxos used on the wide area for global consensus, as in Chubby. | Confirmed | Brewer, quoted verbatim (footnote markers excluded from the quoted span). |
| 6 | PACELC: if there is a partition, trade availability against consistency; else, trade latency against consistency. | Confirmed | Abadi, quoted verbatim. |
| 7 | Dynamo-family systems (Cassandra, SimpleDB) are PA/EL: they give up consistency for availability under partition, and for lower latency under normal operation. | Confirmed | Abadi, quoted verbatim. |
| 8 | Fully ACID systems are PC/EC: they pay the availability and latency costs to keep consistency. | Confirmed | Abadi, quoted verbatim. |
| 9 | PNUTS is PC/EL: normal operation trades consistency for latency; under partition it gives up availability instead of further consistency. | Confirmed | Abadi, quoted verbatim. |
| 10 | Dynamo sacrifices consistency under certain failure scenarios to achieve an "always-on" highly available experience, and provides eventual consistency with asynchronous replica propagation. | Confirmed | Dynamo paper, quoted verbatim. |
| 11 | Spanner is a globally-distributed, synchronously-replicated database and the first system to support externally-consistent distributed transactions at global scale. | Confirmed | Spanner paper, quoted verbatim. |
| 12 | In this topic: the failure-domain hierarchy (process/host/rack/AZ/region) nests exactly as a real deployment topology would, and each system's PACELC quadrant is backed by its own quoted words, not an assumption. | Confirmed, executed | `examples.py`, all functions run and asserted. |

## Currency check

- Brewer's 2012 retrospective is the canonical, author-written restatement of CAP as it is actually
  used today; no currency risk — nothing about the theorem's own statement has since changed.
- Abadi's 2010 blog post is PACELC's own original statement, by the author who coined it. The
  later, formal 2012 IEEE Computer paper adds nothing to the four quadrant definitions themselves
  (confirmed against secondary citations of that paper found in this sandbox's own earlier work,
  e.g. `de.cap-stated-precisely-pacelc`'s own `SOURCES.md`-adjacent material); no currency risk for
  the claims actually made here.
- Dynamo (2007) and Spanner (2012) are both foundational systems papers describing designs that
  remain the documented basis for each system's current behavior (Dynamo's descendants — DynamoDB,
  Cassandra, Riak — still document eventual consistency as the default; Spanner's TrueTime/external
  consistency design is unchanged in Google's own current documentation). No currency risk for the
  PA/EL and PC/EC classifications specifically.

## Red team

1. **"Is classifying Spanner as PC/EC actually supported by a quote about external consistency, or
   is that an unjustified leap from a different property (consistency) to the PACELC letter C?"**
   The Spanner quote (claim 11) establishes synchronous replication and externally-consistent
   transactions — exactly the "pay for consistency" behavior PC/EC describes (claim 8's own
   definition of PC/EC: "refuse to give up consistency, and pay the availability and latency
   costs"); Spanner's own synchronous replication is the latency cost paid, directly observable in
   the quote itself, not inferred from outside.
2. **"Does naming Chubby and Megastore in the Internals section actually follow from Brewer's own
   quote, or is it padding?"** It follows directly — claim 5 is the quote itself, and it names both
   by name as the mechanism behind Google's "primary partition inside one datacenter" design; the
   topic doesn't extend the claim beyond what Brewer himself wrote.
3. **"Is the failure-domain hierarchy's asymmetric-containment claim (losing an inner domain says
   nothing about outer ones; losing an outer one takes everything inside) actually demonstrated, or
   just asserted in prose?"** It's demonstrated directly in `examples.py`: `each_domain_contains_
   the_one_below_it` builds the real containment structure and asserts each parent relationship;
   `losing_a_process_does_not_imply_losing_its_host` and `losing_a_region_implies_losing_everything_
   it_contains` assert both directions of the asymmetry as explicit booleans, not prose claims.
4. **"Is treating Abadi's blog post as equivalent to his later peer-reviewed paper a weakening of
   the source quality, given `cs.umd.edu`'s TLS block is this topic's second time citing that
   substitution pattern (after the previous topic's Terry et al. substitution)?"** No — unlike the
   Terry et al. case (where Jepsen is a third party restating someone else's definitions), this
   substitution uses the PACELC originator's own words, in his own voice, making the original
   argument — if anything a more direct source for "what did Abadi mean by PACELC" than a
   third-party restatement would be.
5. **"Does the 'Prove it' scenario's claimed answer (only the process and host are affected by a
   single host crash) actually follow from the hierarchy as built, or does it assume something
   examples.py doesn't establish?"** It follows directly from
   `losing_a_process_does_not_imply_losing_its_host`'s own structure: the hierarchy is built with
   explicit parent pointers, and the test asserts the host, rack, zone and region all remain
   unaffected by a process/host-level failure — the same assertion generalizes to "a host crash"
   since a host crash takes down every process on it but nothing above the host level.

## Problem Solving

- The PACELC paper itself (Abadi's 2012 IEEE Computer paper, hosted at `cs.umd.edu`) returned a
  TLS verification failure, the same domain-wide limitation already documented for Terry et al.'s
  session-guarantees paper in the previous topic's `SOURCES.md`. **Fixed** by substituting Abadi's
  own original 2010 blog post proposing PACELC, which fetched cleanly and is the author's own first
  statement of the idea in his own words — not a lesser substitute, since it's the primary source
  for the four quadrant definitions this topic actually uses (Dynamo PA/EL, ACID PC/EC, PNUTS
  PC/EL), all quoted directly from that post.
- No other sourcing or build issues arose for this topic.
