## AWS: S3 Pricing

URL: https://aws.amazon.com/s3/pricing/
Version: fetched 2026-10-31

> Pay only for what you use. There is no minimum charge. Amazon S3 cost components are storage pricing, request and data retrieval pricing, data transfer and transfer acceleration pricing, data management and insights feature pricing, replication pricing, and transform and query feature pricing.

> You pay for storing objects in your S3 buckets. The rate you're charged depends on your objects' size, how long you stored the objects during the month, and the storage class

> You pay for requests made against your S3 buckets and objects. S3 request costs are based on the request type, and are charged on the quantity of requests as listed in the table below.

> LIST requests for any storage class are charged at the same rate as S3 Standard PUT, COPY, and POST requests. DELETE and CANCEL requests are free.

Contents: object storage billed across six distinct cost components, not one single line; storage priced by the combination of object size, duration stored and storage class; requests billed by request type and count, independent of the bytes moved; a LIST call costs the same as a PUT, and a DELETE costs nothing — so a million-tiny-file layout racks up PUT-rate charges on every LIST of its own directory, not just on writing the files.

## AWS: Amazon EC2 On-Demand Pricing (Data Transfer)

URL: https://aws.amazon.com/ec2/pricing/on-demand/
Version: fetched 2026-10-31

> AWS customers receive 100GB of data transfer out to the internet free each month, aggregated across all

> AWS Services and Regions (except China and GovCloud). The 100 GB free tier for data transfer out to the internet

> is global and does not apply separately or individually to AWS Regions.

> Data transferred "in" to and "out" from Amazon EC2, Amazon RDS, Amazon Redshift, Amazon DynamoDB Accelerator (DAX), Amazon ElastiCache instances, and Elastic Network Interfaces across Availability Zones in the same AWS Region is charged at $0.01/GB in each direction.

> Data transferred between Amazon EC2, Amazon RDS, Amazon Redshift, Amazon ElastiCache instances, and Elastic Network Interfaces in the same Availability Zone is free.

Contents: a 100 GB/month free tier for internet egress, shared globally across every AWS service and region rather than granted per region; cross-AZ transfer billed at $0.01/GB in each direction (so a round trip costs twice); same-AZ transfer between these services costing nothing at all — the same bytes crossing a zone boundary are the only thing that changes the bill.

## AWS: Amazon VPC Pricing (NAT Gateway)

URL: https://aws.amazon.com/vpc/pricing/
Version: fetched 2026-10-31

> If you choose to create a NAT gateway in your VPC, you are charged for each "NAT Gateway-hour" that your gateway is provisioned and available. Data processing charges apply for each gigabyte processed through the NAT gateway regardless of the traffic's source or destination.

> You also incur standard AWS data transfer charges for all data transferred via the NAT gateway.

> NAT Gateway Hourly Charge: NAT Gateway is charged on an hourly basis. For this region, the rate is $0.045 per hour.

> NAT Gateway Data Processing Charge: 1 GB data went through the NAT gateway. The Data Processing charge will result in a charge of $0.045.

> To avoid the NAT Gateway Data Processing charge in this example, you could set up a gateway Type VPC endpoint and route the traffic to/from S3 through the VPC endpoint instead of going through the NAT Gateway. There are no data processing or hourly charges for using Gateway Type VPC endpoints.

Contents: a NAT gateway charges an hourly fee ($0.045/hour in US East Ohio) and separately a per-GB data-processing fee ($0.045/GB), on top of whatever ordinary data-transfer charge already applied to that traffic — so the same gigabyte can appear as three separate line items; a VPC gateway endpoint for S3 bypasses the NAT gateway (and its processing fee) entirely for that traffic.

## Microsoft Azure: Bandwidth Pricing

URL: https://azure.microsoft.com/en-us/pricing/details/bandwidth/
Version: fetched 2026-10-31

> Between regions within North America

> $0.02 per GB

> Between regions within Middle East and Africa

> $0.08 per GB

> Between regions within South America

> $0.16 per GB

> From North America, Europe to any destination

> Next 10 TB/Month

> $0.087 per GB

> Next 350 TB/Month

> $0.05 per GB

Contents: inter-region transfer priced by which two regions, not a flat worldwide rate — $0.02/GB within North America versus $0.16/GB to or within South America, an 8× spread for the same operation; internet egress itself tiered by volume, with the per-GB rate falling from $0.087/GB to $0.05/GB as monthly volume climbs past 10 TB.

## Google Cloud: Network pricing (Cloud NAT, VM-to-VM)

URL: https://cloud.google.com/vpc/network-pricing
Version: fetched 2026-10-31

> Data transfer to a different Google Cloud zone in the same Google Cloud region when using the internal or external IP addresses within the same VPC network

> $0.01

> Cloud NAT pricing is based on the following usage: An hourly price for the NAT gateway that is based on the number of VM instances that are using the gateway. The per-hour rate is capped at 32 VM instances.

> A per-GiB cost for data transfer that is processed by the gateway. The data processing price is the same across all regions. Data transfer costs to send traffic from the VM out of the network also apply.

> $0.0014 / 1 hour

> $0.045 / 1 gibibyte

Contents: cross-zone VM-to-VM transfer priced at $0.01/GiB, matching AWS's own cross-AZ rate even though the two clouds use different names for the same boundary; Cloud NAT billed on the identical three-part shape as AWS's NAT gateway (an hourly gateway fee, a per-GiB data-processing fee, and the ordinary egress charge for traffic that leaves the network) — and its $0.045/GiB processing fee happens to land on the exact same number as AWS's NAT gateway processing fee, a coincidence worth flagging rather than treating as a law.
