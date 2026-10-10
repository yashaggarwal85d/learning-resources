"""Executed truth for the I/O cost model reel (run by `npm run test:examples`).

Checks the numbers the reel shows, by computing them rather than restating them.
"""

import math
import random

KiB, MiB, GiB, TiB = 2**10, 2**20, 2**30, 2**40

# ── The query: 100,000,000 rows, 100 rows per page, 2% match ───────────────
N, B = 100_000_000, 100
pages = N // B
assert pages == 1_000_000
matches = N * 2 // 100
assert matches == 2_000_000  # row by row: one random read each
assert matches * 4 == 8 * pages  # at r = 4, eight times the scan
assert 1 / B == 0.01  # crossover at 1/B = 1%
assert 1 / (4 * B) == 0.0025  # with r = 4: a quarter of a percent

# Sorted lookups: a page is skipped only if none of its 100 rows match.
touched = 1 - (1 - 0.02) ** B
assert round(touched, 3) == 0.867  # ~87% of the pages

# CPU big-O vs block transfers: in the RAM model the index's log N + k beats
# the scan's N for any k much smaller than N; counting I/Os it wins only while
# k < N/B, here 1,000,000 matches = 1% of the rows.
assert N // B == 1_000_000 and (N // B) / N == 0.01

# A physical r for a cold-cache 7,200 rpm disk (Seagate Exos datasheet):
# 168 random-read IOPS -> ~6 ms per random read; 285 MB/s sequential -> an
# 8 KB page streams in ~29 us.
rand_s, seq_s = 1 / 168, 8192 / 285e6
r_hdd = rand_s / seq_s
assert round(rand_s * 1e3) == 6 and round(seq_s * 1e6) == 29
assert 150 < r_hdd < 250 and round(r_hdd, -2) == 200  # r ~ 200
assert round(100 / (r_hdd * B), 3) == 0.005  # crossover ~0.005% of the rows

# ── How PostgreSQL 18 prices the reel's query (costsize.c, tidbitmap.c) ────
seq_page, rand_page, cpu_tuple, cpu_index_tuple, cpu_op = 1.0, 4.0, 0.01, 0.005, 0.0025
qual = cpu_op  # one operator: status = 'refunded'
T, ntuples, sel = pages, N, 0.02
t = sel * ntuples  # 2,000,000 tuples fetched

# Sequential scan: pages * seq_page_cost + tuples * (cpu_tuple_cost + quals).
seq_cost = T * seq_page + ntuples * (cpu_tuple + qual)
assert seq_cost == 2_250_000

# Bitmap heap scan. compute_bitmap_pages: Mackert-Lohman, 2Tt / (2T + t).
ml_pages = 2 * T * t / (2 * T + t)
assert ml_pages == T  # the planner expects every page, not the true 87%
assert ml_pages / T > touched
cost_per_page = rand_page - (rand_page - seq_page) * math.sqrt(ml_pages / T)
assert cost_per_page == 1.0
# The 87% the reel shows would be priced at ~1.2 per page:
assert round(rand_page - (rand_page - seq_page) * math.sqrt(touched), 1) == 1.2

# work_mem = 4 MB holds 4 MiB / (sizeof(PagetableEntry) + 2 pointers) entries.
# PagetableEntry: blockno (4) + status, ischunk, recheck (3) + pad (1)
# + words[max(WORDS_PER_PAGE, WORDS_PER_CHUNK)] = 5 x 8 bytes (291 tuples/page).
words = max((291 - 1) // 64 + 1, (8192 // 32 - 1) // 64 + 1)
entry = 4 + 3 + 1 + 8 * words
assert entry == 48
maxentries = (4 * MiB) // (entry + 8 + 8)
assert maxentries == 65_536
lossy = max(0, T - maxentries / 2)  # tbm_lossify's "crude approximation"
exact = T - lossy
assert lossy == 967_232 and round(lossy / T, 3) == 0.967  # ~97% of pages lossy
# Lossy pages are rechecked tuple by tuple, so the CPU is charged on them all.
tuples_fetched = sel * (exact / T) * ntuples + (lossy / T) * ntuples
assert round(tuples_fetched) == 96_788_736
heap_cost = ml_pages * cost_per_page + tuples_fetched * (cpu_tuple + qual)
assert round(heap_cost) == 2_209_859
# The bitmap index scan: per index tuple cpu_index_tuple_cost + the qual, plus
# 0.1 * cpu_operator_cost per tuple for the bitmap (cost_bitmap_tree_node).
index_cpu = t * (cpu_index_tuple + cpu_op) + 0.1 * cpu_op * t
assert index_cpu == 15_500
bitmap_cost = heap_cost + index_cpu  # + 4.0 per index page read
assert round(bitmap_cost) == 2_225_359
gap = (seq_cost - bitmap_cost) / seq_cost
assert 0.01 < gap < 0.012  # ~1% apart before the index's own page reads
assert round((seq_cost - bitmap_cost) / rand_page) == 6_160  # index pages that tie it

# Parallel plans (defaults: max_parallel_workers_per_gather = 2,
# min_parallel_table_scan_size = 8 MB = 1,024 pages, parallel_setup_cost 1000,
# parallel_tuple_cost 0.1). Workers: one more per tripling of the table.
workers, threshold = 1, 1024
while T >= threshold * 3:
    workers, threshold = workers + 1, threshold * 3
assert workers == 7 and min(workers, 2) == 2
divisor = 2 + (1 - 0.3 * 2)  # the leader helps a little
assert divisor == 2.4
gather = 1000 + 0.1 * t
par_seq = T * seq_page + ntuples * (cpu_tuple + qual) / divisor + gather
par_bitmap = ml_pages * cost_per_page + tuples_fetched * (cpu_tuple + qual) / divisor + index_cpu + gather
assert round(par_seq) == 1_721_833
assert round(par_bitmap) == 1_720_608  # + 4.0 per index page read
assert abs(par_seq - par_bitmap) / par_seq < 0.001  # a dead heat

# Lab 1, measured on PostgreSQL 16.15 (these functions are unchanged in 18):
# 20,619 pages, 97 rows per page.
lab_pages, lab_b = 20_619, 97
assert round(lab_pages * (1 - 0.98**lab_b)) == 17_714
assert round(100 / (4 * lab_b), 2) == 0.26
assert round(100 / (1.1 * lab_b), 2) == 0.94
# A scaled copy of the reel's case: 2,000,000 rows, an estimated 40,722 matches
# (about 2 per page), work_mem = 84kB so the bitmap holds the same share of
# the table as 4 MB does for a million pages. EXPLAIN showed the bitmap index
# scan at 445.84; the rest is the formulas above.
lab_rows, lab_t, lab_idx = 2_000_000, 40_722, 445.84
lab_entries = (84 * KiB) // 64
assert lab_entries == 1_344 and abs(lab_entries / lab_pages - maxentries / T) < 0.001
lab_ml = 2 * lab_pages * lab_t / (2 * lab_pages + lab_t)
lab_fetch = math.ceil(lab_ml)
lab_cpp = rand_page - (rand_page - seq_page) * math.sqrt(lab_fetch / lab_pages)
lab_lossy = lab_ml - lab_entries / 2
lab_tf = round((lab_t / lab_rows) * ((lab_ml - lab_lossy) / lab_ml) * lab_rows + (lab_lossy / lab_ml) * lab_rows)
lab_startup = lab_idx + 0.1 * cpu_op * lab_t
lab_bitmap = lab_startup + lab_fetch * lab_cpp + lab_tf * (cpu_tuple + qual)
lab_seq = lab_pages + lab_rows * (cpu_tuple + qual)
assert abs(lab_bitmap - 45_335.36) < 0.5, lab_bitmap  # EXPLAIN: 45335.36
assert lab_seq == 45_619  # EXPLAIN: 45619.00
assert round((lab_seq - lab_bitmap) / lab_seq * 100, 1) == 0.6
lab_gather = 1000 + 0.1 * lab_t
lab_par_seq = lab_pages + lab_rows * (cpu_tuple + qual) / divisor + lab_gather
lab_par_bitmap = lab_startup + lab_fetch * lab_cpp + lab_tf * (cpu_tuple + qual) / divisor + lab_gather
assert abs(lab_par_seq - 36_107.87) < 0.01  # EXPLAIN: 36107.87
assert abs(lab_par_bitmap - 36_292.79) < 0.5, lab_par_bitmap  # EXPLAIN: 36292.79
assert round((lab_par_bitmap - lab_par_seq) / lab_par_seq * 100, 1) == 0.5

# ── Prove it 1: 50,000,000 rows, 50 per page, an unclustered index, 400,000 matches ──
p1_pages = 50_000_000 // 50
assert p1_pages == 1_000_000
p1_reads = 400_000  # one random read per match
assert p1_reads < p1_pages  # equal costs: the index wins
assert p1_reads * 4 == 1_600_000 > p1_pages  # r = 4: the scan wins

# ── External merge sort: 1 TiB with 16 GiB of memory, 1 MiB blocks ────────
def passes(data, memory, block):
    runs = math.ceil(data / memory)
    fan_in = memory // block - 1
    merges = 0
    while runs > 1:
        runs = math.ceil(runs / fan_in)
        merges += 1
    return 1 + merges, math.ceil(data / memory), fan_in


assert passes(1 * TiB, 16 * GiB, 1 * MiB) == (2, 64, 16_383)
assert passes(1 * TiB, 4 * GiB, 1 * MiB) == (2, 256, 4_095)
assert passes(4 * TiB, 8 * GiB, 8 * MiB) == (2, 512, 1_023)
# Two-way merging the 64 runs: 1 + log2(64) = 7 passes.
assert 1 + math.ceil(math.log2(64)) == 7

# The bound and the pass count are the same thing (Deep dive, "The model, as
# stated"): log_{M/B}(N/B) = 1 + log_{M/B}(N/M), and the passes are
# 1 + ceil(log_{M/B - 1}(N/M)), each reading and writing all N/B blocks.
n_blk, m_blk = TiB // MiB, (16 * GiB) // MiB  # N/B and M/B in blocks
assert math.isclose(math.log(n_blk, m_blk), 1 + math.log(TiB / (16 * GiB), m_blk))
assert round(math.log(n_blk, m_blk), 2) == 1.43  # the bound's log is under 2...
assert 1 + math.ceil(math.log(64, m_blk - 1)) == 2  # ...and the sort takes 2 passes
assert 2 * 2 * TiB == 4 * TiB  # 2 passes x (read + write) = 4 TiB of I/O
# Vitter's (2008) example: N = 10^10, M = 10^7, B = 10^4 items: log_m n = 2.
assert round(math.log(10**10 / 10**4, 10**7 / 10**4), 9) == 2

# ── Parallel disk model: D disks (Vitter and Shriver) ──────────────────────
# Scan and sort divide by D; search only goes from log_B N to log_{DB} N.
D = 8
assert pages // D == 125_000  # our scan, striped over 8 disks
assert round(math.log(N, B)) == 4  # B-tree levels with 100 keys per page
assert math.ceil(math.log(N, D * B)) == 3  # with 8 disks: about 3, not 4/8
assert 1 + math.log(D) / math.log(B) < 2  # Vitter: speedup typically under 2

# ── The network is a tier too: join 1 TB with 100 MB on 100 machines ───────
MACHINES = 100
big, small = 1_000 * 10**9, 100 * 10**6  # bytes (decimal, as on the slide)

# Shuffle: every row is sent to machine hash(key) % 100. Simulate where rows
# start and where their key sends them, and count the share that moves.
rnd = random.Random(7)
sample = 200_000
moved = sum(1 for _ in range(sample) if rnd.randrange(MACHINES) != rnd.randrange(MACHINES))
share = moved / sample
assert abs(share - 0.99) < 0.002, share
shuffle_bytes = (MACHINES - 1) / MACHINES * (big + small)
assert round(shuffle_bytes / 1e9) == 990  # ≈ 990 GB on the wire

# Broadcast: every machine needs the whole small table; it already holds 1/100.
broadcast_bytes = MACHINES * small * (MACHINES - 1) / MACHINES
assert round(broadcast_bytes / 1e9, 1) == 9.9  # ≈ 9.9 GB on the wire
assert round(shuffle_bytes / broadcast_bytes) == 100  # 100× less traffic

# Lower bound on time at 10 Gbit/s per machine (1.25 GB/s each way):
# the shuffle sends ~9.9 GB per machine, the broadcast receives 99 MB.
per_machine = shuffle_bytes / MACHINES
assert round(per_machine / 1.25e9) == 8  # ~8 s
assert round(small * 0.99 / 1.25e9, 2) == 0.08  # ~0.08 s

# The crossover: broadcast moves fewer bytes while
#   |S| (p - 1) < (p - 1)/p (|R| + |S|)   <=>   |S| < |R| / (p - 1) ~ |R| / p.
def broadcast_wins(r, s, p):
    return s * (p - 1) < (p - 1) / p * (r + s)


limit = big / (MACHINES - 1)
assert round(limit / 1e9, 1) == 10.1  # ~10 GB here; it grows as machines are removed
assert broadcast_wins(big, 0.99 * limit, MACHINES) and not broadcast_wins(big, 1.01 * limit, MACHINES)
assert round(big / 1000 / 1e9) == 1  # on 1,000 machines the limit drops to ~1 GB
# Spark's fixed default, spark.sql.autoBroadcastJoinThreshold = 10 MB, is far
# below the bytes crossover (and below our 100 MB table): a memory guard.
assert 10 * MiB == 10_485_760 and 10 * MiB < small < limit

# ── Object storage: latency x bandwidth sets the request size ──────────────
# AWS: ~100-200 ms consistent latency; one concurrent range request per
# 85-90 MB/s of throughput. At alpha*beta bytes a request spends as long
# waiting as transferring.
alpha, beta = 0.100, 90e6
assert round(alpha * beta / 1e6) == 9  # ~9 MB, inside AWS's 8-16 MB ranges
assert 8e6 <= 0.100 * 85e6 and 0.200 * 90e6 <= 18e6

print("io-cost-model examples: all numbers check out")
