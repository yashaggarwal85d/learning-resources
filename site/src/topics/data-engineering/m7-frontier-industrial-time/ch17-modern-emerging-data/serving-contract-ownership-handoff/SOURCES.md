## Vu Trinh — "How did Airbnb build their semantic layer?" (secondary write-up quoting and summarizing Airbnb's own Minerva posts)

URL: https://vutr.substack.com/p/how-did-airbnb-build-their-semantic

> Minerva took fact and dimension tables as inputs, performed data denormalization, and served the aggregated data to downstream applications.

> At the time of Airbnb's sharing, Minerva contained more than 12,000 metrics and 4,000 dimensions, with 200+ data producers across different functions and teams.

> Airflow for workflow orchestration.

> Apache Hive and Apache Spark for the compute engine.

> Presto and Apache Druid for serving.

> Standardized: Data is defined in a single place. It must serve as a single entry point for anyone searching for definitions.

## StarRocks — "Airbnb Builds a New Generation of Fast Analytics Experience with StarRocks" (independent corroboration of Minerva's scale and stack)

URL: https://www.starrocks.io/blog/airbnb-builds-a-new-generation-of-fast-analytics-experience-with-starrocks/index.html

> Minerva is a unified metrics management platform within Airbnb. It is designed with the vision to allow users to "define metrics once, use them everywhere". Minerva stores over 12,000 metrics and 4,000 dimensions.

> Previously, to accelerate queries, engineers have to denormalize data in Minerva and then use Apache Druid, Presto, Apache Spark, or Apache Hive to process queries.
