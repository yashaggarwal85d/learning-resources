"""Every example shown in the "Undefined behavior: validity, provenance,
aliasing" reel, compiled and run. Run: python3 examples.py (CI runs it
too). Needs rustc >= 1.85 (edition 2024; the pinned CI toolchain is
1.97.0) and cargo on PATH. This example never constructs a genuinely
invalid bool, a genuinely dangling reference, or a pointer used outside
its own provenance: undefined behavior is not something a correct
measurement can observe, so every claim here is checked as a real, safe,
deterministic rule applied directly (a validity predicate run over every
possible byte, an address check run over a fixed candidate list, and a
real strict-provenance address round trip that stays inside its own
allocation). Rust sources live in examples/runtime-demo/ next to this
file; every path is resolved from __file__."""
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


bin_path = cargo_build('validity_and_provenance_are_rules_not_bit_patterns')
out = parse(run(bin_path))

# ---- 1. Of 256 possible byte patterns, exactly 2 genuinely pass bool's ----
# ---- own validity rule. ----
assert out['a_only_two_of_the_256_real_byte_patterns_genuinely_pass_bools_own_validity_rule'] == 'true', \
    'exactly 2 of 256 byte patterns should genuinely pass the bool validity rule'
print('validity_and_provenance_are_rules_not_bit_patterns: exactly 2 of 256 real byte patterns genuinely pass the bool validity rule')

# ---- 2. Of 6 candidate addresses, exactly 3 genuinely pass both the ----
# ---- non-null and the alignment check for a type of alignment 4. ----
assert out['b_exactly_three_of_the_six_real_candidate_addresses_genuinely_pass_both_checks'] == 'true', \
    'exactly 3 of the 6 candidate addresses should genuinely pass both checks'
print('validity_and_provenance_are_rules_not_bit_patterns: exactly 3 of the 6 real candidate addresses genuinely pass both checks')

# ---- 3. The real addr()/with_addr() round trip genuinely recovers the ----
# ---- exact correct value, inside the pointer's own provenance. ----
assert out['c_the_real_addr_with_addr_round_trip_genuinely_recovers_the_exact_correct_value'] == 'true', \
    'the addr()/with_addr() round trip should genuinely recover the exact correct value'
print('validity_and_provenance_are_rules_not_bit_patterns: the real addr()/with_addr() round trip genuinely recovered the exact correct value')

print('all undefined-behavior-validity-provenance examples pass')
