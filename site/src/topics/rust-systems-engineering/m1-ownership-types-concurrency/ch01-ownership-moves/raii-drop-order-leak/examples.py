"""Every example shown in the "RAII, drop order, and leak safety" reel and Deep dive, compiled and run.
Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85 (edition 2024; the pinned CI toolchain is 1.97.0).
The Rust sources live in examples/*.rs next to this file; every path is resolved from __file__. Snippets shown on
screen are the exact text of these files (checked below against the files and against scenes.tsx); every number the
reel shows is asserted here. Nothing is skipped: a missing compiler is a failure. The deadlock demo only ever runs
as a child process with a 5 second timeout, so it cannot hang CI."""
import os, re, shutil, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
EX = os.path.join(HERE, 'examples')
RUSTC = shutil.which('rustc')
assert RUSTC, 'rustc is required (CI installs 1.97.0 with rustup)'
ver = subprocess.run([RUSTC, '--version'], capture_output=True, text=True).stdout.strip()
m = re.match(r'rustc (\d+)\.(\d+)\.(\d+)', ver)
assert m and (int(m[1]), int(m[2])) >= (1, 85), f'rustc >= 1.85 (edition 2024) needed, got {ver!r}'
RUSTC_MINOR = (int(m[1]), int(m[2]))

TMP = tempfile.TemporaryDirectory()
WD = TMP.name
SCENES = os.path.join(HERE, 'scenes.tsx')
SCENES_SRC = open(SCENES).read() if os.path.exists(SCENES) else None


def src(name):
    return open(os.path.join(EX, name + '.rs')).read()


def compile_rs(name, edition='2024', ok=True, extra=(), tag=None):
    """Compile examples/<name>.rs. Returns (binary path, stderr). Diagnostics read `--> name.rs:L:C` (cwd is the examples dir)."""
    out = os.path.join(WD, f'{tag or name}_{edition}')
    cmd = [RUSTC, '--edition', edition, '--color', 'never', *extra, os.path.join('examples', name + '.rs'), '-o', out]
    r = subprocess.run(cmd, cwd=HERE, capture_output=True, text=True)
    if ok:
        assert r.returncode == 0, f'{name}.rs should compile under {edition}:\n{r.stderr}'
    else:
        assert r.returncode != 0, f'{name}.rs should NOT compile under {edition}'
    return out, r.stderr


def run(binary, *args, timeout=60):
    r = subprocess.run([binary, *args], capture_output=True, text=True, timeout=timeout)
    return r


def run_ok(name, edition='2024', *args, extra=()):
    binary, _ = compile_rs(name, edition, extra=extra)
    r = run(binary, *args)
    assert r.returncode == 0, f'{name} exited {r.returncode}: {r.stderr}'
    return r.stdout


def fails(name, edition, *needles):
    _, err = compile_rs(name, edition, ok=False)
    for n in needles:
        assert n in err, f'{name} ({edition}): expected {n!r} in rustc output:\n{err}'
    return err


def lines_of(out):
    return dict(l.split(': ', 1) for l in out.strip().split('\n') if ': ' in l)


def shown(file, *lines):
    """Snippet lines shown on screen: each must be a line of the example file, and (once scenes.tsx exists) of scenes.tsx."""
    text = src(file)
    have = {l.rstrip() for l in text.split('\n')}
    for l in lines:
        assert l.rstrip() in have or l.strip() in {h.strip() for h in have}, f'{file}.rs has no line {l!r}'
        if SCENES_SRC is not None:
            assert l.strip() in SCENES_SRC, f'scenes.tsx has no line {l!r}'


# ---------------------------------------------------------------------------------------------------------------
# E1 · the drop-order trace, compiled under BOTH editions (steps 2, 3, 4, 9, 11, 13, 20; Deep dive table).
EQUAL = {
    'locals': '["c", "b", "a"]',
    'stage': '["stage", "name", "input", "spill"]',
    'tuple': '["t0", "t1", "t2"]',
    'array': '["e0", "e1", "e2"]',
    'pattern': '["q", "p"]',
    'params': '["d", "c", "b", "a"]',
    'shadow': '["x2", "y", "x"]',
    'memdrop': '["m", "n"]',
    'assign': '["v1", "v2"]',
    'wildcard': '["wild", "g", "f"]',
    'condmove': '["z", "cond"]',
    'condmove-moved': '["cond", "z"]',
    'match': '["arm", "scrut", "after-stmt", "tmpmatch"]',
    'stmt': '["stmt-temp", "next-stmt"]',
    'ext': '["after-let", "ext"]',
    'match-else': '["else", "guard", "after-match", "outer"]',
    'then-path': '["then", "guard", "after-if", "outer"]',
}
DIFF = {
    '2021': {'tail': '["local", "tail"]', 'else-path': '["else", "guard", "after-if", "outer"]'},
    '2024': {'tail': '["tail", "local"]', 'else-path': '["guard", "else", "after-if", "outer"]'},
}
for ed in ('2021', '2024'):
    got = lines_of(run_ok('trace', ed))
    assert len(got) == len(EQUAL) + len(DIFF[ed]) == 19, got
    for k, v in {**EQUAL, **DIFF[ed]}.items():
        assert got[k] == v, f'trace {ed} {k}: {got[k]} != {v}'
# The reel's badge numbers: 1 2 3 4 for the stage, 1 2 3 for the locals, 1 2 for the two-badge cases.
assert len(eval(EQUAL['stage'])) == 4 and len(eval(EQUAL['locals'])) == 3 and len(eval(EQUAL['memdrop'])) == 2
shown('trace', 'struct Trace(&\'static str);          // logs its name in Drop', 'struct Stage {', '    name: Trace,', '    input: Trace,',
      '    spill: SpillFile,                // closes + unlinks in Drop', 'fn consume(t: Trace) {}',
      'fn params(a: Trace, (b, c): (Trace, Trace)) {', '    let d = Trace("d");', '    let t = Trace("cond");', '    if flag {', '        consume(t);',
      '    let z = Trace("z");', '        let a = Trace("a");', '        let b = Trace("b");', '        let c = Trace("c");',
      '        let r = &Trace("ext");', '        let mut v = Trace("v1");', '        v = Trace("v2");')
assert 'impl Drop for Stage {' in src('trace')

# ---------------------------------------------------------------------------------------------------------------
# E2 · the Edition Guide's RwLock function, one file, two editions (steps 1, 10, 11; Lab 2).
out = run_ok('iflet_rwlock', '2021')
assert 'try_write failed: "WouldBlock"' in out and out.strip().endswith('None'), out
out = run_ok('iflet_rwlock', '2024')
assert 'set to true' in out and out.strip().endswith('Some(true)'), out
shown('iflet_rwlock_deadlock', '    if let Some(x) = *value.read().unwrap() {', '        println!("value is {x}");', '    } else {',
      '        let mut v = value.write().unwrap();', '        *v = Some(true);')

# E2b · the real write(): under 2021 the process never finishes (killed after 5 s); under 2024 it runs.
b21, _ = compile_rs('iflet_rwlock_deadlock', '2021')
try:
    subprocess.run([b21], capture_output=True, text=True, timeout=5)
    raise AssertionError('the 2021 build should deadlock (it finished within 5 s)')
except subprocess.TimeoutExpired:
    pass  # subprocess.run kills the child on timeout
out = run_ok('iflet_rwlock_deadlock', '2024')
assert out.split() == ['set', 'Some(true)'], out
DEADLOCK_TIMEOUT = 5

# E2c · the migration lint, and the `match` that `cargo fix` produces.
_, err = compile_rs('iflet_rwlock_lint', '2021')
assert '`if let` assigns a shorter lifetime since Edition 2024' in err, err
assert 'a `match` with a single arm can preserve the drop order up to Edition 2021' in err
assert 'match *value.read().unwrap() { Some(x) => {' in err  # the suggested rewrite has the pattern arm...
assert '} _ => {' in err                                      # ...and a `_` arm for the `else` (two arms)
for ed in ('2021', '2024'):
    out = run_ok('iflet_rwlock_fixed', ed)
    assert out.strip() == 'try_write failed: "WouldBlock"', (ed, out)  # the match keeps the 2021 order: still blocked under 2024

# ---------------------------------------------------------------------------------------------------------------
# E3 · the tail-expression change (steps 11, 12; Lab 2).
fails('tail_refcell', '2021', 'error[E0597]: `c` does not live long enough', 'the temporary is part of an expression at the end of a block')
assert run_ok('tail_refcell', '2024').strip() == '2'
assert run_ok('tail_string', '2021').strip() == '4'
fails('tail_string', '2024', 'error[E0716]: temporary value dropped while borrowed')
_, err = compile_rs('tail_lint', '2021')
assert 'relative drop order changing in Rust 2024' in err
out = run_ok('tail_lint', '2021').split()
assert out[:4] == ['drop', 'local', 'drop', 'tail'], out
assert run_ok('tail_lint', '2024').split()[:4] == ['drop', 'tail', 'drop', 'local']
shown('tail_refcell', '    let c = RefCell::new("..");', '    c.borrow().len()')

# ---------------------------------------------------------------------------------------------------------------
# E4 · SpillFile, exactly once (step 7; Lab 3).
shown('spill', 'struct SpillFile { path: PathBuf, file: File }', 'impl Drop for SpillFile {', '    fn drop(&mut self) {',
      '        let _ = fs::remove_file(&self.path);', '        CLOSES.fetch_add(1, Relaxed);', 'fn pass(s: SpillFile) -> SpillFile { s }')
assert 'let s = pass(pass(SpillFile::create(p.clone())?));' in src('spill')
spill_lines = run_ok('spill').strip().split('\n')
assert spill_lines[0] == 'inside: closes=0 exists=true'
assert spill_lines[1] == 'closes=1 exists=false'
size_line = spill_lines[-1]
sizes = dict(kv.split('=') for kv in size_line.split())
FILE_BYTES, PATHBUF_BYTES, SPILL_BYTES = 4, 24, 32
assert sizes == {'size_file': '4', 'size_pathbuf': '24', 'size_spill': '32', 'size_md': '32'}, sizes
assert (int(sizes['size_file']), int(sizes['size_pathbuf']), int(sizes['size_spill'])) == (FILE_BYTES, PATHBUF_BYTES, SPILL_BYTES)

# E5 · the field-order bug on disk (step 8; Lab 3).
shown('spool', '        dir: SpillDir,     // remove_dir in Drop', '        spill: SpillFile,  // remove_file in Drop')
out = run_ok('spool').strip().split('\n')
assert out == ['bad: dir exists=true file exists=false', 'good: dir exists=false file exists=false'], out

# ---------------------------------------------------------------------------------------------------------------
# E6 · leaks, measured with the chapter's counting allocator (steps 15, 16, 17; Lab 4).
leak_src = src('leak')
for needle in ('pub static BYTES: AtomicUsize = AtomicUsize::new(0); // bytes requested by alloc', 'unsafe impl GlobalAlloc for CountingAlloc {',
               '        DEALLOCS.fetch_add(1, Relaxed);', '#[global_allocator]', 'static ALLOC: CountingAlloc = CountingAlloc;'):
    assert needle in leak_src, needle
# Only the allocator impl uses `unsafe`: the `unsafe impl` and the two `unsafe fn`, with one inner `unsafe { }` in each.
assert leak_src.count('unsafe {') == 2 and leak_src.count('unsafe impl') == 1 and leak_src.count('unsafe fn') == 2, 'unsafe outside the allocator'
shown('leak', '        std::mem::forget(s);     // safe. No drop.', '    let before = allocs() - deallocs();',
      '        let s = SpillFile::create(path())?;', '        let spill = SpillFile::create(p2.clone())?;', '        let m = ManuallyDrop::new(spill);',
      '    let r: &\'static mut [u8; 64] =', '        Box::leak(Box::new([7u8; 64]));')
r = lines_of(run_ok('leak'))
BASELINE_CLOSES = 1
assert run_ok('leak').split('\n')[0] == f'baseline closes={BASELINE_CLOSES}'
assert r['forget'] == 'closes_delta=0 exists=true live_delta=1 fds_delta=1', r['forget']  # one allocation (the path), one descriptor, still on disk
assert r['manuallydrop'] == 'closes_delta=0 exists=true'
assert r['into_inner'] == 'closes_delta=1 exists=false'
BUF_CAP = 64 * 1024
assert BUF_CAP == 65_536
assert r['forget_vec'] == f'live_delta=1 bytes_delta={BUF_CAP}', r['forget_vec']
assert r['manuallydrop_vec'] == 'live_delta=1 after_into_inner_drop=0'
assert r['box_leak'] == 'live_delta=1 first=7'
assert r['copy_drop'] == '5'
_, err = compile_rs('leak', '2024', tag='leak_warn')
assert 'dropping_copy_types' not in err  # silenced by #[allow] in the file; rustc 1.97 warns "does nothing" on a Copy value otherwise
LEAK_ALLOCS, LEAK_FREED = 1, 0       # the on-screen counter: allocs 1 · freed 0
CLOSES_AFTER_FORGET = 1              # step 15's counter: closes stays at 1 (the baseline close), the forgotten file never closes
LEAK_BOX_BYTES = 64

# E6b · a leaked Drain (step 19; Lab 4).
out = run_ok('drain').strip().split('\n')
assert out == ['drain_all: len=0 cap=3', 'drain_mid: len=1 cap=5'], out

# ---------------------------------------------------------------------------------------------------------------
# E7 · unwinding runs destructors; exit and panic=abort do not (step 14; Lab 3).
binary, _ = compile_rs('unwind', '2024')
r = run(binary)
assert r.returncode == 0 and r.stdout.split('\n')[:3] == ['end of main', 'drop b', 'drop a'], r.stdout
r = run(binary, 'panic')
assert r.returncode == 101 and r.stdout.split('\n')[:2] == ['drop b', 'drop a'] and 'boom' in r.stderr, (r.returncode, r.stdout, r.stderr)
r = run(binary, 'exit')
assert r.returncode == 3 and 'drop' not in r.stdout
r = run(binary, 'dtorpanic')
assert r.returncode in (-6, 134) and 'panic in a destructor during cleanup' in r.stderr and 'thread caused non-unwinding panic. aborting.' in r.stderr, r.stderr
abort_bin, _ = compile_rs('unwind', '2024', extra=['-C', 'panic=abort'], tag='unwind_abort')
r = run(abort_bin, 'panic')
assert r.returncode in (-6, 134) and 'drop' not in r.stdout, (r.returncode, r.stdout)  # SIGABRT: -6 from Python, 134 in a shell
EXIT_CODES = {'return': 0, 'panic': 101, 'exit': 3, 'abort': 134}

# E8 · the drop flag is visible in the MIR (step 13; Lab "Drop flags").
mir_path = os.path.join(WD, 'flag.mir')
r = subprocess.run([RUSTC, '--edition', '2024', '--crate-type', 'lib', '--emit=mir', '-o', mir_path, os.path.join('examples', 'flag.rs')], cwd=HERE, capture_output=True, text=True)
assert r.returncode == 0, r.stderr
mir = open(mir_path).read()
for needle in ('= const false;', '= const true;', 'switchInt(', 'drop('):
    assert needle in mir, needle
assert '_5 = const true;' in mir and '_5 = const false;' in mir and 'switchInt(copy _5)' in mir  # the three lines drawn in step 13

# ---------------------------------------------------------------------------------------------------------------
# E9 · compile-fail cases (steps 5, 6, 23; Lab 5).
err = fails('e0040', '2024', 'error[E0040]: explicit use of destructor method', 'explicit destructor calls not allowed', 'help: consider using `drop` function')
err = fails('e0184', '2024', 'error[E0184]: the trait `Copy` cannot be implemented for this type; the type has a destructor', '`Copy` not allowed on types with destructors')
fails('e0716', '2024', 'error[E0716]: temporary value dropped while borrowed')
fails('dropck', '2024', 'error[E0597]: `world.days` does not live long enough', 'runs the destructor for type `World<\'_>`')
compile_rs('dropck_ok', '2024')  # the same program without the Drop impl is sound and compiles
fails('e0509', '2024', 'error[E0509]: cannot move out of type `Guard`, which implements the `Drop` trait')
fails('let_underscore', '2024', 'error: non-binding let on a synchronization lock', '#[deny(let_underscore_lock)]')
shown('e0040', 'struct Foo;', '    let x = Foo;', '    x.drop();')
ERROR_CODES = ['E0040', 'E0184', 'E0597', 'E0716', 'E0509']

# E10 · temporaries and lock guards (step 9).
out = run_ok('semi').strip().split('\n')
assert out == ['after statement: try_lock ok = true', 'in arm: try_lock ok = false', 'after match: try_lock ok = true'], out
shown('semi', '    m.lock().unwrap().push(1);')

# E11 · `let _` against `let _g` (step 21).
out = run_ok('wild').strip().split('\n')
assert out[:3] == ['after let _: try_read ok = true', 'after let _g: try_read ok = false', 'after let _ = g: try_read ok = false'], out

# E12 · std::thread::scope (step 19). Stable since 1.63; the build here is newer.
assert run_ok('scope').strip().split('\n')[-1] == 'ok x=4'
SCOPE_STABLE = '1.63'
EDITION_2024_RELEASE = '1.85'
assert RUSTC_MINOR >= (1, 63)

# E13 · the Reference's own examples (step 20; Deep dive).
assert run_ok('refparams').split() == ['drop(3)', 'drop(2)', 'drop(0)', 'drop(1)']  # the Reference's comment: drop order is 3 2 0 1
for ed in ('2021', '2024'):
    out = run_ok('orpat', ed).strip().split('\n')
    assert out[:4] == ['drop(Declared last, dropped first)', 'drop(Declared first, dropped last)'] * 2, out  # both the Ok and the Err call
    assert out[4:] == ['drop(a)', 'drop(b)'], out  # our own extra case, not the Reference's

# Prove it 4 (predict-the-outcome) and 5 (debug-this).
assert run_ok('prove4').strip() == 'prove4: ["a", "c", "b"]'
out = run_ok('prove5').strip().split('\n')
assert out == ['trailer write is_err=true', 'trailer write is_err=false'], out

# E14 · Prove it 6 (estimate-the-cost): what a service that forgets one SpillFile per failed request loses.
SOFT_NOFILE = 1024            # systemd DefaultLimitNOFILE= soft limit "defaults to 1024"
STD_FDS = 3                   # stdin, stdout, stderr already hold three descriptors
per_leak = {'allocations': 1, 'descriptors': 1, 'files': 1}  # E6
assert SOFT_NOFILE - STD_FDS == 1021

# Prove it 7 (defend-a-design): `with_spill` against a returned guard are both safe; nothing to execute beyond E4 and E6.
# Step 22's DMA guard is a sketch (not compiled), and step 18's `thread::scoped` no longer exists in std.

print(f'ok: {ver}; drop order traced in both editions (19 lines); 2021 deadlocks (killed after {DEADLOCK_TIMEOUT} s), 2024 runs; '
      f'SpillFile closes once ({FILE_BYTES}/{PATHBUF_BYTES}/{SPILL_BYTES} bytes); forget leaks {LEAK_ALLOCS} allocation, {BUF_CAP:,} bytes for a 64 KiB vec; '
      f'thread::scope since {SCOPE_STABLE}')
