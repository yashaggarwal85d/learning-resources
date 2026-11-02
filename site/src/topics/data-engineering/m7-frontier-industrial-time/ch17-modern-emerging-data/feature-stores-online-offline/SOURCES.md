## Offline store (Feast documentation)

URL: https://docs.feast.dev/v0.63-branch/getting-started/components/offline-store
Version: v0.63-branch, "Last updated 5 months ago" per the page, fetched 2026-10-30

> An offline store is an interface for working with historical time-series feature values that are stored in data sources.

> Offline stores are primarily used for two reasons:
>
> Building training datasets from time-series features.
>
> Materializing (loading) features into an online store to serve those features at low-latency in a production setting.

> Only a single offline store can be used at a time. Moreover, offline stores are not compatible with all data sources; for example, the BigQuery offline store cannot be used to query a file-based data source.

Contents:
- Offline store: an interface over historical, time-series feature values already sitting in a data source — not a store Feast owns outright, but a query layer over one (BigQuery, a file, Snowflake, etc.)
- Two uses of the offline store: building training datasets, and materializing into the online store — the exact "one definition, two destinations" split this topic teaches
- Only one offline store active at a time, and it's not universally compatible with every data source — the pluggability this topic names but does not build

## Online store (Feast documentation)

URL: https://docs.feast.dev/v0.63-branch/getting-started/components/online-store
Version: v0.63-branch, "Last updated 5 months ago" per the page, fetched 2026-10-30

> Feast uses online stores to serve features at low latency. Feature values are loaded from data sources into the online store through materialization, which can be triggered through the materialize command (either with specific timestamps or using --disable-event-timestamp to materialize all data with current timestamps).

> The storage schema of features within the online store mirrors that of the original data source. One key difference is that for each entity key, only the latest feature values are stored. No historical values are stored.

Contents:
- Online store: populated by materialization from the offline store's data sources, keeps only the latest value per entity key (no history) — the mechanism behind this topic's "stale online value" skew cause, since materialization is a scheduled job with a lag, not an instant mirror

## Features and Feature Groups (Hopsworks documentation)

URL: https://docs.hopsworks.ai/latest/concepts/fs/feature_group/fg_overview
Version: "latest" docs branch, fetched 2026-10-30

> By default, the online store keeps only the latest values of features for a feature group. It serves those precomputed features to models at runtime, and is backed by RonDB, a low latency, high throughput, high availability data store.

> The offline store stores the historical values of features for a feature group so that it may store much more data than the online store. Offline feature groups are used, typically, to create training data for models, but also to retrieve data for batch scoring of models.

Contents:
- Hopsworks' own offline/online split, independently described: online store keeps only latest values, serves at runtime, backed by RonDB (a specific low-latency KV engine, named for comparison, not taught); offline store holds history, feeds training data and batch scoring — the same two-pipe shape as Feast's, from a second named vendor, used to show the pattern is architectural and not one vendor's idiosyncrasy

## Tecton is Joining Databricks to Power Real-Time Data for Personalized AI Agents (Databricks Blog)

URL: https://www.databricks.com/blog/tecton-joining-databricks-power-real-time-data-personalized-ai-agents
Version: live page, dated August 22, 2025 on the page itself, fetched 2026-10-30

> Tecton is the leading real-time enterprise feature store that helps enterprises leverage their mission-critical data to power AI agents for use cases like fraud detection, risk scoring, and personalization.

> Bringing Tecton into Databricks will unite the best in online data serving with Databricks' Agent Bricks, empowering customers to build, deploy and scale AI agents faster and more confidently than ever before.

Contents:
- The acquisition's own date (August 22, 2025, per the post's own dateline) and stated purpose (unite Tecton's online/real-time data serving with Databricks' Agent Bricks, for building and scaling AI agents) — exactly the fact this topic states and re-verifies, not repeated from a news aggregator
- Tecton's own self-description as a real-time enterprise feature store, named use cases (fraud detection, risk scoring, personalization) — used to place Tecton as a commercial, real-time-focused counterpart to Feast's open-source reference architecture
