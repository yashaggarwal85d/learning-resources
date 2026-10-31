## AWS Global Infrastructure: Regions and AZs

URL: https://aws.amazon.com/about-aws/global-infrastructure/regions_az/
Version: fetched 2026-10-30

> AWS has the concept of a Region, which is a physical location around the world where we cluster data centers. We call each group of logical data centers an Availability Zone. Each AWS Region consists of a minimum of three, isolated, and physically separate AZs within a geographic area.

> An Availability Zone (AZ) is one or more discrete data centers with redundant power, networking, and connectivity in an AWS Region. AZs give customers the ability to operate production applications and databases that are more highly available, fault tolerant, and scalable than would be possible from a single data center.

> AZs are physically separated by a meaningful distance, many kilometers, from any other AZ, although all are within 100 km (60 miles) of each other.

Contents: Regions (one geographic area clustering multiple AZs); Availability Zones (discrete data centers with independent power/networking); Local Zones (an extension of a Region for low-latency placement nearer end users); which core services launch with every new Region.

## AWS EC2 On-Demand Instance Pricing (data transfer section)

URL: https://aws.amazon.com/ec2/pricing/on-demand/
Version: fetched 2026-10-30

> Data transferred "in" to and "out" from Amazon EC2, Amazon RDS, Amazon Redshift, Amazon DynamoDB Accelerator (DAX), Amazon ElastiCache instances, and Elastic Network Interfaces across Availability Zones in the same AWS Region is charged at $0.01/GB in each direction.

> AWS customers receive 100 GB of free data transfer out to the internet free each month, aggregated across all AWS Services and Regions (except China and GovCloud).

Contents: data transfer IN to EC2 from the internet (free); data transfer OUT to the internet (tiered, first 100GB free monthly); inter-region transfer (priced per destination); cross-AZ transfer within one Region ($0.01/GB each direction).

## AWS Guidance for Cell-Based Architecture on AWS

URL: https://docs.aws.amazon.com/solutions/cell-based-architecture-on-aws/index.md
Version: generated_on 2026-10-29 (fetched 2026-10-30)

> This Guidance helps customers understand the concepts of implementing a cell-based architecture. This architecture shows fault isolation between cells, which are independent replicas of the system. Customers can use this Guidance to prevent outages caused by a software bug, failed deployment, or overload, ultimately reducing the impact to end-customers.

> By isolating faults to business service partitions, this Guidance promotes operational excellence by ensuring that the business can continue to run services. This aligns fault isolation with individual users or sets of users. In contrast to the more traditional approach, which has users in the same failure domain of a single business system, this new approach has users in different failure domains.

Contents: the routing layer redirecting a client to its assigned cell; a fixed number of independent, fixed-size cells each holding full application logic and storage; per-cell monitoring plus a central aggregated dashboard; automated cell creation/update via a canary cell; a rebalancer that moves users between cells.

## Google Cloud: Geography and regions

URL: https://cloud.google.com/docs/geography-and-regions
Version: fetched 2026-10-30

> Google Cloud's services and resources can be zonal, regional, or managed by Google across multiple regions.

> Zonal resources operate within a single zone. Zonal outages can affect some or all of the resources in that zone.

> Regional resources are resources that are redundantly deployed across multiple
> zones within a region, for example App Engine applications, or
> regional managed instance groups.
> This gives them higher availability relative to zonal resources.

Contents: zonal resources (single zone, e.g. a zonal persistent disk); regional resources (redundant across zones in a region, e.g. regional managed instance groups); multi-regional resources (deployed across multiple regions, e.g. multi-regional storage).

## Microsoft Learn: What are Azure Availability Zones?

URL: https://learn.microsoft.com/en-us/azure/reliability/availability-zones-overview
Version: fetched 2026-10-30

> Many Azure regions provide availability zones, which are separated groups of datacenters within a region. Each availability zone has independent power, cooling, and networking infrastructure, so that if one zone experiences an outage, then regional services, capacity, and high availability are supported by the remaining zones.

> Availability zones are typically separated by several kilometers, and usually are within 100 kilometers of each other.

> Zone-redundant resources: Zone-redundant resources are replicated or distributed across multiple availability zones by the service. For example, zone-redundant data services replicate the data across multiple zones so that a failure in one zone doesn't affect the availability of the data. Some services are automatically zone-redundant in supported regions, while other services require that you configure your resource to be zone-redundant.

> A resource is resilient to a zone failure as long as it uses two or more zones.

Contents: availability zones as separated datacenter groups within a region; zone-redundant vs zonal resource support; the distinction between zones in the region, zones used by a resource, and instance/replica count.
