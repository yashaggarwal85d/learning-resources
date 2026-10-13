#![allow(dead_code, unused_variables)]
include!("pipeline.rs");
fn main() {
    let mut pool = Pool::new();
    let frame = Frame { header: Header { kind: 1, len: 0 }, payload: pool.get() };
    let next = Frame { payload: pool.get(), ..frame }; // only the Copy header comes from `frame`
    let again = frame;                                 // still whole
    println!("update copied header only: frame whole id={} next id={}", again.payload.id, next.payload.id);
}
