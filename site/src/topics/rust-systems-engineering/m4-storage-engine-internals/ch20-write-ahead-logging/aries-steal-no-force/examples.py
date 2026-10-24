"""Every example shown in the "ARIES steal/no-force recovery" reel,
compiled and run. Run: python3 examples.py (CI runs it too). Needs rustc
>= 1.85 (edition 2024; the pinned CI toolchain is 1.97.0) and cargo on
PATH. This example builds a real, minimal ARIES-style recovery: analysis,
redo, and undo passes over a log with both a committed and an
uncommitted transaction, compensation log records, and a fuzzy
checkpoint bounding the redo scan. Rust sources live in
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


aries_bin = cargo_build('aries_analysis_redo_undo')
out = parse(run(aries_bin))

# ---- 1. Redo reapplies every update, committed or not; it does not ----
# ---- itself distinguish winners from losers. ----
assert out['redo_reapplies_the_losers_updates_too'] == 'true', 'redo should reapply an uncommitted transaction\'s own updates too, not just a committed one\'s'
print('aries_analysis_redo_undo: redo genuinely reapplied the loser transaction\'s own updates too, before undo ever ran')

# ---- 2. A fuzzy checkpoint bounds how much of the log redo must visit, ----
# ---- without changing the final, recovered state. ----
assert out['checkpoint_bounded_redo_visited_fewer_records'] == 'true', 'starting redo from the checkpoint\'s own bound should visit fewer records than a full scan'
assert out['checkpoint_bounded_redo_reached_the_identical_state'] == 'true', 'the checkpoint-bounded redo should still reach the identical final state as a full scan'
print('aries_analysis_redo_undo: redo starting from the fuzzy checkpoint\'s own bound genuinely visited fewer records, reaching the identical final state')

# ---- 3. A second crash partway through undo is recovered from the ----
# ---- compensation log records already written, without repeating or ----
# ---- skipping any of the undo work. ----
assert out['undo_was_not_repeated_or_skipped'] == 'true', 'undo across two recovery attempts should write exactly as many CLRs as the loser\'s own updates, no more and no fewer'
assert out['page_c_has_exactly_one_clr'] == 'true', 'the update undone just before the second crash should never be undone a second time'
assert out['final_state_matches_an_uninterrupted_undo'] == 'true', 'the final state after the second recovery should match an uninterrupted, single-pass undo exactly'
print('aries_analysis_redo_undo: a second crash partway through undo was genuinely recovered from its own compensation log records, without repeating or skipping any of the undo work')

print('all aries-steal-no-force examples pass')
