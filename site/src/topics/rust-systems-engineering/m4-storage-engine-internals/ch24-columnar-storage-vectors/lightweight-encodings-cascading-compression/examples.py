"""Every example shown in the "Lightweight encodings and cascading
compression" reel, compiled and run. Run: python3 examples.py (CI runs
it too). Needs rustc >= 1.85 (edition 2024; the pinned CI toolchain is
1.97.0) and cargo on PATH. This example builds a real run-length
encoder and decoder, measuring its real compression ratio and decode
cost on a skewed, repetitive column against a uniformly random one,
over topic 62's own column-major layout. Rust sources live in
examples/runtime-demo/ next to this file; every path is resolved from
__file__."""
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


rle_bin = cargo_build('lightweight_encoding_decode_cost_tradeoff')
out = parse(run(rle_bin))

# ---- 1. RLE wins big, by compression ratio, on a skewed, repetitive ----
# ---- column. ----
assert out['a_rle_wins_big_on_skewed_data'] == 'true', \
    'RLE should win big on a skewed, repetitive column'
skewed_ratio = float(out['skewed_ratio'])
assert skewed_ratio > 2.0
print(f'lightweight_encoding_decode_cost_tradeoff: RLE achieved a real {skewed_ratio:.1f}x compression ratio on the skewed, repetitive column')

# ---- 2. The identical encoding genuinely loses, by the identical ----
# ---- ratio, on a uniformly random column of the identical length. ----
assert out['b_rle_loses_on_uniformly_random_data'] == 'true', \
    'the identical RLE encoding should genuinely lose on a uniformly random column'
random_ratio = float(out['random_ratio'])
assert random_ratio < 1.0
print(f'lightweight_encoding_decode_cost_tradeoff: the identical encoding genuinely lost, at a real {random_ratio:.2f}x ratio, on a uniformly random column of the identical length')

# ---- 3. Decode work per value (run-headers processed per output ----
# ---- value) is genuinely data-distribution-dependent, and both ----
# ---- encodings decode back to the exact original values. ----
assert out['c_decode_work_per_value_is_data_distribution_dependent'] == 'true', \
    'decode work per value should genuinely depend on the data distribution'
assert out['d_both_encodings_round_trip_exactly'] == 'true', \
    'both encodings should decode back to their exact original values'
skewed_runs = int(out['skewed_runs'])
random_runs = int(out['random_runs'])
print(f'lightweight_encoding_decode_cost_tradeoff: decoding touched {skewed_runs} run(s) on the skewed column against {random_runs} on the random column, and both decoded back exactly')

print('all lightweight-encodings-cascading-compression examples pass')
