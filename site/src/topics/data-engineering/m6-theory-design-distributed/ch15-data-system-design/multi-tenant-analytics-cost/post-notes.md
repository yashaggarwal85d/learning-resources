<section data-section="outcomes">

## Outcomes

The shop's marketplace gets an isolation level chosen from three priced alternatives (shared
table, schema per tenant, account per tenant), pushed up a rung only by a named constraint
(regulated, noisy) rather than a blanket upgrade. A noisy-neighbour control gets a stated
fairness rule — equal share, weighted share, or burst-with-credit — each with a different
tradeoff, simulated at many times normal load. Per-tenant retention and erasure couple directly
to the isolation choice already made. A metering-and-allocation model computes per-tenant cost
from one engine's own attribution view, with an explicit, stated policy for the remainder that
view does not cover.

</section>

<section data-section="internals">

## Internals

None claimed independently here. The isolation-spectrum theory, tenant-level keys and
compliance (the skipped Chapter 13 multi-tenant topic) and row/column security mechanisms
(Chapter 13 topic 8) are each named only as a choice pointing to its home chapter. FinOps
practice and cloud cost models (Chapter 10 §10.4, topic 8) and the engines' resource-governance
internals (Chapter 6 §6.5) are referenced, not re-taught. The Chapter 13 erasure mechanisms are
referenced.

</section>

<section data-section="lab">

## Lab

None of its own as a separate syllabus lab leg. The noisy-neighbour simulation (a tenant at many
times normal load, with and without a quota and a fairness rule), the isolation cost comparison
at two tenant counts, and the per-tenant attribution from a metering extract are this topic's
executable evidence. `examples.py`'s own lab: `isolation_total_cost()` prices the three rungs;
`neighbour_latency()` and `fairness_allocation()` run the noisy-neighbour simulation under three
rules; `erasure_cost()` ties erasure to the isolation choice; `attribute_cost()` allocates
metered cost and applies a remainder policy.

</section>

<section data-section="production">

## Production failures this topic warns about

**No isolation, no number.** A shared warehouse with no per-tenant limit lets one tenant's
heavy query degrade every other tenant's experience, and produces no way to even identify who
caused it, let alone bill for it.

**A quota with no fairness rule.** Capping usage without deciding how fairly to split what's
left just moves the starvation from one tenant to another, rather than solving it.

</section>

<section data-section="frontier">

## Frontier

None claimed. Tenant isolation spectrums, noisy-neighbour quotas, and usage-based cost
attribution are each established practice — Snowflake's and BigQuery's own metering products —
not an emerging technique.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Isolation and attribution are about who sees and who pays. One tenant's request can also be
about who must be forgotten. A deletion has to reach the lakehouse, the topics, the replicas
and the backups, with proof. The next design composes everything Chapter 13 built into one
process: GDPR erasure across lakehouse and backups.

</section>
