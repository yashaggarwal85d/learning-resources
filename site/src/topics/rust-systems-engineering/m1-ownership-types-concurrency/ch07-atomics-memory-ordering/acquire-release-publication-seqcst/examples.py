"""Every example shown in the "Acquire/release publication, and when SeqCst is required"
reel, compiled and run. Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85
(edition 2024; the pinned CI toolchain is 1.97.0) and cargo on PATH for the loom
model-checked examples. Rust sources live in examples/*.rs and examples/ordering-check/
next to this file; every path is resolved from __file__."""
import os
import re
import shutil
import subprocess
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
RUSTC = shutil.which('rustc')
CARGO = shutil.which('cargo')
assert RUSTC, 'rustc is required (CI installs 1.97.0 with rustup)'
assert CARGO, 'cargo is required for the loom model-checked examples'
ver = subprocess.run([RUSTC, '--version'], capture_output=True, text=True).stdout.strip()
m = re.match(r'rustc (\d+)\.(\d+)\.(\d+)', ver)
assert m and (int(m[1]), int(m[2])) >= (1, 85), f'rustc >= 1.85 (edition 2024) needed, got {ver!r}'
print(f'using {ver}')

TMP = tempfile.TemporaryDirectory()
WD = TMP.name


def compile_bin(name):
    out = os.path.join(WD, name)
    cmd = [RUSTC, '--edition', '2024', '--color', 'never', '-O', os.path.join('examples', name + '.rs'), '-o', out]
    r = subprocess.run(cmd, cwd=HERE, capture_output=True, text=True)
    assert r.returncode == 0, f'{name}.rs should compile:\n{r.stderr}'
    return out


def run(binary, timeout=30):
    r = subprocess.run([binary], capture_output=True, text=True, timeout=timeout)
    assert r.returncode == 0, f'{binary} exited {r.returncode}: {r.stderr}'
    return r.stdout


def loom_bin(name, cwd):
    return subprocess.run([CARGO, 'run', '--release', '--quiet', '--bin', name], cwd=cwd,
                           capture_output=True, text=True, timeout=180)


ORDERING_CHECK = os.path.join(HERE, 'examples', 'ordering-check')

# ---- 1. Relaxed is still the right choice for independent counters. ----
binary = compile_bin('relaxed_independent_counters')
out = run(binary).strip()
assert out == '400000', f'eight threads * fifty thousand relaxed fetch_adds to independent counters, got {out}'
print(f'relaxed_independent_counters.rs: no publication between threads, so Relaxed alone lands exactly: {out}')

# ---- 2. Release/Acquire fixes the previous topic's publication race. ----
r = loom_bin('release_acquire_fix', ORDERING_CHECK)
assert r.returncode == 0, f'Release store + Acquire load should close the race loom found last topic:\n{r.stdout}\n{r.stderr}'
assert 'no violation found' in r.stdout
print('ordering-check/release_acquire_fix: Release on the flag store, Acquire on the flag load — loom finds no interleaving where the data is still 0')

# ---- 3. Predict: fixing only the write side is not enough. ----
r = loom_bin('half_fixed_still_races', ORDERING_CHECK)
assert r.returncode != 0, f'a Relaxed load paired with a Release store should still race, but loom found no violation:\n{r.stdout}'
assert 'left: 0' in r.stderr and 'right: 42' in r.stderr, f'expected the assertion to fail seeing 0 instead of 42:\n{r.stderr}'
print('ordering-check/half_fixed_still_races: the store is Release but the load stayed Relaxed — the pairing is broken and loom still finds the race')

# ---- 4. Store-buffering litmus test: Release/Acquire is not enough either. ----
r = loom_bin('store_buffering_acqrel', ORDERING_CHECK)
assert r.returncode != 0, f'the Dekker-style store-load pattern should still let both loads see 0 under Release/Acquire:\n{r.stdout}'
assert 'both loads saw 0' in r.stderr, f'expected the store-buffering assertion to fail:\n{r.stderr}'
print('ordering-check/store_buffering_acqrel: two threads each store then load the other\'s flag with Release/Acquire — loom finds both loads seeing 0 at once')

# ---- 5. The same litmus test under SeqCst: loom cannot be trusted here. ----
# loom's own test suite documents this exact store-buffering shape as a known gap:
# loom/tests/spec.rs's test_seq_cst is marked #[ignore] because loom can execute a
# permutation that is not actually legal under SeqCst. Running loom on this binary
# would teach the wrong lesson, so examples.py only proves the code type-checks and
# cites the standard library's and the nomicon's own stated SeqCst guarantee instead
# (see SOURCES.md) for why the total order rules "both loads see 0" out.
r = subprocess.run([CARGO, 'check', '--quiet', '--bin', 'store_buffering_seqcst'], cwd=ORDERING_CHECK,
                    capture_output=True, text=True, timeout=180)
assert r.returncode == 0, f'store_buffering_seqcst.rs should type-check:\n{r.stderr}'
print('ordering-check/store_buffering_seqcst: compiles; the guarantee that this rules out "both loads see 0" is the source\'s own stated total-order property, not a loom model-check — loom\'s own tests mark this exact shape as a known modeling gap')

# ---- 6. A fence can carry the Acquire/Release handoff instead of the atomic op. ----
binary = compile_bin('fence_spinlock')
out = run(binary).strip()
assert out == '100000', f'four threads * twenty-five thousand locked increments should land exactly, got {out}'
print(f'fence_spinlock.rs: fence(Acquire) after the lock, Release store in unlock, guarding a plain counter: {out}')

print('all acquire-release-publication-seqcst examples pass')
