# Sources: Hybrid connectivity, egress and latency

## AWS: AWS Direct Connect | Features

URL: https://aws.amazon.com/directconnect/features/
Version: fetched 2026-10-31

> AWS Direct Connect is available in speeds starting at 50 Mbps and scaling up to 400 Gbps, so you can find the right connection for you.

> Dedicated Connections create links to AWS using a 1 Gbps, 10 Gbps,100 Gbps, and 400 Gbps Ethernet port. AWS Direct Connect Partners provide Hosted connections using pre-established network links between themselves and AWS, and are available from 50 Mbps up to 25 Gbps.

## AWS: AWS Direct Connect Pay-as-you-go Pricing

URL: https://aws.amazon.com/directconnect/pricing/pay-as-you-go/
Version: fetched 2026-10-31

> Capacity is the maximum rate that data can be transferred through a network connection. The capacity of AWS Direct Connect connections is measured in megabits per second (Mbps) or gigabits per second (Gbps). One gigabit per second, or 1 Gbps, is equal to 1,000 megabits per second (1,000 Mbps).

> When connecting to resources running in any AWS Region (such as an Amazon Virtual Private Cloud or AWS Transit Gateway) or Local Zone, there are three factors that determine pricing: capacity, port hours, and data transfer out (DTO) through your AWS Direct Connect location.

> Data transfer in refers to network traffic that is sent into AWS from outside, over AWS Direct Connect. AWS Direct Connect data transfer in is charged at $0.00 per GB in all locations.

> Port hour pricing for dedicated connections is consistent across all AWS Direct Connect locations globally, except in Japan.

## AWS: Amazon EC2 On-Demand Pricing (Data Transfer)

URL: https://aws.amazon.com/ec2/pricing/on-demand/
Version: fetched 2026-10-31

> AWS customers receive 100GB of data transfer out to the internet free each month, aggregated across all

> AWS Services and Regions (except China and GovCloud). The 100 GB free tier for data transfer out to the internet

> is global and does not apply separately or individually to AWS Regions.

> Data transferred "in" to and "out" from Amazon EC2, Amazon RDS, Amazon Redshift, Amazon DynamoDB Accelerator (DAX), Amazon ElastiCache instances, and Elastic Network Interfaces across Availability Zones in the same AWS Region is charged at $0.01/GB in each direction.

## Apache Kafka: Geo-Replication (Cross-Cluster Data Mirroring)

URL: https://kafka.apache.org/41/operations/geo-replication-cross-cluster-data-mirroring/
Version: fetched 2026-10-31

> Administrators can set up such inter-cluster data flows with Kafka's MirrorMaker (version 2), a tool to replicate data between different Kafka environments in a streaming manner. MirrorMaker is built on top of the Kafka Connect framework and supports features such as:

> Replicates consumer groups including offsets to migrate applications between clusters

> Preserves partitioning

> Fault-tolerant and horizontally scalable operations

> Note: Geo-replication with MirrorMaker replicates data across Kafka clusters. This inter-cluster replication is different from

> It is also recommended to filter records from aborted transactions out from replicated data when running MirrorMaker. To do this, ensure that the consumer used to read from source clusters is configured with isolation.level set to read_committed.

## Wikipedia: Bandwidth-delay product

URL: https://en.wikipedia.org/wiki/Bandwidth-delay_product
Version: fetched 2026-10-31

> In data communications, the bandwidth-delay product is the product of a data link's capacity (in bits per second) and its round-trip delay time (in seconds).

> The result, an amount of data measured in bits (or bytes), is equivalent to the maximum amount of data on the network circuit at any given time, i.e., data that has been transmitted but not yet acknowledged.

> A high bandwidth-delay product is an important problem case in the design of protocols such as Transmission Control Protocol (TCP) in respect of TCP tuning, because the protocol can only achieve optimum throughput if a sender sends a sufficiently large quantity of data before being required to stop and wait until a confirming message is received from the receiver, acknowledging successful receipt of that data. If the quantity of data sent is insufficient compared with the bandwidth-delay product, then the link is not being kept busy and the protocol is operating below peak efficiency for the link.

> The TCP window scale option may be used to solve this problem caused by insufficient window size, which is limited to 65,535 bytes without scaling.
