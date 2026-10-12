#![allow(dead_code, unused_variables)]
include!("pipeline.rs");
fn main() {
    let mut pool = Pool::new();
    let frame = Frame { header: Header { kind: 1, len: 0 }, payload: pool.get() };
    let Frame { header, ref payload } = &frame;
    println!("{}", payload.id);
}
