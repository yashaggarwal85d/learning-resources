"""Every example shown in the "Benchmarking discipline and statistics"
reel, compiled and run. Run: python3 examples.py (CI runs it too).
Needs rustc >= 1.85 (edition 2024; the pinned CI toolchain is 1.97.0)
and cargo on PATH. This example builds a real, deterministic
latency-distribution model (a fixed array of samples standing in for
a real benchmark's own captured samples, since this sandboxed
container has no flaky wall-clock timing to depend on) and measures
that a median improvement and a p99 regression are genuinely two
separate facts a single average would hide. Rust sources live in
examples/runtime-demo/ next to this file; every path is resolved
from __file__."""
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


stats_bin = cargo_build('tail_latency_diverges_from_the_average')
out = parse(run(stats_bin))

# ---- 1. p50 and p99 are genuinely separate statistics of the identical ----
# ---- distribution, not the same number read twice. ----
assert out['a_p50_and_p99_are_genuinely_separate_statistics_of_the_identical_distribution'] == 'true', \
    'p50 and p99 should genuinely be separate statistics of the identical distribution'
print('tail_latency_diverges_from_the_average: p50 and p99 were genuinely separate statistics of the identical distribution')

# ---- 2. The after distribution genuinely improves the median while ----
# ---- genuinely regressing the tail, on the identical change. ----
assert out['b_the_after_distribution_genuinely_improves_the_median_while_genuinely_regressing_the_tail'] == 'true', \
    'the after distribution should genuinely improve the median while genuinely regressing the tail'
print('tail_latency_diverges_from_the_average: the after distribution genuinely improved the median while genuinely regressing the tail')

# ---- 3. The real average alone genuinely hides this divergence, since ----
# ---- it moves with the median's own improvement rather than the tail's ----
# ---- own regression. ----
assert out['c_the_real_average_alone_genuinely_hides_the_real_tail_regression'] == 'true', \
    'the real average alone should genuinely hide the real tail regression'
print('tail_latency_diverges_from_the_average: the real average alone genuinely hid the real tail regression')

print('all benchmarking-discipline-statistics examples pass')
