Last verified: 30 October 2026. Expert sign-off: pending. Four synthetic experiments run in
`examples.py` (plain arithmetic and a dict-based graph model, never a real DataHub, OpenMetadata,
Unity Catalog or Polaris instance): a crawl-staleness calculation, a push-staleness calculation
(zero), a usage-ranked search over a small synthetic graph, and a technical-vs-business answer
pair pulled from the same entity — all asserts pass.

- DataHub, "What is DataHub? (Concepts)": [docs.datahub.com](https://docs.datahub.com/docs/what-is-datahub/datahub-concepts). Entities, aspects and relationships as a metadata graph.
- DataHub, "Metadata Ingestion": [docs.datahub.com](https://docs.datahub.com/docs/metadata-ingestion). Pull-based crawling versus push-based events.
- OpenMetadata, "High Level Design": [docs.open-metadata.org](https://docs.open-metadata.org/latest/main-concepts/high-level-design). The API/UI/ingestion-framework architecture; relationships as graph nodes.
- Apache Polaris, "Apache Polaris Graduates to Top-Level Project": [polaris.apache.org](https://polaris.apache.org/blog/2026/02/19/apache-polaris-graduates-to-top-level-project/). Graduation from the Apache Incubator, 19 February 2026.
- Databricks, "Unity Catalog": [databricks.com](https://www.databricks.com/product/unity-catalog). Unified governance across data, models, agents and apps.
- Amundsen's own GitHub repository (`amundsen-io/amundsen`), its archive banner: read and quoted via `WebFetch` on 2026-10-30 — "archived by the owner on Sep 29, 2026," "due to inactivity." Not independently re-verifiable by this repo's own `sources.mjs check` in this session (GitHub access scoped elsewhere; see `FACT-CHECK.md`).

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=metadata-platforms-active-catalogs:%20).
