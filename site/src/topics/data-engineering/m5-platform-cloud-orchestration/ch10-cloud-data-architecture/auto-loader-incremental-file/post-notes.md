---
id: de.auto-loader-incremental-file
title: 'Auto Loader incremental file ingestion'
---

<section data-section="outcomes">

## Outcomes

- Choose between directory-listing and file-notification discovery for a given file-arrival pattern and name what each costs.
- Explain how the checkpointed seen-file set gives exactly-once file ingestion.
- Configure a schema-evolution mode and predict what happens to an unexpected column.
- Decide between Auto Loader and `COPY INTO` for a given ingestion shape.

</section>

<section data-section="internals">

## Internals

- **Directory listing's cost model is a direct instance of the course's own cost-anatomy lesson.** Databricks' own documentation states listing's cost scales with files ingested rather than directories scanned — the same request-cost ledger the course taught generically, now with a concrete mechanism and a vendor behind it.
- **Order is never guaranteed, in either mode.** Databricks explicitly disclaims discovery/processing order for both directory listing and file notification — any pipeline logic depending on files arriving in a particular order has to build that guarantee itself, on top of Auto Loader, not assume Auto Loader provides it.
- **The four schema-evolution modes aren't four degrees of the same behaviour — they're genuinely different failure/recovery shapes.** `addNewColumns` trades a one-time failure for an automatically wider schema; `rescue` trades schema stability for never failing; `failOnNewColumns` refuses to resume until a human intervenes. A learner who treats these as interchangeable safety levels has missed that each picks a different thing to sacrifice.
- **The rescued-data column is deliberately not a catch-all error log.** Databricks' own documentation is specific: it captures a JSON blob of the mismatched fields plus the source file path, structured enough to be queried and replayed later — not a dead-letter dump meant only for manual inspection.
- **`COPY INTO` and Auto Loader's checkpoint solve the same idempotency problem at different operational tempos.** Both are idempotent at the file level, but `COPY INTO` is built for a periodic batch load while Auto Loader's checkpoint underlies an always-on stream — the decision between them is about operating cadence, not which one is "better."

</section>

<section data-section="production">

## Production

A team runs Auto Loader in `rescue` mode specifically so a schema surprise never takes their pipeline down at 3 a.m. Six months later, nobody has ever looked at the `_rescued_data` column, and a partner's silently-renamed field has been accumulating there the entire time, invisible to every downstream dashboard that only ever queried the expected columns — the mode that saved the pipeline from crashing also quietly hid the problem from the people who should have fixed it.

</section>

<section data-section="frontier">

## Frontier

Auto Loader's own feature set keeps moving: automatic type widening (`addNewColumnsWithTypeWidening`) is still in public preview as of this chapter's research, and file notification's support matrix differs by cloud storage provider and Databricks Runtime version, per Databricks' own compatibility table. The decision rules this topic teaches (cost shape by discovery mode, failure shape by schema-evolution mode) stay valid even as the specific feature-availability table keeps changing underneath them.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Discovering and ingesting files is only useful if the result is governed the moment it lands — and Databricks' governance layer, which this chapter's catalog-and-vending pattern takes a concrete, fully-worked shape in, is next.

</section>
