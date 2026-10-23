"""Every example shown in the "Atomicity versus ordering" reel, compiled and run.
Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85 (edition 2024; the pinned CI
toolchain is 1.97.0) and cargo on PATH for the loom model-checked example. Rust sources live in
examples/*.rs and examples/loom-check/ next to this file; every path is resolved from __file__."""
import os
import re
import shutil
import subprocess
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
RUSTC = shutil.which('rustc')
CARGO = shutil.which('cargo')
assert RUSTC, 'rustc is required (CI installs 1.97.0 with rustup)'
assert CARGO, 'cargo is required for the loom model-checked example'
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


# ---- 1. Atomicity: no torn updates, even under the weakest ordering. ----
binary = compile_bin('atomic_no_torn_updates')
out = run(binary).strip()
assert out == '400000', f'8 threads * 50000 relaxed fetch_adds should land exactly, got {out}'
print(f'atomic_no_torn_updates.rs: eight threads, fifty thousand relaxed increments each, landed exactly: {out}')

# ---- 2. Ordering: atomicity alone does not give a happens-before guarantee. ----
# loom explores every interleaving the memory model actually permits for Relaxed
# accesses, rather than relying on this one run's hardware behavior.
r = subprocess.run([CARGO, 'run', '--release', '--quiet'], cwd=os.path.join(HERE, 'examples', 'loom-check'),
                    capture_output=True, text=True, timeout=180)
assert r.returncode != 0, f'loom should find a violating interleaving for the Relaxed publication, but it exited 0:\n{r.stdout}'
assert 'left: 0' in r.stderr and 'right: 42' in r.stderr, f'expected the assertion to fail seeing 0 instead of 42:\n{r.stderr}'
print('loom-check/relaxed_publication_race: loom found a real interleaving where the reader saw the ready flag before the published value — ordering violated, even though every access was atomic')

print('all atomicity-versus-ordering examples pass')
