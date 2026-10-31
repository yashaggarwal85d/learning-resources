---
id: de.gdpr-by-design-pipelines
title: 'GDPR by design in pipelines'
---

<section data-section="outcomes">

## Outcomes

- Design a purpose tag and a minimisation rule applied at ingestion time.
- Implement a retention job that actually deletes data on schedule from its purpose tag.
- Generate an Art. 30 record automatically from lineage and purpose metadata.
- State what triggers a DPIA and what a 72-hour breach clock actually requires to be ready in advance.

</section>

<section data-section="internals">

## Internals

- **Purpose limitation is a reuse rule, not a collection rule.** It's easy to conflate purpose limitation with minimisation or storage limitation because all three sound like "be careful with data" — but only purpose limitation governs whether a later, different use of already-collected data is allowed at all.
- **A purpose tag only does work if it's checked before the query runs, not after.** `examples.py`'s own reproduction shows the same record allowed for a matching purpose and blocked for a mismatched one — the check has to sit between the query and the data, not in a report generated afterward.
- **Minimisation is a decision made once, at ingestion — not a cleanup job run later.** A field a purpose never needed and a field a purpose needed once but no longer needs are two different problems; this topic only teaches the first.
- **An Art. 30 record generated from lineage is only as complete as the lineage and tags underneath it.** A job that writes to a dataset outside the lineage system's visibility produces an incomplete record that still looks complete — the record's trustworthiness depends entirely on lineage coverage, not on the generation mechanism being correct.
- **DPIA triggers are three specific categories, not a vague seriousness threshold.** A learner who treats "could this be sensitive?" as the test has missed that Article 35 names exactly three triggering categories, checkable precisely rather than argued about.

</section>

<section data-section="production">

## Production

A team builds a purpose-tag enforcement check at the query layer, confident it now blocks every incompatible reuse of its data. A new analytics tool bypasses that layer entirely by reading the underlying files directly, and the same data gets reused for a purpose it was never tagged for — the enforcement point was never wrong, it just never covered every path to the data.

</section>

<section data-section="frontier">

## Frontier

The EU's Digital Omnibus proposal is actively revisiting parts of the GDPR framework, including how pseudonymised data is treated (see the CJEU's *EDPS v SRB* ruling, named in the §13.2 topic this one forward-references), which could shift exactly which data counts as personal in the first place. The mechanisms this topic teaches — a purpose tag checked before use, a retention job that actually deletes, a record of processing assembled from lineage rather than maintained by hand, and a precisely-triggered DPIA — stay the right design regardless of exactly how the surrounding legal text continues to evolve.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

GDPR by design governs what a pipeline may do with data it holds. It says nothing yet about where that data is allowed to physically sit, or who outside the EU might be legally entitled to demand it — which is a harder, more architectural question, and the one this section ends on.

</section>
