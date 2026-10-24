"""Every example shown in the "Snapshot visibility over version chains"
reel, compiled and run. Run: python3 examples.py (CI runs it too). Needs
rustc >= 1.85 (edition 2024; the pinned CI toolchain is 1.97.0) and
cargo on PATH. This example builds a real, minimal version chain and a
real visibility check driven by a reader's own snapshot. Rust sources
live in examples/runtime-demo/ next to this file; every path is
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


chain_bin = cargo_build('snapshot_visibility_version_chain')
out = parse(run(chain_bin))

# ---- 1. Visibility is a function of version metadata plus the reader's ----
# ---- own snapshot, never "the newest row." ----
assert out['a_visibility_tracks_snapshot_not_newest_row'] == 'true', 'a reader should keep seeing its own snapshot-visible version, not the chain\'s newest row'
newest_before_commit = int(out['newest_before_commit'])
reader_sees_before_commit = int(out['reader_sees_before_commit'])
reader_sees_after_commit = int(out['reader_sees_after_commit'])
fresh_sees = int(out['fresh_sees'])
assert newest_before_commit != reader_sees_before_commit, 'the chain\'s own newest row should genuinely differ from what an older snapshot is allowed to see'
assert reader_sees_before_commit == reader_sees_after_commit, 'a reader\'s own snapshot should see the identical version whether or not a later writer has since committed'
assert fresh_sees == newest_before_commit, 'a fresh snapshot taken after the writer commits should see that writer\'s own committed version'
print(f'snapshot_visibility_version_chain: an older reader\'s snapshot genuinely kept seeing {reader_sees_before_commit} while the chain\'s own newest row already read {newest_before_commit}, and a fresh snapshot taken after that writer committed genuinely saw {fresh_sees}')

# ---- 2. A writer creates a brand-new version instead of overwriting the ----
# ---- one an existing reader may still need. ----
assert out['b_old_version_never_overwritten'] == 'true', 'a superseded version\'s own xmin and value should never be touched by a later update, only its xmax'
chain_len_before = int(out['chain_len_before_second_update'])
chain_len_after = int(out['chain_len_after_second_update'])
assert chain_len_after == chain_len_before + 1, 'an update should genuinely append exactly one new version, never replace an existing one in place'
print(f'snapshot_visibility_version_chain: a later update genuinely left the superseded version\'s own xmin and value untouched and appended a new version instead, growing the chain from {chain_len_before} to {chain_len_after}')

# ---- 3. A reader's snapshot, once taken, keeps returning the identical, ----
# ---- correct version across any number of further commits. ----
assert out['c_long_lived_reader_stable'] == 'true', 'a long-lived reader\'s snapshot should keep seeing the identical version across further, unrelated commits'
reader_sees_after_two_more_commits = int(out['reader_sees_after_two_more_commits'])
fresh_now_sees = int(out['fresh_now_sees'])
assert reader_sees_before_commit == reader_sees_after_two_more_commits, 'the original reader should still see its own original version after further commits'
assert fresh_now_sees != reader_sees_after_two_more_commits, 'a brand-new snapshot taken later should genuinely see a different, newer committed version than the long-lived reader'
print(f'snapshot_visibility_version_chain: the original reader\'s snapshot genuinely kept seeing {reader_sees_after_two_more_commits} across two further commits, while a brand-new snapshot taken at that point genuinely saw {fresh_now_sees}')

print('all snapshot-visibility-over-version examples pass')
