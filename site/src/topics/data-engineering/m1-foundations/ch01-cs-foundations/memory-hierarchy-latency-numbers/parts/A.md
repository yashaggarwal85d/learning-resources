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
