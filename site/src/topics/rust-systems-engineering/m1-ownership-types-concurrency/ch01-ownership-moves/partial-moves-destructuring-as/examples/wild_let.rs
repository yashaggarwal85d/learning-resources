#![allow(dead_code, unused_variables)]
include!("pipeline.rs");
include!("pooled.rs");
fn main() {
    let mut pool = Pool::new();
    let frame = Frame { header: Header { kind: 1, len: 0 }, payload: pool.get() };
    let _ = frame.payload;          // `_` binds nothing: no move
    let again = frame;              // whole
    let mut pool2 = Pool::new();
    let g = PooledBuf::new(&mut pool2);
    let _ = g;                      // not a move, not a drop
    println!("let _: frame whole id={} guard alive id={}", again.payload.id, g.buf().id);
}
