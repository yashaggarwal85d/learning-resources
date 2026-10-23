"""Every example shown in the "Reference cycles and Weak" reel, compiled and run. Run:
python3 examples.py (CI runs it too). Needs rustc >= 1.85 (edition 2024; the pinned CI toolchain
is 1.97.0). Rust sources live in examples/*.rs next to this file; every path is resolved from
__file__."""
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


def run(binary, timeout=30):
    r = subprocess.run([binary], capture_output=True, text=True, timeout=timeout)
    assert r.returncode == 0, f'{binary} exited {r.returncode}: {r.stderr}'
    return r.stdout


# ---- 1. A genuine two-node Rc cycle leaks: measured with a counting global allocator. ----
binary, _ = compile_bin('rc_cycle_leak')
out = run(binary)
leaked = int(out.strip())
assert leaked > 0, f'expected a real leak (net allocations > 0 after both nodes drop out of scope), got {out!r}'
print(f'rc_cycle_leak.rs: {leaked} net allocation(s) never freed once both nodes went out of scope, a real leak measured by the allocator, never simulated')

# ---- 2. The identical shape, with the parent link as a non-owning Weak: nothing leaks. ----
binary, _ = compile_bin('weak_breaks_cycle')
out = run(binary)
assert out.strip() == '0', out
print('weak_breaks_cycle.rs: the same shape, parent held by Weak instead of Rc, frees every node once both go out of scope')

# ---- 3. Weak::upgrade succeeds while a strong owner exists, and fails once the last one drops. ----
binary, _ = compile_bin('weak_upgrade_after_drop')
out = run(binary)
assert out.strip() == 'true true', out
print('weak_upgrade_after_drop.rs: upgrade succeeds while the Rc is alive, and returns None the moment the last strong owner is dropped')

# ---- 4. Rc::new_cyclic builds a value while handing its constructor a Weak to itself. ----
binary, _ = compile_bin('rc_new_cyclic')
out = run(binary)
assert out.strip() == 'root 1 2', out
print("rc_new_cyclic.rs: the node's own self_ref upgrades to itself; the strong count is one before the upgrade and two while the upgraded clone is still alive")

print('all reference-cycles-weak examples pass')
