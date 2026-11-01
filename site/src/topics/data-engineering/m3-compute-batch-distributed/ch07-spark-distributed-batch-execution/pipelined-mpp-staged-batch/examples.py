"""
de.pipelined-mpp-staged-batch -- measured against real local Python/NumPy, standing in for the
chapter's own lab (a pandas-UDF batch transform on Spark vs a plain Python generator standing in
for Ray Data's operator-level streaming, measuring throughput and memory only -- CPU-only, scaled
down, with the GPU-utilisation claim sourced from Ray's own documentation, not measured here).

Two claims, verified directly:

1. A batched, vectorized computation over the same per-row "embedding" workload runs real,
   meaningfully faster per element than the identical computation done one row at a time -- the
   throughput side of what a row-at-a-time, never-materialize-the-whole-batch streaming model
   gives up in exchange for its low memory footprint.
2. A streaming pipeline that consumes and discards each row's result immediately keeps peak
   memory essentially flat as the row count grows a hundredfold; a pipeline that materializes
   the full intermediate result into a list before consuming it has peak memory that grows
   proportionally with the row count -- the memory side of the same trade-off.
"""
import time
import tracemalloc

import numpy as np

N_THROUGHPUT = 200_000
DIM = 64


def embed_scalar(x):
    v = np.array([(x + i) % 97 for i in range(DIM)], dtype=np.float64)
    return float(np.sum(np.sin(v)))


def row_at_a_time(n):
    for x in range(n):
        yield embed_scalar(x)


def vectorized_batches(n, batch_size=4096):
    for start in range(0, n, batch_size):
        end = min(start + batch_size, n)
        xs = np.arange(start, end)[:, None]
        offs = np.arange(DIM)[None, :]
        v = (xs + offs) % 97
        out = np.sum(np.sin(v), axis=1)
        yield from (float(val) for val in out)


# --- Claim 1: vectorized batch throughput vs row-at-a-time throughput ---

t0 = time.time()
list(row_at_a_time(N_THROUGHPUT))
row_at_a_time_seconds = time.time() - t0

t0 = time.time()
list(vectorized_batches(N_THROUGHPUT))
vectorized_seconds = time.time() - t0

assert vectorized_seconds * 3 < row_at_a_time_seconds, (
    f"expected the vectorized, batched computation to be meaningfully faster than the identical "
    f"row-at-a-time computation; got row_at_a_time={row_at_a_time_seconds:.3f}s, "
    f"vectorized={vectorized_seconds:.3f}s"
)

# --- Claim 2: streaming memory stays flat, materializing memory grows with row count ---


def embed_simple(x):
    return x * 2.0


def streaming_consume(n):
    total = 0.0
    for x in range(n):
        total += embed_simple(x)  # each result consumed immediately, nothing buffered
    return total


def materializing_consume(n):
    materialized = [embed_simple(x) for x in range(n)]  # the whole intermediate held at once
    return sum(materialized)


def peak_memory_bytes(fn, n):
    tracemalloc.start()
    fn(n)
    _, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    return peak


SMALL_N = 50_000
LARGE_N = 5_000_000  # 100x SMALL_N

streaming_small = peak_memory_bytes(streaming_consume, SMALL_N)
streaming_large = peak_memory_bytes(streaming_consume, LARGE_N)
materializing_small = peak_memory_bytes(materializing_consume, SMALL_N)
materializing_large = peak_memory_bytes(materializing_consume, LARGE_N)

assert streaming_large < streaming_small * 5, (
    f"expected the streaming pipeline's peak memory to stay roughly flat across a 100x row-count "
    f"increase; got {streaming_small} bytes at n={SMALL_N}, {streaming_large} bytes at n={LARGE_N}"
)
assert materializing_large > materializing_small * 50, (
    f"expected the materializing pipeline's peak memory to grow roughly proportionally with row "
    f"count; got {materializing_small} bytes at n={SMALL_N}, {materializing_large} bytes at n={LARGE_N}"
)
assert materializing_large > streaming_large * 50, (
    f"expected the materializing pipeline's peak memory at the large row count to be far larger "
    f"than the streaming pipeline's; got materializing={materializing_large}, streaming={streaming_large}"
)

print("all claims verified")
