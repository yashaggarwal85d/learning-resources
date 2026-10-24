"""Every example shown in the "Acknowledgement points define durability"
reel, compiled and run. Run: python3 examples.py (CI runs it too).
Needs rustc >= 1.85 (edition 2024; the pinned CI toolchain is 1.97.0)
and cargo on PATH. This example builds a real toy leader-plus-replicas
log with three distinct acknowledgement policies, injects a real node
destruction immediately after each policy's own acknowledgement point,
and measures which policies genuinely lose the acknowledged write.
Rust sources live in examples/runtime-demo/ next to this file; every
path is resolved from __file__."""
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


ack_bin = cargo_build('acknowledgement_point_durability_tradeoff')
out = parse(run(ack_bin))

# ---- 1. "Accepted by a subset" (the leader alone) genuinely loses the ----
# ---- write once the leader is destroyed. ----
assert out['a_subset_ack_genuinely_loses_the_write_on_leader_destruction'] == 'true', \
    'a write acknowledged by a subset smaller than a quorum should genuinely be lost when the leader is destroyed'
print('acknowledgement_point_durability_tradeoff: a write acknowledged by the leader alone (a subset smaller than a quorum) was genuinely lost once the leader was destroyed')

# ---- 2. Even a write durably recorded by the leader alone genuinely ----
# ---- loses it too, since it never reached any other node. ----
assert out['b_leader_only_durable_ack_also_genuinely_loses_the_write'] == 'true', \
    'a write durably recorded by the leader alone should also genuinely be lost when the leader is destroyed'
print('acknowledgement_point_durability_tradeoff: a write durably recorded by the leader alone was also genuinely lost once the leader was destroyed, since it never reached any other node')

# ---- 3. A write persisted by a real quorum genuinely survives the ----
# ---- identical leader destruction, and the quorum's own threshold ----
# ---- matches the real majority arithmetic exactly. ----
assert out['c_quorum_persisted_ack_genuinely_survives_leader_destruction'] == 'true', \
    'a write persisted by a real quorum should genuinely survive the identical leader destruction'
assert out['d_quorum_threshold_matches_real_majority_arithmetic'] == 'true', \
    "the quorum's own threshold should match the real majority arithmetic exactly"
quorum_threshold = out['quorum_threshold']
print(f'acknowledgement_point_durability_tradeoff: a write persisted by a real quorum of {quorum_threshold} nodes genuinely survived the identical leader destruction, matching the real majority arithmetic exactly')

print('all acknowledgement-points-define-durability examples pass')
