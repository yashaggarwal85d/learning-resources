"""Every example shown in the "Self-describing page formats" reel, compiled
and run. Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85
(edition 2024; the pinned CI toolchain is 1.97.0) and cargo on PATH. This
example builds a real, fixed-size page as an explicit byte buffer with a
self-describing header, a real CRC32C checksum, and explicit little-endian
encoding; no mocks, no std-provided checksum shortcut. Rust sources live in
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


page_bin = cargo_build('self_describing_page_catches_corruption')
out = parse(run(page_bin))

# ---- 1. A real page round-trips its own header fields exactly, and its real ----
# ---- checksum validates on an untouched page. ----
assert out['round_trip_lsn_matches'] == 'true'
assert out['round_trip_checksum_valid'] == 'true'
assert out['round_trip_format_valid'] == 'true'
print('self_describing_page_catches_corruption: an untouched page round-trips its own LSN exactly and its real checksum validates')

# ---- 2. A single corrupted byte anywhere in the page's own body is genuinely ----
# ---- caught by the checksum. ----
assert out['corrupted_byte_checksum_valid'] == 'false', 'a single flipped byte should genuinely invalidate the real checksum'
print('self_describing_page_catches_corruption: a single corrupted byte in the page genuinely invalidated its own checksum')

# ---- 3. A deliberately wrong magic number is caught as an invalid format, even ----
# ---- though the checksum alone, recomputed over the changed bytes, still validates. ----
assert out['wrong_magic_checksum_valid'] == 'true', 'a consistent, deliberate format change still passes a checksum computed over the new bytes'
assert out['wrong_magic_format_valid'] == 'false', 'the magic number check should catch what the checksum alone cannot'
print('self_describing_page_catches_corruption: a wrong magic number was caught as an invalid format, even though the checksum alone still validated')

# ---- 4. The page's own encoding is explicitly little-endian, not whatever the ----
# ---- platform happens to use. ----
assert out['explicit_le_round_trip_correct'] == 'true'
assert out['wrong_byte_order_gives_different_value'] == 'true', 'reading the same raw bytes in the wrong byte order should genuinely produce a different value'
print('self_describing_page_catches_corruption: the explicit little-endian encoding round-tripped correctly, and reading it in the wrong byte order genuinely gave a different value')

print('all self-describing-page-formats examples pass')
