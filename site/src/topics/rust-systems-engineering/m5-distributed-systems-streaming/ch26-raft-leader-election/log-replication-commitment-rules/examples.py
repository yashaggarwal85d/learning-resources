"""Every example shown in the "Log replication and commitment rules"
reel, compiled and run. Run: python3 examples.py (CI runs it too).
Needs rustc >= 1.85 (edition 2024; the pinned CI toolchain is 1.97.0)
and cargo on PATH. This example builds a real AppendEntries-shaped
replication call on top of the previous topic's own elected leader,
and measures the paper's own conflict-repair rule and its own
commitment rule (counting replicas only from the leader's own current
term). Rust sources live in examples/runtime-demo/ next to this file;
every path is resolved from __file__."""
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


replication_bin = cargo_build('log_replication_commitment_rules')
out = parse(run(replication_bin))

# ---- 1. Conflict repair genuinely finds the real common prefix and ----
# ---- overwrites a follower's divergent suffix exactly, with no ----
# ---- silently corrupted index, and the follower's own commit index ----
# ---- genuinely catches up to the leader's. ----
assert out['a_conflict_repair_genuinely_finds_the_real_common_prefix'] == 'true', \
    "conflict repair should genuinely find the real common prefix and overwrite the follower's divergent suffix exactly"
print("log_replication_commitment_rules: conflict repair genuinely found the real common prefix and overwrote the follower's divergent suffix, with no index silently corrupted")

# ---- 2. An entry from a previous term, replicated to a real majority, ----
# ---- is genuinely not committed by counting replicas alone (the ----
# ---- Figure 8 hazard). ----
assert out['b_a_majority_replicated_previous_term_entry_is_genuinely_not_committed_alone'] == 'true', \
    'an entry from a previous term, even on a real majority, should genuinely not be committed by counting replicas alone'
print('log_replication_commitment_rules: an entry from a previous term, even on a real majority, was genuinely not committed by counting replicas alone')

# ---- 3. Once the leader also replicates a real entry from its own ----
# ---- current term to the identical majority, that entry genuinely ----
# ---- commits, and the earlier entry commits indirectly with it. ----
assert out['c_a_current_term_entry_genuinely_commits_the_earlier_entry_indirectly'] == 'true', \
    "a current-term entry on a real majority should genuinely commit, and commit the earlier entry indirectly with it"
print("log_replication_commitment_rules: a current-term entry on the identical real majority genuinely committed, and committed the earlier entry indirectly with it")

print('all log-replication-commitment-rules examples pass')
