"""Every example shown in the "Feature flags and their combinatorics"
reel, built and run. Run: python3 examples.py (CI runs it too). Needs
rustc >= 1.85 (edition 2024; the pinned CI toolchain is 1.97.0) and
cargo on PATH. Two real workspaces live in examples/ next to this
file: feature_demo/ (resolver 3, the edition-2024 default) runs the
additive/non-additive feature-unification claims; feature_demo_legacy/
(no resolver set, edition 2018, resolver 1's own real historical
default) reproduces the real dev-dependency feature leak resolver 2
and 3 fixed. Every path is resolved from __file__."""
import os
import shutil
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
CARGO = shutil.which('cargo')
RUSTC = shutil.which('rustc')
assert CARGO, 'cargo is required'
assert RUSTC, 'rustc is required (CI installs 1.97.0 with rustup)'

MODERN = os.path.join(HERE, 'examples', 'feature_demo')
LEGACY = os.path.join(HERE, 'examples', 'feature_demo_legacy')


def build_and_run(workspace, args):
    r = subprocess.run([CARGO, 'build'] + args, cwd=workspace, capture_output=True, text=True, timeout=120)
    assert r.returncode == 0, f'cargo build {args} should succeed in {workspace}:\n{r.stdout}\n{r.stderr}'
    binary = os.path.join(workspace, 'target', 'debug', 'consumer_b')
    out = subprocess.run([binary], capture_output=True, text=True, timeout=10)
    assert out.returncode == 0, f'{binary} should run'
    return out.stdout.strip()


def clean(workspace):
    shutil.rmtree(os.path.join(workspace, 'target'), ignore_errors=True)


# ---- 1. A non-additive feature, requested only by a sibling crate, ----
# ---- silently changes an unrelated crate's own existing behavior. ----
clean(MODERN)
alone = build_and_run(MODERN, ['-p', 'consumer_b'])
assert alone == 'plain', f"consumer_b built alone should genuinely say 'plain', got {alone!r}"

clean(MODERN)
together_non_additive = build_and_run(MODERN, ['-p', 'consumer_a', '-p', 'consumer_b', '--features', 'consumer_a/fast_mode'])
assert together_non_additive == 'fast', \
    f"consumer_b, unified with a sibling's non-additive feature request, should genuinely say 'fast', got {together_non_additive!r}"
print(f"feature-flags-their-combinatorics: consumer_b said {alone!r} alone, but {together_non_additive!r} once built together with a sibling requesting a non-additive feature it never asked for")

# ---- 2. The identical comparison, with a genuinely additive feature ----
# ---- instead, changes nothing: consumer_b's own existing output stays put. ----
clean(MODERN)
alone_again = build_and_run(MODERN, ['-p', 'consumer_b'])
assert alone_again == 'plain', f"consumer_b built alone should again genuinely say 'plain', got {alone_again!r}"

clean(MODERN)
together_additive = build_and_run(MODERN, ['-p', 'consumer_a', '-p', 'consumer_b', '--features', 'consumer_a/fancy'])
assert together_additive == alone_again, \
    f"consumer_b's own existing output should genuinely stay unchanged under a purely additive feature, got {together_additive!r} vs {alone_again!r}"
print(f"feature-flags-their-combinatorics: consumer_b said {alone_again!r} both alone and unified with a sibling's purely additive feature request; nothing changed")

# ---- 3. The real dev-dependency surprise: under the old, pre-resolver-2 ----
# ---- default, a test-only feature leaks into the plain, non-test build. ----
clean(LEGACY)
legacy_result = build_and_run(LEGACY, ['-p', 'consumer_b'])
assert legacy_result == 'fast', \
    f"under the old default resolver, the dev-dependency's own feature should genuinely leak into the plain build, got {legacy_result!r}"

clean(MODERN)
modern_result = build_and_run(MODERN, ['-p', 'consumer_b'])
assert modern_result == 'plain', \
    f"under resolver 3, the identical dev-dependency feature should genuinely not leak into the plain build, got {modern_result!r}"
print(f"feature-flags-their-combinatorics: the identical dev-dependency feature declaration leaked into the plain build under the old resolver ({legacy_result!r}), but genuinely did not under resolver 3 ({modern_result!r})")

print('all feature-flags-their-combinatorics examples pass')
