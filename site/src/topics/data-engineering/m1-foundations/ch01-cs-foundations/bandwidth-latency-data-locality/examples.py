"""Executed truth for the bandwidth, latency and data locality reel.

Checks the numbers the reel shows, by computing them rather than restating them from memory.
Binary units (KiB/MiB/GiB) are used throughout the BDP derivation, matching index.mdx's fix.
"""

import math

KiB, MiB, GiB = 2**10, 2**20, 2**30

# -- The bandwidth-delay product: BDP = beta * RTT, beta in decimal bytes/s --------------------
BETA_BPS = 10_000_000_000 / 8  # 10 Gbit/s of payload, decimal bits -> bytes
assert BETA_BPS == 1_250_000_000

RTT_SAME_AZ_S = 0.5 / 1000
bdp_same_az = BETA_BPS * RTT_SAME_AZ_S
assert bdp_same_az == 625_000
assert round(bdp_same_az / KiB) == 610  # ~610 KiB

RTT_CROSS_REGION_S = 60 / 1000
assert RTT_CROSS_REGION_S == 0.06
bdp_cross_region = BETA_BPS * RTT_CROSS_REGION_S
assert bdp_cross_region == 75_000_000
assert round(bdp_cross_region / MiB, 1) == 71.5  # ~71.5 MiB, not 75 MiB: binary units throughout

# -- The classic 16-bit receive-window field caps a single flow at 64 KiB -----------------------
WINDOW_BITS = 16
window_max_bytes = 2**WINDOW_BITS - 1
assert WINDOW_BITS == 16
assert window_max_bytes == 65_535
assert round(window_max_bytes / KiB) == 64

throughput_same_az = window_max_bytes / RTT_SAME_AZ_S
assert round(throughput_same_az / MiB) == 125  # ~125 MiB/s
throughput_cross_region = window_max_bytes / RTT_CROSS_REGION_S
assert round(throughput_cross_region / MiB, 1) == 1.0  # ~1.0 MiB/s

fraction_of_link = throughput_cross_region / BETA_BPS
assert fraction_of_link * 100 < 0.1  # under a tenth of one percent of the link's rate

# -- Window scaling: shift capped at 14, giving a maximum window of 1 GiB -----------------------
SCALE_SHIFT_MAX = 14
scaled_window_max = window_max_bytes * 2**SCALE_SHIFT_MAX
assert SCALE_SHIFT_MAX == 14
assert round(scaled_window_max / GiB) == 1

# -- Little's law: ten parallel streams split the cross-region BDP ------------------------------
STREAMS = 10
per_stream_mib = bdp_cross_region / STREAMS / MiB
assert STREAMS == 10
assert round(per_stream_mib, 1) == 7.2

# -- The shop join on 100 machines, repriced in time (10 Gbit/s = 1.25 GB/s per machine) --------
MACHINES = 100
shuffle_gb, broadcast_gb = 990, 9.9
assert MACHINES == 100
assert shuffle_gb == 990 and broadcast_gb == 9.9
assert round(shuffle_gb / broadcast_gb) == 100  # a hundred times less traffic

LINK_GBPS = 1.25  # GB/s per machine, decimal, at 10 Gbit/s
# shuffle_gb and broadcast_gb are each the total traffic summed over all machines; divide by the
# machine count to get what one machine sends (shuffle) or receives (broadcast).
shuffle_seconds = shuffle_gb / MACHINES / LINK_GBPS
broadcast_seconds = broadcast_gb / MACHINES / LINK_GBPS
assert round(shuffle_seconds) == 8
assert round(broadcast_seconds, 2) == 0.08

# -- The same join, repriced in dollars (AWS cross-AZ: $0.01/GB, each direction) ----------------
RATE_PER_GB = 0.01
assert RATE_PER_GB == 0.01
shuffle_dollars = shuffle_gb * RATE_PER_GB * 2  # send + receive
broadcast_dollars = broadcast_gb * RATE_PER_GB * 2
assert round(shuffle_dollars) == 20
assert round(broadcast_dollars, 2) == 0.20
assert round(shuffle_dollars / broadcast_dollars) == 100  # tracks the byte ratio exactly

print("bandwidth-latency-data-locality examples: all numbers check out")
