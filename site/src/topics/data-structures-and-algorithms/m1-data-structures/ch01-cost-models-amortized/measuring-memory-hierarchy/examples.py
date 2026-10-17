"""Executed truth for the measuring the memory hierarchy reel.

Checks the numbers the reel shows: the order-of-magnitude latency anchors are sourced facts
(Drepper 2007; Norvig's latency table), and the cache-line / page-size arithmetic is computed.
"""

import math

KiB, MiB = 2**10, 2**20

# -- Order-of-magnitude latency anchors (sourced, not measured here) ----------------------------
L1_LATENCY_NS = 1
DRAM_LATENCY_LOW_NS, DRAM_LATENCY_HIGH_NS = 50, 100
assert L1_LATENCY_NS == 1
assert DRAM_LATENCY_LOW_NS == 50 and DRAM_LATENCY_HIGH_NS == 100

span_low = DRAM_LATENCY_LOW_NS / L1_LATENCY_NS
span_high = DRAM_LATENCY_HIGH_NS / L1_LATENCY_NS
assert span_low == 50 and span_high == 100
assert round(span_high / 100) == 1  # a hundredfold span, top to bottom

# -- A cache-line sweep for 64-bit keys: 64 bytes holds 8 keys -----------------------------------
LINE_BYTES = 64
KEY_BYTES = 64 // 8
assert LINE_BYTES == 64
line_keys = LINE_BYTES // KEY_BYTES
assert line_keys == 8

# -- The adjacent-line (spatial) prefetcher can make a 64-byte line look twice as wide -----------
adjacent_pair_bytes = LINE_BYTES * 2
assert adjacent_pair_bytes == 128

# -- TLB reach: entries times page size, for a 4 KiB page ---------------------------------------
PAGE_BYTES = 4 * KiB
assert PAGE_BYTES == 4_096
entries = 64  # an illustrative TLB entry count, to show the reach formula
reach_bytes = entries * PAGE_BYTES
assert reach_bytes == 262_144  # 256 KiB of reach for 64 entries at 4 KiB pages

# A 2 MiB huge page is 512x a 4 KiB page, so the same entry count reaches 512x as much memory.
HUGE_PAGE_BYTES = 2 * MiB
ratio = HUGE_PAGE_BYTES / PAGE_BYTES
assert HUGE_PAGE_BYTES == 2_097_152
assert ratio == 512

# -- Reconciling copies and the clock: a million appends doubling from empty --------------------
N = 1_000_000
resizes = math.ceil(math.log2(N))
assert resizes == 20
total_copies = 2**resizes - 1
assert total_copies == 1_048_575
assert round(total_copies / N, 2) == 1.05  # about 1.05 copies per append, not 2

last_resize_copy = 2 ** (resizes - 1)
assert last_resize_copy == 524_288  # the final resize alone copies half the data

print("measuring-memory-hierarchy examples: all numbers check out")
