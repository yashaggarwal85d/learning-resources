# Sources: Metadata platforms and active catalogs (`de.metadata-platforms-active-catalogs`)

DataHub's own ingestion-framework documentation, OpenMetadata's own high-level design
documentation, Apache Polaris's own graduation blog post, Databricks' own Unity Catalog OSS
announcement, and the Amundsen repository's own README are all fetched directly.

## DataHub documentation — Ingestion Framework

URL: https://datahubproject.io/docs/architecture/metadata-ingestion
Version: v1.8.0, retrieved 2026-11-02

> DataHub supports an extremely flexible ingestion architecture that can support push, pull, asynchronous and synchronous models.

> Metadata Change Proposals can be sent over Kafka, for highly scalable async publishing from source systems. They can also be sent directly to the HTTP endpoint exposed by the DataHub service tier to get synchronous success / failure responses.

> DataHub ships with a Python based metadata-ingestion system that can connect to different sources to pull metadata from them. This metadata is then pushed via Kafka or HTTP to the DataHub storage tier.

Contents: push and pull as two separate paths into the same catalog -- push over Kafka as a
Metadata Change Proposal event, pull as a scheduled Python recipe -- the exact "pull crawlers
vs push/event-based ingestion" clause.

## OpenMetadata documentation — High Level Design

URL: https://docs.open-metadata.org/latest/main-concepts/high-level-design
Version: retrieved 2026-11-02

> Entity Store: MySQL storage that contains real-time information on the state of all the Entities and their Relationships.

> Search Engine: Powered by ElasticSearch, it is the indexing system for the UI to help users discover the metadata.

Contents: the independent second open-source discovery/governance catalog's own architecture
page, naming its entity store and search engine as the same shape DataHub's own metadata-store-
plus-search architecture uses.

## Apache Polaris — "Apache Polaris Graduates to Top Level Project!"

URL: https://polaris.apache.org/blog/2026/02/19/apache-polaris-graduates-to-top-level-project/
Version: 19 February 2026

> We are thrilled to announce that Apache Polaris has officially graduated from the Apache Incubator to become a Top Level Project (TLP) at the Apache Software Foundation (ASF).

> For those who are new to the project, Polaris is a cloud-native, open-source catalog for Apache Iceberg.

> It provides a centralized service to manage your data across different engines and clouds, ensuring that your Iceberg tables remain interoperable and secure.

> By providing a vendor-neutral implementation of the Apache Iceberg REST Catalog spec, Polaris solves one of the biggest headaches in modern data architecture: vendor lock-in.

Contents: Polaris's own graduation date and its own description of itself as a vendor-neutral,
Iceberg-REST-Catalog-spec implementation -- the primary source for the "top-level ASF project
since Feb 2026" clause and for naming it a technical catalog.

## Databricks — "Databricks Open Sources Unity Catalog, Creating the Industry's Only Universal Catalog for Data and AI"

URL: https://www.databricks.com/company/newsroom/press-releases/databricks-open-sources-unity-catalog-creating-industrys-only-open
Version: retrieved 2026-11-02

> Unity Catalog OSS offers a universal interface that supports any data format and compute engine, including the ability to read tables with Delta Lake, Apache Iceberg™, and Apache Hudi™ clients via Delta Lake UniForm.

> With its open APIs and Apache 2.0 licensed open source server, Unity Catalog OSS maximizes flexibility and customer choice by enabling broad interoperability across various engines, tools, and platforms.

> Unity Catalog OSS enables unified governance across tabular data, non-tabular data, and AI assets, such as ML models and generative AI tools, letting organizations simplify management, discovery and development at scale.

Contents: Unity Catalog OSS's own description of itself as a universal, Apache-2.0-licensed
table catalog spanning multiple formats and engines -- the primary source naming it a technical
catalog alongside Polaris.

## Amundsen repository README (amundsen-io/amundsen)

URL: https://raw.githubusercontent.com/amundsen-io/amundsen/main/README.md
Version: retrieved 2026-11-02

Note on source naming: GitHub's own repository page (`github.com/amundsen-io/amundsen`) returns
an HTTP 403 to this sandbox's fetcher; the identical README text, served from the same
repository's raw content host, is used instead and confirmed by a separate fetch of the GitHub
page itself to carry the same archived notice and date.

> Due to inactivity, this project was archived in September 2026. The contents will remain available for historical purposes.

Contents: the repository's own archive notice and date -- confirms the syllabus's "Amundsen is
now low-activity" clause understates the actual, stronger fact (archived, not merely
low-activity).
