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

use std::cell::RefCell;
use std::rc::Rc;
struct RcNode { name: &'static str, next: Option<Rc<RefCell<RcNode>>> }

// A generational arena, by hand (the idea behind the `slotmap` crate): one owner for
// every node of a graph; edges are Copy handles (index + generation), never references.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Handle {
    index: u32,
    generation: u32,
}

struct Slot<T> { generation: u32, value: Option<T> }

pub struct Arena<T> { slots: Vec<Slot<T>>, free: Vec<u32> }

impl<T> Arena<T> {
    pub fn new() -> Arena<T> { Arena { slots: Vec::new(), free: Vec::new() } }

    pub fn insert(&mut self, value: T) -> Handle {
        match self.free.pop() {
            Some(index) => {                                   // reuse a freed slot
                let slot = &mut self.slots[index as usize];
                slot.value = Some(value);
                Handle { index, generation: slot.generation }
            }
            None => {
                self.slots.push(Slot { generation: 0, value: Some(value) });
                Handle { index: self.slots.len() as u32 - 1, generation: 0 }
            }
        }
    }

    pub fn remove(&mut self, h: Handle) -> Option<T> {
        let slot = self.slots.get_mut(h.index as usize)?;
        if slot.generation != h.generation {
            return None;                                       // stale: already removed
        }
        let value = slot.value.take()?;                        // move out of &mut, leave None
        slot.generation =
            slot.generation.wrapping_add(1);                   // every old handle is now stale
        self.free.push(h.index);
        Some(value)
    }

    pub fn get(&self, h: Handle) -> Option<&T> {
        let slot = self.slots.get(h.index as usize)?;
        if slot.generation != h.generation { return None; }
        slot.value.as_ref()
    }

    pub fn get_mut(&mut self, h: Handle) -> Option<&mut T> {
        let slot = self.slots.get_mut(h.index as usize)?;
        if slot.generation != h.generation { return None; }
        slot.value.as_mut()
    }
}

#[allow(dead_code)]
pub struct Node {
    name: &'static str,
    outputs: Vec<Handle>,
}


fn live() -> isize { ALLOCS.load(Relaxed) as isize - DEALLOCS.load(Relaxed) as isize }

fn rc_ring() {
    let names = ["pool", "fill", "inspect", "consume"];
    let nodes: Vec<Rc<RefCell<RcNode>>> = names.iter().map(|&name| Rc::new(RefCell::new(RcNode { name, next: None }))).collect();
    for i in 0..4 { nodes[i].borrow_mut().next = Some(Rc::clone(&nodes[(i + 1) % 4])); }
    let _ = nodes[0].borrow().name;
}   // `nodes` dropped here: every count falls from 2 to 1, never to 0

fn arena_ring() -> isize {
    let base = live();
    let mut g: Arena<Node> = Arena::new();
    let hs: Vec<Handle> = ["pool", "fill", "inspect", "consume"].into_iter().map(|name| g.insert(Node { name, outputs: vec![] })).collect();
    for i in 0..4 { g.get_mut(hs[i]).unwrap().outputs.push(hs[(i + 1) % 4]); }
    let before = live() - base;
    drop(hs);
    before
}

fn main() {
    let a = live(); rc_ring(); let rc_leaked = live() - a;
    let b = live(); let arena_before = arena_ring(); let arena_leaked = live() - b;
    println!("rc_ring_live_after_drop={rc_leaked} arena_live_before_drop={arena_before} arena_live_after_drop={arena_leaked}");
}
