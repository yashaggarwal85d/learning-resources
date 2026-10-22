"""Every example shown in the "Lifetimes as constraints, not durations" reel, compiled and run.
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


# ---- 1. Elision: the elided and fully-written signatures behave identically. ----
binary, _ = compile_bin('elision')
out = run(binary)
assert out.strip() == 'hello', out
print('elision.rs: elided and expanded signatures agree, both give "hello"')

# ---- 2. The one case elision can't resolve: two input lifetimes, ambiguous output. ----
_, err = compile_bin('elision_ambiguous', ok=False)
assert 'error[E0106]' in err, err
assert 'does not say whether it is borrowed from' in err, err
print('elision_ambiguous.rs rejected with E0106: the compiler won\'t guess which parameter the output borrows from')

# ---- 3. &'a T is covariant: a 'static and a shorter borrow pass by value to the same T: Debug fine. ----
binary, _ = compile_bin('variance_ref')
out = run(binary)
assert out.strip() == '"hello" "world"', out
print('variance_ref.rs: a &\'static str and a shorter &str both satisfy one T: Debug, by covariance')

# ---- 4. &'a mut T is invariant: the identical pair, now through a &mut T, is rejected. ----
_, err = compile_bin('variance_mut_fail', ok=False)
assert 'error[E0597]' in err, err
assert 'does not live long enough' in err, err
print('variance_mut_fail.rs rejected with E0597: &mut T forces the two references to the exact same lifetime')

# ---- 5. Cell<T> is invariant over T, the same as &mut T, because of interior mutability. ----
_, err = compile_bin('cell_invariant_fail', ok=False)
assert 'error[E0597]' in err, err
print('cell_invariant_fail.rs rejected with E0597: Cell<&\'static str> cannot stand in for a shorter Cell<&\'a str>')

# ---- 6. The higher-ranked bound the elided Fn(&(u8,u16)) -> &u8 bound really means. ----
binary, _ = compile_bin('hrtb')
out = run(binary)
assert out.strip() == '0', out
print('hrtb.rs: the for<\'a> Fn bound lets call() work with whatever lifetime &self has at each call site')

# ---- 7. T: 'static is a bound on content, not a promise of immortality: owned data passes, a borrow of
#    local data doesn't, even calling the exact same function. ----
_, err = compile_bin('static_bound_fail', ok=False)
assert 'error[E0597]' in err, err
assert "is borrowed for `'static`" in err, err
print('static_bound_fail.rs rejected with E0597: owned i satisfies T: \'static, &i does not')

# ---- 8. Box::leak: the one case the 'static bound (or a &'static reference) is the right fix for. ----
binary, _ = compile_bin('box_leak')
out = run(binary)
assert out.strip() == '7', out
print('box_leak.rs: Box::leak mints a real &\'static reference to data made at run time')

print('all lifetimes-as-constraints-not examples pass')
