---
id: de.managed-table-services-object
title: 'Managed table services on object storage'
---

<section data-section="outcomes">

## Outcomes

- Explain what S3 Tables, BigLake Iceberg tables, Unity Catalog managed Iceberg and Snowflake-managed Iceberg each actually automate, from their own documentation, not from the general idea of "managed Iceberg."
- Price the added per-request premium of a managed table service on top of base storage.
- Name the engine-skew risk and how to guard against it.

</section>

<section data-section="internals">

## Internals

- **A table bucket is its own storage type, not a folder inside a general-purpose bucket.** AWS's own documentation describes table buckets as purpose-built for Iceberg tables, with their own namespace and access policies separate from ordinary S3 buckets.
- **This sandbox can't run any of the five real managed services, so the engine-skew mechanism is reproduced against real local metadata instead.** A real local JSON file in the exact shape of an Iceberg table-metadata file is upgraded from format-version 2 to 3, and each named engine's real, currently-documented format-version support is checked against it — the same disclosed state-machine approach topic 8 used for its own catalog-and-vending flow, not a live S3 Tables or Snowflake account.
- **Unity Catalog's claim is stronger than it first looks.** AWS's own S3 Tables REST endpoint gives external Iceberg clients read access; Databricks' Iceberg REST Catalog gives them read, write and create access to the same kind of managed table — a genuine capability gap between two products that both call themselves "managed Iceberg."
- **Snowflake's managed/externally-managed split is a per-table property, not an account-wide setting.** A single Snowflake account can hold both kinds of Iceberg table at once, each following a different maintenance rule.
- **The engine-skew example in this topic is a real, current, named gap, not a hypothetical.** AWS's own "Working with Apache Iceberg V3" documentation states plainly that Amazon Athena, one of AWS's own flagship query engines, cannot read Iceberg V3 tables — the same company shipping both the writer and the reader that can't open what it wrote.

</section>

<section data-section="production">

## Production

A platform team migrates their lakehouse's hottest table to a managed Iceberg service specifically to end a recurring compaction backlog. Six months later, the vendor ships a default upgrade to a newer Iceberg spec version as part of a routine feature release. One of the team's own BI tools, still running an older connector nobody thought to track, silently stops returning fresh data from that table — not because anything about the data changed, but because nobody treated "which spec version does every reader support" as a dependency that needed watching, the same way they'd watch a library version.

</section>

<section data-section="frontier">

## Frontier

Every one of these four services' own roadmap keeps moving: AWS is already rolling out V3 support unevenly across its own engines (EMR Spark and Glue ETL ahead of Amazon Athena); Databricks' managed Iceberg tables are still in public preview as of this chapter's research. The engine-skew risk this topic names isn't a one-time event — it's a standing property of adopting any actively-developed managed table format.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every one of these services runs on compute somewhere, billed either by the second it's reserved or by the request it serves — and that split, serverless against provisioned, is the section's last and most consequential cost question.

</section>
