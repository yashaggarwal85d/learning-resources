"""Every example shown in the "Idempotency keys for distributed APIs"
reel, compiled and run. Run: python3 examples.py (CI runs it too).
Needs rustc >= 1.85 (edition 2024; the pinned CI toolchain is 1.97.0)
and cargo on PATH. This example builds a real toy idempotency-key
store, scoped per resource and bounded by a real TTL, and measures
that it genuinely replays a stored response for a duplicate request
and genuinely catches a real race between two concurrent retries
carrying the identical key. Rust sources live in examples/runtime-demo/
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


store_bin = cargo_build('idempotency_key_scope_ttl_and_replay')
out = parse(run(store_bin))

# ---- 1. A key's own scope genuinely keeps two otherwise-identical keys ----
# ---- from colliding across different resources. ----
assert out['a_key_scope_genuinely_keeps_identical_keys_from_colliding_across_resources'] == 'true', \
    "a key's own scope should genuinely keep identical keys from colliding across resources"
print("idempotency_key_scope_ttl_and_replay: a key's own scope genuinely kept identical keys from colliding across resources")

# ---- 2. A duplicate request within the key's own TTL genuinely replays ----
# ---- the exact stored response, without running the real side effect ----
# ---- again. ----
assert out['b_a_duplicate_within_ttl_genuinely_replays_the_response_without_rerunning_the_side_effect'] == 'true', \
    'a duplicate request within TTL should genuinely replay the response without rerunning the side effect'
print('idempotency_key_scope_ttl_and_replay: a duplicate request within TTL genuinely replayed the response without rerunning the side effect')

# ---- 3. A genuine race between two concurrent retries carrying the ----
# ---- identical key is genuinely caught, so the real side effect still ----
# ---- runs exactly once. ----
assert out['c_a_genuine_race_is_genuinely_caught_so_the_side_effect_still_runs_exactly_once'] == 'true', \
    'a genuine race between two concurrent retries should genuinely be caught, so the side effect still runs exactly once'
print('idempotency_key_scope_ttl_and_replay: a genuine race between two concurrent retries was genuinely caught, so the side effect still ran exactly once')

print('all idempotency-keys-distributed-apis examples pass')
