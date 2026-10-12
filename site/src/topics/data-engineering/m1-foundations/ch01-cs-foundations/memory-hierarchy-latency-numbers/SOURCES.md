## What Every Programmer Should Know About Memory
URL: https://akkadia.org/drepper/cpumemory.pdf
Version: Version 1.0, November 21, 2007 (Ulrich Drepper, Red Hat, Inc.)
> As CPU cores become both faster and more numerous, the limiting factor for most programs is
> now, and will be for some time, memory access.

> These are the numbers Intel lists for a Pentium M:

> Assume access to main memory
> takes 200 cycles and access to the cache memory take
> 15 cycles.

> Before we
> said that a main memory access takes 200+ cycles.

> In early caches these lines were 32 bytes
> long; nowadays the norm is 64 bytes.

> Local memory (memory attached to a processor) can be accessed with the usual speed.

> We
> talk about “NUMA factors” when we describe the extra time needed to access remote memory.

> The fact we need to remember from this chart is that 2-hop reads and writes are
> 30% and 49% (respectively) slower than 0-hop reads.

> In
> this example all local memory accesses have the cost 10,
> all remote access to any other node has the cost 20.

> The important information in this graph is that
> read operations are always 20% slower.
Contents:
- Abstract and section 1 Introduction: memory as the limiting factor; the balanced early computer vs. today
- Section 2 Commodity hardware today: Northbridge/Southbridge, FSB, DRAM vs SRAM cells, DRAM access (RAS/CAS timing), SDRAM/DDR, memory controllers, NUMA factor intro (2.2 / Fig 2.3)
- Section 3 CPU caches: cache effectiveness example (200 vs 15 cycles), cache line, associativity, coherency (MESI), Pentium M cycles table (register, L1d, L2, main memory), measured access-time figures (Fig 3.x cycles per list element), prefetching, TLB, hyper-threads, 3.5.1 bandwidth per cycle graphs (P4, Core 2)
- Section 4 Virtual memory; Section 5 NUMA support: 5.1 NUMA hardware, 5.2 OS support, 5.3 published info (sysfs distance 10/20), 5.4 remote access costs (Fig 5.3 hop slowdown, Fig 5.4 remote bandwidth 20% slower), numa_maps
- Sections 6-7 What programmers can do, tools
- Dated-ness: written in 2007 for Pentium 4/Core 2/Opteron; use for structure and ratios, not absolute numbers

## numactl(8) - Linux manual page
URL: https://man7.org/linux/man-pages/man8/numactl.8.html
Version: man-pages HTML rendering created 2026-09-09 (numactl(8), Linux Administrator's Manual)
> numactl runs processes with a specific NUMA scheduling or memory
> placement policy.

> Try to allocate on the current node of the process, but if
> memory cannot be allocated there fall back to other nodes.

> Only allocate memory from nodes. Allocation will fail when
> there is not enough memory available on these nodes.

> Show inventory of available nodes on the system.
Contents:
- Synopsis and description of policy options
- Node specifiers (including netdev:, file:, pci: nodes close to a device)
- Options: --interleave, --weighted-interleave, --membind, --cpunodebind, --physcpubind, --localalloc, --preferred, --balancing, --show, --hardware
- Shared memory / file policy options (--shm, --file, --huge, etc.)
- Examples (cpunodebind plus membind; binding to the node of network device eth0)
- No latency or bandwidth numbers; use as the tool for pinning to local vs remote nodes

## What is NUMA? (Linux kernel documentation)
URL: https://docs.kernel.org/mm/numa.html
Version: The Linux Kernel documentation, 7.3.0-rc7 (original text started Nov 1999 by Kanoj Sarcar)
> From the hardware perspective, a NUMA system is a computer platform that
> comprises multiple components or assemblies each of which may contain 0
> or more CPUs, local memory, and/or IO buses.

> Memory access time and effective memory bandwidth varies depending on how far
> away the cell containing the CPU or IO bus making the memory access is from the
> cell containing the target memory.

> For example, access to memory by CPUs
> attached to the same cell will experience faster access times and higher
> bandwidths than accesses to memory on other, remote cells.

> Linux divides the system’s hardware resources into multiple software
> abstractions called “nodes”.

> By default, Linux will attempt to satisfy memory allocation requests from the
> node to which the CPU that executes the request is assigned.
Contents:
- Hardware view: cells, interconnect (crossbar, point-to-point), ccNUMA
- Why NUMA exists: scalable memory bandwidth; need most references local
- Linux software view: nodes, per-node memory management, zones and zonelists, fallback
- Local allocation default; scheduler and migration; taskset/numactl/sched_setaffinity
- Memoryless nodes, numa_mem_id
- No numeric latencies

## numa(7) - Linux manual page (replacement for the Intel MLC article, which returned HTTP 403)
URL: https://man7.org/linux/man-pages/man7/numa.7.html
Version: man-pages HTML rendering created 2026-09-09 (numa(7), Miscellaneous Information Manual)
> Non-Uniform Memory Access (NUMA) refers to multiprocessor systems
> whose memory is divided into multiple memory nodes.

> Normally, each CPU on a
> NUMA system has a local memory node whose contents can be accessed
> faster than the memory in the node local to another CPU or the
> memory on a bus shared by all CPUs.
Contents:
- Description: NUMA definition, local memory node
- NUMA system calls (get_mempolicy, mbind, migrate_pages, move_pages, set_mempolicy)
- /proc/pid/numa_maps format
- Library support (libnuma), notes
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
## Intel 64 and IA-32 Architectures Optimization Reference Manual: Volume 1
URL: https://cdrdv2-public.intel.com/814198/248966-Optimization-Reference-Manual-V1-049.pdf
Version: Order Number 248966-049, January 2024
> Skylake server microarchitecture implements a mid-level (L2) cache of 1 MB capacity with a minimum
> load-to-use latency of 14 cycles.
Note on Gracemont:
> The L2 cache delivers 64 bytes of data per cycle at a latency of 17 cycles, and that bandwidth is shared
> among four cores.
Contents:
- Chapter 2 describes the microarchitectures (Skylake server, Golden Cove, Gracemont and others) including cache structure per core.
- Section 2.5.1 and Table 2-9 compare Broadwell and Skylake server caches: L1 data cache 32 KB, latency 4-6 cycles, max bandwidth 96 then 192 bytes/cycle, sustained 93 then 133.
- Table 2-9 L2 (MLC): 256 KB then 1 MB, latency 12 then 14 cycles, max bandwidth 32 then 64 bytes/cycle, sustained 25 then 52.
- Table 2-9 L3 (LLC): up to 2.5 MB per core then up to 1.375 MB per core, latency 50-60 then 50-70 cycles, max bandwidth 16 then 32 bytes/cycle, sustained 14 then 15.
- Gracemont section: 4-cycle typical load-to-use latency (3 for simple pointer chasing), L2 64 bytes/cycle at 17 cycles shared among four cores.
- Remaining chapters (prefetching, software optimization, performance events) are not used here.

## Samsung SSD PM9A3 Specification (PCIe NVMe U.2)
URL: https://www.ssd.group/wp-content/uploads/2022/07/PM9A3-NVMe-U.2-Datasheet_for-07_v1.4.pdf
Version: Rev. 1.4, Nov. 2021 (Samsung datasheet, copy hosted by a reseller)
> The Samsung SSD PM9A3 delivers wide bandwidth of up to 6,800MB/s for sequential read speed and up to 4,000MB/s for sequential write speed under
> up to 13.5W power.
Random performance:
> the Samsung SSD PM9A3 delivers random performance of up to 1000KIOPS for
> random 4KB read and up to 200KIOPS for random 4KB write in the sustained state.
Latency method:
> 2) The random latency is measured by using FIO 2.7 in Linux Gen3: CentOS6(kernel 3.14) and 4KB transfer size with queue depth 1 by 1 worker.
Contents:
- Overview: PCIe 4.0 x4 NVMe U.2 enterprise SSD, up to 6,800 MB/s sequential read, 4,000 MB/s sequential write.
- Table 3: sustained random 4 KB read up to 1000 KIOPS, random write up to 200 KIOPS.
- Table 6: latency at queue depth 1, typical: random read/write 80/35 us (960 GB) and 80/30 us (larger sizes); sequential read/write 20/20 us; drive ready time 8 s (20 s for 15360 GB).
- Footnotes: latency measured with FIO, 4 KB transfers, QD1, 1 worker.
- Remaining sections: capacities, power, endurance, NVMe/PCIe registers, SMART and commands.

## Seagate Exos X24 SATA Product Manual (Rev. A Draft 1)
URL: https://www.seagate.com/content/dam/seagate/assets/support/internal-hard-drive/enterprise-hard-drives/exos-x24/_shared/files/Seagate_EXOS24_CMR_ISE_SED(10-12-16-20-24TB).pdf
Version: Publication 205194300, Rev. A (Draft 1), 08/06/2023
> Max Sustained transfer rate OD (MiB/s
> 272 (285 MB/s max)
Rotational latency:
> Average latency
> 4.16ms
Contents:
- 7200 RPM, 3.5-inch helium CMR drives, 10 to 24 TB, SATA 6 Gb/s.
- Maximum sustained transfer rate at outer diameter 272 MiB/s (285 MB/s max); sustained 259 MiB/s (272 MB/s).
- Average latency 4.16 ms (half a revolution at 7200 RPM).
- Performance seek times 3.2 ms typical, 3.4 ms max (table label "Performance seek").
- Cache buffer 256 MB; interface rate 600 MB/s max; workload rating under 550 TB/year.
- Other sections: power, environment, reliability, SATA commands and security features.

## Designs, Lessons and Advice from Building Large Distributed Systems (Jeff Dean, LADIS 2009) - historical
URL: https://www.cs.cornell.edu/projects/ladis2009/talks/dean-keynote-ladis2009.pdf
Version: LADIS 2009 keynote slides. Historical 2009-era numbers, not current hardware.
> Numbers Everyone Should Know
> L1 cache reference
> Branch mispredict
> L2 cache reference
> Mutex lock/unlock
> Main memory reference
Contents:
- Slide "Numbers Everyone Should Know" lists 12 operations and times: L1 reference 0.5 ns, branch mispredict 5 ns, L2 reference 7 ns, mutex lock/unlock 25 ns, main memory reference 100 ns.
- Compress 1K bytes with Zippy 3,000 ns; send 2K bytes over 1 Gbps network 20,000 ns; read 1 MB sequentially from memory 250,000 ns.
- Round trip within same datacenter 500,000 ns; disk seek 10,000,000 ns; read 1 MB sequentially from disk 20,000,000 ns; packet CA to Netherlands and back 150,000,000 ns.
- The pdftotext output lists names and values in separate columns; the order matches.
- The following slides use them in back-of-the-envelope calculations (thumbnail page: 30 seeks at 10 ms plus reads at 30 MB/s = 560 ms).
- The rest of the talk covers Google infrastructure (GFS, MapReduce, BigTable) and design advice.
