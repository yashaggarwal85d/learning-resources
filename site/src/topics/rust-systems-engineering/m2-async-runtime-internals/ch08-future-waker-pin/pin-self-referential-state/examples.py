"""Every example shown in the "Pin and self-referential state" reel, compiled and run.
Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85 (edition 2024; the pinned CI
toolchain is 1.97.0) and cargo on PATH for the pin-project-lite example. Rust sources live in
examples/*.rs and examples/structural-projection/ next to this file; every path is resolved
from __file__."""
import os
import re
import shutil
import subprocess
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
RUSTC = shutil.which('rustc')
CARGO = shutil.which('cargo')
assert RUSTC, 'rustc is required (CI installs 1.97.0 with rustup)'
assert CARGO, 'cargo is required for the pin-project-lite example'
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


# ---- 1. A self-referential value genuinely breaks the moment it moves. ----
binary = compile_bin('self_ref_breaks_on_move')
out = run(binary).strip()
assert out == 'after move: pointer still valid = false', f'moving a self-referential value should leave its own pointer stale, got {out!r}'
print(f'self_ref_breaks_on_move.rs: {out}')

# ---- 2. Pin, plus PhantomPinned, keeps the self-reference valid: nothing in the safe API moves it. ----
binary = compile_bin('pin_prevents_the_break')
out = run(binary).strip()
assert out == 'pinned, still valid after construction = true', f'a pinned, PhantomPinned self-reference should stay valid, got {out!r}'
print(f'pin_prevents_the_break.rs: {out}')

# ---- 3. The compiler refuses to move a value out of a Pin<Box<T>> when T is not Unpin. ----
cmd = [RUSTC, '--edition', '2024', '--color', 'never', 'examples/move_out_of_pin_fails.rs', '-o', os.path.join(WD, 'move_out_of_pin_fails')]
r = subprocess.run(cmd, cwd=HERE, capture_output=True, text=True)
assert r.returncode != 0, 'move_out_of_pin_fails.rs should fail to compile: moving a !Unpin value out of Pin<Box<T>> must be rejected'
assert 'error[E0507]' in r.stderr, f'expected error[E0507] (cannot move out of a shared/behind-a-pointer location), got:\n{r.stderr}'
assert 'cannot move out of dereference of `Pin<Box<SelfRef>>`' in r.stderr, f'expected the diagnostic to name Pin<Box<SelfRef>> directly, got:\n{r.stderr}'
print('move_out_of_pin_fails.rs: fails with error[E0507] — the pinning pointer never hands back a plain &mut/owned SelfRef to move out of')

# ---- 4. The pin! macro pins a value on the stack, with the identical guarantee. ----
binary = compile_bin('pin_macro_stack_pin')
out = run(binary).strip()
assert out == 'pin!-macro, stack-pinned, still valid = true', f'a stack-pinned self-reference via pin! should stay valid, got {out!r}'
print(f'pin_macro_stack_pin.rs: {out}')

# ---- 5. Structural pin projection, via pin-project-lite: the pinned field projects to Pin<&mut T>, the ----
# ---- ordinary field projects to a plain &mut U, and both are reachable through one Pin<&mut Self>. ----
proj_dir = os.path.join(HERE, 'examples', 'structural-projection')
r = subprocess.run([CARGO, 'run', '--release', '--quiet', '--bin', 'structural_projection'], cwd=proj_dir,
                    capture_output=True, text=True, timeout=120)
assert r.returncode == 0, f'structural-projection crate should build and run:\n{r.stdout}\n{r.stderr}'
out = r.stdout.strip()
assert out == 'unpinned field, reached through an ordinary &mut: 42', f'expected the projected unpinned field, got {out!r}'
print(f'structural-projection: {out}')

print('all pin-self-referential-state examples pass')
