#!/usr/bin/env bash
# Every example in the "Software delivery workflow" refresher, run for real in a temporary directory.
# Run: bash examples.sh   (examples.py runs it and re-asserts every number the reel shows).
# Needs bash, git, jq, awk, diff, python3 with pip, and network access to PyPI once (it installs pytest
# from a hash-locked requirements file, which is itself one of the examples). Writes only to a temp dir.
# KEEP=<dir> bash examples.sh  also copies the lab kit (clean.py, tests, gate.yml, lock file, data) to <dir>.
set -euo pipefail
export LC_ALL=C PYTHONDONTWRITEBYTECODE=1 PIP_DISABLE_PIP_VERSION_CHECK=1 PIP_NO_INPUT=1 PIP_ROOT_USER_ACTION=ignore
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1
export GIT_AUTHOR_NAME=Ada GIT_AUTHOR_EMAIL=ada@example.com GIT_COMMITTER_NAME=Ada GIT_COMMITTER_EMAIL=ada@example.com
W=$(mktemp -d); trap 'rm -rf "$W"' EXIT
check() { [ "$1" = "$2" ] || { echo "FAIL: $3: got '$1', expected '$2'" >&2; exit 1; }; }
out() { echo "$1=$2"; }
need() { command -v "$1" > /dev/null || { echo "FAIL: $1 is not installed" >&2; exit 1; }; }
for t in bash git jq awk sort uniq diff python3 sha256sum; do need "$t"; done
out v_bash "${BASH_VERSION}"
out v_git "$(git --version | awk '{print $3}')"
out v_jq "$(jq --version)"
out v_python "$(python3 -c 'import platform; print(platform.python_version())')"
out v_pip "$(python3 -m pip --version | awk '{print $2}')"

# The lab kit lives in $K; every command below runs from it, as the CI job would from a checkout.
K="$W/kit"; mkdir -p "$K/tests"; cd "$K"
# A `python` on PATH, as setup-python gives the CI job, so gate.yml's commands run here unchanged.
mkdir -p "$W/bin"; ln -s "$(command -v python3)" "$W/bin/python"; export PATH="$W/bin:$PATH"

# ---- 1 · The data and the script: topic 3's, byte for byte -------------------------------------------
# 10,000 order events; 6,000 paid, 2,500 shipped, 1,300 cancelled, 200 refunded; 40 spelt badly.
cat > gen_events.py << 'PY'
import json, random, sys
rng = random.Random(1)
statuses = ['paid'] * 6000 + ['shipped'] * 2500 + ['cancelled'] * 1300 + ['refunded'] * 200
rng.shuffle(statuses)
dirty = {'paid': ('Paid', 25), 'shipped': ('SHIPPED ', 10), 'refunded': (' refunded', 5)}
for status, (spelt, n) in dirty.items():
    idx = [i for i, s in enumerate(statuses) if s == status][:n]
    for i in idx:
        statuses[i] = spelt
with open(sys.argv[1], 'w') as f:
    for i, status in enumerate(statuses, 1):
        f.write(json.dumps({'order_id': i, 'customer_id': rng.randint(1, 900), 'status': status,
                            'amount': round(rng.uniform(5, 300), 2), 'event_time': f'2026-01-01T{i % 24:02d}:{i % 60:02d}:00Z'}) + '\n')
PY
python3 gen_events.py order_events.jsonl
cat > clean.py << 'PY'
#!/usr/bin/env python3
import json, sys


def clean(value):
    return value.strip().lower()


def main(path):
    try:
        f = open(path)
    except OSError:
        print(f'clean.py: cannot open {path}', file=sys.stderr)
        return 1
    counts = {}
    with f:
        for line in f:
            status = clean(json.loads(line)['status'])
            counts[status] = counts.get(status, 0) + 1
    for status in sorted(counts):
        print(f'{counts[status]:7d} {status}')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1]))
PY
out events "$(wc -l < order_events.jsonl | tr -d ' ')"; check "$(wc -l < order_events.jsonl | tr -d ' ')" 10000 'ten thousand events'
out data_sha256_12 "$(sha256sum order_events.jsonl | cut -c1-12)"
# The planted bug: topic 2's commit 731, "clean: simplify normalisation", which drops .strip().
mkdir -p "$W/bad"; sed 's/value.strip().lower()/value.lower()/' clean.py > "$W/bad/clean.py"
check "$(grep -c 'value.lower()' "$W/bad/clean.py")" 1 'the bad copy differs in one line'

# ---- 2 · Tools from a lock file with hashes -------------------------------------------------------------
# Resolved once with: pip install --dry-run --ignore-installed --only-binary :all: --report report.json pytest==9.1.1
# (pip 24.0, Python 3.11; every wheel is py3-none-any). Each line: an exact == pin plus the sha256 of the wheel.
cat > requirements-dev.lock << 'REQ'
# Test tools for the refresher gate. Install with:
#   python -m pip install --require-hashes --only-binary :all: -r requirements-dev.lock
pytest==9.1.1 \
    --hash=sha256:37a86b45efb9a47a61a36449063e8e18d0cab3161329fc099eb21783169c4f0c
iniconfig==2.3.1 \
    --hash=sha256:9121e2c1fdb355232495be3194c8dfe87ccc2d5dee45947b78e68f499790d7a7
packaging==26.3 \
    --hash=sha256:d7193f7c8e4e93f444fde0262bf90af30e16fa0ad0ad44cb553c87339b23cd1c
pluggy==1.6.0 \
    --hash=sha256:e920276dd6813095e9377c0bc5566d94c932c33b27a3e3945d8389c374dd4746
pygments==2.21.0 \
    --hash=sha256:2363c69b61c4a97c838da3b130dcd6468f4848992b21a82f2a63ec34377137d9
REQ
# --target keeps the tools out of any system environment; PYTHONPATH points python at them.
python3 -m pip install --quiet --require-hashes --only-binary :all: --target "$W/tools" -r requirements-dev.lock
export PYTHONPATH="$W/tools"
out v_pytest "$(python3 -m pytest --version 2>&1 | awk '{print $2}')"
check "$(python3 -m pytest --version 2>&1 | awk '{print $2}')" 9.1.1 'pytest from the lock'
out lock_pins "$(grep -c '==' requirements-dev.lock)"

# ---- 3 · A unit test pins the bug ---------------------------------------------------------------------
cat > tests/test_clean.py << 'PY'
import pytest

from clean import clean


# The 40 bad spellings in order_events.jsonl, one case each: each runs (and fails) on its own.
@pytest.mark.parametrize('raw, expected', [
    ('paid', 'paid'),
    ('Paid', 'paid'),
    ('SHIPPED ', 'shipped'),
    (' refunded', 'refunded'),
])
def test_clean_status(raw, expected):
    assert clean(raw) == expected


def test_clean_email():  # topic 2's oracle, as a pytest test
    assert clean('  Ada@Example.COM ') == 'ada@example.com'
PY
cat > tests/test_main.py << 'PY'
import pytest

from clean import main


@pytest.fixture
def events(tmp_path):  # a fresh three-line file for every test that asks for it
    path = tmp_path / 'events.jsonl'
    path.write_text('{"status": "Paid"}\n{"status": " refunded"}\n{"status": "paid"}\n')
    return path


def test_main_counts(events, capsys):
    assert main(str(events)) == 0
    assert capsys.readouterr().out == '      2 paid\n      1 refunded\n'
PY
PT() { python3 -m pytest -q -p no:cacheprovider "$@"; }
set +e; PT tests > "$W/good.txt" 2>&1; good_rc=$?; set -e
out pytest_good_rc "$good_rc"; check "$good_rc" 0 'pytest exits 0 when every test passes'
out pytest_good "$(tail -1 "$W/good.txt" | sed 's/ in [0-9.]*s.*//')"
# The same tests against the bad clean.py: does the test actually fail when the code is broken?
cp -r tests "$W/bad/"; cd "$W/bad"
set +e; PT tests > "$W/bad.txt" 2>&1; bad_rc=$?; set -e; cd "$K"
out pytest_bad_rc "$bad_rc"; check "$bad_rc" 1 'pytest exits 1 when a test fails'
out pytest_bad "$(tail -1 "$W/bad.txt" | sed 's/ in [0-9.]*s.*//')"
out pytest_bad_ids "$(grep '^FAILED' "$W/bad.txt" | sed 's/^FAILED tests\///; s/ - .*//' | tr '\n' ';' | sed 's/;$//')"
mkdir -p "$W/empty"; set +e; (cd "$W/empty" && PT .) > /dev/null 2>&1; none_rc=$?; set -e
out pytest_none_rc "$none_rc"; check "$none_rc" 5 'no tests collected exits 5'
# Exit 2 is not only "the run is wrong": a clean.py that doesn't even import stops collection with 2, not 1.
mkdir -p "$W/broken"; cp -r tests "$W/broken/"; printf 'def clean(value)\n    return value\n' > "$W/broken/clean.py"
set +e; (cd "$W/broken" && PT tests) > /dev/null 2>&1; broken_rc=$?; set -e
out pytest_import_error_rc "$broken_rc"; check "$broken_rc" 2 'a syntax error in the code under test: collection error, exit 2'
# A flaky test: it depends on set order, which depends on the string hash seed (random per process).
mkdir -p "$W/flaky"; cp clean.py "$W/flaky/"
cat > "$W/flaky/test_flaky.py" << 'PY'
from clean import clean

ROWS = ['Paid', ' refunded', 'paid']


def test_statuses():  # written after one run that happened to pass
    assert list({clean(r) for r in ROWS}) == ['paid', 'refunded']


def test_statuses_sorted():
    assert sorted({clean(r) for r in ROWS}) == ['paid', 'refunded']
PY
flaky_pass=0; sorted_pass=0; pattern=''
for seed in $(seq 0 19); do
  if (cd "$W/flaky" && PYTHONHASHSEED=$seed PT test_flaky.py::test_statuses > /dev/null 2>&1); then flaky_pass=$((flaky_pass + 1)); pattern="${pattern}P"; else pattern="${pattern}F"; fi
  (cd "$W/flaky" && PYTHONHASHSEED=$seed PT test_flaky.py::test_statuses_sorted > /dev/null 2>&1) && sorted_pass=$((sorted_pass + 1))
done
out flaky_pass_of_20 "$flaky_pass"; out sorted_pass_of_20 "$sorted_pass"
# The cause itself, on screen: the order the same set gives under two seeds (one failing, one passing).
for seed in 1 2; do out "flaky_order_seed_$seed" "$(cd "$W/flaky" && PYTHONHASHSEED=$seed python3 -c "from clean import clean; print(list({clean(r) for r in ['Paid', ' refunded', 'paid']}))")"; done
out flaky_pattern "$pattern"   # pass (P) or fail (F) for PYTHONHASHSEED=0..19; same code every time
check "$sorted_pass" 20 'the sorted version passes under every seed'
[ "$flaky_pass" -gt 0 ] && [ "$flaky_pass" -lt 20 ] || { echo "FAIL: flaky test should pass for some seeds only" >&2; exit 1; }

# Test layout: `python -m pytest` puts the current directory on sys.path, so a flat layout tests the checked-out source tree.
# In a src layout the package is not importable until it is installed, so a forgotten install fails loudly (exit 2) instead of passing.
mkdir -p "$W/flat" "$W/srcl/src/pkg" "$W/srcl/tests"
printf 'def f():\n    return 1\n' > "$W/flat/pkg.py"; printf 'from pkg import f\n\n\ndef test_f():\n    assert f() == 1\n' > "$W/flat/test_pkg.py"
set +e; (cd "$W/flat" && python3 -m pytest -q -p no:cacheprovider > /dev/null 2>&1); flat_rc=$?
printf 'def f():\n    return 1\n' > "$W/srcl/src/pkg/__init__.py"; cp "$W/flat/test_pkg.py" "$W/srcl/tests/"
(cd "$W/srcl" && python3 -m pytest -q -p no:cacheprovider > /dev/null 2>&1); src_rc=$?
(cd "$W/srcl" && PYTHONPATH="src:$W/tools" python3 -m pytest -q -p no:cacheprovider > /dev/null 2>&1); src_path_rc=$?; set -e
out layout_flat_rc "$flat_rc"; check "$flat_rc" 0 'flat layout: the working tree is tested without any install'
out layout_src_rc "$src_rc"; check "$src_rc" 2 'src layout, not installed: collection error, exit 2'
out layout_src_path_rc "$src_path_rc"; check "$src_path_rc" 0 'src layout with src on the path: passes'

# ---- 4 · CI: a chain of exit statuses ---------------------------------------------------------------
# GitHub runs each `run:` in a new shell: `bash -e {0}` when no shell is set, `bash --noprofile --norc -eo pipefail {0}`
# with `shell: bash`. Run the same step file both ways.
printf 'jq -r .status missing.jsonl | sort | uniq -c\n' > "$W/step_pipe.sh"
set +e
bash -e "$W/step_pipe.sh" > /dev/null 2>&1; default_rc=$?
bash --noprofile --norc -eo pipefail "$W/step_pipe.sh" > /dev/null 2>&1; explicit_rc=$?
set -e
out step_default_shell_rc "$default_rc"; check "$default_rc" 0 'no shell set: the failed jq is hidden'
out step_shell_bash_rc "$explicit_rc"; check "$explicit_rc" 2 'shell: bash: pipefail reports jq'"'"'s 2'
# A multi-line run: lines share one shell, and -e stops at the first failing line.
printf 'echo line1\nfalse\necho line3\n' > "$W/step_lines.sh"
set +e; lines_out=$(bash -e "$W/step_lines.sh" 2>&1); lines_rc=$?; set -e
out multiline_rc "$lines_rc"; check "$lines_rc" 1 'set -e stops at the failing line'
out multiline_printed "$(echo "$lines_out" | tr '\n' ' ' | sed 's/ $//')"; check "$lines_out" line1 'line 3 never ran'
# With pipefail, an early `| head` can fail the step: seq dies of SIGPIPE (128 + 13 = 141). Topic 3 executed this too.
set +e; bash --noprofile --norc -eo pipefail -c 'seq 1 100000 | head -1 > /dev/null'; head_rc=$?; set -e
out pipefail_head_rc "$head_rc"

# ---- 5 · The gate: one job, two oracles -------------------------------------------------------------
# The workflow file. Its run lines are executed below exactly as written (grep checks they match).
mkdir -p .github/workflows
cat > .github/workflows/gate.yml << 'YML'
name: refresher-gate
on:
  push:
    branches: [main]
  pull_request:
permissions:
  contents: read           # the least this job needs: it only reads the repository
concurrency:
  group: gate-${{ github.ref }}
  cancel-in-progress: true  # a newer push to the same branch cancels the older, superseded run
jobs:
  gate:
    runs-on: ubuntu-latest
    timeout-minutes: 10      # a hang guard, not the ten-minute speed target
    defaults:
      run:
        shell: bash            # bash --noprofile --norc -eo pipefail {0}: a failing pipe stage fails the step
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1      # v7.0.1
      - uses: actions/setup-python@5fda3b95a4ea91299a34e894583c3862153e4b97  # v7.0.0
        with:
          python-version: '3.13'
          cache: pip
          cache-dependency-path: requirements-dev.lock
      - name: Install the locked test tools
        run: python -m pip install --require-hashes --only-binary :all: -r requirements-dev.lock
      - name: Oracle 1, the unit tests
        run: python -m pytest -q
      - name: Oracle 2, the shell pipeline must equal the script
        run: |
          jq -r .status order_events.jsonl | awk '{ $1 = $1; print tolower($0) }' | LC_ALL=C sort | uniq -c > shell.txt
          python clean.py order_events.jsonl > py.txt
          diff shell.txt py.txt
YML
STEP_TEST='python -m pytest -q'
STEP_DIFF=$(sed -n '/Oracle 2/,$p' .github/workflows/gate.yml | sed -n 's/^          //p')
for s in "$STEP_TEST" "jq -r .status order_events.jsonl" "diff shell.txt py.txt" "python -m pip install --require-hashes --only-binary :all: -r requirements-dev.lock"; do
  grep -qF -- "$s" .github/workflows/gate.yml || { echo "FAIL: gate.yml lacks: $s" >&2; exit 1; }
done
check "$(grep -c 'shell: bash' .github/workflows/gate.yml)" 1 'one shell: bash default for every step'
check "$(grep -c '^permissions:' .github/workflows/gate.yml)" 1 'least-privilege token'
check "$(grep -c 'cancel-in-progress: true' .github/workflows/gate.yml)" 1 'superseded runs are cancelled'
check "$(grep -c 'branches: \[main\]' .github/workflows/gate.yml)" 1 'push runs only on main, pull requests on their own'
# job DIR: run the two oracle steps as GitHub would (one new shell each, explicit bash), stop at the first failure.
job() {
  local dir=$1 n=0 rc=0 s; local -a steps=("$STEP_TEST" "$STEP_DIFF")
  for s in "${steps[@]}"; do
    n=$((n + 1))
    printf '%s\n' "$s" > "$W/step.sh"
    set +e; (cd "$dir" && bash --noprofile --norc -eo pipefail "$W/step.sh" > /dev/null 2>&1); rc=$?; set -e
    [ "$rc" -eq 0 ] || { echo "fail step $n rc $rc skipped $(( ${#steps[@]} - n ))"; return; }
  done
  echo "pass steps $n"
}
cp order_events.jsonl "$W/bad/"
out job_good "$(job "$K")"; check "$(job "$K")" 'pass steps 2' 'both oracles agree: good'
out job_bad "$(job "$W/bad")"; check "$(job "$W/bad")" 'fail step 1 rc 1 skipped 1' 'the test fails, the diff step never runs'
# Both oracles on their own, on the good and the bad clean.py: they agree each time.
oracle_test() { (cd "$1" && python3 -m pytest -q -p no:cacheprovider tests/test_clean.py > /dev/null 2>&1); echo $?; }
oracle_diff() { (cd "$1" && printf '%s\n' "$STEP_DIFF" > "$W/d.sh" && bash --noprofile --norc -eo pipefail "$W/d.sh" > /dev/null 2>&1); echo $?; }
set +e; ag="$(oracle_test "$K") $(oracle_diff "$K")"; ab="$(oracle_test "$W/bad") $(oracle_diff "$W/bad")"; set -e
out agree_good "$ag"; check "$ag" '0 0' 'good: test 0, diff 0'
out agree_bad "$ab"; check "$ab" '1 1' 'bad: test 1, diff 1'
out bad_py_groups "$(cd "$W/bad" && python3 clean.py order_events.jsonl | wc -l | tr -d ' ')"
check "$(cd "$W/bad" && python3 clean.py order_events.jsonl | wc -l | tr -d ' ')" 6 'without strip: 6 groups, not 4'
# What the diff step shows on the bad commit: refunded 200 -> 195 + 5 ' refunded', shipped 2500 -> 2490 + 10 'shipped '.
out bad_py "$(cd "$W/bad" && python3 clean.py order_events.jsonl | tr -s ' ' | sed 's/^ //' | tr '\n' ';' | sed 's/;$//')"
check "$(cd "$W/bad" && python3 clean.py order_events.jsonl | grep -c '^ *195 refunded$')" 1 '195 refunded'
check "$(cd "$W/bad" && python3 clean.py order_events.jsonl | grep -c '^ *2490 shipped$')" 1 '2490 shipped'
out bad_diff_lines "$(cd "$W/bad" && diff shell.txt py.txt | grep -c '^[<>]' || true)"
# When the oracles disagree: one event whose status starts with a no-break space (U+00A0). Python's strip() removes it,
# awk's field splitting (space, tab, newline) doesn't. The unit tests still pass; the diff fails; the gate goes red.
mkdir -p "$W/nbsp"; cp -r clean.py tests order_events.jsonl "$W/nbsp/"
python3 -c "import json; print(json.dumps({'order_id': 10001, 'customer_id': 1, 'status': ' paid', 'amount': 9.99, 'event_time': '2026-01-01T00:00:00Z'}))" >> "$W/nbsp/order_events.jsonl"
set +e; an="$(oracle_test "$W/nbsp") $(oracle_diff "$W/nbsp")"; set -e
out agree_nbsp "$an"; check "$an" '0 1' 'no-break space: tests pass, diff fails'
out nbsp_job "$(job "$W/nbsp")"; check "$(job "$W/nbsp")" 'fail step 2 rc 1 skipped 0' 'the job fails at the diff step'
out nbsp_py_paid "$(cd "$W/nbsp" && python3 clean.py order_events.jsonl | grep -c '^ *6001 paid$')"
out nbsp_shell_groups "$(wc -l < "$W/nbsp/shell.txt" | tr -d ' ')"

# ---- 6 · Bisect with each oracle over topic 2's history: the same commit --------------------------------
# The history is topic 2's, built by the same fast-import stream, so the culprit is again 784d178.
cd "$W"; git init -q -b main big; cd big; git config advice.detachedHead false
N=1000; BAD=731
{
  for i in $(seq 1 $N); do
    msg="change $i"; body='def clean(email):\n    return email.strip().lower()\n'
    [ "$i" -ge $BAD ] && body='def clean(email):\n    return email.lower()\n'
    [ "$i" -eq $BAD ] && msg='clean: simplify normalisation'
    content=$(printf "$body")
    printf 'commit refs/heads/main\nmark :%d\ncommitter Ada <ada@example.com> 1767268800 +0000\ndata %d\n%s\n' "$i" $((${#msg} + 1)) "$msg"
    [ "$i" -gt 1 ] && printf 'from :%d\n' $((i - 1))
    printf 'M 100644 inline clean.py\ndata %d\n%s\n' $((${#content} + 1)) "$content"
    printf 'M 100644 inline CHANGES\ndata %d\n%s\n' $((${#i} + 1)) "$i"
  done
} | git fast-import --quiet
git checkout -q main
ROOT1=$(git rev-list --max-parents=0 HEAD)
# Both oracles live outside the repository. The diff oracle counts with the checked-out clean() (topic 3's main).
mkdir -p "$W/oracle"; cp "$K/tests/test_clean.py" "$W/oracle/"
( cd "$K" && jq -r .status order_events.jsonl | awk '{ $1 = $1; print tolower($0) }' | LC_ALL=C sort | uniq -c ) > "$W/oracle/shell.txt"
cat > "$W/oracle/count.py" << 'PY'
import json, sys
sys.path.insert(0, '.')
from clean import clean
counts = {}
for line in open(sys.argv[1]):
    status = clean(json.loads(line)['status'])
    counts[status] = counts.get(status, 0) + 1
for status in sorted(counts):
    print(f'{counts[status]:7d} {status}')
PY
bis() { git bisect start HEAD "$ROOT1" > /dev/null; git bisect run sh -c "$1" > "$W/bis.txt" 2>&1
        echo "$(git log -1 --format='%h' refs/bisect/bad) $(git rev-list --count refs/bisect/bad) $(grep -c '^running ' "$W/bis.txt")"
        git bisect reset > /dev/null 2>&1; }
by_test=$(bis "python3 -m pytest -q -p no:cacheprovider $W/oracle/test_clean.py")
by_diff=$(bis "python3 $W/oracle/count.py $K/order_events.jsonl | diff -q $W/oracle/shell.txt - > /dev/null")
out bisect_by_test "$by_test"; out bisect_by_diff "$by_diff"
check "$by_test" '784d178 731 10' 'pytest oracle: 784d178, commit 731, 10 runs'
check "$by_diff" "$by_test" 'the diff oracle names the same commit'

# ---- 7 · Version numbers: the bump, the order, the ranges ---------------------------------------------
cd "$W"
python3 - << 'PY'
from packaging.specifiers import SpecifierSet
from packaging.version import Version

def bump(v, change):
    major, minor, patch = map(int, v.split('.'))
    if change == 'breaking':
        return f'{major + 1}.0.0'
    if change == 'feature':
        return f'{major}.{minor + 1}.0'
    return f'{major}.{minor}.{patch + 1}'

def out(k, v):
    print(f'{k}={v}')

# shopclean 1.5.0 is the library; each change decides the next number (semver 2.0.0 rules 6 to 8).
out('bump_fix', bump('1.5.0', 'fix'))            # blank lines skipped (1.5.0 crashes on one): a backward compatible bug fix
out('bump_feature', bump('1.5.0', 'feature'))    # a new optional argument top_n= (1.5.0 already added min_orders=): backward compatible functionality
out('bump_breaking', bump('1.5.0', 'breaking'))  # output column status renamed to order_status
assert bump('1.5.0', 'fix') == '1.5.1' and bump('1.5.0', 'feature') == '1.6.0' and bump('1.5.0', 'breaking') == '2.0.0'
vs = ['1.10.0', '1.9.0', '2.0.0', '1.9.1']
out('sort_text', ' '.join(sorted(vs)))
out('sort_version', ' '.join(sorted(vs, key=Version)))
assert sorted(vs, key=Version) == ['1.9.0', '1.9.1', '1.10.0', '2.0.0']
for spec in ['>=1.4', '>=1.4,<2', '~=1.4', '~=1.4.0', '~=0.4', '~=0.4.0', '==1.5.0']:
    ok = [v for v in ['1.4.0', '1.5.0', '2.0.0', '0.4.2', '0.5.0', '1.4.9'] if v in SpecifierSet(spec)]
    out('spec_' + spec.replace(',', '_'), ' '.join(ok))

# What breaks a data consumer, besides a renamed column: each reader below is fine on 1.5.0's output and breaks on a change
# that keeps the column names. (The new status value is 'returned': the shop's four statuses are paid, shipped, cancelled, refunded.)
v1 = [{'status': 'paid', 'orders': 6000, 'amount': 12.5}, {'status': 'shipped', 'orders': 2500, 'amount': 20.0}]
LABEL = {'paid': 'P', 'shipped': 'S', 'cancelled': 'C', 'refunded': 'R'}

def total_orders(rows):
    return sum(r['orders'] for r in rows)

def labels(rows):  # an exhaustive mapping of the documented statuses
    return [LABEL[r['status']] for r in rows]

def by_position(rows):  # a reader that takes columns by position
    return [(status, orders) for status, orders, amount in (tuple(r.values()) for r in rows)]

def revenue(rows):
    return sum(r['amount'] for r in rows)

assert total_orders(v1) == 8500 and labels(v1) == ['P', 'S'] and len(by_position(v1)) == 2 and revenue(v1) == 32.5

def fails(fn, rows):
    try:
        fn(rows)
    except Exception as e:
        return type(e).__name__
    return 'silent'

out('break_enum', fails(labels, v1 + [{'status': 'returned', 'orders': 3, 'amount': 1.0}]))   # a new enum value
out('break_type', fails(total_orders, [dict(r, orders=str(r['orders'])) for r in v1]))         # int to str
out('break_null', fails(total_orders, [dict(v1[0], orders=None), v1[1]]))                      # now nullable
out('break_column', fails(by_position, [dict(r, currency='EUR') for r in v1]))                 # an added column
out('break_meaning', fails(revenue, [dict(r, amount=r['amount'] * 100) for r in v1]))          # euros to cents: no error
assert revenue([dict(r, amount=r['amount'] * 100) for r in v1]) == 3250.0
PY

# ---- 8 · Drift, pins and hashes, with a local package index -------------------------------------------
# shopclean, the shop's cleaning library, as wheels built byte-for-byte reproducibly (fixed times, no compression).
mkdir -p "$W/index"
cat > "$W/mkwheel.py" << 'PY'
import base64, hashlib, sys, zipfile
LIB = {
    '1.4.0': "def summarise(lines):\n    counts = {}\n    for line in lines:\n        s = clean(json.loads(line)['status'])\n        counts[s] = counts.get(s, 0) + 1\n    return [{'status': s, 'orders': n} for s, n in sorted(counts.items())]\n",
    '1.5.0': "def summarise(lines, min_orders=0):\n    counts = {}\n    for line in lines:\n        s = clean(json.loads(line)['status'])\n        counts[s] = counts.get(s, 0) + 1\n    return [{'status': s, 'orders': n} for s, n in sorted(counts.items()) if n >= min_orders]\n",
    '2.0.0': "def summarise(lines, min_orders=0):\n    counts = {}\n    for line in lines:\n        s = clean(json.loads(line)['status'])\n        counts[s] = counts.get(s, 0) + 1\n    return [{'order_status': s, 'orders': n} for s, n in sorted(counts.items()) if n >= min_orders]\n",
}
LIB['2.1.0rc1'] = LIB['2.0.0']  # a pre-release, for the pre-release rule only
version, outdir = sys.argv[1], sys.argv[2]
extra = sys.argv[3] if len(sys.argv) > 3 else ''
code = f"import json\n__version__ = '{version}'\n\n\ndef clean(value):\n    return value.strip().lower()\n\n\n{LIB[version]}{extra}"
di = f'shopclean-{version}.dist-info'
files = {
    'shopclean/__init__.py': code,
    f'{di}/METADATA': f'Metadata-Version: 2.1\nName: shopclean\nVersion: {version}\n',
    f'{di}/WHEEL': 'Wheel-Version: 1.0\nGenerator: examples.sh\nRoot-Is-Purelib: true\nTag: py3-none-any\n',
}
record = ''.join(f"{p},sha256={base64.urlsafe_b64encode(hashlib.sha256(c.encode()).digest()).rstrip(b'=').decode()},{len(c.encode())}\n" for p, c in files.items())
files[f'{di}/RECORD'] = record + f'{di}/RECORD,,\n'
with zipfile.ZipFile(f'{outdir}/shopclean-{version}-py3-none-any.whl', 'w', zipfile.ZIP_STORED) as z:
    for p, c in files.items():
        info = zipfile.ZipInfo(p, date_time=(2026, 1, 1, 0, 0, 0))
        info.external_attr = 0o644 << 16
        z.writestr(info, c)
PY
python3 "$W/mkwheel.py" 1.4.0 "$W/index"; python3 "$W/mkwheel.py" 1.5.0 "$W/index"
# The application's own test: the nightly load reads the status column.
cat > "$W/app_test.py" << 'PY'
import sys
from shopclean import __version__, summarise
rows = summarise(open(sys.argv[1]))
by_status = {r['status']: r['orders'] for r in rows}
assert by_status['refunded'] == 200, by_status
print(__version__)
PY
PIPI() { python3 -m pip install --quiet --no-index --find-links "$W/index" --target "$1" "${@:2}"; }
app() { PYTHONPATH="$1" python3 "$W/app_test.py" "$K/order_events.jsonl" 2> "$W/app_err.txt"; }
echo 'shopclean>=1.4' > "$W/requirements.txt"
PIPI "$W/laptop" -r "$W/requirements.txt"; out laptop_installs "$(app "$W/laptop")"   # last week: 1.5.0, passes
# A week later shopclean 2.0.0 renames the column. A clean machine resolves the same file again.
python3 "$W/mkwheel.py" 2.0.0 "$W/index"
PIPI "$W/ci" -r "$W/requirements.txt"
set +e; app "$W/ci" > /dev/null; ci_rc=$?; set -e
out ci_installs "$(PYTHONPATH="$W/ci" python3 -c 'import shopclean; print(shopclean.__version__)')"
out ci_app_rc "$ci_rc"; check "$ci_rc" 1 'same requirements, new day: the app test fails'
out ci_app_error "$(tail -1 "$W/app_err.txt")"
# The laptop doesn't move on its own: pip leaves an installed version as-is unless --upgrade is given.
# (--dry-run with --report installs nothing, so it also runs on a PEP 668 "externally managed" Python.)
would() { PYTHONPATH="$W/laptop" python3 -m pip install --quiet --dry-run --report "$W/would.json" --no-index --find-links "$W/index" "$@" -r "$W/requirements.txt" > /dev/null 2>&1
          python3 -c "import json,sys; print(' '.join(i['metadata']['version'] for i in json.load(open(sys.argv[1]))['install']) or 'nothing')" "$W/would.json"; }
out laptop_rerun_installs "$(would)"; check "$(would)" nothing 'a re-run on the laptop keeps 1.5.0'
out laptop_upgrade_installs "$(would --upgrade)"; check "$(would --upgrade)" 2.0.0 'with --upgrade the laptop takes 2.0.0'
# The library's consumers say what they can take: a range that stops before the next major.
PIPI "$W/ranged" 'shopclean>=1.4,<2'; out range_installs "$(app "$W/ranged")"
PIPI "$W/compat" 'shopclean~=1.4'; out compat_installs "$(app "$W/compat")"
# The application pins: the exact version and the hash of the exact file, from pip's own resolver report.
python3 -m pip install --quiet --dry-run --ignore-installed --no-index --find-links "$W/index" --report "$W/report.json" 'shopclean==1.5.0'
H=$(python3 -c "import json,sys; r=json.load(open(sys.argv[1])); print(r['install'][0]['download_info']['archive_info']['hashes']['sha256'])" "$W/report.json")
H2=$(python3 -m pip hash "$W/index/shopclean-1.5.0-py3-none-any.whl" | sed -n 's/^--hash=sha256://p')
check "$H" "$H2" 'pip hash and the report agree'
check "$H" "$(sha256sum "$W/index/shopclean-1.5.0-py3-none-any.whl" | cut -d' ' -f1)" 'it is the sha256 of the file'
out wheel_sha256_12 "$(echo "$H" | cut -c1-12)"
printf 'shopclean==1.5.0 \\\n    --hash=sha256:%s\n' "$H" > "$W/requirements.lock"
PIPI "$W/locked" --require-hashes -r "$W/requirements.lock"; out lock_installs "$(app "$W/locked")"
# Someone republishes 1.5.0 with different contents (semver forbids it). The hash no longer matches: pip refuses.
mkdir -p "$W/tampered"; cp "$W/index/"*.whl "$W/tampered/"
python3 "$W/mkwheel.py" 1.5.0 "$W/tampered" "
import os  # republished
"
set +e; python3 -m pip install --no-index --find-links "$W/tampered" --target "$W/t2" --require-hashes -r "$W/requirements.lock" > "$W/tamper.txt" 2>&1; tamper_rc=$?; set -e
out tamper_rc "$tamper_rc"; check "$tamper_rc" 1 'hash mismatch: pip refuses'
grep -q 'DO NOT MATCH THE HASHES' "$W/tamper.txt" || { echo 'FAIL: no hash-mismatch message' >&2; exit 1; }
out tamper_message "$(grep -o 'THESE PACKAGES DO NOT MATCH THE HASHES[A-Z ]*' "$W/tamper.txt" | head -1)"
# A range with a hash. pip 24.0 refuses it for the missing == pin; pip 26.2.1 accepts the range, resolves 2.0.0 and refuses
# it for the hash mismatch (the "surprising hash mismatch" the pip docs say pinning prevents). Either way: exit 1.
printf 'shopclean>=1.4 \\\n    --hash=sha256:%s\n' "$H" > "$W/ranged.lock"
set +e; python3 -m pip install --no-index --find-links "$W/index" --target "$W/t3" --require-hashes -r "$W/ranged.lock" > "$W/ranged.txt" 2>&1; ranged_lock_rc=$?; set -e
out ranged_lock_rc "$ranged_lock_rc"; check "$ranged_lock_rc" 1 'a hashed range is refused while 2.0.0 is on the index'
out ranged_lock_message "$(grep -o -m1 'must have their versions pinned with ==\|THESE PACKAGES DO NOT MATCH THE HASHES' "$W/ranged.txt")"   # printed, not asserted: depends on the pip version
# The same hashed range on last week's index (1.4.0 and 1.5.0 only): pip 24.0 refuses (none), pip 26.2.1 installs 1.5.0.
mkdir -p "$W/lastweek"; cp "$W/index/shopclean-1.4.0-py3-none-any.whl" "$W/index/shopclean-1.5.0-py3-none-any.whl" "$W/lastweek/"
set +e; python3 -m pip install --quiet --no-index --find-links "$W/lastweek" --target "$W/t4" --require-hashes -r "$W/ranged.lock" > /dev/null 2>&1; set -e
out ranged_lock_lastweek_installs "$(PYTHONPATH="$W/t4" python3 -c 'import shopclean; print(shopclean.__version__)' 2>/dev/null || echo none)"   # printed, not asserted
# Pre-releases: PEP 440 lets one in when it is the only match. pip 26.2.1 does (2.1.0rc1); pip 24.0 doesn't (none).
mkdir -p "$W/pre"; python3 "$W/mkwheel.py" 2.1.0rc1 "$W/pre"
set +e; python3 -m pip install --quiet --no-index --find-links "$W/pre" --target "$W/tpre" 'shopclean>=1.4' > /dev/null 2>&1; set -e
out prerelease_only_installs "$(PYTHONPATH="$W/tpre" python3 -c 'import shopclean; print(shopclean.__version__)' 2>/dev/null || echo none)"   # printed, not asserted: depends on the pip version
# pip freeze pins what is installed (here: the laptop's environment).
out freeze_laptop "$(python3 -m pip freeze --path "$W/laptop")"

# ---- 9 · Library ranges and release hygiene -------------------------------------------------------------
# A cap in a library: shoplib 1.0.0 was published when shopclean 2.0.0 did not exist, and says shopclean<2. Its metadata can't be
# loosened afterwards, so an application that wants shopclean>=2 can't install it next to shoplib, though nothing in shoplib breaks.
cat > "$W/mkdummy.py" << 'PY'
import base64, hashlib, sys, zipfile
name, version, requires, outdir = sys.argv[1:5]
di = f'{name}-{version}.dist-info'
files = {f'{name}/__init__.py': 'X = 1\n', f'{di}/METADATA': f'Metadata-Version: 2.1\nName: {name}\nVersion: {version}\nRequires-Dist: {requires}\n',
         f'{di}/WHEEL': 'Wheel-Version: 1.0\nGenerator: examples.sh\nRoot-Is-Purelib: true\nTag: py3-none-any\n'}
record = ''.join(f"{p},sha256={base64.urlsafe_b64encode(hashlib.sha256(c.encode()).digest()).rstrip(b'=').decode()},{len(c.encode())}\n" for p, c in files.items())
files[f'{di}/RECORD'] = record + f'{di}/RECORD,,\n'
with zipfile.ZipFile(f'{outdir}/{name}-{version}-py3-none-any.whl', 'w', zipfile.ZIP_STORED) as z:
    for p, c in files.items():
        info = zipfile.ZipInfo(p, date_time=(2026, 1, 1, 0, 0, 0)); z.writestr(info, c)
PY
mkdir -p "$W/capidx"; cp "$W/index/"*.whl "$W/capidx/"; python3 "$W/mkdummy.py" shoplib 1.0.0 'shopclean<2' "$W/capidx"
python3 -m pip install --quiet --no-index --find-links "$W/capidx" --target "$W/cap1" shoplib 'shopclean>=1.4'
out cap_pulls_back "$(PYTHONPATH="$W/cap1" python3 -c 'import shopclean; print(shopclean.__version__)')"; check "$(PYTHONPATH="$W/cap1" python3 -c 'import shopclean; print(shopclean.__version__)')" 1.5.0 'the cap holds shopclean back to 1.5.0'
set +e; python3 -m pip install --no-index --find-links "$W/capidx" --target "$W/cap2" shoplib 'shopclean>=2' > "$W/cap.txt" 2>&1; cap_rc=$?; set -e
out cap_conflict_rc "$cap_rc"; check "$cap_rc" 1 'an application that needs shopclean>=2 cannot install shoplib'
out cap_conflict_message "$(grep -o -m1 'conflicting dependencies\|ResolutionImpossible' "$W/cap.txt" || echo none)"
# A range is a promise about every version in it, so test the lowest one. This library declares shopclean>=1.4 but calls
# summarise(min_orders=...), which 1.5.0 added: fine with the newest version, a TypeError with the lowest.
cat > "$W/lib_test.py" << 'PY'
import sys
from shopclean import summarise
summarise(open(sys.argv[1]), min_orders=5)
PY
PIPI "$W/lib_new" 'shopclean>=1.4'; set +e
PYTHONPATH="$W/lib_new" python3 "$W/lib_test.py" "$K/order_events.jsonl" 2> /dev/null; new_rc=$?
echo 'shopclean==1.4.0' > "$W/lowest.txt"; PIPI "$W/lib_low" -c "$W/lowest.txt" 'shopclean>=1.4'
PYTHONPATH="$W/lib_low" python3 "$W/lib_test.py" "$K/order_events.jsonl" 2> "$W/lowest_err.txt"; low_rc=$?; set -e
out lowest_newest_rc "$new_rc"; check "$new_rc" 0 'the newest allowed version passes'
out lowest_rc "$low_rc"; check "$low_rc" 1 'the lowest allowed version fails'
out lowest_error "$(tail -1 "$W/lowest_err.txt" | sed "s/summarise() //")"
# Yanking (PEP 592): the maintainer marks 2.0.0 as yanked. An index page with data-yanked, read by pip from a local file.
mkdir -p "$W/yank"; cp "$W/index/shopclean-1.5.0-py3-none-any.whl" "$W/index/shopclean-2.0.0-py3-none-any.whl" "$W/yank/"
cat > "$W/yank/index.html" << 'HTML'
<a href="shopclean-1.5.0-py3-none-any.whl">shopclean-1.5.0-py3-none-any.whl</a>
<a href="shopclean-2.0.0-py3-none-any.whl" data-yanked="renamed a column in a minor release">shopclean-2.0.0-py3-none-any.whl</a>
HTML
python3 -m pip install --quiet --no-index --find-links "$W/yank/index.html" --target "$W/y1" 'shopclean>=1.4'
out yank_range_installs "$(PYTHONPATH="$W/y1" python3 -c 'import shopclean; print(shopclean.__version__)')"; check "$(PYTHONPATH="$W/y1" python3 -c 'import shopclean; print(shopclean.__version__)')" 1.5.0 'a range ignores the yanked 2.0.0'
python3 -m pip install --no-index --find-links "$W/yank/index.html" --target "$W/y2" 'shopclean==2.0.0' > "$W/yank2.txt" 2>&1
out yank_pin_installs "$(PYTHONPATH="$W/y2" python3 -c 'import shopclean; print(shopclean.__version__)')"; check "$(PYTHONPATH="$W/y2" python3 -c 'import shopclean; print(shopclean.__version__)')" 2.0.0 'an exact pin still installs the yanked 2.0.0'
out yank_pin_warns "$(grep -c -i 'yanked' "$W/yank2.txt")"
# A release can gain a file. The lock hashes the py3-none-any wheel; a more specific wheel (this interpreter's own tag) is added
# to 1.5.0. Without hashes in the index's links (a plain directory, as a simple mirror may serve) pip prefers the new file and
# refuses it; with hashes in the links (the way PyPI's pages carry them) pip picks the file whose hash is in the lock.
TAG=$(python3 -c 'import sys; print(f"cp{sys.version_info[0]}{sys.version_info[1]}")')
mkdir -p "$W/gain"; cp "$W/index/shopclean-1.5.0-py3-none-any.whl" "$W/gain/"
sed "s/py3-none-any/$TAG-none-any/g" "$W/mkwheel.py" > "$W/mkwheel_tag.py"
python3 "$W/mkwheel_tag.py" 1.5.0 "$W/gain" "
NEW_FILE = True
"
set +e; python3 -m pip install --no-index --find-links "$W/gain" --target "$W/g1" --require-hashes -r "$W/requirements.lock" > "$W/gain1.txt" 2>&1; gain_dir_rc=$?; set -e
H_NEW=$(sha256sum "$W/gain/shopclean-1.5.0-$TAG-none-any.whl" | cut -d' ' -f1)
{ printf '<a href="shopclean-1.5.0-py3-none-any.whl#sha256=%s">a</a>\n' "$H"; printf '<a href="shopclean-1.5.0-%s-none-any.whl#sha256=%s">b</a>\n' "$TAG" "$H_NEW"; } > "$W/gain/index.html"
python3 -m pip install --quiet --no-index --find-links "$W/gain/index.html" --target "$W/g2" --require-hashes -r "$W/requirements.lock"
out gain_dir_rc "$gain_dir_rc"; check "$gain_dir_rc" 1 'no hashes in links: pip prefers the added file and refuses it'
out gain_links_installs "$(PYTHONPATH="$W/g2" python3 -c 'import shopclean; print(shopclean.__version__)')"; check "$(PYTHONPATH="$W/g2" python3 -c 'import shopclean; print(shopclean.__version__)')" 1.5.0 'hashes in links: the locked file is chosen'
check "$(PYTHONPATH="$W/g2" python3 -c 'import shopclean; print(hasattr(shopclean, "NEW_FILE"))')" False 'it is the locked file, not the added one'
# pip's own lock command (experimental since pip 25.1) writes the standard pylock.toml (PEP 751). The system pip here is older,
# so the command runs from a venv with the current pip (26.2.1).
python3 -m venv "$W/pip26"; "$W/pip26/bin/python" -m pip install --quiet pip==26.2.1
"$W/pip26/bin/python" -m pip lock --quiet --no-index --find-links "$W/index" -o "$W/pylock.toml" 'shopclean==1.5.0' > /dev/null 2>&1
out pip_lock_version "$("$W/pip26/bin/python" -m pip --version | awk '{print $2}')"
out pip_lock_has_hash "$(grep -c "sha256 = \"$H\"" "$W/pylock.toml")"; check "$(grep -c "sha256 = \"$H\"" "$W/pylock.toml")" 1 'pylock.toml carries the wheel digest'
out pip_lock_has_pin "$(grep -c '^version = "1.5.0"' "$W/pylock.toml")"
"$W/pip26/bin/python" -m pip install --quiet --no-index --find-links "$W/index" --target "$W/pl" -r "$W/pylock.toml"
out pip_lock_installs "$(PYTHONPATH="$W/pl" python3 -c 'import shopclean; print(shopclean.__version__)')"

# The lab kit, for the reader to keep.
if [ -n "${KEEP:-}" ]; then mkdir -p "$KEEP"; cp -r "$K/." "$KEEP/"; rm -rf "$KEEP/__pycache__" "$KEEP/tests/__pycache__" "$KEEP/.pytest_cache" "$KEEP/shell.txt" "$KEEP/py.txt"; echo "kept=$KEEP"; fi
echo ok
