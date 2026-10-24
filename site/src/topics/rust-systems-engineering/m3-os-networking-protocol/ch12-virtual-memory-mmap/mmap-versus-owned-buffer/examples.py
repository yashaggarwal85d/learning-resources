"""Every example shown in the "mmap versus an owned buffer pool" reel, compiled and run.
Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85 (edition 2024; the pinned CI
toolchain is 1.97.0) and cargo on PATH. These examples are Unix-specific (raw O_DIRECT opens,
/proc/self/smaps) and use the real libc and memmap2 crates for the mapping and the raw,
alignment-sensitive reads std doesn't expose directly. Rust sources live in
examples/runtime-demo/ next to this file; every path is resolved from __file__."""
import os
import shutil
import subprocess
import sys

assert sys.platform != 'win32', 'this topic is Unix-specific: mmap, O_DIRECT, /proc/self/smaps'

HERE = os.path.dirname(os.path.abspath(__file__))
RUSTC = shutil.which('rustc')
CARGO = shutil.which('cargo')
assert RUSTC, 'rustc is required (CI installs 1.97.0 with rustup)'
assert CARGO, 'cargo is required: these examples need the real libc and memmap2 crates'
ver = subprocess.run([RUSTC, '--version'], capture_output=True, text=True).stdout.strip()
print(f'using {ver}')

CRATE = os.path.join(HERE, 'examples', 'runtime-demo')


def cargo_run(name, timeout=60):
    return subprocess.run([CARGO, 'run', '--release', '--quiet', '--bin', name], cwd=CRATE,
                           capture_output=True, text=True, timeout=timeout)


# ---- 1. A mapped file's pages are genuinely resident in the kernel's own page cache at the ----
# ---- same time a separate, hand-built application-level cache holds the same bytes again. ----
r = cargo_run('mmap_holds_the_same_bytes_twice')
assert r.returncode == 0, f'mmap_holds_the_same_bytes_twice should build and run:\n{r.stdout}\n{r.stderr}'
mapped_rss_kb, app_cache_growth_kb, file_kb = (int(x) for x in r.stdout.strip().split())
assert mapped_rss_kb >= file_kb * 0.75, f'the mapping should be mostly resident after being touched, got {mapped_rss_kb} KB of {file_kb} KB'
assert app_cache_growth_kb >= file_kb * 0.75, f'reading the same file again should grow RSS by roughly another copy, got {app_cache_growth_kb} KB of {file_kb} KB'
print(f'mmap_holds_the_same_bytes_twice: the mapping held {mapped_rss_kb} KB resident, and reading the same {file_kb} KB file into a separate application cache grew RSS by another {app_cache_growth_kb} KB — the same bytes, held twice')

# ---- 2. A real O_DIRECT read rejects a misaligned buffer with the kernel's own EINVAL, and ----
# ---- genuinely succeeds once the buffer is aligned to a safe block boundary. ----
r = cargo_run('direct_io_rejects_misaligned_buffers')
assert r.returncode == 0, f'direct_io_rejects_misaligned_buffers should build and run:\n{r.stdout}\n{r.stderr}'
misaligned_result, misaligned_errno, aligned_result = (int(x) for x in r.stdout.strip().split())
assert misaligned_result == -1, f'a misaligned O_DIRECT read should fail outright, got {misaligned_result}'
assert misaligned_errno == 22, f'the failure should be EINVAL (22), got {misaligned_errno}'
assert aligned_result == 4096, f'the aligned read should succeed and return the full count, got {aligned_result}'
print('direct_io_rejects_misaligned_buffers: a real O_DIRECT read with a misaligned buffer failed outright with EINVAL; the same read with an aligned buffer succeeded cleanly')

print('all mmap-versus-owned-buffer examples pass')
