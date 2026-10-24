"""Every example shown in the "Embedding Rust in Python and JVM" reel,
built and run. Run: python3 examples.py (CI runs it too). Needs rustc
>= 1.85 (edition 2024; the pinned CI toolchain is 1.97.0), cargo, and
`pip install maturin` on this interpreter (all present in this
sandbox). This sandboxed container cannot install a JVM toolchain, so
the JNI half of the syllabus clause is covered in prose only
(post-notes.md); the PyO3 half is a real, working extension module,
built with maturin and imported for real. Rust sources live in
examples/pyo3_exchanges_data_without_copying_it/; every path is
resolved from __file__."""
import ctypes
import os
import shutil
import subprocess
import sys
import threading
import time

HERE = os.path.dirname(os.path.abspath(__file__))
CRATE = os.path.join(HERE, 'examples', 'pyo3_exchanges_data_without_copying_it')
CARGO = shutil.which('cargo')
MATURIN = shutil.which('maturin')
assert CARGO, 'cargo is required (rustup installs it)'
assert MATURIN, 'maturin is required (pip install maturin)'


def maturin_build_and_install():
    r = subprocess.run(
        [MATURIN, 'build', '--release', '--interpreter', sys.executable],
        cwd=CRATE, capture_output=True, text=True, timeout=300,
    )
    assert r.returncode == 0, f'maturin build should succeed:\n{r.stdout}\n{r.stderr}'
    log = r.stdout + r.stderr
    wheel_line = [line for line in log.splitlines() if 'Built wheel' in line][0]
    wheel_path = wheel_line.split(' to ')[-1].strip()

    install = subprocess.run(
        [sys.executable, '-m', 'pip', 'install', '--force-reinstall', '--no-deps', '-q', wheel_path],
        capture_output=True, text=True, timeout=120,
    )
    assert install.returncode == 0, f'pip install of the built wheel should succeed:\n{install.stdout}\n{install.stderr}'
    return log


build_log = maturin_build_and_install()
assert 'Finished' in build_log, f'expected a successful cargo build:\n{build_log}'

import pyo3_exchanges_data_without_copying_it as mod

# ---- 1. A real bytearray's own buffer is shared with Rust, not copied: ----
# ---- the two sides see the identical real memory address. ----
buf = bytearray(b'0' * 64)
addr_from_python = ctypes.addressof((ctypes.c_char * len(buf)).from_buffer(buf))
addr_from_rust = mod.buffer_address_py(buf)
assert addr_from_python == addr_from_rust, \
    "the bytearray's own address seen from Rust should equal the address seen from Python"
print('pyo3_exchanges_data_without_copying_it: the real buffer address matched on both sides of the boundary, with no copy made')

# ---- 2. Releasing the GIL lets a real, concurrently running Python ----
# ---- thread make dramatically more progress than holding it does. ----
def counter_progress(func, millis):
    counter = {'n': 0}
    stop = threading.Event()

    def spin():
        while not stop.is_set():
            counter['n'] += 1

    t = threading.Thread(target=spin)
    t.start()
    func(millis)
    stop.set()
    t.join()
    return counter['n']


MILLIS = 200
holding = counter_progress(mod.busy_wait_holding_gil_py, MILLIS)
releasing = counter_progress(mod.busy_wait_releasing_gil_py, MILLIS)
assert releasing > holding * 3, \
    f'releasing the GIL should let far more real progress happen than holding it: held={holding} released={releasing}'
print(f'pyo3_exchanges_data_without_copying_it: in {MILLIS}ms, the other thread made {holding} real steps of progress while the GIL was held, against {releasing} while it was released ({releasing / max(holding, 1):.1f}x more)')

print('all embedding-rust-python-jvm examples pass')
