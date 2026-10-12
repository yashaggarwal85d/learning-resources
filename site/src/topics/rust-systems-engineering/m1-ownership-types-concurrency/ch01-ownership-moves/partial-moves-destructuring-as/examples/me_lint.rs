#![warn(rust_2024_incompatible_pat)]
#![allow(dead_code, unused_variables, unused_mut)]
include!("pipeline.rs");
fn main() {
    let mut pool = Pool::new();
    let frame = Frame { header: Header { kind: 1, len: 0 }, payload: pool.get() };
    let Frame { mut header, payload } = &frame;
    header.len = 99;
    println!("copy edited: {} original: {}", header.len, frame.header.len);
}
