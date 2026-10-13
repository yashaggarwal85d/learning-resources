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

// Tree-shaped ownership: the driver owns the Pool and every stage; work is lent down
// (&mut Buf, &Buf), results come back up (a Header, the Buf itself). No Arc, no Mutex.
pub const MESSAGES: u32 = 1_000;

#[derive(Default)]
struct Counts { filled: u32, inspected: u32, consumed: u32 }

struct Pipeline { pool: Pool, counts: Counts }

impl Pipeline {
    fn run_one(&mut self, src: &[u8]) -> Header {
        let mut buf = self.pool.get();        // the driver takes a buffer from the pool it owns
        fill(&mut buf, src);                  // lends it exclusively
        self.counts.filled += 1;
        let h = inspect(&buf);                // lends it shared, gets a Copy result back
        self.counts.inspected += 1;
        let buf = consume(buf);               // hands it over, gets it back
        self.counts.consumed += 1;
        self.pool.put(buf);                   // and returns it
        h
    }
}

fn message(i: u32) -> Vec<u8> {
    let mut m = vec![1u8];
    m.extend_from_slice(&256u32.to_le_bytes());
    m.extend(std::iter::repeat((i % 251) as u8).take(256));
    m
}

fn main() {
    let src: Vec<Vec<u8>> = (0..MESSAGES).map(message).collect();
    let mut p = Pipeline { pool: Pool::new(), counts: Counts::default() };
    let before = allocs();
    let mut last = Header { kind: 0, len: 0 };
    for i in 0..MESSAGES as usize { last = p.run_one(&src[i]); }
    let after = allocs();
    println!("messages={} filled={} inspected={} consumed={}", MESSAGES, p.counts.filled, p.counts.inspected, p.counts.consumed);
    println!("allocs_in_loop={} buffers_created={} locks=0 owners_of_pool=1", after - before, p.pool.next_id);
    println!("last={:?}", last);
}
