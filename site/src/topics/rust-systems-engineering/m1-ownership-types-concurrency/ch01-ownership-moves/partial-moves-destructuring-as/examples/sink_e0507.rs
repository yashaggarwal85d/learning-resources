#![allow(dead_code, unused_variables)]
include!("pipeline.rs");
struct Sink { buf: Buf, written: usize }
impl Sink {
fn finish(&mut self) -> Buf {
    self.buf // E0507
}
}
fn main() {}
