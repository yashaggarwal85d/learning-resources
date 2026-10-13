#![allow(dead_code, unused_variables)]
include!("pipeline.rs");
use std::mem;
struct Sink { buf: Buf, written: usize }
impl Sink {
    fn finish(&mut self) -> Buf { mem::replace(&mut self.buf, Buf { id: 0, bytes: Vec::new() }) }
    fn finish_clone(&mut self) -> Buf { self.buf.clone() }
}
fn main() {
    let mut pool = Pool::new();
    let mut s = Sink { buf: pool.get(), written: 0 };
    fill(&mut s.buf, &message(1, 261));
    let a0 = allocs();
    let b = s.finish();
    let a1 = allocs();
    let mut s2 = Sink { buf: b, written: 0 };
    let a2 = allocs();
    let c = s2.finish_clone();
    let a3 = allocs();
    println!("replace allocs={} clone allocs={} clone_cap={} id_left={}", a1 - a0, a3 - a2, c.bytes.capacity(), s.buf.id);
}
