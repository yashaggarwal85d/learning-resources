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

use std::sync::{Mutex, TryLockError};
fn main() {
    let pool = Mutex::new(Pool::new());
    let mode = std::env::args().nth(1).unwrap_or_default();
    if mode == "try" {
        // the first guard is a temporary that lives to the end of the statement
        let r = (pool.lock().unwrap().next_id, matches!(pool.try_lock(), Err(TryLockError::WouldBlock)));
        println!("second_lock_would_block={}", r.1);
    } else {
        println!("{} {}", pool.lock().unwrap().next_id, pool.lock().unwrap().free.len());
    }
}
