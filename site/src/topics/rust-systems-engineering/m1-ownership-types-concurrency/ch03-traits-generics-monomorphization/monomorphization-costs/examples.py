"""Every example shown in the "Monomorphization and its costs" reel, compiled and run.
Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85 (edition 2024; the pinned CI toolchain is 1.97.0).
Rust sources live in examples/*.rs next to this file; every path is resolved from __file__."""
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


def compile_bin(name, ok=True, extra=()):
    out = os.path.join(WD, name)
    cmd = [RUSTC, '--edition', '2024', '--color', 'never', *extra, os.path.join('examples', name + '.rs'), '-o', out]
    r = subprocess.run(cmd, cwd=HERE, capture_output=True, text=True)
    if ok:
        assert r.returncode == 0, f'{name}.rs should compile:\n{r.stderr}'
        return out, r.stderr
    assert r.returncode != 0, f'{name}.rs should NOT compile'
    return None, r.stderr


def run(binary):
    r = subprocess.run([binary], capture_output=True, text=True, timeout=30)
    assert r.returncode == 0, f'{binary} exited {r.returncode}: {r.stderr}'
    return r.stdout


def emit_llvm_ir(name):
    """Unoptimized (-O0, the default) --emit=llvm-ir, so each monomorphized instance keeps
    its own symbol instead of being inlined or constant-folded away."""
    out = os.path.join(WD, name + '.ll')
    cmd = [RUSTC, '--edition', '2024', '--color', 'never', '--crate-type', 'bin', '--emit=llvm-ir', os.path.join('examples', name + '.rs'), '-o', out]
    r = subprocess.run(cmd, cwd=HERE, capture_output=True, text=True)
    assert r.returncode == 0, f'{name}.rs should compile to llvm-ir:\n{r.stderr}'
    return open(out, encoding='utf-8', errors='replace').read()


def defined_bodies(ir, needle):
    """Every top-level `define ...` line whose mangled name contains `needle`, each paired
    with its body's line count (from the line after `define` to the matching `}` at column 0)."""
    lines = ir.splitlines()
    out = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if line.startswith('define') and needle in line:
            j = i + 1
            while j < len(lines) and lines[j] != '}':
                j += 1
            out.append((line, j - i - 1))
            i = j
        i += 1
    return out


# ---- 1. One generic function, bound by a trait, monomorphized once per concrete codec. ----
binary, _ = compile_bin('monomorphization')
out = run(binary)
assert out.strip() == '1 2', out
ir = emit_llvm_ir('monomorphization')
bodies = defined_bodies(ir, 'encode_generic')
assert len(bodies) == 2, f'expected 2 monomorphized encode_generic bodies, found {len(bodies)}: {[b[0] for b in bodies]}'
names = {b[0] for b in bodies}
assert any('1A' in n for n in names) and any('1B' in n for n in names), names
print(f'monomorphization.rs: encode_generic compiles to {len(bodies)} distinct symbols, one per concrete codec (A, B)')

# ---- 2. Outlining: the generic shim shrinks, the shared body stays one copy. ----
_, _ = compile_bin('outlining')
out = run(compile_bin('outlining')[0])
assert out.strip() == '8 8', out
ir_out = emit_llvm_ir('outlining')
encode_bodies = defined_bodies(ir_out, 'outlining6encodeN')
format_bodies = defined_bodies(ir_out, 'outlining12format_bytes')
assert len(encode_bodies) == 2, f'expected 2 encode shims, found {len(encode_bodies)}'
assert len(format_bodies) == 1, f'expected exactly 1 format_bytes body, found {len(format_bodies)}'
encode_lines = sum(n for _, n in encode_bodies)
format_lines = format_bodies[0][1]
print(f'outlining.rs: encode compiles to {len(encode_bodies)} shims totalling {encode_lines} IR lines; format_bytes compiles to 1 shared body of {format_lines} IR lines')

# ---- 3. Naive (no outlining): the whole body, loop included, is duplicated per type. ----
_, _ = compile_bin('naive')
out = run(compile_bin('naive')[0])
assert out.strip() == '8 8', out
ir_naive = emit_llvm_ir('naive')
naive_bodies = defined_bodies(ir_naive, 'naive6encodeN')
assert len(naive_bodies) == 2, f'expected 2 naive encode bodies, found {len(naive_bodies)}'
naive_lines = [n for _, n in naive_bodies]
assert naive_lines[0] == naive_lines[1], naive_lines
assert naive_lines[0] > encode_lines, (naive_lines, encode_lines)
print(f'naive.rs: encode (no outlining) compiles to {len(naive_bodies)} full-body copies of {naive_lines[0]} IR lines each ({sum(naive_lines)} total) — more than outlining.rs\'s {encode_lines}-line shims plus its one shared body')

# ---- 4. impl Trait in argument position lets two parameters differ in concrete type. ----
binary, _ = compile_bin('impl_trait_arg')
out = run(binary)
assert out.strip() == 'woof meow', out
print('impl_trait_arg.rs: two `impl Greet` parameters accept a Dog and a Cat, two different concrete types')

# ---- 5. The same two calls through one shared <T: Greet> bound must fail: T forces one type. ----
_, err = compile_bin('trait_bound_same_type_fail', ok=False)
assert 'error[E0308]' in err, err
assert 'expected `Dog`, found `Cat`' in err, err
print('trait_bound_same_type_fail.rs rejected with E0308: a shared <T: Greet> bound forces both parameters to the same concrete type')

# ---- 6. impl Trait in return position returns the closure unboxed; Box<dyn Fn> allocates. ----
binary, _ = compile_bin('impl_trait_return')
out = run(binary)
parts = out.strip().split()
assert len(parts) == 5, out
result_impl, result_boxed, before, after_impl, after_boxed = (int(p) for p in parts)
assert result_impl == 15 and result_boxed == 15, out
assert after_impl == before, f'impl Trait return should allocate nothing new, before={before} after={after_impl}'
assert after_boxed == before + 1, f'Box<dyn Fn> should allocate exactly once, before={before} after={after_boxed}'
print(f'impl_trait_return.rs: returning `impl Fn` makes {after_impl - before} new allocations; returning `Box<dyn Fn>` makes {after_boxed - before}')

print('all monomorphization-costs examples pass')
