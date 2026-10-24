"""Every example shown in the "Partitioned logs and per-key ordering"
reel, compiled and run. Run: python3 examples.py (CI runs it too).
Needs rustc >= 1.85 (edition 2024; the pinned CI toolchain is 1.97.0)
and cargo on PATH. This example builds a real toy multi-partition log
with a real hash(key) % N partitioning function, and measures that
per-key order is genuinely preserved only while the partition count
stays fixed, and genuinely breaks for a rerouted key once it changes.
Rust sources live in examples/runtime-demo/ next to this file; every
path is resolved from __file__."""
import os
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
RUSTC = shutil.which('rustc')
CARGO = shutil.which('cargo')
assert RUSTC, 'rustc is required (CI installs 1.97.0 with rustup)'
assert CARGO, 'cargo is required'
ver = subprocess.run([RUSTC, '--version'], capture_output=True, text=True).stdout.strip()
print(f'using {ver}')

CRATE = os.path.join(HERE, 'examples', 'runtime-demo')


def cargo_build(name, timeout=120):
    r = subprocess.run([CARGO, 'build', '--release', '--quiet', '--bin', name], cwd=CRATE,
                        capture_output=True, text=True, timeout=timeout)
    assert r.returncode == 0, f'{name} should build:\n{r.stdout}\n{r.stderr}'
    return os.path.join(CRATE, 'target', 'release', name)


def run(binary, timeout=30):
    r = subprocess.run([binary], capture_output=True, text=True, timeout=timeout)
    assert r.returncode == 0, f'{binary} should run:\n{r.stdout}\n{r.stderr}'
    return r.stdout.strip()


def parse(out):
    kv = {}
    for line in out.splitlines():
        k, v = line.rsplit(' ', 1)
        kv[k] = v
    return kv


partitioning_bin = cargo_build('key_partitioning_order_tradeoff')
out = parse(run(partitioning_bin))

# ---- 1. Per-key order is genuinely preserved while the partition count ----
# ---- stays fixed: every write to a given key lands in the identical ----
# ---- partition, in the identical relative order it was written. ----
assert out['a_per_key_order_is_genuinely_preserved_while_partition_count_is_fixed'] == 'true', \
    'per-key order should genuinely be preserved while the partition count stays fixed'
print('key_partitioning_order_tradeoff: per-key order was genuinely preserved while the partition count stayed fixed')

# ---- 2. Changing the partition count genuinely reroutes at least one ----
# ---- existing key to a different partition. ----
assert out['b_changing_partition_count_genuinely_reroutes_at_least_one_existing_key'] == 'true', \
    'changing the partition count should genuinely reroute at least one existing key'
print('key_partitioning_order_tradeoff: changing the partition count genuinely rerouted at least one existing key')

# ---- 3. A rerouted key genuinely loses its single-partition order ----
# ---- guarantee: its history splits across the old and the new partition. ----
assert out['c_a_rerouted_key_genuinely_loses_its_single_partition_order_guarantee'] == 'true', \
    "a rerouted key's own history should genuinely split across the old and the new partition"
print("key_partitioning_order_tradeoff: a rerouted key's own history genuinely split across the old and the new partition")

print('all partitioned-logs-per-key examples pass')
