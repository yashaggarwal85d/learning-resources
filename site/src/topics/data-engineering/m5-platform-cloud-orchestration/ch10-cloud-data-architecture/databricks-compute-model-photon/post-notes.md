---
id: de.databricks-compute-model-photon
title: 'Databricks compute model and Photon'
---

<section data-section="outcomes">

## Outcomes

- Choose between an all-purpose cluster, a job cluster, serverless and a SQL warehouse for a given workload and justify it.
- Explain what Photon actually replaces in Spark's execution and why that's faster for the workloads it helps.
- Convert a job's DBU consumption across at least two SKUs and decide when serverless wins.

</section>

<section data-section="internals">

## Internals

- **All-purpose compute's defining property isn't speed, it's lifecycle.** Databricks' own docs say a terminated all-purpose compute autostarts when scheduled again; a new job compute terminates permanently when its job ends. That lifecycle difference, not raw performance, is what decides which one quietly bills for idle time.
- **A pool is a start-time optimization, not a cost optimization on its own.** Idle pool instances cut cluster start and autoscaling time, and Databricks doesn't charge a DBU for the idle instance itself — but the underlying cloud instance provider's own billing still applies while it sits idle, so a pool shifts cost, it doesn't erase it.
- **Spot instances never touch the driver.** Databricks' own documentation states the driver node is always on-demand on a spot cluster; only subsequent worker nodes are spot. A cost-saving configuration still has one guaranteed-stable node.
- **Photon's gain is the course's own lesson, shipped with a name and a number.** Databricks publishes a specific TPC-DS 1TB benchmark figure (2x) and a disclosed customer-observed range (3x-8x) for its C++ vectorized engine — a concrete instance of the row-at-a-time-versus-vectorized-batches idea the course already taught in the abstract (Tungsten's own JVM-native predecessor).
- **The DBU is deliberately not one number.** Databricks' pricing page states it publishes a distinct price list per SKU and cloud provider rather than a single flat DBU rate — "DBU accounting by SKU" in the syllabus names a real, documented pricing structure, not a simplification for teaching purposes.

</section>

<section data-section="production">

## Production

A team schedules a lightweight nightly job on an all-purpose cluster they already use for interactive notebook work during the day, reasoning that "it's already running anyway." Six months later, a cost review finds that cluster has never actually auto-terminated, because some interactive session touches it every few hours, well inside the auto-termination window — the nightly job's real marginal cost was never the job itself, it was an all-purpose cluster that was never really idle enough to stop billing.

</section>

<section data-section="frontier">

## Frontier

Databricks' own serverless compute plane and Photon's vectorized execution are both still actively evolving: serverless SQL warehouses are now the vendor's own recommended default over provisioned ones, a stance that didn't always hold, and Photon continues to extend coverage to more of Spark's operators over time. The comparison this topic draws (lifecycle shape, not raw speed, as the deciding factor) stays valid even as the specific feature coverage moves.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Compute is only useful once data actually arrives on it. Databricks' own answer to "a file landed in object storage, now what" is next.

</section>
