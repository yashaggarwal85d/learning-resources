"""Every example shown in the "Compaction strategies and amplification"
reel, compiled and run. Run: python3 examples.py (CI runs it too). Needs
rustc >= 1.85 (edition 2024; the pinned CI toolchain is 1.97.0) and
cargo on PATH. This example builds a real, minimal leveled compactor
and a real, minimal tiered (universal-style) compactor, run against the
identical sequence of flushed SSTables. Rust sources live in
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


compaction_bin = cargo_build('compaction_strategies_amplification')
out = parse(run(compaction_bin))

# ---- 1. Without compaction, SSTables accumulate forever, so read ----
# ---- and space amplification genuinely grow without bound. ----
assert out['a_run_count_genuinely_matches_the_flush_count'] == 'true', 'without compaction, the run count should genuinely match the number of flushes, growing forever'
assert out['a_every_stale_version_is_genuinely_still_present'] == 'true', 'without compaction, every stale, overwritten version should genuinely still be physically present'
print('compaction_strategies_amplification: without compaction, the run count genuinely grew to match every flush, and every stale version genuinely stayed physically present')

# ---- 2. Both real compaction strategies genuinely beat no compaction ----
# ---- at all, on both read and space amplification. ----
assert out['b_leveled_beats_no_compaction_on_read_amp'] == 'true', 'leveled compaction should genuinely beat no compaction on read amplification'
assert out['b_tiered_beats_no_compaction_on_read_amp'] == 'true', 'tiered compaction should genuinely beat no compaction on read amplification'
assert out['b_leveled_beats_no_compaction_on_space_amp'] == 'true', 'leveled compaction should genuinely beat no compaction on space amplification'
assert out['b_tiered_beats_no_compaction_on_space_amp'] == 'true', 'tiered compaction should genuinely beat no compaction on space amplification'
print('compaction_strategies_amplification: both leveled and tiered compaction genuinely beat no compaction at all, on both read and space amplification')

# ---- 3. Leveled and tiered compaction, run against the identical ----
# ---- write workload, genuinely produce different write amplification ----
# ---- and different read/space amplification from each other. ----
assert out['c_write_amplification_genuinely_differs'] == 'true', 'leveled and tiered compaction should genuinely produce different write amplification on the identical workload'
assert out['c_read_or_space_amplification_genuinely_differs'] == 'true', 'leveled and tiered compaction should genuinely produce different read or space amplification on the identical workload'
leveled_write_amp = float(out['leveled_write_amp'])
tiered_write_amp = float(out['tiered_write_amp'])
leveled_read_amp = int(out['leveled_read_amp'])
tiered_read_amp = int(out['tiered_read_amp'])
assert tiered_write_amp < leveled_write_amp, 'tiered compaction should genuinely cost less write amplification than leveled, on this workload'
assert tiered_read_amp > leveled_read_amp, 'tiered compaction should genuinely cost more read amplification than leveled, on this workload'
print(f'compaction_strategies_amplification: leveled and tiered genuinely differed — write amplification {leveled_write_amp:.4f} vs {tiered_write_amp:.4f}, read amplification {leveled_read_amp} vs {tiered_read_amp} runs')

print('all compaction-strategies-amplification examples pass')
