# Outline — de.bi-tools-as-warehouse

## Outcomes (from CHAPTER.md)

Name each listed tool's category (commercial vs open-source, modeling-layer vs plain dashboarding);
classify a given BI setup as import/extract, live-query, or Direct Lake-style, and predict which
puts load on the warehouse and when; explain headless BI as "one compiled metric, many tools" and
connect it back to topic 8's handoff contract.

## 8-step storyboard (refresher, ~5 min)

1. **Hook.** A BI admin moves a dashboard from "extract" mode to "live" mode for fresher data, and
   the warehouse's query cost triples overnight with no change to the dashboard itself.
2. **Predict: which mode would have given fresh data without that cost.** (Correct: a Direct
   Lake-style on-demand load where available, or a deliberate refresh-interval choice on extract —
   not live mode by default.)
3. **Reveal: the tools, by category.** Looker/LookML as a modeling layer with its own
   metric-definition language (Chapter 3's semantic layer, commercially ancestral); Power BI and
   Tableau as the two dominant commercial dashboarding tools; Superset and Metabase as the
   open-source alternatives. No takeaway (reel test's reference step).
4. **Reveal: import/extract.** A copy of the data lives inside the BI tool; dashboards are fast,
   the warehouse is hit only on refresh. Takeaway.
5. **Reveal: live-query.** Every interaction re-queries the warehouse directly; freshness is
   perfect, warehouse load scales with usage. Takeaway.
6. **Reveal: Direct Lake's transcoding.** Power BI's Direct Lake loads OneLake's Delta tables
   on demand, per column, the first time it's queried, without a separate import step — import-like
   speed without an import's staleness, inside Fabric's own documented guardrails, with a fallback
   to DirectQuery when it can't load directly. Takeaway.
7. **Reveal: headless BI.** Once a metrics layer exists (topic 8), any of these tools can consume
   the same compiled metric instead of each tool re-encoding its own version of "active users" —
   topic 8's organizational promise, shown from the tool side. Takeaway.
8. **Recap.**
9. **Prove it.** A different dashboard, on Metabase this time, shows "active users" sliding out of
   sync with the Looker dashboard a week later. What's the first thing to check? (Correct: whether
   both tools are reading the same compiled metric from the semantic layer, or whether one of them
   quietly recomputed its own version — the handoff topic 8 taught, not a tool bug.)

## Engagement arc

- Predicts: step 2 and the closing "Prove it" step.
- No takeaway on step 3 (reel test's reference "from" step).
- Takeaways on steps 4, 5, 6, 7 (four takeaways).

## Post-notes headings

Outcomes; Internals (the three query modes and Direct Lake's transcoding, by each vendor's own
documentation); Lab (none — a refresher); Production (what load each mode puts on a real
warehouse); Frontier (headless BI as the organizing idea); Where this goes next (acceleration
engines that make live-query and headless BI fast enough to use at scale).

## Bridge / handoff

Bridge (answers topic 8's handoff verbatim): "A contract names what the mart promises. It says
nothing about which actual tool an analyst opens to use it. This refresher is that tool: Looker,
Power BI, Tableau and the open-source alternatives, and the three different ways any of them can
actually query the warehouse underneath."

Handoff (leads into topic 10): "Any of these tools, in any mode, can still bring a warehouse to its
knees if enough analysts ask it the same expensive question at once. The next topic is the engine
layer that catches that load before the warehouse has to: pre-aggregation, materialized views,
result caching and acceleration."

## Concept ledger

Introduces: `bi-query-modes-import-live-direct`, `headless-bi-many-tools-one-metric`.
Uses: `de-to-bi-handoff-contract`, `grain-and-freshness-documentation` (topic 8);
`semantic-layer-metric-compilation` (Chapter 3, live).
Declared: basic familiarity with a dashboard as a user sees one.

## Claims list (for FACT-CHECK.md)

1. Google Cloud's own LookML documentation: LookML is the Looker Modeling Language, used to create
   semantic data models, describing dimensions, aggregates, calculations and data relationships;
   Looker uses a model written in LookML to construct SQL queries against a database.
2. LookML is a dependency language, not an imperative one; independent of particular SQL dialects.
3. Microsoft's own Direct Lake overview: Direct Lake loads data from OneLake's Delta tables
   directly into memory for high-performance interactive analysis, for large volumes of data.
4. A Direct Lake refresh copies only metadata ("framing"), unlike an Import refresh which copies
   the whole data volume — a few seconds versus considerable time and capacity resources.
5. Direct Lake on SQL analytics endpoints falls back to DirectQuery mode when it can't load data
   directly from a Delta table (e.g. a SQL view, or SQL-based granular access control).
6. Direct Lake's column loading is named "transcoding" in Microsoft's own documentation, and Direct
   Lake semantic models are subject to documented Fabric capacity guardrails by SKU.
7. Apache Superset's own site: an open-source modern data exploration and visualization platform
   that connects to any SQL-based database, including cloud-native databases at petabyte scale.
8. Metabase's own documentation: an open-source business intelligence tool connecting to many
   popular databases, letting users ask questions and see answers as charts or tables.
9. Tableau's own help documentation (help.tableau.com, since tableau.com's marketing site 403s this
   sandbox's fetcher domain-wide): Tableau Desktop builds views, maps, dashboards and stories from
   data, shared via Tableau Server, Tableau Cloud or Tableau Public.
10. (This course) headless BI as the organizing idea: one compiled metric (topic 8's semantic
    layer), consumed identically by any of the five tools named here, in any of the three modes.
