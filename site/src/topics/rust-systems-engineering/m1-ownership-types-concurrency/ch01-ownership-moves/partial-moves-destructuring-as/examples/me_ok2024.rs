#![allow(dead_code, unused_variables, unused_mut)]
include!("pipeline.rs");
fn main() {
    let mut pool = Pool::new();
    let mut frame = Frame { header: Header { kind: 1, len: 0 }, payload: pool.get() };
    let Frame { header, payload } = &mut frame;
    header.len = 99;
    println!("edited in place: {}", frame.header.len);
}
