#![allow(dead_code, unused_variables, unused_mut)]
include!("pipeline.rs");
fn main() {
    let mut pool = Pool::new();
    let frame = Frame { header: Header { kind: 7, len: 256 }, payload: pool.get() };
    let c = move || drop(frame.payload);
    c();
    println!("closure moved only the payload: header kind={}", frame.header.kind);
}
