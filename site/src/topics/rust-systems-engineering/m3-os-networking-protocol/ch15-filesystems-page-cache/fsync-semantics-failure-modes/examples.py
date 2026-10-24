"""Every example shown in the "fsync semantics and failure modes" reel, compiled and run.
Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85 (edition 2024; the pinned CI
toolchain is 1.97.0), cargo, and strace on PATH. These examples are Unix-specific (fsync,
fdatasync, directory file descriptors) and use strace to confirm which real syscall each
Rust call actually makes. Rust sources live in examples/runtime-demo/ next to this file;
every path is resolved from __file__."""
import os
import shutil
import subprocess
import sys

assert sys.platform != 'win32', 'this topic is Unix-specific: fsync, fdatasync, directory fds'

HERE = os.path.dirname(os.path.abspath(__file__))
RUSTC = shutil.which('rustc')
CARGO = shutil.which('cargo')
STRACE = shutil.which('strace')
assert RUSTC, 'rustc is required (CI installs 1.97.0 with rustup)'
assert CARGO, 'cargo is required'
assert STRACE, 'strace is required: these examples confirm real syscalls, not just return codes'
ver = subprocess.run([RUSTC, '--version'], capture_output=True, text=True).stdout.strip()
print(f'using {ver}')

CRATE = os.path.join(HERE, 'examples', 'runtime-demo')


def cargo_build(name, timeout=60):
    r = subprocess.run([CARGO, 'build', '--release', '--quiet', '--bin', name], cwd=CRATE,
                        capture_output=True, text=True, timeout=timeout)
    assert r.returncode == 0, f'{name} should build:\n{r.stdout}\n{r.stderr}'
    return os.path.join(CRATE, 'target', 'release', name)


def strace_run(binary, args, trace, timeout=60):
    return subprocess.run([STRACE, '-f', '-e', f'trace={trace}', binary, *args],
                           capture_output=True, text=True, timeout=timeout)


# ---- 1. File::sync_all() genuinely makes the real fsync() syscall, and File::sync_data() ----
# ---- genuinely makes the real, distinct fdatasync() syscall — not the same call underneath. ----
sync_demo = cargo_build('sync_demo')
r_all = strace_run(sync_demo, ['all'], 'fsync,fdatasync')
assert r_all.returncode == 0, f'sync_demo all should run:\n{r_all.stdout}\n{r_all.stderr}'
assert 'fsync(' in r_all.stderr, f'sync_all should make a real fsync() syscall:\n{r_all.stderr}'
assert 'fdatasync(' not in r_all.stderr, f'sync_all should not make an fdatasync() syscall:\n{r_all.stderr}'
r_data = strace_run(sync_demo, ['data'], 'fsync,fdatasync')
assert r_data.returncode == 0, f'sync_demo data should run:\n{r_data.stdout}\n{r_data.stderr}'
assert 'fdatasync(' in r_data.stderr, f'sync_data should make a real fdatasync() syscall:\n{r_data.stderr}'
print('sync_demo: File::sync_all() made a real fsync() syscall, and File::sync_data() made a real, distinct fdatasync() syscall')

# ---- 2. Fsyncing a file's own fd and fsyncing its parent directory's fd are two genuinely ----
# ---- separate real fsync() syscalls, on two genuinely different file descriptors. ----
dirsync_bin = cargo_build('directory_fsync_is_a_separate_syscall')
r = strace_run(dirsync_bin, [], 'fsync')
assert r.returncode == 0, f'directory_fsync_is_a_separate_syscall should run:\n{r.stdout}\n{r.stderr}'
fsync_calls = r.stderr.count('fsync(')
assert fsync_calls == 2, f'expected exactly 2 real fsync() syscalls (file, then directory), got {fsync_calls}:\n{r.stderr}'
assert r.stdout.strip() == 'true', f'the file and directory should be genuinely different file descriptors, got {r.stdout!r}'
print('directory_fsync_is_a_separate_syscall: fsyncing the file and fsyncing its parent directory were two real, separate fsync() syscalls on two different file descriptors')

# ---- 3. The write-temp + fsync + rename + fsync-dir atomic-replace pattern never exposes ----
# ---- a half-written file to a real, concurrently reading thread. ----
atomic_bin = cargo_build('atomic_replace_never_exposes_a_partial_file')
r = subprocess.run([atomic_bin], capture_output=True, text=True, timeout=60)
assert r.returncode == 0, f'atomic_replace_never_exposes_a_partial_file should run:\n{r.stdout}\n{r.stderr}'
reads, partial_reads = (int(x) for x in r.stdout.strip().split())
assert reads > 1000, f'the concurrent reader should have done many real reads, got {reads}'
assert partial_reads == 0, f'the atomic-replace pattern should never expose a half-written file, got {partial_reads} partial read(s) out of {reads}'
print(f'atomic_replace_never_exposes_a_partial_file: across {reads} real concurrent reads during 200 real atomic replacements, not one partial file was ever observed')

print('all fsync-semantics-failure-modes examples pass')
