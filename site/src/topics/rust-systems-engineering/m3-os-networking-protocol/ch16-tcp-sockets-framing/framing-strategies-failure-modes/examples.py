"""Every example shown in the "Framing strategies and failure modes" reel, compiled
and run. Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85 (edition 2024;
the pinned CI toolchain is 1.97.0) and cargo on PATH. This example builds a real
length-prefixed frame decoder over a real bytes::BytesMut buffer and measures that a
frame under its cap decodes correctly with a genuinely zero-copy extraction, and that
a frame whose length prefix claims a size over the cap is rejected before any buffer
anywhere near that size is ever allocated. Rust sources live in examples/runtime-demo/
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


def cargo_build(name, timeout=60):
    r = subprocess.run([CARGO, 'build', '--release', '--quiet', '--bin', name], cwd=CRATE,
                        capture_output=True, text=True, timeout=timeout)
    assert r.returncode == 0, f'{name} should build:\n{r.stdout}\n{r.stderr}'
    return os.path.join(CRATE, 'target', 'release', name)


def run(binary, timeout=30):
    r = subprocess.run([binary], capture_output=True, text=True, timeout=timeout)
    assert r.returncode == 0, f'{binary} should run:\n{r.stdout}\n{r.stderr}'
    return r.stdout.strip()


# ---- A length-prefixed frame under the cap decodes correctly, with a genuinely ----
# ---- zero-copy extraction, and a frame claiming a length over the cap is rejected ----
# ---- before any buffer anywhere near that claimed size is ever allocated. ----
binary = cargo_build('capped_length_prefix_framing')
out = run(binary)
under_cap_ok, zero_copy, rejected = (x == 'true' for x in out.split())
assert under_cap_ok, 'a frame under the cap should decode to exactly the original payload'
assert zero_copy, "split_to's own extraction should land at the original payload's own address, not a fresh allocation"
assert rejected, 'a frame claiming a length of 1 GiB, far over a 1024-byte cap, should be rejected before any such buffer is allocated'
print(f'capped_length_prefix_framing: under_cap_ok={under_cap_ok} zero_copy={zero_copy} oversized_frame_rejected={rejected}')

print('all framing-strategies-failure-modes examples pass')
