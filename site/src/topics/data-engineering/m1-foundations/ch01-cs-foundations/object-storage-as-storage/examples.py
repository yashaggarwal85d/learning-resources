"""Executed truth for the object storage as a storage tier reel.

Checks the numbers the reel shows, by computing them, or stating documented limits as
sourced constants, rather than restating them from memory.
"""

import math

KiB, MiB, GiB, TiB = 2**10, 2**20, 2**30, 2**40

# -- Strong read-after-write consistency, since December 2020 (AWS announcement) --------------
CONSISTENCY_YEAR = 2020
assert CONSISTENCY_YEAR == 2020

# The running example's object key date, "today" in this course: 2026-10-13.
EXAMPLE_YEAR, EXAMPLE_MONTH, EXAMPLE_DAY = 2026, 10, 13
assert (EXAMPLE_MONTH, EXAMPLE_DAY) == (10, 13)

# -- The cost of one request: alpha + n/beta (AWS whitepaper figures) --------------------------
ALPHA_MS_LOW, ALPHA_MS_HIGH = 100, 200       # "consistent" first-byte latency for small objects
BETA_MBPS = 90                                # ~85-90 MB/s per request, AWS whitepaper
assert ALPHA_MS_LOW == 100 and ALPHA_MS_HIGH == 200 and BETA_MBPS == 90

alpha_s = ALPHA_MS_LOW / 1000
alpha_beta_mb = alpha_s * BETA_MBPS
assert round(alpha_beta_mb) == 9  # the break-even range size

RANGE_SIZE_MB_LOW, RANGE_SIZE_MB_HIGH = 8, 16  # AWS's recommended byte-range sizes
assert RANGE_SIZE_MB_LOW == 8 and RANGE_SIZE_MB_HIGH == 16
assert RANGE_SIZE_MB_LOW <= round(alpha_beta_mb) * 2 and alpha_beta_mb <= RANGE_SIZE_MB_HIGH

# -- Filling one machine's 10 Gbit/s link with 90 MB/s requests ---------------------------------
LINK_GBIT_S = 10
link_mbps = LINK_GBIT_S * 1_000_000_000 / 8 / 1_000_000
assert round(link_mbps) == 1_250

concurrent_requests = math.ceil(link_mbps / BETA_MBPS)
assert concurrent_requests == 14

# One stream draining 1 TiB at 90 MB/s (decimal megabytes):
one_tib_mb = TiB / 1_000_000
hours = one_tib_mb / BETA_MBPS / 3600
assert round(hours, 1) == 3.4

# -- Per-prefix request-rate limits (S3 performance guidelines) --------------------------------
PREFIX_WRITES_PER_S = 3_500
PREFIX_READS_PER_S = 5_500
SLOW_DOWN_STATUS = 503
assert PREFIX_WRITES_PER_S == 3_500 and PREFIX_READS_PER_S == 5_500 and SLOW_DOWN_STATUS == 503

# -- Range GET: 3 of 30 columns moves about a tenth of the bytes -------------------------------
columns_needed, columns_total = 3, 30
assert round(columns_needed / columns_total, 1) == 0.1

# -- Multipart upload limits (S3 User Guide) ----------------------------------------------------
MAX_PARTS = 10_000
PART_MIN_MIB, PART_MAX_GIB = 5, 5
assert MAX_PARTS == 10_000 and PART_MIN_MIB == 5 and PART_MAX_GIB == 5

# 1 TiB over at most 10,000 parts needs a minimum part size of about 105 MiB.
one_tib_mib = TiB / MiB
min_part_mib = one_tib_mib / MAX_PARTS
assert round(min_part_mib) == 105

print("object-storage-as-storage examples: all numbers check out")
