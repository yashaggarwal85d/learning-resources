# Fact-check — de.metadata-platforms-active-catalogs

| # | Claim in the reel | Source | Verdict |
|---|---|---|---|
| 1 | DataHub: an entity is the primary node in the metadata graph; an aspect describes a facet of an entity; a relationship is a named edge between two entities. | DataHub concepts docs | Verbatim. |
| 2 | DataHub's pull-based integrations crawl data systems on a schedule; push-based integrations emit metadata directly from code as it happens. | DataHub metadata-ingestion docs | Verbatim. |
| 3 | OpenMetadata is the integration of three blocks: a core API, a UI serving layer, and an ingestion framework as the interface to external sources. | OpenMetadata high-level-design docs | Verbatim. |
| 4 | OpenMetadata stores relationships as graph nodes, with the edge holding the relationship's type. | OpenMetadata high-level-design docs | Verbatim. |
| 5 | Apache Polaris officially graduated from the Apache Incubator to become a Top Level Project, 19 February 2026. | Apache Polaris's own blog post | Verbatim. |
| 6 | Unity Catalog is Databricks' unified governance solution for data, models, agents and apps, used to manage all data and AI assets across any cloud or platform. | Databricks Unity Catalog product page | Verbatim. |
| 7 | Amundsen's own GitHub repository was archived by its owner on 29 September 2026, stated reason "inactivity." | Amundsen repository's own archive banner, read via WebFetch on 2026-10-30 | Verbatim quote, **not independently re-verifiable by `sources.mjs check`** — see the note below and in `OUTLINE.md`. |
| 8 | A technical catalog answers "where are this table's files and who may read them"; a business catalog answers "what does this column mean, who owns it, is it certified, where does it come from." | `CHAPTER.md`'s own framing of the syllabus clause | Reasoned paraphrase of a widely-used distinction in the catalog space, not independently sourced to one vendor's own wording. |
| 9 | Collibra, Atlan and Alation are named as enterprise catalog products. | `CHAPTER.md`'s own scope ("named only") | Named without a feature claim, per the chapter's own instruction — no product-page quote attached. |

## Note on claim 7 (Amundsen)

This session's GitHub tool access is scoped to `yashaggarwal85d/learning-resources` only, and a
direct fetch of `github.com/amundsen-io/amundsen` returns HTTP 403 through both `curl` and
`node scripts/sources.mjs fetch` in this sandbox — only the `WebFetch` tool's own rendering path
could reach the page. The banner text was read and quoted exactly through that path, timestamped
2026-10-30, but because `sources.mjs check` cannot independently re-fetch and re-verify it, it is
carried here in `FACT-CHECK.md` rather than in `SOURCES.md`, and flagged rather than treated as
equivalent to the seven sourced quotes above.

## Red-team analysis

- **Predict question (step 2):** the trap is assuming "crawl more often" alone closes the gap —
  it only narrows the staleness window, it doesn't eliminate it, and a push-based integration is
  the only approach the sourced docs describe as event-driven rather than scheduled.
- **Amundsen claim (step 8):** red-teamed against the syllabus's own wording ("low-activity") —
  the repository's own banner states something categorically stronger (archived, for inactivity,
  by the owner), which the topic states as a correction to the syllabus rather than agreement
  with it, consistent with `CHAPTER.md`'s own instruction ("the topic says what the page says and
  flags the syllabus wording as outdated").
- **Predict question (step 11, "Prove it"):** tests whether the reader generalises the
  crawl-vs-push distinction to a second artefact type (dashboards) still on the crawl path while
  tables have moved to push — the catalog's freshness is per-integration, not a single
  property of the whole system.
