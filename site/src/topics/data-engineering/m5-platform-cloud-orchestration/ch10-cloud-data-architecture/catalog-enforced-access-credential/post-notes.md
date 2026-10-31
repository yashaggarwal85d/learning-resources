---
id: de.catalog-enforced-access-credential
title: 'Catalog-enforced access and credential vending'
---

<section data-section="outcomes">

## Outcomes

- Draw the catalog-and-vending diagram from memory and name it under at least three vendor products.
- Implement a row filter and a column mask against a real local stand-in.
- Explain Iceberg REST credential vending as the open-protocol instance of the pattern.
- Reproduce the bypass failure mode and say exactly what closes it.

</section>

<section data-section="internals">

## Internals

- **A tag-based grant covers a table that didn't exist yet when the grant was written.** Lake Formation's LF-Tags attach a grant to a key-value attribute rather than to any one object; a new table that inherits the tag inherits the grant automatically, which is exactly why a per-object grant list is the wrong mental model for how this scales.
- **Cross-account sharing is still the catalog's own grant, not a bucket policy.** AWS's own documentation describes cross-account sharing as a Lake Formation permission grant to an external account or principal, routed through AWS Resource Access Manager — the account boundary is enforced by the catalog's permission model, not by a separate S3 bucket policy or IAM resource policy.
- **Spark-native fine-grained access control runs the policy check inside the job, not beside it.** AWS Glue 5.0 and higher enforces row, column and cell-level Lake Formation policies using two Spark driver profiles in the same job — a user profile that runs the submitted code with no direct S3 or catalog access, and a system profile, holding the privileged, catalog-checked access, that actually touches storage. The older `GlueContext`/DynamicFrame path enforced only table-level control; row/column/cell enforcement needed the newer Spark DataFrame path to exist at all.
- **The Iceberg REST spec treats credential vending as something a client opts into.** A client signals which access-delegation mechanisms it supports in a comma-separated list; the server is free to honor any, none, or a subset of them — vended credentials aren't a mandatory part of the protocol, they're a capability the server can choose to extend.
- **OneLake splits control from data at the plane level, not the product level.** The same product enforces a control plane (who can manage an item) and a data plane (OneLake security, who can see which rows and columns) — two separate enforcement surfaces inside one named product, not two separate products doing the catalog's two jobs.

</section>

<section data-section="production">

## Production

A platform team migrates an overnight batch job from `GlueContext`/DynamicFrames to Spark DataFrames purely to pick up Spark-native fine-grained access control, because the row filter their Lake Formation policy already defines was silently not enforced under the table-level-only path the job used before. Nothing about the job's own logic changes; the only difference is which API surface Spark runs it through, and that difference is the one thing that decides whether the catalog's policy actually applies to this job at all.

</section>

<section data-section="frontier">

## Frontier

Every one of the five catalogs named in this topic is converging on the same mechanism (policy in the catalog, a vended, scoped, short-lived credential, never a bucket-wide key) under the Iceberg REST catalog protocol as the shared, vendor-neutral interop surface — a proprietary catalog that implements the REST spec gets credential vending for free, without reinventing it.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A catalog that already vends credentials per query is also the natural place to make someone else run a table's own upkeep — compaction, snapshot expiry, orphan file cleanup — as a service instead of a cron job an individual team owns and forgets about.

</section>
