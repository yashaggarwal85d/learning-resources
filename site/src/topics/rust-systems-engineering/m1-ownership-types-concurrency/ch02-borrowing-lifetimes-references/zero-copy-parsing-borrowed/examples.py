"""Every example shown in the "Zero-copy parsing with borrowed views" reel, compiled and run.
Run: python3 examples.py (CI runs it too). Needs cargo (CI installs rustc 1.97.0 with rustup);
the bytes and ouroboros crates are fetched from crates.io on first build.
The crate lives in examples/ next to this file, one bin target per example, so each example is
built and run as `cargo run --bin <name>` (or `cargo build --bin <name>` for one meant to fail)."""
import os
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
CRATE = os.path.join(HERE, 'examples')


def run_bin(name):
    r = subprocess.run(['cargo', 'run', '-q', '--bin', name], cwd=CRATE, capture_output=True, text=True, timeout=120)
    assert r.returncode == 0, f'{name} should build and run:\n{r.stderr}'
    return r.stdout


def build_fail(name):
    r = subprocess.run(['cargo', 'build', '--bin', name], cwd=CRATE, capture_output=True, text=True, timeout=120)
    assert r.returncode != 0, f'{name} should NOT compile'
    return r.stderr


ver = subprocess.run(['rustc', '--version'], capture_output=True, text=True).stdout.strip()
print(f'using {ver}, driven through cargo (crate: {CRATE})')

# ---- 1. A header struct whose fields are views straight into the caller's own buffer. ----
out = run_bin('zero_copy_parse')
assert '"RUST" "CH02"' in out, out
print('zero_copy_parse.rs: Header<\'a>\'s fields point at buf\'s own memory, byte for byte, no copy')

# ---- 2. Cow: a read-only pass never clones; a mutating pass clones into an owned Vec. ----
out = run_bin('cow_example')
assert 'confirmed' in out, out
print('cow_example.rs: the std docs\' own abs_all example, Cow::Borrowed when read-only, Cow::Owned once mutated')

# ---- 3. A &[u8] can't outlive the owned Vec<u8> it was carved from. ----
err = build_fail('owned_vs_borrowed_fail')
assert 'error[E0515]' in err, err
assert 'cannot return value referencing local variable' in err, err
print('owned_vs_borrowed_fail.rs rejected with E0515: a borrowed view cannot outlive the owned buffer it pointed into')

# ---- 4. bytes::Bytes escapes that exact scope: it owns a refcounted handle, not a borrow. ----
out = run_bin('bytes_share')
assert 'shared, cheaply cloned, cheaply sliced' in out, out
print('bytes_share.rs: a Bytes built from an owned Vec is returned freely, cloned and sliced without copying the bytes')

# ---- 5. The naive self-referential struct: plain Rust refuses to let a struct hold a ----
#    reference into one of its own fields.
err = build_fail('self_ref_fail')
assert 'error[E0515]' in err, err
assert 'error[E0505]' in err, err
print('self_ref_fail.rs rejected with E0515 and E0505: a struct cannot be built from a field and a reference into that same field')

# ---- 6. ouroboros's own macro makes the identical shape safe to build and use. ----
out = run_bin('ouroboros_works')
assert out.strip() == 'hello', out
print('ouroboros_works.rs: #[self_referencing] builds the same shape safely, and borrow_view() reads it back')

print('all zero-copy-parsing-borrowed examples pass')
