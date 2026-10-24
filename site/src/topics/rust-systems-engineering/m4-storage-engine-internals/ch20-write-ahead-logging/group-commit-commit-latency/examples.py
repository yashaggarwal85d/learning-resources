"""Every example shown in the "Group commit and commit latency" reel,
compiled and run. Run: python3 examples.py (CI runs it too). Needs rustc
>= 1.85 (edition 2024; the pinned CI toolchain is 1.97.0) and cargo on
PATH. This example builds a real, minimal leader/follower group-commit
implementation over a discrete-tick simulation (no real threads or
sleeping, so every measurement is exactly reproducible). Rust sources
live in examples/runtime-demo/ next to this file; every path is resolved
from __file__."""
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


gc_bin = cargo_build('leader_follower_group_commit_latency')
out = parse(run(gc_bin))

# ---- 1. Group commit means one flush for the whole batch, not one per ----
# ---- transaction. ----
assert out['ungrouped_flushes_equal_the_transaction_count'] == 'true', 'committing without grouping should cost one flush per transaction'
assert out['grouped_commit_used_exactly_one_flush'] == 'true', 'group commit should genuinely use exactly one flush for the whole batch'
print('leader_follower_group_commit_latency: group commit genuinely used one flush for the whole batch, where committing without grouping cost one flush per transaction')

# ---- 2. Commit latency, not execution time, is what differs inside a ----
# ---- batch; the earliest-ready transaction waits the longest. ----
assert out['commit_latency_varies_though_execution_time_never_did'] == 'true', 'commit latency should genuinely differ across the batch even though every transaction did identical, instant work'
print('leader_follower_group_commit_latency: commit latency genuinely varied across the batch, even though every transaction\'s own execution time was identical')

# ---- 3. Asynchronous commit's own risk window is real and measurable. ----
assert out['async_commit_genuinely_loses_the_update_in_its_own_risk_window'] == 'true', 'a crash inside the async-commit risk window should genuinely reveal a false promise'
assert out['sync_commit_never_makes_a_false_promise_to_the_same_crash'] == 'true', 'the identical crash against a synchronous commit should never reveal a false promise'
print('leader_follower_group_commit_latency: the identical crash genuinely revealed a false promise only for the asynchronous commit, never for the synchronous one')

print('all group-commit-commit-latency examples pass')
