# Pre-notes: Databricks compute model and Photon

- **All-purpose cluster.** Compute meant to stay available between jobs; it autostarts when scheduled again after terminating.
- **Job cluster.** Compute created for one job and terminated the moment that job ends, with no restart.
- **Cluster pool.** A set of idle, ready-to-use instances that cuts a new cluster's start and autoscaling time; Databricks doesn't bill a DBU for an instance idling in the pool.
- **Spot instance.** A cheaper, revocable instance type; on a Databricks cluster the driver node is always on-demand, only worker nodes are spot.
- **Photon.** Databricks' own vectorized execution engine, written in C++, substituted for parts of Spark's JVM-based execution.
- **SQL warehouse.** A Databricks compute type purpose-built for BI/SQL querying, distinct from an all-purpose cluster used for notebooks or ETL.
- **DBU.** The Databricks Unit, the platform's normalized billing currency, priced differently per SKU (all-purpose, jobs, SQL warehouse, serverless) and per cloud.
