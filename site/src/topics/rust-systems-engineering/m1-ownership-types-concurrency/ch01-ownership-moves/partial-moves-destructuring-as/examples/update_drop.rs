#![allow(dead_code, unused_variables)]
include!("pipeline.rs");
include!("pooled.rs");
fn main() {
    let mut pool = Pool::new();
    let mut other = Pool::new();
    let guard = PooledBuf::new(&mut pool);
    let moved = PooledBuf { pool: &mut other, ..guard };
}
