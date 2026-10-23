"""Every example shown in the "Work stealing and cooperative budgeting" reel, compiled and run.
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


# ---- 1. 200 tasks, all spawned from the one worker running block_on, end up running on ----
# ---- more than one real thread: only possible if some were stolen from that worker's queue. ----
r = cargo_run('tasks_get_stolen')
assert r.returncode == 0, f'tasks_get_stolen should build and run:\n{r.stdout}\n{r.stderr}'
distinct = int(r.stdout.strip())
assert distinct > 1, f'expected tasks to land on more than one real worker thread via stealing, got {distinct}'
print(f'tasks_get_stolen: 200 tasks spawned from one worker ran across {distinct} real worker threads')

# ---- 2. An always-ready hot loop is still forced to yield by its cooperative budget, ----
# ---- letting a trivial sibling task run well before the loop itself finishes. ----
r = cargo_run('budget_forces_yield')
assert r.returncode == 0, f'budget_forces_yield should build and run:\n{r.stdout}\n{r.stderr}'
sibling_ms, loop_ms = (int(x) for x in r.stdout.strip().split())
assert sibling_ms < loop_ms / 2, f'sibling should run well before the hot loop finishes, got sibling={sibling_ms}ms loop={loop_ms}ms'
print(f'budget_forces_yield: sibling ran after {sibling_ms}ms while the hot loop, forced to yield periodically, took {loop_ms}ms in total')

# ---- 3. The identical hot loop wrapped in task::unconstrained opts out of the budget ----
# ---- entirely: the sibling, queued behind it, only runs once the loop itself finishes. ----
r = cargo_run('unconstrained_starves_sibling')
assert r.returncode == 0, f'unconstrained_starves_sibling should build and run:\n{r.stdout}\n{r.stderr}'
sibling_ms, loop_ms = (int(x) for x in r.stdout.strip().split())
assert abs(sibling_ms - loop_ms) < 10, f'sibling should land within a few ms of the loop finishing, got sibling={sibling_ms}ms loop={loop_ms}ms'
print(f'unconstrained_starves_sibling: sibling ran at {sibling_ms}ms, the same moment the never-yielding loop finished at {loop_ms}ms')

print('all work-stealing-cooperative-budgeting examples pass')
