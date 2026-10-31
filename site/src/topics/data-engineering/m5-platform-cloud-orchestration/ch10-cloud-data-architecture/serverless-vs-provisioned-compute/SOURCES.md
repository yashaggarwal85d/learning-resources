## AWS Glue pricing

URL: https://aws.amazon.com/glue/pricing/
Version: fetched 2026-10-31

> A single Data Processing Unit (DPU) provides 4 vCPU and 16 GB of memory.

> You are billed in increments of 1 second, rounded up to the nearest second, with a 1-minute minimum duration per run.

> The price of 1 DPU-hour is $0.44.

## AWS Glue: tracking processed data using job bookmarks

URL: https://docs.aws.amazon.com/glue/latest/dg/monitor-continuations.html
Version: fetched 2026-10-31

> AWS Glue tracks data that has already been processed during a previous run of an ETL job by persisting state information from the job run. This persisted state information is called a job bookmark.

> Job bookmarks help AWS Glue maintain state information and prevent the reprocessing of old data.

## AWS Glue: configuring job properties for Spark jobs (worker types)

URL: https://docs.aws.amazon.com/glue/latest/dg/add-job.html
Version: fetched 2026-10-31

> The resources available on AWS Glue workers are measured in DPUs. A DPU is a relative measure of processing power that consists of 4 vCPUs of compute capacity and 16 GB of memory.

> Each worker maps to 1 DPU (4 vCPUs, 16 GB of memory) with 94GB disk (approximately 44GB free).

## AWS EMR Serverless pricing

URL: https://aws.amazon.com/emr/pricing/
Version: fetched 2026-10-31

> You pay for the amount of vCPU, memory, and storage resources consumed by your applications.

> rounded up to the nearest second with a 1-minute minimum.

## AWS EMR Serverless: configuring an application (pre-initialized capacity)

URL: https://docs.aws.amazon.com/emr/latest/EMR-Serverless-UserGuide/application-capacity.html
Version: fetched 2026-10-31

> With EMR Serverless, configure the applications that you use. For example, set the maximum capacity that an application can scale up to, configure pre-initialized capacity to keep driver and workers ready to respond, and specify a common set of runtime and monitoring configurations at the application level.

## Google Cloud Dataproc Serverless pricing

URL: https://cloud.google.com/dataproc-serverless/pricing
Version: fetched 2026-10-31

> Data Compute Units (DCUs), shuffle storage, and any attached accelerators. Scale-to-zero ensures you never pay for idle capacity.

> billed per second based on the Data Compute Units (DCUs) consumed during execution.

> By default, each serverless batch and interactive session consumes a minimum of 12 DCUs for the duration of the workload.

> Each vCPU and Gigabyte of memory consumed per hour is converted to DCUs using these standard rates:

> 1 Driver: 4 vCPUs and 16 GiB of RAM (consumes 4 DCUs)

> 2 Executors: 4 vCPUs and 16 GiB of RAM per executor (consumes 8 DCUs total)

> If the serverless batch workload runs with 12 DCUs for 24 hours in the us-central1 region and consumes 25GB of shuffle storage, the price calculation is as follows:

> Total compute cost = 12 * 24 * $0.060000 = $17.28

## Databricks pricing

URL: https://www.databricks.com/product/pricing
Version: fetched 2026-10-31

> A Databricks Unit (DBU) is a normalized unit of processing power on the Databricks Lakehouse Platform used for measurement and pricing purposes.

> The number of DBUs a workload consumes is driven by processing metrics, which may include the compute resources used and the amount of data processed.

## Google BigQuery: understand slots

URL: https://docs.cloud.google.com/bigquery/docs/slots
Version: fetched 2026-10-31

> A BigQuery slot is a virtual compute unit used by BigQuery to execute SQL queries, Python code, or other job types.

> By default, you are charged using the on-demand model. With this model, you are charged for the amount of data processed (measured in TiB) by each query.

> With the capacity-based model, you pay for the slot capacity allocated for your queries over time. This model gives you explicit control over total slot capacity.

> You are charged for the number of scaled slots, not the number of slots used.

> By default, capacity is billed per second with a one-minute minimum duration.
