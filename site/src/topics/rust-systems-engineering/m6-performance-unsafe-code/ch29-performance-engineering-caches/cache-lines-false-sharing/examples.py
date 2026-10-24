"""Every example shown in the "Cache lines and false sharing" reel,
compiled and run. Run: python3 examples.py (CI runs it too). Needs rustc
>= 1.85 (edition 2024; the pinned CI toolchain is 1.97.0) and cargo on
PATH. This example builds a real, deterministic cache-line-contention
model (two counters sharing one real cache line versus two separately
padded cache lines, and a real function counting cross-core
invalidations under each layout) standing in for a real hardware
cache-miss counter, since this sandboxed container has no real hardware
performance counters. Rust sources live in examples/runtime-demo/ next
to this file; every path is resolved from __file__."""
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


sharing_bin = cargo_build('false_sharing_costs_a_shared_cache_line')
out = parse(run(sharing_bin))

# ---- 1. The shared layout genuinely pays a cross-core invalidation cost ----
# ---- on every alternating write between the two cores. ----
assert out['a_the_shared_layout_genuinely_pays_an_invalidation_cost_on_every_alternating_write'] == 'true', \
    'the shared layout should genuinely pay an invalidation cost on every alternating write'
print('false_sharing_costs_a_shared_cache_line: the shared layout genuinely paid an invalidation cost on every alternating write')

# ---- 2. The padded layout genuinely avoids every cross-core invalidation. ----
assert out['b_the_padded_layout_genuinely_avoids_every_cross_core_invalidation'] == 'true', \
    'the padded layout should genuinely avoid every cross-core invalidation'
print('false_sharing_costs_a_shared_cache_line: the padded layout genuinely avoided every cross-core invalidation')

# ---- 3. The shared layout's own cost genuinely grows with more ----
# ---- operations, while the padded layout's own cost stays at zero. ----
assert out['c_the_shared_layouts_cost_genuinely_grows_with_more_operations_while_the_padded_layouts_stays_at_zero'] == 'true', \
    "the shared layout's cost should genuinely grow with more operations while the padded layout's stays at zero"
print("false_sharing_costs_a_shared_cache_line: the shared layout's own cost genuinely grew with more operations, while the padded layout's own cost stayed at zero")

print('all cache-lines-false-sharing examples pass')
