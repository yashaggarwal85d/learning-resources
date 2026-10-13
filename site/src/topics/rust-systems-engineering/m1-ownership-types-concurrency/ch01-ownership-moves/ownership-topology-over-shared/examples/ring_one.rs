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

// Owner thread fed by messages. One thread owns the Pool; three stage threads pass each Buf
// on as an owned value; the last stage sends it home. No Arc, no Mutex anywhere in this file.
use std::sync::mpsc::{self, Receiver, Sender};
use std::thread;
use std::collections::VecDeque;

pub const MESSAGES: u32 = 1_000;
pub const IN_FLIGHT: u32 = 1;                 // one buffer per stage

pub enum Msg { Data(Buf), Stop }

fn message(i: u32) -> Vec<u8> {               // kind 1, len 256, 256 payload bytes
    let mut m = vec![1u8];
    m.extend_from_slice(&256u32.to_le_bytes());
    m.extend(std::iter::repeat((i % 251) as u8).take(256));
    m
}

fn fill_stage(rx: Receiver<Msg>, tx: Sender<Msg>, src: Vec<Vec<u8>>) -> Vec<u32> {
    let mut seen = Vec::new();
    for msg in rx {
        match msg {
            Msg::Data(mut buf) => {
                let s = &src[seen.len()];
                fill(&mut buf, s);
                seen.push(buf.id);
                tx.send(Msg::Data(buf)).unwrap();
            }
            Msg::Stop => { tx.send(Msg::Stop).unwrap(); break; }
        }
    }
    seen
}

fn inspect_stage(rx: Receiver<Msg>, tx: Sender<Msg>) -> Vec<u32> {
    let mut seen = Vec::new();
    for msg in rx {
        match msg {
            Msg::Data(buf) => {
                assert_eq!(inspect(&buf), Header { kind: 1, len: 256 });
                seen.push(buf.id);
                tx.send(Msg::Data(buf)).unwrap();
            }
            Msg::Stop => { tx.send(Msg::Stop).unwrap(); break; }
        }
    }
    seen
}

fn consume_stage(rx: Receiver<Msg>, home: Sender<Msg>) -> Vec<u32> {
    let mut seen = Vec::new();
    for msg in rx {
        match msg {
            Msg::Data(buf) => {
                let buf = consume(buf);
                seen.push(buf.id);
                home.send(Msg::Data(buf)).unwrap();
            }
            Msg::Stop => { home.send(Msg::Stop).unwrap(); break; }
        }
    }
    seen
}

struct Owner { pool: Pool, to_fill: Sender<Msg>, sent: u32, back: u32, out: VecDeque<u32>, checks: u32, ids: Vec<u32> }

impl Owner {
    fn dispatch(&mut self, buf: Buf) {
        self.ids.push(buf.id);
        self.out.push_back(buf.id);
        self.to_fill.send(Msg::Data(buf)).unwrap();
        self.sent += 1;
        if self.sent == MESSAGES { self.to_fill.send(Msg::Stop).unwrap(); }
    }
    fn home(&mut self, buf: Buf) {
        // the ring is FIFO: the oldest buffer out must be the one coming home
        let oldest = self.out.pop_front();
        assert_eq!(oldest, Some(buf.id));
        self.back += 1;
        if self.sent < MESSAGES { self.dispatch(buf); } else { self.pool.put(buf); }
        let made = self.pool.next_id as usize;
        let home = self.pool.free.len();
        assert_eq!(home + self.out.len(), made);
        self.checks += 1;
    }
}

fn main() {
    let src: Vec<Vec<u8>> = (0..MESSAGES).map(message).collect();
    let (to_fill, fill_rx) = mpsc::channel::<Msg>();
    let (to_inspect, inspect_rx) = mpsc::channel::<Msg>();
    let (to_consume, consume_rx) = mpsc::channel::<Msg>();
    let (home, inbox) = mpsc::channel::<Msg>();

    let fill_t = thread::spawn(move || {
        fill_stage(fill_rx, to_inspect, src)
    });
    let inspect_t = thread::spawn(move || inspect_stage(inspect_rx, to_consume));
    let consume_t = thread::spawn(move || consume_stage(consume_rx, home));

    let owner_t = thread::spawn(move || {
        let mut owner = Owner { pool: Pool::new(), to_fill, sent: 0, back: 0, out: VecDeque::new(), checks: 0, ids: Vec::new() };
        for _ in 0..IN_FLIGHT {
            let buf = owner.pool.get();
            owner.dispatch(buf);
        }
        for msg in inbox {
            match msg {
                Msg::Data(buf) => owner.home(buf),
                Msg::Stop => break,
            }
        }
        owner
    });
    let owner = owner_t.join().unwrap();      // the Owner (and its Pool) comes back to main
    assert_eq!(owner.pool.free.len() as u32, owner.pool.next_id); // at shutdown every buffer made is home
    let (fs, is, cs) = (fill_t.join().unwrap(), inspect_t.join().unwrap(), consume_t.join().unwrap());
    let trips: Vec<usize> = (1..=IN_FLIGHT).map(|id| fs.iter().filter(|&&x| x == id).count()).collect();
    println!("messages={} returned={} buffers_created={} home_at_end={}", MESSAGES, owner.back, owner.pool.next_id, owner.pool.free.len());
    println!("accounting_checks={} same_order={}", owner.checks, fs == is && is == cs && cs == owner.ids);
    println!("first_ids={:?} trips={:?}", &fs[..3], trips);
    println!("buffer_bytes={} size_of_buf={} size_of_msg={}", owner.pool.next_id as usize * BUF_CAP, std::mem::size_of::<Buf>(), std::mem::size_of::<Msg>());
}
