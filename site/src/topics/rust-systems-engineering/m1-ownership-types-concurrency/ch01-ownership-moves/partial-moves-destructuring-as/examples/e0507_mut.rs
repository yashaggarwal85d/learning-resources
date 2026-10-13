#![allow(dead_code, unused_variables)]
include!("pipeline.rs");
fn swap_payload(frame: &mut Frame,
                fresh: Buf) -> Buf {
    let old = frame.payload; // E0507
    frame.payload = fresh;
    old
}
fn main() {}
