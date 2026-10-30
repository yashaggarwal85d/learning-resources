<section data-section="outcomes">

## Outcomes

Name each listed tool's category (commercial vs. open-source, modeling-layer vs. plain
dashboarding); classify a given BI setup as import/extract, live-query, or Direct Lake-style, and
predict which puts load on the warehouse and when; explain headless BI as "one compiled metric,
many tools" and connect it back to the previous topic's handoff contract.

</section>

<section data-section="internals">

## Internals

Looker's own documentation describes LookML, short for the Looker Modeling Language, as "the
language that is used in Looker to create semantic data models," used to "describe dimensions,
aggregates, calculations, and data relationships" so that "Looker uses a model that is written in
LookML to construct SQL queries against a particular database." Microsoft's own Direct Lake
documentation describes the mode as loading data "quickly loaded into memory from Delta tables
available in the OneLake," with a refresh that "copies only metadata (known as framing)" rather
than a full data copy — "a few seconds" versus "considerable time," and naming the mechanism
"column loading (transcoding)" directly. Apache Superset's own site calls itself "an open-source
modern data exploration and visualization platform," and Metabase's own documentation calls
itself "an open-source business intelligence tool." Tableau's own documentation (its marketing
site, tableau.com, is unreachable in this sandbox; its documentation subdomain substituted)
describes Tableau Desktop as building "views," "maps," "a dashboard," and "a story to present,"
shared via "Tableau Server, Tableau Cloud, or Tableau Public."

</section>

<section data-section="lab">

## Lab

None, by design: this is a refresher (CHAPTER.md: "Lab: none"). Its worked example is the hook and
Prove It scenarios themselves, reasoned through the three query modes' own documented mechanism
rather than measured in code.

</section>

<section data-section="production">

## Production failures this topic warns about

**Switching a dashboard to live mode as a default fix for staleness.** Live mode's freshness comes
at the cost of querying the warehouse on every interaction instead of on a schedule; switched
without checking whether a Direct Lake-style load or a tighter extract refresh interval was
available instead, it can multiply warehouse load with no corresponding benefit beyond what a
cheaper option would already have given.

**Letting a second tool quietly recompute a metric instead of reading the compiled definition.**
The organizational promise of headless BI only holds while every tool actually reads the same
compiled metric; a tool that recomputes its own version, for any reason, reintroduces exactly the
"computed two ways" failure the previous topic's handoff exists to prevent.

</section>

<section data-section="frontier">

## Frontier

Headless BI is named here as the organizing idea the five tools' query-mode mechanics serve, not
as a feature any one vendor's documentation claims to have invented; none of the five sources
quoted in this topic use the phrase.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Any of these tools, in any mode, can still bring a warehouse to its knees if enough analysts ask
it the same expensive question at once. The next topic is the engine layer that catches that load
before the warehouse has to: pre-aggregation, materialized views, result caching and acceleration.

</section>
