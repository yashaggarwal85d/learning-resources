#![allow(dead_code, unused_variables)]
include!("pipeline.rs");
fn show(frame: &Frame) {}
fn main() {
    let mut pool = Pool::new();
    let frame = Frame { header: Header { kind: 1, len: 0 }, payload: pool.get() };
    let Frame { header, payload } = frame;
    show(&frame);
}
