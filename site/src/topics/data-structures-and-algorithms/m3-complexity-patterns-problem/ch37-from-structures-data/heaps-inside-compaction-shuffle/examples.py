"""Heaps inside compaction, shuffle and top-N: the k-way merge kernel and the bounded top-N heap.

Mirrors the structural facts read from Pebble (merging_iter.go), RocksDB (table/merging_iterator.cc,
db/dbformat.h, db/version_set.cc, db/compaction/compaction_iterator.h), Velox
(common/base/TreeOfLosers.h, exec/Merge.cpp), Spark (UnsafeSorterSpillMerger.java,
ExternalSorter.scala, BoundedPriorityQueue.scala, RDD.scala, limit.scala) and PostgreSQL
(utils/sort/tuplesort.c), quoted in SOURCES.md.

The heap-versus-loser-tree comparison count is NOT redone here: CHAPTER.md says to reuse Chapter
6's own lab ("dsa.tournament-loser-trees"/examples.py), which measured k=8 and k=6, not the
256-way comparison the chapter plan assumed before Chapter 6 was built. Those real numbers
(copied, not re-derived) are embedded below as constants, with their source noted.
"""
import heapq
import math
import random

# ---------------------------------------------------------------------------
# 1. A heap-based merging iterator over "sstables": the LSM comparator orders
#    by user key, then by DECREASING sequence number (RocksDB db/dbformat.h),
#    so the newest version of a key always surfaces first out of the heap.
# ---------------------------------------------------------------------------


def internal_key_order(entry):
    """(user_key, seq) sorts ascending by user_key, then DESCENDING by seq —
    the newest version of a key sorts first among ties on user_key."""
    user_key, seq, _value = entry
    return (user_key, -seq)


def merging_iterator(streams):
    """One heap of per-stream cursors (Pebble/RocksDB's mergingIter/MergingIterator): pop the
    least entry under internal_key_order, advance that stream, push its next entry, repeat."""
    heap = []
    iters = [iter(s) for s in streams]
    for i, it in enumerate(iters):
        nxt = next(it, None)
        if nxt is not None:
            heapq.heappush(heap, (internal_key_order(nxt), i, nxt))
    out = []
    while heap:
        _, i, entry = heapq.heappop(heap)
        out.append(entry)
        nxt = next(iters[i], None)
        if nxt is not None:
            heapq.heappush(heap, (internal_key_order(nxt), i, nxt))
    return out


def compaction_drop_shadowed(merged):
    """CompactionIterator.NextFromInput's effect (read in compaction_iterator.h, not quoted
    verbatim): once the newest version of a user key has been output, every older version
    behind it in the merge is shadowed and dropped, tombstones included."""
    out = []
    seen_keys = set()
    for user_key, seq, value in merged:
        if user_key in seen_keys:
            continue  # an older version of a key already output by its newest version
        seen_keys.add(user_key)
        if value is not None:  # None marks a tombstone: dropped, not emitted
            out.append((user_key, seq, value))
    return out


# Four "sstables" (already internally sorted by the same comparator), each holding versions of
# overlapping keys at different sequence numbers, one a tombstone (value=None).
SSTABLES = [
    [("a", 50, "a@50"), ("c", 48, "c@48"), ("e", 30, "e@30")],
    [("a", 40, "a@40"), ("b", 45, "b@45"), ("d", 25, None)],   # d deleted at seq 25
    [("b", 35, "b@35"), ("d", 20, "d@20"), ("f", 10, "f@10")],  # d's older, live version
    [("c", 15, "c@15"), ("e", 28, "e@28"), ("f", 5, "f@5")],
]
for s in SSTABLES:
    s.sort(key=internal_key_order)

MERGED = merging_iterator(SSTABLES)
# The merge itself must respect the comparator: ascending by user key, newest seq first per key.
assert MERGED == sorted(MERGED, key=internal_key_order)
COMPACTED = compaction_drop_shadowed(MERGED)
RESULT = {k: v for k, _seq, v in COMPACTED}
assert RESULT == {"a": "a@50", "b": "b@45", "c": "c@48", "e": "e@30", "f": "f@10"}
# d's newest version is its own tombstone (deleted at seq 25): nothing is emitted for it at all.
assert "d" not in RESULT
LIVE_KEYS = set(RESULT)
assert LIVE_KEYS == {"a", "b", "c", "e", "f"}
TOTAL_VERSIONS_IN = sum(len(s) for s in SSTABLES)
TOTAL_LIVE_OUT = len(LIVE_KEYS)
assert TOTAL_VERSIONS_IN == 12 and TOTAL_LIVE_OUT == 5  # 12 versions in, 5 live keys survive

# ---------------------------------------------------------------------------
# 2. Chapter 6's own lab counts (dsa.tournament-loser-trees/examples.py), copied, not re-derived.
#    CHAPTER.md's planning-time "256-way" assumption does not match what that topic actually
#    built (k=8 and k=6); these are the real measured numbers from running that file.
# ---------------------------------------------------------------------------
CH6_K = 8
CH6_HEAP_COMPARISONS_PER_OUTPUT = 4.35
CH6_LOSER_COMPARISONS_PER_OUTPUT = 3.00  # == log2(8) exactly, as that topic asserts
CH6_HEAP_OVER_LOSER_RATIO = round(CH6_HEAP_COMPARISONS_PER_OUTPUT / CH6_LOSER_COMPARISONS_PER_OUTPUT, 2)
assert CH6_LOSER_COMPARISONS_PER_OUTPUT == math.log2(CH6_K)
assert CH6_HEAP_OVER_LOSER_RATIO == 1.45

# ---------------------------------------------------------------------------
# 3. A bounded top-N heap (PostgreSQL's make_bounded_heap / Spark's BoundedPriorityQueue): keep
#    only the N best rows seen so far, the worst of the kept rows at the root so it is what gets
#    compared against and discarded.
# ---------------------------------------------------------------------------


def bounded_top_n(rows, n):
    """Keep the n largest values seen in a stream, O(1) discard / O(log n) replace per row.
    Python's heapq is a min-heap, so the root is already the worst (smallest) of the kept n —
    exactly PostgreSQL's "reverse the sort direction so the worst entry sits at the root"."""
    heap = []
    comparisons = 0
    replacements = 0
    for v in rows:
        if len(heap) < n:
            heapq.heappush(heap, v)
        else:
            comparisons += 1
            if v > heap[0]:
                heapq.heapreplace(heap, v)
                replacements += 1
            # else: discarded for the cost of one comparison with the root — O(1)
    return sorted(heap, reverse=True), comparisons, replacements


random.seed(2026)
TEST_ROWS = list(range(10_000))
random.shuffle(TEST_ROWS)
TOP10, _cmp, _rep = bounded_top_n(TEST_ROWS, 10)
assert TOP10 == list(range(9999, 9989, -1))  # the true top 10 of 0..9999

# A full sort does n*log2(n) comparisons (order of magnitude); the bounded heap does at most
# n*log2(N) — cheaper whenever N << n, which is exactly the ORDER BY ... LIMIT case.
N_ROWS, TOP_N = 10_000, 10
FULL_SORT_COST = N_ROWS * math.log2(N_ROWS)
BOUNDED_HEAP_COST = N_ROWS * math.log2(TOP_N)
assert BOUNDED_HEAP_COST < FULL_SORT_COST / 3

# ---------------------------------------------------------------------------
# 4. The surprising number: how many of n random-order rows actually replace something in a
#    bounded heap of size k? Derived, then verified, not stated from memory.
#
#    Order-statistics argument: process rows one at a time; after the first k (which always
#    fill the heap), row i (i > k, 1-indexed) is, by symmetry of a uniformly random arrival
#    order, equally likely to be any rank among the first i rows. It causes a replacement
#    exactly when it is among the top k of the first i rows: probability k/i. So the expected
#    number of replacements among rows k+1..n is k * sum_{i=k+1}^{n} 1/i = k * (H_n - H_k),
#    where H_m is the m-th harmonic number.
# ---------------------------------------------------------------------------


def harmonic_exact(m):
    return sum(1.0 / i for i in range(1, m + 1))


def expected_replacements(n, k):
    return k * (harmonic_exact(n) - harmonic_exact(k))


def harmonic_asymptotic(m):
    """H_m ~ ln(m) + gamma + 1/(2m) - 1/(12 m^2), error O(1/m^4) (standard asymptotic
    expansion of the harmonic number); for m in the hundreds of millions the error is
    far below floating-point precision, confirmed below against the exact sum at m=100000."""
    gamma = 0.5772156649015329
    return math.log(m) + gamma + 1 / (2 * m) - 1 / (12 * m * m)


# Confirm the asymptotic matches the exact sum closely at a size we can still sum exactly.
H_100000_EXACT = harmonic_exact(100_000)
H_100000_ASYMPTOTIC = harmonic_asymptotic(100_000)
assert abs(H_100000_EXACT - H_100000_ASYMPTOTIC) < 1e-9

# Monte Carlo verification at a scale small enough to simulate directly: does the formula's
# prediction match an actual average over many random permutations?
random.seed(37119)
SIM_N, SIM_K, TRIALS = 2000, 10, 400
total_replacements = 0
for _ in range(TRIALS):
    order = list(range(SIM_N))
    random.shuffle(order)
    _top, _cmp, rep = bounded_top_n(order, SIM_K)
    total_replacements += rep
MEASURED_MEAN_REPLACEMENTS = total_replacements / TRIALS
PREDICTED_REPLACEMENTS = expected_replacements(SIM_N, SIM_K)
# Within simulation noise of a few percent over 400 trials.
assert abs(MEASURED_MEAN_REPLACEMENTS - PREDICTED_REPLACEMENTS) / PREDICTED_REPLACEMENTS < 0.08

# Now the real number from the hook: top 10 of 400 million rows, arriving in random order.
HOOK_N, HOOK_K = 400_000_000, 10
HOOK_REPLACEMENTS = HOOK_K * (harmonic_asymptotic(HOOK_N) - harmonic_exact(HOOK_K))
HOOK_REPLACEMENTS_ROUNDED = round(HOOK_REPLACEMENTS)
assert 170 <= HOOK_REPLACEMENTS_ROUNDED <= 180

if __name__ == "__main__":
    print("merged, compacted keys:", RESULT)
    print("Chapter 6's measured ratio (k=8): heap", CH6_HEAP_COMPARISONS_PER_OUTPUT,
          "vs loser tree", CH6_LOSER_COMPARISONS_PER_OUTPUT,
          "=", CH6_HEAP_OVER_LOSER_RATIO, "x")
    print("bounded top-10 of 10,000 shuffled rows:", TOP10)
    print("full sort cost (order):", round(FULL_SORT_COST), "bounded heap cost (order):", round(BOUNDED_HEAP_COST))
    print("Monte Carlo mean replacements (n=2000,k=10):", round(MEASURED_MEAN_REPLACEMENTS, 2),
          "predicted:", round(PREDICTED_REPLACEMENTS, 2))
    print("top 10 of 400,000,000 rows: predicted replacements ~", HOOK_REPLACEMENTS_ROUNDED)
    print("ALL ASSERTS PASSED")
