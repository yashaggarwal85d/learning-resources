"""Every example shown in the "Structured shutdown with tokens and trackers" reel, compiled
and run. Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85 (edition 2024; the
pinned CI toolchain is 1.97.0) and cargo on PATH; these examples need the real tokio and
tokio-util crates. Rust sources live in examples/runtime-demo/ next to this file; every path
is resolved from __file__."""
import os
import shutil
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
RUSTC = shutil.which('rustc')
CARGO = shutil.which('cargo')
assert RUSTC, 'rustc is required (CI installs 1.97.0 with rustup)'
assert CARGO, 'cargo is required: these examples need the real tokio and tokio-util crates'
ver = subprocess.run([RUSTC, '--version'], capture_output=True, text=True).stdout.strip()
print(f'using {ver}')

CRATE = os.path.join(HERE, 'examples', 'runtime-demo')


def cargo_run(name, timeout=60):
    return subprocess.run([CARGO, 'run', '--release', '--quiet', '--bin', name], cwd=CRATE,
                           capture_output=True, text=True, timeout=timeout)


# ---- 1. Once a CancellationToken signals shutdown, every new submission is rejected ----
# ---- outright; nothing already accepted beforehand is affected. ----
r = cargo_run('shutdown_rejects_new_after_signal')
assert r.returncode == 0, f'shutdown_rejects_new_after_signal should build and run:\n{r.stdout}\n{r.stderr}'
accepted_before, accepted_after, rejected_count = (int(x) for x in r.stdout.strip().split())
assert accepted_before == 3, f'3 jobs should have been accepted before shutdown, got {accepted_before}'
assert accepted_after == accepted_before, f'no new job should be accepted once shutdown is signalled, got {accepted_after}'
assert rejected_count == 5, f'every post-shutdown submission should be rejected, got {rejected_count}'
print(f'shutdown_rejects_new_after_signal: {accepted_before} jobs accepted before shutdown, all {rejected_count} submissions after the signal were rejected outright')

# ---- 2. A TaskTracker's wait() does not return until every tracked job has actually ----
# ---- completed, not merely been signalled to stop. ----
r = cargo_run('tracker_waits_for_every_accepted_job')
assert r.returncode == 0, f'tracker_waits_for_every_accepted_job should build and run:\n{r.stdout}\n{r.stderr}'
finished = int(r.stdout.strip())
assert finished == 8, f'wait() should not return until every one of the 8 jobs has completed, got {finished}'
print(f'tracker_waits_for_every_accepted_job: wait() only returned once all {finished} accepted jobs had actually finished')

# ---- 3. Waiting for every job with a real deadline genuinely times out when a straggler ----
# ---- outlives it, stopping close to the deadline rather than hanging indefinitely. ----
r = cargo_run('shutdown_meets_its_deadline')
assert r.returncode == 0, f'shutdown_meets_its_deadline should build and run:\n{r.stdout}\n{r.stderr}'
timed_out, elapsed_ms = r.stdout.strip().split()
elapsed_ms = int(elapsed_ms)
assert timed_out == 'true', f'waiting past a straggler job should time out, got timed_out={timed_out!r}'
assert 300 <= elapsed_ms < 500, f'the wait should stop close to its 300ms deadline, got {elapsed_ms}ms'
print(f'shutdown_meets_its_deadline: a straggler job outlived the 300ms deadline, and the wait genuinely stopped at {elapsed_ms}ms instead of hanging')

print('all structured-shutdown-tokens-trackers examples pass')
