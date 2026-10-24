"""Every example shown in the "I/O and time drivers" reel, compiled and run.
Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85 (edition 2024; the pinned CI
toolchain is 1.97.0) and cargo on PATH; these examples need the real tokio and mio crates.
Rust sources live in examples/runtime-demo/ next to this file; every path is resolved from
__file__."""
import os
import shutil
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
RUSTC = shutil.which('rustc')
CARGO = shutil.which('cargo')
assert RUSTC, 'rustc is required (CI installs 1.97.0 with rustup)'
assert CARGO, 'cargo is required: these examples need the real tokio and mio crates'
ver = subprocess.run([RUSTC, '--version'], capture_output=True, text=True).stdout.strip()
print(f'using {ver}')

CRATE = os.path.join(HERE, 'examples', 'runtime-demo')


def cargo_run(name, timeout=60):
    return subprocess.run([CARGO, 'run', '--release', '--quiet', '--bin', name], cwd=CRATE,
                           capture_output=True, text=True, timeout=timeout)


# ---- 1. Register a real socket's connect with mio, then poll: a real writable readiness ----
# ---- event actually arrives once the connection completes. ----
r = cargo_run('mio_register_then_connect')
assert r.returncode == 0, f'mio_register_then_connect should build and run:\n{r.stdout}\n{r.stderr}'
saw_writable = r.stdout.strip()
assert saw_writable == 'true', f'expected a real writable readiness event, got {saw_writable!r}'
print('mio_register_then_connect: registering interest and polling delivered a real writable readiness event once the connection completed')

# ---- 2. Register a socket that never becomes ready: poll parks for close to the full ----
# ---- timeout, and delivers no event at all. ----
r = cargo_run('mio_poll_times_out_with_nothing_ready')
assert r.returncode == 0, f'mio_poll_times_out_with_nothing_ready should build and run:\n{r.stdout}\n{r.stderr}'
empty_str, waited_ms = r.stdout.strip().split()
waited_ms = int(waited_ms)
assert empty_str == 'true', f'expected no readiness events at all, got events.is_empty()={empty_str!r}'
assert waited_ms >= 250, f'with nothing ready, poll should park for close to the 300ms timeout, got {waited_ms}ms'
print(f'mio_poll_times_out_with_nothing_ready: parked for {waited_ms}ms with no readiness event at all — nothing was ever written to the socket')

# ---- 3. tokio::time::sleep actually wakes close to its deadline, not immediately and not ----
# ---- long after — the timer driver's own wake cycle, measured directly. ----
r = cargo_run('sleep_actually_wakes_at_deadline')
assert r.returncode == 0, f'sleep_actually_wakes_at_deadline should build and run:\n{r.stdout}\n{r.stderr}'
elapsed_ms = int(r.stdout.strip())
assert 190 <= elapsed_ms < 500, f'sleep(200ms) should wake close to its deadline, got {elapsed_ms}ms'
print(f'sleep_actually_wakes_at_deadline: a 200ms sleep woke at {elapsed_ms}ms — the timer driver fired close to the real deadline, not early and not long after')

print('all i-o-time-drivers examples pass')
