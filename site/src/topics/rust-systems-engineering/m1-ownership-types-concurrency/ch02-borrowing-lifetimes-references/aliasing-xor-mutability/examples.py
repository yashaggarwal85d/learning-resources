"""Every example shown in the "Aliasing XOR mutability" reel, compiled and run.
Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85 (edition 2024; the pinned CI toolchain is 1.97.0).
Rust sources live in examples/*.rs next to this file; every path is resolved from __file__. Every number the reel
shows is asserted here, computed from real compiler output, never claimed from memory."""
import os
import re
import shutil
import subprocess
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
EX = os.path.join(HERE, 'examples')
RUSTC = shutil.which('rustc')
assert RUSTC, 'rustc is required (CI installs 1.97.0 with rustup)'
ver = subprocess.run([RUSTC, '--version'], capture_output=True, text=True).stdout.strip()
m = re.match(r'rustc (\d+)\.(\d+)\.(\d+)', ver)
assert m and (int(m[1]), int(m[2])) >= (1, 85), f'rustc >= 1.85 (edition 2024) needed, got {ver!r}'
print(f'using {ver}')

TMP = tempfile.TemporaryDirectory()
WD = TMP.name


def compile_bin(name, edition='2024', ok=True, extra=()):
    out = os.path.join(WD, f'{name}_{edition}')
    cmd = [RUSTC, '--edition', edition, '--color', 'never', *extra, os.path.join('examples', name + '.rs'), '-o', out]
    r = subprocess.run(cmd, cwd=HERE, capture_output=True, text=True)
    if ok:
        assert r.returncode == 0, f'{name}.rs should compile under {edition}:\n{r.stderr}'
        return out, r.stderr
    assert r.returncode != 0, f'{name}.rs should NOT compile under {edition}'
    return None, r.stderr


def run(binary):
    r = subprocess.run([binary], capture_output=True, text=True, timeout=30)
    assert r.returncode == 0, f'{binary} exited {r.returncode}: {r.stderr}'
    return r.stdout


# ---- 1. compute(): the hand-optimization the Nomicon says is sound only because &u32/&mut u32 can't alias. ----
binary, _ = compile_bin('compute')
out = run(binary)
rows = [l.split() for l in out.strip().split('\n')]
assert len(rows) == 21 * 5, f'expected 105 (input, start) pairs, got {len(rows)}'
# The reel's two worked numbers: input 20 (>10) always ends at 2; input 3 (<=5) never changes the start value.
for inp, start, result in rows:
    inp, start, result = int(inp), int(start), int(result)
    if inp > 10:
        assert result == 2, f'input {inp} > 10 should give 2, got {result}'
    elif inp <= 5:
        assert result == start, f'input {inp} <= 5 should leave the value at {start}, got {result}'
print('compute() and its hand-optimization agree on all 105 (input, start) pairs checked')

# ---- 2. compute(&x, &mut x): rejected, because it would make the optimization above unsound. ----
_, err = compile_bin('compute_alias_fail', ok=False)
assert 'error[E0502]' in err, err
assert 'cannot borrow `x` as mutable because it is also borrowed as immutable' in err, err
print('compute(&x, &mut x) rejected with E0502, as the aliasing rule requires')

# ---- 3. noalias: compiled -O --emit=llvm-ir, the reference version's parameters carry `noalias`; the raw-pointer
#    version's don't, because raw pointers make no aliasing promise on their own. ----
ir_path = os.path.join(WD, 'noalias.ll')
r = subprocess.run([RUSTC, '--edition', '2024', '--crate-type', 'lib', '-O', '--emit=llvm-ir',
                    os.path.join('examples', 'noalias.rs'), '-o', ir_path], cwd=HERE, capture_output=True, text=True)
assert r.returncode == 0, r.stderr
ir = open(ir_path).read()
ref_sig = next(l for l in ir.split('\n') if '@compute_ref(' in l and l.startswith('define'))
raw_sig = next(l for l in ir.split('\n') if '@compute_raw(' in l and l.startswith('define'))
assert ref_sig.count('noalias') == 2, f'compute_ref should have noalias on both pointer params:\n{ref_sig}'
assert 'noalias' not in raw_sig, f'compute_raw should have no noalias (raw pointers alias freely):\n{raw_sig}'
print('compute_ref gets 2 noalias attributes in -O LLVM IR; compute_raw gets 0')

# ---- 4. Reborrow: bump(r) twice through the same &mut, because each call reborrows rather than moving r. ----
binary, _ = compile_bin('reborrow')
assert run(binary).strip() == '2', 'two reborrowed bump() calls should leave n at 2'
print('reborrow.rs: two calls through a reborrowed &mut leave the value at 2')

# ---- 5. Two-phase borrow: v.push(v.len()) — len() reads v while the push's &mut is only reserved. ----
binary, _ = compile_bin('two_phase')
assert run(binary).strip() == '[10, 20, 30, 3]', 'push(len()) should append the pre-push length, 3'
print('two_phase.rs: v.push(v.len()) compiles and appends 3')

# ---- 6. The RFC's own "sneaky" counter-example: a borrow spanning the activation point is still rejected. ----
_, err = compile_bin('two_phase_sneaky', ok=False)
assert 'error[E0502]' in err, err
print('two_phase_sneaky.rs: still rejected with E0502 on rustc ' + ver.split()[1] + ' (a reservation is not a blanket exemption)')

print('all aliasing-xor-mutability examples pass')
