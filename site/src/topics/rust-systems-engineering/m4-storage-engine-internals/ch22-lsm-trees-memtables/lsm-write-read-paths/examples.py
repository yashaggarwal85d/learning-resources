"""Every example shown in the "LSM write and read paths" reel, compiled
and run. Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85
(edition 2024; the pinned CI toolchain is 1.97.0) and cargo on PATH.
This example builds a real, minimal LSM tree: a durable log append, an
active memtable, rotation to an immutable memtable, and a flush to an
immutable, sorted SSTable. Rust sources live in examples/runtime-demo/
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


lsm_bin = cargo_build('lsm_write_read_paths_newest_first')
out = parse(run(lsm_bin))

# ---- 1. A key overwritten after its SSTable flush is still found via ----
# ---- the newest structure, not the stale, already-flushed one. ----
assert out['a_stale_sstable_value_was_found_before_the_overwrite'] == 'true', 'the flushed SSTable value should genuinely be found before any overwrite'
assert out['a_fresh_active_memtable_value_wins_over_the_stale_sstable'] == 'true', 'the fresh overwrite in the active memtable should genuinely win over the stale SSTable value'
print('lsm_write_read_paths_newest_first: an overwrite landing only in the fresh active memtable genuinely won over the same key\'s stale, already-flushed SSTable value')

# ---- 2. A read genuinely has to fall through multiple structures, ----
# ---- newest first, to find or rule out a key. ----
assert out['b_the_oldest_key_took_checking_more_than_one_structure'] == 'true', 'the oldest key should genuinely take checking more than one structure to find'
assert out['b_the_newest_key_was_found_by_checking_only_the_active_memtable'] == 'true', 'the newest key should genuinely be found by checking only the active memtable'
assert out['b_a_genuine_miss_had_to_check_every_structure_that_exists'] == 'true', 'a genuine miss should genuinely have to check every structure that exists before it can be ruled out'
print('lsm_write_read_paths_newest_first: the oldest key genuinely took checking multiple structures, the newest key took checking only the active memtable, and a genuine miss checked every structure that exists')

# ---- 3. Once flushed, an SSTable's own bytes are genuinely never ----
# ---- modified by any later read against it. ----
assert out['c_the_flushed_sstables_own_bytes_never_changed_across_many_reads'] == 'true', "a flushed SSTable's own bytes should genuinely never change across many later reads"
print("lsm_write_read_paths_newest_first: a flushed SSTable's own bytes genuinely never changed across many later reads against it")

print('all lsm-write-read-paths examples pass')
