"""Space-filling curves and cell indexes: Z-order (Morton) and Hilbert codes
over a small 2D grid, each verified to visit every cell exactly once, then
compared directly on locality for a fixed set of near-neighbour pairs.
"""

N = 8  # 8x8 grid, 3 bits per axis
ORDER = 3  # 2**ORDER == N

POINTS = [(x, y) for x in range(N) for y in range(N)]

NEAR_PAIRS = [
    ((0, 0), (1, 0)),  # near the grid's own origin corner: no boundary crossed
    ((3, 4), (4, 4)),  # horizontally adjacent, crosses the x=4 quadrant boundary
    ((0, 3), (0, 4)),  # vertically adjacent, crosses the y=4 quadrant boundary
]


def row_major(x, y):
    return y * N + x


def morton_code(x, y):
    """Z-order code: interleave x's and y's bits, x-bit first (low bit), per
    Wikipedia's own construction ("starting to the right with the x-bit...
    and alternating to the left with the y-bit")."""
    z = 0
    for i in range(ORDER):
        z |= ((x >> i) & 1) << (2 * i)
        z |= ((y >> i) & 1) << (2 * i + 1)
    return z


def _hilbert_rotate(n, x, y, rx, ry):
    if ry == 0:
        if rx == 1:
            x = n - 1 - x
            y = n - 1 - y
        x, y = y, x
    return x, y


def hilbert_code(x, y):
    """Hilbert d from (x, y), the standard recursive construction (quadrant
    chosen by two high bits, remaining bits transformed by rotation/reflection
    before recursing one level down)."""
    rx = ry = 0
    d = 0
    x, y = x, y
    s = N // 2
    while s > 0:
        rx = 1 if (x & s) > 0 else 0
        ry = 1 if (y & s) > 0 else 0
        d += s * s * ((3 * rx) ^ ry)
        x, y = _hilbert_rotate(N, x, y, rx, ry)
        s //= 2
    return d


# --- Verify both curves visit every one of the 64 cells exactly once ---

row_major_codes = sorted(row_major(x, y) for x, y in POINTS)
assert row_major_codes == list(range(N * N)), "row-major must be a bijection onto 0..63"

morton_codes = sorted(morton_code(x, y) for x, y in POINTS)
assert morton_codes == list(range(N * N)), "Z-order/Morton must be a bijection onto 0..63"

hilbert_codes = sorted(hilbert_code(x, y) for x, y in POINTS)
assert hilbert_codes == list(range(N * N)), "Hilbert must be a bijection onto 0..63"

# --- Hand-check one Morton code: (3, 5) -> interleave bits x=011, y=101 ---
# x bits (low to high): 1,1,0   y bits (low to high): 1,0,1
# interleaved low to high: x0,y0,x1,y1,x2,y2 = 1,1,1,0,0,1 -> binary y2y1x2y0x1x0... read
# as bit5..bit0 = y2,x2,y1,x1,y0,x0 = 1,0,0,1,1,1 = 0b100111
assert morton_code(3, 5) == 0b100111, morton_code(3, 5)
assert morton_code(3, 5) == 39

# --- Locality measurement: real distances in each ordering, for the same pairs ---

def distances():
    results = []
    for (p, q) in NEAR_PAIRS:
        row_dist = abs(row_major(*p) - row_major(*q))
        z_dist = abs(morton_code(*p) - morton_code(*q))
        h_dist = abs(hilbert_code(*p) - hilbert_code(*q))
        results.append((p, q, row_dist, z_dist, h_dist))
    return results

LOCALITY = distances()

# Pair 1: (0,0)-(1,0), both inside the grid's own origin quadrant -> every
# ordering is near-optimal here; Z-order is not broken everywhere, only at
# the boundaries it crosses.
origin_row, origin_z, origin_h = LOCALITY[0][2], LOCALITY[0][3], LOCALITY[0][4]
assert (origin_row, origin_z, origin_h) == (1, 1, 3), LOCALITY[0]

# Pair 2: (3,4)-(4,4), horizontally adjacent but crossing the x=4 quadrant
# boundary -> Z-order's own jump, Hilbert stays adjacent.
mid_row, mid_z, mid_h = LOCALITY[1][2], LOCALITY[1][3], LOCALITY[1][4]
assert (mid_row, mid_z, mid_h) == (1, 11, 1), LOCALITY[1]

# Pair 3: (0,3)-(0,4), vertically adjacent, crossing the y=4 quadrant boundary
# -> the worst case measured here: Z-order's jump more than doubles pair 2's.
diag_row, diag_z, diag_h = LOCALITY[2][2], LOCALITY[2][3], LOCALITY[2][4]
assert (diag_row, diag_z, diag_h) == (8, 22, 1), LOCALITY[2]

# Average distance across all three pairs, for each ordering (used once in post-notes)
avg_row = sum(r[2] for r in LOCALITY) / len(LOCALITY)
avg_z = sum(r[3] for r in LOCALITY) / len(LOCALITY)
avg_h = sum(r[4] for r in LOCALITY) / len(LOCALITY)
assert round(avg_row, 2) == 3.33, avg_row
assert round(avg_z, 2) == 11.33, avg_z
assert round(avg_h, 2) == 1.67, avg_h

if __name__ == "__main__":
    print("row-major, morton, hilbert are all bijections onto 0..63: ok")
    print(f"morton_code(3, 5) = {morton_code(3, 5)}")
    for p, q, rd, zd, hd in LOCALITY:
        print(f"{p} <-> {q}: row-major dist {rd}, Z-order dist {zd}, Hilbert dist {hd}")
    print(f"boundary-crossing pair (0,3)-(0,4): row {diag_row}, Z-order {diag_z}, Hilbert {diag_h}")
    print(f"average distances: row-major {avg_row:.2f}, Z-order {avg_z:.2f}, Hilbert {avg_h:.2f}")
    print("all checks passed")
