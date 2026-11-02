# Fact-check — de.bi-serving-layer-performance

## Claims table

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | Google Cloud's own BI Engine documentation: "a fast, in-memory analysis service that accelerates many SQL queries in BigQuery by intelligently caching the data that you use most frequently." | Google Cloud, Introduction to BI Engine | Verified, quoted |
| 2 | BI Engine preferred tables let acceleration be limited to a specified set of tables; queries to all other tables use regular BigQuery slots. | Google Cloud, Introduction to BI Engine | Verified, quoted |
| 3 | BI Engine is most optimized for leaf-level subqueries; unaccelerated stages fall back to standard execution slots without failing the query. | Google Cloud, Introduction to BI Engine | Verified, quoted |
| 4 | BI Engine's join acceleration: a large fact table joined with up to four smaller dimension tables, on leaf-level INNER/LEFT OUTER joins. | Google Cloud, Introduction to BI Engine | Verified, quoted |
| 5 | BI Engine's named exclusions: JSON type columns, wildcard tables, external tables, row-level security, non-SQL user-defined functions. | Google Cloud, Introduction to BI Engine | Verified, quoted |
| 6 | Databricks' disk caching automatically stores a local copy of remote Parquet data on first read; later reads run locally and are significantly faster. In SQL warehouses, the legacy CACHE SELECT command is ignored in favor of this automatic mechanism. | Databricks, Optimize performance with caching on Databricks | Verified, quoted |
| 7 | Databricks' disk cache automatically detects created/deleted/modified/overwritten data files and invalidates/evicts stale entries itself, with no need to explicitly invalidate cached data. | Databricks, Optimize performance with caching on Databricks | Verified, quoted |
| 8 | (This course) a cache's invalidation policy must be tied to the source's own freshness SLA, not a fixed timer, to stay correct — the generic claim both named engines' own automatic invalidation mechanisms instantiate concretely. | This topic's own synthesis, connecting topic 8's term to both vendors' documented mechanisms | Stated as this course's own connecting claim, not attributed to either vendor |
| 9 | (This course) rollup tables, materialized views and result caching are the same lever at three granularities, chosen by data-change-rate vs. query-repeat-rate — reused by name from this course's earlier chapters (not yet live). | This course's own prior material, named forward per CHAPTER.md | Reused by name, not re-derived; consistent with this chapter's established pattern for not-yet-live prerequisite material |
| 10 | (This course) a concurrency ceiling is a distinct failure mode from a slow query — exceeding it produces queueing regardless of individual query speed, sized against a stated usage pattern in this topic's own worked scenario. | This topic's own worked scenario | This course's own synthesis of the documented reservation/capacity-unit mechanism named generically by both vendors (BI Engine reservations, SQL warehouse capacity) |

## Currency check

- Both vendor documentation quotes (Google Cloud's BI Engine page, Databricks' disk-cache page)
  are read from each project's own live documentation page at research time (30 October 2026);
  the Databricks page's own "Last updated on Oct 22, 2026" byline confirms it is current, not a
  stale cached snapshot.
- CHAPTER.md's own scope line separates "any engine's full pricing model" from what this topic
  needs (reasoning about a concurrency ceiling); this topic follows that by quoting each engine's
  documented mechanism and limits, never a specific SKU price or capacity-unit dollar figure.
- Databricks SQL is named per CHAPTER.md as "the comparable warehouse-native acceleration layer...
  read at the level its own documentation states for this course rather than assumed from
  BigQuery's design" — this topic's Databricks claims (6, 7) are drawn entirely from Databricks'
  own disk-cache mechanism, not inferred by analogy to BI Engine's preferred-tables model, which is
  architecturally different (automatic, file-level, local-disk vs. a reserved, table-level,
  in-memory allocation).

## Red team

1. **Is it fair to call Databricks SQL's disk cache "comparable" to BI Engine when the two
   mechanisms work differently (automatic local-disk caching of files vs. a reserved in-memory
   allocation of named tables)?** CHAPTER.md itself anticipates this by instructing that
   Databricks SQL be "read at the level its own documentation states for this course rather than
   assumed from BigQuery's design" — this topic follows that instruction by describing each
   engine's actual documented mechanism separately (claims 2-5 for BI Engine, 6-7 for Databricks),
   never asserting they work the same way, only that both are named, vendor-documented
   acceleration layers with their own stated limits.
2. **Does naming BI Engine's four-dimension-table join limit risk reading as an arbitrary,
   possibly outdated number?** No — it is quoted directly from BI Engine's own current
   documentation (claim 4), alongside the specific size restrictions on those dimension tables
   (fewer than 5 million rows; 5 GiB unpartitioned or 1 GiB per referenced partition), both read at
   research time, not from a cached or historical version of the page.
3. **Is the claim that rollups/materialized views/result caching are "the same lever at three
   granularities" an oversimplification?** The topic's own framing names the actual distinguishing
   axis (how often the underlying data changes vs. how often the query repeats) rather than
   treating the three as interchangeable — a rollup table and a materialized view differ mainly in
   how they're populated and queried, while result caching differs by operating at the query layer
   instead of the data layer; CHAPTER.md's own outcome line asks the learner to choose between them
   by this axis specifically, which is what step 3's reveal and the recap both state.
4. **Could the hook's "thirty seconds every Monday morning" and the Prove It's "doubled refresh
   frequency" numbers be read as cited statistics rather than illustrative scenarios?** Both are
   explicitly scenario framing devices, not sourced claims — neither number appears in
   coverage.json's expert items or this fact-check's claims table, and the reel's resolution rests
   on the documented mechanism (a concurrency ceiling, once exceeded, produces queueing regardless
   of query speed), not on either specific number.
5. **Does calling a concurrency ceiling "a reservation size, a capacity unit count" risk
   conflating BigQuery's and Databricks' differently-named capacity mechanisms?** The phrasing is
   intentionally generic (claim 10) precisely because this topic does not commit to either
   vendor's specific unit name as authoritative; CHAPTER.md itself uses the same generic phrasing
   ("a reservation size, a capacity unit count") rather than picking one vendor's term, and neither
   vendor's specific capacity-sizing documentation is quoted as a source for this topic's own
   worked scenario.

## Problem Solving

Both sources fetched cleanly on the first URL tried; no substitution was needed. One wrinkle: BI
Engine's documentation used to be split across a separate "limitations" page (referenced by
CHAPTER.md's own phrasing, "limitations page"), but Google has since merged that content into the
single "Introduction to BI Engine" page used here — the legacy limitations-page URL slug now
returns HTTP 404. All the specific limitation claims CHAPTER.md asks for (the four-dimension-table
join limit, the named exclusions) are present on the current merged page and quoted from it
directly (claims 2-5), so no content was lost to the restructuring, only the URL changed.
