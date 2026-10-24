"""Every example shown in the "Buffer pool and page eviction" reel,
compiled and run. Run: python3 examples.py (CI runs it too). Needs rustc >=
1.85 (edition 2024; the pinned CI toolchain is 1.97.0) and cargo on PATH.
This example builds a real, minimal buffer pool: a frame table, a pin
count and dirty bit per frame, and a real CLOCK eviction policy. Rust
sources live in examples/runtime-demo/ next to this file; every path is
resolved from __file__."""
import os
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
RUSTC = shutil.which('rustc')
CARGO = shutil.which('cargo')
assert RUSTC, 'rustc is required (CI installs 1.97.0 with rustup)'
assert CARGO, 'cargo is required'
ver = subprocess.run([RUSTC, '--version'], capture_output=True, text=True).stdout.strip()
print(f'using {ver}')

CRATE = os.path.join(HERE, 'examples', 'runtime-demo')


def cargo_build(name, timeout=120):
    r = subprocess.run([CARGO, 'build', '--release', '--quiet', '--bin', name], cwd=CRATE,
                        capture_output=True, text=True, timeout=timeout)
    assert r.returncode == 0, f'{name} should build:\n{r.stdout}\n{r.stderr}'
    return os.path.join(CRATE, 'target', 'release', name)


def run(binary, timeout=30):
    r = subprocess.run([binary], capture_output=True, text=True, timeout=timeout)
    assert r.returncode == 0, f'{binary} should run:\n{r.stdout}\n{r.stderr}'
    return r.stdout.strip()


def parse(out):
    kv = {}
    for line in out.splitlines():
        k, v = line.rsplit(' ', 1)
        kv[k] = v
    return kv


pool_bin = cargo_build('pin_dirty_and_clock_decide_eviction')
out = parse(run(pool_bin))

# ---- 1. A fully pinned pool genuinely cannot evict anything. ----
assert out['fully_pinned_pool_rejects_new_page'] == 'true', 'a fully pinned buffer pool should never evict a pinned frame'
print('pin_dirty_and_clock_decide_eviction: a fully pinned buffer pool genuinely rejected one more page, with no pinned frame ever evicted')

# ---- 2. A dirty page is written back before its frame is reused. ----
assert out['dirty_page_written_back_before_reuse'] == 'true', 'a dirty frame should be written back before being reused for a new page'
assert out['evicted_frame_now_holds_new_page'] == 'true'
print('pin_dirty_and_clock_decide_eviction: the dirty page was genuinely written back before its own frame was reused for the new page')

# ---- 3. CLOCK genuinely evicts the page its own rule says to, not an ----
# ---- arbitrary one. ----
assert out['clock_evicts_the_untouched_page_not_the_touched_one'] == 'true', 'CLOCK should evict the page untouched since the last sweep, not the one just re-accessed'
print('pin_dirty_and_clock_decide_eviction: CLOCK genuinely evicted the page left untouched since the last sweep, not the one just re-accessed')

print('all buffer-pool-page-eviction examples pass')
