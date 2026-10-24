"""Every example shown in the "Leader election, terms, and PreVote" reel,
compiled and run. Run: python3 examples.py (CI runs it too). Needs
rustc >= 1.85 (edition 2024; the pinned CI toolchain is 1.97.0) and
cargo on PATH. This example builds a real toy cluster of nodes holding
a real election under terms and real deterministic "randomized"
timeouts, and measures the paper's own up-to-date-log voting rule and
a real PreVote round against a partitioned node rejoining. Rust
sources live in examples/runtime-demo/ next to this file; every path
is resolved from __file__."""
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


election_bin = cargo_build('leader_election_log_up_to_date_voting')
out = parse(run(election_bin))

# ---- 1. A real election among healthy, identical logs genuinely elects ----
# ---- the node whose real, deterministic timeout fired first. ----
assert out['a_election_genuinely_elects_the_fastest_timed_out_candidate'] == 'true', \
    'the election should genuinely elect the node whose randomized timeout fired first, and that node should genuinely win a real majority'
print('leader_election_log_up_to_date_voting: a real election among healthy, identical logs genuinely elected the node whose real timeout fired first')

# ---- 2. An out-of-date candidate's own vote request is genuinely ----
# ---- rejected by the up-to-date-log voting rule, and genuinely loses. ----
assert out['b_out_of_date_candidate_genuinely_loses_the_election'] == 'true', \
    "an out-of-date candidate's own vote request should be genuinely rejected by the up-to-date-log voting rule"
print('leader_election_log_up_to_date_voting: an out-of-date candidate genuinely lost the election, rejected by the real up-to-date-log voting rule')

# ---- 3. A real PreVote round genuinely stops the exact disruption that ----
# ---- genuinely happens without it, on the identical partitioned node. ----
assert out['c_prevote_genuinely_stops_the_disruption_that_happens_without_it'] == 'true', \
    "PreVote should genuinely stop the disruption that the identical partitioned node would otherwise genuinely cause"
print('leader_election_log_up_to_date_voting: a real PreVote round genuinely stopped the disruption that the identical partitioned node genuinely caused without it')

print('all leader-election-terms-prevote examples pass')
