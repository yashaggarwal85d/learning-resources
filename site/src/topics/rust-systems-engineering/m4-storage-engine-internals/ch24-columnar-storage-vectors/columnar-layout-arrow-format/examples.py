"""Every example shown in the "Columnar layout and the Arrow format"
reel, compiled and run. Run: python3 examples.py (CI runs it too). Needs
rustc >= 1.85 (edition 2024; the pinned CI toolchain is 1.97.0) and
cargo on PATH. This example builds a real row-major layout and a real
column-major layout (with a packed validity bitmap) over the identical
rows, and measures real bytes touched for a narrow-column scan and real
regions touched for a wide-row update in each. Rust sources live in
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


layout_bin = cargo_build('columnar_layout_locality_tradeoff')
out = parse(run(layout_bin))

# ---- 1. A narrow-column scan touches far fewer bytes in the column- ----
# ---- major layout than in the row-major layout, over the identical ----
# ---- rows. ----
assert out['narrow_scan_column_major_touches_far_fewer_bytes'] == 'true', \
    'a narrow-column scan should touch far fewer bytes in the column-major layout'
row_scan_bytes = int(out['row_scan_bytes'])
col_scan_bytes = int(out['col_scan_bytes'])
assert col_scan_bytes * 3 < row_scan_bytes
print(f'columnar_layout_locality_tradeoff: a narrow scan over one column touched {row_scan_bytes} bytes in the row-major layout against {col_scan_bytes} in the column-major layout, over the identical rows')

# ---- 2. A wide-row update touches more separate, non-adjacent regions ----
# ---- in the column-major layout than in the row-major layout. ----
assert out['wide_row_update_touches_more_regions_in_column_major'] == 'true', \
    'a wide-row update should touch more separate regions in the column-major layout'
row_update_regions = int(out['row_update_regions'])
col_update_regions = int(out['col_update_regions'])
assert row_update_regions == 1
assert col_update_regions == 4
print(f'columnar_layout_locality_tradeoff: the identical wide-row update touched {row_update_regions} contiguous region in the row-major layout against {col_update_regions} separate regions in the column-major layout')

# ---- 3. The packed validity bitmap correctly skips the rows it marks ----
# ---- absent, and uses far fewer bytes than one byte per row would. ----
assert out['validity_bitmap_correctly_skips_nulled_rows'] == 'true', \
    'the validity bitmap should correctly cause nulled rows to be skipped during the scan'
validity_bitmap_bytes = int(out['validity_bitmap_bytes'])
naive_per_row_bool_bytes = int(out['naive_per_row_bool_bytes'])
assert validity_bitmap_bytes * 7 < naive_per_row_bool_bytes
col_skipped = int(out['col_skipped'])
print(f'columnar_layout_locality_tradeoff: the packed validity bitmap correctly skipped {col_skipped} nulled row(s) during the scan, using {validity_bitmap_bytes} bytes against {naive_per_row_bool_bytes} for one byte per row')

print('all columnar-layout-arrow-format examples pass')
