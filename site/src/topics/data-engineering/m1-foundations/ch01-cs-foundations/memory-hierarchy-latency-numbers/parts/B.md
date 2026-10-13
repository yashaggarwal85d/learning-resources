## Best practices design patterns: optimizing Amazon S3 performance
URL: https://docs.aws.amazon.com/AmazonS3/latest/userguide/optimizing-performance.html
Version: Amazon S3 User Guide, current docs page (no edition date shown; fetched 2026-10-12)
> For example, your application can achieve at least 3,500 PUT/COPY/POST/DELETE or 5,500 GET/HEAD requests per second per partitioned Amazon S3 prefix.

> There are no limits to the number of prefixes in a bucket.

> For example, if you create 10 prefixes in an Amazon S3 bucket to parallelize reads, you could scale your read performance to 55,000 read requests per second.

> These applications can achieve consistent small object latencies (and first-byte-out latencies for larger objects) of roughly 100–200 milliseconds.

> These data lake applications achieve single-instance transfer rates that maximize the network interface use for their Amazon EC2 instance, which can be up to 100 Gb/s on a single instance.

> For example, if you want higher transfer rates over a single HTTP connection or single-digit millisecond latencies, use Amazon CloudFront or Amazon ElastiCache for caching with Amazon S3.

Contents:
- Request rates: at least 3,500 write-type and 5,500 read-type requests/s per prefix; unlimited prefixes; scaling is gradual with temporary 503 Slow Down
- Data lake pattern: single instance up to 100 Gb/s, aggregate to multiple terabits/s across instances
- Latency-sensitive apps: roughly 100-200 ms small-object and first-byte latency
- CloudFront / ElastiCache for single-digit ms; Transfer Acceleration for distance; KMS request limits
- Note on S3 Express One Zone / directory buckets
- NOT stated here: 85-90 MB/s per request, 8 or 16 MB range sizes (not found in fetchable AWS pages)

## Performance guidelines for Amazon S3
URL: https://docs.aws.amazon.com/AmazonS3/latest/userguide/optimizing-performance-guidelines.html
Version: Amazon S3 User Guide, current docs page (no edition date shown; fetched 2026-10-12)
> You can achieve the best performance by issuing multiple concurrent requests to Amazon S3.

> Amazon S3 doesn't have any limits for the number of connections made to your bucket.

> You can use concurrent connections to Amazon S3 to fetch different byte ranges from within the same object.

> This helps you achieve higher aggregate throughput versus a single whole-object request.

> Aggressive timeouts and retries help drive consistent latency.

> To optimize performance, we recommend that you access the bucket from Amazon EC2 instances in the same AWS Region when possible.

> This helps reduce network latency and data transfer costs.

Contents:
- Measure performance (network throughput, CPU, DRAM; DNS time, latency, transfer speed; monitor 503s)
- Scale connections horizontally (S3 as a large distributed system, not a single endpoint)
- Byte-range fetches (Range header, concurrent ranges, smaller ranges improve retry; align GETs to multipart part sizes)
- Retries for latency-sensitive apps
- Same-Region EC2 and S3 (Region-level, not AZ-level, statement)
- Transfer Acceleration; latest SDKs and Transfer Manager
- NOT stated: numeric range size or per-request MB/s

## Performance design patterns for Amazon S3
URL: https://docs.aws.amazon.com/AmazonS3/latest/userguide/optimizing-performance-design-patterns.html
Version: Amazon S3 User Guide, current docs page (no edition date shown; fetched 2026-10-12)
> When you make smaller requests (for example, less than 512 KB), where median latencies are often in the tens of milliseconds range, a good guideline is to retry a GET or PUT operation after 2 seconds.

> When you make large variably sized requests (for example, more than 128 MB), we advise tracking the throughput being achieved and retrying the slowest 5 percent of the requests.

> As a general rule, when you download large objects from Amazon S3, we suggest making concurrent requests to maximize network throughput and optimize download performance.

> This parallel download approach helps fully use your network interface card (NIC) capacity.

> For example, if processing one request at a time leads to a CPU usage of 25 percent, it suggests that up to four concurrent requests can be accommodated.

Contents:
- Caching (CloudFront, ElastiCache) for low latency
- Timeouts and retries: 503 above roughly 5,000 req/s to few objects, exponential backoff, retry with new connection and fresh DNS
- Small requests (<512 KB) median latency tens of ms; retry after 2 s then 4 s
- Horizontal scaling and parallelization: multiple connections, Transfer Manager, start with one request and measure the bottleneck resource, connection pooling, DNS spread
- Transfer Acceleration

## Amazon EC2 instance network bandwidth
URL: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-network-bandwidth.html
Version: Amazon EC2 User Guide, current docs page (no edition date shown; fetched 2026-10-12)
> Instance bandwidth specifications apply to both inbound and outbound traffic for the instance.

> When instances are not in the same cluster placement group, bandwidth for single-flow traffic is limited to 5 Gbps.

> Use a cluster placement group to achieve up to 10 Gbps bandwidth for instances within the same placement group.

> Configure ENA Express for eligible instances within the same Availability Zone to achieve up to 25 Gbps between those instances.

> For example, an m5.8xlarge instance has 32 vCPUs and 10 Gbps network bandwidth, and an m5.16xlarge instance has 64 vCPUs and 20 Gbps network bandwidth.

> To meet additional demand, they can use a network I/O credit mechanism to burst beyond their baseline bandwidth.

Contents:
- Bandwidth applies per direction (in and out simultaneously)
- Multi-flow via internet/local gateway: 5 Gbps if under 32 vCPUs, 50% if over
- Single-flow limits: 5 Gbps outside a cluster placement group, 10 Gbps inside, 25 Gbps with ENA Express in one AZ; MPTCP option
- Bandwidth scales with vCPUs; "up to" instances burst via credits (typically 5 to 60 minutes) above baseline
- Example c5 baselines in Gbps (0.75 for c5.large to 25 for c5.18xlarge)
- Does not itself list a 100 Gbit/s instance type (see the S3 page for "up to 100 Gb/s")

## Placement groups for your Amazon EC2 instances
URL: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/placement-groups.html
Version: Amazon EC2 User Guide, current docs page (no edition date shown; fetched 2026-10-12)
> Cluster – Packs instances close together inside an Availability Zone.

> This strategy enables workloads to achieve the low-latency network performance necessary for tightly coupled node-to-node communication that is typical of high-performance computing (HPC) applications.

> Placement groups are optional.

Contents:
- Four strategies: cluster, partition, spread, precision time
- Cluster packs instances in one AZ for low latency; no numeric latency stated
- Default placement spreads instances across hardware to minimize correlated failures
- Rules and limits; no charge
