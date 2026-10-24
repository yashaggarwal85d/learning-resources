"""Every example shown in the "Retention, compaction, and tiered storage"
reel, compiled and run. Run: python3 examples.py (CI runs it too).
Needs rustc >= 1.85 (edition 2024; the pinned CI toolchain is 1.97.0)
and cargo on PATH. This example builds a real time/size retention
function and a real compaction function over the same toy log, and
measures the exact difference between them, including a real
tombstone's own effect. Rust sources live in examples/runtime-demo/
next to this file; every path is resolved from __file__."""
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


compaction_bin = cargo_build('compaction_keeps_latest_value_per_key')
out = parse(run(compaction_bin))

# ---- 1. Time/size retention genuinely deletes an entry past its own ----
# ---- age threshold, regardless of whether it is a key's own latest. ----
assert out['a_time_size_retention_genuinely_deletes_by_age_regardless_of_key'] == 'true', \
    "time/size retention should genuinely delete by age, regardless of a key's own latest status"
print("compaction_keeps_latest_value_per_key: time/size retention genuinely deleted by age, regardless of a key's own latest status")

# ---- 2. Compaction genuinely keeps the latest value for each distinct ----
# ---- key forever, even on the identical log retention would have pruned. ----
assert out['b_compaction_genuinely_keeps_the_latest_value_per_key_forever'] == 'true', \
    'compaction should genuinely keep the latest value for each distinct key forever'
print('compaction_keeps_latest_value_per_key: compaction genuinely kept the latest value for each distinct key forever')

# ---- 3. A real tombstone genuinely removes a key entirely once ----
# ---- compaction runs past it, without touching any other key. ----
assert out['c_a_tombstone_genuinely_removes_the_key_once_compaction_runs_past_it'] == 'true', \
    'a real tombstone should genuinely remove a key once compaction runs past it'
print('compaction_keeps_latest_value_per_key: a real tombstone genuinely removed a key once compaction ran past it')

print('all retention-compaction-tiered-storage examples pass')
