# Fact-check — de.metadata-platforms-active-catalogs

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | Metadata change proposals can be sent over Kafka for async publishing, or directly to the service tier's HTTP endpoint for a synchronous response; a Python-based system pulls metadata on a schedule. | DataHub documentation | Confirmed, quoted verbatim. |
| 2 | An entity store holds real-time entity/relationship state; a search engine (ElasticSearch) indexes metadata for discovery. | OpenMetadata documentation | Confirmed, quoted verbatim. |
| 3 | Apache Polaris graduated from the Apache Incubator to a Top Level Project at the ASF, per its own blog post dated 19 February 2026. | Apache Polaris | Confirmed, quoted verbatim. |
| 4 | Polaris describes itself as a cloud-native, open-source catalog for Apache Iceberg, providing a vendor-neutral implementation of the Iceberg REST Catalog spec. | Apache Polaris | Confirmed, quoted verbatim. |
| 5 | Unity Catalog OSS offers a universal interface across Delta Lake, Iceberg and Hudi via UniForm, with an Apache-2.0-licensed open-API server. | Databricks | Confirmed, quoted verbatim. |
| 6 | Unity Catalog OSS enables unified governance across tabular data, non-tabular data, and AI assets. | Databricks | Confirmed, quoted verbatim. |
| 7 | The Amundsen repository was archived due to inactivity in September 2026; its contents remain available for historical purposes. | Amundsen repository README | Confirmed, quoted verbatim. |
| 8 | At the moment of a Thursday search following a Wednesday rename, a push-based catalog already shows the new state; a crawl-based catalog on a weekly schedule still shows the pre-rename state. | This course's own measurement (`examples.py`) | Confirmed, assert passes. |
| 9 | A table created and dropped entirely between two scheduled crawl runs is never present in a crawl-based catalog's own state at any point. | This course's own measurement (`examples.py`) | Confirmed, assert passes. |
| 10 | The same table's create and drop are both recorded as separate events by a push-based catalog. | This course's own measurement (`examples.py`) | Confirmed, assert passes. |

## Red-team: the predict questions (steps 3 and 6)

**Question 1 (step 3):** the Wednesday rename -- does a crawl-based catalog or a push-based one
show it first on Thursday?

**Attack -- "the crawl-based one has had almost a full day since the change to catch up."** A
day is not a crawl. `examples.py`'s own measurement runs the crawl on a weekly schedule
regardless of how much wall-clock time has passed since the last change -- the crawl-based
catalog has no way to act on the rename until its own next scheduled run actually fires, no
matter how long that is away.

**Question 2 (step 6):** a table created and dropped between two crawl runs -- does the
crawl-based catalog ever see it existed?

**Attack -- "it will show up as deleted once the next crawl catches up."** This assumes a
crawler diffs against its own history, but a crawler only ever reads the source as it currently
is. `examples.py`'s own `CrawlCatalog.crawl()` replaces its entire known state with a fresh read
of the source at crawl time; if the table is already gone by then, nothing in that read
mentions it, so there is no "deleted" entry to produce.

## Abandoned approaches

Measuring a real Airflow-scheduled crawler against a real Kafka-backed event pipeline was
considered, but spinning up both for a 15-minute topic's own measurement would cost far more
sandbox setup than the staleness/visibility behaviour being demonstrated requires; the toy
`CrawlCatalog`/`PushCatalog` model isolates exactly the mechanism (schedule-bound refresh vs.
instant event application) that the real systems' own documentation describes, without needing
either real service running. Measuring Polaris and Unity Catalog OSS's actual REST Catalog
interoperability directly (the same client reading both) was also considered, but that
mechanism is already this chapter's own Chapter 6 §6.3.4 topic's subject -- re-measuring it here
would duplicate that topic's own work rather than this topic's distinct focus on catalog
architecture and the open-source landscape.
