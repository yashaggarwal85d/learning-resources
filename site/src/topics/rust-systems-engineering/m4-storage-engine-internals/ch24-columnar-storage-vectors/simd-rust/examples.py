"""Every example shown in the "SIMD in Rust" reel, compiled and run.
Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85
(edition 2024; the pinned CI toolchain is 1.97.0) and cargo on PATH.
This example builds a real scalar sum and a real explicit AVX2 SIMD
kernel summing the identical column, checking the real CPU's own
feature support at runtime via is_x86_feature_detected! before ever
calling the kernel, and falling back to a clearly labeled scalar-only
measurement if the feature is genuinely absent. Rust sources live in
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


simd_bin = cargo_build('simd_autovectorization_verification')
out = parse(run(simd_bin))

# ---- 1. The explicit SIMD kernel produces the exact identical sum as ----
# ---- the plain scalar loop, on the identical column. ----
assert out['a_simd_result_matches_scalar_exactly'] == 'true', \
    'the explicit SIMD kernel should produce the exact identical sum as the scalar loop'
scalar_result = out['scalar_result']
print(f'simd_autovectorization_verification: the explicit SIMD kernel and the plain scalar loop both produced the exact identical sum, {scalar_result}, on the identical column')

# ---- 2. The real CPU's own AVX2 feature was genuinely checked and ----
# ---- detected at runtime before the explicit kernel ever ran, rather ----
# ---- than assumed. ----
assert out['b_explicit_simd_feature_was_genuinely_detected_at_runtime'] == out['used_explicit_simd'], \
    'the runtime feature-detection result should match whether the explicit SIMD path actually ran'
used_explicit_simd = out['used_explicit_simd'] == 'true'
if used_explicit_simd:
    print('simd_autovectorization_verification: the real CPU genuinely supports AVX2, detected at runtime, so the explicit SIMD kernel ran for real')
else:
    print('simd_autovectorization_verification: AVX2 is genuinely absent on this real CPU, so the labeled scalar-only fallback ran instead, exactly as the runtime check requires')

# ---- 3. When the explicit SIMD kernel does run, it processes far ----
# ---- fewer vector operations than the scalar loop processes scalar ----
# ---- operations, and that vector-op count matches the real lane ----
# ---- arithmetic exactly. ----
assert out['d_vector_op_count_matches_real_lane_arithmetic'] == 'true', \
    "the vector-op count should match the real lane arithmetic exactly"
if used_explicit_simd:
    assert out['c_simd_processes_far_fewer_vector_ops_than_scalar'] == 'true', \
        'the SIMD kernel should process far fewer vector operations than the scalar loop, when it genuinely ran'
    scalar_ops = int(out['scalar_ops'])
    simd_ops = int(out['simd_ops'])
    print(f'simd_autovectorization_verification: the scalar loop processed {scalar_ops} operations against the SIMD kernel\'s {simd_ops}, matching the real lane width exactly')

print('all simd-rust examples pass')
