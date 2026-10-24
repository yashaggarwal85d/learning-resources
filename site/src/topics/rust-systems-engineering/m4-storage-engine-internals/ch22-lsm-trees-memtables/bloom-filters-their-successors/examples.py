"""Every example shown in the "Bloom filters and their successors"
reel, compiled and run. Run: python3 examples.py (CI runs it too). Needs
rustc >= 1.85 (edition 2024; the pinned CI toolchain is 1.97.0) and
cargo on PATH. This example builds a real, minimal Bloom filter: a bit
array and a chosen number of independent hash functions. Rust sources
live in examples/runtime-demo/ next to this file; every path is
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


bloom_bin = cargo_build('bloom_filter_false_positive_tradeoff')
out = parse(run(bloom_bin))

# ---- 1. Every key actually inserted is always reported as possibly ----
# ---- present — zero false negatives, ever, at any budget. ----
assert out['a_zero_false_negatives_at_a_low_bits_per_key_budget'] == 'true', 'a tight bits-per-key budget should still never produce a false negative'
assert out['a_zero_false_negatives_at_a_high_bits_per_key_budget'] == 'true', 'a generous bits-per-key budget should still never produce a false negative'
print('bloom_filter_false_positive_tradeoff: every key actually inserted was genuinely reported as possibly present at both a tight and a generous bits-per-key budget — zero false negatives either way')

# ---- 2. False positives genuinely exist at a tight bits-per-key ----
# ---- budget — a positive result is not a guarantee. ----
assert out['b_false_positives_genuinely_exist_at_the_tight_budget'] == 'true', 'a tight bits-per-key budget should genuinely produce some false positives'
print('bloom_filter_false_positive_tradeoff: a tight bits-per-key budget genuinely produced real false positives against keys never inserted')

# ---- 3. Spending more bits per key genuinely lowers the real, ----
# ---- measured false-positive rate. ----
assert out['c_more_bits_per_key_genuinely_lowered_the_measured_false_positive_rate'] == 'true', 'a more generous bits-per-key budget should genuinely lower the measured false-positive rate'
fp_rate_low = float(out['fp_rate_low'])
fp_rate_high = float(out['fp_rate_high'])
print(f'bloom_filter_false_positive_tradeoff: spending more bits per key genuinely lowered the measured false-positive rate, from {fp_rate_low:.4f} down to {fp_rate_high:.4f}')

print('all bloom-filters-their-successors examples pass')
