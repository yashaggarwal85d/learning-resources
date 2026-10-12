#![allow(dead_code, unused_variables)]
include!("pipeline.rs");
include!("pooled.rs");
fn main() {
    let mut pool = Pool::new();
    let a = PooledBuf::new(&mut pool);
    let b = PooledBuf::new(&mut pool);
    println!("{} {}", a.buf().id, b.buf().id);
}
