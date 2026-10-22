"""
Ring buffers and bounded queues: masking vs modulo, the full/empty ambiguity
under naive masked indices, the kfifo-style unmasked-index fix, and the
overwrite vs block policies -- all checked by running real code, not asserted.

Run: python3 examples.py (CI runs it too). Standard library, plus a C compiler
(cc) for the masking-vs-modulo timing lab, matching the pattern this project's
other topics use for real hardware-timing measurements.
"""
import random
import shutil
import subprocess
import tempfile
from pathlib import Path


class NaiveRing:
    """Masked head/tail indices only -- head == tail is ambiguous."""

    def __init__(self, capacity):
        assert capacity & (capacity - 1) == 0, "capacity must be a power of two"
        self.capacity = capacity
        self.mask = capacity - 1
        self.buf = [None] * capacity
        self.head = 0  # next read position
        self.tail = 0  # next write position
        self.count = 0  # only used to resolve the ambiguity for this reference class

    def push(self, x):
        if self.count == self.capacity:
            raise OverflowError("full")
        self.buf[self.tail & self.mask] = x
        self.tail += 1
        self.count += 1

    def pop(self):
        if self.count == 0:
            raise IndexError("empty")
        x = self.buf[self.head & self.mask]
        self.head += 1
        self.count -= 1
        return x


class KfifoRing:
    """kfifo-style: unmasked, monotonically increasing in/out; mask only on access."""

    def __init__(self, capacity):
        assert capacity & (capacity - 1) == 0, "capacity must be a power of two"
        self.capacity = capacity
        self.mask = capacity - 1
        self.buf = [None] * capacity
        self.IN = 0
        self.OUT = 0

    def length(self):
        return self.IN - self.OUT

    def is_empty(self):
        return self.IN == self.OUT

    def is_full(self):
        return self.length() > self.mask

    def push(self, x):
        if self.is_full():
            raise OverflowError("full")
        self.buf[self.IN & self.mask] = x
        self.IN += 1

    def pop(self):
        if self.is_empty():
            raise IndexError("empty")
        x = self.buf[self.OUT & self.mask]
        self.OUT += 1
        return x


class OverwriteRing:
    """Overwrite policy: a full push discards the oldest entry (deque(maxlen=...) semantics)."""

    def __init__(self, capacity):
        self.capacity = capacity
        self.buf = [None] * capacity
        self.IN = 0
        self.OUT = 0

    def length(self):
        return self.IN - self.OUT

    def push(self, x):
        if self.length() == self.capacity:
            self.OUT += 1  # drop the oldest entry
        self.buf[self.IN % self.capacity] = x
        self.IN += 1

    def pop(self):
        if self.length() == 0:
            raise IndexError("empty")
        x = self.buf[self.OUT % self.capacity]
        self.OUT += 1
        return x


class BlockRing:
    """Block policy: a full push is rejected (simulating a blocked sender), nothing is lost."""

    def __init__(self, capacity):
        self.capacity = capacity
        self.buf = [None] * capacity
        self.IN = 0
        self.OUT = 0

    def length(self):
        return self.IN - self.OUT

    def try_push(self, x):
        if self.length() == self.capacity:
            return False  # would block: caller must wait for a pop
        self.buf[self.IN % self.capacity] = x
        self.IN += 1
        return True

    def pop(self):
        if self.length() == 0:
            raise IndexError("empty")
        x = self.buf[self.OUT % self.capacity]
        self.OUT += 1
        return x


def check(label, cond, quiet=False):
    status = "OK" if cond else "FAIL"
    if not quiet or status == "FAIL":
        print(f"[{status}] {label}")
    assert cond, label


# 1. kfifo-style ring agrees with a plain Python list used as a reference queue,
#    across a long randomized sequence of pushes and pops that wraps many times.
random.seed(99)
capacity = 8
ring = KfifoRing(capacity)
reference = []
for _ in range(5000):
    if reference and (len(reference) == capacity or random.random() < 0.5):
        check("kfifo ring pop matches reference", ring.pop() == reference.pop(0), quiet=True)
    else:
        if len(reference) < capacity:
            x = random.randint(0, 999)
            ring.push(x)
            reference.append(x)
check("kfifo ring agrees with a plain-list reference across 5000 randomized pushes/pops, many wraps",
      ring.length() == len(reference))

# 2. The ambiguity: a naive masked ring has head == tail at BOTH empty and full.
naive = NaiveRing(8)
check("naive ring starts empty with head == tail", naive.head & naive.mask == naive.tail & naive.mask)
for i in range(8):
    naive.push(i)
check("naive ring full: head == tail again, with no count field this would be indistinguishable from empty",
      naive.head & naive.mask == naive.tail & naive.mask)
check("naive ring is actually full, not empty", naive.count == naive.capacity)

# 3. The kfifo fix resolves the same case correctly, using only in/out, no count field.
kf = KfifoRing(8)
check("kfifo ring starts empty", kf.is_empty())
for i in range(8):
    kf.push(i)
check("kfifo ring correctly reports full", kf.is_full())
check("kfifo ring correctly reports not empty", not kf.is_empty())
check("kfifo ring: in != out even though in & mask == out & mask",
      kf.IN != kf.OUT and (kf.IN & kf.mask) == (kf.OUT & kf.mask))

# 4. Masking vs modulo: a real C microbenchmark, not a Python-level timing (CPython's own
#    interpreter overhead per bytecode swamps a few clock cycles' difference -- this was tried
#    and the Python-level ratio came back indistinguishable from one, so it's not used here).
#    The capacity is passed in at runtime (argv), not a compile-time constant, so the compiler
#    can't strength-reduce "% capacity" into a mask itself when capacity happens to be a power
#    of two -- that optimization is exactly the manual version this topic is demonstrating.
C_SOURCE = r"""
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

static double now_seconds(void) {
    struct timespec ts;
    clock_gettime(CLOCK_MONOTONIC, &ts);
    return ts.tv_sec + ts.tv_nsec / 1e9;
}

int main(int argc, char **argv) {
    unsigned int capacity = (unsigned int)atoi(argv[1]);
    long n = atol(argv[2]);
    unsigned int mask = capacity - 1;

    unsigned int *values = malloc(sizeof(unsigned int) * (size_t)n);
    unsigned int seed = 12345u;
    for (long i = 0; i < n; i++) {
        seed = seed * 1103515245u + 12345u;
        values[i] = seed;
    }

    volatile unsigned long sum_mask = 0;
    double t0 = now_seconds();
    for (long i = 0; i < n; i++) {
        sum_mask += values[i] & mask;
    }
    double t_mask = now_seconds() - t0;

    volatile unsigned long sum_mod = 0;
    t0 = now_seconds();
    for (long i = 0; i < n; i++) {
        sum_mod += values[i] % capacity;
    }
    double t_mod = now_seconds() - t0;

    printf("%f %f %lu %lu\n", t_mask, t_mod, sum_mask, sum_mod);
    free(values);
    return 0;
}
"""


def run_masking_vs_modulo_benchmark():
    assert shutil.which('cc'), 'the masking-vs-modulo lab needs a C compiler (cc)'
    with tempfile.TemporaryDirectory() as d:
        src = Path(d) / 'ring_bench.c'
        exe = Path(d) / 'ring_bench'
        src.write_text(C_SOURCE)
        for flags in (['-O2', '-march=native'], ['-O2']):
            if subprocess.run(['cc', *flags, '-o', str(exe), str(src)], capture_output=True).returncode == 0:
                break
        else:
            raise AssertionError('cc could not compile the masking-vs-modulo lab')

        print()
        print("capacity   mask seconds   modulo seconds   modulo / mask")
        results = []
        for cap in (16, 256, 4096):
            out = subprocess.run([str(exe), str(cap), '20000000'], capture_output=True, text=True, check=True).stdout.split()
            t_mask, t_mod = float(out[0]), float(out[1])
            ratio = t_mod / t_mask if t_mask > 0 else float('inf')
            results.append((cap, t_mask, t_mod, ratio))
            print(f"{cap:<10}{t_mask:<18.4f}{t_mod:<17.4f}{ratio:.2f}")
        return results


# Reference run (the values on screen): 2026-10-22, this container's CPU, gcc 13.3.0 -O2
# (no -march=native available): modulo cost noticeably more than masking at every capacity tried.
bench_results = run_masking_vs_modulo_benchmark()
for cap, t_mask, t_mod, ratio in bench_results:
    check(f"modulo measurably costs more than masking at capacity {cap} (ratio {ratio:.2f})", ratio > 1.1)

# 5. Overwrite policy: the oldest entry is dropped, matching deque(maxlen=...).
ow2 = OverwriteRing(4)
for i in range(6):
    ow2.push(i)
remaining = [ow2.pop() for _ in range(4)]
check("overwrite ring of capacity 4, pushed 0..5, keeps only the newest four (2,3,4,5)",
      remaining == [2, 3, 4, 5])

# 6. Block policy: a full push is rejected, nothing is overwritten or lost.
bl = BlockRing(4)
for i in range(4):
    check(f"block ring accepts push {i} while not full", bl.try_push(i), quiet=True)
check("block ring rejects a fifth push while full", bl.try_push(99) is False)
remaining = [bl.pop() for _ in range(4)]
check("block ring's four original entries are all still there, unmodified",
      remaining == [0, 1, 2, 3])
check("after a pop, the block ring accepts a new push again", bl.try_push(42))

print()
print("ring-buffers-bounded-queues examples: all checks passed")
