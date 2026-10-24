"""Every example shown in the "FFI boundary as a protocol" reel,
compiled and run. Run: python3 examples.py (CI runs it too). Needs rustc
>= 1.85 (edition 2024; the pinned CI toolchain is 1.97.0) and cargo on
PATH. This sandboxed container cannot add and link a genuinely separate
compiled C library, so the FFI boundary is built as real extern "C" (and
extern "C-unwind") functions inside the same crate, called only through
their own declared extern signature, exactly as a genuinely separate C
caller would. Rust sources live in examples/runtime-demo/ next to this
file; every path is resolved from __file__."""
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
        if ' ' not in line:
            continue
        k, v = line.rsplit(' ', 1)
        kv[k] = v
    return kv


bin_path = cargo_build('an_ffi_boundary_is_a_protocol_not_just_layout')
out = parse(run(bin_path))

# ---- 1. The allocate/free protocol: every correct pair is accepted, and a ----
# ---- second free on the same handle is genuinely rejected, not performed. ----
assert out['a_every_correct_allocate_free_pair_is_accepted_exactly_once'] == 'true', \
    'every correct allocate/free pair should be accepted exactly once'
assert out['b_a_second_free_on_the_same_handle_is_genuinely_rejected_not_performed'] == 'true', \
    'a second free on the same handle should be genuinely rejected'
assert out['c_no_handle_is_ever_left_outstanding_after_its_own_correct_free'] == 'true', \
    'no handle should ever be left outstanding after its own correct free'
print('an_ffi_boundary_is_a_protocol_not_just_layout: the allocate/free protocol genuinely held, and a double free was genuinely rejected')

# ---- 2. The error-representation protocol: a genuine success writes the ----
# ---- real value through the out pointer; a genuine failure leaves it untouched. ----
assert out['d_a_genuine_success_writes_the_real_out_value_through_the_status_code_boundary'] == 'true', \
    'a genuine success should write the real out value'
assert out['e_a_genuine_failure_reports_its_own_status_code_and_leaves_the_out_value_untouched'] == 'true', \
    'a genuine failure should leave the out value untouched'
print('an_ffi_boundary_is_a_protocol_not_just_layout: the status-code protocol genuinely held for both the success and the failure case')

# ---- 3. The C-unwind protocol: a real panic crossing the boundary is ----
# ---- genuinely caught, and the caller genuinely keeps running afterward. ----
assert out['f_a_panic_crossing_a_c_unwind_boundary_is_genuinely_caught_and_the_caller_keeps_running'] == 'true', \
    'a panic crossing a C-unwind boundary should be genuinely caught, and the caller should keep running'
print('an_ffi_boundary_is_a_protocol_not_just_layout: a panic crossing the C-unwind boundary was genuinely caught, and the caller genuinely kept running')

print('all ffi-boundary-as-protocol examples pass')
