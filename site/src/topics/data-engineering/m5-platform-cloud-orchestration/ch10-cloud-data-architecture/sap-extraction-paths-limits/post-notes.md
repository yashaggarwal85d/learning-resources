---
id: de.sap-extraction-paths-limits
title: 'SAP extraction paths and their limits'
---

<section data-section="outcomes">

## Outcomes

- Name SAP's four extraction mechanisms and what each can and cannot see (deletes, intermediate states, latency).
- State SAP Note 3255746's actual restriction precisely, and explain why it is a legal constraint, not a technical one.
- Explain what Datasphere and SAP Business Data Cloud represent in SAP's own strategy, including the Databricks partnership.
- Design an effective-dated extraction for a SuccessFactors-style HR feed and name its special-category handling obligation.

</section>

<section data-section="internals">

## Internals

- **A mechanism's delta-capability is not a performance detail — it decides what a pipeline can even notice.** OData's own documented limitation is that it cannot reliably surface deletes the way a trigger- or log-based mechanism can; choosing OData for a feed that must notice deletions is a correctness bug baked in at the design stage, not a tuning problem.
- **A support note's wording changes meaning over its own version history, and the change is the content.** The same note described third-party ODP use as merely unsupported, then later as an outright prohibition — reading only the current wording misses that this is a licensing clock that has already ticked once and can tick again.
- **CDS views exist precisely because the raw tables underneath are not meant to be read directly.** An extraction tool that bypasses a CDS view for the raw table it's built on inherits every cryptic field name and undocumented join the view existed to hide.
- **An effective-dated record is not a staleness problem, it is a visibility problem.** A query whose as-of date falls outside a record's effective window doesn't get an old version of that record back — it gets nothing, which looks identical to "this record doesn't exist yet" and nothing like "this record is out of date."
- **Special-category HR data raises the cost of getting the as-of date wrong, not just the likelihood.** The same filtering behavior that drops a promoted position from a report also drops a corrected health-related field from a compliance extract, and the regulatory stakes of the latter are categorically higher.

</section>

<section data-section="production">

## Production

A connector built two years ago against SAP's ODP framework over RFC has run every night without an error. A new compliance review reads SAP Note 3255746's current wording and flags the connector as unlicensed — not because any run failed, but because the note's own history moved the ground under a pipeline that never changed.

</section>

<section data-section="frontier">

## Frontier

SAP's own push toward Datasphere and SAP Business Data Cloud, including its February 2025 Databricks partnership, is this topic's own text describing where SAP's current direction points, not a prediction of what every customer will eventually be forced onto. The four-mechanism delta-capability comparison and the effective-dated-record query rule stay the right questions to ask about any future extraction path, whichever one SAP's strategy eventually settles on.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

SAP extraction is still, in the end, reading from a database or an API. A factory floor's PLCs and historians are not databases at all, and the one rule that matters most there has no SAP equivalent: a slow analytics consumer must never be able to push back on a production line.

</section>
