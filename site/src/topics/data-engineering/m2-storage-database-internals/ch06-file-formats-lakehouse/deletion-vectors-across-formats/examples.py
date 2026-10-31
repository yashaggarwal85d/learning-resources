"""
de.deletion-vectors-across-formats — real deletion vectors, built as RoaringBitmap-style
containers, on a real local data file. Pure Python standard library, no external dependencies.

Disclosed simplification: the "data file" here is plain CSV text, not Parquet, and the
container implementation below is a simplified re-implementation of the real Roaring bitmap
format (array container for a small cardinality, fixed-size bitset container for a large one,
with the exact 4096 array/bitset threshold and the 65536-bit single-container size taken
directly from the RoaringBitmap format specification and the Iceberg/Puffin spec's own
deletion-vector-v1 blob definition) — not the real RoaringBitmap library's run-length encoding,
multi-container key layout, or serialization format byte-for-byte. What transfers is the real
mechanism every one of these formats shares: a bitmap indexed by row position, with a real
array-vs-bitset size tradeoff, and a real measured read-time cost for applying it that
compaction (purging) pays back.
"""
import os
import random
import statistics
import time

ROOT = "/tmp/dv_demo"
TOTAL_ROWS = 50_000
N_DELETED_SMALL = 1_200  # stays under the array/bitset threshold
N_DELETED_LARGE = 5_000  # crosses the array/bitset threshold
ARRAY_BITSET_THRESHOLD = 4096  # RoaringFormatSpec: cardinality <= 4096 -> array container
CONTAINER_BITS = 65536  # one 16-bit Roaring container covers positions 0..65535
READ_REPEATS = 9


def write_base_file(path, n):
    with open(path, "w") as f:
        for i in range(n):
            f.write(f"{i},value-{i}\n")


def pick_deleted_positions(n_total, n_deleted, seed):
    random.seed(seed)
    return sorted(random.sample(range(n_total), n_deleted))


class DeletionVectorContainer:
    """A single 16-bit Roaring container (TOTAL_ROWS < 65536, so one key covers everything):
    an array of positions when the cardinality is small, a fixed-size bitset once it crosses
    the real format's own 4096-element threshold — the same tradeoff Delta, Iceberg v3 and the
    RoaringBitmap format itself make."""

    def __init__(self, positions):
        self.cardinality = len(positions)
        if self.cardinality <= ARRAY_BITSET_THRESHOLD:
            self.kind = "array"
            self.positions = frozenset(positions)
            self._serialized_size = self.cardinality * 2  # each position stored as 16 bits
        else:
            self.kind = "bitset"
            nbytes = CONTAINER_BITS // 8
            bitset = bytearray(nbytes)
            for p in positions:
                bitset[p >> 3] |= 1 << (p & 7)
            self.bitset = bytes(bitset)
            self._serialized_size = nbytes

    def contains(self, p):
        if self.kind == "array":
            return p in self.positions
        return bool(self.bitset[p >> 3] & (1 << (p & 7)))

    def serialized_size(self):
        return self._serialized_size


def build_deletion_vector(positions):
    return DeletionVectorContainer(positions)


def scan_plain(path):
    count = 0
    with open(path) as f:
        for _ in f:
            count += 1
    return count


def scan_with_deletion_vector(path, dv):
    count = 0
    with open(path) as f:
        for i, _line in enumerate(f):
            if not dv.contains(i):
                count += 1
    return count


def compact_purge(path, out_path, dv):
    kept = 0
    with open(path) as f, open(out_path, "w") as out:
        for i, line in enumerate(f):
            if not dv.contains(i):
                out.write(line)
                kept += 1
    return kept


def median_timed(fn, *args, repeats=READ_REPEATS, **kwargs):
    times = []
    result = None
    for _ in range(repeats):
        t0 = time.perf_counter()
        result = fn(*args, **kwargs)
        times.append(time.perf_counter() - t0)
    return result, statistics.median(times)


def demo_array_vs_bitset_containers():
    print("Demo 1: a real deletion vector, built as a RoaringBitmap-style container\n")
    os.makedirs(ROOT, exist_ok=True)
    base_path = os.path.join(ROOT, "base.csv")
    write_base_file(base_path, TOTAL_ROWS)

    small_positions = pick_deleted_positions(TOTAL_ROWS, N_DELETED_SMALL, seed=1)
    dv_small = build_deletion_vector(small_positions)
    print(
        f"  {N_DELETED_SMALL} rows deleted (at or under the {ARRAY_BITSET_THRESHOLD}-element threshold): "
        f"container kind = {dv_small.kind}, serialized size = {dv_small.serialized_size()} bytes"
    )

    large_positions = pick_deleted_positions(TOTAL_ROWS, N_DELETED_LARGE, seed=2)
    dv_large = build_deletion_vector(large_positions)
    print(
        f"  {N_DELETED_LARGE} rows deleted (over the {ARRAY_BITSET_THRESHOLD}-element threshold): "
        f"container kind = {dv_large.kind}, serialized size = {dv_large.serialized_size()} bytes"
    )

    assert dv_small.kind == "array"
    assert dv_large.kind == "bitset"
    assert dv_small.serialized_size() == 2400  # 1,200 positions * 2 bytes each
    assert dv_large.serialized_size() == 8192  # fixed bitset size (65,536 bits / 8), regardless of cardinality

    return base_path, dv_small


def demo_read_cost_with_and_without_dv(base_path, dv):
    print("\nDemo 2: real measured read cost, with and without the deletion vector applied\n")

    baseline_count, baseline_time = median_timed(scan_plain, base_path)
    print(f"  plain scan, no deletes applied: {baseline_count} rows, median {baseline_time * 1000:.3f} ms")

    dv_count, dv_time = median_timed(scan_with_deletion_vector, base_path, dv)
    print(f"  scan applying the deletion vector: {dv_count} live rows, median {dv_time * 1000:.3f} ms")

    compacted_path = os.path.join(ROOT, "compacted.csv")
    kept = compact_purge(base_path, compacted_path, dv)
    compacted_count, compacted_time = median_timed(scan_plain, compacted_path)
    print(
        f"  compaction purges {TOTAL_ROWS - kept} rows physically; scan of the compacted file: "
        f"{compacted_count} rows, median {compacted_time * 1000:.3f} ms"
    )

    assert dv_count == compacted_count == kept
    assert dv_time > baseline_time, "applying a deletion vector must cost more than reading with none"
    assert compacted_time < dv_time, "a compacted file with no deletion vector must read faster"

    return baseline_time, dv_time, compacted_time


if __name__ == "__main__":
    base_path, dv_small = demo_array_vs_bitset_containers()
    baseline_time, dv_time, compacted_time = demo_read_cost_with_and_without_dv(base_path, dv_small)

    print("\n--- Summary ---")
    print(
        f"deletion vector adds real per-row filtering cost at read time: "
        f"{dv_time * 1000:.3f} ms vs {baseline_time * 1000:.3f} ms with no deletes"
    )
    print(
        f"compaction (purging the deleted rows) pays that cost back: "
        f"{compacted_time * 1000:.3f} ms, lower than the deletion-vector-applied read"
    )
    print("\nAll assertions passed.")
