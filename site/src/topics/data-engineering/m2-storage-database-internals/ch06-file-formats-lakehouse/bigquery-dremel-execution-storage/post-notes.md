<section data-section="outcomes">

## Outcomes

This topic is sourced entirely from the Dremel retrospective paper and Google's own current
BigQuery documentation, with no account reachable from this sandbox: Capacitor columnar storage
on Colossus, compute separated onto Borg and joined by the Jupiter network, partitioning and
clustering as two layers of pruning, materialized views' automatic maintenance, BI Engine's
in-memory caching, and the batch-load-job vs. Storage-Write-API vs. legacy-insertAll contrast --
each one a consequence of the same disaggregated design: storage and compute, split apart, then
joined back together over a network.

</section>

<section data-section="deep-dive">

## Deep-dive

Topic 6's own Dremel paper described one engine doing both jobs at once, shredding nested records
into columns on local disk. The 2020 retrospective quoted throughout this topic is that same
lineage's own account of how it changed: storage moved onto Colossus, compute moved onto a
separate Borg-managed cluster, and the nested-columnar model topic 6 introduced became the
foundation Capacitor was built on, not a replacement for it.

</section>

<section data-section="production">

## Production

Google's own docs are explicit that a materialized view only helps when a query can actually be
rerouted to it, and that BI Engine's caching is scoped to the data a project queries most often --
neither one is free to run or unconditional. Partitioning and clustering choices directly change
how many bytes a query scans, which is BigQuery's own primary cost lever on top of its separated
storage.

</section>

<section data-section="frontier">

## Frontier

The Storage Write API's exactly-once guarantee, built on tracked stream offsets, is a genuinely
newer capability than the legacy method it replaced -- the older path could only promise
best-effort delivery, with no equivalent tracking of exactly where a writer had gotten to.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Both warehouses so far disaggregate storage from compute. The next one, Redshift, descends from a
genuinely different lineage: classic shared-nothing MPP with its own nodes and slices.

</section>
