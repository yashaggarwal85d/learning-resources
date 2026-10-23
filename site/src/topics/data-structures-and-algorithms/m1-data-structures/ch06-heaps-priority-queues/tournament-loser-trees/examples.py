"""Tournament and loser trees: a k-way merge measured three ways — a naive scan of every
run's head, a binary-heap-based merge, and a loser-tree merge — counting real comparisons
per output, not assuming the log2(k) and 2*log2(k) bounds from the source's own wording."""
import random
import math

INF = float("inf")


def make_runs(k, length, seed):
    rnd = random.Random(seed)
    all_values = sorted(rnd.sample(range(1_000_000), k * length))
    runs = [sorted(all_values[i::k]) for i in range(k)]
    return runs


# ---------------------------------------------------------------------------
# 1. Naive scan: every output costs one comparison per still-active run minus one.
# ---------------------------------------------------------------------------

def merge_naive(runs):
    runs = [list(r) for r in runs]
    heads = [r.pop(0) if r else None for r in runs]
    out = []
    comparisons = 0
    while any(h is not None for h in heads):
        best = None
        for h in heads:
            if h is None:
                continue
            if best is None:
                best = h
            else:
                comparisons += 1
                if h < best:
                    best = h
        idx = heads.index(best)
        out.append(best)
        heads[idx] = runs[idx].pop(0) if runs[idx] else None
    return out, comparisons


# ---------------------------------------------------------------------------
# 2. Heap-based merge: a real binary min-heap of (value, run) pairs, sift-down
#    instrumented to count every comparison (both the "which child is smaller"
#    check and the "does the moving value still need to sink" check).
# ---------------------------------------------------------------------------

def merge_heap(runs):
    runs = [list(r) for r in runs]
    heap = []
    comparisons = [0]

    def sift_down(i):
        n = len(heap)
        while True:
            left, right = 2 * i + 1, 2 * i + 2
            if left >= n:
                break
            smallest = left
            if right < n:
                comparisons[0] += 1
                if heap[right][0] < heap[left][0]:
                    smallest = right
            comparisons[0] += 1
            if heap[smallest][0] >= heap[i][0]:
                break
            heap[i], heap[smallest] = heap[smallest], heap[i]
            i = smallest

    def sift_up(i):
        while i > 0:
            parent = (i - 1) // 2
            comparisons[0] += 1
            if heap[parent][0] <= heap[i][0]:
                break
            heap[parent], heap[i] = heap[i], heap[parent]
            i = parent

    for run_idx, run in enumerate(runs):
        if run:
            heap.append((run.pop(0), run_idx))
    for i in range(len(heap) // 2 - 1, -1, -1):
        sift_down(i)

    out = []
    while heap:
        value, run_idx = heap[0]
        out.append(value)
        if runs[run_idx]:
            heap[0] = (runs[run_idx].pop(0), run_idx)
            sift_down(0)
        else:
            heap[0] = heap[-1]
            heap.pop()
            if heap:
                sift_down(0)
    return out, comparisons[0]


# ---------------------------------------------------------------------------
# 3. Loser tree: a complete binary tree over m = next_pow2(k) leaves (sentinel
#    runs pad k up to m), internal nodes store each game's loser, and refilling
#    a leaf replays exactly one comparison per layer on the way to the root.
# ---------------------------------------------------------------------------

def next_pow2(k):
    m = 1
    while m < k:
        m *= 2
    return m


def merge_loser_tree(runs):
    k = len(runs)
    m = next_pow2(k)
    runs = [list(r) for r in runs] + [[] for _ in range(m - k)]
    values = [r.pop(0) if r else INF for r in runs]
    loser = [None] * m  # internal nodes 1..m-1 used; 0 unused
    comparisons = [0]

    def play(node):
        if node >= m:
            return node - m
        left = play(2 * node)
        right = play(2 * node + 1)
        comparisons[0] += 1
        if values[left] <= values[right]:
            loser[node] = right
            return left
        else:
            loser[node] = left
            return right

    winner = play(1)

    def replay(run_idx):
        node = (run_idx + m) // 2
        current = run_idx
        while node >= 1:
            comparisons[0] += 1
            if values[current] > values[loser[node]]:
                loser[node], current = current, loser[node]
            node //= 2
        return current

    out = []
    comparisons[0] = 0  # build cost (Θ(k)) is separate from per-output replay cost
    while values[winner] != INF:
        out.append(values[winner])
        values[winner] = runs[winner].pop(0) if runs[winner] else INF
        winner = replay(winner)
    return out, comparisons[0]


# ---------------------------------------------------------------------------
# Measure on a power-of-two k and a non-power-of-two k, and check correctness.
# ---------------------------------------------------------------------------

for k, length, seed in [(8, 60, 20261023), (6, 60, 20261024)]:
    runs = make_runs(k, length, seed)
    truth = sorted(v for run in runs for v in run)
    n = len(truth)

    naive_out, naive_cmp = merge_naive(runs)
    heap_out, heap_cmp = merge_heap(runs)
    loser_out, loser_cmp = merge_loser_tree(runs)

    assert naive_out == truth, "naive merge must reproduce the fully sorted order"
    assert heap_out == truth, "heap merge must reproduce the fully sorted order"
    assert loser_out == truth, "loser-tree merge must reproduce the fully sorted order"

    m = next_pow2(k)
    expected_loser_per_output = int(math.log2(m))
    assert loser_cmp == expected_loser_per_output * n, (
        f"loser tree must cost exactly log2({m})={expected_loser_per_output} comparisons per output, "
        f"every output, got {loser_cmp} total over {n} outputs"
    )

    print(f"k={k} runs ({'power of two' if m == k else f'padded to {m}'}), n={n} total elements:")
    print(f"  naive scan:  {naive_cmp} comparisons, {naive_cmp / n:.2f} per output")
    print(f"  heap merge:  {heap_cmp} comparisons, {heap_cmp / n:.2f} per output")
    print(f"  loser tree:  {loser_cmp} comparisons, {loser_cmp / n:.2f} per output (= log2({m}) exactly)")
    print(f"  heap / loser ratio: {heap_cmp / loser_cmp:.2f}x")
    print()

    assert loser_cmp < heap_cmp < naive_cmp, "loser tree < heap < naive scan, in total comparisons, must hold"

print("All checks passed.")
