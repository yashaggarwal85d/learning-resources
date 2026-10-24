"""Every example shown in the "Delivery semantics and idempotent consumers"
reel, compiled and run. Run: python3 examples.py (CI runs it too).
Needs rustc >= 1.85 (edition 2024; the pinned CI toolchain is 1.97.0)
and cargo on PATH. This example builds a real consumer that applies a
side effect and commits its own offset as two separate steps, injects a
real crash between them, and measures the exact duplicate a naive
at-least-once consumer produces versus the exact fix a real idempotency
key (producer id, sequence number) provides. Rust sources live in
examples/runtime-demo/ next to this file; every path is resolved from
__file__."""
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


consumer_bin = cargo_build('idempotent_consumer_removes_duplicate_effect')
out = parse(run(consumer_bin))

# ---- 1. A naive at-least-once consumer genuinely produces a duplicate ----
# ---- side effect when it crashes between applying one and committing ----
# ---- its own offset. ----
assert out['a_naive_at_least_once_consumer_genuinely_produces_a_duplicate_side_effect'] == 'true', \
    'a naive at-least-once consumer should genuinely produce a duplicate side effect on crash'
print('idempotent_consumer_removes_duplicate_effect: the naive consumer genuinely produced a duplicate side effect on crash')

# ---- 2. A real idempotency key (producer id, sequence number) genuinely ----
# ---- removes that duplicate's own visible effect. ----
assert out['b_idempotent_consumer_genuinely_removes_the_duplicate_effect_using_the_real_idempotency_key'] == 'true', \
    "a real idempotency key should genuinely remove the duplicate's own visible effect"
print("idempotent_consumer_removes_duplicate_effect: the real idempotency key genuinely removed the duplicate's own visible effect")

# ---- 3. The redelivery itself genuinely still happens; only the ----
# ---- duplicate effect is removed, not the redelivery. ----
assert out['c_the_redelivery_itself_genuinely_still_happens_even_though_the_duplicate_effect_is_removed'] == 'true', \
    'the redelivery itself should still genuinely happen even though the duplicate effect is removed'
print('idempotent_consumer_removes_duplicate_effect: the redelivery itself genuinely still happened even though the duplicate effect was removed')

print('all delivery-semantics-idempotent-consumers examples pass')
