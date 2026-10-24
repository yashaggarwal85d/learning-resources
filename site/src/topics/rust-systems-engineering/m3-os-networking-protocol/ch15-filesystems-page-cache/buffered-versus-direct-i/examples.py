"""Every example shown in the "Buffered versus direct I/O" reel, compiled and run.
Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85 (edition 2024; the pinned CI
toolchain is 1.97.0) and cargo on PATH. These examples are Unix-specific (raw readahead,
posix_fadvise, mincore, O_DIRECT) and use the real libc crate for the syscalls std doesn't
expose directly. Rust sources live in examples/runtime-demo/ next to this file; every path
is resolved from __file__."""
import os
import shutil
import subprocess
import sys

assert sys.platform != 'win32', 'this topic is Unix-specific: readahead, posix_fadvise, mincore, O_DIRECT'

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


# ---- 1. A real readahead() call genuinely populates the page cache, measured directly ----
# ---- via mincore() on a fresh mapping that never reads a single byte itself. ----
r = cargo_run('readahead_populates_the_page_cache')
assert r.returncode == 0, f'readahead_populates_the_page_cache should build and run:\n{r.stdout}\n{r.stderr}'
before, after, total = (int(x) for x in r.stdout.strip().split())
assert before == 0, f'the dropped file should start with no resident pages, got {before}'
assert after == total, f'readahead should bring every page in, got {after} of {total}'
print(f'readahead_populates_the_page_cache: 0 of {total} pages were resident before readahead, and all {total} were resident immediately after it')

# ---- 2. A real posix_fadvise(POSIX_FADV_DONTNEED) call genuinely evicts pages that ----
# ---- readahead() had just brought in, measured directly via mincore(). ----
r = cargo_run('fadvise_dontneed_evicts_resident_pages')
assert r.returncode == 0, f'fadvise_dontneed_evicts_resident_pages should build and run:\n{r.stdout}\n{r.stderr}'
after_readahead, after_dontneed, total = (int(x) for x in r.stdout.strip().split())
assert after_readahead == total, f'readahead should populate every page first, got {after_readahead} of {total}'
assert after_dontneed == 0, f'DONTNEED should evict every page, got {after_dontneed} still resident'
print(f'fadvise_dontneed_evicts_resident_pages: all {total} pages were resident after readahead, and none were resident after POSIX_FADV_DONTNEED')

# ---- 3. A normal buffered read genuinely populates the page cache; the exact same read ----
# ---- through O_DIRECT genuinely never does, measured directly via mincore() on both. ----
r = cargo_run('direct_io_never_populates_the_page_cache')
assert r.returncode == 0, f'direct_io_never_populates_the_page_cache should build and run:\n{r.stdout}\n{r.stderr}'
buffered_resident, direct_resident, total = (int(x) for x in r.stdout.strip().split())
assert buffered_resident == total, f'the buffered read should leave every page resident, got {buffered_resident} of {total}'
assert direct_resident == 0, f'the O_DIRECT read should leave no page resident, got {direct_resident}'
print(f'direct_io_never_populates_the_page_cache: the buffered read left all {total} pages resident, and the O_DIRECT read of the same size left none resident at all')

print('all buffered-versus-direct-i examples pass')
