"""Every example shown in the "Workspace and crate boundaries" reel,
built and run. Run: python3 examples.py (CI runs it too). Needs rustc
>= 1.85 (edition 2024; the pinned CI toolchain is 1.97.0) and cargo on
PATH; once-off network access to fetch the one small workspace
dependency (once_cell). The workspace lives in
examples/workspace_demo/ next to this file, with two real member
crates (core_crate, consumer_crate); every path is resolved from
__file__. Each run resets the workspace's own two edited source files
to their original, committed text first, so re-running this script
twice in a row gives the identical result both times."""
import os
import shutil
import subprocess
import time

HERE = os.path.dirname(os.path.abspath(__file__))
CARGO = shutil.which('cargo')
RUSTC = shutil.which('rustc')
assert CARGO, 'cargo is required'
assert RUSTC, 'rustc is required (CI installs 1.97.0 with rustup)'

WS = os.path.join(HERE, 'examples', 'workspace_demo')
CORE_LIB = os.path.join(WS, 'core', 'src', 'lib.rs')
CONSUMER_LIB = os.path.join(WS, 'consumer', 'src', 'lib.rs')
TARGET = os.path.join(WS, 'target', 'debug')
CORE_RLIB = os.path.join(TARGET, 'libcore_crate.rlib')
CONSUMER_RLIB = os.path.join(TARGET, 'libconsumer_crate.rlib')

with open(CORE_LIB) as f:
    ORIGINAL_CORE = f.read()
with open(CONSUMER_LIB) as f:
    ORIGINAL_CONSUMER = f.read()


def reset_sources():
    with open(CORE_LIB, 'w') as f:
        f.write(ORIGINAL_CORE)
    with open(CONSUMER_LIB, 'w') as f:
        f.write(ORIGINAL_CONSUMER)


def cargo_build(expect_success=True, timeout=120):
    r = subprocess.run([CARGO, 'build'], cwd=WS, capture_output=True, text=True, timeout=timeout)
    if expect_success:
        assert r.returncode == 0, f'cargo build should succeed:\n{r.stdout}\n{r.stderr}'
    return r


reset_sources()
cargo_build()  # a clean, full build so every artifact exists with a known mtime

# ---- 1. Changing only consumer_crate's own source leaves core_crate's ----
# ---- own compiled artifact untouched: the crate is the real rebuild unit. ----
mtime_core_before = os.path.getmtime(CORE_RLIB)
mtime_consumer_before = os.path.getmtime(CONSUMER_RLIB)
time.sleep(1.1)  # clears the filesystem's own mtime resolution
with open(CONSUMER_LIB, 'a') as f:
    f.write('\n// a consumer-only change\n')
cargo_build()
mtime_core_after_consumer_change = os.path.getmtime(CORE_RLIB)
mtime_consumer_after_consumer_change = os.path.getmtime(CONSUMER_RLIB)

assert mtime_core_after_consumer_change == mtime_core_before, \
    "core_crate's own artifact should not be touched by a consumer-only change"
assert mtime_consumer_after_consumer_change > mtime_consumer_before, \
    "consumer_crate's own artifact should be rebuilt after its own source changed"
print('workspace-crate-boundaries: a consumer-only change left core_crate genuinely untouched, and rebuilt only consumer_crate')

# ---- 2. Changing core_crate's own source forces both core_crate and ----
# ---- consumer_crate to rebuild, since consumer_crate depends on it. ----
time.sleep(1.1)
with open(CORE_LIB, 'a') as f:
    f.write('\n// a core change\n')
cargo_build()
mtime_core_after_core_change = os.path.getmtime(CORE_RLIB)
mtime_consumer_after_core_change = os.path.getmtime(CONSUMER_RLIB)

assert mtime_core_after_core_change > mtime_core_after_consumer_change, \
    "core_crate's own artifact should be rebuilt after its own source changed"
assert mtime_consumer_after_core_change > mtime_consumer_after_consumer_change, \
    "consumer_crate should also rebuild, since it genuinely depends on core_crate"
print('workspace-crate-boundaries: a core_crate change genuinely forced both core_crate and consumer_crate to rebuild')

# ---- 3. The workspace's own inherited lint config genuinely blocks a ----
# ---- real violation in a member crate, and genuinely allows it once fixed. ----
reset_sources()
with open(CONSUMER_LIB, 'a') as f:
    f.write('\npub fn risky() -> i32 {\n    let x = 5;\n    let p = &x as *const i32;\n    unsafe { *p }\n}\n')
violation = cargo_build(expect_success=False)
assert violation.returncode != 0, 'the inherited forbid-unsafe-code lint should genuinely block this real violation'
assert 'unsafe' in (violation.stdout + violation.stderr).lower(), \
    f'the real build failure should genuinely name the unsafe-code violation:\n{violation.stdout}\n{violation.stderr}'
print("workspace-crate-boundaries: the workspace's own inherited lint genuinely blocked a real unsafe-code violation in consumer_crate")

reset_sources()
fixed = cargo_build()
assert fixed.returncode == 0, 'the workspace should build cleanly again once the real violation is removed'
print('workspace-crate-boundaries: the identical workspace genuinely builds clean again once the violation is removed')

reset_sources()
print('all workspace-crate-boundaries examples pass')
