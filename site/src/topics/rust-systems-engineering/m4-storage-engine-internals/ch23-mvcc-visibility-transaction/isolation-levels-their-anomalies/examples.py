"""Every example shown in the "Isolation levels and their anomalies" reel,
compiled and run. Run: python3 examples.py (CI runs it too). Needs
rustc >= 1.85 (edition 2024; the pinned CI toolchain is 1.97.0) and
cargo on PATH. This example builds a real write-skew history over two
on-call doctors, checked under a real snapshot-isolation commit rule and
a real, stricter dependency-graph check. Rust sources live in
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


anomaly_bin = cargo_build('isolation_level_permitted_anomaly')
out = parse(run(anomaly_bin))

# ---- 1. Snapshot isolation genuinely permits the write-skew anomaly ----
# ---- through: no write-write conflict, yet the shared invariant ends ----
# ---- up violated. ----
assert out['invariant_held_before'] == 'true', 'the shared invariant should genuinely hold before either transaction commits'
assert out['no_write_write_conflict'] == 'true', 'the two transactions should genuinely write disjoint keys, so SI sees no conflict at all'
assert out['a_write_skew_permitted_under_si'] == 'true', 'snapshot isolation should genuinely let both transactions through'
assert out['invariant_holds_after'] == 'false', 'the shared invariant should genuinely end up violated once both commit'
print('isolation_level_permitted_anomaly: two transactions with no write-write conflict genuinely both committed under snapshot isolation, and the shared invariant they were each individually preserving genuinely ended up violated')

# ---- 2. The stricter, dependency-graph check genuinely detects and ----
# ---- would reject this exact history. ----
assert out['b_stricter_check_detects_the_anomaly'] == 'true', 'the stricter, dependency-graph-based check should genuinely flag this exact history as unsafe'
print('isolation_level_permitted_anomaly: the stricter, dependency-graph-based check genuinely detected the identical history as unsafe')

# ---- 3. The stricter check is not simply always true: two transactions ----
# ---- over independent keys correctly pass. ----
assert out['c_stricter_check_correctly_passes_independent_transactions'] == 'true', 'two transactions with no overlapping reads or writes at all should genuinely NOT be flagged'
print('isolation_level_permitted_anomaly: two transactions over entirely independent keys genuinely passed the same stricter check, confirming it is not simply always true')

print('all isolation-levels-their-anomalies examples pass')
