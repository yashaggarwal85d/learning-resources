## What Every Programmer Should Know About Memory
URL: https://akkadia.org/drepper/cpumemory.pdf
Version: Version 1.0, November 21, 2007 (Ulrich Drepper, Red Hat, Inc.)
> As CPU cores become both faster and more numerous, the limiting factor for most programs is
> now, and will be for some time, memory access.

> These are the numbers Intel lists for a Pentium M:

> Register
> L1d
> L2
> Main Memory
> ≤1
> ∼3
> ∼ 14
> ∼ 240

> These are the actual access times measured in CPU cycles.

> SRAM is much more expensive to produce and to use than DRAM.

> In anticipation of using consecutive memory regions, the
> processor prefetches the next cache line.

> There is no
> way for the processor to reliably prefetch data.

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

> In [1] AMD documents
> the NUMA cost of a four socket machine.

> the read performance falls by 9% and 30% respectively for 1- and 2-hop reads.

> we can measure the
> bandwidth as in section 3.5.1 but this time with the memory being on a remote node, one hop away.

> In
> this example all local memory accesses have the cost 10,
> all remote access to any other node has the cost 20.

> The accuracy of all this information is another question.

> The important information in this graph is that
> read operations are always 20% slower.
Contents:
- Abstract and section 1 Introduction: memory as the limiting factor; the balanced early computer vs. today
- Section 2 Commodity hardware today: Northbridge/Southbridge, FSB, DRAM vs SRAM cells, DRAM access (RAS/CAS timing), SDRAM/DDR, memory controllers, NUMA factor intro (2.2 / Fig 2.3)
- Section 3 CPU caches: cache effectiveness example (200 vs 15 cycles), cache line, associativity, coherency (MESI), Pentium M cycles table (register, L1d, L2, main memory), measured access-time figures (Fig 3.x cycles per list element), prefetching, TLB, hyper-threads, 3.5.1 bandwidth per cycle graphs (P4, Core 2)
- Section 4 Virtual memory; Section 5 NUMA support: 5.1 NUMA hardware, 5.2 OS support, 5.3 published info (sysfs distance 10/20), 5.4 remote access costs (Fig 5.3 hop slowdown, Fig 5.4 remote bandwidth 20% slower), numa_maps
- Sections 6-7 What programmers can do, tools
- Fact-check note (2026-10-12): the "20% slower" (Fig. 5.4) is Drepper's own one-hop measurement of a bandwidth-style read test, not a latency figure, so it reads "20% slower", not "20% lower bandwidth" (which would be 17%). The sysfs 10/20 distances come with his footnote "This is, by the way, incorrect." and the caveat quoted above.
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

> Set a weighted memory interleave policy. Memory will be
> allocated using the weighted ratio for each node, which can
> be read from
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

> If the “local” node cannot satisfy the request, the kernel will examine other
> nodes’ zones in the selected zonelist looking for the first zone in the list
> that can satisfy the request.

> Thus, under sufficient imbalance, tasks can migrate between nodes, remote
> from their initial node and kernel data structures.
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

> consider using Amazon S3 Express One Zone, which is designed for applications that require single-digit millisecond latencies and can support hundreds of thousands of requests per second.

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

> Instances can use burst
> bandwidth for a limited time, typically from 5 to 60 minutes, depending on the instance
> size.

> traffic to another instance in the Region can use the full
> bandwidth available (20 Gbps).

> When traffic goes through an internet gateway or a local gateway,
> the available bandwidth for multi-flow traffic depends on the instance type.

> Limited to 50% of the available bandwidth for the instance type

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
URL: https://cdrdv2-public.intel.com/930021/248966-051-optimization-reference-manual-vol1.pdf
Version: Document Number 248966-051US, October 2026 (current edition; reached from Intel's permanent link https://cdrdv2.intel.com/v1/dl/getContent/671488). It supersedes 248966-049 (January 2024), which the plan first read: the Skylake server cache table was Table 2-9 (Section 2.5.1) there and is Table 2-11 (Section 2.6.1) here, with the same values.
> Skylake server microarchitecture implements a mid-level (L2) cache of 1 MB capacity with a minimum load-to-use
> latency of 14 cycles.

> Latency [cycles]
> 4-6
> 4-6
> Max bandwidth [bytes/cycles]
> 96
> 192
> Sustained bandwidth [bytes/cycles]
> 93
> 133

> Latency [cycles]
> 12
> 14
> Max bandwidth [bytes/cycles]
> 32
> 64
> Sustained bandwidth [bytes/cycles]
> 25
> 52

> Latency [cycles]
> 50-60
> 50-70
> Max bandwidth [bytes/cycles]
> 16
> 32
> Sustained bandwidth [bytes/cycles]
> 14
> 15

> The size of each of the banks of last
> level cache has shrunk to 1.375 MBs per bank.

> Cache line size of 64 bytes can impact streaming applications

> An estimation of overall L2 miss impact by multiplying system memory latency with the number of L2
> misses ignores the OOO engine’s ability to handle multiple outstanding load misses.

Note on the efficient (Atom) cores, now Crestmont:
> Chapter 4: Gracemont content updated to Crestmont
> microarchitecture

> The
> load-to-use latency for loads is typically four cycles.

> The L2 cache delivers 64 bytes of data per cycle at a latency of 17 cycles, and that bandwidth is shared amongst 4
> cores.
Contents:
- Chapter 2 describes the microarchitectures (Skylake server, Golden Cove, Redwood Cove and others) including cache structure per core.
- Section 2.6.1 and Table 2-11 (Table 2-9 in -049) compare Broadwell and Skylake server caches: L1 data cache 32 KB, latency 4-6 cycles, max bandwidth 96 then 192 bytes/cycle, sustained 93 then 133.
- Table 2-11 L2 (MLC): 256 KB then 1 MB, latency 12 then 14 cycles, max bandwidth 32 then 64 bytes/cycle, sustained 25 then 52.
- Table 2-11 L3 (LLC): up to 2.5 MB per core then up to 1.375 MB per core, latency 50-60 then 50-70 cycles, max bandwidth 16 then 32 bytes/cycle, sustained 14 then 15. The table does not say whether the L3 bandwidth is per core.
- Chapter 4 (Crestmont, formerly Gracemont in -049): 4-cycle typical load-to-use latency (3 for simple pointer chasing), L2 64 bytes/cycle at 17 cycles shared among four cores.
- Appendix on performance events: multiplying memory latency by the miss count over-estimates, because the out-of-order core keeps several load misses outstanding.
- Chapter 10 Sub-NUMA Clustering (one socket split into NUMA nodes) exists; not used here.
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

> (960GB) 80/35 us
> (7680/3840/1920/15360GB) 80/30 us

> 20/20 us

> 3) 1 MB/sec = 1,000,000 bytes/sec was used in sequential performance.

Table 3 (random 4 KB read IOPS: five Gen3 capacities, then the same five on Gen4; 1000K only for 3840 and 7680 GB on PCIe Gen4):
> Random 4KB Read (Up to)
> IOPS
> 550K
> 800K
> 800K
> 800K
> 800K
> 550K
> 850K
> 1000K
> 1000K
> 850K

> Random performance in Table 3 was measured by using FIO 2.7 in Linux Gen3: CentOS6(kernel 3.14), Gen4: CentOS7(Kernel 5.3.1) with 4KB (4,096 bytes) of data transfer size in Queue Depth=32 by 4 workers.

Table 4 (sequential 128 KB read MB/s, same column order; 6800 only for 1920 and 3840 GB on PCIe Gen4):
> Sequential 128KB Read (Up to)
> MB/s
> 3500
> 3500
> 3500
> 3500
> 3500
> 6500
> 6800
> 6800
> 6700
> 5200

> Sequential performance in Table 4 was measured by using FIO 2.7 in Linux Gen3: CentOS6(kernel 3.14), Gen4: CentOS7(Kernel 5.3.1) with 128KB (131,072 bytes) of data
> transfer size in Queue Depth=32 by 1 worker.
Contents:
- Overview: PCIe 4.0 x4 NVMe U.2 enterprise SSD, up to 6,800 MB/s sequential read, 4,000 MB/s sequential write.
- Table 3: sustained random 4 KB read up to 1000 KIOPS (3.84 and 7.68 TB on PCIe 4.0), random write up to 200 KIOPS. Table 4: sequential read up to 6,800 MB/s (1.92 and 3.84 TB on PCIe 4.0). One drive that has both headline figures: the 3.84 TB model on PCIe 4.0.
- Table 6: latency at queue depth 1, typical: random read/write 80/35 us (960 GB) and 80/30 us (larger sizes); sequential read/write 20/20 us; drive ready time 8 s (20 s for 15360 GB).
- Footnotes: latency measured with FIO, 4 KB transfers, QD1, 1 worker, on a PCIe Gen3 host; random IOPS at QD32 x 4 workers; sequential at 128 KB, QD32 x 1 worker; MB = 1,000,000 bytes.
- Remaining sections: capacities, power, endurance, NVMe/PCIe registers, SMART and commands.

## PM9A3 | Data center SSD | Samsung Semiconductor Global (Samsung's own product page)
URL: https://semiconductor.samsung.com/ssd/datacenter-ssd/pm9a3/
Version: current product page (fetched 2026-10-12; the PM9A3 is still listed)
> Random write speeds up to 200,000 IOPS and sequential read speeds up to 6,800 MB/s are appropriate for the leading data centers that require fast performance for data processing.
Contents:
- First-party confirmation that the PCIe 4.0 PM9A3 is current and of its 6,800 MB/s sequential read; the datasheet above is a reseller-hosted copy.

## Samsung PM9A3 NVMe PCIe SSD product brief
URL: https://download.semiconductor.samsung.com/resources/brochure/Samsung%20PM9A3%20NVMe%20PCIe%20SSD.pdf
Version: Samsung product brief (no date shown; fetched 2026-10-12)
> delivering up to one million IOPS
> of random read performance.
Contents:
- First-party confirmation of the 1,000,000 random-read IOPS (PCIe Gen 4); highlights, enterprise features, form factors.

## PM1743 | Enterprise SSD | Samsung Semiconductor Global (currency check: PCIe 5.0)
URL: https://semiconductor.samsung.com/ssd/enterprise-ssd/pm1743/
Version: current product page (fetched 2026-10-12)
> Experience up to 14,000 MB/s read speed.

> Powerful, reliable, and 2x faster than PCIe 4.0.
Contents:
- Current PCIe 5.0 enterprise drive: roughly twice the PM9A3's sequential read. Used only in the fact-check's currency table and the "frontier" bullet; the reel keeps the PM9A3 (PCIe 4.0, with a published QD1 latency).

## Seagate Exos X24 SATA Product Manual (Rev. A Draft 1)
URL: https://www.seagate.com/content/dam/seagate/assets/support/internal-hard-drive/enterprise-hard-drives/exos-x24/_shared/files/Seagate_EXOS24_CMR_ISE_SED(10-12-16-20-24TB).pdf
Version: Publication 205194300, Rev. A (Draft 1), 08/06/2023
> Max Sustained transfer rate OD (MiB/s
> 272 (285 MB/s max)
Rotational latency:
> Average latency
> 4.16ms

> 7200 RPM spindle speed.

Acoustics (the "Performance seek" row is sound power in bels, not a seek time):
> Drive acoustics, sound power (bels)

> 3.2 bels (typ)
> 3.4 bels (max)
Contents:
- 7200 RPM, 3.5-inch helium CMR drives, 10 to 24 TB, SATA 6 Gb/s.
- Maximum sustained transfer rate at outer diameter 272 MiB/s (285 MB/s max); sustained 259 MiB/s (272 MB/s).
- Average latency 4.16 ms (half a revolution at 7200 RPM).
- No seek time is published. "Performance seek 3.2 / 3.4" sits under "Drive acoustics, sound power (bels)": it is the sound power while seeking (3.2 bels typical, 3.4 max), not 3.2 ms. (Corrected by the fact-check, 2026-10-12.)
- Cache buffer 256 MB (the datasheet says 512 MB; this manual is a draft); interface rate 600 MB/s max; workload rating under 550 TB/year.
- Sustained rate by capacity: 272 / 262 / 247 / 237 MiB/s max for 24 / 20 / 16 / 12 and 10 TB.
- Other sections: power, environment, reliability, SATA commands and security features.

## Seagate Exos X24 data sheet
URL: https://www.seagate.com/content/dam/seagate/en/content-fragments/products/datasheets/exos-x24/exos-x24-DS2080-2307US-en_US.pdf
Version: DS2080-2307US, © 2023 (Seagate's own copy; the same data sheet, with an extra "Average Latency (ms) 4.16ms" row, is also hosted by a reseller at https://cdn-reichelt.de/documents/datenblatt/E610/ST24000NM002H_DB-EN.pdf, read as sources/hdd.txt)
> Spindle Speed (RPM)
> 7200RPM

> Max. Sustained Transfer Rate OD (MB/s,MiB/s)
> 285/272

> Random Read/Write 4K QD16 WCD (IOPS)
> 168/550
Contents:
- SATA and SAS models, 12 to 24 TB, helium, CMR, 7,200 rpm, 512 MB cache, 2.5M-hour MTBF.
- Performance: 285 MB/s (272 MiB/s) max sustained at the outer diameter; random 4K at queue depth 16, write cache disabled: 168 read / 550 write IOPS. 1/168 s = 5.95 ms is the average time per random read with 16 queued (the drive reorders them); one read at a time takes longer (no QD1 figure published).
- Currency: Seagate's current site sells one "Exos" line ("What was once split across X, E and M is now streamlined under a single, powerful name — Exos", 24 to 32 TB); its new portfolio data sheet (exos-ds2046.1-2512) could not be read as text, so the X24 sheet stays the source.

## Teach Yourself Programming in Ten Years (Peter Norvig), the "Answers" timing table (secondary, historical)
URL: https://norvig.com/21-days.html
Version: page copyright 2001-2014; table titled "Approximate timing for various operations on a typical PC"
> Approximate timing for various operations on a typical PC:

> fetch from main memory 100 nanosec

> fetch from new disk location (seek) 8,000,000 nanosec
Contents:
- Essay on learning to program; the appendix table of operation times (L1 0.5 ns, L2 7 ns, main memory 100 ns, seek 8 ms, read 1 MB from disk 20 ms). Framing and history only.

## Designs, Lessons and Advice from Building Large Distributed Systems (Jeff Dean, LADIS 2009) - historical
URL: https://www.cs.cornell.edu/projects/ladis2009/talks/dean-keynote-ladis2009.pdf
Version: LADIS 2009 keynote slides. Historical 2009-era numbers, not current hardware.
> Numbers Everyone Should Know
> L1 cache reference
> Branch mispredict
> L2 cache reference
> Mutex lock/unlock
> Main memory reference

The value column (pdftotext prints it after the names, in the same order):
> 0.5 ns
> 5 ns
> 7 ns
> 25 ns
> 100 ns
> 3,000 ns
> 20,000 ns
> 250,000 ns
> 500,000 ns
> 10,000,000 ns
> 20,000,000 ns
> 150,000,000 ns

> Round trip within same datacenter
> Disk seek
> Read 1 MB sequentially from disk

> 30 seeks * 10 ms/seek + 30 * 256K / 30 MB/s = 560 ms

> 10 ms/seek + 256K read / 30 MB/s = 18 ms

> (Ignores variance, so really more like 30-60 ms, probably)
Contents:
- Slide "Numbers Everyone Should Know" lists 12 operations and times: L1 reference 0.5 ns, branch mispredict 5 ns, L2 reference 7 ns, mutex lock/unlock 25 ns, main memory reference 100 ns.
- Compress 1K bytes with Zippy 3,000 ns; send 2K bytes over 1 Gbps network 20,000 ns; read 1 MB sequentially from memory 250,000 ns.
- Round trip within same datacenter 500,000 ns; disk seek 10,000,000 ns; read 1 MB sequentially from disk 20,000,000 ns; packet CA to Netherlands and back 150,000,000 ns.
- The pdftotext output lists names and values in separate columns; the order matches.
- The following slides use them in back-of-the-envelope calculations (thumbnail page: 30 seeks at 10 ms plus reads at 30 MB/s = 560 ms).
- The rest of the talk covers Google infrastructure (GFS, MapReduce, BigTable) and design advice.

## proc_meminfo(5) - Linux manual page
URL: https://man7.org/linux/man-pages/man5/proc_meminfo.5.html
Version: man-pages HTML rendering created 2026-09-09
> In-memory cache for files read from the disk (the
> page cache).
Contents:
- The fields of /proc/meminfo; "Cached" is the page cache. Backs the one In-production line that a repeated "disk" read can be a RAM read; the measurement is topic 10's.

## Documentation for /proc/sys/kernel/ (Linux kernel documentation)
URL: https://docs.kernel.org/admin-guide/sysctl/kernel.html
Version: The Linux Kernel documentation, 7.3.0-rc7 (fetched 2026-10-12)
> Enables/disables and configures automatic page fault based NUMA memory
> balancing. Memory is moved automatically to nodes that access it often.
Contents:
- The kernel sysctls; numa_balancing (automatic NUMA balancing). Currency note for the NUMA claims: the 1999-era mm/numa text says the scheduler ignores a task's NUMA footprint; current kernels can move pages to the node that uses them when numa_balancing is on.

## Specifications for Amazon EC2 compute optimized instances (currency check)
URL: https://docs.aws.amazon.com/ec2/latest/instancetypes/co.html
Version: Amazon EC2 Instance Types guide, current page (fetched 2026-10-12)
> c8gn.48xlarge
> 600 Gigabit
Contents:
- Per-type network bandwidth (baseline / burst Gbps), EFA, ENA Express. The largest network-optimized types now list 150 to 600 Gigabit; the S3 page's "up to 100 Gb/s on a single instance" is a data-lake example, not a cap.

## 66.6. Database Page Layout (PostgreSQL documentation)
URL: https://www.postgresql.org/docs/current/storage-page-layout.html
Version: PostgreSQL 18 documentation (current; 19 is at Beta 4), fetched 2026-10-12
> Every table and index is stored as an array of pages of a fixed size (usually 8 kB, although a different page size can be selected when compiling the server).
Contents:
- Page layout (header, item identifiers, free space, items, special space). Backs the running example's "8 KB page": PostgreSQL's "8 kB" is 8,192 bytes (BLCKSZ), i.e. 8 KiB; the topic writes "8 KB (8,192 bytes)" as CHAPTER.md allows.
