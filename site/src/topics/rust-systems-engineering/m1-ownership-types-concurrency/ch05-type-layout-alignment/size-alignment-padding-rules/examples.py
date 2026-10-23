"""Every example shown in the "Size, alignment, and padding rules" reel, compiled and run.
Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85 (edition 2024; the pinned CI
toolchain is 1.97.0) and a `nightly` rustup toolchain (for the one example that needs
-Z randomize-layout, an unstable flag). Sources live in examples/*.rs."""
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


def compile_bin(name, extra=(), toolchain=None, out_suffix=''):
    out = os.path.join(WD, name + out_suffix)
    rustc = [RUSTC] if toolchain is None else [RUSTC, f'+{toolchain}']
    cmd = [*rustc, '--edition', '2024', '--color', 'never', *extra, os.path.join('examples', name + '.rs'), '-o', out]
    r = subprocess.run(cmd, cwd=HERE, capture_output=True, text=True)
    return r, out


def run(binary, timeout=60):
    r = subprocess.run([binary], capture_output=True, text=True, timeout=timeout)
    assert r.returncode == 0, f'{binary} exited {r.returncode}: {r.stderr}'
    return r.stdout


def compile_and_run(name, extra=(), toolchain=None):
    r, out = compile_bin(name, extra=extra, toolchain=toolchain)
    assert r.returncode == 0, f'{name}.rs should compile:\n{r.stderr}'
    return run(out)


# ---- 1. repr(Rust) (the default) reorders fields itself; the same fields in two different ----
# ---- source orders get laid out identically, because the compiler picks the order, not you. ----
out = compile_and_run('repr_rust_reorders')
size_ab, size_ba = (int(x) for x in out.split())
assert size_ab == size_ba, f'expected repr(Rust) to pick the same minimal layout regardless of declared field order, got {size_ab} vs {size_ba}'
print(f'repr_rust_reorders.rs: declaring the same four fields in reverse order still gives repr(Rust) the same {size_ab}-byte layout — the compiler chose the order, not the source')

# ---- 2. repr(C) fixes layout to source order, so the same two orderings now really do differ. ----
out = compile_and_run('repr_c_field_order_matters')
size_good, size_bad = (int(x) for x in out.split())
assert size_bad > size_good, f'expected a worse field order under repr(C) to cost more padding (good={size_good}, bad={size_bad})'
print(f'repr_c_field_order_matters.rs: under repr(C), the same four fields cost {size_good} bytes in one order and {size_bad} bytes in another — field order is now load-bearing')

# ---- 3. offset_of! and a compile-time assertion make a layout claim checkable, not assumed. ----
out = compile_and_run('offsets_checked')
size, off_version, off_flags, off_length, off_seq = (int(x) for x in out.split())
assert (size, off_version, off_flags, off_length, off_seq) == (8, 0, 1, 2, 4), out
print(f'offsets_checked.rs: size {size}, offsets version={off_version} flags={off_flags} length={off_length} seq={off_seq} — all computed by the build itself, and asserted by it too')

# ---- 4. The same assertion technique, given a false claim, refuses to compile at all. ----
r, _ = compile_bin('offset_assertion_fail')
assert r.returncode != 0, 'a false compile-time layout assertion should fail to compile'
assert 'E0080' in r.stderr, f'expected error[E0080] (a failed const assertion), got:\n{r.stderr}'
print('offset_assertion_fail.rs: a false offset claim fails the build itself with error[E0080], never a silent wrong answer')

# ---- 5. -Z randomize-layout (nightly): two different seeds really do give different layouts. ----
r1, out1 = compile_bin('randomize_layout', extra=('-Z', 'randomize-layout', '-Z', 'layout-seed=1'), toolchain='nightly', out_suffix='_seed1')
assert r1.returncode == 0, f'randomize_layout.rs should compile on nightly:\n{r1.stderr}'
r2, out2 = compile_bin('randomize_layout', extra=('-Z', 'randomize-layout', '-Z', 'layout-seed=2'), toolchain='nightly', out_suffix='_seed2')
assert r2.returncode == 0, f'randomize_layout.rs should compile on nightly:\n{r2.stderr}'
nightly_ver = subprocess.run([RUSTC, '+nightly', '--version'], capture_output=True, text=True).stdout.strip()
line1, line2 = run(out1), run(out2)
assert line1 != line2, f'expected two different -Z layout-seed values to produce different layouts, got the same for both:\n{line1}'
print(f'randomize_layout.rs ({nightly_ver}): seed 1 gives "{line1.strip()}", seed 2 gives "{line2.strip()}" — the same repr(Rust) struct, laid out two different ways by the same compiler')

print('\nAll size/alignment/padding examples passed.')
