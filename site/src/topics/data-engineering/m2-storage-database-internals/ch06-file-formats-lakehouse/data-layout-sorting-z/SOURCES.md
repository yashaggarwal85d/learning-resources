## Delta Lake, Use liquid clustering for Delta tables

URL: https://docs.delta.io/delta-clustering/
Version: latest (fetched 2026-11-02)

> Liquid clustering improves the existing partitioning and ZORDER techniques by simplifying data layout decisions in order to optimize query performance. Liquid clustering provides flexibility to redefine clustering columns without rewriting existing data, allowing data layout to evolve alongside analytic needs over time.

> Clustering is not compatible with partitioning or ZORDER. Once enabled, run OPTIMIZE jobs as usual to incrementally cluster data.

> Liquid clustering is incremental, meaning that data is only rewritten as necessary to accommodate data that needs to be clustered. Already clustered data files with different clustering columns are not rewritten.

> Running OPTIMIZE FULL reclusters all existing data as necessary. For large tables that have not previously been clustered on the specified columns, this operation might take hours.

> Run OPTIMIZE FULL when you change clustering columns. If you have previously run OPTIMIZE FULL and there has been no change to clustering columns, OPTIMIZE FULL runs the same as OPTIMIZE.

## Apache Iceberg, Spec (Sorting)

URL: https://iceberg.apache.org/spec/
Version: latest (fetched 2026-11-02)

> Users can sort their data within partitions by columns to gain performance. The information on how the data is sorted can be declared per data or delete file, by a sort order.

> A sort order is defined by a sort order id and a list of sort fields. The order of the sort fields within the list defines the order in which the sort is applied to the data.

> Order id 0 is reserved for the unsorted order.

> Writers should use this default sort order to sort the data on write, but are not required to if the default order is prohibitively expensive, as it would be for streaming writes.

## Databricks, Data skipping

URL: https://docs.databricks.com/en/delta/data-skipping.html
Version: fetched 2026-11-02

> Data skipping statistics are collected automatically when you write data to a Delta Lake or managed Apache Iceberg table. Databricks uses per-file statistics (minimum and maximum values, null counts, and total records) at query time to skip irrelevant files and speed up queries.

> Z-ordering is a technique to colocate related information in the same set of files. Databricks data-skipping algorithms automatically use this co-locality. This behavior reduces the amount of data that needs to be read.

> Databricks recommends that you don't use ZORDER BY on columns that don't have statistics collected because it is ineffective and uses unnecessary compute resources.

> Databricks recommends using liquid clustering for all new tables. You can't use ZORDER in combination with liquid clustering.

## Apache Hudi, Clustering

URL: https://hudi.apache.org/docs/clustering
Version: fetched 2026-11-02

> One can stitch together small files into larger files using clustering. Additionally, data can be clustered by sort key so that queries can take advantage of data locality.

> By default, Hudi sorts the file groups in the plan by the specified columns, while meeting the configured target file sizes.

> Hudi supports incremental scheduling for clustering operations, which significantly improves performance on tables with a large number of partitions. Instead of scanning all partitions during each clustering scheduling run, incremental scheduling only processes partitions that have changed since the last completed clustering operation.

> Clustering Service builds on Hudi's MVCC based design to allow for writers to continue to insert new data while clustering action runs in the background to reformat data layout, ensuring snapshot isolation between concurrent readers and writers.
