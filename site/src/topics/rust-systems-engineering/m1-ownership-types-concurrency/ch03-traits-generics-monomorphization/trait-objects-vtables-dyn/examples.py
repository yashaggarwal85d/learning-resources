"""Every example shown in the "Trait objects, vtables, and dyn compatibility" reel, compiled and run.
Run: python3 examples.py (CI runs it too). Needs rustc >= 1.86 (trait upcasting stabilized there; the
pinned CI toolchain is 1.97.0). Rust sources live in examples/*.rs next to this file; every path is
resolved from __file__."""
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
assert m and (int(m[1]), int(m[2])) >= (1, 86), f'rustc >= 1.86 (trait upcasting) needed, got {ver!r}'
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
    """Optimized (-O) --emit=llvm-ir: unlike topic 9's monomorphization-symbol proof, this one needs
    the optimizer running, since "lost inlining" is itself an optimizer behaviour. A generic call to a
    statically-known type can be inlined away; a call through a dyn Trait vtable cannot be, no matter
    how much optimization runs, because the concrete callee isn't known until run time."""
    out = os.path.join(WD, name + '.ll')
    cmd = [RUSTC, '--edition', '2024', '--color', 'never', '-O', '--crate-type', 'bin', '--emit=llvm-ir', os.path.join('examples', name + '.rs'), '-o', out]
    r = subprocess.run(cmd, cwd=HERE, capture_output=True, text=True)
    assert r.returncode == 0, f'{name}.rs should compile to llvm-ir:\n{r.stderr}'
    return open(out, encoding='utf-8', errors='replace').read()


def function_body(ir, needle):
    """The text of the first top-level `define ...` block whose line contains `needle`, from the line
    after `define` to the matching `}` at column 0."""
    lines = ir.splitlines()
    for i, line in enumerate(lines):
        if line.startswith('define') and needle in line:
            j = i + 1
            while j < len(lines) and lines[j] != '}':
                j += 1
            return '\n'.join(lines[i:j])
    raise AssertionError(f'no define block found for {needle!r}')


# ---- 1. A reference or Box to a concrete type is one word; to a dyn Trait it is two words. ----
binary, _ = compile_bin('fat_pointer')
out = run(binary)
word, thin_ref, fat_ref, thin_box, fat_box = (int(x) for x in out.split())
assert thin_ref == word, (thin_ref, word)
assert fat_ref == 2 * word, (fat_ref, word)
assert thin_box == word, (thin_box, word)
assert fat_box == 2 * word, (fat_box, word)
print(f'fat_pointer.rs: &A and Box<A> are one word wide; &dyn Codec and Box<dyn Codec> are two words wide (data pointer plus vtable pointer)')

# ---- 2. Lost inlining: a generic call to a known type inlines away; a dyn call never can. ----
_, _ = compile_bin('lost_inlining_generic')
out_gen = run(compile_bin('lost_inlining_generic')[0])
assert out_gen.strip() == '36', out_gen
_, _ = compile_bin('lost_inlining_dyn')
out_dyn = run(compile_bin('lost_inlining_dyn')[0])
assert out_dyn.strip() == '36', out_dyn
assert out_gen.strip() == out_dyn.strip(), 'both versions must compute the identical result'

body_gen = function_body(emit_llvm_ir('lost_inlining_generic'), 'sum_generic')
body_dyn = function_body(emit_llvm_ir('lost_inlining_dyn'), 'sum_dyn')
# A real, non-intrinsic call or invoke instruction: not "call void @llvm...." or "tail call ... @llvm.".
real_call = re.compile(r'\b(?:tail\s+)?(?:call|invoke)\b(?!\s+\S+\s+@llvm\.)')
gen_calls = real_call.findall(body_gen)
dyn_calls = real_call.findall(body_dyn)
assert not gen_calls, f'the generic version should have no real call left after inlining, found: {gen_calls}'
assert dyn_calls, 'the dyn version should keep a real, indirect call it cannot inline away'
assert re.search(r'invoke\s+\S+\s+i8\s+%', body_dyn), 'the dyn version should call through a loaded function pointer (a vtable slot), not a named function'
print('lost_inlining_generic.rs/lost_inlining_dyn.rs: both compute the identical sum; the optimized IR shows the generic call fully inlined away and the dyn call still going through an indirect, vtable-loaded function pointer')

# ---- 3. A by-value Self method makes a trait dyn-incompatible: forming Box<dyn Trait> fails. ----
_, err = compile_bin('dyn_incompatible_fail', ok=False)
assert 'error[E0038]' in err, err
assert 'is not dyn compatible' in err, err
print('dyn_incompatible_fail.rs rejected with E0038: a by-value Self method makes the trait dyn-incompatible')

# ---- 4. `where Self: Sized` on just that method excludes it from the vtable and fixes it. ----
binary, _ = compile_bin('sized_escape_hatch')
out = run(binary)
assert out.strip() == 'hi', out
print('sized_escape_hatch.rs: adding `where Self: Sized` to the one offending method makes the trait dyn compatible again')

# ---- 5. Trait upcasting (stable 1.86): &dyn Sub coerces directly to &dyn Super. ----
binary, _ = compile_bin('upcasting')
out = run(binary)
assert out.strip() == '2 1', out
print('upcasting.rs: &dyn Sub coerces directly to &dyn Super, no detour through the concrete type')

# ---- 6. Enum dispatch: a closed set of known implementors, matched explicitly, no vtable. ----
binary, _ = compile_bin('enum_dispatch')
out = run(binary)
assert out.strip() == '3', out
print('enum_dispatch.rs: a closed enum of the same two codecs, matched explicitly, sums to the same total with no dyn Trait involved')

print('all trait-objects-vtables-dyn examples pass')
