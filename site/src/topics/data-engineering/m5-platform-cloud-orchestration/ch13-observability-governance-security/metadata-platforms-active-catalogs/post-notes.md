<section data-section="outcomes">

## Outcomes

Describe a catalog as a graph of entities and relationships and name what each stores; say why a
scheduled crawl always carries a staleness window a push integration doesn't; name the three
things a catalog is used for day to day; place a given open-source or enterprise product
correctly as technical or business; check a primary source's own current state against a
syllabus label and say which one to trust.

</section>

<section data-section="internals">

## Internals

`examples.py`'s `staleness_window_for_crawl` is deliberately plain modular arithmetic, not a
simulation of a real crawler, because the point is structural: a crawl's own staleness window is
set entirely by its schedule, regardless of which tool runs it. `MetadataGraph` is a minimal
stand-in for DataHub's or OpenMetadata's own entity/aspect/relationship model — nodes with typed
attributes, named directed edges — used here to show `search_by_usage` correctly ranking a
low-traffic, long-stale "certified" table behind a fresher, heavily-queried one, and
`technical_vs_business_answers` pulling two genuinely different answers (where it lives and who
reads it, versus who owns it and what it's tagged with) out of the same entity.

</section>

<section data-section="lab">

## Lab: none of its own

This topic hosts no lab of its own (`CHAPTER.md`'s own line for it); the entry it describes feeds
topic 13's self-serve registration flow.

</section>

<section data-section="production">

## Production failures this topic warns about

**Trusting a "certified" label without checking its own freshness.** A table crawled weeks ago
and never re-crawled can still carry whatever certification tag it had then — the label itself
doesn't expire just because the data underneath it changed.

**Treating catalog freshness as one property of the whole system.** Moving one source (tables, a
warehouse) to push doesn't touch any other source (dashboards, a BI tool) still sitting on a
nightly crawl — each integration has its own freshness, not the catalog as a whole.

</section>

<section data-section="frontier">

## Frontier

Lineage events and the lineage graph itself (topic 11) and quality assertions (topic 12) are both
catalog-adjacent but out of scope here, per `CHAPTER.md`'s own "leaves out" line. The open-catalog
protocol and table-format mechanics a technical catalog like Polaris or Unity Catalog sits on top
of were built in Chapter 6 §6.3.4, assumed rather than re-explained here. No declared
cross-chapter gap: this topic doesn't structurally depend on an earlier chapter's concept id,
only on background reading named in its own prerequisites panel.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A catalog can store a lineage edge, but someone has to produce it. If each tool invents its own
format, every catalog needs a custom connector per tool. The next topic is the open standard jobs
use to report what they read and wrote: OpenLineage.

</section>
