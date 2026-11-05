import heapq
import itertools
import random

# ---------- Skyline sweep: max-heap with lazy deletion ----------

BUILDINGS = [(2, 9, 10), (3, 7, 15), (5, 12, 12), (15, 20, 10), (19, 24, 8)]

def skyline(buildings):
    events = []
    for left, right, height in buildings:
        events.append((left, -height, right))   # start: push (negative height sorts max first)
        events.append((right, 0, 0))             # end: trigger a cleanup check
    events.sort()
    live = []  # max-heap of (-height, end)
    key_points = []
    prev_max = 0
    for x, neg_h, end in events:
        if neg_h != 0:
            heapq.heappush(live, (neg_h, end))
        while live and live[0][1] <= x:
            heapq.heappop(live)
        cur_max = -live[0][0] if live else 0
        if cur_max != prev_max:
            key_points.append((x, cur_max))
            prev_max = cur_max
    return key_points

SKYLINE = skyline(BUILDINGS)
assert SKYLINE == [(2, 10), (3, 15), (7, 12), (12, 0), (15, 10), (20, 8), (24, 0)]

# ---------- Rectangle union area: sweep with a coordinate-compressed cover count ----------

RECTANGLES = [(0, 0, 4, 3), (2, 1, 6, 5), (5, 0, 8, 2)]  # (x0, y0, x1, y1)

def rect_area(r):
    x0, y0, x1, y1 = r
    return (x1 - x0) * (y1 - y0)

SUM_OF_AREAS = sum(rect_area(r) for r in RECTANGLES)
assert SUM_OF_AREAS == 34

def covered_length(intervals):
    """Length covered by a union of 1-D intervals, via sort-and-merge (the active-set
    bookkeeping a cover-count segment tree does in O(log n) per update)."""
    if not intervals:
        return 0
    s = sorted(intervals)
    total = 0
    cur_lo, cur_hi = s[0]
    for lo, hi in s[1:]:
        if lo > cur_hi:
            total += cur_hi - cur_lo
            cur_lo, cur_hi = lo, hi
        else:
            cur_hi = max(cur_hi, hi)
    total += cur_hi - cur_lo
    return total

def union_area_sweep(rects):
    events = []
    for x0, y0, x1, y1 in rects:
        events.append((x0, 1, y0, y1))
        events.append((x1, -1, y0, y1))
    events.sort()
    active = []  # list of (y0, y1) currently covered
    area = 0.0
    prev_x = events[0][0]
    i = 0
    n = len(events)
    while i < n:
        x = events[i][0]
        area += covered_length(active) * (x - prev_x)
        while i < n and events[i][0] == x:
            _, sign, y0, y1 = events[i]
            if sign == 1:
                active.append((y0, y1))
            else:
                active.remove((y0, y1))
            i += 1
        prev_x = x
    return area

UNION_AREA = union_area_sweep(RECTANGLES)
assert UNION_AREA == 29

# ---------- Segment intersection: brute force vs sweep's neighbour-only tests ----------

def seg_intersect(a, b):
    (x1, y1), (x2, y2) = a
    (x3, y3), (x4, y4) = b
    def cross(o, p, q):
        return (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0])
    d1 = cross((x3, y3), (x4, y4), (x1, y1))
    d2 = cross((x3, y3), (x4, y4), (x2, y2))
    d3 = cross((x1, y1), (x2, y2), (x3, y3))
    d4 = cross((x1, y1), (x2, y2), (x4, y4))
    return ((d1 > 0) != (d2 > 0)) and ((d3 > 0) != (d4 > 0))

random.seed(6)
EIGHT_SEGMENTS = []
while len(EIGHT_SEGMENTS) < 8:
    p1 = (random.randint(0, 20), random.randint(0, 20))
    p2 = (random.randint(0, 20), random.randint(0, 20))
    if p1 != p2:
        EIGHT_SEGMENTS.append((p1, p2))

PAIR_COUNT_EIGHT = len(list(itertools.combinations(range(8), 2)))
assert PAIR_COUNT_EIGHT == 28

CROSSINGS_EIGHT = [
    (i, j) for (i, j) in itertools.combinations(range(8), 2)
    if seg_intersect(EIGHT_SEGMENTS[i], EIGHT_SEGMENTS[j])
]
assert len(CROSSINGS_EIGHT) == 2

# Scaling n up: sparse (mostly non-crossing) segments scattered over a growing area, so the
# crossing count k grows far slower than the n(n-1)/2 pairs an all-pairs scan would test.
import math

def gen_sparse(n, seed, area, span):
    random.seed(seed)
    segs = []
    while len(segs) < n:
        cx, cy = random.randint(0, area), random.randint(0, area)
        dx, dy = random.randint(-span, span), random.randint(-span, span)
        p1, p2 = (cx, cy), (cx + dx, cy + dy)
        if p1 != p2:
            segs.append((p1, p2))
    return segs

def crossings(segs):
    n = len(segs)
    return sum(1 for i, j in itertools.combinations(range(n), 2) if seg_intersect(segs[i], segs[j]))

SCALE_50 = gen_sparse(50, 6, 300, 20)
SCALE_200 = gen_sparse(200, 6, 600, 20)
SCALE_1000 = gen_sparse(1000, 6, 1200, 20)

K_50, K_200, K_1000 = crossings(SCALE_50), crossings(SCALE_200), crossings(SCALE_1000)
assert (K_50, K_200, K_1000) == (3, 5, 48)

PAIRS_50 = 50 * 49 // 2
PAIRS_200 = 200 * 199 // 2
PAIRS_1000 = 1000 * 999 // 2
assert (PAIRS_50, PAIRS_200, PAIRS_1000) == (1225, 19900, 499500)

SWEEP_COST_1000 = round((1000 + K_1000) * math.log2(1000))
assert SWEEP_COST_1000 == 10444

if __name__ == "__main__":
    print("Skyline key points:", SKYLINE)
    print("Sum of the three areas:", SUM_OF_AREAS, "Union area:", UNION_AREA)
    print("Eight segments: pairs =", PAIR_COUNT_EIGHT, "crossings =", len(CROSSINGS_EIGHT))
    print("n=50:", K_50, "/", PAIRS_50, " n=200:", K_200, "/", PAIRS_200, " n=1000:", K_1000, "/", PAIRS_1000)
    print("Sweep cost proxy at n=1000:", SWEEP_COST_1000)
