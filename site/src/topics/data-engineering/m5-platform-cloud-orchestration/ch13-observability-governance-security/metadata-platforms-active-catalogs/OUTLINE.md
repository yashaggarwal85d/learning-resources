# Outline — de.metadata-platforms-active-catalogs

## Syllabus line (full, four clauses)

"architecture of metadata graphs: pull crawlers vs push/event-based ingestion (change-log
streams), search, usage statistics, glossary; open source (DataHub, OpenMetadata, Unity Catalog
OSS, Apache Polaris — top-level ASF project since Feb 2026 — as technical catalogs) vs enterprise
(Collibra, Atlan, Alation); technical vs business catalog; Amundsen is now low-activity."

Clauses used verbatim in `coverage.json`:
1. "architecture of metadata graphs: pull crawlers vs push/event-based ingestion (change-log
   streams), search, usage statistics, glossary"
2. "open source (DataHub, OpenMetadata, Unity Catalog OSS, Apache Polaris — top-level ASF project
   since Feb 2026 — as technical catalogs) vs enterprise (Collibra, Atlan, Alation)"
3. "technical vs business catalog"
4. "Amundsen is now low-activity"

## Concept ledger

- `introduces`: `metadata-graph-entities-relationships` (entities, aspects/attributes,
  relationships as a graph — DataHub's and OpenMetadata's own vocabulary), `crawl-vs-push-ingestion`
  (pull-based crawling on a schedule versus push-based events, and the staleness window each
  implies), `technical-vs-business-catalog` (where are the files / who may read them, versus what
  does this mean / who owns it / is it certified).
- `uses`: no concept this topic needs was introduced by an earlier topic specifically for this
  purpose; the governance context (classification, access policy, masking, erasure) is named as
  what a catalog entry eventually links to, not a mechanism this topic's own concepts are built
  from. `declared`: none — this is the first topic of §13.3, opening new ground rather than
  building on §13.1–13.2's mechanisms.

## Research note: the Amundsen claim and this session's GitHub access

`CHAPTER.md` cites the Amundsen repository's own archived-by-owner banner. This session's GitHub
tool access is scoped to `yashaggarwal85d/learning-resources` only, and `amundsen-io/amundsen`
returns HTTP 403 through this sandbox's fetch path (both `node scripts/sources.mjs fetch` and a
direct `curl` fail; only the `WebFetch` tool's own renderer could reach the page). The banner text
was still read and quoted exactly via `WebFetch` on 2026-10-30 — "This repository was archived by
the owner on Sep 29, 2026. It is now read-only." / "Due to inactivity, this project was archived
in September 2026." — but it is **not** in `SOURCES.md`, because `sources.mjs check` cannot
independently re-verify a URL it cannot fetch. The claim is carried in `FACT-CHECK.md` as a
directly-observed, dated, verbatim-quoted fact instead, flagged as unverifiable-by-the-automated-
checker rather than silently treated as equivalent to the other seven sourced quotes.

## Storyboard (10 steps)

1. **Hook** — the shop's catalog was last crawled on Sunday. On Wednesday a table is dropped,
   another created, and a column renamed. A stakeholder searches Thursday and finds the old
   table — still marked certified.
2. **Predict** — crawl more often, switch to push, or both — which actually closes the gap, and
   why?
3. **Reveal: what a catalog actually stores** — entities as nodes (a table, a column, a person, a
   tag), relationships as named edges between them, held in a searchable graph. (clause 1 part 1)
4. **Reveal: two ways metadata gets in** — a crawler sweeps a source system on a schedule; a
   push integration emits metadata the instant code runs. One has a staleness window exactly as
   wide as its schedule; the other doesn't. (clause 1 part 2, takeaway)
5. **Reveal: what the catalog is actually used for, day to day** — search ranked by usage to find
   a dataset, query counts and freshness to trust it, a glossary of business terms to agree on
   what it means. (clause 1 part 3)
6. **Reveal: open source vs enterprise, named** — DataHub, OpenMetadata, Unity Catalog OSS and
   Apache Polaris as open technical catalogs; Collibra, Atlan and Alation as enterprise products,
   named without a feature claim beyond what's sourced. (clause 2)
7. **Reveal: technical catalog vs business catalog** — one answers "where are this table's files
   and who may read them"; the other answers "what does this column mean, who owns it, is it
   certified, where does it come from." (clause 3, takeaway)
8. **Reveal: a name worth retiring** — the syllabus still calls Amundsen "low-activity"; its own
   repository says something stronger: archived by its owner, for inactivity. (clause 4, takeaway)
9. **Recap** — a catalog is a graph of entities and relationships; crawling has a staleness
   window a push doesn't; search, trust and meaning are the three daily jobs; open source and
   enterprise both exist; technical and business catalogs answer different questions; and names
   from a syllabus can go stale faster than the syllabus itself.
10. **Prove it** — a new scenario: the same shop adds push-based ingestion for its tables, but
    its dashboards are still only crawled nightly. On Wednesday a dashboard changes. Is the
    catalog's view of that dashboard current by Thursday, or still stale — and why?

## Changes from the chapter plan

Renumbered the storyboard to 9 reveals + hook/predict/recap/prove-it = 11 steps (not the 10
originally sketched in `CHAPTER.md`'s own outline, which doesn't fix a step count) — matches this
chapter's own established convention for topics without a lab.

## Engagement placement

- Hook + first predict: steps 1–2 (within the first four).
- Takeaways: steps 7, 8, and (folded) within that range — two explicit takeaways at steps 7 and
  8, both after the reel's own midpoint (step 5–6 of 11); a third isn't force-fit where the
  content doesn't call for one beyond the two the clauses themselves support most directly.
- Recap: step 9.
- Second predict: step 10 ("Prove it"), applying the crawl-vs-push distinction to a second data
  type (dashboards) still on the crawl path, rather than recalling step 4's claim about tables.
