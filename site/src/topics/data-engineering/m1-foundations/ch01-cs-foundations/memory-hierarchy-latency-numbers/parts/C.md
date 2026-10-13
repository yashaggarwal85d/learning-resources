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
