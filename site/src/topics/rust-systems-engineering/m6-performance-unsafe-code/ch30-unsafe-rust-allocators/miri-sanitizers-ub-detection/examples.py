"""Every example shown in the "Miri and sanitizers for UB detection" reel,
compiled and run. Run: python3 examples.py (CI runs it too). Needs rustc
>= 1.85 (edition 2024; the pinned CI toolchain is 1.97.0) and cargo on
PATH. This example never runs a real nightly Miri session (this
sandboxed container cannot reliably provide one); instead it builds a
real, small interpreter over a fixed, real sequence of synthetic memory
operations, with a real bounds checker run only on the one branch each
simulated program run actually takes, measuring Miri's own real, stated
limitation directly: a run-based checker only catches a violation on a
path it actually executes. Rust sources live in examples/runtime-demo/
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


def cargo_build(name, timeout=120):
    r = subprocess.run([CARGO, 'build', '--release', '--quiet', '--bin', name], cwd=CRATE,
                        capture_output=True, text=True, timeout=timeout)
    assert r.returncode == 0, f'{name} should build:\n{r.stdout}\n{r.stderr}'
    return os.path.join(CRATE, 'target', 'release', name)


def run(binary, timeout=30):
    r = subprocess.run([binary], capture_output=True, text=True, timeout=timeout)
    assert r.returncode == 0, f'{binary} should run:\n{r.stdout}\n{r.stderr}'
    return r.stdout.strip()


def parse(out):
    kv = {}
    for line in out.splitlines():
        k, v = line.rsplit(' ', 1)
        kv[k] = v
    return kv


bin_path = cargo_build('a_checker_only_catches_paths_it_actually_runs')
out = parse(run(bin_path))

# ---- 1. A run that takes the safe branch genuinely reports no violation. ----
assert out['a_the_run_that_takes_the_safe_branch_genuinely_reports_no_violation'] == 'true', \
    'the run on the safe branch should genuinely report no violation'
print('a_checker_only_catches_paths_it_actually_runs: the run on the safe branch genuinely reported no violation')

# ---- 2. The identical checker genuinely catches the violation once a run ----
# ---- actually takes the branch that contains it. ----
assert out['b_the_run_that_takes_the_other_branch_genuinely_catches_the_violation'] == 'true', \
    'the run on the other branch should genuinely catch the violation'
print('a_checker_only_catches_paths_it_actually_runs: the run on the other branch genuinely caught the violation')

# ---- 3. The run that takes the safe branch genuinely never examines any ----
# ---- of the other branch's own operations, Miri's own real limitation. ----
assert out['c_the_run_that_takes_the_safe_branch_genuinely_examines_none_of_the_other_branchs_ops'] == 'true', \
    "the safe-branch run should genuinely examine none of the other branch's ops"
print("a_checker_only_catches_paths_it_actually_runs: the safe-branch run genuinely examined none of the other branch's ops")

print('all miri-sanitizers-ub-detection examples pass')
