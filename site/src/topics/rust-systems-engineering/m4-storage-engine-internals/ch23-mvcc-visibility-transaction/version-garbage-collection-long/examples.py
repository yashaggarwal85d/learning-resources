"""Every example shown in the "Version garbage collection and long
snapshots" reel, compiled and run. Run: python3 examples.py (CI runs it
too). Needs rustc >= 1.85 (edition 2024; the pinned CI toolchain is
1.97.0) and cargo on PATH. This example builds a real version chain and
a real garbage-collection pass driven by the oldest currently open
snapshot's own horizon. Rust sources live in examples/runtime-demo/ next
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


gc_bin = cargo_build('version_gc_coupled_to_snapshot_lifetime')
out = parse(run(gc_bin))

# ---- 1. While a long-lived reader stays open, nothing newer than it ----
# ---- gets reclaimed at all, not even versions it never directly reads. ----
assert out['a_long_lived_reader_blocks_all_reclaim'] == 'true', 'a long-lived reader should genuinely block every reclaim, not just of the one version it reads'
reclaimed_long = int(out['reclaimed_long'])
assert reclaimed_long == 0, 'nothing at all should be reclaimed while the long-lived reader stays open'
print('version_gc_coupled_to_snapshot_lifetime: on the identical workload, a long-lived reader genuinely blocked every single reclaim, not only of the one version it reads directly')

# ---- 2. Once that identical reader closes instead, the dead versions it ----
# ---- was pinning genuinely become reclaimable. ----
assert out['b_closing_the_reader_frees_dead_versions'] == 'true', 'closing the reader should genuinely free up its own previously-pinned dead versions'
reclaimed_short = int(out['reclaimed_short'])
assert reclaimed_short > 0, 'at least one dead version should genuinely become reclaimable once the reader closes'
print(f'version_gc_coupled_to_snapshot_lifetime: once the identical reader closed instead, {reclaimed_short} dead version(s) genuinely became reclaimable on the identical workload')

# ---- 3. The long-lived reader retains genuinely more versions than the ----
# ---- short-lived one, on the identical workload. ----
assert out['c_long_lived_reader_retains_more_versions'] == 'true', 'a long-lived reader should genuinely retain more versions than a short-lived one, on the identical workload'
retained_short = int(out['retained_short'])
retained_long = int(out['retained_long'])
print(f'version_gc_coupled_to_snapshot_lifetime: the long-lived reader genuinely retained {retained_long} versions against the short-lived reader\'s {retained_short}, on the identical workload')

print('all version-garbage-collection-long examples pass')
