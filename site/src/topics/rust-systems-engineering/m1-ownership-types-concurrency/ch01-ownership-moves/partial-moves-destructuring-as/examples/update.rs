#![allow(dead_code, unused_variables)]
include!("pipeline.rs");
fn main() {
    let mut pool = Pool::new();
    let frame = Frame { header: Header { kind: 1, len: 0 }, payload: pool.get() };
    let next = Frame { header: Header { kind: 2, len: 0 }, ..frame };
    let again = frame;
}
