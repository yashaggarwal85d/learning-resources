#![allow(dead_code, unused_variables)]
include!("pipeline.rs");
include!("pooled.rs");
fn main() {
    let mut pool = Pool::new();
    let bx = Box::new(PooledBuf::new(&mut pool));
    let b = bx.buf;
}
