"""Every example shown in the "Update strategies: in-place, append,
copy-on-write" reel, compiled and run. Run: python3 examples.py (CI runs it
too). Needs rustc >= 1.85 (edition 2024; the pinned CI toolchain is 1.97.0)
and cargo on PATH. This example applies the same sequence of updates to one
logical record three genuinely different real ways and measures each
strategy's own real footprint and compaction cost. Rust sources live in
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


strategy_bin = cargo_build('update_strategy_changes_the_fragmentation_cost')
out = parse(run(strategy_bin))

# ---- 1. In-place overwriting leaves the record's own footprint flat, ----
# ---- with no garbage ever accumulating. ----
assert out['in_place_footprint_flat'] == 'true'
assert out['in_place_garbage_bytes_zero'] == 'true'
print('update_strategy_changes_the_fragmentation_cost: overwriting a record in place leaves its own footprint flat, with no garbage at all')

# ---- 2. Appending each new version grows the log's own footprint with ----
# ---- every update, and compaction has to discard every version but the ----
# ---- newest to reclaim that growth. ----
assert out['append_only_live_grows_with_updates'] == 'true'
assert out['append_only_garbage_before_compact'] == 'true', 'append-only garbage should grow with every update before compaction'
assert out['append_only_live_after_compact'] == 'true', 'compacting an append-only log should reclaim every version but the newest'
print('update_strategy_changes_the_fragmentation_cost: appending each new version genuinely grew the log, and compaction reclaimed everything but the newest')

# ---- 3. Copying the whole page on every update grows the structure's ----
# ---- own footprint by a whole page each time, not just the record's own ----
# ---- bytes. ----
assert out['cow_live_grows_by_whole_page'] == 'true'
assert out['cow_garbage_bytes_in_whole_pages'] == 'true'
print('update_strategy_changes_the_fragmentation_cost: copy-on-write grew the structure by a whole page per update, not just the record own bytes')

# ---- 4. On the same workload, copy-on-write's own garbage is strictly ----
# ---- larger than append-only's. ----
assert out['cow_garbage_exceeds_append_only_garbage'] == 'true', 'copy-on-write should leave strictly more garbage than append-only on the same workload'
print('update_strategy_changes_the_fragmentation_cost: on the exact same workload, copy-on-write own garbage was strictly larger than append-only own garbage')

print('all update-strategies-place-append examples pass')
