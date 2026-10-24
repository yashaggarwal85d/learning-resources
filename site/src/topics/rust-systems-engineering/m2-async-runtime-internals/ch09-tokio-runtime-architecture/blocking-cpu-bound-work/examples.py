"""Every example shown in the "Blocking and CPU-bound work" reel, compiled and run.
Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85 (edition 2024; the pinned CI
toolchain is 1.97.0) and cargo on PATH; every example here needs the real tokio crate. Rust
sources live in examples/runtime-demo/ next to this file; every path is resolved from __file__."""
import os
import shutil
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
RUSTC = shutil.which('rustc')
CARGO = shutil.which('cargo')
assert RUSTC, 'rustc is required (CI installs 1.97.0 with rustup)'
assert CARGO, 'cargo is required: every example in this topic needs the real tokio crate'
ver = subprocess.run([RUSTC, '--version'], capture_output=True, text=True).stdout.strip()
print(f'using {ver}')

CRATE = os.path.join(HERE, 'examples', 'runtime-demo')


def cargo_run(name, timeout=60):
    return subprocess.run([CARGO, 'run', '--release', '--quiet', '--bin', name], cwd=CRATE,
                           capture_output=True, text=True, timeout=timeout)


# ---- 1. A real, 300ms blocking call directly inside an async task, on the only worker, ----
# ---- stalls a trivial sibling for the call's full length. ----
r = cargo_run('blocking_call_stalls_worker')
assert r.returncode == 0, f'blocking_call_stalls_worker should build and run:\n{r.stdout}\n{r.stderr}'
waited_ms = int(r.stdout.strip())
assert waited_ms >= 250, f'a sibling queued behind a 300ms blocking call on the only worker should wait close to 300ms, got {waited_ms}ms'
print(f'blocking_call_stalls_worker: a trivial sibling waited {waited_ms}ms for the one worker, fully occupied by a direct blocking call, to free up')

# ---- 2. The identical blocking call moved to spawn_blocking leaves the one async worker free. ----
r = cargo_run('spawn_blocking_isolates_it')
assert r.returncode == 0, f'spawn_blocking_isolates_it should build and run:\n{r.stdout}\n{r.stderr}'
waited_ms = int(r.stdout.strip())
assert waited_ms < 100, f'moving the same blocking call to spawn_blocking should leave the one worker free, got {waited_ms}ms'
print(f'spawn_blocking_isolates_it: the sibling ran after {waited_ms}ms — the identical blocking call, moved to spawn_blocking’s own pool, never touched the worker')

# ---- 3. block_in_place hands an independent sibling task off to a new worker thread ----
# ---- before blocking the one running it. ----
r = cargo_run('block_in_place_hands_off')
assert r.returncode == 0, f'block_in_place_hands_off should build and run:\n{r.stdout}\n{r.stderr}'
waited_ms = int(r.stdout.strip())
assert waited_ms < 100, f'block_in_place should hand the sibling off to a new worker thread, got {waited_ms}ms'
print(f'block_in_place_hands_off: the sibling ran after {waited_ms}ms — handed off to a new worker thread before the blocking call started')

# ---- 4. block_in_place panics outright on a current-thread runtime: there is no other ----
# ---- worker thread to hand anything off to. ----
r = cargo_run('block_in_place_panics_on_current_thread')
assert r.returncode != 0, 'block_in_place_panics_on_current_thread should panic: no other worker to hand off to'
assert 'multi-threaded runtime' in r.stderr, f'expected the exact "multi-threaded runtime" panic message, got:\n{r.stderr}'
print('block_in_place_panics_on_current_thread: panics — a current-thread runtime has no other worker thread to hand anything off to')

print('all blocking-cpu-bound-work examples pass')
