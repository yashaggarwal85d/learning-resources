---
id: de.compute-cost-controls-commitments
title: 'Compute cost controls and commitments'
---

<section data-section="outcomes">

## Outcomes

- Configure a byte cap that fails a query before it runs rather than after it's billed.
- Explain why auto-suspend and a resource monitor both act on cost, while a budget policy's tag only labels it.
- State the real discount and the real interruption mechanics behind spot/preemptible compute.
- Compute a committed-use discount's break-even utilization and say when flexibility wins instead.
- Treat a cost regression as a CI failure, the same as a correctness or performance regression.

</section>

<section data-section="internals">

## Internals

- **A guardrail blocks before the charge exists; a tag only labels a charge that already happened.** `max_bytes_billed` and a Snowflake resource monitor both act before or at a threshold; a Databricks budget policy's tag is attribution for a bill that was going to be the same size either way.
- **Billing granularity decides which lever actually does anything.** Per-second billing with auto-suspend only pays off if the warehouse is actually allowed to go idle; a credit-based resource monitor only ever watches warehouses, never serverless spend, which needs a budget instead.
- **A discount's real price is paid in flexibility, not just dollars.** A spot/preemptible instance can be reclaimed at any time; a committed-use discount locks in a rate for a term regardless of whether that capacity gets used.
- **Break-even utilization is the same arithmetic as a single job's serverless-vs-provisioned choice, stretched across a contract term.** Below that line, paying on demand the whole time would have cost less than the commitment.
- **A cost regression gate treats a dollar figure exactly like a test assertion.** The build fails on a stated percentage increase over baseline, with no human needing to notice the bill days later.

</section>

<section data-section="production">

## Production

A team configures a resource monitor on every Snowflake warehouse, confident it has closed the credit-overrun risk. A new serverless feature later consumes credits the monitor was never scoped to track — the monitor keeps working exactly as configured, and the gap was never in its enforcement, it was in what it was ever able to watch.

</section>

<section data-section="frontier">

## Frontier

FOCUS, the FinOps Open Cost and Usage Specification, is pushing toward a vendor-neutral billing export format, which would make a cost-regression gate portable across BigQuery, Snowflake, Databricks and Compute Engine instead of bespoke per-platform. The underlying mechanisms this topic teaches — a before-the-fact byte or credit cap, billing granularity deciding which lever matters, a commitment's break-even utilization, and treating cost like any other regression — stay the right questions regardless of which platform's specific billing export a team ends up standardizing on.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Everything in this chapter so far assumed the pipeline was free to run anywhere the cloud allows. For data about a person who lives in the EU, that assumption is false by law before it is false by architecture — which the next section makes exact.

</section>
