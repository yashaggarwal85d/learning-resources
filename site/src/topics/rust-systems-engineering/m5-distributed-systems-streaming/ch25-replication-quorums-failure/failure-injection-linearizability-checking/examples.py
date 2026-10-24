"""Every example shown in the "Failure injection and linearizability
checking" reel, compiled and run. Run: python3 examples.py (CI runs it
too). Needs rustc >= 1.85 (edition 2024; the pinned CI toolchain is
1.97.0) and cargo on PATH. This example injects two real, independent
failures together (a delayed acknowledgement and a duplicated message)
into a tiny replicated register, records the resulting real history of
reads and writes, and runs a real linearizability checker, built by
brute-force enumeration over every candidate total order, against it.
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


checker_bin = cargo_build('failure_injection_linearizability_checker')
out = parse(run(checker_bin))

# ---- 1. The history gathered while two real, independent failures ----
# ---- (a delayed acknowledgement and a duplicated message) run ----
# ---- together is genuinely not linearizable. ----
assert out['a_failure_history_is_genuinely_not_linearizable'] == 'true', \
    'a history containing a genuinely stale, delayed-ack read should genuinely fail the linearizability check'
print('failure_injection_linearizability_checker: the history gathered under both injected failures was genuinely found not linearizable')

# ---- 2. Fixing only the delayed acknowledgement (letting the replica ----
# ---- catch up before the read) makes the identical history genuinely ----
# ---- linearizable, even with the duplicated-message failure still present. ----
assert out['b_fixing_the_stale_read_makes_history_genuinely_linearizable'] == 'true', \
    'removing the delayed-ack staleness should make the history genuinely linearizable'
print('failure_injection_linearizability_checker: fixing only the delayed-ack staleness made the history genuinely linearizable, even with the duplicated-message failure still present')

# ---- 3. A read genuinely concurrent with a write is still genuinely ----
# ---- linearizable, and the checker's own brute-force enumeration finds ----
# ---- exactly the real number of real-time-respecting total orders. ----
assert out['c_concurrent_pair_history_is_genuinely_linearizable'] == 'true', \
    'a genuinely concurrent read/write pair with a consistent read value should be genuinely linearizable'
assert out['d_precedence_respecting_count_matches_the_real_order_structure'] == 'true', \
    'the count of real-time-respecting total orders should match the real order structure of each history'
print('failure_injection_linearizability_checker: a genuinely concurrent read/write pair was genuinely linearizable, and the checker found exactly the real number of real-time-respecting total orders in every history')

# ---- 4. The checker names the actual, delayed-ack read as the real ----
# ---- violation, not the merely-also-injected duplicated-message read. ----
assert out['e_checker_names_the_delayed_ack_read_not_the_duplicate_message_read'] == 'true', \
    'the checker should name the delayed-ack read, not the idempotent duplicated-message read, as the real violation'
print('failure_injection_linearizability_checker: the checker named the real, delayed-ack violation directly, not the idempotent duplicated-message read that happened to cause no actual problem')

print('all failure-injection-linearizability-checking examples pass')
