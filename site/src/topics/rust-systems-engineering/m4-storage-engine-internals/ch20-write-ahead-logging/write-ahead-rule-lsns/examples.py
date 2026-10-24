"""Every example shown in the "Write-ahead rule and LSNs" reel, compiled
and run. Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85
(edition 2024; the pinned CI toolchain is 1.97.0) and cargo on PATH. This
example builds a real, minimal write-ahead log: length-prefixed records
each carrying their own LSN, and a page carrying its own LSN, with a
checksum that catches a torn page. Rust sources live in
examples/runtime-demo/ next to this file; every path is resolved from
__file__."""
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


wal_bin = cargo_build('log_first_redo_idempotent_torn_page')
out = parse(run(wal_bin))

# ---- 1. Log first, data later: the same crash loses nothing with the ----
# ---- rule followed, and silently loses the update when it's broken. ----
assert out['log_first_recovers_correctly'] == 'true', 'a crash between log append and page write must still recover correctly'
assert out['data_first_loses_the_update_silently'] == 'true', 'the identical crash, with the page written before the log, should genuinely lose the update'
print('log_first_redo_idempotent_torn_page: the write-ahead rule genuinely survives a crash that silently loses the update when the ordering is reversed')

# ---- 2. Redo is idempotent via page.lsn >= record.lsn. ----
assert out['page_unchanged_after_replaying_an_old_record'] == 'true', 'replaying an already-applied record must be a genuine no-op'
assert out['second_recovery_pass_is_a_genuine_no_op'] == 'true', 'running the full recovery pass twice must change nothing the second time'
print('log_first_redo_idempotent_torn_page: redo over an already-applied record, and a second full recovery pass, were both genuinely no-ops')

# ---- 3. A torn page is caught by its checksum, and fixed from the ----
# ---- log's own full-page image. ----
assert out['torn_page_is_genuinely_caught'] == 'true', 'a page torn by a partial write must be caught by its checksum'
assert out['full_page_write_fixes_it'] == 'true', 'restoring the log\'s own full-page image must genuinely fix the torn page'
print('log_first_redo_idempotent_torn_page: a torn page was genuinely caught by its checksum, and genuinely fixed from the log\'s own full-page image')

print('all write-ahead-rule-lsns examples pass')
