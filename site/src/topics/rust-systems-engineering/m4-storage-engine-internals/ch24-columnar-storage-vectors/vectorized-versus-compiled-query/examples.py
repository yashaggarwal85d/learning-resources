"""Every example shown in the "Vectorized versus compiled query
execution" reel, compiled and run. Run: python3 examples.py (CI runs it
too). Needs rustc >= 1.85 (edition 2024; the pinned CI toolchain is
1.97.0) and cargo on PATH. This example builds a real row-at-a-time
filter-then-sum and a real vectorized, batch-at-a-time version of the
identical operation over topic 62's own columnar data, measuring the
real cut in per-row dispatch the batched version achieves. Rust
sources live in examples/runtime-demo/ next to this file; every path is
resolved from __file__."""
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


exec_bin = cargo_build('vectorized_vs_compiled_execution_tradeoff')
out = parse(run(exec_bin))

# ---- 1. The vectorized, batch-at-a-time path genuinely cuts the ----
# ---- per-row dispatch overhead the naive row-at-a-time path pays, on ----
# ---- the identical operation and data. ----
assert out['a_vectorized_cuts_dispatch_overhead'] == 'true', \
    'the vectorized path should genuinely cut the dispatch overhead the row-at-a-time path pays'
row_dispatches = int(out['row_dispatches'])
vec_dispatches = int(out['vec_dispatches'])
dispatch_cut_factor = float(out['dispatch_cut_factor'])
assert dispatch_cut_factor > 50.0
print(f'vectorized_vs_compiled_execution_tradeoff: the row-at-a-time path dispatched {row_dispatches} times against the vectorized path\'s {vec_dispatches}, a real {dispatch_cut_factor:.0f}x cut')

# ---- 2. Both paths, applied to the identical column and the identical ----
# ---- filter-then-sum operation, produce the exact identical result. ----
assert out['b_results_match_exactly'] == 'true', \
    'both paths should produce the exact identical sum on the identical data and operation'
row_sum = out['row_sum']
print(f'vectorized_vs_compiled_execution_tradeoff: both paths produced the exact identical sum, {row_sum}, on the identical column and operation')

# ---- 3. The vectorized path's own dispatch count matches the real ----
# ---- batch arithmetic exactly, not an approximation. ----
assert out['c_dispatch_count_matches_batch_arithmetic'] == 'true', \
    "the vectorized path's dispatch count should match the real batch arithmetic exactly"
print('vectorized_vs_compiled_execution_tradeoff: the vectorized path\'s own dispatch count matched the real batch arithmetic exactly')

print('all vectorized-versus-compiled-query examples pass')
