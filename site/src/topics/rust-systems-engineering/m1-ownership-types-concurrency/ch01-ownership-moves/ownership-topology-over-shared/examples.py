"""Every example shown in the "Ownership topology over shared mutability" reel and Deep dive, compiled and run.
Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85 (edition 2024; the pinned CI toolchain is 1.97.0).
The Rust sources live in examples/*.rs next to this file; every path is resolved from __file__. Every file that uses the
pipeline starts with the A.3 block of ../CHAPTER.md verbatim (asserted below). Snippets shown on screen are the exact text
of these files (checked below against the files and against scenes.tsx); every number the reel shows is asserted here, and
every number that varies from run to run is never shown. Nothing is skipped: a missing compiler is a failure. Programs that
hang on purpose (the self-deadlock) only ever run as a child process with a 5 second timeout. No timing is measured or
claimed anywhere in this topic: every number is a count."""
import glob, os, re, shutil, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
EX = os.path.join(HERE, 'examples')
RUSTC = shutil.which('rustc')
assert RUSTC, 'rustc is required (CI installs 1.97.0 with rustup)'
ver = subprocess.run([RUSTC, '--version'], capture_output=True, text=True).stdout.strip()
m = re.match(r'rustc (\d+)\.(\d+)\.(\d+)', ver)
assert m and (int(m[1]), int(m[2])) >= (1, 85), f'rustc >= 1.85 (edition 2024) needed, got {ver!r}'
print('toolchain:', ver)

TMP = tempfile.TemporaryDirectory()
WD = TMP.name
SCENES = os.path.join(HERE, 'scenes.tsx')
SCENES_SRC = open(SCENES).read() if os.path.exists(SCENES) else None


def src(name):
    return open(os.path.join(EX, name + '.rs')).read()


def compile_rs(name, edition='2024', ok=True, opt=True):
    """Compile examples/<name>.rs (with -O for programs that run, plain for compile-fail cases). Returns (binary, stderr)."""
    out = os.path.join(WD, f'{name}_{edition}')
    cmd = [RUSTC, '--edition', edition, '--color', 'never', *(['-O'] if opt and ok else []), os.path.join('examples', name + '.rs'), '-o', out]
    r = subprocess.run(cmd, cwd=HERE, capture_output=True, text=True)
    if ok:
        assert r.returncode == 0, f'{name}.rs should compile under {edition}:\n{r.stderr}'
    else:
        assert r.returncode != 0, f'{name}.rs should NOT compile under {edition}'
    return out, r.stderr


def run_ok(name, *args, edition='2024'):
    binary, _ = compile_rs(name, edition)
    r = subprocess.run([binary, *args], capture_output=True, text=True, timeout=60)
    assert r.returncode == 0, f'{name} exited {r.returncode}: {r.stderr}'
    return r.stdout


def fails(name, *needles, edition='2024'):
    _, err = compile_rs(name, edition, ok=False)
    for n in needles:
        assert n in err, f'{name}: expected {n!r} in rustc output:\n{err}'
    return err


def kv(out):
    """Every key=value token of a program's output (values without spaces)."""
    return dict(re.findall(r'(\w+)=(\S+)', out))


def code_lines(name):
    """The file's code with comments stripped (to scan for tokens that must not be there)."""
    return '\n'.join(re.sub(r'//.*$', '', l) for l in src(name).split('\n'))


def _norm(line):
    line = re.sub(r'/\*.*?\*/', '', line)
    line = re.sub(r'//.*$', '', line)
    return re.sub(r'\s+', '', line)


def shown(file, *lines):
    """Snippet lines shown on screen. Each must be a line of examples/<file>.rs (ignoring comments and spacing; a pair
    (on_screen, in_file) names the file's own text where the screen shows a shortened form) and, once scenes.tsx exists,
    appear verbatim in scenes.tsx."""
    norms = {_norm(l) for l in src(file).split('\n')}
    for l in lines:
        scene, infile = l if isinstance(l, tuple) else (l, None)
        if infile is not None:
            assert infile in src(file), f'{file}.rs has no text {infile!r}'
        else:
            assert _norm(scene) in norms, f'{file}.rs has no line {scene!r}'
        if SCENES_SRC is not None:
            assert scene in SCENES_SRC, f'scenes.tsx has no line {scene!r}'


# ---------------------------------------------------------------------------------------------------------------
# E0 · every pipeline file starts with the chapter's A.3 block, verbatim (CHAPTER.md is the contract for the names).
chapter = open(os.path.join(HERE, '..', 'CHAPTER.md')).read()
A3 = re.search(r'```rust\n(.*?)```', chapter, re.S).group(1)
assert 'pub struct Pool { free: Vec<Buf>, next_id: u32 }' in A3 and 'pub const BUF_CAP: usize = 64 * 1024;' in A3
files = sorted(os.path.basename(p)[:-3] for p in glob.glob(os.path.join(EX, '*.rs')))
assert len(files) >= 28, files
for f in files:
    if f == 'staticmut':
        continue
    assert src(f).startswith(A3), f'{f}.rs must start with the A.3 block of CHAPTER.md verbatim'
assert 'topic 3' in src('e0499')  # PooledBuf is copied from CHAPTER.md A.3 (topic 3 builds it): the guard's comment says so
MESSAGES, IN_FLIGHT, BUF_CAP, THREADS = 1000, 3, 65536, 8
assert re.search(r'MESSAGES: u32 = 1_000', src('reviewed')) and re.search(r'IN_FLIGHT: u32 = 3', src('ring')) and 'THREADS: usize = 8' in src('config')

# ---------------------------------------------------------------------------------------------------------------
# E1 · the four errors and four patches (steps 1, 2; Deep dive "How the reflex happens"); then the program that compiles.
e = fails('e0499', 'error[E0499]: cannot borrow `pool` as mutable more than once at a time', 'first mutable borrow occurs here', 'second mutable borrow occurs here')
e = fails('e0373', 'error[E0373]: closure may outlive the current function, but it borrows `pool`, which is owned by the current function',
          '`pool` is borrowed here', 'to force the closure to take ownership of `pool` (and any other referenced variables), use the `move` keyword')
e = fails('e0382_loop', 'error[E0382]: use of moved value: `pool`', 'value moved into closure here, in previous iteration of loop', 'if `Pool` implemented `Clone`, you could clone the value')
e = fails('e0596', 'error[E0596]: cannot borrow data in an `Arc` as mutable', 'trait `DerefMut` is required to modify through a dereference, but it is not implemented for `Arc<Pool>`')
out = run_ok('arcmutex_ok')
assert 'owners of the pool now: 1' in out
shown('e0499', 'let mut pool = Pool::new();', 'let a = PooledBuf::new(&mut pool);', 'let b = PooledBuf::new(&mut pool);', 'drop(b);', 'drop(a);')
LADDER = ['E0499', 'E0373', 'E0382', 'E0596']  # the four rungs on screen, in order, each one measured above

# E1b · move closures (step 13): with `move` it compiles and the pool comes back through join(); using it after the spawn is E0382;
# and the ring's own stage spawns compile with no `move` at all, because each body already takes everything by value.
out = run_ok('spawn_move')
assert 'created=1 home=1' in out
fails('spawn_after_move', 'error[E0382]: borrow of moved value: `pool`', 'value moved into closure here')
shown('spawn_move', 'let mut pool = Pool::new();', 'let h = thread::spawn(move || {', 'let buf = pool.get();', 'pool.put(buf);', 'pool', '});', 'let pool = h.join().unwrap();')
assert 'thread::spawn(move ||' not in src('spawn_nomove') and src('spawn_nomove').count('thread::spawn(||') == 4
assert run_ok('spawn_nomove') == run_ok('ring'), 'the ring without `move` must behave exactly like the ring with it'

# ---------------------------------------------------------------------------------------------------------------
# E2 · the reviewed design: owners and locks, counted (steps 3, 4, 5).
out = run_ok('reviewed')
assert 'owners_pool=3 owners_stats=4' in out, out
assert 'messages=1000 filled=1000 inspected=1000 consumed=1000' in out, out
assert 'locks=5000 locks_per_message=5' in out, out
assert 'buffers_created_in_1_to_1000=true' in out, out  # how many buffers exist varies between runs: only the range is asserted, never shown
r = kv(out)
OWNERS_POOL, OWNERS_STATS, LOCKS, LOCKS_PER_MESSAGE = int(r['owners_pool']), int(r['owners_stats']), int(r['locks']), int(r['locks_per_message'])
assert (OWNERS_POOL, OWNERS_STATS, LOCKS, LOCKS_PER_MESSAGE) == (3, 4, 5000, 5) and LOCKS == MESSAGES * LOCKS_PER_MESSAGE
shown('reviewed', 'let mut buf = lock(&pool).get();', 'lock(&stats).filled += 1;', 'lock(&stats).inspected += 1;', 'lock(&stats).consumed += 1;', 'lock(&pool).put(buf);')
assert 'LOCKS.fetch_add(1, Relaxed); m.lock().unwrap()' in src('reviewed')

# E2b · what Arc::clone and a Mutex cost in allocations, and the two places a Mutex says "if you own it, you don't need the lock".
out = run_ok('arcclone')
assert 'arc_new_allocs=2 arc_clone_allocs=0 strong=2 size_of_arc=8' in out, out
out = run_ok('getmut')
assert 'locks=0 created=1 home=1' in out, out
assert 'owned.get_mut()' in src('getmut') and 'owned.into_inner()' in src('getmut')

# ---------------------------------------------------------------------------------------------------------------
# E3 · the tree (step 6): the driver owns the pool and the counters; no Arc, no Mutex, no lock; 1 buffer, 1 allocation.
out = run_ok('tree')
assert 'messages=1000 filled=1000 inspected=1000 consumed=1000' in out, out
assert 'allocs_in_loop=1 buffers_created=1' in out, out
assert 'last=Header { kind: 1, len: 256 }' in out, out
for banned in ('Mutex', 'Arc<', 'Arc::', '.lock('):
    assert banned not in code_lines('tree'), f'tree.rs must not contain {banned}'
shown('tree', 'let mut buf = self.pool.get();', 'fill(&mut buf, src);', 'let h = inspect(&buf);', 'let buf = consume(buf);', 'self.pool.put(buf);')

# E3b · the one thing that really has many owners: read-only config, an Arc with no Mutex, read by 8 threads (step 7, 18).
out = run_ok('config')
assert 'threads=8 owners_while_running=9 owners_after=1 sum_ok=true' in out, out
assert 'Mutex' not in code_lines('config') and 'Arc::new(Config' in src('config')

# ---------------------------------------------------------------------------------------------------------------
# E4 · the generational arena (steps 9, 10, 11).
out = run_ok('arena')
assert 'walk=["pool", "fill", "inspect", "consume", "pool"]' in out, out
assert 'insp=Handle { index: 2, generation: 0 }' in out, out
assert 'removed=inspect' in out and 'audit=Handle { index: 2, generation: 1 }' in out, out
assert 'stale=Handle { index: 2, generation: 0 } get(stale)=None' in out, out
assert 'get(audit)=Some("audit")' in out and 'remove(stale)=None' in out, out
assert 'plain_index=audit' in out, out  # a plain index returns the wrong node
assert 'size_of_handle=8' in out and 'wrap=0' in out, out  # u32::MAX.wrapping_add(1) == 0: our generation wraps after 2^32 removals of one slot
assert 'fn assert_copy<T: Copy>() {}' in src('arena') and 'assert_copy::<Handle>();' in src('arena')  # Handle is Copy, proved by compiling
assert 2**32 == 4294967296 and 2**31 == 2147483648  # ours wraps at 2^32; slotmap's versions wrap after 2^31 (its docs)
shown('arena', 'pub struct Handle {', '    index: u32,', '    generation: u32,', '}', 'pub struct Node {', '    name: &\'static str,', '    outputs: Vec<Handle>,',
      'if slot.generation != h.generation {', '    return None;', 'let value = slot.value.take()?;', 'slot.generation =', '    slot.generation.wrapping_add(1);', 'self.free.push(h.index);',
      ('g.get(stale)', 'g.get(stale)'))
assert src('arena').count('pub struct Handle {\n    index: u32,\n    generation: u32,\n}') == 1

# E5 · an Rc ring leaks 4 allocations; the same ring in the real Arena<Node> frees everything (steps 8, 9, 21).
out = run_ok('rcring')
assert 'rc_ring_live_after_drop=4' in out and 'arena_live_after_drop=0' in out, out
assert src('rcring').count('pub struct Handle {\n    index: u32,\n    generation: u32,\n}') == 1  # the arena is arena.rs's, copied

# ---------------------------------------------------------------------------------------------------------------
# E6 · the ring: an owner thread fed by messages (steps 14, 16, 20). Run three times: identical output.
outs = [run_ok('ring') for _ in range(3)]
assert outs[0] == outs[1] == outs[2], outs
out = outs[0]
assert 'messages=1000 returned=1000 buffers_created=3 home_at_end=3' in out, out
assert 'accounting_checks=1000 same_order=true' in out, out
assert 'first_ids=[1, 2, 3, 1, 2, 3] trips=[334, 333, 333]' in out, out
assert 'buffer_bytes=196608 size_of_buf=32 size_of_msg=32' in out, out
assert 3 * BUF_CAP == 196608 and 196608 // 1024 == 192 and 334 + 333 + 333 == MESSAGES  # "192 KiB", the trips add up
for banned in ('Mutex', 'Arc<', 'Arc::', '.lock('):
    assert banned not in code_lines('ring'), f'ring.rs must not contain {banned}'
shown('ring', 'pub enum Msg { Data(Buf), Stop }', 'for msg in inbox {', '    match msg {', '        Msg::Data(buf) => owner.home(buf),', '        Msg::Stop => break,',
      'let oldest = self.out.pop_front();', 'assert_eq!(oldest, Some(buf.id));', 'let made = self.pool.next_id as usize;', 'let home = self.pool.free.len();',
      'assert_eq!(home + self.out.len(), made);',
      'for msg in rx {', 'Msg::Data(mut buf) => {', 'let s = &src[seen.len()];', 'fill(&mut buf, s);', 'seen.push(buf.id);', 'tx.send(Msg::Data(buf)).unwrap();')

# E6b · a stage that clones or loses one buffer fails the owner's FIFO check at once (step 16: "we tried both").
for name in ('ring_clone', 'ring_drop'):
    binary, _ = compile_rs(name)
    r = subprocess.run([binary], capture_output=True, text=True, timeout=60)
    assert r.returncode != 0 and 'assertion `left == right` failed' in r.stderr, (name, r.returncode, r.stderr)
assert 'buf.clone()' in src('ring_clone') and 'drop(buf); continue;' in src('ring_drop')

# E6c · shutdown (step 16): no loop in the cycle ends on its own, so the owner starts it. The Stop message is one way;
# the owner hanging up its Sender after the last dispatch is the other, and the ring drains and ends just the same.
out = run_ok('ring_hangup')
assert out == outs[0], (out, outs[0])
assert 'self.to_fill = None;' in src('ring_hangup') and 'send(Msg::Stop)' not in src('ring_hangup').split('impl Owner')[1].split('fn main')[0]

# E6d · the general owner task (Deep dive "Owner thread fed by messages"): requests with a reply channel, a cloneable handle.
# Each request is 3 messages (Get, its reply, Put); each stage holds at most one buffer, so at most 3 are ever made.
out = run_ok('owner_rpc')
assert 'requests=3000 messages=9000 messages_per_request=3' in out, out
assert 'buffers_created_le_3=true all_home=true' in out, out  # how many of the 3 get made varies with scheduling: only the bound is asserted
for banned in ('Mutex', 'Arc<', 'Arc::', '.lock('):
    assert banned not in code_lines('owner_rpc'), f'owner_rpc.rs must not contain {banned}'

# Prove it 4 · the same ring with one buffer in flight.
out = run_ok('ring_one')
assert 'buffers_created=1 home_at_end=1' in out and 'first_ids=[1, 1, 1] trips=[1000]' in out and 'buffer_bytes=65536' in out, out

# ---------------------------------------------------------------------------------------------------------------
# E7 · stage 3 stalls (step 15): the reviewed design makes a buffer for every message; the ring makes 3. Both by signals, no sleeps.
out = run_ok('stall')
assert 'stall: created=1000 buf_bytes=65536000 allocs_delta_ge_1000=true' in out, out
assert 'bytes_delta_ge_62.5MiB=true' in out, out
assert 1000 * BUF_CAP == 65536000 and 65536000 / 2**20 == 62.5  # "62.5 MiB requested"
out = run_ok('ring_stall')
assert 'made_while_stalled=3' in out and 'messages=1000 returned=1000 buffers_created=3 home_at_end=3' in out, out

# ---------------------------------------------------------------------------------------------------------------
# E8 · a send is a move (steps 12, 19), and what a clone would cost.
fails('send_e0382', 'error[E0382]: borrow of moved value: `buf`', 'value moved here', 'value borrowed here after move', 'consider cloning the value if the performance cost is acceptable')
fails('send_e0505', 'error[E0505]: cannot move out of `buf` because it is borrowed', 'borrow of `buf.bytes` occurs here', 'move out of `buf` occurs here', 'borrow later used here')
out = run_ok('senderr')
assert 'send failed; got buffer 1 back' in out and 'home=1 created=1' in out, out
out = run_ok('clonecost')
assert 'clone_empty allocs=0 bytes=0' in out, out  # the empty buffer from pool.get() has length 0: clone() copies the length, not the 64 KiB capacity
assert re.search(r'clone_filled allocs=1 bytes=261 len=261 cap_clone=261', out), out
shown('send_e0382', 'let buf = pool.get();', 'tx.send(buf).unwrap();', 'println!("sent buffer {}", buf.id);')
shown('send_e0505', 'let mut buf = pool.get();', 'fill(&mut buf, &[1, 0, 1, 0, 0, 7]);', 'let view = &buf.bytes[..5];', 'tx.send(buf).unwrap();', 'println!("{view:?}");')
assert 1 + 4 + 256 == 261  # kind byte, length field, payload of a message

# E9 · a guard that sends its buffer home: any number alive at once, and one stage that panics still sends its buffer home.
out = run_ok('homebuf')
assert 'alive_at_once=3 created=3' in out and 'panics=1 home=3 created=3' in out, out

# E10 · the single-threaded twin stops at the thread boundary.
fails('rc_e0277', 'error[E0277]: `Rc<RefCell<Pool>>` cannot be sent between threads safely')

# E11 · a self-deadlock from a guard temporary, only ever as a child process with a timeout.
out = run_ok('selflock', 'try')
assert 'second_lock_would_block=true' in out, out
binary, _ = compile_rs('selflock')
try:
    subprocess.run([binary], capture_output=True, text=True, timeout=5)
    raise AssertionError('selflock should never return')
except subprocess.TimeoutExpired:
    pass  # killed by the timeout, as it must be

# E12 · global mutable state, the far end of the same spectrum: a deny-by-default error in 2024, a warning in 2021.
fails('staticmut', 'error: creating a shared reference to mutable static', '#[deny(static_mut_refs)]', edition='2024')
b, err = compile_rs('staticmut', edition='2021')
assert 'warning: creating a shared reference to mutable static' in err

# ---------------------------------------------------------------------------------------------------------------
# E13 · constants and arithmetic the reel and the Deep dive show.
BATCH, WORKERS = 10000, 8
assert BATCH * 4 == 40000 and BATCH * 3 == 30000 and WORKERS == THREADS  # Prove it 6: 40,000 lock acquisitions against 30,000 messages
assert 64 * 1024 == BUF_CAP and 32 == 4 + 24 + 4  # a Buf is its u32 id and the Vec's three words: 32 bytes with padding
assert 8 == 2 * 4  # a Handle: two u32

# Every rust code block of the Deep dive is made of lines that exist in the lab files (norm: comments and spaces ignored).
mdx = os.path.join(HERE, 'index.mdx')
if os.path.exists(mdx):
    all_norms = set()
    for f in files:
        all_norms |= {_norm(l) for l in src(f).split('\n')}
    for block in re.findall(r'```rust\n(.*?)```', open(mdx).read(), re.S):
        for l in block.split('\n'):
            assert _norm(l) in all_norms, f'index.mdx shows a line that no examples/*.rs file has: {l!r}'

print('ownership-topology-over-shared: all examples passed on', ver)
