#![allow(dead_code, unused_variables)]
include!("pipeline.rs");
include!("pooled.rs");
fn main() {
    let mut pool = Pool::new();
    let guard = PooledBuf::new(&mut pool);
    let PooledBuf { buf, pool } = guard;
}
