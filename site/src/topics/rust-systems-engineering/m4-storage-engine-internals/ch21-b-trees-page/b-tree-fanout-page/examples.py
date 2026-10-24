"""Every example shown in the "B+-tree fanout and page splits" reel,
compiled and run. Run: python3 examples.py (CI runs it too). Needs rustc
>= 1.85 (edition 2024; the pinned CI toolchain is 1.97.0) and cargo on
PATH. This example builds a real, minimal B+-tree over fixed-size byte
buffers playing the role of disk pages, each page a self-describing
header plus a fixed-size entry array. Rust sources live in
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


bt_bin = cargo_build('btree_fanout_split_depth_truncation')
out = parse(run(bt_bin))

# ---- 1. Inserting past a page's own fill factor genuinely triggers a ----
# ---- real split, propagating a new separator key into the parent. ----
assert out['was_single_leaf_before'] == 'true', 'the tree should still be one leaf page right up to the overflowing insert'
assert out['a_split_actually_allocated_a_new_page'] == 'true', 'overflowing a leaf should genuinely allocate a new page'
assert out['a_root_became_internal_with_a_real_separator'] == 'true', 'the split should genuinely push a new separator up into a new internal root'
assert out['a_every_original_key_still_found_after_the_split'] == 'true', 'every key should still be found correctly after the split'
print('btree_fanout_split_depth_truncation: an overflowing leaf genuinely split and pushed a real separator key up into a new root, with every key still found afterward')

# ---- 2. The tree's own depth stays small even as the number of ----
# ---- inserted records grows into the thousands. ----
assert out['b_depth_stayed_within_a_handful_of_levels'] == 'true', 'the tree should stay only a few levels deep even at thousands of records'
assert out['b_every_record_is_still_correctly_found'] == 'true', 'every inserted record should still be found correctly at scale'
print('btree_fanout_split_depth_truncation: the tree genuinely stayed only a few levels deep after thousands of inserts, with every record still found correctly')

# ---- 3. A higher fill factor genuinely reduces how often the same ----
# ---- sequential workload splits, and a separator key stored with ----
# ---- prefix/suffix truncation genuinely takes less space than one ----
# ---- stored in full, while still routing identically. ----
assert out['fill_factor_smooths_the_rate_of_splits'] == 'true', 'a higher fill factor should genuinely cause fewer splits over the same sequential insert workload'
assert out['c_truncated_separator_is_genuinely_smaller'] == 'true', 'a truncated separator should genuinely take fewer bytes than a full copy of the key'
assert out['c_truncated_separator_routes_identically_to_the_full_one'] == 'true', 'the truncated separator should still route every test key exactly like the full one'
print('btree_fanout_split_depth_truncation: a higher fill factor genuinely caused fewer splits, and a truncated separator genuinely took less space while routing identically to the full key')

print('all b-tree-fanout-page examples pass')
