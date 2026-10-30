<section data-section="internals">

## Internals: the proof is one statement about indistinguishability

`minority_cannot_distinguish_the_two_histories` in `examples.py` is the whole proof, reduced to one
comparison: the isolated replica's `last_write_seen` is checked against the value it would hold
had nothing happened on the other side, and the two are equal. That equality is the entire
argument Gilbert and Lynch make — not "the replica might be wrong," but "the replica has no local
fact that could tell these two worlds apart," so any response it gives either refuses (losing
availability) or risks being wrong (losing atomicity). `linearizable_forces_a_to_refuse_every_read_and_write`
and `causal_lets_a_answer_requests_that_do_not_depend_on_the_other_side` show the same split
replica under two different consistency models from topics 5 and 6: tightening the model to
linearizable tightens how much the isolated side is allowed to say; relaxing it to causal loosens
that, without changing anything about the partition itself.

</section>

<section data-section="lab">

## Lab: overselling, counted directly

`overselling_is_the_concrete_cost_of_choosing_availability` does not simulate a race — it states
the arithmetic the hook already demonstrated: one unit of stock existed, both the isolated
replica and the majority side independently confirmed a sale of it, so two sales were confirmed
against one unit. There was nothing to measure beyond counting; the point this topic needs is
only that choosing availability under a partition makes this outcome possible, not probable, and
`assert total_sold > units_actually_available` records exactly that possibility having occurred,
not a frequency.

</section>

<section data-section="production">

## Production: three systems, placed from their own words

`PACELC_CLASSIFICATIONS` records each system's quadrant from its own quoted sentence, not an
inference: Dynamo-family systems are placed PA/EL from Abadi's own blog post ("upon a partition,
they give up consistency for availability; and under normal operation they give up consistency for
lower latency"); fully ACID systems are placed PC/EC from the same post ("they refuse to give up
consistency, and will pay the availability and latency costs to achieve it"); PNUTS is placed
PC/EL, the split quadrant, because it trades away consistency for latency with no partition
present but holds the line during one. Spanner sits outside this three-system list on purpose:
`spanner_is_effectively_ca_not_literally_ca` keeps its technical placement (CP) and its practical
one (treated as CA) as two separate values that are never asserted equal, because Brewer's own
answer is that they are different things, not two names for one fact.

</section>

<section data-section="frontier">

## Frontier: what "effectively" is doing in "effectively CA"

It would be easy to read Spanner's case as evidence that CAP has an escape hatch for systems with
good enough infrastructure. It doesn't. Brewer's own answer is explicit that the "purist" answer
is no — Spanner is a CP system, full stop, and during the partitions that have in fact happened at
Google, it chose consistency and forfeited availability, exactly as CP requires. What changes with
a private, well-engineered network is not the theorem's force but how often the condition that
triggers it occurs. "Effectively CA" is a claim about frequency of payment, made possible by
infrastructure outside CAP's own model, not a claim about the theorem's reach. A system that pays
a tax once a decade is not exempt from the tax.

</section>

<section data-section="where-next">

## Where this goes next

CAP and PACELC name the choice; they say nothing about how a system actually survives a leader
failing or a coordinator dying mid-transaction while making that choice. The next topics build the
mechanisms: Raft's leader election and log replication, leases and fencing tokens for the failures
a single timeout cannot safely resolve, and the coordination services and protocols built on top of
both.

</section>
