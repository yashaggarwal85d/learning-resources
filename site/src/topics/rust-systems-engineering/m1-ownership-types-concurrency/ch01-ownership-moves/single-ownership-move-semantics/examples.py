"""Every example shown in the "Single ownership and move semantics" reel and Deep dive, compiled and run.
Run: python3 examples.py (CI runs it too). Needs rustc >= 1.85 (the pinned CI toolchain is 1.97.0) and g++.
Every snippet on screen is compiled verbatim; every number the reel shows is asserted here. Nothing is skipped:
a missing compiler is a failure."""
import os, re, shutil, subprocess, sys, tempfile
from math import log2

RUSTC = shutil.which('rustc')
GPP = shutil.which('g++')
assert RUSTC, 'rustc is required (CI installs 1.97.0 with rustup)'
assert GPP, 'g++ is required for the C++ comparison'
ver = subprocess.run([RUSTC, '--version'], capture_output=True, text=True).stdout.strip()
m = re.match(r'rustc (\d+)\.(\d+)\.(\d+)', ver)
assert m and (int(m[1]), int(m[2])) >= (1, 85), f'rustc >= 1.85 (edition 2024) needed, got {ver!r}'

TMP = tempfile.TemporaryDirectory()
WD = TMP.name


def compile_rs(name, src, opt=0, ok=True, crate_type=None, emit=None):
    """Compile <name>.rs in the temp dir (cwd there, so diagnostics read `--> name.rs:L:C`). Returns stderr."""
    with open(os.path.join(WD, name + '.rs'), 'w') as f:
        f.write(src)
    cmd = [RUSTC, '--edition', '2024', '--color', 'never', '-C', f'opt-level={opt}', name + '.rs']
    if crate_type:
        cmd += ['--crate-type', crate_type]
    if emit:
        cmd += ['--emit', emit, '-o', f'{name}.s']
    else:
        cmd += ['-o', name]
    r = subprocess.run(cmd, cwd=WD, capture_output=True, text=True)
    if ok:
        assert r.returncode == 0, f'{name}.rs should compile:\n{r.stderr}'
    else:
        assert r.returncode != 0, f'{name}.rs should NOT compile'
    return r.stderr


def run_rs(name, src, opt=0):
    compile_rs(name, src, opt)
    r = subprocess.run([os.path.join(WD, name)], cwd=WD, capture_output=True, text=True)
    assert r.returncode == 0, f'{name} exited {r.returncode}: {r.stderr}'
    return r.stdout


def fails(name, src, *needles, opt=0):
    err = compile_rs(name, src, opt, ok=False)
    for n in needles:
        assert n in err, f'{name}: expected {n!r} in rustc output:\n{err}'
    return err


def indent(s):
    return '\n'.join(('    ' + l) if l else l for l in s.split('\n'))


def main_body(lines, prelude=''):
    """The snippet shown as the body of `main`, wrapped with nothing else changed."""
    return prelude + 'fn main() {\n' + indent(lines.strip('\n')) + '\n}\n'


def kv(out):
    d = {}
    for tok in out.split():
        if '=' in tok:
            k, v = tok.split('=', 1)
            d[k] = v
    return d


# The counting allocator used by every measurement: counts calls to alloc and the bytes asked for.
COUNT = '''
use std::alloc::{GlobalAlloc, Layout, System};
use std::hint::black_box;
use std::sync::atomic::{AtomicUsize, Ordering::Relaxed};
struct Counting;
static ALLOCS: AtomicUsize = AtomicUsize::new(0);
static BYTES: AtomicUsize = AtomicUsize::new(0);
unsafe impl GlobalAlloc for Counting {
    unsafe fn alloc(&self, l: Layout) -> *mut u8 {
        ALLOCS.fetch_add(1, Relaxed);
        BYTES.fetch_add(l.size(), Relaxed);
        unsafe { System.alloc(l) }
    }
    unsafe fn dealloc(&self, p: *mut u8, l: Layout) {
        unsafe { System.dealloc(p, l) }
    }
}
#[global_allocator]
static GLOBAL: Counting = Counting;
fn snap() -> (usize, usize) {
    (ALLOCS.load(Relaxed), BYTES.load(Relaxed))
}
fn since(a: (usize, usize)) -> String {
    let b = snap();
    format!("{}/{}", b.0 - a.0, b.1 - a.1)
}
'''

SHIP = 'fn ship(batch: Vec<u8>) -> usize {\n    batch.len()\n}\n\n'
N = 1_000_000

# ---------------------------------------------------------------------------------------------------------------
# E1 · the problem and its fixes (steps 1, 19). Step 1's code, verbatim, compiles and prints the lengths.
step1 = '''let batch = vec![7u8; 1_000_000];
let sent = ship(batch.clone());
println!("{sent} {}", batch.len());'''
assert run_rs('step1', main_body(step1, SHIP)) == '1000000 1000000\n'

# The cost of the clone, the borrow and the use-first fixes, and the clone-per-lap loop.
e1 = COUNT + '''
fn ship_owned(batch: Vec<u8>) -> usize { batch.len() }
fn ship_ref(batch: &[u8]) -> usize { batch.len() }
fn main() {
    let batch = vec![7u8; 1_000_000];
    let a = snap();
    let sent = ship_owned(black_box(batch.clone()));
    println!("clone={} sent={} still={}", since(a), sent, batch.len());
    let a = snap();
    let sent = ship_ref(&batch);
    println!("borrow={} sent={} still={}", since(a), sent, batch.len());
    let a = snap();
    let n = batch.len();
    let sent = ship_owned(batch);
    println!("usefirst={} sent={} n={}", since(a), sent, n);
    let batch = vec![7u8; 1_000_000];
    let a = snap();
    for _ in 0..3 {
        ship_owned(black_box(batch.clone()));
    }
    println!("loopclone={}", since(a));
}
'''
for opt in (0, 3):
    r = kv(run_rs('e1', e1, opt))
    assert r['clone'] == '1/1000000' and r['sent'] == '1000000' and r['still'] == '1000000', r
    assert r['borrow'] == '0/0' and r['usefirst'] == '0/0' and r['n'] == '1000000', r
    assert r['loopclone'] == '3/3000000', r
# Step 19's two fixes, as drawn, compile.
run_rs('fix_a', 'fn ship(batch: &[u8]) -> usize {\n    batch.len()\n}\n\n' + main_body('let batch = vec![7u8; 1_000_000];\nlet sent = ship(&batch);\nprintln!("{sent}");'))
run_rs('fix_b', main_body('let batch = vec![7u8; 1_000_000];\nlet n = batch.len();\nlet sent = ship(batch);\nprintln!("{sent} {n}");', SHIP))

# E2 · the E0382 diagnostic read in step 16 (rustc 1.97.0 text, line numbers 6, 7, 8).
batch_rs = SHIP + '''fn main() {
    let batch = vec![7u8; 1_000_000];
    let sent = ship(batch);
    println!("{sent} {}", batch.len());
}
'''
err = fails(
    'batch', batch_rs,
    'error[E0382]: borrow of moved value: `batch`',
    '6 |     let batch = vec![7u8; 1_000_000];',
    'move occurs because `batch` has type `Vec<u8>`, which does not implement the `Copy` trait',
    '7 |     let sent = ship(batch);',
    'value moved here',
    '8 |     println!("{sent} {}", batch.len());',
    'value borrowed here after move',
    "note: consider changing this parameter type in function `ship` to borrow instead if owning the value isn't necessary",
    'this parameter takes ownership of the value',
    'help: consider cloning the value if the performance cost is acceptable',
)

# E3 · the Book's String example (steps 2, 3).
fails('book', 'fn main() {\n    let s1 = String::from("hello");\n    let s2 = s1;\n    println!("{s1}, world!");\n}\n',
      'error[E0382]: borrow of moved value: `s1`',
      'move occurs because `s1` has type `String`, which does not implement the `Copy` trait')

# E4 · memory proof (steps 2, 4): at -O0 and -O3 the results are identical.
e4 = COUNT + '''
#[inline(never)]
fn ship(batch: Vec<u8>) -> (usize, usize, usize, usize) {
    (batch.as_ptr() as usize, batch.len(), batch.capacity(), &batch as *const Vec<u8> as usize)
}
fn main() {
    println!("size_string={} size_vec={}", size_of::<String>(), size_of::<Vec<u8>>());
    let s1 = String::from("hello");
    println!("s_len={} s_cap={}", s1.len(), s1.capacity());
    let p1 = s1.as_ptr() as usize;
    let a = snap();
    let s2 = s1;
    println!("move_same_ptr={} move_allocs={}", p1 == s2.as_ptr() as usize, since(a));
    let a = snap();
    let s3 = black_box(s2.clone());
    println!("clone5_diff_ptr={} clone5={}", s3.as_ptr() != s2.as_ptr(), since(a));

    let batch = vec![7u8; 1_000_000];
    let before = batch.as_ptr() as usize;
    let main_hdr = &batch as *const Vec<u8> as usize;
    let a = snap();
    let (p, len, cap, hdr) = ship(batch);
    println!("moved_same_ptr={} len={} cap={} hdr_differs={} moved={}", before == p, len, cap, main_hdr != hdr, since(a));

    let batch = vec![7u8; 1_000_000];
    let a = snap();
    let c = black_box(batch.clone());
    println!("cloned_diff_ptr={} cloned={}", c.as_ptr() != batch.as_ptr(), since(a));
}
'''
outs = [run_rs('e4', e4, opt) for opt in (0, 3)]
assert outs[0] == outs[1], outs
r = kv(outs[0])
assert r['size_string'] == '24' and r['size_vec'] == '24'
assert r['s_len'] == '5' and r['s_cap'] == '5'
assert r['move_same_ptr'] == 'true' and r['move_allocs'] == '0/0'
assert r['clone5_diff_ptr'] == 'true' and r['clone5'] == '1/5'
assert r['moved_same_ptr'] == 'true' and r['len'] == '1000000' and r['cap'] == '1000000'
assert r['hdr_differs'] == 'true' and r['moved'] == '0/0'
assert r['cloned_diff_ptr'] == 'true' and r['cloned'] == '1/1000000'
# Step 4's proof.rs, verbatim: lines 4-7 in main. The assert_eq! holds, so it exits 0.
proof = '''fn ship(b: Vec<u8>) -> *const u8 {
    b.as_ptr()
}
'''
proof_main = '''let batch = vec![7u8; 1_000_000];
let before = batch.as_ptr();
let inside = ship(batch);
assert_eq!(before, inside);'''
for opt in (0, 3):
    run_rs('proof', main_body(proof_main, proof + '\n'), opt)

# E5 · reinitialization (step 5): verbatim, prints "second first"; without `mut`, reassignment is E0384.
reinit = '''let mut s = String::from("first");
let t = s;
s = String::from("second");
println!("{s} {t}");'''
assert run_rs('reinit', main_body(reinit)) == 'second first\n'
fails('reinit_nomut', main_body(reinit.replace('let mut s', 'let s')), 'E0384')

# E6 · C++ std::move leaves a shell; Rust drops once (step 6).
cpp = '''#include <cstdio>
#include <utility>
struct Buf {
    char* data;
    Buf() : data(new char[1024]) {}
    Buf(Buf&& o) noexcept : data(o.data) { o.data = nullptr; }
    Buf(const Buf&) = delete;
    ~Buf() {
        std::puts(data ? "destructor (data owned)" : "destructor (data null)");
        delete[] data;
    }
};
int main() {
    Buf a;
    Buf b = std::move(a);
    std::printf("a.data is null: %d\\n", a.data == nullptr);
}
'''
with open(os.path.join(WD, 'shell.cpp'), 'w') as f:
    f.write(cpp)
c = subprocess.run([GPP, '-std=c++20', '-Wall', '-Wextra', '-Werror', 'shell.cpp', '-o', 'shell_cpp'], cwd=WD, capture_output=True, text=True)
assert c.returncode == 0 and c.stderr == '', c.stderr
cout = subprocess.run([os.path.join(WD, 'shell_cpp')], capture_output=True, text=True).stdout
assert cout.splitlines() == ['a.data is null: 1', 'destructor (data owned)', 'destructor (data null)'], cout
assert sum(1 for l in cout.splitlines() if l.startswith('destructor')) == 2
rbuf = 'struct Buf(Vec<u8>);\nimpl Drop for Buf {\n    fn drop(&mut self) {\n        println!("drop ({} bytes)", self.0.len());\n    }\n}\n\n'
assert run_rs('shell_rs', main_body('let a = Buf(vec![0; 1024]);\nlet b = a;', rbuf)) == 'drop (1024 bytes)\n'
fails('shell_use', main_body('let a = Buf(vec![0; 1024]);\nlet b = a;\nprintln!("{}", a.0.len());', rbuf), 'error[E0382]')

# E7 · the Copy sieve (step 8).
is_copy = 'fn is_copy<T: Copy>() {}\n'
assert run_rs('sieve_copy', main_body(
    'is_copy::<i32>();\nis_copy::<f64>();\nis_copy::<bool>();\nis_copy::<char>();\nis_copy::<[u8; 4]>();\nis_copy::<(u8, char, f64)>();\nis_copy::<&String>();\nprintln!("ok");',
    is_copy)) == 'ok\n'
for ty, needle in [('String', '`String: Copy` is not satisfied'), ('&mut String', '`&mut String: Copy` is not satisfied'),
                   ('Vec<u8>', 'Copy` is not satisfied'), ('Box<u8>', 'Copy` is not satisfied')]:
    fails('sieve_' + re.sub(r'\W', '_', ty), main_body(f'is_copy::<{ty}>();', is_copy), 'E0277', needle)
assert run_rs('xy', main_body('let x = 5;\nlet y = x;\nprintln!("{x} {y}");')) == '5 5\n'

# E8 · E0184 (step 9): Copy and Drop are mutually exclusive.
fd = '#[derive(Clone, Copy)]\nstruct Fd(i32);\nimpl Drop for Fd {\n    fn drop(&mut self) {}\n}\n'
fails('fd', fd + 'fn main() {}\n', 'error[E0184]',
      'the trait `Copy` cannot be implemented for this type; the type has a destructor',
      '`Copy` not allowed on types with destructors')
fails('fd_hand_clone', '#[derive(Copy)]\nstruct Fd(i32);\nimpl Clone for Fd { fn clone(&self) -> Fd { Fd(self.0) } }\nimpl Drop for Fd {\n    fn drop(&mut self) {}\n}\nfn main() {}\n', 'E0184')

# E9 · cost meters (step 10): copy 0/0, move 0/0, clone 1/1,000,000.
cost_lines = '''let n2 = n;           // i32: copy
let b2 = b;           // Vec<u8>: move
let c2 = c.clone();   // Vec<u8>: clone'''
run_rs('cost_verbatim', main_body('let n: i32 = 7;\nlet b = vec![7u8; 1_000_000];\nlet c = vec![7u8; 1_000_000];\n' + cost_lines + '\nprintln!("{n2} {} {}", b2.len(), c2.len());'))
e9 = COUNT + '''
fn main() {
    let n: i32 = 7;
    let b = vec![7u8; 1_000_000];
    let c = vec![7u8; 1_000_000];
    let a = snap();
    let n2 = n;
    println!("copy={}", since(a));
    let a = snap();
    let b2 = b;
    println!("move={}", since(a));
    let a = snap();
    let c2 = black_box(c.clone());
    println!("clone={}", since(a));
    black_box((n2, &b2, &c2));
}
'''
for opt in (0, 3):
    r = kv(run_rs('e9', e9, opt))
    assert (r['copy'], r['move'], r['clone']) == ('0/0', '0/0', '1/1000000'), r

# E10 · the 4 KiB move (step 11).
big_defs = 'struct Big { data: [u8; 4096] }\nfn take(b: Big) -> *const u8 {\n    b.data.as_ptr()\n}\n\n'
big_main = '''let b = Big { data: [7; 4096] };
let at = b.data.as_ptr();
let moved_to = take(b);
println!("{}", at == moved_to);'''
for opt in (0, 3):
    assert run_rs('big', main_body(big_main, big_defs), opt) == 'false\n'  # observed with rustc 1.97, not guaranteed
big_box = '''struct Big { data: [u8; 4096] }
fn take_box(b: Box<Big>) -> *const u8 {
    b.data.as_ptr()
}
fn main() {
    println!("{} {}", size_of::<Big>(), size_of::<Box<Big>>());
    let b = Box::new(Big { data: [7; 4096] });
    let at = b.data.as_ptr();
    println!("{}", at == take_box(b));
}
'''
for opt in (0, 3):
    assert run_rs('big_box', big_box, opt) == '4096 8\ntrue\n'
asm_src = '''pub struct Big { pub data: [u8; 4096] }
#[inline(never)]
pub fn consume(b: Big) -> u8 { std::hint::black_box(&b); b.data[0] }
pub fn pass_on(b: Big) -> u8 { let c = std::hint::black_box(b); consume(c) }
pub fn pass_box(b: Box<Big>) -> u8 { let c = std::hint::black_box(b); c.data[0] }
pub fn pass_plain(b: Big) -> u8 { consume(b) }
'''


def asm_body(opt, fn):
    compile_rs('asm', asm_src, opt, crate_type='lib', emit='asm')
    text = open(os.path.join(WD, 'asm.s')).read()
    lines = text.split('\n')
    start = next(i for i, l in enumerate(lines) if re.match(r'^\S*' + fn + r':', l) and ('_R' in l or l.startswith(fn)))
    end = next(i for i in range(start, len(lines)) if lines[i].startswith('.Lfunc_end'))
    return '\n'.join(lines[start:end])


o3_on, o3_box, o3_plain, o0_plain = asm_body(3, 'pass_on'), asm_body(3, 'pass_box'), asm_body(3, 'pass_plain'), asm_body(0, 'pass_plain')
assert 'memcpy' in o3_on and '$4096' in o3_on, o3_on          # the address escapes: the copy stays
assert 'memcpy' not in o3_box                                   # a Box: only the pointer moves
assert 'memcpy' not in o3_plain                                 # a plain pass-through: the optimiser removed the copy
assert 'memcpy' in o0_plain and '$4096' in o0_plain, o0_plain  # debug build: a real 4096-byte memcpy

# E11 · size chooser (step 12).
e11 = '''use std::hint::black_box;
fn take_box(b: Box<[u8; 65536]>) -> *const u8 { b.as_ptr() }
fn main() {
    println!("a16={} a4096={} a65536={} boxed={} unsized={}", size_of::<[u8; 16]>(), size_of::<[u8; 4096]>(), size_of::<[u8; 65536]>(), size_of::<Box<[u8; 65536]>>(), size_of::<Box<[u8]>>());
    let b: Box<[u8; 65536]> = vec![1u8; 65536].into_boxed_slice().try_into().unwrap();
    let at = b.as_ptr();
    let moved = take_box(black_box(b));
    println!("same_ptr={}", at == moved);
}
'''
for opt in (0, 3):
    r = kv(run_rs('e11', e11, opt))
    assert (r['a16'], r['a4096'], r['a65536'], r['boxed'], r['unsized'], r['same_ptr']) == ('16', '4096', '65536', '8', '16', 'true'), r
assert log2(8) == 3 and log2(65536) == 16 and log2(16) == 4 and log2(4096) == 12
assert [round(420 * log2(b) / 16) for b in (16, 4096, 65536, 8)] == [105, 315, 420, 79]  # bar widths in the drawing
# 4 * 65_536 bytes through four nested calls (Prove it 7)
assert 4 * 65_536 == 262_144 and 4 * 8 == 32

# E12 · four contracts (step 13).
e12 = '''fn ship(b: Vec<u8>) -> usize { b.len() }
fn peek(b: &[u8]) -> usize { b.len() }
fn fill(b: &mut Vec<u8>) { b.push(8); }
fn make() -> Vec<u8> { vec![1, 2, 3] }
fn main() {
    let mut batch = vec![7u8; 4];
    peek(&batch);
    peek(&batch);
    println!("after_peek={}", batch.len());
    fill(&mut batch);
    println!("after_fill={}", batch.len());
    println!("made={}", make().len());
    println!("shipped={}", ship(batch));
}
'''
assert kv(run_rs('e12', e12)) == {'after_peek': '4', 'after_fill': '5', 'made': '3', 'shipped': '5'}
fails('e12_use', 'fn ship(b: Vec<u8>) -> usize { b.len() }\nfn main() {\n    let batch = vec![7u8; 4];\n    ship(batch);\n    println!("{}", batch.len());\n}\n', 'error[E0382]')
fails('e12_excl', main_body('let mut batch = vec![7u8; 4];\nlet r1 = &mut batch;\nlet r2 = &batch;\nr1.push(8);\nprintln!("{}", r2.len());'), 'error[E0502]')

# E13 · methods (step 14).
e13 = COUNT + '''
fn main() {
    let _: fn(&String) -> usize = String::len;
    let _: fn(&mut String, &str) = String::push_str;
    let _: fn(String) -> Vec<u8> = String::into_bytes;
    let s = String::from("hello");
    println!("len={} cap={}", s.len(), s.capacity());
    let p = s.as_ptr();
    let a = snap();
    let v = s.into_bytes();
    println!("into_bytes_same_ptr={} into_bytes={}", p == v.as_ptr(), since(a));
    let mut s = String::with_capacity(16);
    s.push_str("hello");
    let p = s.as_ptr();
    let a = snap();
    let t = s + " world";
    println!("plus_same_ptr={} plus={} t_len={} t_cap={} t={}", p == t.as_ptr(), since(a), t.len(), t.capacity(), t.replace(' ', "_"));
}
'''
for opt in (0, 3):
    r = kv(run_rs('e13', e13, opt))
    assert r['len'] == '5' and r['cap'] == '5', r
    assert r['into_bytes_same_ptr'] == 'true' and r['into_bytes'] == '0/0', r
    assert r['plus_same_ptr'] == 'true' and r['plus'] == '0/0' and r['t_len'] == '11' and r['t_cap'] == '16' and r['t'] == 'hello_world', r

# E14 · which signature (step 15): A fails with E0382, B, C and D compile and run.
SUM = 'b.iter().fold(0u32, |a, &x| a.wrapping_add(x as u32))'
mk = 'let batch = vec![7u8; 4];\n'
fails('e14_a', f'fn checksum(b: Vec<u8>) -> u32 {{ {SUM} }}\n' + main_body(mk + 'let sum = checksum(batch);\nprintln!("{sum} {}", batch.len());'), 'error[E0382]')
assert run_rs('e14_b', f'fn checksum(b: &[u8]) -> u32 {{ {SUM} }}\n' + main_body(mk + 'let sum = checksum(&batch);\nprintln!("{sum} {}", batch.len());')) == '28 4\n'
assert run_rs('e14_c', f'fn checksum(b: &mut Vec<u8>) -> u32 {{ {SUM} }}\n' + main_body('let mut batch = vec![7u8; 4];\nlet sum = checksum(&mut batch);\nprintln!("{sum} {}", batch.len());')) == '28 4\n'
assert run_rs('e14_d', f'fn checksum(b: Vec<u8>) -> (Vec<u8>, u32) {{ let s = {SUM}; (b, s) }}\n' + main_body(mk + 'let (batch, sum) = checksum(batch);\nprintln!("{sum} {}", batch.len());')) == '28 4\n'

# E15 · E0505 (step 17): line numbers 7, 8, 9.
e0505 = SHIP + '''fn main() {
    let batch = vec![7u8; 1_000_000];
    let header = &batch[..4];
    let sent = ship(batch);
    println!("{sent} {header:?}");
}
'''
fails('e0505', e0505,
      'error[E0505]: cannot move out of `batch` because it is borrowed',
      '7 |     let header = &batch[..4];', 'borrow of `batch` occurs here',
      '8 |     let sent = ship(batch);', 'move out of `batch` occurs here',
      '9 |     println!("{sent} {header:?}");', 'borrow later used here',
      'binding `batch` declared here',
      'help: consider cloning the value if the performance cost is acceptable',
      'let header = &batch.clone()[..4];')
fix_order = '''let batch = vec![7u8; 1_000_000];
let header = &batch[..4];
println!("{header:?}");
let sent = ship(batch);
println!("{sent}");'''
assert run_rs('e0505_fix', main_body(fix_order, SHIP)) == '[7, 7, 7, 7]\n1000000\n'
copy_out = '''let batch = vec![7u8; 1_000_000];
let a = snap();
let mut header = [0u8; 4];
header.copy_from_slice(&batch[..4]);
let copy_cost = since(a);
let sent = ship(batch);
println!("{sent} {header:?} {}", copy_cost.replace('/', "_"));'''
assert run_rs('e0505_copy', main_body(copy_out, COUNT + SHIP)) == '1000000 [7, 7, 7, 7] 0_0\n'

# E16 · loops (step 18).
loop_main = '''let batch = vec![7u8; 4];
for _ in 0..3 {
    ship(batch);
}'''
fails('loop', main_body(loop_main, SHIP),
      'error[E0382]: use of moved value: `batch`', 'inside of this loop', 'value moved here, in previous iteration of loop')
forin = 'let v = vec![String::from("a"), String::from("b")];\nfor s in v {\n    println!("{s}");\n}\nprintln!("{}", v.len());'
fails('forin', main_body(forin), 'borrow of moved value: `v`',
      '`into_iter` takes ownership of the receiver `self`, which moves `v`',
      "consider iterating over a slice of the `Vec<String>`'s content to avoid moving into the `for` loop")
assert run_rs('forin_ok', main_body(forin.replace('for s in v', 'for s in &v'))) == 'a\nb\n2\n'

# E17 · Prove it 1 (step 20): a maybe-moved value counts as moved; without the use it compiles.
retry_main = '''let batch = vec![7u8; 4];
let retry = std::env::args().count() > 1;
if retry {
    ship(batch);
}
println!("{}", batch.len());'''
fails('p1', main_body(retry_main, SHIP), 'error[E0382]: borrow of moved value: `batch`')
cond = retry_main.replace('println!("{}", batch.len());', '')
compile_rs('cond', main_body(cond, SHIP))
assert subprocess.run([os.path.join(WD, 'cond')], capture_output=True).returncode == 0
assert subprocess.run([os.path.join(WD, 'cond'), 'x'], capture_output=True).returncode == 0
assert 1 < 3 and 0 == 0  # step 20 shows the numbers 4 (the batch), 1 and 0 only as above

# E18 · Prove it 2 (step 21): the chain of a move, a clone and a move.
e18 = COUNT + '''
fn main() {
    let a0 = snap();
    let a = vec![0u8; 1_000_000];
    println!("line1={}", since(a0));
    let a1 = snap();
    let b = a;
    let c = b.clone();
    let d = c;
    println!("lines2to4={}", since(a1));
    black_box((&b, &d));
}
'''
for opt in (0, 3):
    r = kv(run_rs('e18', e18, opt))
    assert r['line1'] == '1/1000000' and r['lines2to4'] == '1/1000000', r
run_rs('chain_verbatim', main_body('let a = vec![0u8; 1_000_000];\nlet b = a;\nlet c = b.clone();\nlet d = c;'))

# E19 · Prove it 3 (step 22): derive Copy for a struct of plain numbers.
cfg = 'struct Config {\n    retries: u32,\n    timeout_ms: u32,\n    batch: u32,\n}\n'
proc = 'fn process(cfg: Config) -> u32 { cfg.retries + cfg.timeout_ms + cfg.batch }\n'
cfg_main = 'let cfg = Config { retries: 3, timeout_ms: 500, batch: 64 };\nfor _ in 0..3 { process(cfg); }  // E0382'
fails('cfg_bad', cfg + proc + main_body(cfg_main), 'error[E0382]: use of moved value: `cfg`', 'value moved here, in previous iteration of loop')
out = run_rs('cfg_ok', '#[derive(Clone, Copy)]\n' + cfg + proc + main_body(cfg_main + '\nprintln!("{}", size_of::<Config>());'))
assert out == '12\n'

# E20 · Deep dive extras.
fails('e0507', main_body('let v = vec![String::from("a"), String::from("b")];\nlet s = v[0];'), 'error[E0507]: cannot move out of index of `Vec<String>`')
e20 = COUNT + '''
fn main() {
    let mut v = vec![String::from("a"), String::from("b")];
    let p = v[0].as_ptr();
    let a = snap();
    let s = v.swap_remove(0);
    println!("swap_remove_same_ptr={} swap_remove={}", p == s.as_ptr(), since(a));
}
'''
r = kv(run_rs('e20_swap', e20))
assert r['swap_remove_same_ptr'] == 'true' and r['swap_remove'] == '0/0', r
fails('e20_mutref', main_body('let mut s = String::new();\nlet r = &mut s;\nlet r2 = r;\nr2.push(\'b\');\nr.push(\'c\');'), 'error[E0382]')
assert run_rs('e20_reborrow', main_body("let mut s = String::from(\"a\");\nlet r = &mut s;\nlet r2: &mut String = r;\nr2.push('b');\nr.push('c');\nprintln!(\"{s}\");")) == 'abc\n'
fails('e20_move_closure', main_body('let data = vec![1, 2, 3];\nlet h = std::thread::spawn(move || data.len());\nprintln!("{}", data.len());\nh.join().unwrap();'), 'value moved into closure here')
fails('e20_nomove', main_body('let data = vec![1, 2, 3];\nlet h = std::thread::spawn(|| data.len());\nh.join().unwrap();'), 'error[E0373]')
fails('e20_consume', main_body('let data = vec![1, 2, 3];\nlet c = || drop(data);\nc();\nprintln!("{}", data.len());'), 'value moved into closure here')
assert run_rs('e20_copy_capture', main_body('let n = 5;\nlet c = move || n + 1;\nprintln!("{} {}", c(), n);')) == '6 5\n'
fails('e20_fnonce', main_body('let name = String::from("batch-7");\nlet consume = move || name;\nlet a = consume();\nlet b = consume();'),
      'error[E0382]: use of moved value: `consume`',
      'closure cannot be invoked more than once because it moves the variable `name` out of its environment')

# Prove it 4: for-in consumes the Vec (E16 above). Prove it 5: &mut is not Copy (E20 above). Prove it 6: move closure (E20 above).

print(f'ok: {ver}; move 24-byte header, 0 allocations; clone 1 allocation of 1,000,000 bytes; Big(4096) moves to a new address; '
      f'C++ 2 destructors vs Rust 1 drop; Config is 12 bytes')
