Last verified against these sources: 31 October 2026. Real measurements run in this sandbox
(`examples.py`, a toy dynamic-table and join-state model, no real Flink cluster available): a
changelog-mode interpreter comparing append, upsert, and retract message counts on the same
input; a regular-vs-interval join state-size simulation over time; and a freshness-driven
refresh-mode chooser. The join taxonomy, materialised-table mechanics, process table functions,
and the delta-join/`ML_PREDICT` version facts are disclosed, sourced-only claims from Apache
Flink's own documentation and its 2.2.0 release announcement.

- Dynamic Tables (Apache Flink, 2.3 docs):
  [nightlies.apache.org/.../dynamic_tables/](https://nightlies.apache.org/flink/flink-docs-release-2.3/docs/concepts/sql-table-concepts/dynamic_tables/).
  The changelog, append/upsert/retract stream definitions this topic cites.
- Joins (Apache Flink, 2.3 docs):
  [nightlies.apache.org/.../joins/](https://nightlies.apache.org/flink/flink-docs-release-2.3/docs/sql/reference/queries/joins/).
  The regular, interval, temporal, and lookup join definitions this topic cites.
- Configuration (Apache Flink, 2.3 docs):
  [nightlies.apache.org/.../config/](https://nightlies.apache.org/flink/flink-docs-release-2.3/docs/dev/table/config/).
  The delta-join optimizer strategy option this topic cites.
- Apache Flink 2.2.0 release announcement:
  [flink.apache.org/2025/12/04/...](https://flink.apache.org/2025/12/04/apache-flink-2.2.0-advancing-real-time-data--ai-and-empowering-stream-processing-for-the-ai-era/).
  The ML_PREDICT-since-2.1 and delta-join-introduced-in-2.1 currency facts this topic cites.
- Materialized Table Overview (Apache Flink, 2.3 docs):
  [nightlies.apache.org/.../materialized-table/overview/](https://nightlies.apache.org/flink/flink-docs-release-2.3/docs/sql/materialized-table/overview/).
  The freshness and CONTINUOUS/FULL refresh-mode definitions this topic cites.
- Process Table Functions (Apache Flink, 2.3 docs):
  [nightlies.apache.org/.../ptfs/](https://nightlies.apache.org/flink/flink-docs-release-2.3/docs/dev/table/functions/ptfs/).
  The PTF definition this topic cites.
- Changelog Conversion (Apache Flink, 2.3 docs):
  [nightlies.apache.org/.../changelog/](https://nightlies.apache.org/flink/flink-docs-release-2.3/docs/sql/reference/queries/changelog/).
  The FROM_CHANGELOG/TO_CHANGELOG definitions this topic cites.
- Model Inference (Apache Flink, 2.3 docs):
  [nightlies.apache.org/.../model-inference/](https://nightlies.apache.org/flink/flink-docs-release-2.3/docs/sql/reference/queries/model-inference/).
  The ML_PREDICT function definition this topic cites.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=flink-sql-dynamic-tables:%20).
