"""Every example shown in the "Slotted pages and record identity" reel,
compiled and run. Run: python3 examples.py (CI runs it too). Needs rustc >=
1.85 (edition 2024; the pinned CI toolchain is 1.97.0) and cargo on PATH.
This example builds a real slotted page as an explicit byte buffer with a
real slot array, decoupling a record's own stable slot index from its
physical offset, and a real in-page compaction pass. Rust sources live in
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


slot_bin = cargo_build('slot_index_outlives_physical_compaction')
out = parse(run(slot_bin))

# ---- 1. Variable-length records read back correctly through their own ----
# ---- slot index alone. ----
assert out['insert_and_round_trip_by_slot'] == 'true'
print('slot_index_outlives_physical_compaction: three variable-length records round-trip correctly through their own slot index')

# ---- 2. Compacting the page after a deletion genuinely moves a surviving ----
# ---- record's own physical offset, while its slot index never changes. ----
assert out['physical_offset_changed_after_compaction'] == 'true', 'compaction should genuinely move a surviving record physically'
assert out['slot_indices_unchanged'] == 'true', 'a record own slot index should never change, even when its physical offset does'
print('slot_index_outlives_physical_compaction: compaction genuinely moved a surviving record, but its own slot index never changed')

# ---- 3. Despite that physical move, reading by the same slot index still ----
# ---- returns the exact same content as before compaction. ----
assert out['content_correct_after_compaction'] == 'true'
print('slot_index_outlives_physical_compaction: reading by slot index after compaction still returned the exact original content')

# ---- 4. A record too large for the page own remaining free space is ----
# ---- rejected cleanly, with the page left genuinely uncorrupted. ----
assert out['oversized_insert_rejected_cleanly'] == 'true', 'an oversized insert should be rejected, not silently corrupt the page'
assert out['page_still_readable_after_rejected_insert'] == 'true', 'a rejected insert should leave every existing record genuinely intact'
print('slot_index_outlives_physical_compaction: an oversized record was rejected cleanly, and the page stayed genuinely readable afterward')

print('all slotted-pages-record-identity examples pass')
