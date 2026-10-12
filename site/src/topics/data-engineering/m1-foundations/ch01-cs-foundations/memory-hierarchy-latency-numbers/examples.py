"""Every number shown in the "Memory hierarchy and latency numbers" reel and Deep dive, computed and asserted.
Run: python3 examples.py (CI runs it too). Standard library, plus a C compiler (cc) for the RAM lab; NumPy is optional.
Asserts ranges, never exact times, for everything measured. Integer arithmetic where a count is exact."""
import math
import os
import shutil
import socket
import statistics
import subprocess
import sys
import tempfile
import threading
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
SOURCES = (HERE / 'SOURCES.md').read_text(encoding='utf-8')
KiB, MiB, GiB, TiB = 2**10, 2**20, 2**30, 2**40
CHECKED = '2026-10-12'


def quoted(*frags):
    """Every sourced value must appear verbatim in SOURCES.md (whose quotes `scripts/sources.mjs check` proves)."""
    for f in frags:
        assert f in SOURCES, f'not in SOURCES.md: {f!r}'


# ---- 1. The running example --------------------------------------------------------------------------------------------
ORDERS_BYTES = 1_000_000 * 8_192            # `orders`: 1,000,000 pages of 8 KB (8,192 bytes)
assert ORDERS_BYTES == 8_192_000_000
assert round(ORDERS_BYTES / GiB, 1) == 7.6          # "7.6 GiB"
assert round(ORDERS_BYTES / 1e9, 1) == 8.2          # "8.2 GB"
assert TiB == 1_099_511_627_776                     # order_events: 1 TiB

# ---- 2. The canonical table: every sourced value is a quote in SOURCES.md ---------------------------------------------
quoted(
    '14 cycles',                         # Intel: L2 load-to-use 14 cycles
    '200+ cycles',                       # Drepper: main memory
    'Cache line size of 64 bytes',       # Intel manual
    '20% slower',                        # Drepper: remote reads
    '100 nanosec',                       # Norvig: main memory
    '80/30 us', '20/20 us',              # Samsung PM9A3: random read QD1 80 us, sequential 20 us
    '6,800MB/s', '1000KIOPS',            # Samsung PM9A3 headline rates
    '4.16ms', '272 MiB/s',               # Seagate Exos X24
    '7200 RPM spindle speed.', '168/550',
    'roughly 100–200 milliseconds',      # AWS S3 first byte
    'tens of milliseconds',              # AWS S3 medians for small requests
    '5,500 GET/HEAD',                    # AWS S3 per-prefix read rate
    'up to 100 Gb/s',                    # AWS S3 per instance
    'limited to 5 Gbps',                 # EC2 single flow outside a cluster placement group
    'up to 10 Gbps',
    'typically from 5 to 60 minutes',    # EC2 burst credits
    'single-digit millisecond',          # S3 Express One Zone
    '14,000 MB/s',                       # Samsung PM1743 (frontier only)
    # Content review additions (REVIEW.md findings 5, 12, 13, 15, 16, 18, 27):
    'Intra-Availability Zone latency metrics',   # AWS Network Manager Infrastructure Performance: intra-AZ round-trip medians exist
    'the same latency metric data is presented in all AWS',
    'median (P50)', 'five-minute (5M) interval',
    'round-trip traffic latency',
    'Memory Channels', 'Up to 4800 MT/s', 'Per Socket Mem BW', '460.8 GB/s',        # AMD EPYC 9654 spec page
    'under 500 microseconds',                                                          # EBS io2 Block Express
    '80,000 3 (25.6 KiB I/O 4)', '256,000 3 (16 KiB I/O 4)',                           # EBS max IOPS, gp3 and io2 Block Express
    'baseline IOPS performance of 3,000 IOPS', 'baseline throughput performance of 125 MiB/s',   # EBS gp3 baseline
    'gp3 volumes provide single-digit millisecond latency',
    'Scalable Reliable Datagram (SRD) networking protocol',                            # EBS io2 Block Express is network-attached
    'physically attached to the host computer',                                        # instance store is local
    'numa_hit, numa_miss and numa_foreign',                                            # kernel numastat page
    'Queues with up to 65,535 outstanding commands per I/O Queue',                     # NVMe base specification
    'Linux implements malloc to commit physical page at first touch/access',           # Intel manual, Example 11-9
    'use randomized prefixes like a1b2/log-2024-01-01.txt',                            # S3: a prefix is the start of an object's name
)
CLOCK_GHZ = 2.0                              # our stated assumption for converting cycles
NS_PER_CYCLE = 1 / CLOCK_GHZ
assert NS_PER_CYCLE == 0.5                   # "at 2 GHz: 1 cycle = 0.5 ns"
cycles = {'registers': (0, 1), 'L1': (4, 6), 'L2': (14, 14), 'L3': (50, 70), 'DRAM': (200, 200)}
ns = {k: (lo * NS_PER_CYCLE, hi * NS_PER_CYCLE) for k, (lo, hi) in cycles.items()}
assert ns['registers'][1] == 0.5             # "≤ 0.5 ns"
assert ns['L1'] == (2.0, 3.0)                # "2–3 ns"
assert ns['L2'] == (7.0, 7.0)                # "7 ns"
assert ns['L3'] == (25.0, 35.0)              # "25–35 ns"
assert ns['DRAM'][0] == 100.0                # "100+ ns" (200 cycles)
# Bandwidth per cycle (Intel Table 2-11, Skylake server): L1 192 peak / 133 sustained, L2 64 / 52, L3 32 / 15.
assert 133 * CLOCK_GHZ == 266 and 52 * CLOCK_GHZ == 104 and 15 * CLOCK_GHZ == 30       # GB/s per core at 2 GHz
assert 192 * CLOCK_GHZ == 384
assert 1_000_000 * 4_096 == 4_096_000_000 and round(1_000_000 * 4_096 / 1e9, 1) == 4.1  # Samsung 1,000 KIOPS = 4.1 GB/s
# The same cycles are fewer ns at a higher clock (Deep dive): 4-6 cycles at 3 GHz.
assert round(4 / 3, 1) == 1.3 and 6 / 3 == 2.0
# HDD: 7,200 rpm.
rot_ms = 60 / 7_200 / 2 * 1000               # half a revolution
assert abs(rot_ms - 4.16) < 0.01             # "4.16 ms" (Seagate prints 4.16; the exact half turn is 4.1667)
assert round(rot_ms, 2) == 4.17              # so the reel says "Seagate gives 4.16 ms", never "half a turn is 4.16 ms"
hdd_iops = 168
hdd_read_ms = 1000 / hdd_iops
assert round(hdd_read_ms, 2) == 5.95 and round(hdd_read_ms) == 6                         # "at least 6 ms"
# 168 IOPS is measured with 16 queued (Seagate): by Little's law each read then spends 16 / 168 s in the drive, so 1/168 s is the
# time per read at that rate, not a one-at-a-time latency. One at a time costs a seek plus half a turn: more. 6 ms is a floor value.
assert round(16 / hdd_iops * 1000) == 95                                                   # ms in the drive per read at QD16
assert hdd_read_ms < 16 / hdd_iops * 1000
assert round(272 * MiB / 1e6) == 285         # 272 MiB/s is the datasheet's 285 MB/s
# Network: Gbit/s to bytes.
assert 10 / 8 == 1.25 and 100 / 8 == 12.5 and 5 / 8 * 1000 == 625 and 25 / 8 == 3.125   # GB/s, MB/s
# Socket-level DRAM bandwidth (finding 12): AMD EPYC 9654, 12 channels, up to 4,800 MT/s, "Per Socket Mem BW 460.8 GB/s".
# A DDR5 channel moves 8 bytes per transfer; the arithmetic reproduces AMD's figure, so the figure is a peak (channels x MT/s x 8 B).
EPYC_CHANNELS, EPYC_MTS = 12, 4_800
assert EPYC_CHANNELS * EPYC_MTS * 1e6 * 8 == 460.8e9
SOCKET_BW = 460.8e9                                                                       # step 6: the RAM point's upper end (peak, spec)
assert round(SOCKET_BW / 12e9) == 38                                                      # one socket's peak is about 38 x one core, as measured here
assert 1e8 < 12e9 < SOCKET_BW < 1e12                                                      # both ends fit step 6's 100 MB/s - 1,000 GB/s axis
# EBS (finding 13): gp3 baseline 3,000 IOPS and 125 MiB/s, maximum 80,000 IOPS and 2,000 MiB/s; io2 Block Express 256,000 IOPS, 4,000 MiB/s,
# average latency under 500 microseconds at 16 KiB. 16 KiB x 256,000 = 4,096 MB/s, about the 4,000 MiB/s cap; 3,000 x 16 KiB = 46.9 MiB/s.
assert 3_000 * 16 // 1024 == 46 and 125 * MiB == 131_072_000 and round(125 * MiB / 1e6) == 131
assert 80_000 * 25.6 * KiB / MiB == 2_000 and 256_000 * 16 * KiB / MiB == 4_000          # the IOPS maxima are at the I/O size that reaches the MiB/s cap
assert 65_535 * 65_535 == 4_294_836_225                                                   # NVMe: up to 65,535 queues x 65,535 commands each (spec limits)

# Planning magnitudes from CHAPTER.md: the ladder is in the right decades.
NVME_ALPHA, HDD_ALPHA, OBJ_ALPHA = 80e-6, 1 / 168, 0.1
assert ns['L1'][0] < 5 and 10 <= ns['L3'][0] <= 40
assert 10e-6 <= NVME_ALPHA < 100e-6 and 1e-3 <= HDD_ALPHA < 10e-3 and OBJ_ALPHA >= 10e-3
DRAM_NS = 100
RTT_2009_US = 500                           # Dean, LADIS 2009: "within same datacenter", historical
NVME_BW, HDD_BW, NIC100_BW, FLOW_BW = 6.8e9, 285e6, 12.5e9, 625e6    # bytes per second

# ---- 3. Step 2: one RAM read against one object-storage wait ----------------------------------------------------------
assert round(100e-3 / 100e-9) == 1_000_000                                # "× 1,000,000", six decades
assert round(1_000_000 / 86_400, 1) == 11.6                               # eleven and a half days
assert (1 / 168) / (8_192 / 285e6) > 200 and round((1 / 168) / (8_192 / 285e6)) == 207   # an HDD page at random vs in order

# ---- 4. Steps 3-4: axis positions (the drawings place dots on these log axes) -----------------------------------------
def frac(v, lo, hi):
    return (math.log10(v) - math.log10(lo)) / (math.log10(hi) - math.log10(lo))

assert round(frac(100, 0.1, 1000), 2) == 0.75         # step 3: DRAM, three of four decades along
assert round(frac(1, 0.1, 1000), 2) == 0.25
assert round(frac(80e3, 1, 1e9), 2) == 0.54          # step 4: NVMe on the 1 ns - 1 s axis
assert round(frac(500e3, 1, 1e9), 2) == 0.63
assert round(frac(6e6, 1, 1e9), 2) == 0.75
assert round(frac(100e6, 1, 1e9), 2) == 0.89
assert round(frac(100, 1, 1e9), 2) == 0.22
assert round(frac(162, 1, 1e4), 2) == 0.55            # step 10: 162 s on the 1 s - 10,000 s axis
assert round(frac(5952, 1, 1e4), 2) == 0.94
assert round(frac(88, 10, 1e4), 2) == 0.31            # step 12: 88 s on the 10 s - 10,000 s axis

# ---- 5. Step 7: one transfer of 1 MiB, T(n) = alpha + n/beta ----------------------------------------------------------
n = MiB
assert n == 1_048_576
nvme_t = NVME_ALPHA + n / NVME_BW
assert round(n / NVME_BW * 1e6) == 154 and round(nvme_t * 1e6) == 234                    # "234 µs"
assert round(NVME_ALPHA / nvme_t * 100) == 34                                            # "34% wait"
hdd_t = HDD_ALPHA + n / HDD_BW
assert round(n / HDD_BW * 1e3, 2) == 3.68 and round(hdd_t * 1e3, 1) == 9.6              # "9.6 ms"
assert round(HDD_ALPHA / hdd_t * 100) == 62                                              # "at least 62% wait" (alpha is a floor value)
assert (1.5 * HDD_ALPHA) / (1.5 * HDD_ALPHA + n / HDD_BW) > HDD_ALPHA / hdd_t            # a larger alpha only raises the waiting share
assert round(2 * n / HDD_BW * 1e3, 1) == 7.4 and 2 * n / HDD_BW > HDD_ALPHA                    # 'two thirds' would need alpha = 7.4 ms: not claimed
obj_t = OBJ_ALPHA + n / FLOW_BW
assert round(n / FLOW_BW * 1e3, 2) == 1.68 and round(obj_t * 1e3) == 102                 # "102 ms"
assert round(OBJ_ALPHA / obj_t * 100) == 98                                              # "98% wait", at an assumed 625 MB/s per request (EC2's single-flow cap, not an S3 figure)
assert round(OBJ_ALPHA / (OBJ_ALPHA + n / 85e6) * 100) == 89                             # slower stream, smaller share
assert round(n / OBJ_ALPHA / 1e6, 1) == 10.5                                             # n/β < α above 10.5 MB/s
assert round(NVME_ALPHA * NVME_BW) == 544_000 and round(NVME_ALPHA * NVME_BW / 1e6, 1) == 0.5   # α·β ≈ 0.5 MB
assert round(HDD_ALPHA * HDD_BW) == 1_696_429 and round(HDD_ALPHA * HDD_BW / 1e6, 1) == 1.7     # ≈ 1.7 MB

# ---- 6. Step 8: the RAM lab (C), compiled and run -----------------------------------------------------------------------
C_SOURCE = r'''
#define _GNU_SOURCE
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <sys/mman.h>

static uint64_t s = 88172645463325252ULL;                        /* seeded xorshift: the same walk every run */
static inline uint64_t xr(void) { s ^= s << 13; s ^= s >> 7; s ^= s << 17; return s; }
static double now(void) { struct timespec t; clock_gettime(CLOCK_MONOTONIC, &t); return t.tv_sec + t.tv_nsec * 1e-9; }

int main(int argc, char **argv) {
    size_t bytes = strtoull(argv[1], 0, 10);                      /* a power of two */
    size_t steps = strtoull(argv[2], 0, 10);                      /* timed steps for the two random walks */
    size_t n = bytes / 8;
    size_t alloc = bytes < ((size_t)2 << 20) ? ((size_t)2 << 20) : bytes;
    uint64_t *a = aligned_alloc((size_t)2 << 20, alloc);
    if (!a) return 1;
#ifdef MADV_HUGEPAGE
    madvise(a, alloc, MADV_HUGEPAGE);                             /* 2 MiB pages where available: keeps address translation from inflating the walks */
#endif
    for (size_t i = 0; i < n; i++) a[i] = i;
    for (size_t i = n - 1; i > 0; i--) { size_t j = xr() % i; uint64_t t = a[i]; a[i] = a[j]; a[j] = t; }   /* Sattolo: one cycle through every slot */
    volatile uint64_t sink = 0;
    double best = 1e9;
    for (int r = 0; r < 3; r++) {                                 /* 1. in order, best of 3 */
        double t0 = now(); uint64_t sum = 0;
        for (size_t i = 0; i < n; i++) sum += a[i];
        double dt = now() - t0; sink = sum; if (dt < best) best = dt;
    }
    double t0 = now(); uint64_t sum = 0;                          /* 2. random addresses, independent of each other */
    for (size_t i = 0; i < steps; i++) sum += a[xr() & (n - 1)];
    double rand_ns = (now() - t0) / steps * 1e9; sink = sum;
    t0 = now(); uint64_t p = 0;                                   /* 3. each address is the value just read */
    for (size_t i = 0; i < steps; i++) p = a[p];
    double chase_ns = (now() - t0) / steps * 1e9; sink = p;
    printf("%.3f %.3f %.3f %.2f\n", best / n * 1e9, rand_ns, chase_ns, n * 8 / best / 1e9);
    return 0;
}
'''


def build_walk(workdir):
    assert shutil.which('cc'), 'the RAM lab needs a C compiler (cc)'
    src = Path(workdir) / 'walk.c'
    src.write_text(C_SOURCE)
    exe = Path(workdir) / 'walk'
    for flags in (['-O3', '-march=native'], ['-O3'], ['-O2']):       # the first that this compiler accepts
        if subprocess.run(['cc', *flags, '-o', str(exe), str(src)], capture_output=True).returncode == 0:
            return exe, ' '.join(flags)
    raise AssertionError('cc could not compile the walk')


def walk(exe, size, steps=10_000_000):
    out = subprocess.run([str(exe), str(size), str(steps)], capture_output=True, text=True, check=True).stdout.split()
    seq_ns, rand_ns, chase_ns, gbs = map(float, out)
    return seq_ns, rand_ns, chase_ns, gbs


# Reference run (the values on screen): 12 Oct 2026, 4-vCPU Intel Xeon @ 2.10 GHz under KVM, gcc 13.3.0 `-O3 -march=native`,
# median of five runs of the 1 GiB walk (in order 0.63-0.72, random 13.1-14.7, dependent 152-173 ns), rounded.
REF_SEQ_NS, REF_RAND_NS, REF_CHASE_NS, REF_GBS = 0.7, 14, 158, 12
assert REF_SEQ_NS < 5 and REF_RAND_NS / REF_SEQ_NS >= 3 and REF_CHASE_NS / REF_SEQ_NS >= 20 and REF_CHASE_NS >= 40
assert 1 <= REF_GBS <= 100
assert round(REF_RAND_NS / REF_SEQ_NS) == 20                    # "20× longer" at random
assert round(REF_CHASE_NS / REF_SEQ_NS, -1) == 230              # about 230× for the dependent walk
assert round(REF_CHASE_NS / REF_RAND_NS) == 11                  # the second bracket on the answer frame: "11×" from random to dependent
assert 64 // 8 == 8                                              # a 64-byte line holds eight 8-byte numbers
READS = GiB // 8
assert READS == 134_217_728 == 2**27                             # "134,217,728 reads"
REF_STAIRS_NS = {32 * KiB: 1.8, MiB: 8.1, 16 * MiB: 46, GiB: 158}     # dependent walk by working-set size, same run

t_start = time.time()
with tempfile.TemporaryDirectory() as tmp:
    exe, flags = build_walk(tmp)
    seq_ns, rand_ns, chase_ns, gbs = walk(exe, GiB)
    # Assert ranges, not times: robust on a busy CI machine.
    assert seq_ns < 5, seq_ns
    assert rand_ns / seq_ns >= 3, (rand_ns, seq_ns)
    assert chase_ns / seq_ns >= 20, (chase_ns, seq_ns)
    assert chase_ns >= 40, chase_ns
    assert 1 <= gbs <= 100, gbs
    stairs = {size: walk(exe, size)[2] for size in (32 * KiB, MiB, 16 * MiB)}
    stairs[GiB] = chase_ns
    assert stairs[32 * KiB] < 5 and stairs[GiB] / stairs[32 * KiB] >= 10, stairs
    live = (seq_ns, rand_ns, chase_ns, gbs)
    print(f'RAM lab ({flags}): in order {seq_ns:.2f} ns, random {rand_ns:.1f} ns ({rand_ns / seq_ns:.0f}x), '
          f'dependent {chase_ns:.0f} ns ({chase_ns / seq_ns:.0f}x), {gbs:.1f} GB/s on one core')
    print('  working-set staircase (dependent walk):', {f'{k // KiB} KiB': round(v, 1) for k, v in stairs.items()})
assert time.time() - t_start < 60, 'the lab should take well under a minute'

# ---- 7. Step 9: requests in flight --------------------------------------------------------------------------------------
assert round(1 / 80e-6) == 12_500                          # one at a time
assert round(8 / 80e-6) == 100_000                         # eight in flight
assert round(1_000_000 * 80e-6) == 80                      # in flight to reach 1,000,000 a second
assert 32 * 4 == 128 and 8 * 80 == 640                     # Samsung's QD32 x 4 workers; eight 80 µs waits end to end
assert round(128 / 1_000_000 * 1e6) == 128                 # latency under Samsung's load: 128 µs

# ---- 8. Step 10: the floor ---------------------------------------------------------------------------------------------
A_BYTES = TiB / NVME_BW
assert round(A_BYTES, 1) == 161.7 and round(A_BYTES) == 162                              # "162 s"
A_REQS = TiB // (128 * KiB)
assert A_REQS == 8_388_608
A_WAITS = A_REQS * 20e-6 / 32     # alpha = 20 µs: Samsung's sequential 4 KB latency at QD1 ("20/20 us"), shown on screen as "α = 20 µs (sequential)"
assert round(A_WAITS, 2) == 5.24 and round(A_WAITS) == 5                                 # "5 s"
assert round(A_REQS * 80e-6 / 32, 1) == 21.0                                             # with the random-read 80 µs it would be 21 s: same verdict, so the sequential alpha is shown instead
B_BYTES = ORDERS_BYTES / HDD_BW
assert round(B_BYTES, 1) == 28.7 and round(B_BYTES) == 29                                # "29 s"
B_WAITS = 1_000_000 * (1 / 168)
assert round(B_WAITS) == 5_952                                                           # "5,952 s"
assert max(A_BYTES, A_WAITS) == A_BYTES and max(B_BYTES, B_WAITS) == B_WAITS             # the verdicts
assert max(A_BYTES, A_REQS * 80e-6 / 32) == A_BYTES                                      # ... and with 80 µs

# ---- 9. Step 11: scanning orders ---------------------------------------------------------------------------------------
RAM_SCAN_S = ORDERS_BYTES / (REF_GBS * 1e9)
NVME_SCAN_S = ORDERS_BYTES / NVME_BW
assert round(RAM_SCAN_S, 1) == 0.7 and round(NVME_SCAN_S, 1) == 1.2 and round(B_BYTES, 1) == 28.7
assert 0.08 <= ORDERS_BYTES / (live[3] * 1e9) <= 8.2              # the live run's own single-core scan time, from the 1-100 GB/s range
assert 60 - 1.2 > 58 and round(60 - 1.2) == 59                    # "the other 59 seconds"

# ---- 10. Step 12: back to the problem ----------------------------------------------------------------------------------
RANGE = 16 * MiB
REQS = TiB // RANGE
assert REQS == 65_536
WAITS_1 = REQS * 0.1
assert round(WAITS_1, 1) == 6_553.6 and round(WAITS_1) == 6_554 and round(WAITS_1 / 3600, 1) == 1.8     # "1.8 hours"
NIC_S = TiB / NIC100_BW
assert round(NIC_S) == 88                                                                # bytes at 100 Gbit/s
K = next(k for k in range(1, 1000) if WAITS_1 / k <= A_BYTES)
assert K == 41 and WAITS_1 / 40 > A_BYTES                                                # 40 fails, 41 holds: "at least k = 41" (assumes instant transfers)
assert round(WAITS_1 / 41) == 160 and round(WAITS_1 / 41, 1) == 159.8
assert round(NVME_BW / 41 / 1e6) == 166                                                  # each request's share of the drive: "166 MB/s (the drive's rate ÷ 41)"
assert [1, 2, 4, 8, 16, 32, 41][-1] == K
assert round(WAITS_1 / 128, 1) == 51.2 and 1 <= 128                                      # slider end: bytes term (88 s) is the floor
assert max(WAITS_1 / 128, NIC_S) == NIC_S
# A closer estimate: each request also streams its 16 MiB after its wait: (R / k) * (alpha + s / b).
def real_k(b):
    return REQS * (0.1 + RANGE / b) / A_BYTES

assert math.ceil(real_k(FLOW_BW)) == 52 and round(real_k(FLOW_BW), 1) == 51.4
assert math.ceil(real_k(NVME_BW / 41)) == 82 and round(real_k(NVME_BW / 41), 1) == 81.5
assert math.ceil(real_k(NIC100_BW)) == 42 and round(real_k(NIC100_BW), 1) == 41.1
assert round(REQS / 41 * (0.1 + RANGE / (NVME_BW / 41)), 1) == 321.5                     # k = 41 at 166 MB/s a request
assert round(REQS / (WAITS_1 / 41)) == 410 and 410 < 5_500                               # requests/s at k = 41, far below the limit
assert math.ceil(WAITS_1 / 2 / A_BYTES) == 21                                            # at alpha = 50 ms, k = 21 would do

# ---- 11. Prove it 1: random 8 KB page reads on NVMe -------------------------------------------------------------------
P1 = 2_000_000 * NVME_ALPHA
assert round(P1) == 160                                                                  # "160 s"
assert round(2_000_000 * (NVME_ALPHA + 8_192 / NVME_BW), 1) == 162.4
assert round(P1 / NVME_SCAN_S) == 133 and round(P1 / NVME_SCAN_S, -1) == 130             # "130 times"
assert round(P1 / 80) == 2                                                               # waits with 80 in flight
P1_BYTES = 2_000_000 * 8_192 / NVME_BW
assert round(P1_BYTES, 1) == 2.4 and round(P1 / P1_BYTES) == 66                          # "66 times lower"
assert 2_000_000 / 1_000_000 == 2 and round(2_000_000 * 8e-6) == 16                      # the "2 s" and "16 s" wrong options
assert 830_000 < NVME_BW / 8_192 < 831_000                                               # Deep dive: at most about 830,000 pages a second

# ---- 12. Prove it 2: copy orders to another instance -----------------------------------------------------------------------
assert round(ORDERS_BYTES / FLOW_BW, 1) == 13.1 and round(ORDERS_BYTES / FLOW_BW) == 13   # one flow, 5 Gbit/s
assert round(ORDERS_BYTES / (10 / 8 * 1e9), 1) == 6.6                                     # 10 Gbit/s in a cluster placement group
assert round(ORDERS_BYTES / (25 / 8 * 1e9), 1) == 2.6                                     # several flows, the instance's 25 Gbit/s
assert 25 / 8 * 1e9 == 3_125e6 and 5 / 8 * 1e9 == 625e6 and 625e6 < 3_125e6 < NVME_BW      # the answer frame's three links: 6,800 / 625 / 3,125 MB/s, the flow is the narrowest
assert round(ORDERS_BYTES / NVME_BW, 1) == 1.2 and round(B_BYTES) == 29                   # the drive alone; the HDD scan (the 29 s option)

# ---- 13. Prove it 3: the nightly job's measurement --------------------------------------------------------------------------
P3_WAITS = REQS * 0.1 / 8
assert P3_WAITS == 819.2 and round(P3_WAITS) == 819 and round(P3_WAITS / 60, 1) == 13.7
assert round(REQS / P3_WAITS) == 80                                                       # requests a second
assert round(5_500 / 80, 2) == 68.75 and round(5_500 / 80) == 69                          # the limit is 69x the rate used
assert round(NIC_S) == 88
cap_t = REQS * (0.1 + RANGE / FLOW_BW) / 8
assert round(cap_t) == 1_039 and round(cap_t / 60, 1) == 17.3 and cap_t / 60 < 18         # 18 minutes is consistent
assert round(18 * 60 / P3_WAITS, 2) == 1.32                                               # the reel's argument: 18 min is 1.3x the waits-only floor
# The reel no longer argues from a per-request rate (REVIEW finding 20): cap_t above assumes 625 MB/s per request, an EC2 figure, not S3's.
# Measured, the job issues 65,536 requests in 18 minutes: about 61 a second, under the "at most 80" floor rate and far under 5,500.
assert round(REQS / (18 * 60)) == 61 and round(REQS / P3_WAITS) == 80

# ---- 14. Loopback round trip (Deep dive): the software floor of one TCP round trip, no wire at all ---------------------
def loopback_median_us(rounds=20_000):
    srv = socket.socket(); srv.bind(('127.0.0.1', 0)); srv.listen(1)
    port = srv.getsockname()[1]

    def echo():
        conn, _ = srv.accept()
        conn.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
        while (data := conn.recv(64)):
            conn.sendall(data)
        conn.close()

    threading.Thread(target=echo, daemon=True).start()
    c = socket.create_connection(('127.0.0.1', port))
    c.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
    times = []
    for _ in range(rounds):
        t0 = time.perf_counter(); c.sendall(b'x'); c.recv(64); times.append(time.perf_counter() - t0)
    c.close(); srv.close()
    return statistics.median(times) * 1e6

median_us = loopback_median_us()
assert 1 < median_us < 5_000, median_us                        # reference runs: 33, 36 and 40 µs median (the Deep dive says "about 30-40 µs here")
print(f'loopback TCP round trip: median {median_us:.0f} us (no network involved)')

# ---- 15. NUMA (Deep dive): measured only where there is a second node ------------------------------------------------------
nodes = [d for d in os.listdir('/sys/devices/system/node') if d.startswith('node') and d[4:].isdigit()] if os.path.isdir('/sys/devices/system/node') else []
if len(nodes) >= 2 and shutil.which('numactl'):
    with tempfile.TemporaryDirectory() as tmp:
        exe, _ = build_walk(tmp)
        local = float(subprocess.run(['numactl', '--cpunodebind=0', '--membind=0', str(exe), str(GiB), '5000000'], capture_output=True, text=True, check=True).stdout.split()[2])
        remote = float(subprocess.run(['numactl', '--cpunodebind=0', '--membind=1', str(exe), str(GiB), '5000000'], capture_output=True, text=True, check=True).stdout.split()[2])
        assert remote >= 0.95 * local, (local, remote)
        print(f'NUMA: dependent read {local:.0f} ns local, {remote:.0f} ns remote ({remote / local:.2f}x)')
else:
    print(f'{max(len(nodes), 1)} NUMA node: no remote memory to measure here')

# ---- 16. NumPy variant (Deep dive only; backs no number on screen) -------------------------------------------------------
try:
    import numpy as np
except ImportError:
    print('NumPy not installed: skipping the NumPy variant')
else:
    m = 2**27
    data = np.arange(m, dtype=np.int64)
    inorder = np.arange(m)
    shuffled = np.random.default_rng(42).permutation(m)
    out = np.zeros(m, dtype=np.int64)                          # touched first, so page faults are not timed
    t0 = time.perf_counter(); np.take(data, inorder, out=out); t_in = time.perf_counter() - t0
    t0 = time.perf_counter(); np.take(data, shuffled, out=out); t_rand = time.perf_counter() - t0
    assert t_rand / t_in >= 1.5, (t_in, t_rand)
    print(f'NumPy take: {t_in / m * 1e9:.1f} ns in order, {t_rand / m * 1e9:.1f} ns shuffled ({t_rand / t_in:.1f}x)')

print('ok')
