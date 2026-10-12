"""Every example shown in the "Partial moves and destructuring as transfer" reel and Deep dive, compiled and run.
Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85 (edition 2024; the pinned CI toolchain is 1.97.0).
The Rust sources live in examples/*.rs next to this file; every path is resolved from __file__. Snippets shown on
screen are the exact text of these files (checked below against the files and against scenes.tsx); every number the
reel shows is asserted here. Nothing is skipped: a missing compiler is a failure. Diagnostics are asserted by their
header line only where the help text differs between rustc 1.97.0 and 1.99.0 (both were run for this topic)."""
import os, re, shutil, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
EX = os.path.join(HERE, 'examples')
RUSTC = shutil.which('rustc')
assert RUSTC, 'rustc is required (CI installs 1.97.0 with rustup)'
ver = subprocess.run([RUSTC, '--version'], capture_output=True, text=True).stdout.strip()
print(ver)
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
    """Compile examples/<name>.rs (cwd is the topic folder, so diagnostics read `--> examples/name.rs:L:C`)."""
    out = os.path.join(WD, f'{tag or name}_{edition}')
    cmd = [RUSTC, '--edition', edition, '--color', 'never', *extra, os.path.join('examples', name + '.rs'), '-o', out]
    r = subprocess.run(cmd, cwd=HERE, capture_output=True, text=True)
    if ok:
        assert r.returncode == 0, f'{name}.rs should compile under {edition}:\n{r.stderr}'
    else:
        assert r.returncode != 0, f'{name}.rs should NOT compile under {edition}'
    return out, r.stderr


def run(binary, *args, timeout=60):
    return subprocess.run([binary, *args], capture_output=True, text=True, timeout=timeout)


def run_ok(name, edition='2024', extra=()):
    binary, _ = compile_rs(name, edition, extra=extra)
    r = run(binary)
    assert r.returncode == 0, f'{name} exited {r.returncode}: {r.stderr}'
    return r.stdout


def fails(name, edition, *needles):
    _, err = compile_rs(name, edition, ok=False)
    for n in needles:
        assert n in err, f'{name} ({edition}): expected {n!r} in rustc output:\n{err}'
    return err


def lines_of(out):
    return dict(l.split(': ', 1) for l in out.strip().split('\n') if ': ' in l)


def _norm(line):
    line = re.sub(r'/\*.*?\*/', '', line)
    line = re.sub(r'//.*$', '', line)
    return re.sub(r'\s+', '', line)


def shown(file, *lines):
    """Snippet lines shown on screen. Each must be a line of examples/<file>.rs (ignoring comments and spacing), and,
    once scenes.tsx exists, appear verbatim in scenes.tsx."""
    norms = {_norm(l) for l in src(file).split('\n')}
    for l in lines:
        assert _norm(l) in norms, f'{file}.rs has no line {l!r}'
        if SCENES_SRC is not None:
            assert l in SCENES_SRC, f'scenes.tsx has no line {l!r}'


# ---------------------------------------------------------------------------------------------------------------
# Constants the reel shows.
BUF_CAP = 64 * 1024            # "64 KiB"
assert BUF_CAP == 65536
MSGS = 1000                    # messages per loop
MSG_LEN = 261                  # a small message: 5 header bytes + 256 payload bytes
HEADER_LEN = MSG_LEN - 5
assert HEADER_LEN == 256

# E1 · the baseline pipeline (step 2): one allocation for a thousand messages.
out = run_ok('base').strip()
assert out == 'base: allocs=1 bytes=65536 header=Header { kind: 7, len: 256 } free=1', out

# E2 · the naive guard with rustc's clone, against the Option guard (steps 1, 12) and the sizes (steps 2, 12).
out = lines_of(run_ok('guard_clone'))
assert out['clone'] == 'allocs=1001 bytes=65601536 deallocs=1000', out
assert out['take'] == 'allocs=1 bytes=65536 deallocs=0', out
assert out['sizes'] == 'Buf=32 Option<Buf>=32 Header=8 Frame=40 PooledBuf=40', out
assert 65601536 == 1001 * 65536 and 65536 == 64 * 1024
CLONE_ALLOCS, CLONE_BYTES = 1001, 65601536
BUF_BYTES, HEADER_BYTES, FRAME_BYTES, GUARD_BYTES = 32, 8, 40, 40

# E3 · the guard's drop cannot move the buffer out (step 1).
err = fails('guard_e0507', '2024',
            'error[E0507]: cannot move out of `self.buf` which is behind a mutable reference',
            'consider cloning the value if the performance cost is acceptable')

# E4 · partial moves traced (steps 4, 5; Deep dive).
out = run_ok('partial')
t = lines_of(out)
assert t['partial'] == '["moved", "body", "head", "tail"]', t
assert t['early'] == '["body", "after-drop", "head", "tail"]', t
assert t['reinit'] == '["whole", "head", "body2", "tail", "body"]', t
assert t['destructure'] == '["destructured", "body", "head", "tail"]', t
assert t['frame'] == 'header=Header { kind: 7, len: 256 } payload.len=261 id=1', t
assert t['frame deallocs'] == 'at move=0 at drop(payload)=1', t
assert t['box'] == 'allocs for Box::new+get=2 deallocs right after *bx=0', t
assert 'box field move ok id=2' in out

# E5 · a field moved on one path only (step 5).
t = lines_of(run_ok('condpartial'))
assert t['moved path'] == '["body", "end", "head", "tail"]', t
assert t['kept path'] == '["end", "head", "body", "tail"]', t

# E6 · the MIR of a field moved on one path: one flag, one guarded drop, one unconditional drop (step 5, Deep dive).
mir_out = os.path.join(WD, 'flag_mir.mir')
r = subprocess.run([RUSTC, '--edition', '2024', '--crate-type', 'lib', '--emit=mir', '-C', 'opt-level=0', '-o', mir_out, os.path.join('examples', 'flag_mir.rs')], cwd=HERE, capture_output=True, text=True)
assert r.returncode == 0, r.stderr
mir = open(mir_out).read()
body = mir[mir.index('fn maybe('):]
assert re.search(r'_\d+ = const false;', body) and re.search(r'_\d+ = const true;', body), body
assert re.search(r'switchInt\(copy _\d+\)', body), body
assert re.search(r'drop\(\(_2\.1: T\)\)', body) and re.search(r'drop\(\(_2\.0: T\)\)', body), body
FLAG_LINES = [l.strip() for l in body.split('\n') if re.search(r'const (false|true);|switchInt\(copy|drop\(\(_2\.[01]: T\)\)', l)]

# E7 · E0382 in its partial forms (steps 3, 15, 16).
err = fails('e0382_partial', '2024',
            'error[E0382]: use of partially moved value: `frame`',
            'value partially moved here', 'value used here after partial move',
            'partial move occurs because `frame.payload` has type `Buf`, which does not implement the `Copy` trait')
err = fails('e0382_pattern', '2024',
            'error[E0382]: borrow of partially moved value: `frame`',
            'borrow this binding in the pattern to avoid moving the value')
fails('update', '2024', 'error[E0382]: use of partially moved value: `frame`')
err = fails('wild_move', '2024', 'error[E0382]: borrow of partially moved value: `slot`', 'if let Some(ref _b) = slot {}')

# E8 · E0507 and friends (steps 6, 8, 9; Deep dive). Headers only where help text moved between 1.97.0 and 1.99.0.
fails('e0507_shared', '2024', 'cannot move out of `r.payload` which is behind a shared reference')
fails('e0507_mut', '2024', 'error[E0507]: cannot move out of `frame.payload` which is behind a mutable reference',
      'consider borrowing here', 'consider cloning the value if the performance cost is acceptable')
fails('e0507_match', '2024', 'cannot move out of `slot.buf` as enum variant `Some` which is behind a mutable reference')
fails('e0507_rc', '2024', 'cannot move out of an `Rc`')
fails('e0507_vec', '2024', 'cannot move out of index of `Vec<Buf>`')
fails('e0508', '2024', 'error[E0508]: cannot move out of type `[Buf; 2]`, a non-copy array')
fails('ref_fix', '2024', 'error[E0507]: cannot move out of `*buf` which is behind a shared reference', 'consider calling `.as_ref()`')
fails('prove5_fail', '2024', 'cannot move out of `*b` which is behind a shared reference', 'consider cloning the value if the performance cost is acceptable')

# E8b · step 6: exactly the three index, Rc and reference lines fail; the Box line compiles.
err = fails('which_moves', '2024', 'aborting due to 3 previous errors')
heads = re.findall(r'error\[E0507\]: (.*)\n\s+--> examples/which_moves\.rs:(\d+):', err)
assert len(heads) == 3, err
which = src('which_moves').split('\n')
bad_lines = [which[int(n) - 1].strip() for _, n in heads]
assert bad_lines == ['let a = v[0];', 'let b = *shared;', 'let d = r.payload;'], bad_lines
assert [h for h, _ in heads] == ['cannot move out of index of `Vec<Buf>`', 'cannot move out of an `Rc`', 'cannot move out of `r.payload` which is behind a shared reference'], heads
box_line = [i + 1 for i, l in enumerate(which) if l.strip() == 'let c = *boxed;'][0]
assert box_line not in [int(n) for _, n in heads]   # no error points at the Box line

# E9 · E0509 (steps 7, 8; Deep dive).
err = fails('e0509_destructure', '2024', 'error[E0509]: cannot move out of type `PooledBuf<\'_>`, which implements the `Drop` trait', '...and here', 'consider borrowing the pattern binding')
fails('e0509_field', '2024', 'error[E0509]: cannot move out of type `PooledBuf<\'_>`, which implements the `Drop` trait')
fails('e0509_into_inner', '2024', 'error[E0509]: cannot move out of type `PooledBuf<\'_>`, which implements the `Drop` trait', 'let PooledBuf { ref buf, .. } = self;')
out = run_ok('drop_copy_field').split('\n')
assert out[:2] == ['id=7 id2=7 name=a', 'drop lease 7'], out

# E10 · the box allocation is freed at scope end, not at the move (step 6 explain).
t = run_ok('box_move').strip().split('\n')
assert t == ['inside scope deallocs=0', 'after scope deallocs=1 f.id=1'], t

# E11 · the idioms cost nothing (step 10) and the capacity trap (step 11).
t = run_ok('idioms').strip().split('\n')
assert t == ['Option::take: allocs=0 deallocs=0 slot_is_none=true',
             'mem::take(bytes): allocs=0 deallocs=0 left_cap=0 taken_cap=65536 before=65536',
             'mem::replace(payload, pooled): allocs=0 deallocs=0',
             'mem::swap: allocs=0 deallocs=0',
             'Option::replace: allocs=0 deallocs=0 old_was_none=true',
             'mem::replace(bytes, with_capacity): allocs=1 deallocs=1',
             'pop/swap_remove/remove: allocs=0 deallocs=0 len=0',
             'default Vec cap=0 String cap=0'], t

# E12 · the guard field designs and the take trap (steps 11, 22).
t = run_ok('variants').strip().split('\n')
assert t == ['replace guard allocs=1', 'manuallydrop guard allocs=1', 'sizes ReplaceGuard=40 MdGuard=40 PooledBuf=40', 'take-bytes trap allocs=1000 bytes=326275'], t
assert 326275 == 65536 + 999 * 261
TRAP_ALLOCS, TRAP_BYTES = 1000, 326275
vsrc = src('variants')
assert vsrc.count('unsafe {') == 1 and '// SAFETY:' in vsrc, 'exactly one unsafe block, with a SAFETY comment'

# E13 · the error path, by hand and guarded (step 14); into_inner (step 13).
t = run_ok('errpath').strip().split('\n')
assert t == ['by hand: errors=100 allocs=100 bytes=6553600', 'guarded: errors=100 allocs=1 bytes=65536', 'into_inner loop allocs=1'], t
assert 6553600 == 100 * 65536

# E14 · Prove it: 10,000 messages, one in fifty malformed (2%).
t = run_ok('prove6').strip().split('\n')
assert t[:2] == ['by hand: errors=200 allocs=200 bytes=13107200', 'guarded: errors=200 allocs=1 bytes=65536'], t
assert 13107200 / 1048576 == 12.5 and 13107200 == 200 * 65536
assert 200 / 10000 == 0.02

# E15 · the handoff: a second guard on the same pool (step 23).
fails('second_guard', '2024', 'error[E0499]: cannot borrow `pool` as mutable more than once at a time')

# E16 · binding modes, measured with type_name_of_val (steps 15, 17).
t = lines_of(run_ok('modes'))
assert t['&frame'] == 'header &Header payload &Buf', t
assert t['&mut frame'] == 'header &mut Header payload &mut Buf', t
assert t['& &mut frame'] == 'header &Header payload &Buf', t
assert t['ref by value'] == 'payload &Buf frame still whole: 1', t
assert t['frame'] == 'header Header payload Buf', t
assert t['as_ref'] == '&Buf' and t['as_mut'] == '&mut Buf' and t['&slot'] == '&Buf', t
assert t['wildcard'] == 'slot still Some = true', t
assert t['by value'] == 'Buf', t
assert 'array destructure ids 3 4' in run_ok('modes')

# E17 · one pattern, two editions (steps 18, 19).
for name in ('me_mut_short', 'me_mut'):
    binary, err = compile_rs(name, '2021')
    assert run(binary).stdout.strip() == 'copy edited: 99 original: 0'
    assert 'warning' not in err, err                                    # silent in 2021 unless the lint is on
    e24 = fails(name, '2024', 'error: cannot mutably bind by value within an implicitly-borrowing pattern', '`mut` binding modifier not allowed when implicitly borrowing')
for name in ('me_ref', 'me_ref_short'):
    binary, _ = compile_rs(name, '2021')
    assert run(binary).stdout.strip() == '1'
    fails(name, '2024', 'cannot explicitly borrow within an implicitly-borrowing pattern')
binary, _ = compile_rs('me_refmut', '2021')
fails('me_refmut', '2024', 'cannot explicitly borrow within an implicitly-borrowing pattern', 'cannot explicitly dereference within an implicitly-borrowing pattern')
binary, _ = compile_rs('me_and', '2021')
assert run(binary).stdout.strip() == '1 7'
fails('me_and', '2024', 'cannot explicitly dereference within an implicitly-borrowing pattern')
fails('me_mutopt', '2021', 'error[E0507]: cannot move out of a mutable reference')
fails('me_mutopt', '2024', 'cannot mutably bind by value within an implicitly-borrowing pattern', 'error[E0507]: cannot move out of a mutable reference')
e = fails('me_mut_short', '2024', 'let &Frame { mut header, .. } = &frame;')
for name in ('me_lint_short', 'me_lint'):
    binary, err = compile_rs(name, '2021')
    assert 'cannot mutably bind by value within an implicitly-borrowing pattern in Rust 2024' in err and 'this changes meaning in Rust 2024' in err, err
for name in ('me_fixed_short', 'me_fixed'):
    for ed in ('2021', '2024'):
        assert run_ok(name, ed).strip() == 'copy edited: 99 original: 0'
assert run_ok('me_ok2024', '2024').strip() == 'edited in place: 99'
assert run_ok('me_rewrites', '2024').strip() == 'rewrites ok: 0 1 1'
EDITION_SHIPPED = 1.85                                                  # Rust 2024 shipped in Rust 1.85.0 (Edition Guide)
assert RUSTC_MINOR >= (1, 85)
# the lint is allow-by-default and part of rust-2024-compatibility
w = subprocess.run([RUSTC, '-W', 'help'], capture_output=True, text=True).stdout
assert re.search(r'rust-2024-incompatible-pat\s+allow', w), 'rust_2024_incompatible_pat should be allow-by-default'

# E18 · Prove it 1.
assert run_ok('prove1').strip() == 'prove1: ["head", "end", "tail", "body"]'

# E19 · Prove it 2: four fixes for a stage that hands its buffer out through &mut self.
fails('sink_e0507', '2024', 'error[E0507]: cannot move out of `self.buf` which is behind a mutable reference')
fails('sink_destr', '2024', 'error[E0507]: cannot move out of `self.buf` which is behind a mutable reference')
fails('sink_take', '2024', 'error[E0277]: the trait bound `Buf: Default` is not satisfied')
assert run_ok('sink_ok').strip() == 'replace allocs=0 clone allocs=1 clone_cap=261 id_left=0'

# E20 · Prove it 3: the placeholder design fills the pool with placeholders.
t = lines_of(run_ok('prove3'))
assert t['placeholder'] == 'allocs=8 free=1001 placeholders=1000', t
assert t['option'] == 'allocs=1 free=1', t

# E21 · Prove it 5: the owning loops allocate nothing (each delta measured around its loop only).
t = run_ok('prove5_ok').strip()
assert t == 'drain allocs=0 into_iter allocs=0 pool=4 kept_cap_ok=true', t

# E22 · edge cases found by the fact-check: Box.
t = run_ok('box_refill').strip().split('\n')
assert t == ['Box<Buf>: allocs=1 bytes=32', 'after *boxed: deallocs=0; refilled: deallocs=0 id=9 moved id=1', 'match *box moved out id=2'], t
assert BUF_BYTES == 32
fails('box_use_after', '2024', 'error[E0382]: borrow of moved value: `*boxed`')
fails('box_match_ref', '2024', 'error[E0308]: mismatched types')
fails('box_drop_field', '2024', "error[E0509]: cannot move out of type `PooledBuf<'_>`, which implements the `Drop` trait")

# E23 · refilling a partly moved struct needs `let mut`; a wholly moved one cannot be refilled.
fails('reinit_notmut', '2024', 'error[E0594]: cannot assign to `p.body`, as `p` is not declared as mutable')
fails('reinit_moved', '2024', 'error[E0382]: assign to part of moved value: `p`')

# E24 · struct update syntax and `let _`.
assert run_ok('update_copy').strip() == 'update copied header only: frame whole id=1 next id=2'
assert run_ok('wild_let').strip() == 'let _: frame whole id=1 guard alive id=1'
fails('update_drop', '2024', "error[E0509]: cannot move out of type `PooledBuf<'_>`, which implements the `Drop` trait")

# ---------------------------------------------------------------------------------------------------------------
# Snippets on screen: each line is a line of its file and, once scenes.tsx exists, appears verbatim there.
shown('guard_e0507', "struct NaiveGuard<'p> { buf: Buf,", "pool: &'p mut Pool }", 'impl Drop for NaiveGuard<\'_> {', 'fn drop(&mut self) {', 'self.pool.put(self.buf);')
shown('base', 'let mut buf = pool.get();', 'fill(&mut buf, &msg);', 'let h = inspect(&buf);', 'let buf = consume(buf);', 'pool.put(buf);')
shown('e0382_partial', 'let payload = frame.payload; // move', 'let h = frame.header;        // copy', 'send(frame);                 // E0382')
shown('partial', 'let body = p.body;', 'p.body = Trace("body2");', 'let whole = p;')
shown('condpartial', 'if c { let b = p.body; }')
shown('which_moves', 'let a = v[0];', 'let b = *shared;', 'let c = *boxed;', 'let d = r.payload;')
shown('e0509_destructure', 'let PooledBuf { buf, pool } = guard;')
shown('e0509_into_inner', 'fn into_inner(self) -> Buf {', 'let PooledBuf { buf, .. } = self;', 'buf.expect("present")')
shown('e0507_mut', 'fn swap_payload(frame: &mut Frame,', 'fresh: Buf) -> Buf {', 'let old = frame.payload; // E0507', 'frame.payload = fresh;', 'old')
shown('variants', 'let mut buf = pool.get();', 'fill(&mut buf, &msg);', 'let bytes = mem::take(&mut buf.bytes);', 'drop(bytes); // written elsewhere', 'pool.put(buf);')
shown('pooled', 'impl Drop for PooledBuf<\'_> {', 'fn drop(&mut self) {', 'if let Some(b) = self.buf.take() {', 'self.pool.put(b);', 'pub fn into_inner(mut self) -> Buf {', 'self.buf.take().expect("present")')
shown('errpath', 'let mut buf = pool.get();', 'fill(&mut buf, src);', 'let h = check(&buf)?; // Err: buf dropped', 'pool.put(consume(buf));')
shown('modes', 'let Frame { ref payload, .. } = frame;')
shown('e0382_pattern', 'let Frame { header, payload } = frame;')
shown('wild_move', 'let slot = Some(pool.get());', 'if let Some(_) = slot {}', 'if let Some(_b) = slot {}')
shown('me_mut_short', 'let Frame { mut header, .. } = &frame;', 'header.len = 99;')
shown('me_ref_short', 'let Frame { ref payload, .. } = &frame;')
shown('me_refmut', 'let [&x] = &[&1u8];')
shown('me_rewrites', 'let &Frame { mut header, .. } = &frame;', 'let Frame { payload, .. } = &frame;', 'let &[&x] = &[&1u8];')
shown('prove1', 'let Parts { tail, .. } = p;', 'drop(p.head);')
shown('sink_e0507', 'struct Sink { buf: Buf, written: usize }', 'fn finish(&mut self) -> Buf {', 'self.buf // E0507')

# Numbers the reel quotes that are not measured above (a source, a count of options, a step number, a prose figure).
PROSE = {'edition': 2024, 'rfc': 2005, 'syllabus clauses': 4, 'rules in the recap': 6}
assert PROSE['rfc'] == 2005 and PROSE['edition'] == 2024
# Counts in the prose of captions, each a plain fact of the drawings: three fields, two guards, four idioms, four stages.
FIELDS, GUARDS, IDIOMS, STAGES, RESERVATIONS, LANES = 3, 2, 4, 4, 3, 2
assert (FIELDS, GUARDS, IDIOMS, STAGES, RESERVATIONS, LANES) == (3, 2, 4, 4, 3, 2)
# Chapter numbers of this course that the reel cites for later material: Rc and Arc (4), unsafe Rust and ManuallyDrop::take (30).
CHAPTER_RC, CHAPTER_UNSAFE = 4, 30
assert (CHAPTER_RC, CHAPTER_UNSAFE) == (4, 30)
BUFS_AFTER_PROVE5, LIMIT_WORDS = 4, 90

print(f'ok: {ver}; pipeline 1 allocation, clone guard {CLONE_ALLOCS} ({CLONE_BYTES:,} bytes), take guard 1; take trap {TRAP_ALLOCS} allocations ({TRAP_BYTES:,} bytes); '
      f'error path 100 against 1; sizes Buf={BUF_BYTES} Header={HEADER_BYTES} Frame={FRAME_BYTES} PooledBuf={GUARD_BYTES}; MIR flag lines: {len(FLAG_LINES)}')
