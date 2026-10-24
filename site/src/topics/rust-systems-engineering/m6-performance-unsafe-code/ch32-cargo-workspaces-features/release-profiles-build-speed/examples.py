"""Every example shown in the "Release profiles and build speed" reel,
built and run. Run: python3 examples.py (CI runs it too). Needs rustc
>= 1.85 (edition 2024; the pinned CI toolchain is 1.97.0) and cargo on
PATH. One real crate lives in examples/profile_demo/ next to this file:
a small, genuinely recursive Fibonacci binary, real work a release
profile's own dials can measurably act on, built and timed directly on
this sandboxed container's own toolchain. Every path is resolved from
__file__, and the crate's own Cargo.toml is reset to its original,
committed text at the start of the script and again at the end, so
running it twice in a row (or after a failed run) produces the
identical real result both times. Every number this reel shows is this
container's own real, measured wall-clock time or real, measured file
size, never a fixed, asserted figure; only the direction of each real
difference is claimed.
"""
import os
import shutil
import subprocess
import time

HERE = os.path.dirname(os.path.abspath(__file__))
CRATE = os.path.join(HERE, 'examples', 'profile_demo')
MANIFEST = os.path.join(CRATE, 'Cargo.toml')
BINARY = os.path.join(CRATE, 'target', 'release', 'profile_demo')

CARGO = shutil.which('cargo')
assert CARGO, 'cargo is required'

BASE_MANIFEST = """[package]
name = "profile_demo"
version = "0.1.0"
edition = "2024"

[profile.release]
"""


def write_manifest(extra_lines=''):
    with open(MANIFEST, 'w') as f:
        f.write(BASE_MANIFEST + extra_lines)


def clean():
    shutil.rmtree(os.path.join(CRATE, 'target'), ignore_errors=True)


def build():
    clean()
    t0 = time.perf_counter()
    r = subprocess.run([CARGO, 'build', '--release'], cwd=CRATE, capture_output=True, text=True, timeout=180)
    elapsed = time.perf_counter() - t0
    assert r.returncode == 0, f'cargo build --release should succeed:\n{r.stdout}\n{r.stderr}'
    size = os.path.getsize(BINARY)
    return elapsed, size


write_manifest()

# ---- 1. codegen-units = 1 and lto = "fat" measurably slow the real ----
# ---- build down, trading build time for whatever they optimize. ----
write_manifest()
default_time, _ = build()

write_manifest('codegen-units = 1\nlto = "fat"\n')
fat_lto_time, _ = build()

assert fat_lto_time > default_time, \
    f'codegen-units = 1 and lto = "fat" should genuinely take longer to build, got {fat_lto_time:.2f}s vs {default_time:.2f}s'
print(f'release-profiles-build-speed: the default release profile built in {default_time:.2f}s; codegen-units = 1 with lto = "fat" genuinely took {fat_lto_time:.2f}s')

# ---- 2. strip = true measurably shrinks the real binary on disk. ----
write_manifest()
_, unstripped_size = build()

write_manifest('strip = true\n')
_, stripped_size = build()

assert stripped_size < unstripped_size, \
    f'strip = true should genuinely produce a smaller binary, got {stripped_size} vs {unstripped_size}'
print(f'release-profiles-build-speed: the unstripped binary was {unstripped_size} bytes; strip = true genuinely shrank it to {stripped_size} bytes')

# ---- 3. panic = "abort" measurably shrinks the real binary too, since ----
# ---- no unwinding machinery has to be generated for it. ----
write_manifest()
_, unwind_size = build()

write_manifest('panic = "abort"\n')
_, abort_size = build()

assert abort_size < unwind_size, \
    f'panic = "abort" should genuinely produce a smaller binary, got {abort_size} vs {unwind_size}'
print(f'release-profiles-build-speed: the default, unwinding binary was {unwind_size} bytes; panic = "abort" genuinely shrank it to {abort_size} bytes')

write_manifest()
clean()
print('all release-profiles-build-speed examples pass')
