"""Every example shown in the "Safe byte-level views of structs" reel, compiled and run.
Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85 (edition 2024; the pinned CI
toolchain is 1.97.0) and cargo, for the two examples that need the bytemuck crate (fetched from
crates.io on first build). The bare-rustc endianness example lives in examples/*.rs; the
cargo-driven ones live in examples/src/bin/, built and run as `cargo run`/`cargo build --bin <name>`."""
import os
import re
import shutil
import subprocess
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
RUSTC = shutil.which('rustc')
assert RUSTC, 'rustc is required (CI installs 1.97.0 with rustup)'
ver = subprocess.run([RUSTC, '--version'], capture_output=True, text=True).stdout.strip()
m = re.match(r'rustc (\d+)\.(\d+)\.(\d+)', ver)
assert m and (int(m[1]), int(m[2])) >= (1, 85), f'rustc >= 1.85 (edition 2024) needed, got {ver!r}'
print(f'using {ver}')

TMP = tempfile.TemporaryDirectory()
WD = TMP.name


def compile_bin(name, extra=()):
    out = os.path.join(WD, name)
    cmd = [RUSTC, '--edition', '2024', '--color', 'never', *extra, os.path.join('examples', name + '.rs'), '-o', out]
    r = subprocess.run(cmd, cwd=HERE, capture_output=True, text=True)
    assert r.returncode == 0, f'{name}.rs should compile:\n{r.stderr}'
    return out


def run(binary, timeout=60):
    r = subprocess.run([binary], capture_output=True, text=True, timeout=timeout)
    assert r.returncode == 0, f'{binary} exited {r.returncode}: {r.stderr}'
    return r.stdout


def cargo_run(name, timeout=120):
    r = subprocess.run(['cargo', 'run', '-q', '--bin', name], cwd=os.path.join(HERE, 'examples'), capture_output=True, text=True, timeout=timeout)
    assert r.returncode == 0, f'{name} should build and run:\n{r.stderr}'
    return r.stdout


def cargo_build_fail(name, timeout=120):
    r = subprocess.run(['cargo', 'build', '-q', '--bin', name], cwd=os.path.join(HERE, 'examples'), capture_output=True, text=True, timeout=timeout)
    return r


# ---- 1. A padding-free repr(C) header safely derives Pod/Zeroable; from_bytes needs no unsafe. ----
out = cargo_run('bytemuck_header_safe')
version, flags, length, seq = (int(x) for x in out.split())
assert (version, flags, length, seq) == (1, 0, 10, 42), out
print(f'bytemuck_header_safe.rs: a raw byte buffer read as a Header with no unsafe code at all — version={version} flags={flags} length={length} seq={seq}')

# ---- 2. The same fields, reordered to leave real padding, refuses to derive Pod at all. ----
r = cargo_build_fail('bytemuck_padded_header_fails')
assert r.returncode != 0, 'deriving Pod on a struct with padding should fail to compile'
assert 'padding' in r.stderr, f'expected the derive to name padding as the reason, got:\n{r.stderr}'
print('bytemuck_padded_header_fails.rs: deriving Pod on the padded field order refuses to compile, naming the padding itself as the reason')

# ---- 3. The same two wire bytes decode to two very different numbers depending on byte order. ----
binary = compile_bin('endianness_mismatch')
out = run(binary)
correct, wrong_if_native = (int(x) for x in out.split())
assert correct == 10000, out
assert wrong_if_native != correct, 'expected reading wire bytes in the platform’s native order to disagree with the correct big-endian decode on this (little-endian) sandbox'
print(f'endianness_mismatch.rs: the same two wire bytes decode to {correct} read as big-endian (correct) and {wrong_if_native} read in this platform’s native order (wrong)')

print('\nAll safe byte-level view examples passed.')
