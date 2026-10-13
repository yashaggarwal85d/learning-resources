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

// PooledBuf held `&'p mut Pool`, so one guard at a time. Hold a way home instead:
// a Sender to the pool's owner. Senders clone, so any number of guards can be alive.
use std::sync::mpsc::{self, Sender};
use std::thread;

pub enum Msg { Data(Buf), Stop }

pub struct HomeBuf { buf: Option<Buf>, home: Sender<Msg> }
impl HomeBuf {
    pub fn get_mut(&mut self) -> &mut Buf { self.buf.as_mut().unwrap() }
}
impl Drop for HomeBuf {
    fn drop(&mut self) {
        if let Some(buf) = self.buf.take() {
            let _ = self.home.send(Msg::Data(buf));   // owner gone? then the buffer is just freed
        }
    }
}

fn main() {
    let (home, inbox) = mpsc::channel::<Msg>();
    let mut pool = Pool::new();
    let guards: Vec<HomeBuf> = (0..3).map(|_| HomeBuf { buf: Some(pool.get()), home: home.clone() }).collect();
    println!("alive_at_once={} created={}", guards.len(), pool.next_id);
    let handles: Vec<_> = guards.into_iter().enumerate().map(|(i, mut g)| {
        thread::spawn(move || {
            fill(&mut *g.get_mut(), &[1, 1, 0, 0, 0, i as u8]);
            if i == 1 { panic!("stage {i} failed"); }  // an error path: the guard still sends home
        })
    }).collect();
    let mut panics = 0;
    for h in handles { if h.join().is_err() { panics += 1; } }
    drop(home);
    for msg in inbox {
        match msg { Msg::Data(buf) => pool.put(buf), Msg::Stop => break }
    }
    println!("panics={panics} home={} created={}", pool.free.len(), pool.next_id);
}
