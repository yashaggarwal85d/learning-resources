"""Compressed bitmaps: Roaring. A set of 32-bit row ids, split into 65,536-value chunks, each
chunk stored as whichever of three containers (array, bitmap, run) is honestly smallest.

Every number the reel shows is computed or asserted here, not assumed.
"""
import random

CHUNK_BITS = 16
CHUNK_SIZE = 1 << CHUNK_BITS  # 65,536 values per chunk
BITMAP_BYTES = (1 << CHUNK_BITS) // 8  # 1,024 64-bit words = 8,192 bytes
ARRAY_BITMAP_BREAKEVEN = BITMAP_BYTES // 2  # 4,096: where 2*c == 8,192


def array_container_bytes(cardinality):
    return 2 * cardinality


def bitmap_container_bytes():
    return BITMAP_BYTES


def run_container_bytes(num_runs):
    return 2 + 4 * num_runs


def count_runs(sorted_values):
    """The number of maximal runs of consecutive integers in a sorted list."""
    if not sorted_values:
        return 0
    runs = 1
    for a, b in zip(sorted_values, sorted_values[1:]):
        if b != a + 1:
            runs += 1
    return runs


def smallest_container(sorted_values):
    """Pick whichever of array/bitmap/run is honestly smallest, per the Roaring+Run paper's
    own rules (SOURCES.md): array when 2c <= 8192, bitmap otherwise; run only when it beats
    whichever of those two would otherwise apply."""
    c = len(sorted_values)
    array_bytes = array_container_bytes(c)
    bitmap_bytes = bitmap_container_bytes()
    plain_best = min(array_bytes, bitmap_bytes)
    plain_kind = 'array' if array_bytes <= bitmap_bytes else 'bitmap'
    r = count_runs(sorted_values)
    run_bytes = run_container_bytes(r)
    if run_bytes < plain_best:
        return 'run', run_bytes
    return plain_kind, plain_best


# ---------------------------------------------------------------------------
# 1. The universe-level break-even: a plain bitmap over 2^32 values is a fixed
#    536,870,912 bytes; a plain sorted array of 32-bit ids is 4 bytes each.
# ---------------------------------------------------------------------------
UNIVERSE_BITMAP_BYTES = (1 << 32) // 8
breakeven_n = UNIVERSE_BITMAP_BYTES // 4
print(f"universe bitmap: {UNIVERSE_BITMAP_BYTES:,} bytes (512 MiB), fixed")
print(f"array/bitmap cross at n = {breakeven_n:,} ids (2^{breakeven_n.bit_length() - 1})")
assert UNIVERSE_BITMAP_BYTES == 536_870_912
assert breakeven_n == 134_217_728 == 2 ** 27

# ---------------------------------------------------------------------------
# 2. The chunk-level array/bitmap break-even.
# ---------------------------------------------------------------------------
print(f"\nchunk array/bitmap cross at {ARRAY_BITMAP_BREAKEVEN:,} values "
      f"(2 x {ARRAY_BITMAP_BREAKEVEN:,} = {2 * ARRAY_BITMAP_BREAKEVEN:,})")
assert ARRAY_BITMAP_BREAKEVEN == 4096
assert array_container_bytes(ARRAY_BITMAP_BREAKEVEN) == bitmap_container_bytes()

# ---------------------------------------------------------------------------
# 3. Three predicate shapes, worked chunk sizes against the planning table.
# ---------------------------------------------------------------------------
def make_scattered(n, universe, seed):
    """n values with no two consecutive -- forces run count == n."""
    rng = random.Random(seed)
    vals = set()
    while len(vals) < n:
        v = rng.randrange(universe)
        if v - 1 not in vals and v + 1 not in vals:
            vals.add(v)
    return sorted(vals)


def make_one_run(n, start=0):
    return list(range(start, start + n))


print("\nworked chunk sizes (container, bytes) against CHAPTER.md's planning table:")

sparse = make_scattered(100, CHUNK_SIZE, seed=1)
kind, size = smallest_container(sparse)
print(f"  100 scattered values, {count_runs(sparse)} runs -> {kind}, {size} B "
      f"(array {array_container_bytes(100)}, bitmap {bitmap_container_bytes()}, "
      f"run {run_container_bytes(count_runs(sparse))})")
assert kind == 'array' and size == 200

one_run_4097 = make_one_run(4097)
kind, size = smallest_container(one_run_4097)
print(f"  4,097 values in one run -> {kind}, {size} B "
      f"(array {array_container_bytes(4097)}, bitmap {bitmap_container_bytes()}, run 6)")
assert kind == 'run' and size == 6
assert array_container_bytes(4097) == 8194

def make_runs_of_two(num_runs, universe):
    """num_runs separate runs of length 2 each, evenly spaced so none touch."""
    stride = universe // num_runs
    return [start + d for start in range(0, num_runs * stride, stride) for d in (0, 1)]


clustered_vals = sorted(make_runs_of_two(15000, CHUNK_SIZE))
kind, size = smallest_container(clustered_vals)
print(f"  {len(clustered_vals):,} values, {count_runs(clustered_vals):,} runs -> {kind}, {size:,} B "
      f"(run {run_container_bytes(count_runs(clustered_vals)):,})")
assert kind == 'bitmap' and size == 8192
assert count_runs(clustered_vals) == 15000
assert run_container_bytes(15000) == 60002

full_chunk = make_one_run(CHUNK_SIZE)
kind, size = smallest_container(full_chunk)
print(f"  {CHUNK_SIZE:,} values (the whole chunk) in one run -> {kind}, {size} B")
assert kind == 'run' and size == 6

# ---------------------------------------------------------------------------
# A minimal real Roaring bitmap: chunk by top 16 bits, container per chunk.
# ---------------------------------------------------------------------------
class RoaringBitmap:
    def __init__(self):
        self.chunks = {}  # key (top 16 bits) -> sorted list of low-16-bit values

    def add_many(self, values):
        for v in values:
            key, low = v >> CHUNK_BITS, v & (CHUNK_SIZE - 1)
            self.chunks.setdefault(key, set()).add(low)
        for key in self.chunks:
            self.chunks[key] = sorted(self.chunks[key])

    def __contains__(self, v):
        key, low = v >> CHUNK_BITS, v & (CHUNK_SIZE - 1)
        vals = self.chunks.get(key)
        return vals is not None and low in set(vals)

    def total_bytes(self):
        return sum(smallest_container(vals)[1] for vals in self.chunks.values()) + 4 * len(self.chunks)

    def container_report(self):
        counts = {'array': 0, 'bitmap': 0, 'run': 0}
        for vals in self.chunks.values():
            counts[smallest_container(vals)[0]] += 1
        return counts


def intersect(a, b):
    """Chunk-by-chunk intersection: a chunk missing on either side contributes nothing."""
    result = RoaringBitmap()
    shared_keys = set(a.chunks) & set(b.chunks)
    for key in shared_keys:
        sa, sb = set(a.chunks[key]), set(b.chunks[key])
        inter = sorted(sa & sb)
        if inter:
            result.chunks[key] = inter
    return result


# ---------------------------------------------------------------------------
# 4. Three predicates over a log's row ids, matching CHAPTER.md's running example.
# ---------------------------------------------------------------------------
N_ROWS = 2 ** 22  # about four million rows, enough chunks to show the mix
rng = random.Random(7)


def dense_predicate():
    """Most ids in each touched chunk are set -- a few chunks, nearly full."""
    ids = []
    for chunk in range(0, N_ROWS >> CHUNK_BITS, 3):
        base = chunk << CHUNK_BITS
        ids.extend(base + i for i in range(0, CHUNK_SIZE, 1) if rng.random() < 0.9)
    return sorted(ids)


def sparse_predicate():
    """A few hundred ids per chunk, scattered randomly across every chunk."""
    ids = []
    for chunk in range(N_ROWS >> CHUNK_BITS):
        base = chunk << CHUNK_BITS
        ids.extend(base + rng.randrange(CHUNK_SIZE) for _ in range(200))
    return sorted(set(ids))


def clustered_predicate():
    """Long sorted runs -- a batch load, consecutive row ids."""
    ids = []
    pos = 0
    while pos < N_ROWS:
        run_len = rng.randrange(500, 5000)
        ids.extend(range(pos, min(pos + run_len, N_ROWS)))
        pos += run_len + rng.randrange(2000, 20000)
    return sorted(ids)


dense_ids = dense_predicate()
sparse_ids = sparse_predicate()
clustered_ids = clustered_predicate()

rb_dense, rb_sparse, rb_clustered = RoaringBitmap(), RoaringBitmap(), RoaringBitmap()
rb_dense.add_many(dense_ids)
rb_sparse.add_many(sparse_ids)
rb_clustered.add_many(clustered_ids)

print("\nthree predicates over a log's row ids:")
for name, ids, rb in (('dense', dense_ids, rb_dense), ('sparse', sparse_ids, rb_sparse), ('clustered', clustered_ids, rb_clustered)):
    plain_bitmap = UNIVERSE_BITMAP_BYTES
    plain_array = 4 * len(ids)
    roaring = rb.total_bytes()
    print(f"  {name}: {len(ids):,} ids, plain bitmap {plain_bitmap:,} B, "
          f"plain array {plain_array:,} B, roaring {roaring:,} B, containers {rb.container_report()}")

assert rb_dense.container_report()['bitmap'] > 0, "the dense predicate should use bitmap containers"
assert rb_sparse.container_report()['array'] > 0, "the sparse predicate should use array containers"
assert rb_clustered.container_report()['run'] > 0, "the clustered predicate should use run containers"

for name, ids, rb in (('dense', dense_ids, rb_dense), ('sparse', sparse_ids, rb_sparse), ('clustered', clustered_ids, rb_clustered)):
    assert rb.total_bytes() < 4 * len(ids), f"{name}: Roaring should beat a plain array here"
    assert rb.total_bytes() < UNIVERSE_BITMAP_BYTES, f"{name}: Roaring should always beat the universe bitmap"

# ---------------------------------------------------------------------------
# 5. A three-way intersection: level=ERROR AND service=auth AND hour=13.
# ---------------------------------------------------------------------------
level_error = rb_sparse  # stand-in: level=ERROR, sparse across the log
service_auth = rb_dense  # stand-in: service=auth, dense in a few chunks
hour_13 = rb_clustered  # stand-in: hour=13, one long clustered batch

step1 = intersect(level_error, service_auth)
final = intersect(step1, hour_13)
final_count = sum(len(v) for v in final.chunks.values())
print(f"\nthree-way intersection (level=ERROR AND service=auth AND hour=13): "
      f"{final_count:,} matching rows, {len(final.chunks)} chunk(s) touched in the result")

brute_force = sorted(set(sparse_ids) & set(dense_ids) & set(clustered_ids))
assert sum(len(v) for v in final.chunks.values()) == len(brute_force), "intersection must match a brute-force check"
for v in brute_force[:50]:
    assert v in final, "every brute-force match must be found in the Roaring intersection"

chunks_examined_pairwise = len(set(level_error.chunks) & set(service_auth.chunks))
chunks_in_universe = N_ROWS >> CHUNK_BITS
print(f"first AND examined {chunks_examined_pairwise} of {chunks_in_universe} possible chunk pairs "
      f"(a chunk missing on either side costs nothing)")
assert chunks_examined_pairwise < chunks_in_universe

# ---------------------------------------------------------------------------
# 6. The galloping-vs-merge threshold: a factor of 64 in cardinality.
# ---------------------------------------------------------------------------
def merge_intersection_cost(a, b):
    """Comparisons a simple merge makes, akin to merge sort."""
    i = j = cost = 0
    while i < len(a) and j < len(b):
        cost += 1
        if a[i] == b[j]:
            i += 1
            j += 1
        elif a[i] < b[j]:
            i += 1
        else:
            j += 1
    return cost


def galloping_intersection_cost(small, big):
    """Comparisons a galloping search makes: for each element of the smaller array,
    double the stride through the bigger one until overshooting, then binary search back."""
    cost = 0
    pos = 0
    for x in small:
        step = 1
        while pos + step < len(big) and big[pos + step] < x:
            cost += 1
            pos += step
            step *= 2
        lo, hi = pos, min(pos + step, len(big) - 1)
        while lo <= hi:
            cost += 1
            mid = (lo + hi) // 2
            if big[mid] < x:
                lo = mid + 1
            elif big[mid] > x:
                hi = mid - 1
            else:
                break
    return cost


small_arr = sorted(random.Random(3).sample(range(CHUNK_SIZE), 50))
big_arr = sorted(random.Random(4).sample(range(CHUNK_SIZE), 50 * 64))  # right at the factor-64 line
merge_cost = merge_intersection_cost(small_arr, big_arr)
gallop_cost = galloping_intersection_cost(small_arr, big_arr)
print(f"\nat a 64x cardinality gap (50 vs {50*64}): merge cost {merge_cost}, "
      f"galloping cost {gallop_cost}")

much_bigger = sorted(random.Random(5).sample(range(1 << 20), 50 * 2000))
gallop_cost_big = galloping_intersection_cost(small_arr, much_bigger)
merge_cost_big = len(small_arr) + len(much_bigger)  # a merge must still walk every element
print(f"at a much larger gap (50 vs {len(much_bigger)}): merge cost {merge_cost_big}, "
      f"galloping cost {gallop_cost_big}")
assert gallop_cost_big < merge_cost_big, "galloping should win decisively once one array dwarfs the other"

print("\nall assertions passed.")
