<section data-section="outcomes">

## Outcomes

The shop's two-region platform gets a placement rule per dataset from its own classification, a
replicate-versus-federate decision per query class priced against a dated egress rate, a
regional-failover plan that names the catalog, the keys and the pipeline state explicitly
(not just the bucket), RPO and RTO stated per data class, and one rule for consistent global
metrics: a global figure carries the freshness of its stalest region. What the design does and
does not claim about legal compliance is stated plainly throughout, never asserted.

</section>

<section data-section="internals">

## Internals

None claimed independently here. The cloud regions, networking and residency regulations
(Chapter 10 §10.1–§10.5) are built on, not re-taught; replication mechanics (Chapter 5 §5.3,
Chapter 9's MirrorMaker and cluster linking, Chapter 6's table replication) and the DR mechanics
themselves (Chapter 11 §11.3) are each named only as a choice pointing to its home chapter. The
consistency theory belongs to Chapter 14; tenant isolation belongs to topic 19.

</section>

<section data-section="lab">

## Lab

None of its own as a separate syllabus lab leg. The egress estimate for replicating rows versus
aggregates, using AWS's own dated per-GB price, and the failover completeness checklist are
this topic's executable evidence. `examples.py`'s own lab: `daily_egress_cost()` and
`federated_query_cost()` price the two paths; `replicate_vs_federate()` picks the cheaper one per
query class; `failover_plan_is_complete()` checks a failover plan against the four components
bucket replication never covers; `global_metric_freshness()` computes the stalest-region rule.

</section>

<section data-section="production">

## Production failures this topic warns about

**Replicating rows that were never supposed to leave the region.** A well-meaning performance
fix that copies an entire dataset across a border can turn into a residency violation nobody
noticed until a regulator or a privacy officer asks the question.

**Believing bucket replication is a failover plan.** The data survives; the catalog that makes
it readable, the keys that make it decryptable, and the pipeline state that makes it resumable
each need their own, separate plan, or the "surviving" bucket is unusable the moment it matters.

</section>

<section data-section="frontier">

## Frontier

None claimed. Residency-constrained placement, replicate-versus-federate decisions, and
cross-region consistency tradeoffs are each established practice — AWS's own S3 Replication
Time Control product, GDPR's own transfer chapter — not an emerging technique.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A region is one kind of boundary inside a platform. Another is the customer: when the
platform's users are themselves businesses, each with their own data, budget and expectations,
isolating them and charging each fairly become design problems. The next design is multi-tenant
analytics with cost attribution.

</section>
