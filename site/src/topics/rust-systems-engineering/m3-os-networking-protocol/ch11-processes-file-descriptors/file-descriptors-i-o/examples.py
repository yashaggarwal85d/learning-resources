"""Every example shown in the "File descriptors and I/O safety" reel, compiled and run.
Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85 (edition 2024; the pinned CI
toolchain is 1.97.0) and cargo on PATH. These examples are Unix-specific (raw file
descriptors, dup, fork+exec via std::process::Command) and use the real libc crate for the
raw syscalls std doesn't expose directly. Rust sources live in examples/runtime-demo/ next to
this file; every path is resolved from __file__."""
import os
import shutil
import subprocess
import sys

assert sys.platform != 'win32', 'this topic is Unix-specific: raw fds, dup, fork+exec'

HERE = os.path.dirname(os.path.abspath(__file__))
RUSTC = shutil.which('rustc')
CARGO = shutil.which('cargo')
assert RUSTC, 'rustc is required (CI installs 1.97.0 with rustup)'
assert CARGO, 'cargo is required: these examples need the real libc crate'
ver = subprocess.run([RUSTC, '--version'], capture_output=True, text=True).stdout.strip()
print(f'using {ver}')

CRATE = os.path.join(HERE, 'examples', 'runtime-demo')


def cargo_run(name, timeout=60):
    return subprocess.run([CARGO, 'run', '--release', '--quiet', '--bin', name], cwd=CRATE,
                           capture_output=True, text=True, timeout=timeout)


# ---- 1. Two fds that refer to the same open file description — one obtained by a real ----
# ---- dup(2) call — genuinely share that description's own read offset. ----
r = cargo_run('dup_shares_the_same_offset')
assert r.returncode == 0, f'dup_shares_the_same_offset should build and run:\n{r.stdout}\n{r.stderr}'
first_half, second_half = r.stdout.strip().split()
assert first_half == '01234', f'the original fd should read the first half, got {first_half!r}'
assert second_half == '56789', f'the duplicated fd should continue from the shared offset, got {second_half!r}'
print(f'dup_shares_the_same_offset: the original fd read {first_half!r}, and the duplicated fd continued from the shared offset at exactly {second_half!r}')

# ---- 2. OwnedFd genuinely closes its file descriptor on Drop, while a BorrowedFd taken ----
# ---- from a different, still-owned File remains completely valid. ----
r = cargo_run('owned_fd_closes_on_drop')
assert r.returncode == 0, f'owned_fd_closes_on_drop should build and run:\n{r.stdout}\n{r.stderr}'
after_close, errno_after, still_valid = r.stdout.strip().split()
assert after_close == '-1', f'fcntl on a closed fd should fail, got {after_close!r}'
assert int(errno_after) == 9, f'the failure should be EBADF (9), got {errno_after!r}'
assert int(still_valid) >= 0, f'the borrowed fd should remain valid, got {still_valid!r}'
print(f'owned_fd_closes_on_drop: after the OwnedFd was dropped, a raw fcntl on its fd failed with EBADF; a BorrowedFd from a different, still-owned File stayed valid')

# ---- 3. std opens with O_CLOEXEC by default, so a normally-opened fd does not leak across ----
# ---- a real fork+exec; an fd with that flag explicitly cleared does leak straight through. ----
r = cargo_run('cloexec_default_blocks_the_leak')
assert r.returncode == 0, f'cloexec_default_blocks_the_leak should build and run:\n{r.stdout}\n{r.stderr}'
default_cloexec, leaked_cloexec, default_visible, leaked_visible = r.stdout.strip().split()
assert default_cloexec == 'true', f'std::fs::File should set FD_CLOEXEC by default, got {default_cloexec!r}'
assert leaked_cloexec == 'false', f'the explicitly-cleared fd should not have FD_CLOEXEC, got {leaked_cloexec!r}'
assert default_visible == 'false', f'the default fd should not survive into the child, got {default_visible!r}'
assert leaked_visible == 'true', f'the CLOEXEC-cleared fd should leak into the child, got {leaked_visible!r}'
print('cloexec_default_blocks_the_leak: the default fd, protected by O_CLOEXEC, never appeared in a real forked and exec\'d child; the fd with that flag explicitly cleared leaked straight into it')

print('all file-descriptors-i-o examples pass')
