"""Every example shown in the "Associated types, GATs, and coherence" reel, compiled and run.
Run: python3 examples.py (CI runs it too). Needs rustc >= 1.65 (GATs stabilized there; the pinned CI
toolchain is 1.97.0). Rust sources live in examples/*.rs next to this file; every path is resolved
from __file__."""
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
assert m and (int(m[1]), int(m[2])) >= (1, 65), f'rustc >= 1.65 (GATs) needed, got {ver!r}'
print(f'using {ver}')

TMP = tempfile.TemporaryDirectory()
WD = TMP.name


def compile_bin(name, ok=True):
    out = os.path.join(WD, name)
    cmd = [RUSTC, '--edition', '2024', '--color', 'never', os.path.join('examples', name + '.rs'), '-o', out]
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


# ---- 1. Associated type vs generic parameter: both compile, two different mechanisms. ----
binary, _ = compile_bin('assoc_vs_generic')
out = run(binary)
assert out.strip() == '1 3 3.5', out
print("assoc_vs_generic.rs: Codec's associated Output is chosen once per impl; Meters' From<T> is implemented many times, once per source type")

# ---- 2. An associated type is fixed by the one coherence-checked impl for that type. ----
binary, _ = compile_bin('assoc_type_one_impl')
out = run(binary)
assert out.strip() == '1', out
print('assoc_type_one_impl.rs: one impl of Codec for A, with Output fixed to a single concrete type')

_, err = compile_bin('assoc_type_duplicate_fail', ok=False)
assert 'error[E0119]' in err, err
assert 'conflicting implementations' in err, err
print('assoc_type_duplicate_fail.rs rejected with E0119: a second impl of the same trait for the same type is a duplicate, not a second choice of Output')

# ---- 3. A generic parameter on the trait makes it a different trait per parameter: many impls. ----
binary, _ = compile_bin('generic_param_multiple_impls')
out = run(binary)
assert out.strip() == '1 2', out
print('generic_param_multiple_impls.rs: CodecGeneric<u8> and CodecGeneric<u16> are different traits as far as coherence is concerned, so A implements both at once')

# ---- 4. A GAT lets an item type borrow from &mut self itself, per call (a lending iterator). ----
binary, _ = compile_bin('gat_lending_iterator')
out = run(binary)
assert out.strip() == '36', out
print('gat_lending_iterator.rs: a generic associated type Item<\'a> ties each returned slice\'s lifetime to that one call\'s own borrow of self')

# ---- 5. The orphan rule: neither the trait nor the type is local, so the impl is rejected. ----
_, err = compile_bin('orphan_rule_fail', ok=False)
assert 'error[E0117]' in err, err
assert 'current crate' in err, err
print('orphan_rule_fail.rs rejected with E0117: Display and Vec are both foreign here, so this impl is not allowed')

# ---- 6. The newtype pattern: a local wrapper type satisfies the orphan rule. ----
binary, _ = compile_bin('newtype_fix')
out = run(binary)
assert out.strip() == '[1, 2, 3]', out
print('newtype_fix.rs: wrapping the foreign Vec<u8> in a local Bytes struct makes the same Display impl legal')

# ---- 7. A blanket impl: one declaration implements a trait for every type meeting a bound. ----
binary, _ = compile_bin('blanket_impl')
out = run(binary)
assert out.strip() == '7 Point(1, 2)', out
print('blanket_impl.rs: one impl<T: Debug> Describe for T covers both a plain integer and a custom struct')

print('all associated-types-gats-coherence examples pass')
