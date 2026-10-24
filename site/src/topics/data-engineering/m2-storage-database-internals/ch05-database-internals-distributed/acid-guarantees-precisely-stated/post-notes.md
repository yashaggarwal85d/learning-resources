<section data-section="outcomes">

## Outcomes

State what each of atomicity, consistency, isolation and durability actually promises, distinctly
from each other: atomicity is all-or-nothing across every statement in a transaction, even a
crash mid-transaction; consistency is that a transaction can only move the database between
states that obey its own declared rules; isolation is that concurrent transactions behave as if
they had run one at a time; durability is that a committed transaction survives a crash. Say
precisely which layer owns "consistency": the database engine enforces only the rules it was
actually told about (constraints, cascades, triggers); any invariant the application cares about
but never declared is invisible to the engine, and the engine will commit a transaction that
silently breaks it. Correctness beyond the engine's own declared rules is the application's job,
not the engine's.

</section>

<section data-section="internals">

## Where isolation and durability actually come from

Neither isolation nor durability is free; both are real engine mechanisms, both already built in
§5.1. Durability is the write-ahead log: a change is written to a sequential, append-only log and
only then considered committed, so a crash can replay the log and recover exactly what was
acknowledged. Isolation (in PostgreSQL, and in most modern engines) is multiversion concurrency
control: each transaction reads a snapshot of the data rather than the live, changing table, which
is what lets a Repeatable Read transaction keep seeing the same values throughout even while other
transactions commit changes underneath it. Atomicity and consistency don't need a dedicated
storage mechanism in the same way — atomicity falls out of the same log (an uncommitted
transaction's changes are simply never replayed), and consistency's engine-side half falls out of
ordinary constraint checking, evaluated before any commit is allowed to succeed.

</section>

<section data-section="production">

## Production failures this topic warns about

**Mistaking "the schema passed" for "the data is correct."** A transaction that violates no
declared constraint, cascade or trigger can still violate a real business rule nobody ever wrote
down as a CHECK — this topic's own measurement shows exactly that (a reservation count exceeding
stock on hand, committed without complaint). A team that treats "no constraint violation" as
"the data is fine" is trusting a guarantee the engine never made.

**Picking an isolation level without knowing what it actually allows.** Read Committed and
Repeatable Read gave genuinely different answers to the identical interleaving measured here.
Choosing the default isolation level without checking what anomalies it still permits is choosing
a real risk, not a neutral default — the next topic names those anomalies precisely.

</section>

<section data-section="frontier">

## Frontier

Serializable, the SQL standard's own strictest isolation level, is named and precisely defined in
PostgreSQL's own documentation but not measured directly in this refresher — this topic's own
`examples.py` only contrasts Read Committed and Repeatable Read, the two levels PostgreSQL
actually defaults between for typical workloads. Distributed transactions (ACID guarantees spread
across more than one node, with no single node responsible for all the data involved) are named
as a real, harder boundary this topic deliberately leaves out — a transaction-level contract is
not automatically a distributed one, and that gap is this chapter's own later concern, not this
refresher's.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Isolation is the one letter with the most room to be violated quietly. The next topic names
exactly how, with the real anomalies ANSI's own definitions leave ambiguous.

</section>
