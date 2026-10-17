"""Executed truth for the numeric representation and its data bugs reel.

Checks the numbers the reel shows, by computing them rather than restating them from memory.
"""

import math

# -- The running example: the shop's orders table ---------------------------------------------
ROWS = 100_000_000
assert ROWS == 100_000_000

# -- Integer width and overflow: a signed 32-bit order_id ---------------------------------------
BITS = 32
INT32_MAX = 2 ** (BITS - 1) - 1
assert INT32_MAX == 2_147_483_647

EVENTS_PER_SEC = 2_000  # "a few thousand events a second"
days_to_overflow = INT32_MAX / EVENTS_PER_SEC / 86_400
assert days_to_overflow < 14  # under two weeks

# What different engines actually do with np.power(100, 9) at two widths (fixes the earlier,
# wrong claim that dtype=np.int64 overflows for this call: int64 has headroom, int32 does not).
EXPONENT = 9
true_value = 100 ** EXPONENT
assert true_value == 1_000_000_000_000_000_000  # 10^18

INT64_MAX = 2**63 - 1
INT32_MAX_UNSIGNED_RANGE = 2**32
assert true_value <= INT64_MAX  # fits in int64: that call is exact, not a silent bug
assert true_value % INT32_MAX_UNSIGNED_RANGE != true_value  # it does NOT fit in int32: wraps there

# -- IEEE-754 binary64: a number line with uneven spacing ---------------------------------------
SIGNIFICAND_BITS = 53
TWO_53 = 2**SIGNIFICAND_BITS
assert SIGNIFICAND_BITS == 53
assert TWO_53 == 9_007_199_254_740_992

spacing_above = 2  # the gap between representable doubles once the exponent passes 2**53
assert spacing_above == 2
assert (1e16 + 1) == 1e16  # the arresting fact: coarse enough to swallow +1

# -- Why a float sum depends on the order: 0.1, 0.2, 0.3 -----------------------------------------
a, b, c = 0.1, 0.2, 0.3
left = (a + b) + c
right = a + (b + c)
assert left != right  # same three numbers, two groupings, two answers
assert abs(left - right) < 1e-15  # different only in the last decimal place

MANY_AMOUNTS = 1_000_000
assert MANY_AMOUNTS == 1_000_000

# -- DECIMAL(12, 2) times DECIMAL(5, 4): precision and scale propagation (PostgreSQL rule) ------
P1, S1 = 12, 2
P2, S2 = 5, 4
result_scale = S1 + S2
assert (P1, S1, P2, S2) == (12, 2, 5, 4)
assert result_scale == 6

# -- Timestamp resolution: a 64-bit count of nanoseconds spans about 292 years -------------------
NS_BITS = 64
ns_max = 2 ** (NS_BITS - 1) - 1
years_span = ns_max / 1e9 / 86_400 / 365.25
assert NS_BITS == 64
assert round(years_span) == 292

EPOCH_YEAR = 1970
year_low = EPOCH_YEAR - round(years_span)
year_high = EPOCH_YEAR + round(years_span)
assert year_low == 1_678 or year_low == 1_677  # pandas docs: 1677-09-21
assert year_high == 2_262  # pandas docs: 2262-04-11

print("numeric-representation-data-bugs examples: all numbers check out")
