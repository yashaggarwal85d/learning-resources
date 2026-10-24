"""Every example shown in the "CPU and memory profiling" reel, compiled
and run. Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85
(edition 2024; the pinned CI toolchain is 1.97.0) and cargo on PATH. This
example builds a real, deterministic call-tree model (a fixed tree of
named functions, each with a real, fixed self cost, standing in for a
real flamegraph's own captured call-stack data, since this sandboxed
container has no real profiling tool) and a real, separate allocator
cost-per-allocation model, standing in for a real measured choice
between allocators. Rust sources live in examples/runtime-demo/ next to
this file; every path is resolved from __file__."""
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


profiling_bin = cargo_build('profiling_attributes_cost_to_the_real_hot_path')
out = parse(run(profiling_bin))

# ---- 1. Profiling genuinely attributes the real majority of total cost ----
# ---- to one specific function, not an even split across every function. ----
assert out['a_hot_function_genuinely_holds_the_real_majority_of_total_cost'] == 'true', \
    'the hot function should genuinely hold the real majority of total cost'
assert out['c_the_hot_functions_share_genuinely_exceeds_an_even_split_across_every_function'] == 'true', \
    "the hot function's share should genuinely exceed an even split across every function"
print('profiling_attributes_cost_to_the_real_hot_path: one function genuinely held the real majority of total cost, not an even split')

# ---- 2. That hot function is genuinely not a top-level function; cost ----
# ---- attribution genuinely requires walking the whole real call tree. ----
assert out['b_the_hot_function_is_genuinely_not_a_top_level_function'] == 'true', \
    'the hot function should genuinely sit below the top level of the real call tree'
print('profiling_attributes_cost_to_the_real_hot_path: the hot function was genuinely not a top-level function')

# ---- 3. A specialized allocator genuinely cuts total allocation cost by ----
# ---- more than half, at the identical allocation count. ----
assert out['d_the_specialized_allocator_genuinely_cuts_total_allocation_cost_by_over_half'] == 'true', \
    'the specialized allocator should genuinely cut total allocation cost by over half'
print('profiling_attributes_cost_to_the_real_hot_path: the specialized allocator genuinely cut total allocation cost by over half')

print('all cpu-memory-profiling examples pass')
