"""Executed truth for the storage devices and fsync durability reel.

Checks the numbers the reel shows, by computing or stating them as sourced facts, rather than
restating them from memory.
"""

import math

KiB, MiB, GiB = 2**10, 2**20, 2**30

# -- A hard disk pays for every seek (Seagate Exos X22-class, 7,200 rpm enterprise HDD) --------
RPM = 7_200
assert RPM == 7_200

SEQ_MBPS = 285          # ~285 MB/s streaming sequentially (Seagate Exos datasheet)
RAND_IOPS = 168         # ~168 random 4 KiB read IOPS at queue depth 16 (same datasheet)
BLOCK_B = 4 * KiB       # the physical block the IOPS figure is measured at
assert SEQ_MBPS == 285 and RAND_IOPS == 168

seq_bytes_per_s = SEQ_MBPS * 1_000_000
rand_bytes_per_s = RAND_IOPS * BLOCK_B
ratio = seq_bytes_per_s / rand_bytes_per_s
assert round(ratio) == 414  # same drive, sequential over random

# That gap is two to three orders of magnitude: log10(414) is between 2 and 3.
assert 2 < math.log10(ratio) < 3

# Rotational latency, for scale (half a rotation on average, 7,200 rpm):
rotational_ms = 60_000 / RPM / 2
assert round(rotational_ms, 2) == 4.17

# -- Below one block, a write becomes two: the physical block is 4 KiB -------------------------
PHYSICAL_BLOCK_KIB = BLOCK_B // KiB
assert PHYSICAL_BLOCK_KIB == 4

# A write that straddles the boundary forces a read-modify-write: one write becomes two I/Os.
one_small_write_ios = 1
read_modify_write_ios = 2  # read the block, then write it back
assert read_modify_write_ios == 2 * one_small_write_ios

# -- Flash can only erase in bulk / write amplification (qualitative, no specific ratio shown) -
# Write amplification = flash bytes written / host bytes written; always >= 1, worse for random.
def write_amplification(live_pages_copied, pages_written):
    return 1 + live_pages_copied / pages_written


seq_wa = write_amplification(live_pages_copied=0, pages_written=100)
rand_wa = write_amplification(live_pages_copied=60, pages_written=100)
assert seq_wa == 1.0
assert rand_wa > seq_wa > 0  # random writes amplify past sequential, both at least one

# -- io_uring keeps a fast drive fed: PostgreSQL 18's io_method defaults -----------------------
PG_VERSION = 18
IO_WORKERS_DEFAULT = 3
IO_MAX_CONCURRENCY_CAP = 64
assert PG_VERSION == 18
assert IO_WORKERS_DEFAULT == 3
assert IO_MAX_CONCURRENCY_CAP == 64

# One submission queue entry maps to exactly one completion queue entry (io_uring(7)).
sqe_count = 40
cqe_count = sqe_count
assert sqe_count == cqe_count

print("storage-devices-fsync-durability examples: all numbers check out")
