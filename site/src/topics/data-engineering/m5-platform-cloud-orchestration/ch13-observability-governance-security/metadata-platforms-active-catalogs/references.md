Last verified: 2 November 2026. Expert sign-off: pending. Two claims run in `examples.py`
against a toy crawl-scheduler and a toy event bus (disclosed in `examples.py`'s own module
docstring as a simulated clock and in-process queue standing in for real Airflow/Kafka, since
the staleness and visibility behaviour measured is exactly what the real architectures produce)
-- all asserts pass.

- DataHub, "Ingestion Framework": [datahubproject.io](https://datahubproject.io/docs/architecture/metadata-ingestion). Push over Kafka/HTTP vs. scheduled pull.
- OpenMetadata, "High Level Design": [docs.open-metadata.org](https://docs.open-metadata.org/latest/main-concepts/high-level-design). Entity store and search engine.
- Apache Polaris, "Apache Polaris Graduates to Top Level Project!": [polaris.apache.org](https://polaris.apache.org/blog/2026/02/19/apache-polaris-graduates-to-top-level-project/). Graduation date and self-description.
- Databricks, "Databricks Open Sources Unity Catalog...": [databricks.com](https://www.databricks.com/company/newsroom/press-releases/databricks-open-sources-unity-catalog-creating-industrys-only-open). Unity Catalog OSS's own feature claims.
- Amundsen, repository README: [raw.githubusercontent.com](https://raw.githubusercontent.com/amundsen-io/amundsen/main/README.md). The archive notice, substituted for the GitHub page itself, which this sandbox's fetcher cannot reach (HTTP 403) -- confirmed to carry the identical notice via a separate direct fetch.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=metadata-platforms-active-catalogs:%20).
