"""Every example shown in the "Tasks multiplexed on worker threads" reel, compiled and run.
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


# ---- 1. A worker thread fully occupied by a non-yielding blocking call stalls every other ----
# ---- task that also needs that same worker, measured directly, not merely described. ----
r = cargo_run('blocking_stalls_worker')
assert r.returncode == 0, f'blocking_stalls_worker should build and run:\n{r.stdout}\n{r.stderr}'
waited_ms = int(r.stdout.strip())
assert waited_ms >= 250, f'a task queued behind a 300ms blocking call on the only worker should wait close to 300ms, got {waited_ms}ms'
print(f'blocking_stalls_worker: a trivial task queued behind one blocking call waited {waited_ms}ms for the single worker to free up')

# ---- 2. tokio::spawn refuses a !Send future outright: a real compile failure. ----
r = subprocess.run([CARGO, 'build', '--release', '--quiet', '--bin', 'not_send_rejected_by_spawn'],
                   cwd=CRATE, capture_output=True, text=True, timeout=60)
assert r.returncode != 0, 'not_send_rejected_by_spawn.rs should fail to compile: tokio::spawn requires Send'
assert 'cannot be sent between threads safely' in r.stderr, f'expected the exact "cannot be sent between threads safely" diagnostic, got:\n{r.stderr}'
assert 'is not `Send`' in r.stderr
print('not_send_rejected_by_spawn.rs: fails to compile — tokio::spawn requires the spawned future to be Send, and an Rc held across the await makes it not Send')

# ---- 3. LocalSet runs that identical !Send future for real, on the one thread that calls it. ----
r = cargo_run('localset_runs_not_send')
assert r.returncode == 0, f'localset_runs_not_send should build and run:\n{r.stdout}\n{r.stderr}'
out = r.stdout.strip()
assert out == 'not sent anywhere', f'expected the Rc-held string, got {out!r}'
print(f'localset_runs_not_send: {out} — the identical shape of !Send future that tokio::spawn refuses runs for real through spawn_local on a LocalSet')

print('all tasks-multiplexed-on-worker examples pass')
