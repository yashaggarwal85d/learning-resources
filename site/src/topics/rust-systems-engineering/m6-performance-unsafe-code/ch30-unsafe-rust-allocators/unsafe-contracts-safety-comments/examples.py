"""Every example shown in the "Unsafe contracts and safety comments" reel,
compiled and run. Run: python3 examples.py (CI runs it too). Needs rustc
>= 1.85 (edition 2024; the pinned CI toolchain is 1.97.0) and cargo on
PATH. This example builds a real, documented unsafe safety contract, a
real safe guard that enforces it before ever delegating to the unsafe
code, and a real counter tracking how many times that unsafe code
actually ran. It never executes a real invalid case: undefined behavior
is not something a correct measurement can observe, so this topic's own
claims are checked entirely through the real guard's own measured
behavior, never through a genuine contract violation. Rust sources live
in examples/runtime-demo/ next to this file; every path is resolved from
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


contracts_bin = cargo_build('safety_contracts_bound_what_a_caller_can_trigger')
out = parse(run(contracts_bin))

# ---- 1. Every in-contract call genuinely returns the correct value. ----
assert out['a_every_in_contract_call_genuinely_returns_the_correct_value'] == 'true', \
    'every in-contract call should genuinely return the correct value'
print('safety_contracts_bound_what_a_caller_can_trigger: every in-contract call genuinely returned the correct value')

# ---- 2. The guard genuinely never invokes the unsafe function outside ----
# ---- its own documented contract. ----
assert out['b_the_guard_genuinely_never_invoked_the_unsafe_function_outside_its_contract'] == 'true', \
    'the guard should genuinely never invoke the unsafe function outside its own contract'
print('safety_contracts_bound_what_a_caller_can_trigger: the guard genuinely never invoked the unsafe function outside its own contract')

# ---- 3. An unguarded caller's own logic would genuinely violate the ----
# ---- identical documented contract, for the identical invalid input. ----
assert out['c_an_unguarded_caller_would_genuinely_violate_the_documented_contract_for_the_identical_input'] == 'true', \
    'an unguarded caller would genuinely violate the documented contract for the identical input'
print('safety_contracts_bound_what_a_caller_can_trigger: an unguarded caller would genuinely have violated the documented contract for the identical input')

print('all unsafe-contracts-safety-comments examples pass')
