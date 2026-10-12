// ---- the instrument (topic 1 introduces it; topics 2–4 copy it verbatim) ----
use std::alloc::{GlobalAlloc, Layout, System};
use std::sync::atomic::{AtomicUsize, Ordering::Relaxed};

pub struct CountingAlloc;
pub static ALLOCS: AtomicUsize = AtomicUsize::new(0);
pub static DEALLOCS: AtomicUsize = AtomicUsize::new(0);
pub static BYTES: AtomicUsize = AtomicUsize::new(0); // bytes requested by alloc

unsafe impl GlobalAlloc for CountingAlloc {
    unsafe fn alloc(&self, layout: Layout) -> *mut u8 {
        ALLOCS.fetch_add(1, Relaxed);
        BYTES.fetch_add(layout.size(), Relaxed);
        unsafe { System.alloc(layout) }
    }
    unsafe fn dealloc(&self, ptr: *mut u8, layout: Layout) {
        DEALLOCS.fetch_add(1, Relaxed);
        unsafe { System.dealloc(ptr, layout) }
    }
}
#[global_allocator]
static ALLOC: CountingAlloc = CountingAlloc;
pub fn allocs() -> usize { ALLOCS.load(Relaxed) }

// ---- the pipeline's data ----
pub const BUF_CAP: usize = 64 * 1024; // 65,536 bytes ("64 KiB" on screen)
pub const POOL_SLOTS: usize = 8;      // free-list capacity, reserved in Pool::new

#[derive(Clone)]                       // Clone, never Copy: cloning is the visible, costly act
pub struct Buf { pub id: u32, pub bytes: Vec<u8> }   // no Drop impl (so topic 3 can partially move it)

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Header { pub kind: u8, pub len: u32 }     // bytes[0], then bytes[1..5] little-endian

pub struct Pool { free: Vec<Buf>, next_id: u32 }
impl Pool {
    pub fn new() -> Pool { Pool { free: Vec::with_capacity(POOL_SLOTS), next_id: 0 } }
    pub fn get(&mut self) -> Buf {                   // the only place a buffer is allocated
        match self.free.pop() {                      // a `match`, not `unwrap_or_else(|| ..)`: closures are Book ch. 13, past the baseline
            Some(buf) => buf,
            None => {
                self.next_id += 1;
                Buf { id: self.next_id, bytes: Vec::with_capacity(BUF_CAP) }
            }
        }
    }
    pub fn put(&mut self, mut buf: Buf) { buf.bytes.clear(); self.free.push(buf); } // takes ownership back
}

// ---- the three stages: one of each ownership contract ----
pub fn fill(buf: &mut Buf, src: &[u8]) { buf.bytes.clear(); buf.bytes.extend_from_slice(src); } // &mut T: exclusive loan
pub fn inspect(buf: &Buf) -> Header {                                                            // &T: shared loan, returns a Copy value
    let b = &buf.bytes;
    Header { kind: b[0], len: u32::from_le_bytes([b[1], b[2], b[3], b[4]]) }
}
pub fn consume(buf: Buf) -> Buf { /* write the payload out */ buf }                             // T in, T out: takes, then hands back

// The pull request under review: one Pool shared by three stage threads, each stage's
// counters in another shared box. Every lock() goes through `lock`, which counts it.
use std::sync::mpsc;
use std::sync::{Arc, Barrier, Mutex, MutexGuard};
use std::thread;

pub const MESSAGES: u32 = 1_000;
static LOCKS: AtomicUsize = AtomicUsize::new(0);
fn lock<T>(m: &Mutex<T>) -> MutexGuard<'_, T> { LOCKS.fetch_add(1, Relaxed); m.lock().unwrap() }

#[derive(Default)]
struct Stats { filled: u32, inspected: u32, consumed: u32 }

fn message(i: u32) -> Vec<u8> { // kind 1, len 256, then 256 payload bytes: 261 bytes
    let mut m = vec![1u8];
    m.extend_from_slice(&256u32.to_le_bytes());
    m.extend(std::iter::repeat((i % 251) as u8).take(256));
    m
}

fn main() {
    let src: Vec<Vec<u8>> = (0..MESSAGES).map(message).collect();
    let src = Arc::new(src);
    let pool = Arc::new(Mutex::new(Pool::new()));
    let stats = Arc::new(Mutex::new(Stats::default()));
    let start = Arc::new(Barrier::new(4));
    let (to_inspect, from_fill) = mpsc::channel::<Buf>();
    let (to_consume, from_inspect) = mpsc::channel::<Buf>();

    let fill_t = {
        let (pool, stats, src, start) = (Arc::clone(&pool), Arc::clone(&stats), Arc::clone(&src), Arc::clone(&start));
        thread::spawn(move || {
            start.wait();
            for i in 0..MESSAGES as usize {
                let mut buf = lock(&pool).get();          // lock 1: take a buffer
                fill(&mut buf, &src[i]);
                lock(&stats).filled += 1;                 // lock 2
                to_inspect.send(buf).unwrap();
            }
        })
    };
    let inspect_t = {
        let (stats, start) = (Arc::clone(&stats), Arc::clone(&start));
        thread::spawn(move || {
            start.wait();
            for buf in from_fill {
                let h = inspect(&buf);
                assert_eq!(h, Header { kind: 1, len: 256 });
                lock(&stats).inspected += 1;              // lock 3
                to_consume.send(buf).unwrap();
            }
        })
    };
    let consume_t = {
        let (pool, stats, start) = (Arc::clone(&pool), Arc::clone(&stats), Arc::clone(&start));
        thread::spawn(move || {
            start.wait();
            for buf in from_inspect {
                let buf = consume(buf);
                lock(&stats).consumed += 1;               // lock 4
                lock(&pool).put(buf);                     // lock 5: give it back
            }
        })
    };
    // all three threads are parked at the barrier: count the owners of the one Pool
    let owners_pool = Arc::strong_count(&pool);
    let owners_stats = Arc::strong_count(&stats);
    LOCKS.store(0, Relaxed);
    start.wait();
    fill_t.join().unwrap(); inspect_t.join().unwrap(); consume_t.join().unwrap();
    let locks = LOCKS.load(Relaxed);
    let s = lock(&stats);
    println!("owners_pool={owners_pool} owners_stats={owners_stats}");
    println!("messages={} filled={} inspected={} consumed={}", MESSAGES, s.filled, s.inspected, s.consumed);
    println!("locks={locks} locks_per_message={}", locks / MESSAGES as usize);
    let p = lock(&pool);
    println!("buffers_created_in_1_to_{}={}", MESSAGES, (1..=MESSAGES).contains(&p.next_id));
}
