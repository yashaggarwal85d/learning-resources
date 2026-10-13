#![allow(dead_code, unused_variables)]
include!("pipeline.rs");
fn send(frame: Frame) {}
fn main() {
    let mut pool = Pool::new();
    let frame = Frame { header: Header { kind: 1, len: 0 }, payload: pool.get() };
    let payload = frame.payload; // move
    let h = frame.header;        // copy
    send(frame);                 // E0382
}
