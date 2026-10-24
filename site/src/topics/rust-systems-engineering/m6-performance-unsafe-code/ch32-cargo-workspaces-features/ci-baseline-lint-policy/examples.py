"""Every example shown in the "CI baseline and lint policy" reel, built
and run. Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85
(edition 2024) and cargo, cargo fmt, and cargo clippy on PATH (the
pinned CI toolchain is 1.97.0, which ships both). One real two-crate
workspace lives in examples/ci_demo/ next to this file. Every path is
resolved from __file__, and the workspace's own source file is reset to
its original, committed text at the start and the end of this script,
so running it twice in a row (or after a failed run) produces the
identical real result both times.
"""
import os
import shutil
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
WORKSPACE = os.path.join(HERE, 'examples', 'ci_demo')
LIB_RS = os.path.join(WORKSPACE, 'core', 'src', 'lib.rs')

CARGO = shutil.which('cargo')
assert CARGO, 'cargo is required'

ORIGINAL = """pub fn greet(name: &str) -> String {
    format!("Hello, {name}!")
}

pub fn is_valid_feature_name(name: &str) -> bool {
    !name.is_empty() && name.chars().all(|c| c.is_ascii_lowercase() || c == '_')
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn greet_includes_the_name() {
        assert_eq!(greet("ferris"), "Hello, ferris!");
    }

    #[test]
    fn empty_name_is_not_a_valid_feature_name() {
        assert!(!is_valid_feature_name(""));
    }

    #[test]
    fn a_name_with_a_space_is_not_valid() {
        assert!(!is_valid_feature_name("fast mode"));
    }
}
"""

BADLY_FORMATTED = ORIGINAL.replace(
    'pub fn greet(name: &str) -> String {\n    format!("Hello, {name}!")\n}',
    'pub fn greet(name: &str) -> String {\n        format!("Hello, {name}!")\n}',
)

CLIPPY_VIOLATION = ORIGINAL.replace(
    'pub fn greet(name: &str) -> String {\n    format!("Hello, {name}!")\n}',
    'pub fn greet(name: &str) -> String {\n    return format!("Hello, {name}!");\n}',
)

REGRESSED = ORIGINAL.replace(
    "pub fn is_valid_feature_name(name: &str) -> bool {\n    !name.is_empty() && name.chars().all(|c| c.is_ascii_lowercase() || c == '_')\n}",
    'pub fn is_valid_feature_name(_name: &str) -> bool {\n    true\n}',
)


def write(text):
    with open(LIB_RS, 'w') as f:
        f.write(text)


def run(args):
    return subprocess.run([CARGO] + args, cwd=WORKSPACE, capture_output=True, text=True, timeout=120)


write(ORIGINAL)

# ---- 1. cargo fmt --check catches a real formatting violation that ----
# ---- a plain cargo build would compile without complaint. ----
write(ORIGINAL)
clean_fmt = run(['fmt', '--check'])
assert clean_fmt.returncode == 0, f'the unmodified workspace should already be clean:\n{clean_fmt.stdout}\n{clean_fmt.stderr}'

write(BADLY_FORMATTED)
bad_fmt = run(['fmt', '--check'])
assert bad_fmt.returncode != 0, 'cargo fmt --check should genuinely fail on a real indentation violation'

write(ORIGINAL)
fixed_fmt = run(['fmt', '--check'])
assert fixed_fmt.returncode == 0, 'cargo fmt --check should genuinely pass again once the violation is reverted'
print('ci-baseline-lint-policy: cargo fmt --check failed on the real violation, and passed again once it was reverted')

# ---- 2. The workspace's own [lints] table denies a specific Clippy ----
# ---- lint, so cargo clippy genuinely fails the moment code violates it. ----
write(ORIGINAL)
clean_clippy = run(['clippy', '--workspace'])
assert clean_clippy.returncode == 0, f'the unmodified workspace should pass clippy:\n{clean_clippy.stdout}\n{clean_clippy.stderr}'

write(CLIPPY_VIOLATION)
bad_clippy = run(['clippy', '--workspace'])
assert bad_clippy.returncode != 0, 'cargo clippy should genuinely fail on a real needless_return violation'
assert 'needless_return' in bad_clippy.stderr or 'needless-return' in bad_clippy.stderr, \
    f'the failure should genuinely name the denied lint:\n{bad_clippy.stderr}'

write(ORIGINAL)
fixed_clippy = run(['clippy', '--workspace'])
assert fixed_clippy.returncode == 0, 'cargo clippy should genuinely pass again once the violation is reverted'
print('ci-baseline-lint-policy: cargo clippy failed on the real needless_return violation the workspace denies, and passed again once it was reverted')

# ---- 3. A real logic regression that still compiles cleanly is ----
# ---- caught by cargo test, not by cargo build. ----
write(ORIGINAL)
clean_build = run(['build', '--workspace'])
assert clean_build.returncode == 0, 'the unmodified workspace should build cleanly'
clean_test = run(['test', '--workspace'])
assert clean_test.returncode == 0, 'the unmodified workspace should pass its own tests'

write(REGRESSED)
regressed_build = run(['build', '--workspace'])
assert regressed_build.returncode == 0, \
    f'a logic-only regression should still genuinely compile:\n{regressed_build.stdout}\n{regressed_build.stderr}'
regressed_test = run(['test', '--workspace'])
assert regressed_test.returncode != 0, 'cargo test should genuinely fail on the real logic regression cargo build let through'

write(ORIGINAL)
restored_build = run(['build', '--workspace'])
assert restored_build.returncode == 0, 'the workspace should build cleanly again once the regression is reverted'
restored_test = run(['test', '--workspace'])
assert restored_test.returncode == 0, 'the workspace should pass its own tests again once the regression is reverted'
print('ci-baseline-lint-policy: cargo build stayed genuinely green through the real logic regression, but cargo test genuinely caught it, and both passed again once it was reverted')

write(ORIGINAL)
print('all ci-baseline-lint-policy examples pass')
