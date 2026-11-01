---
id: de.on-prem-data-platforms-after
title: 'On-prem data platforms after Hadoop'
---

<section data-section="outcomes">

## Outcomes

- Describe the modern on-prem data-platform stack and how it differs from a legacy HDFS/YARN estate.
- Name the licensing pressure that is currently pushing organisations to re-evaluate private-cloud platforms.
- Give at least three concrete, falsifiable reasons on-prem can beat cloud for a given workload.
- State the operational cost on-prem accepts in exchange.

</section>

<section data-section="internals">

## Internals

- **A workload's utilisation shape, not its size, decides whether elasticity ever pays off.** The hook's workload is enormous, but the real reason the cloud bill went up is that it never had an idle window — a small, bursty workload gets the discount a huge, steady one never will.
- **"On-prem wins" is always a test, never a vibe.** Each of the four reasons this topic names has a concrete condition a workload either meets or doesn't; a learner who answers "on-prem is cheaper" without naming which specific test a workload passes has missed the whole point of making the reasons falsifiable.
- **A licensing shock is evidence of a real, current pressure, not proof that private cloud always wins.** The Broadcom/VMware shift reshaped a market most organisations already depend on, but it's a reason organisations are re-evaluating, not a reason on-prem is automatically the right answer.
- **Running the storage-and-table-format layer for real is the point of this specific topic.** Every other sub-topic in this chapter is disclosed as a structural simulation; this one actually writes real Parquet files, real Avro manifests and a real Iceberg snapshot against a real S3-compatible endpoint, because that layer is the one the syllabus insists be demonstrated end to end.
- **Winning the on-prem test doesn't make the operational bill disappear.** Hardware refresh cycles, your own team running Kubernetes and the object store, and capacity planning without autoscaling are real costs that remain on the other side of the ledger even when a workload genuinely meets one of the four tests.

</section>

<section data-section="production">

## Production

A platform team migrates a steady, multi-petabyte analytics workload to the cloud expecting the bill to shrink, since "cloud is supposed to be cheaper." Three months later finance flags a bill consistently higher than the retired on-prem cluster's fully-depreciated run rate — not because anything was misconfigured, but because the workload never had the idle time the cloud's own pricing model is built to reward.

</section>

<section data-section="frontier">

## Frontier

Which specific licensing shock or vendor pressure is currently pushing organisations toward or away from private cloud is this topic's own text describing a documented, dated event, not a permanent verdict on cloud versus on-prem economics. The four falsifiable tests, and the real demonstration that an S3-compatible store plus Iceberg behaves identically whether it runs on a laptop or a rack, stay the right questions to ask regardless of which vendor's pricing or licensing model is currently in the news.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Very few real platforms are purely on-prem or purely cloud. The closing topic of this chapter is the connection between them — what it costs, how fast it is, and what happens to a pipeline when that connection goes down for hours.

</section>
