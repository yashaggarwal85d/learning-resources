"""Every example shown in the "WAL flush points and I/O measurement" reel, compiled and run.
Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85 (edition 2024; the pinned CI
toolchain is 1.97.0), cargo, and strace on PATH. These examples are Unix-specific (fsync via
strace) and compare a per-update-fsync loop against a WAL-style batched-flush-points loop, both
by real wall-clock time and by real fsync() syscall count. Rust sources live in
examples/runtime-demo/ next to this file; every path is resolved from __file__."""
import os
import shutil
import subprocess
import sys

assert sys.platform != 'win32', 'this topic is Unix-specific: fsync, strace'

HERE = os.path.dirname(os.path.abspath(__file__))
RUSTC = shutil.which('rustc')
CARGO = shutil.which('cargo')
STRACE = shutil.which('strace')
assert RUSTC, 'rustc is required (CI installs 1.97.0 with rustup)'
assert CARGO, 'cargo is required'
assert STRACE, 'strace is required: these examples count real fsync() syscalls, not just timing'
ver = subprocess.run([RUSTC, '--version'], capture_output=True, text=True).stdout.strip()
print(f'using {ver}')

CRATE = os.path.join(HERE, 'examples', 'runtime-demo')


def cargo_build(name, timeout=60):
    r = subprocess.run([CARGO, 'build', '--release', '--quiet', '--bin', name], cwd=CRATE,
                        capture_output=True, text=True, timeout=timeout)
    assert r.returncode == 0, f'{name} should build:\n{r.stdout}\n{r.stderr}'
    return os.path.join(CRATE, 'target', 'release', name)


def run_timed(binary, timeout=60):
    r = subprocess.run([binary], capture_output=True, text=True, timeout=timeout)
    assert r.returncode == 0, f'{binary} should run:\n{r.stdout}\n{r.stderr}'
    return float(r.stdout.strip())


def strace_fsync_count(binary, timeout=60):
    r = subprocess.run([STRACE, '-f', '-e', 'trace=fsync', binary], capture_output=True,
                        text=True, timeout=timeout)
    assert r.returncode == 0, f'{binary} under strace should run:\n{r.stdout}\n{r.stderr}'
    return r.stderr.count('fsync(')


# ---- 1. A per-update fsync makes exactly one real fsync() syscall per write, while a batched, ----
# ---- WAL-style flush point makes dramatically fewer real fsync() syscalls for the same writes. ----
per_update_bin = cargo_build('fsync_per_update')
batched_bin = cargo_build('fsync_batched_flush_points')
per_update_calls = strace_fsync_count(per_update_bin)
batched_calls = strace_fsync_count(batched_bin)
assert per_update_calls == 1000, f'expected exactly 1000 real fsync() syscalls for 1000 per-update flushes, got {per_update_calls}'
assert batched_calls == 21, f'expected exactly 21 real fsync() syscalls for 1000 writes flushed every 50 plus one final flush, got {batched_calls}'
print(f'fsync count: per-update made {per_update_calls} real fsync() syscalls, batched flush points made {batched_calls}')

# ---- 2. The same batched flush points are also dramatically faster in real wall-clock time, ----
# ---- because most writes never wait on a real fsync() at all. ----
per_update_ms = run_timed(per_update_bin)
batched_ms = run_timed(batched_bin)
assert per_update_ms > 0 and batched_ms > 0, f'both timings should be positive, got {per_update_ms} and {batched_ms}'
assert batched_ms * 5 < per_update_ms, f'batched flush points should be dramatically faster, got {batched_ms:.1f}ms batched vs {per_update_ms:.1f}ms per-update'
print(f'timing: per-update took {per_update_ms:.1f}ms, batched flush points took {batched_ms:.1f}ms for the same 1000 writes')

print('all wal-flush-points-i examples pass')
