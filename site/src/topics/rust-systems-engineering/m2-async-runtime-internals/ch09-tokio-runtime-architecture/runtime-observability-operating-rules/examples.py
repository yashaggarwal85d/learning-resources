"""Every example shown in the "Runtime observability and operating rules" reel, compiled and run.
Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85 (edition 2024; the pinned CI
toolchain is 1.97.0) and cargo on PATH; these examples need the real tokio crate.
Rust sources live in examples/runtime-demo/ next to this file; every path is resolved from
__file__."""
import os
import shutil
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
RUSTC = shutil.which('rustc')
CARGO = shutil.which('cargo')
assert RUSTC, 'rustc is required (CI installs 1.97.0 with rustup)'
assert CARGO, 'cargo is required: these examples need the real tokio crate'
ver = subprocess.run([RUSTC, '--version'], capture_output=True, text=True).stdout.strip()
print(f'using {ver}')

CRATE = os.path.join(HERE, 'examples', 'runtime-demo')


def cargo_run(name, timeout=60):
    return subprocess.run([CARGO, 'run', '--release', '--quiet', '--bin', name], cwd=CRATE,
                           capture_output=True, text=True, timeout=timeout)


# ---- 1. A Semaphore with 4 permits genuinely bounds concurrency: 20 tasks contending for it ----
# ---- never run more than 4 at once, and the semaphore reports itself fully saturated. ----
r = cargo_run('semaphore_bounds_concurrency')
assert r.returncode == 0, f'semaphore_bounds_concurrency should build and run:\n{r.stdout}\n{r.stderr}'
available, max_seen = r.stdout.strip().split()
available, max_seen = int(available), int(max_seen)
assert available == 0, f'with 20 tasks contending for 4 permits, the semaphore should report 0 available, got {available}'
assert 2 <= max_seen <= 4, f'the semaphore should let between 2 and 4 tasks run at once, got {max_seen}'
print(f'semaphore_bounds_concurrency: 20 tasks contending for 4 permits never ran more than {max_seen} at once, and the semaphore reported 0 permits available')

# ---- 2. Runtime metrics make a real task backlog visible: spawning 500 tasks onto a single ----
# ---- worker leaves most of them still queued the instant metrics are sampled. ----
r = cargo_run('global_queue_depth_reveals_backlog')
assert r.returncode == 0, f'global_queue_depth_reveals_backlog should build and run:\n{r.stdout}\n{r.stderr}'
depth = int(r.stdout.strip())
assert depth > 50, f'runtime metrics should report a real backlog after spawning 500 tasks onto one worker, got {depth}'
print(f'global_queue_depth_reveals_backlog: runtime metrics reported {depth} tasks still queued right after spawning 500 of them onto a single worker')

# ---- 3. A bounded channel genuinely refuses a send once full, and genuinely accepts one ----
# ---- again once capacity is freed by a receive — not aspirational, actually enforced. ----
r = cargo_run('bounded_channel_applies_backpressure')
assert r.returncode == 0, f'bounded_channel_applies_backpressure should build and run:\n{r.stdout}\n{r.stderr}'
refused, after_free = r.stdout.strip().split()
assert refused == 'true', f'a send into an already-full bounded channel should be refused, got refused={refused!r}'
assert after_free == '3', f'a send after capacity was freed by recv should go through, got {after_free!r}'
print('bounded_channel_applies_backpressure: a bounded channel of capacity one refused a second send while full, and accepted a new one the moment capacity was freed')

print('all runtime-observability-operating-rules examples pass')
