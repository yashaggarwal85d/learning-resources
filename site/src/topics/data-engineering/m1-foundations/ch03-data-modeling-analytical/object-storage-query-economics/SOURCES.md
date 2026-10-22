# Sources — de.object-storage-query-economics

## Amazon Web Services, "Amazon S3 Pricing"

URL: https://aws.amazon.com/s3/pricing/
Fetched: 2026-10-22.

Quotes:
> Pay only for what you use. There is no minimum charge. Amazon S3 cost components are storage pricing, request and data retrieval pricing, data transfer and transfer acceleration pricing, data management and insights feature pricing, replication pricing, and transform and query feature pricing.

> You pay for storing objects in your S3 buckets. The rate you're charged depends on your objects' size, how long you stored the objects during the month, and the storage class—S3 Standard, S3 Intelligent-Tiering, S3 Standard-Infrequent Access, S3 One Zone-Infrequent Access, S3 Express One Zone, S3 Glacier Instant Retrieval, S3 Glacier Flexible Retrieval (Formerly S3 Glacier), and S3 Glacier Deep Archive.

> You pay for requests made against your S3 buckets and objects. S3 request costs are based on the request type, and are charged on the quantity of requests as listed in the table below.

> DELETE and CANCEL requests are free.

Items: (1) object storage bills along several independent dimensions at once — storage, requests, and data transfer are each billed separately, not bundled into one price; (2) storage price depends on size, duration, and storage class (retrieval latency tier); (3) requests are billed by request type and count, independent of how much data each request moves; (4) this page's exact current numeric rates render client-side and are not reproducible as static text, so no specific $ figure from it is quoted as a number — only the billing dimensions themselves, disclosed honestly per CHAPTER.md.

## Google Cloud, "BigQuery pricing"

URL: https://cloud.google.com/bigquery/pricing
Fetched: 2026-10-22.

Quotes:
> On-demand pricing (per TiB). With this pricing model, you are charged for the number of bytes processed by each query. The first 1 TiB of query data processed per month is free.

> By default, queries are billed using the on-demand (per TiB) pricing model, where you pay for the data scanned by your queries.

> When you use the flat-rate compute pricing model, you purchase dedicated query processing capacity, measured in BigQuery slots. Your queries consume this capacity, and you are not billed for bytes processed.

Items: (1) on-demand query pricing charges strictly for bytes processed (scanned) by a query, regardless of how long that query's compute actually runs; (2) flat-rate/capacity pricing charges for reserved compute capacity over time instead, regardless of how many bytes a given query scans — the same workload is billed on two genuinely different axes depending on the pricing model chosen; (3) this page's exact current numeric rates are not quoted as static numbers for the same reason as the AWS page; only the two billing models' mechanics are quoted.
