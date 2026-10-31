## BigQuery Pricing (Google Cloud)

URL: https://cloud.google.com/bigquery/pricing
Version: retrieved 2026-10-30

> On-demand pricing (per TiB). With this pricing model, you are charged for the number of bytes processed by each query.

> When you run a query against a clustered table, and the query includes a filter on the clustered columns, BigQuery uses the filter expression to prune the blocks scanned by the query.

Contents: the on-demand billing model charging by bytes processed per query, not by cluster
size or time running; how a clustered table's column-filtered query prunes the blocks actually
scanned, directly reducing the billed bytes; the alternative capacity-based (slot-time) pricing
model for workloads that want a predictable cost instead of a per-byte scan charge.

## Amazon S3 Pricing

URL: https://aws.amazon.com/s3/pricing/
Version: retrieved 2026-10-30

> Pay only for what you use. There is no minimum charge. Amazon S3 cost components are storage pricing, request and data retrieval pricing, data transfer and transfer acceleration pricing, data management and insights feature pricing, replication pricing, and transform and query feature pricing.

> You pay for storing objects in your S3 buckets. The rate you're charged depends on your objects' size, how long you stored the objects during the month, and the storage class

Contents: object storage billed across six distinct cost components (storage, request/retrieval,
transfer, data-management features, replication, transform/query features), not one single line;
storage priced by the combination of object size, duration stored and storage class, so the same
bytes cost differently depending on which tier they sit in.
