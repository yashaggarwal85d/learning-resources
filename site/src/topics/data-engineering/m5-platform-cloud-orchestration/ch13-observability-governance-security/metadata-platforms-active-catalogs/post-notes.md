<section data-section="outcomes">

## Outcomes

Draw a metadata graph for a handful of datasets with owners, tags and a glossary term and say
what each edge answers; contrast crawl and push ingestion by measured staleness and by what
each can see, and say which a deletion needs; explain the difference between a technical
catalog and a discovery catalog and place Polaris, Unity Catalog OSS, DataHub, OpenMetadata and
a commercial catalog; state the status facts (Polaris's graduation date, Amundsen's archive
notice) with their dates and sources.

</section>

<section data-section="measuring-staleness-and-blind-spots">

## Measuring staleness and blind spots

`examples.py` runs the same rename through two toy catalogs on an identical timeline: a
`CrawlCatalog` that only updates when its own scheduled `crawl()` runs, and a `PushCatalog` that
applies every change the instant `apply_event()` is called -- the same shape DataHub's own
Metadata Change Proposal pipeline uses. At the moment of a Thursday search following a
Wednesday rename, the push catalog already shows the new name; the crawl catalog is still
showing the pre-rename state, measurably stale by the hours remaining until its next scheduled
run. A second measurement creates and drops an entity entirely between two crawl runs: the
crawl catalog's own state never contains it at any point, while the push catalog records both
the create and the drop as separate events.

</section>

<section data-section="production">

## Production failures this topic warns about

**Trusting a crawl-only catalog to be current.** The Hook's own scenario -- a Sunday crawl, a
Wednesday change, a Thursday search that still finds the stale entry -- is exactly what a
schedule-only catalog produces. Nothing about the crawl schedule changes just because the
underlying data did.

**Assuming a crawl-based catalog's silence means nothing happened.** `examples.py`'s own
create-and-drop measurement shows a crawl-based catalog's state staying completely unaware an
object ever existed when it is created and dropped entirely between two runs -- a real-world
short-lived table, a temporary export, or a quickly-reverted schema change can vanish from a
crawl-only catalog's history as if it never happened.

</section>

<section data-section="frontier">

## Frontier

This topic's own catalog entry is the object a later governance process actually operates on:
the federated governance operating model (this chapter's final topic) registers an owner and a
review cadence against exactly the kind of entity this topic's metadata graph describes. A
catalog that only describes assets, with nobody accountable for keeping an entry current, is
no better than the crawl-only catalog this topic measures as stale.

</section>
