# Fact-check — de.bi-tools-as-warehouse

## Claims table

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | Google Cloud's own LookML documentation: LookML is the Looker Modeling Language, used to create semantic data models, describing dimensions, aggregates, calculations and data relationships; Looker uses a model written in LookML to construct SQL queries against a database. | Google Cloud, Introduction to LookML | Verified, quoted |
| 2 | LookML is a dependency language, not an imperative one; independent of particular SQL dialects. | Google Cloud, Introduction to LookML | Verified, quoted |
| 3 | Microsoft's own Direct Lake overview: Direct Lake loads data from OneLake's Delta tables directly into memory for high-performance interactive analysis of large data volumes. | Microsoft Fabric, Direct Lake overview | Verified, quoted |
| 4 | A Direct Lake refresh copies only metadata ("framing"), unlike an Import refresh, which copies the whole data volume — a few seconds versus considerable time and capacity resources. | Microsoft Fabric, Direct Lake overview | Verified, quoted |
| 5 | Direct Lake on SQL analytics endpoints falls back to DirectQuery mode when it can't load data directly from a Delta table. | Microsoft Fabric, Direct Lake overview | Verified, quoted |
| 6 | Direct Lake's column loading is named "transcoding" in Microsoft's own documentation; Direct Lake semantic models are subject to documented Fabric capacity guardrails by SKU. | Microsoft Fabric, Direct Lake overview | Verified, quoted |
| 7 | Apache Superset's own site: an open-source modern data exploration and visualization platform that connects to any SQL-based database, including cloud-native databases at petabyte scale. | Apache Superset, Welcome | Verified, quoted |
| 8 | Metabase's own documentation: an open-source business intelligence tool connecting to many popular databases, letting users ask questions and see answers as charts or tables. | Metabase Learn, A tour of Metabase | Verified, quoted |
| 9 | Tableau's own help documentation: Tableau Desktop builds views, maps, dashboards and stories from data, shared via Tableau Server, Tableau Cloud or Tableau Public. | Tableau Help, Get started tutorial | Verified, quoted |
| 10 | (This course) headless BI as the organizing idea: one compiled metric (topic 8's semantic layer), consumed identically by any of the five tools named here, in any of the three query modes. | This topic's own synthesis, connecting topic 8's mechanism to this topic's tool survey | Stated as this course's own connecting claim, not attributed to any vendor |

## Currency check

- Every vendor documentation quote (Google Cloud/LookML, Microsoft/Direct Lake, Superset, Metabase,
  Tableau) is read from each project's own live documentation page at research time (30 October
  2026), not from a cached or historical snapshot, and presented as that vendor's own description
  of its own product, never as an independently verified performance claim.
- CHAPTER.md's own scope line names this topic a refresher whose "one real teaching point is the
  three query modes and what each costs the warehouse" — this topic follows that by keeping each
  tool's own description to a single categorizing quote (what it is, what category it's in) and
  spending its depth on the query-mode mechanism instead, which is where the actual new content is.
- No vendor comparative benchmark number (load time, query latency) is quoted from any source in
  this topic; the only load-direction claims made (import/extract hits the warehouse on refresh,
  live-query hits it on every interaction) come from the query modes' own documented mechanism,
  not from a vendor's own performance figure.

## Red team

1. **Does giving each tool one categorizing line risk oversimplifying what LookML, Power BI,
   Tableau, Superset and Metabase actually do?** CHAPTER.md's own "Leaves out" line says plainly
   that no tool's modeling-language syntax is retaught here (Chapter 3's semantic layer is the
   generic version) — the one-line category per tool is the intended depth for a 5-minute
   refresher whose real content is the query-mode mechanism, not a tool-by-tool feature tour.
2. **Is "headless BI" this topic's own invented term, or does it risk being presented as if a
   vendor coined it?** The term is introduced in post-notes.md and the reel as this course's own
   name for the mechanism (topic 8's compiled metric, consumed by any tool), explicitly not
   attributed to any of the five named vendors — none of the five sources quoted here use the
   phrase "headless BI."
3. **Does the Direct Lake "transcoding" claim risk overstating what the overview page itself
   covers, since the deeper mechanism lives on a separate "How Direct Lake works" page this topic
   did not fetch?** No — the overview page itself names "column loading (transcoding)" directly and
   links to the deeper page for mechanism details; this topic's claim (that transcoding is
   per-column, on-demand, without a separate import step) is drawn from the overview's own
   framing-vs-import contrast (claim 4) and its explicit naming of the term (claim 6), not from
   content only the deeper page would contain.
4. **Is the hook's "cost triples overnight" number invented?** Yes, deliberately, as a hook
   framing device, not a cited statistic — the hook is phrased as a scenario ("the warehouse's
   query cost triples overnight"), and the reel's resolution rests on the documented mechanism
   (import/extract hits the warehouse only on refresh; live-query hits it on every interaction),
   not on the specific multiplier, which never appears as a claim in coverage.json's expert items
   or FACT-CHECK's claims table.
5. **Could Tableau's substituted help.tableau.com source be read as less authoritative than the
   other four vendors' pages, since it's a tutorial page rather than a product-overview page?** The
   quoted lines (claim 9) describe what a user does in Tableau Desktop — build views, maps,
   dashboards, stories, and share them via Server/Cloud/Public — which is exactly the
   "dashboarding tool" categorization this topic needs, and it is still Tableau's own documentation
   (help.tableau.com), not a third party's description; the substitution is only of URL (marketing
   site to docs subdomain), not of source ownership, and is documented in SOURCES.md.

## Problem Solving

`www.tableau.com` returned HTTP 403 to this sandbox's fetcher on every marketing-site URL tried
(the homepage and the "what is Tableau" page), consistent with the domain-wide bot-detection
pattern already seen on medium.com and github.com web pages in earlier topics of this chapter.
Rather than attempting the already-denied archive/proxy bypass routes, substituted
`help.tableau.com` — Tableau's own documentation subdomain, still a primary Tableau source — which
fetched cleanly on the first try (its "Get Started" overview page) and, after that page proved too
thin on its own words, its linked "Tutorial: Get Started with Tableau Desktop" page, which gave a
clean, directly-quotable categorization of what Tableau Desktop does. All other four sources
(Google Cloud, Microsoft, Superset, Metabase) fetched on the first URL tried, no substitution
needed.
